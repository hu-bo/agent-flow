package handler

import (
	"net/http"
	"time"

	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/service"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type AdminHandler struct {
	q *db.Queries
}

func NewAdminHandler(q *db.Queries) *AdminHandler {
	return &AdminHandler{q: q}
}

func pgText(s string) pgtype.Text {
	return pgtype.Text{String: s, Valid: true}
}

func pgInt4(v int32) pgtype.Int4 {
	return pgtype.Int4{Int32: v, Valid: true}
}

func pgBool(v bool) pgtype.Bool {
	return pgtype.Bool{Bool: v, Valid: true}
}

func pgNow() pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: time.Now(), Valid: true}
}

// InitNoAuth is the init endpoint that doesn't require auth (first-time setup).
func (h *AdminHandler) InitNoAuth(c echo.Context) error {
	ctx := c.Request().Context()

	count, err := h.q.UserCount(ctx)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to check users")
	}
	if count > 0 {
		return echo.NewHTTPError(http.StatusConflict, "system already initialized")
	}

	var req struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Email == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email is required")
	}

	userID, _ := gonanoid.New()
	now := pgNow()
	if err := h.q.CreateUser(ctx, db.CreateUserParams{
		ID:              userID,
		Email:           req.Email,
		Name:            pgText(req.Name),
		DefaultProvider: pgText(""),
		DefaultModel:    pgText(""),
		RateLimitRpm:    pgInt4(60),
		IsAdmin:         pgBool(true),
		CreatedAt:       now,
		UpdatedAt:       now,
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}

	fullKey, hash, prefix, err := service.GenerateAPIKey()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate api key")
	}

	keyID, _ := gonanoid.New()
	if err := h.q.CreateAPIKey(ctx, db.CreateAPIKeyParams{
		ID:        keyID,
		UserID:    userID,
		Name:      "default",
		KeyHash:   hash,
		KeyPrefix: prefix,
		IsActive:  pgBool(true),
		CreatedAt: now,
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create api key")
	}

	return c.JSON(http.StatusCreated, map[string]any{
		"user_id": userID,
		"email":   req.Email,
		"api_key": fullKey,
		"message": "save this api key, it will not be shown again",
	})
}

// CreateUser creates a new user (admin only).
func (h *AdminHandler) CreateUser(c echo.Context) error {
	var req struct {
		Email        string `json:"email"`
		Name         string `json:"name"`
		RateLimitRPM int32  `json:"rate_limit_rpm"`
		IsAdmin      bool   `json:"is_admin"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Email == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email is required")
	}
	if req.RateLimitRPM <= 0 {
		req.RateLimitRPM = 60
	}

	userID, _ := gonanoid.New()
	now := pgNow()
	if err := h.q.CreateUser(c.Request().Context(), db.CreateUserParams{
		ID:              userID,
		Email:           req.Email,
		Name:            pgText(req.Name),
		DefaultProvider: pgText(""),
		DefaultModel:    pgText(""),
		RateLimitRpm:    pgInt4(req.RateLimitRPM),
		IsAdmin:         pgBool(req.IsAdmin),
		CreatedAt:       now,
		UpdatedAt:       now,
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}

	fullKey, hash, prefix, err := service.GenerateAPIKey()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate api key")
	}
	keyID, _ := gonanoid.New()
	if err := h.q.CreateAPIKey(c.Request().Context(), db.CreateAPIKeyParams{
		ID: keyID, UserID: userID, Name: "default",
		KeyHash: hash, KeyPrefix: prefix, IsActive: pgBool(true), CreatedAt: now,
	}); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create api key")
	}

	return c.JSON(http.StatusCreated, map[string]any{
		"user_id": userID,
		"email":   req.Email,
		"api_key": fullKey,
		"message": "save this api key, it will not be shown again",
	})
}

// Health is a simple health check endpoint.
func Health(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
