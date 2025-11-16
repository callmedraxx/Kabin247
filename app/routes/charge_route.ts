import router from '@adonisjs/core/services/router';
const ChargesController = () => import('#controllers/charges_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [ChargesController, 'index']);
    router.get('/:id', [ChargesController, 'getById']);
  })
  .prefix('/api/user/charges')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['customer'] }));

router
  .group(() => {
    router.get('/', [ChargesController, 'index']);
    router.get('/:id', [ChargesController, 'getById']);
    router.post('/', [ChargesController, 'store']);
    router.put('/:id', [ChargesController, 'update']);
    router.patch('/:id', [ChargesController, 'customUpdate']);
    router.patch('/bulk/update', [ChargesController, 'bulkCustomUpdate']);
    router.delete('/:id', [ChargesController, 'delete']);
    router.delete('/bulk/delete', [ChargesController, 'bulkDelete']);
  })
  .prefix('/api/charges')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
