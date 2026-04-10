package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/middleware"
	"github.com/labstack/echo/v4"
)

type LogHandler struct {
	q *db.Queries
}

func NewLogHandler(q *db.Queries) *LogHandler {
	return &LogHandler{q: q}
}

func (h *LogHandler) List(c echo.Context) error {
	user := middleware.UserFromContext(c)
	conversationID := c.QueryParam("conversation_id")

	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	size, _ := strconv.Atoi(c.QueryParam("size"))
	if size <= 0 || size > 100 {
		size = 20
	}

	logs, err := h.q.ListRequestLogs(c.Request().Context(), db.ListRequestLogsParams{
		UserID:  user.ID,
		Column2: conversationID,
		Limit:   int32(size),
		Offset:  int32((page - 1) * size),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to list logs")
	}

	result := make([]map[string]any, len(logs))
	for i, l := range logs {
		result[i] = map[string]any{
			"id":              l.ID,
			"conversation_id": l.ConversationID.String,
			"provider_id":     l.ProviderID,
			"model":           l.Model.String,
			"status_code":     l.StatusCode.Int16,
			"duration_ms":     l.DurationMs.Int32,
			"created_at":      l.CreatedAt.Time,
		}
	}
	return c.JSON(http.StatusOK, map[string]any{
		"data": result,
		"page": page,
		"size": size,
	})
}

func (h *LogHandler) Get(c echo.Context) error {
	user := middleware.UserFromContext(c)
	id := c.Param("id")

	l, err := h.q.GetRequestLog(c.Request().Context(), db.GetRequestLogParams{
		ID:     id,
		UserID: user.ID,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "log not found")
	}

	var reqBody, respBody any
	if l.RequestBody != nil {
		json.Unmarshal(l.RequestBody, &reqBody)
	}
	if l.ResponseBody != nil {
		json.Unmarshal(l.ResponseBody, &respBody)
	}

	return c.JSON(http.StatusOK, map[string]any{
		"id":              l.ID,
		"conversation_id": l.ConversationID.String,
		"provider_id":     l.ProviderID,
		"model":           l.Model.String,
		"request_body":    reqBody,
		"response_body":   respBody,
		"status_code":     l.StatusCode.Int16,
		"duration_ms":     l.DurationMs.Int32,
		"created_at":      l.CreatedAt.Time,
	})
}
