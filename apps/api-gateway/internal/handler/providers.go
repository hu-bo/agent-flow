package handler

import (
	"net/http"

	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/middleware"
	"github.com/agent-flow/api-gateway/internal/service"
	"github.com/labstack/echo/v4"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type ProviderHandler struct {
	q      *db.Queries
	crypto *service.Crypto
}

func NewProviderHandler(q *db.Queries, crypto *service.Crypto) *ProviderHandler {
	return &ProviderHandler{q: q, crypto: crypto}
}

func (h *ProviderHandler) List(c echo.Context) error {
	user := middleware.UserFromContext(c)
	configs, err := h.q.ListProviderConfigs(c.Request().Context(), user.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to list providers")
	}

	result := make([]map[string]any, len(configs))
	for i, cfg := range configs {
		result[i] = map[string]any{
			"id":           cfg.ID,
			"provider_id":  cfg.ProviderID,
			"display_name": cfg.DisplayName,
			"base_url":     cfg.BaseUrl.String,
			"is_active":    cfg.IsActive.Bool,
			"created_at":   cfg.CreatedAt.Time,
		}
	}
	return c.JSON(http.StatusOK, result)
}

func (h *ProviderHandler) Create(c echo.Context) error {
	user := middleware.UserFromContext(c)
	var req struct {
		ProviderID  string `json:"provider_id"`
		DisplayName string `json:"display_name"`
		APIKey      string `json:"api_key"`
		BaseURL     string `json:"base_url"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.ProviderID == "" || req.APIKey == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "provider_id and api_key are required")
	}
	if req.DisplayName == "" {
		req.DisplayName = req.ProviderID
	}

	encrypted, err := h.crypto.Encrypt(req.APIKey)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to encrypt api key")
	}

	id, _ := gonanoid.New()
	now := pgNow()
	if err := h.q.CreateProviderConfig(c.Request().Context(), db.CreateProviderConfigParams{
		ID:          id,
		UserID:      user.ID,
		ProviderID:  req.ProviderID,
		DisplayName: req.DisplayName,
		ApiKeyEnc:   encrypted,
		BaseUrl:     pgText(req.BaseURL),
		IsActive:    pgBool(true),
		CreatedAt:   now,
		UpdatedAt:   now,
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create provider config")
	}

	return c.JSON(http.StatusCreated, map[string]any{
		"id":           id,
		"provider_id":  req.ProviderID,
		"display_name": req.DisplayName,
		"base_url":     req.BaseURL,
	})
}

func (h *ProviderHandler) Update(c echo.Context) error {
	user := middleware.UserFromContext(c)
	id := c.Param("id")

	var req struct {
		DisplayName string `json:"display_name"`
		APIKey      string `json:"api_key"`
		BaseURL     string `json:"base_url"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	apiKeyEnc := ""
	if req.APIKey != "" {
		encrypted, err := h.crypto.Encrypt(req.APIKey)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to encrypt api key")
		}
		apiKeyEnc = encrypted
	}

	if err := h.q.UpdateProviderConfig(c.Request().Context(), db.UpdateProviderConfigParams{
		ID:          id,
		UserID:      user.ID,
		DisplayName: req.DisplayName,
		ApiKeyEnc:   apiKeyEnc,
		BaseUrl:     pgText(req.BaseURL),
		UpdatedAt:   pgNow(),
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update provider config")
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "updated"})
}

func (h *ProviderHandler) Delete(c echo.Context) error {
	user := middleware.UserFromContext(c)
	id := c.Param("id")

	if err := h.q.DeleteProviderConfig(c.Request().Context(), db.DeleteProviderConfigParams{
		ID:     id,
		UserID: user.ID,
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete provider config")
	}

	return c.NoContent(http.StatusNoContent)
}
