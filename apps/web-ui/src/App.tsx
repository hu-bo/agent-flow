import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './pages/pages.less';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useChatStore } from './store/chat-store';
import { WorkspaceProvider } from './workspace-provider';

export function App() {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const setActiveSession = useChatStore((state) => state.setActiveSession);
  const setPendingNewChatProject = useChatStore((state) => state.setPendingNewChatProject);
  const setPendingNewChatPlacement = useChatStore((state) => state.setPendingNewChatPlacement);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const mobileTitle = location.pathname.startsWith('/spec')
    ? 'Spec workbench'
    : location.pathname.startsWith('/runners')
      ? 'Runner control'
      : location.pathname.startsWith('/agent')
        ? 'Agent workspace'
        : location.pathname.startsWith('/flow')
          ? 'Flow workspace'
          : 'Chat workspace';

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  const handleSelectSession = (
    sessionId: string | null,
    mode: 'vibe' | 'spec' = 'vibe',
    options?: { openChatWhenEmpty?: boolean },
  ) => {
    setActiveSession(sessionId);

    if (sessionId) {
      setPendingNewChatProject(null);
      setPendingNewChatPlacement(null);
      const nextPath = mode === 'spec' ? `/spec/${sessionId}` : `/chat/${sessionId}`;
      navigate(nextPath, { replace: location.pathname === nextPath });
      return;
    }

    if (options?.openChatWhenEmpty) {
      navigate('/chat', { replace: location.pathname === '/chat' });
      return;
    }

    if (location.pathname.startsWith('/chat') || location.pathname.startsWith('/spec')) {
      navigate('/chat', { replace: location.pathname === '/chat' });
    }
  };

  return (
    <WorkspaceProvider>
      <div className="playground-shell">
      {mobileMenuOpen && <button type="button" className="mobile-menu-backdrop" aria-label="Close workspace menu" onClick={() => setMobileMenuOpen(false)} />}
      <Sidebar
        activeSessionId={activeSessionId}
        onSelectSession={(...args) => {
          handleSelectSession(...args);
          setMobileMenuOpen(false);
        }}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className="workspace-main">
        <header className="mobile-workspace-header">
          <button
            ref={menuButtonRef}
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close workspace menu' : 'Open workspace menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="workspace-sidebar"
          >
            {mobileMenuOpen ? <X size={19} aria-hidden /> : <Menu size={19} aria-hidden />}
          </button>
          <span>{mobileTitle}</span>
          <span className="mobile-header-spacer" aria-hidden />
        </header>
        <Outlet></Outlet>
      </main>
      </div>
    </WorkspaceProvider>
  );
}
