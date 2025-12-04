import router from '@adonisjs/core/services/router';
import CaterersController from '#controllers/caterers_controller';

router
  .group(() => {
    router.get('/caterers', [CaterersController, 'index']);
    router.get('/caterers/:id', [CaterersController, 'show']);
  })
  .prefix('/api');

