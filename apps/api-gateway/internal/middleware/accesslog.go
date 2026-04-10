package middleware

import (
	"log/slog"
	"time"

	"github.com/labstack/echo/v4"
)

// AccessLog logs each request as structured JSON to stdout.
func AccessLog() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()
			err := next(c)
			user := UserFromContext(c)
			userID := ""
			if user != nil {
				userID = user.ID
			}
			slog.Info("request",
				"method", c.Request().Method,
				"path", c.Request().URL.Path,
				"status", c.Response().Status,
				"duration_ms", time.Since(start).Milliseconds(),
				"user_id", userID,
				"remote_ip", c.RealIP(),
			)
			return err
		}
	}
}
