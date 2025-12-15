#!/usr/bin/env node
/**
 * Validate Ingested Data in Adobe Commerce Optimizer
 *
 * Verifies that products, inventory, and prices were successfully ingested to ACO.
 * Generates comprehensive validation reports.
 *
 * @module scripts/validate-ingest
 *
 * @example
 * # Validate all data
 * node scripts/validate-ingest.js --all
 *
 * # Validate products only
 * node scripts/validate-ingest.js --products
 *
 * # Validate inventory only
 * node scripts/validate-ingest.js --inventory
 *
 * # Validate prices only
 * node scripts/validate-ingest.js --prices
 */

import fs from 'fs/promises';
import { queryProductsBySKU, verifyDataIngestion } from '../shared/graphql-query.js';
import logger from '../shared/logger.js';
import { validateIngestConfig } from './config/ingest-config.js';

/**
 * Validate products exist in ACO
 *
 * @param {Array<string>} skus - SKUs to validate
 * @returns {Promise<Object>} Validation results
 */
async function validateProducts(skus) {
  logger.info(`Validating ${skus.length} products...`);

  const batchSize = 50;
  const found = new Set();
  const missing = [];

  for (let i = 0; i < skus.length; i += batchSize) {
    const batch = skus.slice(i, i + batchSize);
    const products = await queryProductsBySKU(batch);
    products.forEach(p => found.add(p.sku));
  }

  for (const sku of skus) {
    if (!found.has(sku)) {
      missing.push(sku);
    }
  }

  const successRate = ((found.size / skus.length) * 100).toFixed(1);

  logger.info(`Product validation complete: ${found.size}/${skus.length} found (${successRate}%)`);

  if (missing.length > 0) {
    logger.warn(`Missing products: ${missing.length}`, {
      missing: missing.slice(0, 10)
    });
  }

  return {
    total: skus.length,
    found: found.size,
    missing: missing.length,
    missingSkus: missing,
    successRate: parseFloat(successRate)
  };
}

/**
 * Validate data ingestion
 *
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Validation results
 */
export async function validateIngest(options = {}) {
  logger.info('Ingest Validation Started');

  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    products: null,
    inventory: null,
    prices: null
  };

  try {
    // Get overall stats from ACO
    const stats = await verifyDataIngestion();

    logger.info('ACO Catalog Stats', stats);

    // Validate products if requested
    if (options.products || options.all) {
      const productsPath = './data/buildright/products.json';
      const variantsPath = './data/buildright/variants.json';
      const bundlesPath = './data/buildright/bundles.json';

      const skus = [];

      // Load all SKUs to validate
      try {
        const productsData = JSON.parse(await fs.readFile(productsPath, 'utf8'));
        skus.push(...productsData.map(p => p.sku));
      } catch (e) {
        logger.warn(`Could not load ${productsPath}`);
      }

      try {
        const variantsData = JSON.parse(await fs.readFile(variantsPath, 'utf8'));
        skus.push(...variantsData.map(p => p.sku));
      } catch (e) {
        logger.warn(`Could not load ${variantsPath}`);
      }

      try {
        const bundlesData = JSON.parse(await fs.readFile(bundlesPath, 'utf8'));
        skus.push(...bundlesData.map(p => p.sku));
      } catch (e) {
        logger.warn(`Could not load ${bundlesPath}`);
      }

      if (skus.length > 0) {
        results.products = await validateProducts(skus);
        if (results.products.successRate < 100) {
          results.success = false;
        }
      }
    }

    // Validate inventory if requested
    if (options.inventory || options.all) {
      logger.info('Inventory validation: Checking catalog stats');
      results.inventory = {
        note: 'Inventory validation requires ACO MSI API - showing catalog stats only',
        stats
      };
    }

    // Validate prices if requested
    if (options.prices || options.all) {
      logger.info('Price validation: Checking catalog stats');
      results.prices = {
        note: 'Price validation requires ACO pricing API - showing catalog stats only',
        priceBookCount: stats.priceBookCount
      };
    }

    logger.info('Ingest Validation Complete', {
      success: results.success,
      products: results.products ? `${results.products.successRate}%` : 'skipped',
      catalogStats: stats
    });

  } catch (error) {
    logger.error('Validation failed', { error: error.message });
    results.success = false;
    results.error = error.message;
  }

  return results;
}

/**
 * Generate validation report
 *
 * @param {Object} results - Validation results
 * @param {string} format - Report format ('json' or 'text')
 * @param {string} outputPath - Output file path
 */
async function generateReport(results, format, outputPath) {
  if (format === 'json') {
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    logger.info(`JSON report written to ${outputPath}`);
  } else {
    const lines = [
      '========================================',
      'Ingest Validation Report',
      '========================================',
      `Timestamp: ${results.timestamp}`,
      `Overall Success: ${results.success ? 'PASS' : 'FAIL'}`,
      ''
    ];

    if (results.products) {
      lines.push('Products:');
      lines.push(`  Total: ${results.products.total}`);
      lines.push(`  Found: ${results.products.found}`);
      lines.push(`  Missing: ${results.products.missing}`);
      lines.push(`  Success Rate: ${results.products.successRate}%`);

      if (results.products.missingSkus.length > 0) {
        lines.push('');
        lines.push('  Missing SKUs:');
        results.products.missingSkus.slice(0, 20).forEach(sku => {
          lines.push(`    - ${sku}`);
        });
        if (results.products.missingSkus.length > 20) {
          lines.push(`    ... and ${results.products.missingSkus.length - 20} more`);
        }
      }
      lines.push('');
    }

    if (results.inventory) {
      lines.push('Inventory:');
      lines.push(`  ${results.inventory.note}`);
      lines.push('');
    }

    if (results.prices) {
      lines.push('Prices:');
      lines.push(`  ${results.prices.note}`);
      lines.push(`  Price Books: ${results.prices.priceBookCount}`);
      lines.push('');
    }

    lines.push('========================================');

    await fs.writeFile(outputPath, lines.join('\n'));
    logger.info(`Text report written to ${outputPath}`);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    all: args.includes('--all'),
    products: args.includes('--products'),
    inventory: args.includes('--inventory'),
    prices: args.includes('--prices'),
    outputJson: args.includes('--output-json'),
    outputText: args.includes('--output-text')
  };

  // Default to --all if no specific validation requested
  if (!options.products && !options.inventory && !options.prices) {
    options.all = true;
  }

  try {
    // Validate configuration
    validateIngestConfig();

    // Run validation
    const results = await validateIngest(options);

    // Generate reports if requested
    if (options.outputJson) {
      await generateReport(results, 'json', './validation-report.json');
    }

    if (options.outputText) {
      await generateReport(results, 'text', './validation-report.txt');
    }

    // Exit with appropriate code
    if (!results.success) {
      logger.error('Validation failed');
      process.exit(1);
    }

    logger.info('Validation successful');
    process.exit(0);

  } catch (error) {
    logger.error('Validation error', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
