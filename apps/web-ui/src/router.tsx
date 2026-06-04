import { Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { AgentPage } from './pages/AgentPage';
import { ChatPage } from './pages/ChatPage';
import { DesktopPage } from './pages/DesktopPage';
import { FlowPage } from './pages/FlowPage';
import { RunnerPage } from './pages/RunnerPage';
import { SpecPage } from './pages/SpecPage';
import { AuthCallbackPage, AuthGate } from './auth';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/callback" element={<AuthCallbackPage />} />
      <Route path="/" element={<Navigate to="/desktop" replace />} />
      <Route path="/desktop" element={<DesktopPage />} />
      <Route
        element={
          <AuthGate>
            <App />
          </AuthGate>
        }
      >
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:sessionId" element={<ChatPage />} />
        <Route path="/spec" element={<SpecPage />} />
        <Route path="/spec/:sessionId" element={<SpecPage />} />
        <Route path="/runners" element={<RunnerPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/flow" element={<FlowPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/desktop" replace />} />
    </Routes>
  );
}
