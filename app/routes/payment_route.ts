import router from '@adonisjs/core/services/router';
const PaymentsController = () => import('#controllers/payments_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/paypal/success', [PaymentsController, 'capturePayPalOrder']);
    router.get('/paypal/cancel', [PaymentsController, 'cancelPaypalOrder']);
    router.get('/stripe/success', [PaymentsController, 'retrieveStripeSession']);
    router.get('/stripe/cancel', [PaymentsController, 'cancelStripeSession']);
  })
  .prefix('/payments')
  .use(middleware.auth({ guards: ['web'] }));
