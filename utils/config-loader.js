/**
 * Config Loader
 *
 * Loads and validates configuration with defaults for ACO operations.
 * Extends config-validator with additional ACO-specific settings.
 *
 * @module utils/config-loader
 */

import { validateConfig } from './config-validator.js';

/**
 * Default values for optional configuration
 */
const DEFAULTS = {
  BATCH_SIZE: 10,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  REQUEST_TIMEOUT: 30000, // 30 seconds
  LOG_LEVEL: 'info'
};

/**
 * Valid log levels
 */
const VALID_LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

/**
 * Parses an integer from environment variable
 * @param {string} value - The value to parse
 * @param {string} fieldName - The field name for error messages
 * @returns {number} Parsed integer
 * @throws {Error} If value is not a valid integer
 */
function parseInteger(value, fieldName) {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid integer`);
  }
  return parsed;
}

/**
 * Validates ACO-specific configuration fields
 * @param {Object} config - Configuration to validate
 * @throws {Error} If validation fails
 */
function validateAcoConfig(config) {
  // Validate batch size
  if (config.BATCH_SIZE <= 0) {
    throw new Error('BATCH_SIZE must be greater than 0');
  }

  // Validate max retries
  if (config.MAX_RETRIES < 0) {
    throw new Error('MAX_RETRIES must be non-negative');
  }

  // Validate log level
  if (!VALID_LOG_LEVELS.includes(config.LOG_LEVEL)) {
    throw new Error(`Invalid log level: must be one of ${VALID_LOG_LEVELS.join(', ')}`);
  }
}

/**
 * Validates configuration with defaults applied
 * @param {Object} customConfig - Custom configuration object
 * @returns {Object} Validation result with config
 */
export function validateConfigWithDefaults(customConfig) {
  // Apply defaults
  const config = {
    ...DEFAULTS,
    ...customConfig
  };

  // Validate base config (ACO credentials)
  const baseValidation = validateConfig(config);
  if (!baseValidation.isValid) {
    return {
      isValid: false,
      errors: baseValidation.errors,
      config: null
    };
  }

  try {
    validateAcoConfig(config);
    return {
      isValid: true,
      errors: [],
      config
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message],
      config: null
    };
  }
}

/**
 * Loads configuration from environment variables with defaults
 * @returns {Object} Validated configuration
 * @throws {Error} If validation fails
 */
export function loadConfig() {
  // Load from environment with defaults
  const config = {
    ACO_API_KEY: process.env.ACO_API_KEY,
    ACO_ENVIRONMENT_ID: process.env.ACO_ENVIRONMENT_ID,
    ACO_API_BASE_URL: process.env.ACO_API_BASE_URL,
    LOG_LEVEL: process.env.LOG_LEVEL || DEFAULTS.LOG_LEVEL
  };

  // Parse numeric values with defaults
  config.BATCH_SIZE = process.env.BATCH_SIZE
    ? parseInteger(process.env.BATCH_SIZE, 'BATCH_SIZE')
    : DEFAULTS.BATCH_SIZE;

  config.MAX_RETRIES = process.env.MAX_RETRIES
    ? parseInteger(process.env.MAX_RETRIES, 'MAX_RETRIES')
    : DEFAULTS.MAX_RETRIES;

  config.RETRY_DELAY = process.env.RETRY_DELAY
    ? parseInteger(process.env.RETRY_DELAY, 'RETRY_DELAY')
    : DEFAULTS.RETRY_DELAY;

  config.REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT
    ? parseInteger(process.env.REQUEST_TIMEOUT, 'REQUEST_TIMEOUT')
    : DEFAULTS.REQUEST_TIMEOUT;

  // Validate
  const validation = validateConfigWithDefaults(config);

  if (!validation.isValid) {
    throw new Error(
      `Configuration validation failed:\n${validation.errors.join('\n')}`
    );
  }

  return validation.config;
}
