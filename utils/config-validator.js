/**
 * Configuration Validator
 *
 * Validates and loads environment configuration for Adobe Commerce Order (ACO) integration.
 * Ensures all required environment variables are present and properly formatted.
 *
 * @module utils/config-validator
 *
 * @example
 * import { loadConfig, validateConfig } from './config-validator.js';
 *
 * // Load and validate configuration from environment
 * const config = loadConfig();
 * console.log('API Key:', config.ACO_API_KEY);
 *
 * // Or validate a custom configuration object
 * const result = validateConfig({
 *   ACO_API_KEY: 'your-key',
 *   ACO_ENVIRONMENT_ID: 'your-env',
 *   ACO_API_BASE_URL: 'https://catalog-service.adobe.io'
 * });
 * console.log('Valid:', result.isValid);
 */

import dotenv from 'dotenv';

// Load environment variables from .env file if it exists
dotenv.config();

/**
 * Required environment variables for ACO integration
 */
const REQUIRED_VARS = [
  'ACO_API_KEY',
  'ACO_ENVIRONMENT_ID',
  'ACO_API_BASE_URL'
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_VARS = {
  LOG_LEVEL: 'info'
};

/**
 * Validates if a string is a valid URL
 * @param {string} urlString - The URL string to validate
 * @returns {boolean} True if valid URL, false otherwise
 */
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Validates a configuration object against required environment variables
 *
 * Checks that all required variables are present and properly formatted.
 * URL validation ensures ACO_API_BASE_URL uses http:// or https:// protocol.
 *
 * @param {Object} config - Configuration object to validate
 * @param {string} config.ACO_API_KEY - Adobe Commerce Order API key
 * @param {string} config.ACO_ENVIRONMENT_ID - ACO environment identifier
 * @param {string} config.ACO_API_BASE_URL - Base URL for ACO API (must be valid http/https URL)
 * @param {string} [config.LOG_LEVEL] - Optional log level (debug, info, warn, error)
 *
 * @returns {Object} Validation result
 * @returns {boolean} result.isValid - True if all validations pass
 * @returns {string[]} result.errors - Array of error messages (empty if valid)
 *
 * @example
 * const result = validateConfig({
 *   ACO_API_KEY: 'key-123',
 *   ACO_ENVIRONMENT_ID: 'prod-env',
 *   ACO_API_BASE_URL: 'https://api.example.com'
 * });
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors);
 * }
 */
export function validateConfig(config) {
  const errors = [];

  // Check for required variables
  for (const varName of REQUIRED_VARS) {
    if (!config[varName] || config[varName].trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate URL format for ACO_API_BASE_URL
  if (config.ACO_API_BASE_URL && !isValidUrl(config.ACO_API_BASE_URL)) {
    errors.push('ACO_API_BASE_URL must be a valid URL (http:// or https://)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Loads and validates configuration from environment variables
 *
 * Reads environment variables (from process.env or .env file) and validates them.
 * Throws an error if any required variables are missing or invalid.
 *
 * @returns {Object} Validated configuration object
 * @returns {string} config.ACO_API_KEY - Adobe Commerce Order API key
 * @returns {string} config.ACO_ENVIRONMENT_ID - ACO environment identifier
 * @returns {string} config.ACO_API_BASE_URL - Base URL for ACO API
 * @returns {string} config.LOG_LEVEL - Log level (defaults to 'info')
 *
 * @throws {Error} If required environment variables are missing
 * @throws {Error} If ACO_API_BASE_URL is not a valid URL
 *
 * @example
 * // Set environment variables first:
 * // ACO_API_KEY=your-key
 * // ACO_ENVIRONMENT_ID=prod-env
 * // ACO_API_BASE_URL=https://catalog-service.adobe.io
 *
 * const config = loadConfig();
 * console.log('Connected to:', config.ACO_API_BASE_URL);
 */
export function loadConfig() {
  const config = {
    ACO_API_KEY: process.env.ACO_API_KEY,
    ACO_ENVIRONMENT_ID: process.env.ACO_ENVIRONMENT_ID,
    ACO_API_BASE_URL: process.env.ACO_API_BASE_URL,
    LOG_LEVEL: process.env.LOG_LEVEL || OPTIONAL_VARS.LOG_LEVEL
  };

  const validation = validateConfig(config);

  if (!validation.isValid) {
    throw new Error(
      `Configuration validation failed:\n${validation.errors.join('\n')}`
    );
  }

  return config;
}
