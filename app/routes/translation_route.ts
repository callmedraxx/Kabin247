import router from '@adonisjs/core/services/router';
const TranslationsController = () => import('#controllers/translations_controller');
import { middleware } from '#start/kernel';

router
  .group(() => {
    router.get('/:lang', [TranslationsController, 'getByLang']);
    router.post('/:lang', [TranslationsController, 'createMissingLang']);
  })
  .prefix('translations');

router
  .group(() => {
    router.get('/languages', [TranslationsController, 'getLangPage']);
    router.get('/languages/api/:code', [TranslationsController, 'getTranslationsApi']);
    router.get('/languages/:code', [TranslationsController, 'getTranslationsPage']);
    router.post('/languages', [TranslationsController, 'saveLangs']);
    router.post('/languages/translations', [TranslationsController, 'createTranslations']);
    router.put('/languages/translations/:id', [TranslationsController, 'updateTranslations']);
    router.delete('/languages/translations/:id', [TranslationsController, 'deleteTranslations']);
  })
  .prefix('admin')
  .use(middleware.auth({ guards: ['web'] }))
  .use(middleware.role({ guards: ['admin'] }));
