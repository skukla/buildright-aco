/**
 * Error Handler Utility
 *
 * Categorizes errors, determines retry eligibility, and formats error messages
 * for ACO API operations. Provides structured error handling with retry logic support.
 *
 * @module utils/error-handler
 *
 * @example
 * import { ErrorHandler, ErrorCategory } from './error-handler.js';
 *
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const category = ErrorHandler.categorize(error);
 *   const canRetry = ErrorHandler.isRetryable(error);
 *   const formatted = ErrorHandler.format(error);
 *
 *   if (canRetry) {
 *     // Retry logic
 *   } else {
 *     // Log and fail
 *     console.error(formatted);
 *   }
 * }
 */

/**
 * Error categories for ACO operations
 *
 * Categories:
 * - VALIDATION_ERROR: Data validation failures (not retryable)
 * - AUTH_ERROR: Authentication/authorization failures (not retryable)
 * - NOT_FOUND_ERROR: Resource not found (not retryable)
 * - RATE_LIMIT_ERROR: API rate limit exceeded (retryable)
 * - SERVER_ERROR: Server-side errors 5xx (retryable)
 * - UNKNOWN_ERROR: Unclassified errors (not retryable)
 */
export const ErrorCategory = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Error Handler class for categorizing and formatting errors
 */
export class ErrorHandler {
  /**
   * Categorizes an error based on its properties
   * @param {Error} error - The error to categorize
   * @returns {string} Error category
   */
  static categorize(error) {
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return ErrorCategory.VALIDATION_ERROR;
    }

    // Check HTTP status codes
    if (error.status) {
      if (error.status === 401 || error.status === 403) {
        return ErrorCategory.AUTH_ERROR;
      }
      if (error.status === 404) {
        return ErrorCategory.NOT_FOUND_ERROR;
      }
      if (error.status === 429) {
        return ErrorCategory.RATE_LIMIT_ERROR;
      }
      if (error.status >= 500) {
        return ErrorCategory.SERVER_ERROR;
      }
    }

    return ErrorCategory.UNKNOWN_ERROR;
  }

  /**
   * Determines if an error is retryable
   * @param {Error} error - The error to check
   * @returns {boolean} True if error is retryable
   */
  static isRetryable(error) {
    const category = ErrorHandler.categorize(error);

    // Only retry rate limits and server errors
    return category === ErrorCategory.RATE_LIMIT_ERROR ||
           category === ErrorCategory.SERVER_ERROR;
  }

  /**
   * Formats an error with structured information
   * @param {Error} error - The error to format
   * @returns {Object} Formatted error object
   */
  static format(error) {
    const formatted = {
      message: error.message,
      category: ErrorHandler.categorize(error),
      isRetryable: ErrorHandler.isRetryable(error),
      timestamp: new Date().toISOString()
    };

    // Add status code if available
    if (error.status) {
      formatted.status = error.status;
    }

    // Add error code if available
    if (error.code) {
      formatted.code = error.code;
    }

    // Add additional details if available
    if (error.details) {
      formatted.details = error.details;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && error.stack) {
      formatted.stack = error.stack;
    }

    return formatted;
  }
}
