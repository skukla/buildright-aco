/**
 * Post-Generation Validation
 * 
 * Validates generated data files for:
 * - File existence
 * - Valid JSON
 * - Expected entity counts
 * - Data integrity (relationships between entities)
 * 
 * Catches errors immediately after generation, before ingestion.
 * 
 * @module utils/generation-validation
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', 'data', 'buildright');

/**
 * Load and parse JSON file
 */
async function loadJSON(filename) {
  const filepath = join(DATA_DIR, filename);
  const content = await fs.readFile(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Validate data integrity - check relationships between entities
 */
function validateDataIntegrity(data) {
  const errors = [];
  
  // Build product SKU index
  const productSkus = new Set(data.products.map(p => p.sku));
  
  // Check: All variants reference valid parent products
  const orphanedVariants = data.variants.filter(v => {
    const parentSku = v.parentSku || v.parent_sku;
    return parentSku && !productSkus.has(parentSku);
  });
  
  if (orphanedVariants.length > 0) {
    errors.push(`${orphanedVariants.length} variants reference non-existent parent products`);
    orphanedVariants.slice(0, 3).forEach(v => {
      errors.push(`  - Variant ${v.sku} references parent ${v.parentSku || v.parent_sku}`);
    });
  }
  
  // Build all SKU index (products + variants)
  const allSkus = new Set([
    ...data.products.map(p => p.sku),
    ...data.variants.map(v => v.sku)
  ]);
  
  // Check: All prices reference valid SKUs
  const orphanedPrices = data.prices.filter(p => !allSkus.has(p.sku));
  
  if (orphanedPrices.length > 0) {
    errors.push(`${orphanedPrices.length} prices reference non-existent SKUs`);
    orphanedPrices.slice(0, 3).forEach(p => {
      errors.push(`  - Price for SKU ${p.sku} (product doesn't exist)`);
    });
  }
  
  return errors;
}

/**
 * Validate generated data
 */
export async function validateGeneratedData() {
  logger.info('');
  logger.info('🔍 Validating generated data...');
  logger.info('');
  
  const checks = [];
  const data = {};
  
  try {
    // Check products.json
    try {
      data.products = await loadJSON('products.json');
      const count = data.products.length;
      
      if (count < 1 || count > 500) {
        checks.push({
          passed: false,
          name: 'Products count',
          message: `Product count ${count} outside expected range (1-500)`
        });
      } else {
        checks.push({
          passed: true,
          name: 'Products',
          message: `${count} products generated`
        });
      }
    } catch (error) {
      checks.push({
        passed: false,
        name: 'Products file',
        message: `Failed to load: ${error.message}`
      });
    }
    
    // Check variants.json
    try {
      data.variants = await loadJSON('variants.json');
      const count = data.variants.length;
      
      if (count < 1 || count > 1000) {
        checks.push({
          passed: false,
          name: 'Variants count',
          message: `Variant count ${count} outside expected range (1-1000)`
        });
      } else {
        checks.push({
          passed: true,
          name: 'Variants',
          message: `${count} variants generated`
        });
      }
    } catch (error) {
      checks.push({
        passed: false,
        name: 'Variants file',
        message: `Failed to load: ${error.message}`
      });
    }
    
    // Check metadata.json
    try {
      data.metadata = await loadJSON('metadata.json');
      const count = data.metadata.length;
      
      if (count < 1 || count > 100) {
        checks.push({
          passed: false,
          name: 'Metadata count',
          message: `Metadata count ${count} outside expected range (1-100)`
        });
      } else {
        checks.push({
          passed: true,
          name: 'Metadata',
          message: `${count} attributes generated`
        });
      }
    } catch (error) {
      checks.push({
        passed: false,
        name: 'Metadata file',
        message: `Failed to load: ${error.message}`
        });
    }
    
    // Check price-books.json
    try {
      data.priceBooks = await loadJSON('price-books.json');
      const count = data.priceBooks.length;
      
      checks.push({
        passed: true,
        name: 'Price Books',
        message: `${count} price books generated`
      });
    } catch (error) {
      checks.push({
        passed: false,
        name: 'Price Books file',
        message: `Failed to load: ${error.message}`
      });
    }
    
    // Check prices.json
    try {
      data.prices = await loadJSON('prices.json');
      const count = data.prices.length;
      
      if (count < 1 || count > 10000) {
        checks.push({
          passed: false,
          name: 'Prices count',
          message: `Price count ${count} outside expected range (1-10000)`
        });
      } else {
        checks.push({
          passed: true,
          name: 'Prices',
          message: `${count} prices generated`
        });
      }
    } catch (error) {
      checks.push({
        passed: false,
        name: 'Prices file',
        message: `Failed to load: ${error.message}`
      });
    }
    
    // Data integrity checks (only if all files loaded)
    if (data.products && data.variants && data.prices) {
      const integrityErrors = validateDataIntegrity(data);
      
      if (integrityErrors.length > 0) {
        checks.push({
          passed: false,
          name: 'Data Integrity',
          message: integrityErrors.join('\n  ')
        });
      } else {
        checks.push({
          passed: true,
          name: 'Data Integrity',
          message: 'All relationships valid'
        });
      }
    }
    
    // Report results
    const allPassed = checks.every(check => check.passed);
    
    checks.forEach(check => {
      if (check.passed) {
        logger.info(`  ✓ ${check.name}: ${check.message}`);
      } else {
        logger.error(`  ✗ ${check.name}: ${check.message}`);
      }
    });
    
    if (!allPassed) {
      logger.error('');
      logger.error('❌ Generated data validation FAILED');
      logger.error('Fix generation issues before ingestion');
      throw new Error('Generated data validation failed');
    }
    
    logger.info('');
    logger.info('✅ Generated data validation PASSED');
    logger.info('');
    
    return { passed: true, checks, data };
    
  } catch (error) {
    if (error.message === 'Generated data validation failed') {
      throw error;
    }
    
    logger.error('Validation error:', error);
    throw new Error(`Validation failed: ${error.message}`);
  }
}

export default validateGeneratedData;

