#!/usr/bin/env node

/**
 * ACO Schema Validation Script
 * 
 * Validates generated data against Adobe Commerce Optimizer (ACO) schema requirements.
 * This catches schema violations before attempting ingestion to ACO.
 * 
 * Based on:
 * - ACO API Documentation
 * - GraphQL Schema Definitions
 * - Historical ingestion patterns
 * 
 * Usage:
 *   node scripts/validate-aco-schema.js
 *   npm run validate:schema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.warn(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}━━━ ${msg} ━━━${colors.reset}\n`)
};

// =============================================================================
// ACO Schema Definitions
// =============================================================================

const ACO_SCHEMAS = {
  product: {
    name: 'Product',
    required: ['sku', 'name', 'type'],
    fields: {
      sku: { type: 'string', minLength: 1, maxLength: 64 },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', maxLength: 10000, optional: true },
      type: { enum: ['simple', 'configurable', 'bundle', 'service'] }, // Added 'service' type
      image_url: { type: 'string', optional: true },
      images: { type: 'array', itemType: 'string', optional: true },
      categories: { type: 'array', itemType: 'object', optional: true }, // ACO uses 'categories' not 'categoryIds'
      routes: { type: 'array', itemType: 'object', optional: true },
      attributes: {
        type: 'array',
        optional: true,
        itemSchema: {
          required: ['code'],
          fields: {
            code: { type: 'string', minLength: 1 },
            value: { type: ['string', 'number', 'boolean', 'array'], optional: true },
            values: { type: 'array', optional: true }
          }
        }
      },
      bundles: { type: 'object', optional: true }, // For bundle products
      links: { type: 'array', optional: true } // For variant products
    }
  },

  variant: {
    name: 'Product Variant',
    required: ['sku', 'name'],
    fields: {
      sku: { type: 'string', minLength: 1 },
      name: { type: 'string', minLength: 1 },
      type: { enum: ['simple', 'configurable'], optional: true }, // Type is optional for variants
      links: {
        type: 'array',
        optional: true,
        itemSchema: {
          required: ['sku', 'type'],
          fields: {
            sku: { type: 'string', minLength: 1 },
            type: { enum: ['PARENT', 'CHILD'] }
          }
        }
      },
      options: { type: 'array', optional: true },
      optionValues: { type: 'array', optional: true },
      attributes: { type: 'array', optional: true },
      categories: { type: 'array', optional: true },
      routes: { type: 'array', optional: true }
    }
  },

  bundle: {
    name: 'Product Bundle',
    required: ['sku', 'name'],
    fields: {
      sku: { type: 'string', minLength: 1 },
      name: { type: 'string', minLength: 1 },
      type: { enum: ['bundle'], optional: true }, // Type is optional for bundles
      bundles: {
        type: ['object', 'array'], // Can be array or object depending on structure
        optional: true,
        required: ['groups'],
        fields: {
          groups: {
            type: 'array',
            minItems: 1,
            itemSchema: {
              required: ['group', 'items'],
              fields: {
                group: { type: 'string' },
                required: { type: 'boolean', optional: true },
                multiSelect: { type: 'boolean', optional: true },
                defaultItemSkus: { type: 'array', optional: true },
                items: {
                  type: 'array',
                  minItems: 1,
                  itemSchema: {
                    required: ['sku', 'qty'],
                    fields: {
                      sku: { type: 'string' },
                      qty: { type: 'number', minimum: 1 },
                      userDefinedQty: { type: 'boolean', optional: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      attributes: { type: 'array', optional: true },
      categories: { type: 'array', optional: true },
      routes: { type: 'array', optional: true }
    }
  },

  priceBook: {
    name: 'Price Book',
    required: ['priceBookId', 'name'],
    fields: {
      priceBookId: { type: 'string', minLength: 1, maxLength: 64 },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', maxLength: 1000, optional: true },
      currency: { type: 'string', pattern: /^[A-Z]{3}$/, optional: true }, // Optional in our format
      parentId: { type: 'string', optional: true }
    }
  },

  price: {
    name: 'Price Entry',
    required: ['sku'],
    fields: {
      sku: { type: 'string', minLength: 1 },
      priceBook: { type: 'string', optional: true }, // Our format uses 'priceBook'
      regular: { type: 'number', minimum: 0, optional: true },
      tierPrices: {
        type: 'array',
        optional: true,
        itemSchema: {
          required: ['qty', 'amount'],
          fields: {
            qty: { type: 'number', minimum: 1 },
            amount: { type: 'number', minimum: 0 }
          }
        }
      }
    }
  },

  category: {
    name: 'Category',
    required: ['categoryId', 'name'],
    fields: {
      categoryId: { type: 'string', minLength: 1, maxLength: 64 },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      parentId: { type: 'string', optional: true },
      description: { type: 'string', maxLength: 10000, optional: true },
      urlKey: { type: 'string', optional: true }
    }
  }
};

// =============================================================================
// Validation Functions
// =============================================================================

function validateField(value, fieldDef, fieldPath) {
  const errors = [];

  // Handle optional fields
  if (value === undefined || value === null) {
    if (fieldDef.optional) {
      return [];
    }
    errors.push(`${fieldPath}: Missing required field`);
    return errors;
  }

  // Type validation
  if (fieldDef.type) {
    const types = Array.isArray(fieldDef.type) ? fieldDef.type : [fieldDef.type];
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (!types.includes(actualType)) {
      errors.push(`${fieldPath}: Expected type ${types.join(' or ')}, got ${actualType}`);
      return errors;
    }
  }

  // Enum validation
  if (fieldDef.enum && !fieldDef.enum.includes(value)) {
    errors.push(`${fieldPath}: Value "${value}" not in allowed values: ${fieldDef.enum.join(', ')}`);
  }

  // String validations
  if (typeof value === 'string') {
    if (fieldDef.minLength && value.length < fieldDef.minLength) {
      errors.push(`${fieldPath}: String too short (min ${fieldDef.minLength})`);
    }
    if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
      errors.push(`${fieldPath}: String too long (max ${fieldDef.maxLength})`);
    }
    if (fieldDef.pattern && !fieldDef.pattern.test(value)) {
      errors.push(`${fieldPath}: String doesn't match pattern ${fieldDef.pattern}`);
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (fieldDef.minimum !== undefined && value < fieldDef.minimum) {
      errors.push(`${fieldPath}: Number too small (min ${fieldDef.minimum})`);
    }
    if (fieldDef.maximum !== undefined && value > fieldDef.maximum) {
      errors.push(`${fieldPath}: Number too large (max ${fieldDef.maximum})`);
    }
  }

  // Array validations
  if (Array.isArray(value)) {
    if (fieldDef.minItems && value.length < fieldDef.minItems) {
      errors.push(`${fieldPath}: Array too short (min ${fieldDef.minItems} items)`);
    }
    if (fieldDef.maxItems && value.length > fieldDef.maxItems) {
      errors.push(`${fieldPath}: Array too long (max ${fieldDef.maxItems} items)`);
    }

    // Validate array items
    if (fieldDef.itemType) {
      value.forEach((item, idx) => {
        const itemType = typeof item;
        if (itemType !== fieldDef.itemType) {
          errors.push(`${fieldPath}[${idx}]: Expected ${fieldDef.itemType}, got ${itemType}`);
        }
      });
    }

    // Validate array items against schema
    if (fieldDef.itemSchema) {
      value.forEach((item, idx) => {
        const itemErrors = validateObject(item, fieldDef.itemSchema, `${fieldPath}[${idx}]`);
        errors.push(...itemErrors);
      });
    }
  }

  return errors;
}

function validateObject(obj, schema, basePath = '') {
  const errors = [];

  // Check required fields
  if (schema.required) {
    schema.required.forEach(fieldName => {
      if (!(fieldName in obj)) {
        errors.push(`${basePath}.${fieldName}: Required field missing`);
      }
    });
  }

  // Validate each field
  if (schema.fields) {
    Object.entries(schema.fields).forEach(([fieldName, fieldDef]) => {
      const fieldPath = basePath ? `${basePath}.${fieldName}` : fieldName;
      const fieldValue = obj[fieldName];
      const fieldErrors = validateField(fieldValue, fieldDef, fieldPath);
      errors.push(...fieldErrors);
    });
  }

  return errors;
}

function validateDataFile(filePath, schema) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, errors: [`File not found: ${filePath}`] };
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const items = Array.isArray(data) ? data : [data];
  const allErrors = [];

  items.forEach((item, idx) => {
    const itemErrors = validateObject(item, schema, `[${idx}]`);
    allErrors.push(...itemErrors);
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    itemCount: items.length
  };
}

// =============================================================================
// Main Validation
// =============================================================================

async function main() {
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           ACO Schema Validation                               ║
║           BuildRight Data Validation                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);

  const dataDir = path.join(__dirname, '..', 'data', 'buildright');
  const validations = [
    { file: 'products.json', schema: ACO_SCHEMAS.product },
    { file: 'variants.json', schema: ACO_SCHEMAS.variant },
    { file: 'bundles.json', schema: ACO_SCHEMAS.bundle },
    { file: 'price-books.json', schema: ACO_SCHEMAS.priceBook },
    { file: 'prices.json', schema: ACO_SCHEMAS.price },
    { file: 'categories.json', schema: ACO_SCHEMAS.category }
  ];

  const results = [];
  let totalErrors = 0;

  for (const { file, schema } of validations) {
    const filePath = path.join(dataDir, file);
    log.section(`Validating ${file}`);

    const result = validateDataFile(filePath, schema);
    results.push({ file, ...result });

    if (result.valid) {
      log.success(`${schema.name}: ${result.itemCount} items validated successfully`);
    } else {
      log.error(`${schema.name}: ${result.errors.length} validation errors found`);
      result.errors.slice(0, 10).forEach(err => {
        console.error(`  ${colors.red}•${colors.reset} ${err}`);
      });
      if (result.errors.length > 10) {
        log.warning(`  ... and ${result.errors.length - 10} more errors`);
      }
      totalErrors += result.errors.length;
    }
  }

  // Summary Report
  log.section('Validation Summary');

  const validCount = results.filter(r => r.valid).length;
  const totalCount = results.length;

  console.log(`\n${colors.cyan}Files Validated:${colors.reset} ${totalCount}`);
  console.log(`${colors.green}Passed:${colors.reset} ${validCount}`);
  console.log(`${colors.red}Failed:${colors.reset} ${totalCount - validCount}`);
  console.log(`${colors.yellow}Total Errors:${colors.reset} ${totalErrors}\n`);

  if (totalErrors === 0) {
    log.success('All data files are valid and ready for ACO ingestion! ✨');
    console.log(`
${colors.green}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ✓ VALIDATION PASSED                                          ║
║                                                               ║
║  All generated data conforms to ACO schema requirements.      ║
║  Data is ready for ingestion (subject to server-side rules).  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
    process.exit(0);
  } else {
    log.error('Validation failed. Please fix errors before ingestion.');
    console.log(`
${colors.red}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ✗ VALIDATION FAILED                                          ║
║                                                               ║
║  ${totalErrors} schema violations found.                                 ║
║  Fix errors before attempting ACO ingestion.                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
    process.exit(1);
  }
}

main().catch(err => {
  log.error(`Validation script failed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

