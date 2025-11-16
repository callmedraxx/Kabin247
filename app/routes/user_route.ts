import router from '@adonisjs/core/services/router';
const UsersController = () => import('#controllers/users_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.put('/update', [UsersController, 'updateByUser']);
  })
  .prefix('/api/users/profile')
  .use(middleware.auth({ guards: ['web'] }));

router
  .group(() => {
    router.get('/', [UsersController, 'index']);
    router.get('/:id', [UsersController, 'getById']);
  })
  .prefix('/api/users')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager', 'pos', 'display', 'kitchen'] }));

router
  .group(() => {
    router.get('/export/all', [UsersController, 'exportUsers']);
    router.post('/', [UsersController, 'store']);
    router.put('/:id', [UsersController, 'update']);
    router.patch('/:id', [UsersController, 'customUpdate']);
    router.patch('/bulk/update', [UsersController, 'bulkCustomUpdate']);
    router.delete('/:id', [UsersController, 'delete']);
    router.delete('/bulk/delete', [UsersController, 'bulkDelete']);
  })
  .prefix('/api/users')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
