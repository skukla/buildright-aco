/**
 * Safe JSON Parsing Utilities
 *
 * Provides secure JSON parsing with proper error handling
 * to prevent application crashes from malformed JSON.
 *
 * @module utils/safe-json
 */

import logger from './logger.js';

/**
 * Safely parse JSON with error handling
 *
 * @param {string} jsonString - JSON string to parse
 * @param {string} [context] - Context for error messages
 * @returns {*} Parsed JSON object
 * @throws {Error} If JSON is invalid
 *
 * @example
 * const data = safeJsonParse(jsonString, 'prices.json');
 */
export function safeJsonParse(jsonString, context = 'JSON') {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.error(`Failed to parse ${context}`, {
      error: error.message,
      preview: jsonString.substring(0, 100)
    });
    throw new Error(`Invalid JSON in ${context}: ${error.message}`);
  }
}

/**
 * Safely parse JSON with validation
 *
 * @param {string} jsonString - JSON string to parse
 * @param {Object} options - Parsing options
 * @param {string} [options.context] - Context for error messages
 * @param {string} [options.expectedType] - Expected type ('array' or 'object')
 * @param {Function} [options.validator] - Custom validation function
 * @returns {*} Parsed and validated JSON
 * @throws {Error} If JSON is invalid or validation fails
 *
 * @example
 * const prices = safeJsonParseWithValidation(jsonString, {
 *   context: 'prices.json',
 *   expectedType: 'array',
 *   validator: (data) => data.length > 0
 * });
 */
export function safeJsonParseWithValidation(jsonString, options = {}) {
  const {
    context = 'JSON',
    expectedType = null,
    validator = null
  } = options;

  // Parse JSON
  const data = safeJsonParse(jsonString, context);

  // Type validation
  if (expectedType === 'array' && !Array.isArray(data)) {
    throw new Error(`${context} must contain an array, got ${typeof data}`);
  }

  if (expectedType === 'object' && (typeof data !== 'object' || Array.isArray(data))) {
    throw new Error(`${context} must contain an object, got ${typeof data}`);
  }

  // Custom validation
  if (validator && !validator(data)) {
    throw new Error(`${context} failed validation check`);
  }

  return data;
}

export default {
  safeJsonParse,
  safeJsonParseWithValidation
};