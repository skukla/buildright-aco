/**
 * Unit tests for Error Handler
 * Tests error categorization, retry eligibility, and formatting
 */

import { describe, test, expect } from '@jest/globals';

describe('Error Handler', () => {
  test('should categorize validation errors', async () => {
    const { ErrorHandler, ErrorCategory } = await import('../../../utils/error-handler.js');

    const validationError = new Error('Invalid product schema');
    validationError.name = 'ValidationError';

    const category = ErrorHandler.categorize(validationError);

    expect(category).toBe(ErrorCategory.VALIDATION_ERROR);
  });

  test('should categorize authentication errors (401)', async () => {
    const { ErrorHandler, ErrorCategory } = await import('../../../utils/error-handler.js');

    const authError = new Error('Unauthorized');
    authError.status = 401;

    const category = ErrorHandler.categorize(authError);

    expect(category).toBe(ErrorCategory.AUTH_ERROR);
  });

  test('should categorize not found errors (404)', async () => {
    const { ErrorHandler, ErrorCategory } = await import('../../../utils/error-handler.js');

    const notFoundError = new Error('Resource not found');
    notFoundError.status = 404;

    const category = ErrorHandler.categorize(notFoundError);

    expect(category).toBe(ErrorCategory.NOT_FOUND_ERROR);
  });

  test('should categorize rate limit errors (429)', async () => {
    const { ErrorHandler, ErrorCategory } = await import('../../../utils/error-handler.js');

    const rateLimitError = new Error('Too many requests');
    rateLimitError.status = 429;

    const category = ErrorHandler.categorize(rateLimitError);

    expect(category).toBe(ErrorCategory.RATE_LIMIT_ERROR);
  });

  test('should categorize server errors (500, 503)', async () => {
    const { ErrorHandler, ErrorCategory } = await import('../../../utils/error-handler.js');

    const serverError500 = new Error('Internal server error');
    serverError500.status = 500;

    const serverError503 = new Error('Service unavailable');
    serverError503.status = 503;

    expect(ErrorHandler.categorize(serverError500)).toBe(ErrorCategory.SERVER_ERROR);
    expect(ErrorHandler.categorize(serverError503)).toBe(ErrorCategory.SERVER_ERROR);
  });

  test('should categorize unknown errors', async () => {
    const { ErrorHandler, ErrorCategory } = await import('../../../utils/error-handler.js');

    const unknownError = new Error('Something went wrong');

    const category = ErrorHandler.categorize(unknownError);

    expect(category).toBe(ErrorCategory.UNKNOWN_ERROR);
  });

  test('should determine rate limit errors are retryable', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const rateLimitError = new Error('Rate limit exceeded');
    rateLimitError.status = 429;

    const isRetryable = ErrorHandler.isRetryable(rateLimitError);

    expect(isRetryable).toBe(true);
  });

  test('should determine server errors are retryable', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const serverError = new Error('Service unavailable');
    serverError.status = 503;

    const isRetryable = ErrorHandler.isRetryable(serverError);

    expect(isRetryable).toBe(true);
  });

  test('should determine auth errors are not retryable', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const authError = new Error('Unauthorized');
    authError.status = 401;

    const isRetryable = ErrorHandler.isRetryable(authError);

    expect(isRetryable).toBe(false);
  });

  test('should determine not found errors are not retryable', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const notFoundError = new Error('Not found');
    notFoundError.status = 404;

    const isRetryable = ErrorHandler.isRetryable(notFoundError);

    expect(isRetryable).toBe(false);
  });

  test('should determine validation errors are not retryable', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const validationError = new Error('Invalid data');
    validationError.name = 'ValidationError';

    const isRetryable = ErrorHandler.isRetryable(validationError);

    expect(isRetryable).toBe(false);
  });

  test('should format error with all details', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const error = new Error('Test error');
    error.status = 429;
    error.code = 'RATE_LIMIT';

    const formatted = ErrorHandler.format(error);

    expect(formatted).toHaveProperty('message');
    expect(formatted).toHaveProperty('category');
    expect(formatted).toHaveProperty('isRetryable');
    expect(formatted).toHaveProperty('status');
    expect(formatted).toHaveProperty('timestamp');

    expect(formatted.message).toBe('Test error');
    expect(formatted.status).toBe(429);
    expect(formatted.isRetryable).toBe(true);
  });

  test('should format error with stack trace in development', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at Object.<anonymous>';

    const formatted = ErrorHandler.format(error);

    expect(formatted).toHaveProperty('stack');
    expect(formatted.stack).toBeTruthy();

    process.env.NODE_ENV = originalEnv;
  });

  test('should not include stack trace in production', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at Object.<anonymous>';

    const formatted = ErrorHandler.format(error);

    expect(formatted.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  test('should handle errors without status codes', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const error = new Error('Generic error');

    const formatted = ErrorHandler.format(error);

    expect(formatted.status).toBeUndefined();
    expect(formatted.category).toBeDefined();
  });

  test('should include additional error metadata if present', async () => {
    const { ErrorHandler } = await import('../../../utils/error-handler.js');

    const error = new Error('Custom error');
    error.status = 400;
    error.details = { field: 'sku', issue: 'duplicate' };

    const formatted = ErrorHandler.format(error);

    expect(formatted).toHaveProperty('details');
    expect(formatted.details).toEqual({ field: 'sku', issue: 'duplicate' });
  });
});
