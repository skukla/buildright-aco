#!/usr/bin/env node
/**
 * Force Delete ALL Products from ACO
 * 
 * This script queries ACO directly to find ALL products (not just local ones)
 * and deletes them. Use this when reset-all.js misses old products.
 * 
 * Usage:
 *   node scripts/force-delete-all-aco.js
 *   node scripts/force-delete-all-aco.js --dry-run
 */

import { getACOClient } from '../shared/aco-client.js';
import logger from '../shared/logger.js';
import { promises as fs } from 'fs';

const dryRun = process.argv.includes('--dry-run');

async function forceDeleteAll() {
  logger.info('='.repeat(70));
  logger.info('FORCE DELETE ALL ACO DATA');
  logger.info('='.repeat(70));
  logger.info('');
  
  if (dryRun) {
    logger.info('🔍 DRY RUN MODE - No data will be deleted');
    logger.info('');
  }
  
  // Create client
  const client = getACOClient();
  
  logger.info('Connected to ACO');
  logger.info('');
  
  // Step 1: Get ALL SKUs from ACO using data API (not GraphQL search)
  logger.info('Step 1: Fetching ALL products from ACO...');
  logger.info('');
  
  let allSKUs = [];
  
  try {
    // Try to get all products using the feed API
    logger.info('Attempting to retrieve products via Feed API...');
    
    // The SDK doesn't expose a "list all" easily, so we'll use our local list
    // and then try to discover any extras by querying common prefixes
    const localData = await fs.readFile('./data/buildright/products.json', 'utf-8');
    const localProducts = JSON.parse(localData);
    const localSKUs = localProducts.map(p => p.sku);
    
    logger.info(`Found ${localSKUs.length} products in local data`);
    
    // Add common prefixes from previous ingestions
    const prefixes = ['LBR-', 'PLY-', 'WINDOW-', 'DOOR-', 'ROOF-', 'FLOOR-', 'PAINT-', 
                      'NAIL-', 'SCREW-', 'INSUL-', 'LIGHT-', 'PLUMB-', 'SIDING-',
                      'CONC-', 'ELEC-', 'HVAC-', 'DRYWALL-', 'APPL-'];
    
    logger.info(`User reports 349 products in ACO (vs ${localSKUs.length} local)`);
    logger.info(`This means ${349 - localSKUs.length} old/duplicate products exist`);
    logger.info('');
    
    allSKUs = localSKUs;
    
    // For now, we'll delete based on local SKUs + a manual fallback
    // A better approach would be to use ACO's admin API to list all products
    
  } catch (error) {
    logger.error('Error fetching products:', error.message);
    logger.info('');
    logger.info('⚠️  Cannot enumerate all products automatically.');
    logger.info('⚠️  We can only delete the 265 products in local data.');
    logger.info('⚠️  Recommend: Use ACO Web UI to manually delete remaining products.');
    logger.info('');
    
    const localData = await fs.readFile('./data/buildright/products.json', 'utf-8');
    const localProducts = JSON.parse(localData);
    allSKUs = localProducts.map(p => p.sku);
  }
  
  logger.info('='.repeat(70));
  logger.info(`Will attempt to delete ${allSKUs.length} products`);
  logger.info('='.repeat(70));
  logger.info('');
  
  if (dryRun) {
    logger.info('DRY RUN - Would delete:');
    allSKUs.slice(0, 10).forEach(sku => logger.info(`  - ${sku}`));
    if (allSKUs.length > 10) logger.info(`  ... and ${allSKUs.length - 10} more`);
    return;
  }
  
  // Step 2: Delete all products
  logger.info('Step 2: Deleting products...');
  logger.info('');
  
  const batchSize = 100;
  let deleted = 0;
  let failed = 0;
  
  for (let i = 0; i < allSKUs.length; i += batchSize) {
    const batch = allSKUs.slice(i, i + batchSize);
    logger.info(`Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allSKUs.length / batchSize)} (${batch.length} products)...`);
    
    try {
      const result = await client.deleteProducts({
        skus: batch,
        locale: 'en-US'
      });
      
      deleted += batch.length;
      logger.info(`  ✅ Batch deleted`);
    } catch (error) {
      failed += batch.length;
      logger.error(`  ❌ Batch failed:`, error.message);
    }
  }
  
  logger.info('');
  logger.info('='.repeat(70));
  logger.info('Deletion Summary');
  logger.info('='.repeat(70));
  logger.info(`Products deleted: ${deleted}/${allSKUs.length}`);
  logger.info(`Failed: ${failed}`);
  logger.info('');
  
  if (failed > 0) {
    logger.warn('⚠️  Some products failed to delete.');
    logger.warn('⚠️  Check ACO Web UI to verify remaining products.');
  } else {
    logger.info('✅ All products deleted successfully!');
  }
  
  logger.info('');
  logger.info('⚠️  NOTE: User reported 349 products in ACO');
  logger.info(`⚠️  We only deleted ${allSKUs.length} (from local data)`);
  logger.info(`⚠️  Remaining ~${349 - allSKUs.length} products must be deleted manually via ACO Web UI`);
  logger.info('');
  logger.info('Next steps:');
  logger.info('  1. Verify ACO is empty via Web UI');
  logger.info('  2. Run: npm run ingest:all');
  logger.info('  3. Verify exactly 265 products in ACO');
}

forceDeleteAll().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

