#!/usr/bin/env node
/**
 * Ingest Inventory to Adobe Commerce Optimizer
 *
 * Ingests multi-source inventory quantities to ACO for all products.
 * Each product can have inventory across multiple sources (warehouses).
 *
 * @module scripts/ingest-inventory
 *
 * @example
 * # Ingest all inventory
 * node scripts/ingest-inventory.js
 *
 * # Ingest specific file
 * node scripts/ingest-inventory.js data/buildright/inventory.json
 */

import fs from 'fs/promises';
import { getACOClient, batchProcess } from '../utils/aco-client.js';
import { queryProductsBySKU } from '../utils/graphql-query.js';
import { executeWithRetry } from '../utils/retry-handler.js';
import logger from '../utils/logger.js';
import { ingestConfig, validateIngestConfig } from './config/ingest-config.js';
import { formatIngestSummary } from '../utils/ingest-helpers.js';

/**
 * Transform inventory data to ACO source items format
 *
 * Converts our inventory format to ACO's sourceItems API format.
 * Filters out service products (they don't have inventory).
 *
 * @param {Array<Object>} inventory - Inventory data
 * @returns {Array<Object>} Source items for ACO API
 */
function transformInventoryToSourceItems(inventory) {
  const sourceItems = [];

  for (const item of inventory) {
    // Skip service products (they don't have inventory)
    if (item.sku?.startsWith('SVC-') || item.type === 'service') {
      logger.debug(`Skipping service product: ${item.sku}`);
      continue;
    }

    // Each item can have multiple source assignments
    if (item.sources && Array.isArray(item.sources)) {
      for (const source of item.sources) {
        sourceItems.push({
          sku: item.sku,
          source_code: source.source_code,
          quantity: source.quantity,
          status: source.status || 1 // 1 = in_stock, 0 = out_of_stock
        });
      }
    }
  }

  logger.info(`Transformed ${inventory.length} inventory items into ${sourceItems.length} source items`);

  return sourceItems;
}

/**
 * Validate inventory SKUs exist in ACO
 *
 * @param {Array<Object>} inventory - Inventory data
 * @returns {Promise<Object>} Validation result
 */
async function validateInventorySKUs(inventory) {
  const skus = inventory
    .map(item => item.sku)
    .filter(sku => !sku?.startsWith('SVC-')); // Exclude service products

  if (skus.length === 0) {
    return { valid: true, errors: [] };
  }

  logger.info(`Validating ${skus.length} SKUs exist in ACO...`);

  try {
    // Query ACO in batches (GraphQL has limits)
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
        missing: missingSKUs.slice(0, 10) // Log first 10
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
    throw new Error(`Failed to validate inventory SKUs: ${error.message}`);
  }
}

/**
 * Validate inventory quantities
 *
 * @param {Array<Object>} inventory - Inventory data
 * @returns {Object} Validation result
 */
function validateQuantities(inventory) {
  const errors = [];

  for (const item of inventory) {
    if (!item.sources || !Array.isArray(item.sources)) continue;

    for (const source of item.sources) {
      // Quantity must be non-negative integer
      if (typeof source.quantity !== 'number' || source.quantity < 0) {
        errors.push({
          sku: item.sku,
          source: source.source_code,
          error: `Invalid quantity: ${source.quantity} (must be non-negative integer)`
        });
      }

      if (!Number.isInteger(source.quantity)) {
        errors.push({
          sku: item.sku,
          source: source.source_code,
          error: `Non-integer quantity: ${source.quantity}`
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Ingest inventory to ACO
 *
 * @param {Array<Object>} inventory - Inventory data
 * @param {Object} options - Ingest options
 * @returns {Promise<Object>} Ingest results
 */
export async function ingestInventory(inventory, options = {}) {
  const config = { ...ingestConfig, ...options };

  logger.info('Inventory Ingest Started', {
    totalItems: inventory.length,
    batchSize: config.batchSize,
    dryRun: config.dryRun
  });

  // Validate quantities
  const qtyValidation = validateQuantities(inventory);
  if (!qtyValidation.valid) {
    logger.error('Quantity validation failed', { errors: qtyValidation.errors });
    throw new Error(`Quantity validation failed: ${qtyValidation.errors.length} errors`);
  }

  // Validate SKUs exist in ACO (unless skipped)
  if (!options.skipSKUValidation) {
    const skuValidation = await validateInventorySKUs(inventory);
    if (!skuValidation.valid) {
      throw new Error(
        `SKU validation failed: ${skuValidation.errors.length} SKUs not found in ACO. ` +
        'Ingest products first, or use --skip-validation flag.'
      );
    }
  }

  // Transform to source items format
  const sourceItems = transformInventoryToSourceItems(inventory);

  if (sourceItems.length === 0) {
    logger.warn('No source items to ingest (all items filtered out)');
    return {
      success: true,
      ingested: 0,
      failed: 0,
      errors: []
    };
  }

  if (config.dryRun) {
    logger.info('Dry-run mode: validation passed, no ingest performed');
    return {
      dryRun: true,
      validationPassed: true,
      wouldIngest: sourceItems.length
    };
  }

  // Get ACO SDK client
  const client = getACOClient();

  // Use batch processor
  const results = await batchProcess(
    sourceItems,
    async (batch) => {
      // Wrap in retry logic
      return await executeWithRetry(
        () => client.createInventory(batch),
        {
          maxRetries: config.maxRetries,
          initialDelayMs: config.initialRetryDelayMs,
          backoffMultiplier: config.retryBackoffMultiplier
        }
      );
    },
    config.batchSize,
    'inventory source items'
  );

  logger.info('Inventory Ingest Complete', results);
  logger.info(formatIngestSummary(results));

  return results;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const inventoryPath = process.argv[2] || './data/buildright/inventory.json';
  const skipSKUValidation = process.argv.includes('--skip-validation');

  try {
    // Validate configuration
    validateIngestConfig();

    // Read inventory file
    logger.info('Reading inventory from file', { path: inventoryPath });
    const inventoryData = await fs.readFile(inventoryPath, 'utf8');
    const inventory = JSON.parse(inventoryData);

    logger.info(`Loaded inventory for ${inventory.length} products from ${inventoryPath}`);

    // Ingest inventory
    const result = await ingestInventory(inventory, { skipSKUValidation });

    if (!result.success && result.failed > 0) {
      logger.error('Ingest completed with errors', {
        ingested: result.ingested,
        failed: result.failed
      });
      process.exit(1);
    }

    logger.info('Inventory ingest successful', {
      ingested: result.ingested,
      failed: result.failed
    });
    process.exit(0);

  } catch (error) {
    logger.error('Inventory ingest failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
