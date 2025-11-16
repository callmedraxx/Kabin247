import router from '@adonisjs/core/services/router';
const MenuItemsController = () => import('#controllers/menu_items_controller');
import { middleware } from '#start/kernel';
router
  .group(() => {
    router.get('/', [MenuItemsController, 'index']);
    router.get('/:id', [MenuItemsController, 'getById']);
  })
  .prefix('/api/user/menu-items/:global');

router
  .group(() => {
    router.get('/', [MenuItemsController, 'index']);
    router.get('/export/all', [MenuItemsController, 'exportMenuItems']);
    router.get('/:id', [MenuItemsController, 'getById']);
    router.post('/', [MenuItemsController, 'store']);
    router.put('/:id', [MenuItemsController, 'update']);
    router.patch('/:id', [MenuItemsController, 'customUpdate']);
    router.patch('/bulk/update', [MenuItemsController, 'bulkCustomUpdate']);
    router.delete('/:id', [MenuItemsController, 'delete']);
    router.delete('/bulk/delete', [MenuItemsController, 'bulkDelete']);
  })
  .prefix('/api/menu-items')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager', 'pos', 'display', 'kitchen'] }));
