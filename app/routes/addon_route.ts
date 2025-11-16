import router from '@adonisjs/core/services/router';
const AddonsController = () => import('#controllers/addons_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [AddonsController, 'index']);
    router.get('/:id', [AddonsController, 'getById']);
  })
  .prefix('/api/user/addons/')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['customer'] }));

router
  .group(() => {
    router.get('/', [AddonsController, 'index']);
    router.get('/:id', [AddonsController, 'getById']);
    router.post('/', [AddonsController, 'store']);
    router.put('/:id', [AddonsController, 'update']);
    router.patch('/:id', [AddonsController, 'customUpdate']);
    router.patch('/bulk/update', [AddonsController, 'bulkCustomUpdate']);
    router.delete('/:id', [AddonsController, 'delete']);
    router.delete('/bulk/delete', [AddonsController, 'bulkDelete']);
  })
  .prefix('/api/addons')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
