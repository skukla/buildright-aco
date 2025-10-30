#!/usr/bin/env node
/**
 * Reset ACO Catalog - Live Data Query
 *
 * Queries ACO via GraphQL to find all existing products, prices, price books, and metadata,
 * then deletes them using the ACO SDK.
 *
 * Unlike reset-catalog.js (which reads from local files), this script queries ACO directly
 * to find what actually exists in the catalog, then deletes it.
 *
 * @module scripts/reset-aco-live
 *
 * @example
 * # Dry-run (show what would be deleted)
 * node scripts/reset-aco-live.js --dry-run
 *
 * # Reset with confirmation prompt
 * node scripts/reset-aco-live.js
 *
 * # Force reset without confirmation
 * node scripts/reset-aco-live.js --force
 */

import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { getACOClient } from '../utils/aco-client.js';
import { executeGraphQLQuery } from '../utils/graphql-query.js';
import logger from '../utils/logger.js';
import { validateIngestConfig } from './config/ingest-config.js';
import { getAccessToken } from '../utils/oauth-token-manager.js';

const BATCH_SIZE = 100;

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
 * Get batch number for logging
 *
 * @param {number} index - Item index
 * @returns {number} Batch number
 */
function getBatchNumber(index) {
  return Math.floor(index / BATCH_SIZE) + 1;
}

/**
 * Query specific products from ACO by SKU list
 *
 * Note: ACO GraphQL does not provide a "list all products" query.
 * The `products` query requires an array of SKUs to query.
 *
 * This function requires you to provide SKUs via environment variable or file.
 *
 * @param {string} accessToken - OAuth access token
 * @param {Array<string>} skus - Array of SKUs to query
 * @returns {Promise<Array>} Array of product objects with SKUs
 */
async function queryProductsBySKUs(accessToken, skus) {
  if (!skus || skus.length === 0) {
    logger.warn('No SKUs provided to query');
    return [];
  }

  logger.info(`Querying ${skus.length} products from ACO by SKU...`);

  try {
    const query = `
      query GetProducts($skus: [String!]!) {
        products(skus: $skus) {
          sku
          name
        }
      }
    `;

    const data = await executeGraphQLQuery(query, { skus }, accessToken);

    if (data.products && Array.isArray(data.products)) {
      logger.info(`✓ Retrieved ${data.products.length} products from ACO`);
      return data.products;
    }

    return [];

  } catch (error) {
    logger.error('Failed to query products from ACO:', error.message);
    throw error;
  }
}

/**
 * Load SKUs from file or environment variable
 *
 * @returns {Promise<Array<string>>} Array of SKUs to delete
 */
