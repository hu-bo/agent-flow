const PUBLIC_ROUTE_PATHS = ['/callback', '/desktop'] as const;

export const WORKSPACE_ROUTES = [
  { id: 'chat', paths: ['/chat', '/chat/:sessionId'] },
  { id: 'spec', paths: ['/spec', '/spec/:sessionId'] },
  { id: 'runners', paths: ['/runners'] },
  { id: 'agent', paths: ['/agent'] },
  { id: 'flow', paths: ['/flow'] },
] as const;

export type WorkspaceRouteId = (typeof WORKSPACE_ROUTES)[number]['id'];

export const PLATFORM_ROUTE_PATHS = [
  ...PUBLIC_ROUTE_PATHS,
  ...WORKSPACE_ROUTES.flatMap((route) => route.paths),
] as const;
