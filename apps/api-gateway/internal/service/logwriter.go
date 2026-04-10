package service

import (
	"context"
	"log/slog"
	"time"

	db "github.com/agent-flow/api-gateway/internal/database/db"
)

type LogEntry struct {
	Type       string                    // "request" or "usage"
	RequestLog *db.InsertRequestLogParams
	UsageLog   *db.InsertUsageLogParams
}

// LogWriter batches log entries and writes them to the database.
type LogWriter struct {
	ch chan LogEntry
	q  *db.Queries
}

func NewLogWriter(q *db.Queries, bufSize int) *LogWriter {
	return &LogWriter{
		ch: make(chan LogEntry, bufSize),
		q:  q,
	}
}

func (w *LogWriter) Ch() chan<- LogEntry {
	return w.ch
}

func (w *LogWriter) Run(ctx context.Context) {
	batch := make([]LogEntry, 0, 100)
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	flush := func() {
		for _, entry := range batch {
			switch entry.Type {
			case "request":
				if err := w.q.InsertRequestLog(ctx, *entry.RequestLog); err != nil {
					slog.Error("insert request log failed", "err", err)
				}
			case "usage":
				if err := w.q.InsertUsageLog(ctx, *entry.UsageLog); err != nil {
					slog.Error("insert usage log failed", "err", err)
				}
			}
		}
		batch = batch[:0]
	}

	for {
		select {
		case entry := <-w.ch:
			batch = append(batch, entry)
			if len(batch) >= 100 {
				flush()
			}
		case <-ticker.C:
			if len(batch) > 0 {
				flush()
			}
		case <-ctx.Done():
			// Drain remaining
		drain:
			for {
				select {
				case entry := <-w.ch:
					batch = append(batch, entry)
				default:
					break drain
				}
			}
			flush()
			return
		}
	}
}
