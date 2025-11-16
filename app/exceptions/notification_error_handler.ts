import logger from '@adonisjs/core/services/logger';

export default function notificationErrorHandler(error: any, log: string = 'Controller Error') {
  logger.error(log + ': %j', error);

  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
  };
}
