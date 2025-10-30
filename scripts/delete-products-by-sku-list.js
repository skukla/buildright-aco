#!/usr/bin/env node
/**
 * Delete Products by SKU List
 *
 * Deletes products from ACO by reading SKUs from a text file or environment variable.
 * This is useful when you know the SKUs but cannot query them via GraphQL
 * (e.g., Live Search index not ready).
 *
 * @module scripts/delete-products-by-sku-list
 *
 * @example
 * # From file (one SKU per line)
 * node scripts/delete-products-by-sku-list.js skus.txt
 *
 * # From environment variable (comma-separated)
 * export SKUS_TO_DELETE="SKU1,SKU2,SKU3"
 * node scripts/delete-products-by-sku-list.js
 *
 * # Dry-run mode
 * node scripts/delete-products-by-sku-list.js skus.txt --dry-run
 */

import { promises as fs } from 'fs';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { getACOClient } from '../utils/aco-client.js';
import logger from '../utils/logger.js';
import { validateIngestConfig } from './config/ingest-config.js';

const BATCH_SIZE = 100;
const DEFAULT_LOCALE = 'en-US';

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
 * Load SKUs from file
 *
 * @param {string} filePath - Path to file containing SKUs (one per line)
 * @returns {Promise<string[]>} Array of SKUs
 */
async function loadSKUsFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const skus = content
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    logger.info(`Loaded ${skus.length} SKUs from ${filePath}`);
    return skus;
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.error(`File not found: ${filePath}`);
    } else {
      logger.error(`Failed to read file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load SKUs from environment variable
 *
 * @returns {string[]} Array of SKUs
 */
function loadSKUsFromEnv() {
  const skusEnv = process.env.SKUS_TO_DELETE;
  if (!skusEnv) {
    return [];
  }

  const skus = skusEnv
    .split(',')
    .map(sku => sku.trim())
    .filter(Boolean);

  logger.info(`Loaded ${skus.length} SKUs from SKUS_TO_DELETE environment variable`);
  return skus;
}

/**
 * Delete products by SKU list
 *
 * @param {Object} client - ACO SDK client
 * @param {string[]} skus - Array of SKUs to delete
 * @param {string} locale - Source locale (default: 'en-US')
 * @param {boolean} dryRun - Dry-run mode
 * @returns {Promise<Object>} Deletion results
 */
async function deleteProductsBySKUs(client, skus, locale = DEFAULT_LOCALE, dryRun = false) {
  if (skus.length === 0) {
    logger.info('No SKUs to delete');
    return { deleted: 0, total: 0 };
  }

  logger.info(`Preparing to delete ${skus.length} products...`);
  logger.info(`Source locale: ${locale}`);

  if (dryRun) {
    logger.info('[DRY-RUN] Would delete products in batches of', BATCH_SIZE);
    logger.info('[DRY-RUN] Sample SKUs:', skus.slice(0, 10));
    return { deleted: 0, total: skus.length, dryRun: true };
  }

  let deletedCount = 0;
  const productsToDelete = skus.map(sku => ({
    sku,
    source: { locale }
  }));

  // Process in batches
  for (let i = 0; i < productsToDelete.length; i += BATCH_SIZE) {
    const batch = productsToDelete.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    try {
      const response = await client.deleteProducts(batch);
      const accepted = response.data?.acceptedCount || 0;
      deletedCount += accepted;
      logger.info(`Batch ${batchNum}: Deleted ${accepted}/${batch.length} products`);

      if (accepted < batch.length) {
        logger.warn(`  Warning: ${batch.length - accepted} products in batch were not found or failed to delete`);
      }
    } catch (error) {
      logger.error(`Batch ${batchNum} failed:`, error.message);
    }
  }

  logger.info(`Product deletion complete: ${deletedCount}/${skus.length} deleted`);
  return { deleted: deletedCount, total: skus.length };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const forceDelete = args.includes('--force');

  // Get file path or use env
  const filePathArg = args.find(arg => !arg.startsWith('--'));
  let skus = [];

  if (filePathArg) {
    skus = await loadSKUsFromFile(filePathArg);
  } else {
    skus = loadSKUsFromEnv();
  }

  if (skus.length === 0) {
    logger.error('');
    logger.error('No SKUs provided.');
    logger.error('');
    logger.error('Usage:');
    logger.error('  node scripts/delete-products-by-sku-list.js <file-path> [--dry-run] [--force]');
    logger.error('  node scripts/delete-products-by-sku-list.js --dry-run');
    logger.error('');
    logger.error('Examples:');
    logger.error('  # From file');
    logger.error('  node scripts/delete-products-by-sku-list.js skus.txt');
    logger.error('');
    logger.error('  # From environment variable');
    logger.error('  export SKUS_TO_DELETE="SKU1,SKU2,SKU3"');
    logger.error('  node scripts/delete-products-by-sku-list.js');
    logger.error('');
    logger.error('  # Dry-run to preview what would be deleted');
    logger.error('  node scripts/delete-products-by-sku-list.js skus.txt --dry-run');
    logger.error('');
    process.exit(1);
  }

  logger.info('Delete Products by SKU List');
  logger.info('Mode:', dryRun ? 'DRY-RUN' : 'LIVE');
  logger.info('Total SKUs:', skus.length);
  logger.info('');

  // Validate configuration
  validateIngestConfig();

  // Get confirmation if not forced and not dry-run
  if (!dryRun && !forceDelete) {
    const confirmed = await promptConfirmation(
      `Delete ${skus.length} products from ACO? This cannot be undone!`
    );

    if (!confirmed) {
      logger.info('Deletion cancelled by user');
      process.exit(0);
    }
  }

  const client = getACOClient();

  try {
    const results = await deleteProductsBySKUs(client, skus, DEFAULT_LOCALE, dryRun);

    logger.info('');
    if (dryRun) {
      logger.info(`[DRY-RUN] Would delete ${results.total} products`);
    } else {
      logger.info(`✅ Successfully deleted ${results.deleted} of ${results.total} products from ACO`);
      if (results.deleted < results.total) {
        logger.warn(`   Note: ${results.total - results.deleted} products were not found or failed to delete`);
      }
    }
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('Deletion failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error('Script failed:', error);
    process.exit(1);
  });
}

export { deleteProductsBySKUs, loadSKUsFromFile, loadSKUsFromEnv };
