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
 * Hierarchical price book structure configuration (3 levels)
 * @constant {Object}
 */
const PRICE_BOOK_HIERARCHY = {
  // Level 1: Base price books (PriceBookBase - have currency)
  base: [
    {
      priceBookId: 'US-Retail',
      name: 'US Retail Price Book',
      currency: 'USD'
    },
    {
      priceBookId: 'US-Contract',
      name: 'US Contract Price Book',
      currency: 'USD'
    }
  ],

  // Level 2: Customer segment price books (PriceBookChild - have parentId)
  segments: [
    {
      priceBookId: 'Retail-Consumer',
      name: 'Retail Consumer Price Book',
      parentId: 'US-Retail'
    },
    {
      priceBookId: 'Contract-Commercial',
      name: 'Commercial Contract Price Book',
      parentId: 'US-Contract'
    },
    {
      priceBookId: 'Contract-Residential',
      name: 'Residential Contract Price Book',
      parentId: 'US-Contract'
    },
    {
      priceBookId: 'Contract-Pro',
      name: 'Pro Contractor Price Book',
      parentId: 'US-Contract'
    }
  ],

  // Level 3: Volume tier price books (PriceBookChild - have parentId to level-2)
  tiers: [
    {
      priceBookId: 'Commercial-Tier1',
      name: 'Commercial Volume Tier 1',
      parentId: 'Contract-Commercial'
    },
    {
      priceBookId: 'Commercial-Tier2',
      name: 'Commercial Volume Tier 2',
      parentId: 'Contract-Commercial'
    },
    {
      priceBookId: 'Residential-Builder',
      name: 'Production Builder Price Book',
      parentId: 'Contract-Residential'
    },
    {
      priceBookId: 'Pro-Specialty',
      name: 'Specialty Trade Price Book',
      parentId: 'Contract-Pro'
    }
  ]
};

/**
 * Generates 10 hierarchical price books with 3-level structure.
 *
 * ACO Price Book Schema:
 *   PriceBookBase (Level 1):
 *     - priceBookId {string} - Unique identifier (required)
 *     - name {string} - Human-readable name (required)
 *     - currency {string} - ISO currency code (required)
 *
 *   PriceBookChild (Levels 2-3):
 *     - priceBookId {string} - Unique identifier (required)
 *     - name {string} - Human-readable name (required)
 *     - parentId {string} - References parent price book (required)
 *     - NO currency field (inherited from root)
 *
 * @returns {Array<Object>} Array of price book objects matching ACO FeedPricebook schema
 */
export function generatePriceBooks() {
  const priceBooks = [];

  // Level 1: Base price books (PriceBookBase)
  PRICE_BOOK_HIERARCHY.base.forEach(baseBook => {
    priceBooks.push({
      priceBookId: baseBook.priceBookId,
      name: baseBook.name,
      currency: baseBook.currency
    });
  });

  // Level 2: Customer segment price books (PriceBookChild)
  PRICE_BOOK_HIERARCHY.segments.forEach(segmentBook => {
    priceBooks.push({
      priceBookId: segmentBook.priceBookId,
      name: segmentBook.name,
      parentId: segmentBook.parentId
    });
  });

  // Level 3: Volume tier price books (PriceBookChild)
  PRICE_BOOK_HIERARCHY.tiers.forEach(tierBook => {
    priceBooks.push({
      priceBookId: tierBook.priceBookId,
      name: tierBook.name,
      parentId: tierBook.parentId
    });
  });

  return priceBooks;
}

/**
 * Validates hierarchical price book structure for ACO compliance.
 * Ensures 10 total books with proper hierarchy (2 base + 4 level-2 + 4 level-3).
 *
 * @param {Array<Object>} priceBooks - Array of price books to validate
 * @returns {Object} Validation result containing:
 *   - valid {boolean} - True if validation passes, false otherwise
 *   - errors {Array<string>} - Array of validation error messages
 */
