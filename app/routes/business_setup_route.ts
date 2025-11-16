import router from '@adonisjs/core/services/router';
const BusinessSetupsController = () => import('#controllers/business_setups_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/detail', [BusinessSetupsController, 'getDetail']);
  })
  .prefix('/api/business-setup');

router
  .group(() => {
    router.put('/business-info', [BusinessSetupsController, 'updateBusinessInfo']);
    router.put('/platform-setup', [BusinessSetupsController, 'updatePlatformSetup']);
    router.put('/site-setting', [BusinessSetupsController, 'updateSiteSetting']);
  })
  .prefix('/api/business-setup')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin'] }));
