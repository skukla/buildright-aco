/**
 * Retry Handler with Exponential Backoff
 *
 * Provides retry logic for API operations with configurable backoff strategy.
 * Categorizes errors as retryable (429, 503, network issues) or non-retryable (401, 400).
 *
 * @module utils/retry-handler
 */

import logger from './logger.js';

/**
 * Determine if error is retryable based on HTTP status code
 *
 * @param {Error} error - Error object with status/statusCode property
 * @returns {boolean} True if error should be retried
 */
export function isRetryable(error) {
  const status = error.status || error.statusCode || error.response?.status;

  // Retryable: Rate limits, server errors
  if (status === 429 || status === 503 || (status >= 500 && status < 600)) {
    return true;
  }

  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }

  // Non-retryable: Auth, validation, not found
  return false;
}

/**
 * Execute function with retry logic and exponential backoff
 *
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.initialDelayMs=2000] - Initial delay in milliseconds
 * @param {number} [options.backoffMultiplier=2] - Backoff multiplier for exponential delay
 * @param {Function} [options.onRetry] - Callback invoked on retry
 * @returns {Promise<*>} Result of successful function execution
 * @throws {Error} If max retries reached or non-retryable error encountered
 *
 * @example
 * const result = await executeWithRetry(
 *   () => client.createProducts(products),
 *   { maxRetries: 3, onRetry: ({ attempt }) => console.log(`Retry ${attempt}`) }
 * );
 */
export async function executeWithRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 2000,
    backoffMultiplier = 2,
    onRetry = () => {}
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Non-retryable errors fail fast
      if (!isRetryable(error)) {
        logger.error('Non-retryable error encountered', {
          error: error.message,
          status: error.status || error.statusCode,
          attempt
        });
        throw error;
      }

      // Max retries reached
      if (attempt === maxRetries) {
        logger.error('Max retries reached', {
          error: error.message,
          attempts: maxRetries
        });
        throw new Error(`Max retries (${maxRetries}) reached: ${error.message}`);
      }

      // Calculate delay with exponential backoff
      const delayMs = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);

      logger.warn(`Retrying after ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`, {
        error: error.message,
        status: error.status || error.statusCode
      });

      onRetry({ attempt, delayMs, error });

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export default {
  isRetryable,
  executeWithRetry
};
