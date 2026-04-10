package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/agent-flow/api-gateway/internal/config"
	"github.com/agent-flow/api-gateway/internal/database"
	db "github.com/agent-flow/api-gateway/internal/database/db"
	"github.com/agent-flow/api-gateway/internal/router"
	"github.com/agent-flow/api-gateway/internal/service"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))

	_ = godotenv.Load()

	cfg := config.Load()

	if cfg.EncryptionKey == "" {
		slog.Error("ENCRYPTION_KEY is required (64 hex chars for AES-256)")
		os.Exit(1)
	}
	crypto, err := service.NewCrypto(cfg.EncryptionKey)
	if err != nil {
		slog.Error("invalid encryption key", "err", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("database connection failed", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool); err != nil {
		slog.Error("migration failed", "err", err)
		os.Exit(1)
	}

	q := db.New(pool)

	// Partition manager (30-day retention)
	pm := database.NewPartitionManager(pool, 30)
	pm.RunDaily(ctx)

	// Log writer (async batch insert)
	logWriter := service.NewLogWriter(q, 10000)
	go logWriter.Run(ctx)

	// Echo server
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	router.Setup(e, q, crypto, logWriter.Ch())

	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh
		slog.Info("shutting down...")
		cancel()

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()
		if err := e.Shutdown(shutdownCtx); err != nil {
			slog.Error("shutdown error", "err", err)
		}
	}()

	addr := fmt.Sprintf(":%d", cfg.Port)
	slog.Info("starting api-gateway", "addr", addr)
	if err := e.Start(addr); err != nil {
		slog.Info("server stopped", "err", err)
	}
}
