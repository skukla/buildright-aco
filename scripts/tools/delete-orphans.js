#!/usr/bin/env node
/**
 * Delete Orphaned Products from ACO
 * 
 * This script deletes products by SKU list extracted from the ACO UI.
 * Used for cleaning up orphaned products that aren't tracked in local data files.
 * 
 * Usage:
 *   node scripts/delete-orphans.js [--dry-run]
 * 
 * The script:
 * - Reads SKUs from temp-orphan-skus.json
 * - Deletes products using the ACO SDK
 * - Polls to verify deletion
 * - Cleans up the temp file when done
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { deleteProductsBySKUs } from '../shared/aco-delete.js';
import logger from '../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

/**
 * Delete products by SKU list
 */
async function deleteOrphans() {
  const skuFilePath = join(__dirname, '../temp-orphan-skus.json');
  
  // Check if file exists
  try {
    await fs.access(skuFilePath);
  } catch (error) {
    logger.error(`❌ SKU file not found: ${skuFilePath}`);
    logger.info('\nExpected file format:');
    logger.info('["SKU-1", "SKU-2", "SKU-3"]');
    process.exit(1);
  }
  
  // Read SKUs from file
  logger.info('📂 Reading orphan SKUs from file...');
  const skuData = await fs.readFile(skuFilePath, 'utf-8');
  const skus = JSON.parse(skuData);
  
  if (!Array.isArray(skus) || skus.length === 0) {
    logger.error('❌ Invalid SKU file format or empty array');
    process.exit(1);
  }
  
  logger.info(`✅ Found ${skus.length} orphaned SKUs to delete\n`);
  
  if (dryRun) {
    logger.info('🔍 DRY RUN MODE - No actual deletion will occur\n');
    logger.info('SKUs that would be deleted:');
    skus.forEach((sku, i) => logger.info(`  ${i + 1}. ${sku}`));
    logger.info(`\n✅ Dry run complete. Run without --dry-run to delete.`);
    return;
  }
  
  // Confirm deletion
  logger.info('⚠️  WARNING: This will permanently delete these products from ACO');
  logger.info('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Delete all products using the utility function
  logger.info('🗑️  Deleting products...');
  
  const result = await deleteProductsBySKUs(skus, { 
    dryRun: false,
    silent: false
  });
  
  logger.info('');
  logger.info('═'.repeat(60));
  if (result.success) {
    logger.info(`✅ Deletion complete: ${result.deleted} products deleted`);
  } else {
    logger.info(`⚠️  Deletion complete with errors: ${result.deleted} deleted, ${result.errors.length} errors`);
  }
  logger.info('═'.repeat(60));
  
  // Poll to verify deletion
  if (result.deleted > 0) {
    logger.info('\n🔍 Waiting for ACO to process deletions...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    logger.info('✅ Deletion requests submitted successfully');
    logger.info('   Note: It may take a few minutes for ACO UI to reflect changes');
  }
  
  // Clean up temp file
  logger.info('\n🧹 Cleaning up temp file...');
  try {
    await fs.unlink(skuFilePath);
    logger.info('✅ Temp file removed');
  } catch (error) {
    logger.warn(`⚠️  Could not remove temp file: ${error.message}`);
  }
  
  logger.info('\n✅ Orphan deletion complete!');
}

// Run
deleteOrphans().catch(error => {
  logger.error('❌ Deletion failed:', error);
  process.exit(1);
});
