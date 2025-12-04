const { config } = require('dotenv');
const path = require('path');

// Load environment variables from .env file
config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: 'kabin247',
      script: './build/bin/server.js',
      cwd: '/root/Kabin247',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 3333,
        HOST: process.env.HOST || '127.0.0.1',
        DB_HOST: process.env.DB_HOST || '127.0.0.1',
        DB_PORT: process.env.DB_PORT || 3306,
        DB_USER: process.env.DB_USER || 'kabin247',
        DB_PASSWORD: process.env.DB_PASSWORD || 'kabin247',
        DB_DATABASE: process.env.DB_DATABASE || 'app',
        APP_KEY: process.env.APP_KEY || 'c2pRFTsYeFmsBcik6e2puKwdFor53U1j',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        SESSION_DRIVER: process.env.SESSION_DRIVER || 'cookie',
        DRIVE_DISK: process.env.DRIVE_DISK || 'fs',
        SMTP_USERNAME: process.env.SMTP_USERNAME,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_EMAIL: process.env.SMTP_EMAIL,
        SERVER_URL: process.env.SERVER_URL || 'https://app.kabin247.com',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
    },
    {
      name: 'adminjs',
      script: './node_modules/.bin/tsx',
      args: 'adminjs-server.ts',
      cwd: '/root/Kabin247',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        ADMINJS_PORT: 3001,
        DB_HOST: '127.0.0.1',
        DB_PORT: 3306,
        DB_USER: 'kabin247',
        DB_PASSWORD: 'kabin247',
        DB_DATABASE: 'app',
      },
      error_file: './logs/adminjs-error.log',
      out_file: './logs/adminjs-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
    },
  ],
}

