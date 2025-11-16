import env from '#start/env';
import { defineConfig, transports } from '@adonisjs/mail';

const mailConfig = defineConfig({
  default: 'smtp',

  from: {
    address: 'guoxliup@outlook.com',
    name: 'Guoxian Li',
  },
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: Number(env.get('SMTP_PORT')),
      secure: env.get('SMTP_PORT') === '465', // true for 465, false for other ports
      requireTLS: env.get('SMTP_PORT') === '587', // true for 587 (STARTTLS)
      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME'),
        pass: env.get('SMTP_PASSWORD'),
      },
    }),
  },
});

export default mailConfig;

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
