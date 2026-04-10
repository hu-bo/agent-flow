package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PartitionManager handles automatic creation and cleanup of request_logs partitions.
type PartitionManager struct {
	pool          *pgxpool.Pool
	retentionDays int
}

func NewPartitionManager(pool *pgxpool.Pool, retentionDays int) *PartitionManager {
	return &PartitionManager{pool: pool, retentionDays: retentionDays}
}

// Maintain ensures future partitions exist and drops expired ones.
func (m *PartitionManager) Maintain(ctx context.Context) error {
	now := time.Now()

	// Ensure current + next month partitions exist
	for i := 0; i <= 1; i++ {
		t := now.AddDate(0, i, 0)
		if err := m.ensurePartition(ctx, t.Year(), int(t.Month())); err != nil {
			return fmt.Errorf("ensure partition %d-%02d: %w", t.Year(), t.Month(), err)
		}
	}

	// Drop partitions older than retention period
	cutoff := now.AddDate(0, 0, -m.retentionDays)
	for i := 0; i <= 1; i++ {
		t := cutoff.AddDate(0, -i, 0)
		if err := m.dropPartition(ctx, t.Year(), int(t.Month())); err != nil {
			slog.Warn("drop partition failed", "year", t.Year(), "month", t.Month(), "err", err)
		}
	}

	return nil
}

// RunDaily starts a background goroutine that runs Maintain once per day.
func (m *PartitionManager) RunDaily(ctx context.Context) {
	if err := m.Maintain(ctx); err != nil {
		slog.Error("partition maintenance failed", "err", err)
	}

	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := m.Maintain(ctx); err != nil {
					slog.Error("partition maintenance failed", "err", err)
				}
			case <-ctx.Done():
				return
			}
		}
	}()
}

func (m *PartitionManager) ensurePartition(ctx context.Context, year, month int) error {
	nextYear, nextMonth := year, month+1
	if nextMonth > 12 {
		nextYear++
		nextMonth = 1
	}
	sql := fmt.Sprintf(
		`CREATE TABLE IF NOT EXISTS request_logs_%d_%02d PARTITION OF request_logs FOR VALUES FROM ('%d-%02d-01') TO ('%d-%02d-01')`,
		year, month, year, month, nextYear, nextMonth,
	)
	_, err := m.pool.Exec(ctx, sql)
	return err
}

func (m *PartitionManager) dropPartition(ctx context.Context, year, month int) error {
	sql := fmt.Sprintf(`DROP TABLE IF EXISTS request_logs_%d_%02d`, year, month)
	_, err := m.pool.Exec(ctx, sql)
	return err
}