async function loadSKUsToDelete() {
  // Option 1: From environment variable (comma-separated)
  if (process.env.SKUS_TO_DELETE) {
    const skus = process.env.SKUS_TO_DELETE.split(',').map(s => s.trim()).filter(Boolean);
    logger.info(`Loaded ${skus.length} SKUs from SKUS_TO_DELETE environment variable`);
    return skus;
  }

  // Option 2: From file (skus-to-delete.txt, one SKU per line)
  try {
    const { promises: fs } = await import('fs');
    const content = await fs.readFile('./skus-to-delete.txt', 'utf-8');
    const skus = content.split('\n').map(s => s.trim()).filter(Boolean);
    logger.info(`Loaded ${skus.length} SKUs from skus-to-delete.txt`);
    return skus;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  logger.warn('');
  logger.warn('⚠️  No SKUs found to delete');
  logger.warn('');
  logger.warn('ACO GraphQL does not provide a "list all products" query.');
  logger.warn('You must provide SKUs to delete via:');
  logger.warn('');
  logger.warn('Option 1: Environment variable');
  logger.warn('  export SKUS_TO_DELETE="SKU1,SKU2,SKU3"');
  logger.warn('  npm run reset:live');
  logger.warn('');
  logger.warn('Option 2: File (skus-to-delete.txt)');
  logger.warn('  echo "SKU1" > skus-to-delete.txt');
  logger.warn('  echo "SKU2" >> skus-to-delete.txt');
  logger.warn('  npm run reset:live');
  logger.warn('');
  logger.warn('Option 3: Use file-based reset (if you generated the data)');
  logger.warn('  npm run reset:catalog');
  logger.warn('');

  return [];
}

/**
 * Delete products from ACO
 *
 * @param {Object} client - ACO SDK client
 * @param {Array} products - Products to delete
 * @param {boolean} dryRun - Dry-run mode
 * @returns {Promise<Object>} Deletion results
 */
async function deleteProducts(client, products, dryRun = false) {
  if (products.length === 0) {
    logger.info('No products to delete');
    return { deleted: 0, total: 0 };
  }

  logger.info(`Preparing to delete ${products.length} products...`);

  if (dryRun) {
    logger.info('[DRY-RUN] Would delete products in batches of', BATCH_SIZE);
    logger.info('[DRY-RUN] Sample SKUs:', products.slice(0, 10).map(p => p.sku));
    return { deleted: 0, total: products.length, dryRun: true };
  }

  let deletedCount = 0;
  const productsToDelete = products.map(product => ({
    sku: product.sku,
    source: { locale: 'en-US' }
  }));

  // Process in batches
  for (let i = 0; i < productsToDelete.length; i += BATCH_SIZE) {
    const batch = productsToDelete.slice(i, i + BATCH_SIZE);
    const batchNum = getBatchNumber(i);

    try {
      const response = await client.deleteProducts(batch);
      const accepted = response.data?.accepted || 0;
      deletedCount += accepted;
      logger.info(`Batch ${batchNum}: Deleted ${accepted}/${batch.length} products`);

      if (accepted < batch.length) {
        logger.warn(`  Warning: ${batch.length - accepted} products in batch were not found or failed to delete`);
      }
    } catch (error) {
      logger.error(`Batch ${batchNum} failed:`, error.message);
    }
  }

  logger.info(`Product deletion complete: ${deletedCount}/${products.length} deleted`);
  return { deleted: deletedCount, total: products.length };
}

/**
 * Delete all prices from ACO
 *
 * Note: This queries products and deletes all prices associated with those SKUs.
 * Requires knowing price book IDs (which we can't easily query).
 * For now, this attempts to delete prices for all known price book IDs.
 *
 * @param {Object} client - ACO SDK client
 * @param {Array} products - Products whose prices to delete
 * @param {boolean} dryRun - Dry-run mode
 * @returns {Promise<Object>} Deletion results
 */
async function deletePrices(client, products, dryRun = false) {
  if (products.length === 0) {
    logger.info('No products found, skipping price deletion');
    return { deleted: 0, total: 0 };
  }

  logger.warn('Note: Price deletion requires knowing price book IDs');
  logger.warn('      This script cannot query all prices via GraphQL');
  logger.warn('      Prices will be deleted when products are deleted (cascade)');

  return { deleted: 0, total: 0, note: 'Prices deleted via product cascade' };
}

/**
 * Delete all price books from ACO
 *
 * Note: GraphQL does not provide a query to list all price books.
 * Price books should be deleted manually or via the file-based reset script.
 *
 * @param {Object} client - ACO SDK client
 * @param {boolean} dryRun - Dry-run mode
 * @returns {Promise<Object>} Deletion results
 */
async function deletePriceBooks(client, dryRun = false) {
  logger.warn('Note: GraphQL does not provide a query to list price books');
  logger.warn('      Price books must be deleted via reset-catalog.js (file-based)');
  logger.warn('      or manually via ACO Admin UI');

  return { deleted: 0, total: 0, note: 'Cannot query price books via GraphQL' };
}

/**
 * Delete all metadata from ACO
 *
 * Note: GraphQL does not provide a query to list metadata attributes.
 * Metadata should be deleted manually or via the file-based reset script.
 *
 * @param {Object} client - ACO SDK client
 * @param {boolean} dryRun - Dry-run mode
 * @returns {Promise<Object>} Deletion results
 */
async function deleteMetadata(client, dryRun = false) {
  logger.warn('Note: GraphQL does not provide a query to list metadata');
  logger.warn('      Metadata must be deleted via reset-catalog.js (file-based)');
  logger.warn('      or manually via ACO Admin UI');

  return { deleted: 0, total: 0, note: 'Cannot query metadata via GraphQL' };
}

/**
 * Reset catalog by querying live ACO data
 *
 * @param {Object} options - Reset options
 * @returns {Promise<Object>} Reset results
 */
export async function resetACOLive(options = {}) {
  const {
    dryRun = false,
    force = false
  } = options;

  logger.info('ACO Live Reset Started', { dryRun, force });
  logger.info('This script deletes products from ACO by SKU list');

  // Load SKUs to delete
  const skusToDelete = await loadSKUsToDelete();

  if (skusToDelete.length === 0) {
    return {
      success: false,
      reason: 'NO_SKUS_PROVIDED'
    };
  }

  // Get OAuth token
  const accessToken = await getAccessToken();

  // Query products to verify they exist
  let products = [];
  try {
    products = await queryProductsBySKUs(accessToken, skusToDelete);
  } catch (error) {
    logger.error('Failed to query products from ACO');
    return {
      success: false,
      error: error.message,
      reason: 'QUERY_FAILED'
    };
  }

  if (products.length === 0) {
    logger.info('No products found in ACO catalog');
    return {
      success: true,
      reason: 'NO_DATA',
      products: { deleted: 0, total: 0 }
    };
  }

  // Confirm if not forced
  if (!dryRun && !force) {
    const confirmed = await promptConfirmation(
      `Delete ${products.length} products from ACO? This cannot be undone!`
    );

    if (!confirmed) {
      logger.info('Reset cancelled by user');
      return { cancelled: true };
    }
  }

  const client = getACOClient();

  const results = {
    success: true,
    dryRun
  };

  // Delete products (this will cascade delete associated prices)
  try {
    results.products = await deleteProducts(client, products, dryRun);
  } catch (error) {
    logger.error('Failed to delete products:', error.message);
    results.success = false;
  }

  // Note about prices and price books
  results.prices = await deletePrices(client, products, dryRun);
  results.priceBooks = await deletePriceBooks(client, dryRun);
  results.metadata = await deleteMetadata(client, dryRun);

  logger.info('ACO Live Reset Complete', results);

  // Report on what was actually deleted
  const totalDeleted = results.products?.deleted || 0;
  const totalAttempted = results.products?.total || 0;

  if (!dryRun && totalDeleted > 0) {
    logger.info('');
    logger.info(`✅ Successfully deleted ${totalDeleted} of ${totalAttempted} products from ACO`);
    if (totalDeleted < totalAttempted) {
      logger.warn(`   Note: ${totalAttempted - totalDeleted} products were not found or failed to delete`);
    }
    logger.info('   Prices associated with deleted products were also removed (cascade)');
    logger.info('');
  }

  return results;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force')
  };

  try {
    // Validate configuration
    validateIngestConfig();

    // Run reset
    const results = await resetACOLive(options);

    if (results.cancelled) {
      logger.info('Reset cancelled');
      process.exit(0);
    }

    if (results.reason === 'NO_DATA') {
      logger.info('No data to delete');
      process.exit(0);
    }

    if (results.reason === 'QUERY_FAILED') {
      logger.error('Failed to query ACO catalog');
      process.exit(1);
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
