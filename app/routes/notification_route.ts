import router from '@adonisjs/core/services/router';
const NotificationsController = () => import('#controllers/notifications_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/', [NotificationsController, 'index']);
    router.get('/:id', [NotificationsController, 'getById']);
    router.get('/count/unread-all', [NotificationsController, 'unreadCount']);
    router.post('/:id/mark-as-read', [NotificationsController, 'markAsRead']);
    router.post('/mark-all-as-read', [NotificationsController, 'markAllAsRead']);
  })
  .prefix('notifications')
  .use(middleware.auth({ guards: ['web'] }));
