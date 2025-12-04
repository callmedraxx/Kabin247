import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';
import { errors } from '@vinejs/vine';

export default function errorHandler(
  error: any,
  response: HttpContext['response'],
  logger: HttpContext['logger'],
  log: string = 'Controller Error'
) {
  // Handle validation errors separately - these are expected user input failures
  if (error instanceof errors.E_VALIDATION_ERROR) {
    // Log validation errors at info level since they're expected user input issues
    logger.info(log + ' (Validation): %j', {
      message: error?.message,
      messages: error.messages,
      code: error.code,
    });
    return response.status(422).json({ success: false, messages: error.messages });
  }

  // Log actual errors for unexpected issues
  logger.error(log + ': %j', {
    message: error?.message,
    stack: error?.stack,
    name: error?.name,
    ...error,
  });

  if (error instanceof Exception) {
    return response.status(error.status).json({ success: false, message: error.message });
  }

  return response.internalServerError({
    success: false,
    message: error.message || 'An unexpected error occurred',
  });
}
