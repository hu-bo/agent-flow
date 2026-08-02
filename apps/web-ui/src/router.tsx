import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { AuthCallbackPage, AuthGate } from './auth';
import { WORKSPACE_ROUTES, type WorkspaceRouteId } from './route-manifest';

const AgentPage = lazy(() => import('./pages/AgentPage').then((module) => ({ default: module.AgentPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then((module) => ({ default: module.ChatPage })));
const DesktopPage = lazy(() => import('./pages/DesktopPage').then((module) => ({ default: module.DesktopPage })));
const FlowPage = lazy(() => import('./pages/FlowPage').then((module) => ({ default: module.FlowPage })));
const RunnerPage = lazy(() => import('./pages/RunnerPage').then((module) => ({ default: module.RunnerPage })));
const SpecPage = lazy(() => import('./pages/SpecPage').then((module) => ({ default: module.SpecPage })));

const WORKSPACE_PAGE_BY_ID = {
  chat: <ChatPage />,
  spec: <SpecPage />,
  runners: <RunnerPage />,
  agent: <AgentPage />,
  flow: <FlowPage />,
} satisfies Record<WorkspaceRouteId, React.ReactElement>;

export function AppRouter() {
  return (
    <Suspense fallback={<div className="route-loading">Loading workspace…</div>}>
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
        {WORKSPACE_ROUTES.flatMap((route) => route.paths.map((path) => (
          <Route key={path} path={path} element={WORKSPACE_PAGE_BY_ID[route.id]} />
        )))}
      </Route>
      <Route path="*" element={<Navigate to="/desktop" replace />} />
      </Routes>
    </Suspense>
  );
}
