import router from '@adonisjs/core/services/router';
import { middleware } from '#start/kernel';

router.group(() => {
  router.on('/').redirect('/login').use(middleware.maintenance());
  router.on('/confirm').renderInertia('Customer/Confirm').use(middleware.maintenance());
  router.on('/under-maintenance').renderInertia('Customer/Maintenance');
  router.on('/about-us').renderInertia('Customer/AboutUs').use(middleware.maintenance());
  router.on('/contact-us').renderInertia('Customer/ContactUs').use(middleware.maintenance());
  router
    .on('/terms-and-conditions')
    .renderInertia('Customer/TermsAndConditions')
    .use(middleware.maintenance());
  router
    .on('/privacy-policy')
    .renderInertia('Customer/PrivacyPolicy')
    .use(middleware.maintenance());
  router.on('/return-policy').renderInertia('Customer/ReturnPolicy').use(middleware.maintenance());
});
