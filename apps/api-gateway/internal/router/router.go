package router

import (
	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/handler"
	mw "github.com/agent-flow/api-gateway/internal/middleware"
	"github.com/agent-flow/api-gateway/internal/proxy"
	"github.com/agent-flow/api-gateway/internal/service"
	"github.com/labstack/echo/v4"
	echomw "github.com/labstack/echo/v4/middleware"
)

func Setup(e *echo.Echo, q *db.Queries, crypto *service.Crypto, logCh chan<- service.LogEntry) {
	// Global middleware
	e.Use(echomw.Recover())
	e.Use(mw.AccessLog())
	e.Use(echomw.CORSWithConfig(echomw.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Authorization", "Content-Type", "X-Conversation-ID"},
	}))

	// Health check (no auth)
	e.GET("/health", handler.Health)

	// Admin init (no auth — first-time setup only)
	adminH := handler.NewAdminHandler(q)
	e.POST("/v1/admin/init", adminH.InitNoAuth)

	// Authenticated routes
	v1 := e.Group("/v1", mw.Auth(q))

	// Admin routes
	admin := v1.Group("/admin", mw.RequireAdmin())
	admin.POST("/users", adminH.CreateUser)

	// Provider management
	providerH := handler.NewProviderHandler(q, crypto)
	v1.GET("/providers", providerH.List)
	v1.POST("/providers", providerH.Create)
	v1.PUT("/providers/:id", providerH.Update)
	v1.DELETE("/providers/:id", providerH.Delete)

	// API key management
	apiKeyH := handler.NewAPIKeyHandler(q)
	v1.GET("/api-keys", apiKeyH.List)
	v1.POST("/api-keys", apiKeyH.Create)
	v1.DELETE("/api-keys/:id", apiKeyH.Delete)

	// Log queries
	logH := handler.NewLogHandler(q)
	v1.GET("/logs", logH.List)
	v1.GET("/logs/:id", logH.Get)

	// Core proxy (wildcard route — must be last)
	llmProxy := proxy.NewLLMProxy(q, crypto, logCh)
	v1.Any("/:provider/*", llmProxy.Handle, mw.RateLimit())
}
