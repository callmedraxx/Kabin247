import router from '@adonisjs/core/services/router';
const SettingsController = () => import('#controllers/settings_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/get-payment-options', [SettingsController, 'getPaymentOptions']);
  })
  .prefix('/api/settings')
  .use(middleware.auth({ guards: ['web'] }));

router
  .group(() => {
    router.put('/payment-method', [SettingsController, 'updatePaymentOptions']);
    router.put('/theme', [SettingsController, 'updateTheme']);
    router.put('/restore-default-theme', [SettingsController, 'restoreDefaultTheme']);
  })
  .prefix('/api/settings')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
