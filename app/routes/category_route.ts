import router from '@adonisjs/core/services/router';
const CategoriesController = () => import('#controllers/categories_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [CategoriesController, 'index']);
    router.get('/:id', [CategoriesController, 'getCategory']);
  })
  .prefix('/api/user/categories/:global');

router
  .group(() => {
    router.get('/', [CategoriesController, 'index']);
    router.get('/:id', [CategoriesController, 'getCategory']);
    router.post('/', [CategoriesController, 'store']);
    router.put('/:id', [CategoriesController, 'update']);
    router.patch('/:id', [CategoriesController, 'customUpdate']);
    router.patch('/bulk/update', [CategoriesController, 'bulkCustomUpdate']);
    router.delete('/:id', [CategoriesController, 'delete']);
    router.delete('/bulk/delete', [CategoriesController, 'bulkDelete']);
  })
  .prefix('/api/categories')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
