import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, ChevronsLeft, ChevronsRight, MessageSquare, Workflow } from 'lucide-react';
import { createSession, deleteSession, fetchSessions } from '../../api';
import type { SessionRecord } from '../../api';
import './Sidebar.less';

const AUTO_COLLAPSE_MAX_WIDTH = 1120;

const RAIL_ITEMS = [
  { to: '/chat', label: 'CHAT', ariaLabel: 'Chat workspace', icon: MessageSquare },
  { to: '/agent', label: 'AGENT', ariaLabel: 'Agent workspace', icon: Bot },
  { to: '/flow', label: 'FLOW', ariaLabel: 'Flow workspace', icon: Workflow },
] as const;

interface SidebarProps {
  activeSessionId: string | null;
  onSelectSession: (id: string | null) => void;
}

export function Sidebar({ activeSessionId, onSelectSession }: SidebarProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [manualOverrideCollapsed, setManualOverrideCollapsed] = useState<boolean | null>(null);
  const [isAutoCollapsed, setIsAutoCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= AUTO_COLLAPSE_MAX_WIDTH;
  });
  const isCollapsed = manualOverrideCollapsed ?? isAutoCollapsed;

  const loadSessions = useCallback(async () => {
    try {
      const data = await fetchSessions();
      const ordered = [...(data.sessions ?? [])].sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      setSessions(ordered);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const handleResize = () => {
      setIsAutoCollapsed(window.innerWidth <= AUTO_COLLAPSE_MAX_WIDTH);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (manualOverrideCollapsed !== null && manualOverrideCollapsed === isAutoCollapsed) {
      setManualOverrideCollapsed(null);
    }
  }, [isAutoCollapsed, manualOverrideCollapsed]);

  const handleNew = async () => {
    try {
      const created = await createSession();
      onSelectSession(created.session.sessionId);
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

  return (
    <aside className={`sidebar${isCollapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="sidebar-rail">
        <div className="sidebar-rail-top">
          <div className="sidebar-logo" aria-hidden>
            AF
          </div>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() =>
              setManualOverrideCollapsed((prev) => {
                const current = prev ?? isAutoCollapsed;
                return !current;
              })
            }
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={
              manualOverrideCollapsed === null
                ? isAutoCollapsed
                  ? 'Auto collapsed due to narrow window'
                  : 'Toggle sidebar'
                : 'Manual override active'
            }
          >
            {isCollapsed ? <ChevronsRight size={14} aria-hidden /> : <ChevronsLeft size={14} aria-hidden />}
          </button>
        </div>

        <nav className="sidebar-rail-items" aria-label="Workspace navigation">
          {RAIL_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-rail-btn${isActive ? ' is-active' : ''}`}
              aria-label={item.ariaLabel}
            >
              <item.icon className="sidebar-rail-btn-icon" size={14} strokeWidth={2} aria-hidden />
              <span className="sidebar-rail-btn-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2 className="sidebar-title">SESSION_EXPLORER</h2>
          <p className="sidebar-subtitle">Manage active conversation threads</p>
        </div>

        <button className="new-chat-btn" onClick={handleNew}>
          + NEW_SESSION
        </button>

        <div className="session-list">
          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`session-item ${session.sessionId === activeSessionId ? 'session-active' : ''}`}
              onClick={() => onSelectSession(session.sessionId)}
            >
              <div className="session-meta">
                <span className="session-id">{session.sessionId.slice(0, 8)}...</span>
                <span className="session-count">{session.messageCount} msgs</span>
              </div>
              <button
                className="session-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(session.sessionId);
                }}
                aria-label={`Delete session ${session.sessionId}`}
              >
                x
              </button>
            </div>
          ))}

          {sessions.length === 0 && <div className="sidebar-empty">No sessions yet</div>}
        </div>
      </div>
    </aside>
  );
}
