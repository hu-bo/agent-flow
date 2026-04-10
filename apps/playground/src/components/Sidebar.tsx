import { useState, useEffect, useCallback } from 'react';
import { fetchSessions, createSession, deleteSession, triggerCompact } from '../api';
import { ModelSelector } from './ModelSelector';

interface Session {
  id: string;
  modelId?: string;
  createdAt?: string;
}

interface SidebarProps {
  activeSessionId: string | null;
  onSelectSession: (id: string | null) => void;
}

export function Sidebar({ activeSessionId, onSelectSession }: SidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [compacting, setCompacting] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const data = await fetchSessions();
      setSessions((data.sessions ?? []) as Session[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleNew = async () => {
    try {
      await createSession();
      await loadSessions();
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      if (activeSessionId === id) onSelectSession(null);
      await loadSessions();
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handleCompact = async () => {
    setCompacting(true);
    try {
      await triggerCompact();
    } catch (err) {
      console.error('Compact failed', err);
    } finally {
      setCompacting(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">agent-flow</h2>
      </div>

      <button className="new-chat-btn" onClick={handleNew}>
        + New Chat
      </button>

      <div className="session-list">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`session-item ${s.id === activeSessionId ? 'session-active' : ''}`}
            onClick={() => onSelectSession(s.id)}
          >
            <span className="session-id">{s.id.slice(0, 8)}...</span>
            <button
              className="session-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(s.id);
              }}
              aria-label={`Delete session ${s.id}`}
            >
              ×
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="sidebar-empty">No sessions</div>
        )}
      </div>

      <div className="sidebar-bottom">
        <ModelSelector />
        <button
          className="compact-btn"
          disabled={compacting}
          onClick={handleCompact}
        >
          {compacting ? 'Compacting...' : 'Compact Context'}
        </button>
      </div>
    </aside>
  );
}
