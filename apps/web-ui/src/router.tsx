import { Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { AgentPage } from './pages/AgentPage';
import { ChatPage } from './pages/ChatPage';
import { FlowPage } from './pages/FlowPage';
import { RunnerPage } from './pages/RunnerPage';
import { AuthCallbackPage, AuthGate } from './auth';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/callback" element={<AuthCallbackPage />} />
      <Route
        path="/"
        element={
          <AuthGate>
            <App />
          </AuthGate>
        }
      >
        <Route index element={<Navigate to="/chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:sessionId" element={<ChatPage />} />
        <Route path="runners" element={<RunnerPage />} />
        <Route path="agent" element={<AgentPage />} />
        <Route path="flow" element={<FlowPage />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Route>
    </Routes>
  );
}
