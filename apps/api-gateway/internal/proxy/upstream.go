package proxy

import (
	"net/http"
	"net/url"

	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/service"
)

// Well-known provider base URLs.
var defaultBaseURLs = map[string]string{
	"openai":    "https://api.openai.com",
	"anthropic": "https://api.anthropic.com",
	"google":    "https://generativelanguage.googleapis.com",
	"deepseek":  "https://api.deepseek.com",
}

// ResolveBaseURL returns the upstream base URL for a provider config.
func ResolveBaseURL(config *db.ProviderConfig) string {
	if config.BaseUrl.Valid && config.BaseUrl.String != "" {
		return config.BaseUrl.String
	}
	if u, ok := defaultBaseURLs[config.ProviderID]; ok {
		return u
	}
	return config.BaseUrl.String
}

// BuildUpstreamURL constructs the full upstream URL from the request path.
// Request path format: /v1/{provider}/... → upstream: baseURL/...
func BuildUpstreamURL(baseURL, requestPath, providerID, rawQuery string) (*url.URL, error) {
	prefix := "/v1/" + providerID
	upstreamPath := requestPath[len(prefix):]
	if upstreamPath == "" {
		upstreamPath = "/"
	}

	u, err := url.Parse(baseURL + upstreamPath)
	if err != nil {
		return nil, err
	}
	if rawQuery != "" {
		if u.RawQuery != "" {
			u.RawQuery += "&" + rawQuery
		} else {
			u.RawQuery = rawQuery
		}
	}
	return u, nil
}

// InjectProviderAuth sets the appropriate authentication headers/params for the provider.
func InjectProviderAuth(req *http.Request, config *db.ProviderConfig, crypto *service.Crypto) error {
	apiKey, err := crypto.Decrypt(config.ApiKeyEnc)
	if err != nil {
		return err
	}

	req.Header.Del("Authorization")

	switch config.ProviderID {
	case "anthropic":
		req.Header.Set("x-api-key", apiKey)
		if req.Header.Get("anthropic-version") == "" {
			req.Header.Set("anthropic-version", "2023-06-01")
		}
	case "google":
		q := req.URL.Query()
		q.Set("key", apiKey)
		req.URL.RawQuery = q.Encode()
	default: // openai, deepseek, custom
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}
	return nil
}
