package middleware

import (
	"log/slog"
	"net/http"
	"strings"
	"time"

	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/service"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
)

type contextKey string

const (
	CtxKeyUser   contextKey = "user"
	CtxKeyAPIKey contextKey = "apiKeyID"
)

// Auth validates the Bearer token and injects user into context.
func Auth(q *db.Queries) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			auth := c.Request().Header.Get("Authorization")
			if !strings.HasPrefix(auth, "Bearer ") {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing or invalid authorization header")
			}
			token := strings.TrimPrefix(auth, "Bearer ")
			hash := service.HashKey(token)

			apiKey, err := q.GetAPIKeyByHash(c.Request().Context(), hash)
			if err != nil {
				slog.Debug("auth failed", "err", err)
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid api key")
			}

			user, err := q.GetUserByID(c.Request().Context(), apiKey.UserID)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "user not found")
			}

			c.Set(string(CtxKeyUser), &user)
			c.Set(string(CtxKeyAPIKey), apiKey.ID)

			// Async touch last_used_at
			go func() {
				_ = q.TouchAPIKey(c.Request().Context(), db.TouchAPIKeyParams{
					LastUsedAt: pgtype.Timestamptz{Time: time.Now(), Valid: true},
					ID:         apiKey.ID,
				})
			}()

			return next(c)
		}
	}
}

// RequireAdmin checks that the authenticated user is an admin.
func RequireAdmin() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := UserFromContext(c)
			if user == nil || !user.IsAdmin.Bool {
				return echo.NewHTTPError(http.StatusForbidden, "admin access required")
			}
			return next(c)
		}
	}
}

// UserFromContext extracts the authenticated user from Echo context.
func UserFromContext(c echo.Context) *db.User {
	u, _ := c.Get(string(CtxKeyUser)).(*db.User)
	return u
}

// APIKeyIDFromContext extracts the API key ID from Echo context.
func APIKeyIDFromContext(c echo.Context) string {
	id, _ := c.Get(string(CtxKeyAPIKey)).(string)
	return id
}
