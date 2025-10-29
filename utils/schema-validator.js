/**
 * Schema Validator Utility
 *
 * Validates product, category, and inventory data schemas for ACO operations.
 * Provides field-level validation with clear error messages.
 *
 * @module utils/schema-validator
 *
 * @example
 * import { SchemaValidator } from './schema-validator.js';
 *
 * const product = {
 *   sku: 'PROD-001',
 *   name: 'Test Product',
 *   price: 29.99,
 *   type_id: 'simple'
 * };
 *
 * const result = SchemaValidator.validateProduct(product);
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors);
 * }
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Valid product types in Adobe Commerce
 */
const VALID_PRODUCT_TYPES = ['simple', 'configurable', 'virtual', 'bundle', 'downloadable', 'grouped'];

/**
 * Schema Validator class for ACO data validation
 *
 * Validates:
 * - Product data (SKU, name, price, type, etc.)
 * - Category data (ID, name, parent references)
 * - Inventory data (SKU, quantity, stock status, MSI sources)
 */
export class SchemaValidator {
  /**
   * Validates product data
   * @param {Object} data - Product data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateProduct(data) {
    const errors = [];

    // Handle null/undefined
    if (data == null) {
      errors.push('Product data cannot be null or undefined');
      return { isValid: false, errors };
    }

    // Required fields
    if (!data.sku || data.sku.trim() === '') {
      errors.push('SKU is required');
    }

    if (!data.name || data.name.trim() === '') {
      errors.push('Product name is required');
    }

    // Price validation
    if (data.price !== undefined) {
      if (typeof data.price === 'string') {
        errors.push('Price must be a number, not a string');
      } else if (typeof data.price === 'number' && data.price < 0) {
        errors.push('Product price must be non-negative');
      }
    }

    // Type ID validation
    if (data.type_id !== undefined) {
      if (typeof data.type_id !== 'string') {
        errors.push('type_id must be a string');
      } else if (!VALID_PRODUCT_TYPES.includes(data.type_id)) {
        errors.push(`type_id must be one of: ${VALID_PRODUCT_TYPES.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates category data
   * @param {Object} data - Category data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateCategory(data) {
    const errors = [];

    // Handle null/undefined
    if (data == null) {
      errors.push('Category data cannot be null or undefined');
      return { isValid: false, errors };
    }

    // Required fields
    if (!data.name || data.name.trim() === '') {
      errors.push('Category name is required');
    }

    // Parent ID validation
    if (data.parent_id !== undefined && typeof data.parent_id !== 'string') {
      errors.push('parent_id must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates inventory data
   * @param {Object} data - Inventory data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateInventory(data) {
    const errors = [];

    // Handle null/undefined
    if (data == null) {
      errors.push('Inventory data cannot be null or undefined');
      return { isValid: false, errors };
    }

    // Required fields
    if (!data.sku || data.sku.trim() === '') {
      errors.push('SKU is required');
    }

    // Quantity validation
    if (data.quantity !== undefined) {
      if (typeof data.quantity !== 'number') {
        errors.push('Quantity must be a number');
      } else if (data.quantity < 0) {
        errors.push('Inventory quantity must be non-negative');
      }
    }

    // Stock status validation
    if (data.is_in_stock !== undefined && typeof data.is_in_stock !== 'boolean') {
      errors.push('is_in_stock must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Cache for loaded schemas
const schemaCache = new Map();

/**
 * Validates data against a JSON schema file
 * @param {*} data - Data to validate
 * @param {string} schemaName - Name of the schema ('aco-metadata' or 'aco-category')
 * @returns {Object} Validation result with isValid and errors
 */
export function validateSchema(data, schemaName) {
  try {
    // Load schema from cache or file
    let schema = schemaCache.get(schemaName);
    if (!schema) {
      const schemaPath = path.join(__dirname, '..', 'scripts', 'schemas', `${schemaName}-schema.json`);
      const schemaContent = readFileSync(schemaPath, 'utf8');
      schema = JSON.parse(schemaContent);
      schemaCache.set(schemaName, schema);
    }

    // Basic validation implementation
    // In production, you'd use a proper JSON Schema validator like ajv
    const errors = [];

    // Check if data is array when schema expects array
    if (schema.type === 'array') {
      if (!Array.isArray(data)) {
        errors.push('Data must be an array');
        return { isValid: false, errors };
      }

      // Validate minimum items
      if (schema.minItems && data.length < schema.minItems) {
        errors.push(`Array must have at least ${schema.minItems} items`);
      }

      // Validate each item
      if (schema.items) {
        data.forEach((item, index) => {
          const itemErrors = validateSchemaObject(item, schema.items, `[${index}]`);
          errors.push(...itemErrors);
        });
      }
    } else if (schema.type === 'object') {
      const itemErrors = validateSchemaObject(data, schema, '');
      errors.push(...itemErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Schema validation error: ${error.message}`]
    };
  }
}

/**
 * Validates an object against a schema definition
 * @private
 */
function validateSchemaObject(data, schema, path) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push(`${path} must be an object`);
    return errors;
  }

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`${path}.${field} is required`);
      }
    }
  }

  // Validate properties
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const value = data[key];
        const fieldPath = path ? `${path}.${key}` : key;

        // Skip type validation for undefined values if field is optional
        if (value === undefined && !schema.required?.includes(key)) {
          continue;
        }

        // Type validation
        if (propSchema.type && value !== undefined) {
          const types = Array.isArray(propSchema.type) ? propSchema.type : [propSchema.type];
          const valueType = value === null ? 'null' :
                           Array.isArray(value) ? 'array' :
                           typeof value;

          if (!types.includes(valueType)) {
            errors.push(`${fieldPath} must be of type ${types.join(' or ')}`);
          }
        }

        // Enum validation
        if (propSchema.enum && !propSchema.enum.includes(value)) {
          errors.push(`${fieldPath} must be one of: ${propSchema.enum.join(', ')}`);
        }

        // Pattern validation
        if (propSchema.pattern && typeof value === 'string') {
          const regex = new RegExp(propSchema.pattern);
          if (!regex.test(value)) {
            errors.push(`${fieldPath} does not match pattern ${propSchema.pattern}`);
          }
        }

        // Min/max validation
        if (typeof value === 'number') {
          if (propSchema.minimum !== undefined && value < propSchema.minimum) {
            errors.push(`${fieldPath} must be at least ${propSchema.minimum}`);
          }
          if (propSchema.maximum !== undefined && value > propSchema.maximum) {
            errors.push(`${fieldPath} must be at most ${propSchema.maximum}`);
          }
        }

        // String length validation
        if (typeof value === 'string') {
          if (propSchema.minLength !== undefined && value.length < propSchema.minLength) {
            errors.push(`${fieldPath} must have at least ${propSchema.minLength} characters`);
          }
          if (propSchema.maxLength !== undefined && value.length > propSchema.maxLength) {
            errors.push(`${fieldPath} must have at most ${propSchema.maxLength} characters`);
          }
        }

        // Array validation
        if (Array.isArray(value) && propSchema.items) {
          value.forEach((item, index) => {
            const itemPath = `${fieldPath}[${index}]`;
            if (propSchema.items.type === 'object') {
              const itemErrors = validateSchemaObject(item, propSchema.items, itemPath);
              errors.push(...itemErrors);
            }
          });
        }
      }
    }
  }

  // Check for additional properties
  if (schema.additionalProperties === false) {
    const allowedKeys = new Set(Object.keys(schema.properties || {}));
    for (const key of Object.keys(data)) {
      if (!allowedKeys.has(key)) {
        errors.push(`${path}.${key} is not allowed`);
      }
    }
  }

  return errors;
}
