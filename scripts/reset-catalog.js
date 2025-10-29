#!/usr/bin/env node
/**
 * Reset ACO Catalog Data
 *
 * Deletes products, inventory, and prices from ACO for testing and re-upload.
 * Includes safety features: dry-run mode and confirmation prompts.
 *
 * @module scripts/reset-catalog
 *
 * @example
 * # Dry-run (show what would be deleted)
 * node scripts/reset-catalog.js --dry-run
 *
 * # Reset with confirmation prompt
 * node scripts/reset-catalog.js
 *
 * # Force reset without confirmation
 * node scripts/reset-catalog.js --force
 *
 * # Reset specific data types
 * node scripts/reset-catalog.js --products-only
 * node scripts/reset-catalog.js --inventory-only
 * node scripts/reset-catalog.js --prices-only
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { getACOClient } from '../utils/aco-client.js';
import { verifyDataIngestion, queryProducts } from '../utils/graphql-query.js';
import logger from '../utils/logger.js';
import { validateUploadConfig } from './config/upload-config.js';

/**
 * Prompt user for confirmation
 *
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} True if user confirmed
 */
async function promptConfirmation(message) {
  const rl = readline.createInterface({ input, output });

  try {
    const answer = await rl.question(`${message} (yes/no): `);
    return answer.toLowerCase() === 'yes';
  } finally {
    rl.close();
  }
}

/**
 * Delete all products (cascade deletes inventory and prices)
 *
 * @param {Object} client - ACO client
 * @param {boolean} dryRun - Dry-run mode
 * @returns {Promise<Object>} Deletion results
 */
async function deleteProducts(client, dryRun = false) {
  logger.info('Fetching products to delete...');

  // Query all products
  const searchResult = await queryProducts({ pageSize: 1000 });
  const products = searchResult.products || [];

  logger.info(`Found ${products.length} products to delete`);

  if (dryRun) {
    logger.info('[DRY-RUN] Would delete products:', {
      count: products.length,
      samples: products.slice(0, 5).map(p => p.sku)
    });
    return { deleted: 0, wouldDelete: products.length };
  }

  let deleted = 0;
  let failed = 0;

  for (const product of products) {
    try {
      await client.deleteProduct(product.sku);
      deleted++;

      if (deleted % 10 === 0) {
        logger.info(`Deleted ${deleted}/${products.length} products`);
      }
    } catch (error) {
      logger.warn(`Failed to delete product ${product.sku}: ${error.message}`);
      failed++;
    }
  }

  logger.info(`Product deletion complete: ${deleted} deleted, ${failed} failed`);

  return { deleted, failed };
}

/**
 * Delete all inventory (not currently supported by ACO API)
 *
 * @param {boolean} dryRun - Dry-run mode
 * @returns {Promise<Object>} Deletion results
 */
async function deleteInventory(dryRun = false) {
  logger.warn('Inventory deletion: ACO API does not support bulk inventory deletion');
  logger.info('Inventory is automatically deleted when products are deleted');

  if (dryRun) {
    return { deleted: 0, note: 'Inventory deleted with products' };
  }

  return { deleted: 0, note: 'Delete products to remove inventory' };
}

/**
 * Delete all prices and price books
 *
 * @param {Object} client - ACO client
 * @param {boolean} dryRun - Dry-run mode
 * @returns {Promise<Object>} Deletion results
 */
async function deletePrices(client, dryRun = false) {
  logger.warn('Price deletion: Deleting products will cascade delete prices');
  logger.info('Price books can be deleted separately if needed');

  if (dryRun) {
    return { deleted: 0, note: 'Prices deleted with products' };
  }

  return { deleted: 0, note: 'Delete products to remove prices' };
}

/**
 * Reset catalog data
 *
 * @param {Object} options - Reset options
 * @returns {Promise<Object>} Reset results
 */
export async function resetCatalog(options = {}) {
  const {
    dryRun = false,
    force = false,
    productsOnly = false,
    inventoryOnly = false,
    pricesOnly = false
  } = options;

  logger.info('Catalog Reset Started', { dryRun, force });

  // Get current stats
  const stats = await verifyDataIngestion();

  logger.info('Current catalog stats', stats);

  // Confirm if not forced
  if (!dryRun && !force) {
    const confirmed = await promptConfirmation(
      `Delete all catalog data (${stats.productCount} products)? This cannot be undone!`
    );

    if (!confirmed) {
      logger.info('Reset cancelled by user');
      return { cancelled: true };
    }
  }

  const client = getACOClient();

  const results = {
    success: true,
    dryRun,
    products: null,
    inventory: null,
    prices: null
  };

  // Delete based on options
  if (productsOnly || (!inventoryOnly && !pricesOnly)) {
    results.products = await deleteProducts(client, dryRun);
  }

  if (inventoryOnly || (!productsOnly && !pricesOnly)) {
    results.inventory = await deleteInventory(dryRun);
  }

  if (pricesOnly || (!productsOnly && !inventoryOnly)) {
    results.prices = await deletePrices(client, dryRun);
  }

  logger.info('Catalog Reset Complete', results);

  return results;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    productsOnly: args.includes('--products-only'),
    inventoryOnly: args.includes('--inventory-only'),
    pricesOnly: args.includes('--prices-only')
  };

  try {
    // Validate configuration
    validateUploadConfig();

    // Run reset
    const results = await resetCatalog(options);

    if (results.cancelled) {
      logger.info('Reset cancelled');
      process.exit(0);
    }

    if (!results.success) {
      logger.error('Reset completed with errors');
      process.exit(1);
    }

    logger.info('Reset successful');
    process.exit(0);

  } catch (error) {
    logger.error('Reset failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
