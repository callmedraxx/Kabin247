import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

export default class ManifestCacheMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Set no-cache headers for manifest.json to prevent caching
    if (ctx.request.url().includes('/assets/.vite/manifest.json')) {
      ctx.response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      ctx.response.header('Pragma', 'no-cache');
      ctx.response.header('Expires', '0');
    }
    return next();
  }
}

