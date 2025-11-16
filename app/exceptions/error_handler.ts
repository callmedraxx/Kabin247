import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';
import { errors } from '@vinejs/vine';

export default function errorHandler(
  error: any,
  response: HttpContext['response'],
  logger: HttpContext['logger'],
  log: string = 'Controller Error'
) {
  logger.error(log + ': %j', {
    message: error?.message,
    stack: error?.stack,
    name: error?.name,
    ...error,
  });

  if (error instanceof errors.E_VALIDATION_ERROR) {
    return response.status(422).json({ success: false, messages: error.messages });
  }

  if (error instanceof Exception) {
    return response.status(error.status).json({ success: false, message: error.message });
  }

  return response.internalServerError({
    success: false,
    message: error.message || 'An unexpected error occurred',
  });
}
