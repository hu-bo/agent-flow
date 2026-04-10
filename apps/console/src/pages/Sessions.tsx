import { useState, useEffect, useCallback } from 'react';
import { fetchSessions, createSession, deleteSession, type Session } from '../api';

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchSessions()
      .then((data) => {
        setSessions(data);
        setError(null);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = () => {
    createSession()
      .then(() => refresh())
      .catch((err) => setError(String(err)));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(`Delete session ${id}?`)) return;
    deleteSession(id)
      .then(() => refresh())
      .catch((err) => setError(String(err)));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Sessions</h1>
        <button className="btn" onClick={handleCreate}>New Session</button>
      </div>

      {error && (
        <div className="error-box" role="alert">{error}</div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Model</th>
              <th>Messages</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.sessionId}>
                <td className="mono">{s.sessionId}</td>
                <td className="mono">{s.modelId}</td>
                <td>{s.messageCount}</td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(s.sessionId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
