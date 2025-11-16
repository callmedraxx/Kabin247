import router from '@adonisjs/core/services/router';
const ReservationsController = () => import('#controllers/reservations_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [ReservationsController, 'index']);
    router.get('/export/all', [ReservationsController, 'exportReservations']);
    router.post('/', [ReservationsController, 'store']);
    router.put('/:id', [ReservationsController, 'update']);
    router.patch('/:id', [ReservationsController, 'customUpdate']);
    router.patch('/bulk/update', [ReservationsController, 'bulkCustomUpdate']);
    router.delete('/:id', [ReservationsController, 'delete']);
    router.delete('/bulk/delete', [ReservationsController, 'bulkDelete']);
  })
  .prefix('/api/reservations')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager', 'pos'] }));
