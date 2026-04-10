package proxy

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/middleware"
	"github.com/agent-flow/api-gateway/internal/service"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type contextKeyType int

const (
	ctxKeyTarget contextKeyType = iota
	ctxKeyRecorder
)

type proxyTarget struct {
	URL    *url.URL
	Config *db.ProviderConfig
}

// LLMProxy is the core reverse proxy for LLM API forwarding.
type LLMProxy struct {
	rp     *httputil.ReverseProxy
	q      *db.Queries
	crypto *service.Crypto
	logCh  chan<- service.LogEntry
}

func NewLLMProxy(q *db.Queries, crypto *service.Crypto, logCh chan<- service.LogEntry) *LLMProxy {
	p := &LLMProxy{q: q, crypto: crypto, logCh: logCh}

	p.rp = &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			target := pr.In.Context().Value(ctxKeyTarget).(*proxyTarget)

			pr.SetURL(target.URL)
			pr.SetXForwarded()
			pr.Out.Host = target.URL.Host

			if err := InjectProviderAuth(pr.Out, target.Config, p.crypto); err != nil {
				slog.Error("inject auth failed", "err", err, "provider", target.Config.ProviderID)
			}
		},
		ModifyResponse: func(resp *http.Response) error {
			recorder, ok := resp.Request.Context().Value(ctxKeyRecorder).(*ResponseRecorder)
			if ok && recorder != nil {
				resp.Body = io.NopCloser(io.TeeReader(resp.Body, recorder))
			}
			return nil
		},
		FlushInterval: -1,
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			slog.Error("proxy error", "err", err, "path", r.URL.Path)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadGateway)
			json.NewEncoder(w).Encode(map[string]any{
				"error": map[string]any{
					"message": "upstream request failed",
					"type":    "proxy_error",
				},
			})
		},
	}

	return p
}

// Handle is the Echo handler for proxy requests.
func (p *LLMProxy) Handle(c echo.Context) error {
	user := middleware.UserFromContext(c)
	apiKeyID := middleware.APIKeyIDFromContext(c)
	providerID := c.Param("provider")

	if providerID == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "provider is required")
	}

	config, err := p.q.GetProviderConfig(c.Request().Context(), db.GetProviderConfigParams{
		UserID:     user.ID,
		ProviderID: providerID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "provider '"+providerID+"' not configured")
	}

	baseURL := ResolveBaseURL(&config)
	targetURL, err := BuildUpstreamURL(baseURL, c.Request().URL.Path, providerID, c.Request().URL.RawQuery)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid upstream URL")
	}

	reqBody, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "failed to read request body")
	}
	c.Request().Body = io.NopCloser(bytes.NewReader(reqBody))

	recorder := &ResponseRecorder{}
	ctx := context.WithValue(c.Request().Context(), ctxKeyTarget, &proxyTarget{
		URL: targetURL, Config: &config,
	})
	ctx = context.WithValue(ctx, ctxKeyRecorder, recorder)
	c.SetRequest(c.Request().WithContext(ctx))

	start := time.Now()

	p.rp.ServeHTTP(c.Response(), c.Request())

	duration := time.Since(start)
	respBytes := recorder.Bytes()
	convID := c.Request().Header.Get("X-Conversation-ID")
	status := c.Response().Status

	go func() {
		model := extractModel(reqBody)
		now := pgtype.Timestamptz{Time: time.Now(), Valid: true}
		reqID, _ := gonanoid.New()
		usageID, _ := gonanoid.New()

		p.logCh <- service.LogEntry{
			Type: "request",
			RequestLog: &db.InsertRequestLogParams{
				ID:             reqID,
				UserID:         user.ID,
				ConversationID: pgtype.Text{String: convID, Valid: true},
				ProviderID:     providerID,
				Model:          pgtype.Text{String: model, Valid: true},
				RequestBody:    reqBody,
				ResponseBody:   respBytes,
				StatusCode:     pgtype.Int2{Int16: int16(status), Valid: true},
				DurationMs:     pgtype.Int4{Int32: int32(duration.Milliseconds()), Valid: true},
				CreatedAt:      now,
			},
		}
		p.logCh <- service.LogEntry{
			Type: "usage",
			UsageLog: &db.InsertUsageLogParams{
				ID:            usageID,
				UserID:        user.ID,
				ApiKeyID:      apiKeyID,
				ProviderID:    providerID,
				Model:         model,
				RequestBytes:  pgtype.Int4{Int32: int32(len(reqBody)), Valid: true},
				ResponseBytes: pgtype.Int4{Int32: int32(len(respBytes)), Valid: true},
				DurationMs:    pgtype.Int4{Int32: int32(duration.Milliseconds()), Valid: true},
				StatusCode:    pgtype.Int2{Int16: int16(status), Valid: true},
				CreatedAt:     now,
			},
		}
	}()

	return nil
}

func extractModel(body []byte) string {
	var m struct {
		Model string `json:"model"`
	}
	if json.Unmarshal(body, &m) == nil {
		return m.Model
	}
	return ""
}
