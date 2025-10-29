#!/usr/bin/env node
/**
 * Ingest Prices to Adobe Commerce Optimizer
 *
 * Ingests product prices across all price books with batch processing.
 * Supports base prices, tier pricing, and volume discounts.
 *
 * @module scripts/ingest-prices
 *
 * @example
 * # Ingest all prices
 * node scripts/ingest-prices.js
 *
 * # Ingest specific file
 * node scripts/ingest-prices.js data/buildright/prices.json
 */

import fs from 'fs/promises';
import { getACOClient, batchProcess } from '../utils/aco-client.js';
import { queryProductsBySKU } from '../utils/graphql-query.js';
import { executeWithRetry } from '../utils/retry-handler.js';
import logger from '../utils/logger.js';
import { ingestConfig, validateIngestConfig } from './config/ingest-config.js';
import { formatIngestSummary } from '../utils/ingest-helpers.js';

/**
 * Validate price SKUs exist in ACO
 *
 * @param {Array<Object>} prices - Price data
 * @returns {Promise<Object>} Validation result
 */
async function validatePriceSKUs(prices) {
  const skus = [...new Set(prices.map(p => p.sku))];

  if (skus.length === 0) {
    return { valid: true, errors: [] };
  }

  logger.info(`Validating ${skus.length} unique SKUs exist in ACO...`);

  try {
    // Query ACO in batches
    const batchSize = 50;
    const existingSkus = new Set();

    for (let i = 0; i < skus.length; i += batchSize) {
      const batch = skus.slice(i, i + batchSize);
      const products = await queryProductsBySKU(batch);
      products.forEach(p => existingSkus.add(p.sku));
    }

    // Find missing SKUs
    const missingSKUs = skus.filter(sku => !existingSkus.has(sku));

    if (missingSKUs.length > 0) {
      logger.error(`${missingSKUs.length} SKUs not found in ACO`, {
        missing: missingSKUs.slice(0, 10)
      });

      return {
        valid: false,
        errors: missingSKUs.map(sku => ({
          sku,
          error: 'SKU does not exist in ACO'
        }))
      };
    }

    logger.info('SKU validation passed: all SKUs exist in ACO');
    return { valid: true, errors: [] };

  } catch (error) {
    logger.error('SKU validation error', { error: error.message });
    throw new Error(`Failed to validate price SKUs: ${error.message}`);
  }
}

/**
 * Validate price data
 *
 * @param {Array<Object>} prices - Price data
 * @returns {Object} Validation result
 */
function validatePrices(prices) {
  const errors = [];

  for (const price of prices) {
    // Required fields
    if (!price.sku) {
      errors.push({ sku: 'UNKNOWN', error: 'SKU is required' });
      continue;
    }

    if (!price.priceBookId) {
      errors.push({ sku: price.sku, error: 'priceBookId is required' });
    }

    if (typeof price.amount !== 'number' || price.amount < 0) {
      errors.push({
        sku: price.sku,
        error: `Invalid amount: ${price.amount} (must be non-negative number)`
      });
    }

    // Validate tier prices if present
    if (price.tierPrices && Array.isArray(price.tierPrices)) {
      for (const tierPrice of price.tierPrices) {
        if (typeof tierPrice.qty !== 'number' || tierPrice.qty <= 0) {
          errors.push({
            sku: price.sku,
            error: `Invalid tier price qty: ${tierPrice.qty}`
          });
        }

        if (typeof tierPrice.amount !== 'number' || tierPrice.amount < 0) {
          errors.push({
            sku: price.sku,
            error: `Invalid tier price amount: ${tierPrice.amount}`
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Ingest prices to ACO
 *
 * @param {Array<Object>} prices - Price data
 * @param {Object} options - Ingest options
 * @returns {Promise<Object>} Ingest results
 */
export async function ingestPrices(prices, options = {}) {
  const config = { ...ingestConfig, ...options };

  logger.info('Price Ingest Started', {
    totalPrices: prices.length,
    batchSize: config.batchSize,
    dryRun: config.dryRun
  });

  // Validate price data
  const priceValidation = validatePrices(prices);
  if (!priceValidation.valid) {
    logger.error('Price validation failed', { errors: priceValidation.errors });
    throw new Error(`Price validation failed: ${priceValidation.errors.length} errors`);
  }

  // Validate SKUs exist in ACO (unless skipped)
  if (!options.skipSKUValidation) {
    const skuValidation = await validatePriceSKUs(prices);
    if (!skuValidation.valid) {
      throw new Error(
        `SKU validation failed: ${skuValidation.errors.length} SKUs not found in ACO. ` +
        'Ingest products first, or use --skip-validation flag.'
      );
    }
  }

  if (config.dryRun) {
    logger.info('Dry-run mode: validation passed, no ingest performed');
    return {
      dryRun: true,
      validationPassed: true,
      wouldIngest: prices.length
    };
  }

  // Get ACO SDK client
  const client = getACOClient();

  // Use batch processor
  const results = await batchProcess(
    prices,
    async (batch) => {
      // Wrap in retry logic
      return await executeWithRetry(
        () => client.createPrices(batch),
        {
          maxRetries: config.maxRetries,
          initialDelayMs: config.initialRetryDelayMs,
          backoffMultiplier: config.retryBackoffMultiplier
        }
      );
    },
    config.batchSize,
    'prices'
  );

  logger.info('Price Ingest Complete', results);
  logger.info(formatIngestSummary(results));

  return results;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const pricesPath = process.argv[2] || './data/buildright/prices.json';
  const skipSKUValidation = process.argv.includes('--skip-validation');

  try {
    // Validate configuration
    validateIngestConfig();

    // Read prices file
    logger.info('Reading prices from file', { path: pricesPath });
    const pricesData = await fs.readFile(pricesPath, 'utf8');
    const prices = JSON.parse(pricesData);

    logger.info(`Loaded ${prices.length} prices from ${pricesPath}`);

    // Ingest prices
    const result = await ingestPrices(prices, { skipSKUValidation });

    if (!result.success && result.failed > 0) {
      logger.error('Ingest completed with errors', {
        ingested: result.ingested,
        failed: result.failed
      });
      process.exit(1);
    }

    logger.info('Price ingest successful', {
      ingested: result.ingested,
      failed: result.failed
    });
    process.exit(0);

  } catch (error) {
    logger.error('Price ingest failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
