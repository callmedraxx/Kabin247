import router from '@adonisjs/core/services/router';
const PaymentMethod = () => import('#controllers/payment_methods_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [PaymentMethod, 'index']);
    router.get('/:id', [PaymentMethod, 'getById']);
  })
  .prefix('/api/user/payment-methods');

router
  .group(() => {
    router.get('/', [PaymentMethod, 'adminView']);
  })
  .prefix('/admin/payment-methods')
  .use([middleware.auth({ guards: ['web'] }), middleware.role({ guards: ['admin'] })]);

router
  .group(() => {
    router.get('/', [PaymentMethod, 'adminIndex']);
    router.get('/:id', [PaymentMethod, 'getDetails']);
    router.post('/', [PaymentMethod, 'store']);
    router.put('/:id', [PaymentMethod, 'update']);
    router.patch('/:id', [PaymentMethod, 'customUpdate']);
    router.delete('/:id', [PaymentMethod, 'delete']);
  })
  .prefix('/api/payment-methods')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
