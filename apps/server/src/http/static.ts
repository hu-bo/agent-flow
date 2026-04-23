import { existsSync, readFileSync, statSync } from 'fs';
import { resolve, join, extname } from 'path';
import type { Context, Next } from 'hono';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

function guessMimeType(filePath: string): string {
  return MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

export function createStaticMiddleware(staticDir: string) {
  const root = resolve(staticDir);
  const fallback = join(root, 'index.html');

  return async (c: Context, next: Next): Promise<Response | void> => {
    if (c.req.method !== 'GET') {
      await next();
      return;
    }

    const path = c.req.path;
    if (path.startsWith('/api')) {
      await next();
      return;
    }

    const requestPath = path === '/' ? '/index.html' : path;
    const normalized = requestPath.replace(/\\/g, '/');
    const resolved = resolve(root, `.${normalized}`);

    if (!resolved.startsWith(root)) {
      return c.text('Forbidden', 403);
    }

    const target = existsSync(resolved) && statSync(resolved).isFile() ? resolved : fallback;
    if (!existsSync(target)) {
      await next();
      return;
    }

    const content = readFileSync(target);
    return c.newResponse(content, 200, {
      'Content-Type': guessMimeType(target),
      'Cache-Control': target === fallback ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
  };
}
