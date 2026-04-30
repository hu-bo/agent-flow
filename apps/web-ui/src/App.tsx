import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './pages/pages.less';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useChatStore } from './store/chat-store';
import { AuthToolbar } from './auth';

export function App() {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const setActiveSession = useChatStore((state) => state.setActiveSession);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSelectSession = (sessionId: string | null) => {
    setActiveSession(sessionId);

    if (sessionId) {
      const nextPath = `/chat/${sessionId}`;
      navigate(nextPath, { replace: location.pathname === nextPath });
      return;
    }

    if (location.pathname.startsWith('/chat')) {
      navigate('/chat', { replace: location.pathname === '/chat' });
    }
  };

  return (
    <div className="playground-shell">
      <Sidebar activeSessionId={activeSessionId} onSelectSession={handleSelectSession} />
      <main className="workspace-main">
        <Outlet></Outlet>
      </main>
    </div>
  );
}
