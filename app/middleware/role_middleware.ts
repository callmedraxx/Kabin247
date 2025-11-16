import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import Roles from '../enum/roles.js';

export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: string[];
    } = {}
  ) {
    const roleIds = options?.guards?.map(
      (guard) => Roles[guard.toUpperCase() as keyof typeof Roles]
    );
    if (!roleIds?.includes(ctx.auth.user?.roleId ?? -1)) {
      return ctx.response.redirect().toRoute('/login');
    }
    return next();
  }
}
