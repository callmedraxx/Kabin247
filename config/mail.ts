import env from '#start/env';
import { defineConfig, transports } from '@adonisjs/mail';
import { readFileSync } from 'fs';
import { join } from 'path';

// DKIM configuration
const getDkimConfig = () => {
  const dkimEnabled = env.get('DKIM_ENABLED', false);
  if (!dkimEnabled) {
    return undefined;
  }

  try {
    const dkimSelector = env.get('DKIM_SELECTOR', 'default');
    const dkimDomain = env.get('DKIM_DOMAIN', env.get('SMTP_EMAIL')?.split('@')[1] || 'kabin247.com');
    const dkimPrivateKeyPath = env.get('DKIM_PRIVATE_KEY_PATH', `config/dkim/${dkimSelector}.private.pem`);
    
    // Read private key
    const privateKey = readFileSync(join(process.cwd(), dkimPrivateKeyPath), 'utf-8');
    
    return {
      domainName: dkimDomain,
      keySelector: dkimSelector,
      privateKey: privateKey,
    };
  } catch (error) {
    console.warn('DKIM configuration failed, emails will be sent without DKIM signing:', error);
    return undefined;
  }
};

const dkimConfig = getDkimConfig();

const mailConfig = defineConfig({
  default: 'smtp',

  from: {
    address: env.get('SMTP_EMAIL'),
    name: 'Kabin247',
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
      // Additional options for Office365 compatibility
      tls: {
        rejectUnauthorized: false, // Office365 sometimes has certificate issues
      },
      // DKIM signing configuration (passed through to nodemailer)
      // @ts-ignore - DKIM is a valid nodemailer option but not in AdonisJS types
      ...(dkimConfig && {
        dkim: dkimConfig,
      }),
      // Timeout settings to prevent connection timeouts (passed through to nodemailer)
      // @ts-ignore - These are valid nodemailer options but not in AdonisJS types
      connectionTimeout: 120000, // 120 seconds for initial connection (increased from 60s)
      // @ts-ignore
      greetingTimeout: 60000, // 60 seconds for greeting (increased from 30s)
      // @ts-ignore
      socketTimeout: 120000, // 120 seconds for socket operations (increased from 120s)
      // Connection pool settings for better reliability
      // @ts-ignore
      pool: true, // Enable connection pooling to reuse connections
      // @ts-ignore
      maxConnections: 5, // Maximum number of connections in pool
      // @ts-ignore
      maxMessages: 100, // Maximum messages per connection before closing
      // @ts-ignore
      rateDelta: 1000, // Rate limit time window (ms)
      // @ts-ignore
      rateLimit: 5, // Rate limit (messages per rateDelta)
      // Debug mode (set to true for troubleshooting)
      // @ts-ignore
      debug: env.get('NODE_ENV') === 'development',
      // @ts-ignore
      logger: env.get('NODE_ENV') === 'development',
    }),
  },
});

export default mailConfig;

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
