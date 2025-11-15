#!/usr/bin/env node
/**
 * Ingest Products to Adobe Commerce Optimizer
 *
 * Ingests simple and service products from generated JSON files to ACO
 * using batch processing with retry logic and error handling.
 *
 * @module scripts/ingest-products
 *
 * @example
 * # Ingest all products
 * node scripts/ingest-products.js
 *
 * # Ingest specific file
 * node scripts/ingest-products.js data/buildright/products.json
 *
 * # Dry-run mode (validation only)
 * DRY_RUN=true node scripts/ingest-products.js
 */

import fs from 'fs/promises';
import path from 'path';
import { getACOClient, batchProcess } from '../utils/aco-client.js';
import { executeWithRetry } from '../utils/retry-handler.js';
import {
  createProgressReporter,
  validateProducts,
  formatIngestSummary
} from '../utils/ingest-helpers.js';
import logger from '../utils/logger.js';
import { ingestConfig, validateIngestConfig } from './config/ingest-config.js';

/**
 * Ingest products to ACO with batch processing and retry logic
 *
 * @param {Array<Object>} products - Products to ingest
 * @param {Object} options - Ingest options
 * @param {number} [options.batchSize=100] - Items per batch
 * @param {boolean} [options.dryRun=false] - Validation only, no ingest
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<Object>} Ingest results
 */
export async function ingestProducts(products, options = {}) {
  const config = { ...ingestConfig, ...options };

  logger.info('Product Ingest Started', {
    totalProducts: products.length,
    batchSize: config.batchSize,
    dryRun: config.dryRun
  });

  // Validate products first
  const validation = validateProducts(products);
  if (!validation.valid) {
    logger.error('Product validation failed', { errors: validation.errors });

    if (config.dryRun) {
      return {
        dryRun: true,
        validationPassed: false,
        errors: validation.errors
      };
    }

    throw new Error(`Product validation failed: ${validation.errors.length} errors`);
  }

  // Log persona-specific attributes for verification
  logger.info('Verifying persona-specific attributes in products...');
  const personaAttrs = [
    'construction_phase', 'quality_tier', 'package_tier', 'room_category',
    'deck_compatible', 'deck_shape', 'deck_material_type', 'deck_railing_compatible',
    'store_velocity_category', 'recommended_restock_quantity', 'typical_days_supply', 'restock_priority'
  ];
  
  const attrCounts = {};
  products.forEach(product => {
    product.attributes?.forEach(attr => {
      if (personaAttrs.includes(attr.code)) {
        attrCounts[attr.code] = (attrCounts[attr.code] || 0) + 1;
      }
    });
  });
  
  logger.info('Persona attribute coverage:', attrCounts);

  if (config.dryRun) {
    logger.info('Dry-run mode: validation passed, no ingest performed');
    return {
      dryRun: true,
      validationPassed: true,
      wouldIngest: products.length,
      personaAttributeCoverage: attrCounts
    };
  }

  // Get ACO SDK client
  const client = getACOClient();

  // Use our batch processor from aco-client
  const results = await batchProcess(
    products,
    async (batch) => {
      // Wrap in retry logic
      return await executeWithRetry(
        () => client.createProducts(batch),
        {
          maxRetries: config.maxRetries,
          initialDelayMs: config.initialRetryDelayMs,
          backoffMultiplier: config.retryBackoffMultiplier
        }
      );
    },
    config.batchSize,
    'products'
  );

  logger.info('Product Ingest Complete', results);
  logger.info(formatIngestSummary(results));

  return results;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const productsPath = process.argv[2] || './data/buildright/products.json';

  try {
    // Validate configuration
    validateIngestConfig();

    // Read products file
    logger.info('Reading products from file', { path: productsPath });
    const productsData = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    logger.info(`Loaded ${products.length} products from ${productsPath}`);

    // Ingest products
    const result = await ingestProducts(products);

    if (!result.success && result.failed > 0) {
      logger.error('Ingest completed with errors', {
        ingested: result.ingested,
        failed: result.failed
      });
      process.exit(1);
    }

    logger.info('Ingest successful', {
      ingested: result.ingested,
      failed: result.failed
    });
    process.exit(0);

  } catch (error) {
    logger.error('Product ingest failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
