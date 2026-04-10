package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

type bucket struct {
	tokens     float64
	lastRefill time.Time
	mu         sync.Mutex
}

// RateLimit implements per-user token bucket rate limiting.
func RateLimit() echo.MiddlewareFunc {
	buckets := sync.Map{}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user := UserFromContext(c)
			if user == nil {
				return next(c)
			}

			rpm := float64(user.RateLimitRpm.Int32)
			if rpm <= 0 {
				rpm = 60
			}

			val, _ := buckets.LoadOrStore(user.ID, &bucket{
				tokens:     rpm,
				lastRefill: time.Now(),
			})
			b := val.(*bucket)

			b.mu.Lock()
			defer b.mu.Unlock()

			// Refill tokens
			elapsed := time.Since(b.lastRefill).Seconds()
			b.tokens += elapsed * (rpm / 60.0)
			if b.tokens > rpm {
				b.tokens = rpm
			}
			b.lastRefill = time.Now()

			if b.tokens < 1 {
				return echo.NewHTTPError(http.StatusTooManyRequests, "rate limit exceeded")
			}
			b.tokens--

			return next(c)
		}
	}
}
