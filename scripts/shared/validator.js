/**
 * JSON Schema Validator Wrapper
 * Provides a simple interface for validating JSON against schemas
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // Add support for formats like email, date-time, etc.

/**
 * Validate data against a JSON schema
 * @param {*} data - Data to validate
 * @param {Object} schema - JSON schema
 * @returns {Object} Validation result with { valid: boolean, errors: Array }
 */
export function validateAgainstSchema(data, schema) {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      return { valid: true, errors: [] };
    }

    // Format errors for better readability
    const errors = (validate.errors || []).map(error => {
      const path = error.instancePath || '/';
      const message = error.message || 'validation error';
      return `${path}: ${message}`;
    });

    return { valid: false, errors };
  } catch (error) {
    return {
      valid: false,
      errors: [`Schema compilation error: ${error.message}`]
    };
  }
}