package handler

import (
	"net/http"

	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/middleware"
	"github.com/agent-flow/api-gateway/internal/service"
	"github.com/labstack/echo/v4"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type APIKeyHandler struct {
	q *db.Queries
}

func NewAPIKeyHandler(q *db.Queries) *APIKeyHandler {
	return &APIKeyHandler{q: q}
}

func (h *APIKeyHandler) List(c echo.Context) error {
	user := middleware.UserFromContext(c)
	keys, err := h.q.ListAPIKeysByUser(c.Request().Context(), user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to list api keys")
	}

	result := make([]map[string]any, len(keys))
	for i, k := range keys {
		result[i] = map[string]any{
			"id":           k.ID,
			"name":         k.Name,
			"key_prefix":   k.KeyPrefix,
			"is_active":    k.IsActive.Bool,
			"last_used_at": k.LastUsedAt.Time,
			"created_at":   k.CreatedAt.Time,
		}
	}
	return c.JSON(http.StatusOK, result)
}

func (h *APIKeyHandler) Create(c echo.Context) error {
	user := middleware.UserFromContext(c)
	var req struct {
		Name string `json:"name"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Name == "" {
		req.Name = "default"
	}

	fullKey, hash, prefix, err := service.GenerateAPIKey()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate api key")
	}

	id, _ := gonanoid.New()
	if err := h.q.CreateAPIKey(c.Request().Context(), db.CreateAPIKeyParams{
		ID:        id,
		UserID:    user.ID,
		Name:      req.Name,
		KeyHash:   hash,
		KeyPrefix: prefix,
		IsActive:  pgBool(true),
		CreatedAt: pgNow(),
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create api key")
	}

	return c.JSON(http.StatusCreated, map[string]any{
		"id":         id,
		"name":       req.Name,
		"key":        fullKey,
		"key_prefix": prefix,
		"message":    "save this api key, it will not be shown again",
	})
}

func (h *APIKeyHandler) Delete(c echo.Context) error {
	user := middleware.UserFromContext(c)
	id := c.Param("id")

	if err := h.q.DeactivateAPIKey(c.Request().Context(), db.DeactivateAPIKeyParams{
		ID:     id,
		UserID: user.ID,
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete api key")
	}

	return c.NoContent(http.StatusNoContent)
}
