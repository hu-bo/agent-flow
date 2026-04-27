import { Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { AgentPage } from './pages/AgentPage';
import { ChatPage } from './pages/ChatPage';
import { FlowPage } from './pages/FlowPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="/chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="agent" element={<AgentPage />} />
        <Route path="flow" element={<FlowPage />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Route>
    </Routes>
  );
}
