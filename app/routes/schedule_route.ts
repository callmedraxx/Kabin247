import router from '@adonisjs/core/services/router';
const SchedulesController = () => import('#controllers/schedules_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [SchedulesController, 'index']);
    router.put('/:id', [SchedulesController, 'update']);
  })
  .prefix('/api/schedules')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
