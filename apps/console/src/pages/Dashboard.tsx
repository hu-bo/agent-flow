import { useState, useEffect, useCallback } from 'react';
import { fetchHealth, type HealthResponse } from '../api';

export function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setError(null);
        setLastChecked(new Date());
      })
      .catch((err) => {
        setError(String(err));
        setLastChecked(new Date());
      });
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card-grid">
        <div className="card">
          <div className="card-label">Server Status</div>
          <div className="card-value">
            {error ? (
              <span className="badge badge-failed">Error</span>
            ) : health ? (
              <span className="badge badge-completed">{health.status}</span>
            ) : (
              <span className="badge badge-pending">Loading...</span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-label">Current Model</div>
          <div className="card-value mono">{health?.model ?? '—'}</div>
        </div>

        <div className="card">
          <div className="card-label">Last Checked</div>
          <div className="card-value">
            {lastChecked ? lastChecked.toLocaleTimeString() : '—'}
          </div>
        </div>

        <div className="card">
          <div className="card-label">Auto-Refresh</div>
          <div className="card-value">Every 10s</div>
        </div>
      </div>

      {error && (
        <div className="error-box" role="alert">
          <strong>Connection error:</strong> {error}
        </div>
      )}

      <button className="btn" onClick={refresh} style={{ marginTop: '1rem' }}>
        Refresh Now
      </button>
    </div>
  );
}