export function validatePriceBookHierarchy(priceBooks) {
  const errors = [];
  const priceBookIds = new Set(priceBooks.map(pb => pb.priceBookId));

  // Check for unique priceBookIds
  if (priceBookIds.size !== priceBooks.length) {
    errors.push('Validation error: Duplicate price book IDs detected');
  }

  // Validate required fields for each price book
  priceBooks.forEach(pb => {
    if (!pb.priceBookId) {
      errors.push(`Missing required field 'priceBookId' in price book`);
    }
    if (!pb.name) {
      errors.push(`Missing required field 'name' in price book ${pb.priceBookId}`);
    }

    // Base book validation (no parentId)
    if (!pb.parentId) {
      if (!pb.currency) {
        errors.push(`Missing required field 'currency' in base price book ${pb.priceBookId}`);
      }
    } else {
      // Child book validation (has parentId)
      if (pb.currency) {
        errors.push(`Child price book ${pb.priceBookId} should not have 'currency' field (inherited from parent)`);
      }

      // Validate parent reference exists
      if (!priceBookIds.has(pb.parentId)) {
        errors.push(`Invalid parent reference in ${pb.priceBookId}: parent '${pb.parentId}' does not exist`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculates the maximum depth of the price book hierarchy.
 * Recursively traverses parent references to find deepest level.
 *
 * @param {Array<Object>} priceBooks - Array of price books
 * @returns {number} Maximum hierarchy depth (1 for flat, 3 for full hierarchy)
 */
export function calculateHierarchyDepth(priceBooks) {
  if (priceBooks.length === 0) return 0;

  /**
   * Recursively calculates depth of a single price book
   * @param {string} priceBookId - Price book ID to calculate depth for
   * @param {Set<string>} visited - Set of visited IDs (circular reference protection)
   * @returns {number} Depth of this price book (1 = base, 2 = child, 3 = grandchild)
   */
  function getDepth(priceBookId, visited = new Set()) {
    if (visited.has(priceBookId)) return 0; // Circular reference detected
    visited.add(priceBookId);

    const book = priceBooks.find(pb => pb.priceBookId === priceBookId);
    if (!book) return 0; // Book not found
    if (!book.parentId) return 1; // Base book (level 1)

    return 1 + getDepth(book.parentId, visited);
  }

  // Find maximum depth across all books
  let maxDepth = 0;
  for (const book of priceBooks) {
    const depth = getDepth(book.priceBookId);
    maxDepth = Math.max(maxDepth, depth);
  }

  return maxDepth;
}

/**
 * Generates visual hierarchy tree string for logging
 * @param {Array<Object>} priceBooks - Array of price books
 * @returns {Array<string>} Array of formatted hierarchy lines
 */
function generateHierarchyTree(priceBooks) {
  const lines = [];
  const baseBooks = priceBooks.filter(pb => !pb.parentId);

  baseBooks.forEach((base, baseIdx) => {
    const isLastBase = baseIdx === baseBooks.length - 1;
    lines.push(`${base.priceBookId} (${base.currency})`);

    const level2Children = priceBooks.filter(pb => pb.parentId === base.priceBookId);

    level2Children.forEach((child2, child2Idx) => {
      const isLastChild2 = child2Idx === level2Children.length - 1;
      const child2Prefix = isLastChild2 ? '  └─' : '  ├─';
      lines.push(`${child2Prefix} ${child2.priceBookId}`);

      const level3Children = priceBooks.filter(pb => pb.parentId === child2.priceBookId);

      level3Children.forEach((child3, child3Idx) => {
        const isLastChild3 = child3Idx === level3Children.length - 1;
        const child3Prefix = isLastChild2 ? '     ' : '  │  ';
        const child3Connector = isLastChild3 ? '└─' : '├─';
        lines.push(`${child3Prefix}${child3Connector} ${child3.priceBookId}`);
      });
    });

    if (!isLastBase) {
      lines.push(''); // Empty line between base book trees
    }
  });

  return lines;
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

    // Calculate and log hierarchy stats
    const depth = calculateHierarchyDepth(priceBooks);
    const baseBooks = priceBooks.filter(pb => !pb.parentId);
    const level2Books = priceBooks.filter(pb => pb.parentId && ['US-Retail', 'US-Contract'].includes(pb.parentId));
    const level3Books = priceBooks.filter(pb => pb.parentId && !['US-Retail', 'US-Contract'].includes(pb.parentId));

    logger.info(`Hierarchy depth: ${depth} levels`);
    logger.info('Price book distribution:');
    logger.info(`  Level 1 (Base): ${baseBooks.length} books`);
    logger.info(`  Level 2 (Segments): ${level2Books.length} books`);
    logger.info(`  Level 3 (Tiers): ${level3Books.length} books`);

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

    // Log hierarchy structure visually
    logger.info('Price book hierarchy:');
    const hierarchyLines = generateHierarchyTree(priceBooks);
    hierarchyLines.forEach(line => logger.info(`  ${line}`));

    logger.info('');
    logger.info('Price book generation complete:');
    logger.info(`  Total price books: ${priceBooks.length}`);
    logger.info(`  Structure: Hierarchical (${depth} levels)`);
    logger.info(`  Base books: ${baseBooks.length}, Child books: ${level2Books.length + level3Books.length}`);

  } catch (error) {
    logger.error('Error generating price books:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}