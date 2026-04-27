import { Outlet } from 'react-router-dom';
import './pages/pages.less';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useChatStore } from './store/chat-store';

export function App() {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const setActiveSession = useChatStore((state) => state.setActiveSession);

  return (
    <div className="playground-shell">
      <Sidebar activeSessionId={activeSessionId} onSelectSession={setActiveSession} />
      <main className="workspace-main">
        <Outlet></Outlet>
      </main>
    </div>
  );
}
