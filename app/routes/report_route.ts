import router from '@adonisjs/core/services/router';
const ReportsController = () => import('#controllers/reports_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/earning-chart', [ReportsController, 'earningReportChart']);
    router.get('/order-chart', [ReportsController, 'orderCountChart']);
  })
  .prefix('/api/reports')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin', 'manager'] }));
