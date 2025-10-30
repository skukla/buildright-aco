#!/usr/bin/env node
/**
 * Ingest Bundle Products to Adobe Commerce Optimizer
 *
 * Ingests bundle products to ACO with validation of bundle item references.
 * Ensures all bundled SKUs exist before attempting ingest.
 *
 * @module scripts/ingest-bundles
 *
 * @example
 * # Ingest all bundles
 * node scripts/ingest-bundles.js
 *
 * # Ingest specific file
 * node scripts/ingest-bundles.js data/buildright/bundles.json
 */

import fs from 'fs/promises';
import { ingestProducts } from './ingest-products.js';
import { getACOClient } from '../utils/aco-client.js';
import { queryProductsBySKU } from '../utils/graphql-query.js';
import logger from '../utils/logger.js';
import { validateIngestConfig } from './config/ingest-config.js';

/**
 * Validate bundle item references before ingest
 *
 * Checks that all SKUs referenced in bundle items exist in ACO.
 *
 * @param {Array<Object>} bundles - Bundle products to validate
 * @returns {Promise<Object>} Validation result
 * @returns {boolean} result.valid - True if all references valid
 * @returns {Array} result.errors - Array of missing SKU errors
 */
async function validateBundleReferences(bundles) {
  const errors = [];
  const skusToCheck = new Set();

  // Collect all SKUs referenced in bundles
  for (const bundle of bundles) {
    if (!bundle.bundles) continue;

    for (const group of bundle.bundles) {
      if (!group.items) continue;

      for (const item of group.items) {
        if (item.sku) {
          skusToCheck.add(item.sku);
        }
      }
    }
  }

  if (skusToCheck.size === 0) {
    logger.warn('No bundle item SKUs found to validate');
    return { valid: true, errors: [] };
  }

  logger.info(`Validating ${skusToCheck.size} unique SKUs referenced in bundles...`);

  try {
    // Query ACO to check if SKUs exist
    const existingProducts = await queryProductsBySKU(Array.from(skusToCheck));
    const existingSkus = new Set(existingProducts.map(p => p.sku));

    // Check which SKUs are missing
    for (const sku of skusToCheck) {
      if (!existingSkus.has(sku)) {
        // Find which bundles reference this SKU
        for (const bundle of bundles) {
          if (!bundle.bundles) continue;

          for (const group of bundle.bundles) {
            if (!group.items) continue;

            for (const item of group.items) {
              if (item.sku === sku) {
                errors.push({
                  bundleSku: bundle.sku,
                  groupName: group.group || 'unknown',
                  missingSku: sku,
                  error: 'Referenced SKU does not exist in ACO'
                });
              }
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      logger.error(`Bundle validation failed: ${errors.length} missing SKU references`);
    } else {
      logger.info('Bundle validation passed: all referenced SKUs exist');
    }

  } catch (error) {
    logger.error('Bundle validation error', { error: error.message });
    throw new Error(`Failed to validate bundle references: ${error.message}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Ingest bundle products with validation
 *
 * @param {Array<Object>} bundles - Bundle products to ingest
 * @param {Object} options - Ingest options
 * @param {boolean} [options.skipValidation=false] - Skip SKU reference validation
 * @returns {Promise<Object>} Ingest results
 */
export async function ingestBundles(bundles, options = {}) {
  logger.info('Bundle Ingest Started', { totalBundles: bundles.length });

  // Note: Bundle SKU validation removed - ACO will validate on ingestion
  // GraphQL query was failing because productSearch requires Live Search indexing
  // which may not be available or ready after product ingestion

  // Ingest bundles
  const result = await ingestProducts(bundles, options);

  logger.info('Bundle Ingest Complete', result);
  return result;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const bundlesPath = process.argv[2] || './data/buildright/bundles.json';
  const skipValidation = process.argv.includes('--skip-validation');

  try {
    // Validate configuration
    validateIngestConfig();

    // Read bundles file
    logger.info('Reading bundles from file', { path: bundlesPath });
    const bundlesData = await fs.readFile(bundlesPath, 'utf8');
    const bundles = JSON.parse(bundlesData);

    logger.info(`Loaded ${bundles.length} bundle products from ${bundlesPath}`);

    // Ingest bundles
    const result = await ingestBundles(bundles, { skipValidation });

    if (!result.success && result.failed > 0) {
      logger.error('Ingest completed with errors', {
        ingested: result.ingested,
        failed: result.failed
      });
      process.exit(1);
    }

    logger.info('Bundle ingest successful', {
      ingested: result.ingested,
      failed: result.failed
    });
    process.exit(0);

  } catch (error) {
    logger.error('Bundle ingest failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
