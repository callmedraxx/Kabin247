import router from '@adonisjs/core/services/router';
const CouponController = () => import('#controllers/coupons_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/:id', [CouponController, 'getById']);
  })
  .prefix('/api/user/coupons')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['customer'] }));

router
  .group(() => {
    router.get('/', [CouponController, 'index']);
    router.get('/:id', [CouponController, 'getById']);
    router.post('/', [CouponController, 'store']);
    router.put('/:id', [CouponController, 'update']);
    router.patch('/:id', [CouponController, 'customUpdate']);
    router.patch('/bulk/update', [CouponController, 'bulkCustomUpdate']);
    router.delete('/:id', [CouponController, 'delete']);
    router.delete('/bulk/delete', [CouponController, 'bulkDelete']);
  })
  .prefix('/api/coupons')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
