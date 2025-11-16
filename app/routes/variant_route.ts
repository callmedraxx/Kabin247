import router from '@adonisjs/core/services/router';
const VariantsController = () => import('#controllers/variants_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [VariantsController, 'index']);
    router.get('/export/all', [VariantsController, 'exportVariants']);
    router.get('/:id', [VariantsController, 'getById']);
    router.post('/', [VariantsController, 'store']);
    router.put('/:id', [VariantsController, 'update']);
    router.patch('/:id', [VariantsController, 'customUpdate']);
    router.patch('/bulk-update', [VariantsController, 'bulkCustomUpdate']);
    router.delete('/:id', [VariantsController, 'delete']);
    router.delete('/bulk-delete', [VariantsController, 'bulkDelete']);
  })
  .prefix('/api/variants')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
