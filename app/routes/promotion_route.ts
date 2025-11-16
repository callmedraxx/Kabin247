import router from '@adonisjs/core/services/router';
const PromotionsController = () => import('#controllers/promotions_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/:type', [PromotionsController, 'getDetail']);
  })
  .prefix('/api/promotions');

router
  .group(() => {
    router.put('/', [PromotionsController, 'updatePromotion']);
    router.put('/slider', [PromotionsController, 'updateSlider']);
  })
  .prefix('/api/promotions')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
