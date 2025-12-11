#!/usr/bin/env node
/**
 * Delete specific SKUs from ACO
 * 
 * Usage:
 *   node scripts/delete-skus.js SKU1 SKU2 SKU3
 *   node scripts/delete-skus.js --dry-run SKU1 SKU2
 *   echo "SKU1\nSKU2" | node scripts/delete-skus.js --stdin
 * 
 * Examples:
 *   node scripts/delete-skus.js INSUL-82B95179
 *   node scripts/delete-skus.js BUNDLE-123 BUNDLE-456 --dry-run
 */

import { getACOClient } from '../utils/aco-client.js';
import logger from '../utils/logger.js';
import { createInterface } from 'readline';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const useStdin = args.includes('--stdin');

// Filter out flags
const skusFromArgs = args.filter(arg => !arg.startsWith('--'));

async function readStdin() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const lines = [];
  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      lines.push(trimmed);
    }
  }
  return lines;
}

async function deleteSkus(skus) {
  if (skus.length === 0) {
    console.log('Usage: node scripts/delete-skus.js SKU1 SKU2 ...');
    console.log('       node scripts/delete-skus.js --dry-run SKU1 SKU2');
    console.log('       echo "SKU1" | node scripts/delete-skus.js --stdin');
    process.exit(1);
  }

  logger.info('='.repeat(60));
  logger.info('Delete SKUs from ACO');
  logger.info('='.repeat(60));
  logger.info('');
  
  if (dryRun) {
    logger.info('🔍 DRY RUN MODE - No data will be deleted');
    logger.info('');
  }
  
  logger.info(`SKUs to delete: ${skus.length}`);
  skus.forEach(sku => logger.info(`  - ${sku}`));
  logger.info('');
  
  if (dryRun) {
    logger.info('✓ Dry run complete. Run without --dry-run to delete.');
    return;
  }
  
  const client = getACOClient();
  
  // Format delete request
  const deleteRequest = skus.map(sku => ({
    sku,
    source: { locale: 'en-US' }
  }));
  
  logger.info('Sending delete request...');
  
  try {
    const result = await client.deleteProducts(deleteRequest);
    
    if (result.ok && result.data?.acceptedCount > 0) {
      logger.info(`✅ Delete accepted: ${result.data.acceptedCount} SKU(s)`);
      logger.info('');
      logger.info('Note: Search index may take a few minutes to update.');
    } else {
      logger.warn('⚠️  Delete request returned but no items accepted');
      logger.info('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    logger.error('❌ Delete failed:', error.message);
    if (error.response) {
      logger.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Main
async function main() {
  let skus = skusFromArgs;
  
  if (useStdin) {
    skus = await readStdin();
  }
  
  await deleteSkus(skus);
}

main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

