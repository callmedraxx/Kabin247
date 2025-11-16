import router from '@adonisjs/core/services/router';
const WebhooksController = () => import('#controllers/webhooks_controller');

router
  .group(() => {
    router.post('/stripe', [WebhooksController, 'stripe']);
    router.post('/paypal', [WebhooksController, 'paypal']);
  })
  .prefix('/api/webhook');
