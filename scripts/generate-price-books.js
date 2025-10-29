#!/usr/bin/env node

/**
 * Generate Price Books Script
 * Creates 4 flat business-type price books for BuildRight ACO
 * Replaces the previous 12-book hierarchical structure with a simplified model
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger('generate-price-books');

/**
 * Business type configuration with discount percentages
 * @constant {Array<{type: string, discount: number, name: string}>}
 */
const BUSINESS_TYPE_CONFIG = [
  { type: 'RETAIL', discount: 0.00, name: 'Retail' },
  { type: 'CONTRACTOR', discount: 0.05, name: 'Contractor' },
  { type: 'COMMERCIAL', discount: 0.10, name: 'Commercial' },
  { type: 'WHOLESALE', discount: 0.15, name: 'Wholesale' }
];

/**
 * Generates exactly 4 price books with business-type structure.
 * Creates a flat structure (no hierarchy) with one price book per business type.
 *
 * @returns {Array<Object>} Array of price book objects with the following structure:
 *   - id {string} - Unique identifier in format US_[BUSINESS_TYPE]
 *   - name {string} - Human-readable name
 *   - description {string} - Price book description
 *   - businessType {string} - Business type (RETAIL, CONTRACTOR, COMMERCIAL, WHOLESALE)
 *   - discountPercentage {number} - Discount percentage for this business type
 *   - region {string} - Always 'US' for United States
 *   - currency {string} - Always 'USD'
 *   - effectiveDate {string} - Date when price book becomes active
 *   - status {string} - Always 'ACTIVE'
 *   - isDefault {boolean} - True for RETAIL, false for others
 */
export function generatePriceBooks() {
  const priceBooks = [];

  // Generate 4 flat price books (no hierarchy)
  BUSINESS_TYPE_CONFIG.forEach(({ type, discount, name }) => {
    priceBooks.push({
      id: `US_${type}`,
      name: `US ${name} Price Book`,
      description: `Price book for ${type.toLowerCase()} business type`,
      businessType: type,
      discountPercentage: discount,
      region: 'US',
      currency: 'USD',
      effectiveDate: '2024-01-01',
      status: 'ACTIVE',
      isDefault: type === 'RETAIL'
    });
  });

  return priceBooks;
}

/**
 * Validates price book structure for the flat business-type model.
 * Ensures exactly 4 price books exist with correct business types and no hierarchy.
 *
 * @param {Array<Object>} priceBooks - Array of price books to validate
 * @returns {Object} Validation result containing:
 *   - valid {boolean} - True if validation passes, false otherwise
 *   - errors {Array<string>} - Array of validation error messages
 */
export function validatePriceBookHierarchy(priceBooks) {
  const errors = [];
  const priceBookIds = new Set(priceBooks.map(pb => pb.id));

  // Check for exactly 4 price books
  if (priceBooks.length !== 4) {
    errors.push(`Invalid price book count: Expected exactly 4 price books, found ${priceBooks.length}`);
  }

  // Check for unique IDs
  if (priceBookIds.size !== priceBooks.length) {
    errors.push('Validation error: Duplicate price book IDs detected');
  }

  // Check for required business types
  const expectedTypes = BUSINESS_TYPE_CONFIG.map(config => config.type);
  const actualTypes = priceBooks.map(pb => pb.businessType).sort();

  expectedTypes.forEach(type => {
    if (!actualTypes.includes(type)) {
      errors.push(`Missing required business type: ${type}. Each business type must have exactly one price book`);
    }
  });

  // Validate no hierarchy fields exist (should be flat structure)
  priceBooks.forEach(pb => {
    if ('parentId' in pb) {
      errors.push(`Structure error in ${pb.id}: 'parentId' field found but flat structure requires no parent references`);
    }
    if ('level' in pb) {
      errors.push(`Structure error in ${pb.id}: 'level' field found but flat structure has no hierarchy levels`);
    }
    if ('tier' in pb || 'discountTier' in pb) {
      errors.push(`Structure error in ${pb.id}: Loyalty tier fields found but new model uses business types instead`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculates the maximum depth of the price book structure.
 * For the new flat business-type model, this always returns 1.
 *
 * @param {Array<Object>} priceBooks - Array of price books (unused in flat model)
 * @returns {number} Always returns 1 for flat structure
 */
export function calculateHierarchyDepth(priceBooks) {
  // Flat structure has depth of 1 (no hierarchy)
  // Parameter kept for backward compatibility with tests
  return 1;
}

/**
 * Main execution function
 * Generates price books and writes them to the output file
 */
async function main() {
  logger.info('Starting price book generation...');

  try {
    // Generate price books
    logger.info('Generating price books...');
    const priceBooks = generatePriceBooks();
    logger.info(`Generated ${priceBooks.length} price books`);

    // Validate structure
    logger.info('Validating price book structure...');
    const validation = validatePriceBookHierarchy(priceBooks);

    if (!validation.valid) {
      logger.error('Price book validation failed:', validation.errors);
      process.exit(1);
    }

    logger.info('Price book validation passed');

    // Calculate and log stats
    const depth = calculateHierarchyDepth(priceBooks);
    const businessTypeCounts = {};
    priceBooks.forEach(pb => {
      businessTypeCounts[pb.businessType] = (businessTypeCounts[pb.businessType] || 0) + 1;
    });

    logger.info(`Structure depth: ${depth} (flat)`);
    logger.info('Price books per business type:', businessTypeCounts);

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'data/buildright');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logger.info(`Created output directory: ${outputDir}`);
    }

    // Write to file
    const outputPath = path.join(outputDir, 'price-books.json');
    fs.writeFileSync(outputPath, JSON.stringify(priceBooks, null, 2));
    logger.info(`Price books written to ${outputPath}`);

    // Log summary
    logger.info('Price book generation complete:');
    logger.info(`  Total price books: ${priceBooks.length}`);
    logger.info(`  Structure: Flat (depth ${depth})`);
    logger.info(`  Business types: ${Object.keys(businessTypeCounts).join(', ')}`);

  } catch (error) {
    logger.error('Error generating price books:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}