import router from '@adonisjs/core/services/router';
import CaterersController from '#controllers/caterers_controller';

const CaterersControllerInstance = new CaterersController();

router
  .group(() => {
    router.get('/caterers', [CaterersControllerInstance, 'index']);
    router.get('/caterers/:id', [CaterersControllerInstance, 'show']);
  })
  .prefix('/api');

