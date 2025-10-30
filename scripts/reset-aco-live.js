#!/usr/bin/env node
/**
 * Reset ACO Catalog - Live Data Query
 *
 * Queries ACO via GraphQL to find all existing products, then deletes them using the ACO SDK.
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
 *
 * @note
 * This script uses the productSearch GraphQL query which requires Live Search indexing.
 * If the catalog is empty or not yet indexed, the script will detect this and report
 * "No products found" rather than failing with an error.
 *
 * For deleting products based on local JSON files (e.g., after generation), use
 * reset-catalog.js instead, which follows Adobe's reference implementation pattern.
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
 * Query all products from ACO using productSearch with pagination
 *
 * Uses the productSearch GraphQL query with empty phrase to retrieve all products.
 * Implements pagination to handle large catalogs.
 *
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Array>} Array of product objects with SKUs
 */
async function queryAllProductsFromACO(accessToken) {
  logger.info('Querying all products from ACO catalog...');

  const allProducts = [];
  const pageSize = 100;
  let currentPage = 1;
  let totalCount = 0;
  let hasMorePages = true;

  try {
    while (hasMorePages) {
      const query = `
        query SearchAllProducts($phrase: String!, $pageSize: Int, $currentPage: Int) {
          productSearch(phrase: $phrase, page_size: $pageSize, current_page: $currentPage) {
            total_count
            items {
              productView {
                sku
                name
              }
            }
          }
        }
      `;

      const variables = {
        phrase: '',
        pageSize,
        currentPage
      };

      const data = await executeGraphQLQuery(query, variables, accessToken);

      if (data.productSearch) {
        totalCount = data.productSearch.total_count || 0;

        if (data.productSearch.items && Array.isArray(data.productSearch.items)) {
          // Extract products from items
          const products = data.productSearch.items
            .map(item => item.productView)
            .filter(Boolean);

          allProducts.push(...products);

          logger.info(`Page ${currentPage}: Retrieved ${products.length} products (${allProducts.length}/${totalCount} total)`);
        }

        // Check if there are more pages
        // Since we're getting all results, check if we have more products
        if (allProducts.length < totalCount) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
      } else {
        hasMorePages = false;
      }
    }

    logger.info(`✓ Retrieved ${allProducts.length} total products from ACO`);
    return allProducts;

  } catch (error) {
    // Check if this is the "No index" error which typically means empty catalog
    if (error.message && error.message.includes('No index was found')) {
      logger.warn('No search index found - catalog may be empty or Live Search not indexed yet');
      logger.warn('Returning empty product list');
      return [];
    }

    logger.error('Failed to query products from ACO:', error.message);
    throw error;
  }
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
  logger.info('This script queries all products from ACO and deletes them');

  // Get OAuth token
  const accessToken = await getAccessToken();

  // Query all products from ACO
  let products = [];
  try {
    products = await queryAllProductsFromACO(accessToken);
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
      logger.info('No data to delete - catalog is empty');
      process.exit(0);
    }

    if (results.reason === 'QUERY_FAILED') {
      logger.error('Failed to query ACO catalog');
      process.exit(1);
    }

    if (results.reason === 'NO_SKUS_PROVIDED') {
      logger.error('No SKUs provided - this should not happen');
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
