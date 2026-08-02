import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bot,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen,
  HardDrive,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash2,
  Workflow,
  X,
} from 'lucide-react';
import { useCasdoor } from '@hquant/casdoor/client/react';
import {
  deleteProject,
  deleteSession,
  fetchProjectSessions,
  fetchProjects,
  fetchSessions,
  type ProjectRecord,
  type SessionRecord,
} from '../../api';
import { useChatStore } from '../../store/chat-store';
import { ProjectCreateDialog } from './ProjectCreateDialog';
import './Sidebar.less';

const AUTO_COLLAPSE_MAX_WIDTH = 1120;

const RAIL_ITEMS = [
  { to: '/chat', label: 'CHAT', ariaLabel: 'Chat workspace', icon: MessageSquare },
  { to: '/runners', label: 'RUNNER', ariaLabel: 'Runner workspace', icon: HardDrive },
  { to: '/agent', label: 'AGENT', ariaLabel: 'Agent workspace', icon: Bot },
  { to: '/flow', label: 'FLOW', ariaLabel: 'Flow workspace', icon: Workflow },
] as const;

interface SidebarProps {
  activeSessionId: string | null;
  onSelectSession: (
    id: string | null,
    mode?: 'vibe' | 'spec',
    options?: { openChatWhenEmpty?: boolean },
  ) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ activeSessionId, onSelectSession, mobileOpen, onMobileClose }: SidebarProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [projectSessionsById, setProjectSessionsById] = useState<Record<string, SessionRecord[]>>({});
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(() => new Set());
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);
  const sessionListRefreshVersion = useChatStore((state) => state.sessionListRefreshVersion);
  const activeProjectId = useChatStore((state) => state.activeProjectId);
  const setActiveProject = useChatStore((state) => state.setActiveProject);
  const setPendingNewChatProject = useChatStore((state) => state.setPendingNewChatProject);
  const setPendingNewChatPlacement = useChatStore((state) => state.setPendingNewChatPlacement);
  const [manualOverrideCollapsed, setManualOverrideCollapsed] = useState<boolean | null>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const [isAutoCollapsed, setIsAutoCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= AUTO_COLLAPSE_MAX_WIDTH;
  });
  const { user, logout } = useCasdoor();
  const isCollapsed = manualOverrideCollapsed ?? isAutoCollapsed;

  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects();
      const ordered = [...(data.projects ?? [])].sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      setProjects(ordered);

      const nextActive = activeProjectId && ordered.some((project) => project.projectId === activeProjectId)
        ? activeProjectId
        : ordered[0]?.projectId ?? null;
      if (nextActive !== activeProjectId) {
        setActiveProject(nextActive);
      }
    } catch {
      /* keep sidebar quiet while auth/server is settling */
    }
  }, [activeProjectId, setActiveProject]);

  const loadNormalSessions = useCallback(async () => {
    try {
      const data = await fetchSessions();
      setSessions(orderSessions((data.sessions ?? []).filter((session) => !session.projectId)));
    } catch {
      setSessions([]);
    }
  }, []);

  const loadProjectSessions = useCallback(async (projectId: string) => {
    try {
      const data = await fetchProjectSessions(projectId);
      setProjectSessionsById((current) => ({
        ...current,
        [projectId]: orderSessions(data.sessions ?? []),
      }));
    } catch {
      setProjectSessionsById((current) => ({
        ...current,
        [projectId]: [],
      }));
    }
  }, []);

  const loadExpandedProjectSessions = useCallback(async () => {
    await Promise.all([...expandedProjectIds].map((projectId) => loadProjectSessions(projectId)));
  }, [expandedProjectIds, loadProjectSessions]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects, sessionListRefreshVersion]);

  useEffect(() => {
    void loadNormalSessions();
  }, [loadNormalSessions, sessionListRefreshVersion]);

  useEffect(() => {
    void loadExpandedProjectSessions();
  }, [loadExpandedProjectSessions, sessionListRefreshVersion]);

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

  useEffect(() => {
    if (mobileOpen) {
      mobileCloseButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  const handleNew = () => {
    setPendingNewChatProject(null);
    setPendingNewChatPlacement('normal');
    onSelectSession(null, 'vibe', { openChatWhenEmpty: true });
  };

  const handleNewInProject = (projectId: string) => {
    setOpenProjectMenuId(null);
    setActiveProject(projectId);
    setPendingNewChatProject(projectId);
    setPendingNewChatPlacement('project');
    setExpandedProjectIds((current) => new Set(current).add(projectId));
    onSelectSession(null, 'vibe', { openChatWhenEmpty: true });
  };

  const handleToggleProject = (projectId: string) => {
    setPendingNewChatProject(null);
    setPendingNewChatPlacement(null);
    setActiveProject(projectId);
    setExpandedProjectIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
        void loadProjectSessions(projectId);
      }
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      if (activeSessionId === id) onSelectSession(null);
      await loadProjects();
      await loadNormalSessions();
      await loadExpandedProjectSessions();
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handleDeleteProject = async (project: ProjectRecord) => {
    const confirmed = window.confirm(`Delete project "${project.name}" and all chats under it?`);
    if (!confirmed) return;

    try {
      await deleteProject(project.projectId);
      const remainingProjects = projects.filter((item) => item.projectId !== project.projectId);
      setProjects(remainingProjects);
      setOpenProjectMenuId(null);
      setProjectSessionsById((current) => {
        const next = { ...current };
        delete next[project.projectId];
        return next;
      });
      setExpandedProjectIds((current) => {
        const next = new Set(current);
        next.delete(project.projectId);
        return next;
      });

      if (activeProjectId === project.projectId) {
        const nextProjectId = remainingProjects[0]?.projectId ?? null;
        setActiveProject(nextProjectId);
        setSessions([]);
        onSelectSession(null);
      }

      await loadProjects();
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleProjectCreated = (project: ProjectRecord) => {
    setProjects((current) => [project, ...current.filter((item) => item.projectId !== project.projectId)]);
    setActiveProject(project.projectId);
    setExpandedProjectIds((current) => new Set(current).add(project.projectId));
    onSelectSession(null);
    void loadProjects();
  };

  return (
    <aside
      id="workspace-sidebar"
      className={`sidebar${isCollapsed ? ' sidebar-collapsed' : ''}${mobileOpen ? ' sidebar-mobile-open' : ''}`}
      role={mobileOpen ? 'dialog' : undefined}
      aria-modal={mobileOpen || undefined}
      aria-label={mobileOpen ? 'Workspace menu' : undefined}
      tabIndex={mobileOpen ? -1 : undefined}
    >
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
            title={manualOverrideCollapsed === null ? 'Toggle sidebar' : 'Manual override active'}
          >
            {isCollapsed ? <ChevronsRight size={14} aria-hidden /> : <ChevronsLeft size={14} aria-hidden />}
          </button>
          <button ref={mobileCloseButtonRef} type="button" className="sidebar-mobile-close" onClick={onMobileClose} aria-label="Close workspace menu">
            <X size={16} aria-hidden />
          </button>
        </div>

        <nav className="sidebar-rail-items" aria-label="Workspace navigation">
          {RAIL_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-rail-btn${isActive ? ' is-active' : ''}`}
              aria-label={item.ariaLabel}
              onClick={onMobileClose}
            >
              <item.icon className="sidebar-rail-btn-icon" size={14} strokeWidth={2} aria-hidden />
              <span className="sidebar-rail-btn-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="sidebar-title-row">
            <h2 className="sidebar-title">projects</h2>
            <div className="sidebar-title-actions">
              <button
                type="button"
                className="sidebar-icon-btn"
                onClick={() => setProjectDialogOpen(true)}
                aria-label="Create project"
                title="Create project"
              >
                <FolderOpen size={14} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <div className="project-list">
          {projects.map((project) => {
            const active = project.projectId === activeProjectId;
            const expanded = expandedProjectIds.has(project.projectId);
            const projectSessions = projectSessionsById[project.projectId] ?? [];
            return (
              <section
                key={project.projectId}
                className={`project-group${active ? ' is-active' : ''}${expanded ? ' is-expanded' : ''}`}
              >
                <button
                  type="button"
                  className="project-item"
                  onClick={() => handleToggleProject(project.projectId)}
                  aria-expanded={expanded}
                >
                  <ChevronRight size={13} className="project-chevron" aria-hidden />
                  <span className="project-item-main">
                    <span className="project-name" title={project.name}>
                      {project.name}
                    </span>
                    <span className="project-root" title={project.rootPath}>
                      {project.rootPath}
                    </span>
                  </span>
                </button>
                <div className="project-actions">
                  <button
                    type="button"
                    className="project-action-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleNewInProject(project.projectId);
                    }}
                    aria-label={`Create chat in ${project.name}`}
                    title="Create chat"
                  >
                    <Plus size={13} aria-hidden />
                  </button>
                  <div className="project-menu-wrap">
                    <button
                      type="button"
                      className="project-action-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenProjectMenuId((current) =>
                          current === project.projectId ? null : project.projectId,
                        );
                      }}
                      aria-label={`Open project menu for ${project.name}`}
                      title="Project menu"
                    >
                      <MoreHorizontal size={14} aria-hidden />
                    </button>
                    {openProjectMenuId === project.projectId && (
                      <div className="project-menu" role="menu">
                        <button
                          type="button"
                          className="project-menu-item is-danger"
                          role="menuitem"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteProject(project);
                          }}
                        >
                          <Trash2 size={13} aria-hidden />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {expanded && (
                  <SessionGroup
                    sessions={projectSessions}
                    activeSessionId={activeSessionId}
                    onSelect={onSelectSession}
                    onDelete={handleDelete}
                    className="project-session-list"
                    itemClassName="project-session-item"
                    emptyClassName="project-session-empty"
                    emptyMessage="No project chats"
                  />
                )}
              </section>
            );
          })}

          {projects.length === 0 && (
            <div className="sidebar-empty">
              <button type="button" className="sidebar-empty-action" onClick={() => setProjectDialogOpen(true)}>
                <FolderOpen size={15} aria-hidden />
                Create your first project
              </button>
            </div>
          )}
        </div>

        <div className="sidebar-header sidebar-header-chats">
          <div className="sidebar-title-row">
            <h2 className="sidebar-title">chats</h2>
            <button
              type="button"
              className="sidebar-icon-btn"
              onClick={handleNew}
              aria-label="Create chat"
              title="Create chat"
            >
              <Plus size={15} aria-hidden />
            </button>
          </div>
        </div>

        <SessionGroup
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={onSelectSession}
          onDelete={handleDelete}
          className="session-list"
          emptyClassName="sidebar-empty"
          emptyMessage="No ordinary chats yet"
        />

        <div className="sidebar-account">
          <div className="sidebar-account-name">{user?.displayName || user?.name || 'Unknown User'}</div>
          <button className="sidebar-account-logout" onClick={logout}>
            <LogOut size={13} aria-hidden />
            SIGN_OUT
          </button>
        </div>
      </div>

      <ProjectCreateDialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        onCreated={handleProjectCreated}
      />
    </aside>
  );
}

interface SessionGroupProps {
  sessions: SessionRecord[];
  activeSessionId: string | null;
  onSelect: (sessionId: string, mode: 'vibe' | 'spec') => void;
  onDelete: (sessionId: string) => Promise<void>;
  className: string;
  itemClassName?: string;
  emptyClassName: string;
  emptyMessage: string;
}

function SessionGroup({
  sessions,
  activeSessionId,
  onSelect,
  onDelete,
  className,
  itemClassName = '',
  emptyClassName,
  emptyMessage,
}: SessionGroupProps) {
  return (
    <div className={className}>
      {sessions.map((session) => (
        <div
          key={session.sessionId}
          className={`session-item${itemClassName ? ` ${itemClassName}` : ''}${
            session.sessionId === activeSessionId ? ' session-active' : ''
          }`}
          onClick={() => onSelect(session.sessionId, session.mode)}
        >
          <div className="session-meta">
            <span className="session-title" title={session.title ?? 'Untitled session'}>
              {session.title ?? 'Untitled session'}
            </span>
            <span className="session-count">
              {session.mode.toUpperCase()} · {session.messageCount} msgs
            </span>
          </div>
          <button
            type="button"
            className="session-delete"
            onClick={(event) => {
              event.stopPropagation();
              void onDelete(session.sessionId);
            }}
            aria-label={`Delete session ${session.sessionId}`}
          >
            <Trash2 size={13} aria-hidden />
          </button>
        </div>
      ))}
      {sessions.length === 0 && <div className={emptyClassName}>{emptyMessage}</div>}
    </div>
  );
}

function orderSessions(sessions: SessionRecord[]): SessionRecord[] {
  return [...sessions].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
