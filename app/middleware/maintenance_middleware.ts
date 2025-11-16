import BusinessSetup from '#models/business_setup';
import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';

export default class MaintenanceMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const businessSetup = await BusinessSetup.firstOrFail();
    if (businessSetup.maintenanceMode) {
      return ctx.response.redirect('/under-maintenance');
    }
    return next();
  }
}
