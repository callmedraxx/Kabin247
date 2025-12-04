import router from '@adonisjs/core/services/router';
const StockInventoriesController = () => import('#controllers/stock_inventories_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [StockInventoriesController, 'index']);
    router.get('/:id', [StockInventoriesController, 'getById']);
    router.post('/', [StockInventoriesController, 'store']);
    router.put('/:id', [StockInventoriesController, 'update']);
    router.patch('/:id/add-quantity', [StockInventoriesController, 'addQuantity']);
    router.delete('/:id', [StockInventoriesController, 'delete']);
    router.delete('/bulk/delete', [StockInventoriesController, 'bulkDelete']);
  })
  .prefix('/api/stock-inventories')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));

