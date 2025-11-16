import BusinessSetup from '#models/business_setup';
import env from '#start/env';
import { BaseMail } from '@adonisjs/mail';
import type User from '#models/user';

export default class ClientOrderNotification extends BaseMail {
  from = env.get('SMTP_EMAIL');
  subject = 'Order Update';
  user: User;
  logo: string;
  url: string;
  appName: string;

  constructor(user: User, branding: { business: BusinessSetup; siteUrl: string }) {
    super();
    this.user = user;
    this.url = branding.siteUrl;
    this.appName = branding.business.name || '';
    this.logo = branding.siteUrl + (branding?.business?.logo?.url || '');
  }

  prepare() {
    this.message.to(this.user.email);
    this.message.from(this.from, this.appName);
    this.message.subject(this.subject);
    this.message.htmlView('emails/generic_email', {
      logo: this.logo,
      title: this.subject,
      body: `<h1>Hello ${this.user?.firstName || ''},</h1>
<p>There is an update to your order. Click below to view details.</p>`,
      action: true,
      actionText: 'View My Orders',
      actionUrl: this.url + '/user/my-orders',
    });
  }
}
