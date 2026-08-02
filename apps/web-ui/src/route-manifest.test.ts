import { describe, expect, it } from 'vitest';
import { PLATFORM_ROUTE_PATHS, WORKSPACE_ROUTES } from './route-manifest';

describe('platform route manifest', () => {
  it('retains every platform surface and session-aware conversation route', () => {
    expect(PLATFORM_ROUTE_PATHS).toEqual([
      '/callback',
      '/desktop',
      '/chat',
      '/chat/:sessionId',
      '/spec',
      '/spec/:sessionId',
      '/runners',
      '/agent',
      '/flow',
    ]);
  });

  it('has unique paths and one page owner per route', () => {
    expect(new Set(PLATFORM_ROUTE_PATHS).size).toBe(PLATFORM_ROUTE_PATHS.length);
    expect(WORKSPACE_ROUTES.map((route) => route.id)).toEqual([
      'chat',
      'spec',
      'runners',
      'agent',
      'flow',
    ]);
  });
});
