#!/usr/bin/env node
/**
 * Unified ACO Data Reset
 * 
 * Deletes all ACO entities in the correct reverse dependency order:
 * 1. Prices (references products + price books)
 * 2. Price Books
 * 3. Products (simple + variants + bundles)
 * 4. Categories (optional)
 * 5. Metadata (product attributes)
 * 
 * Usage:
 *   npm run reset:all                    # Delete everything
 *   node scripts/reset-all.js --dry-run  # Preview what would be deleted
 *   node scripts/reset-all.js --reingest # Delete and re-ingest all data
 * 
 * @module scripts/reset-all
 */

import { getAllProductSKUs } from '../utils/aco-query.js';
import {
  deleteAllPricesForPriceBooks,
  deletePriceBooks,
  deleteProductsBySKUs
} from '../utils/aco-delete.js';
import logger from '../utils/logger.js';
import { promises as fs } from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const reingest = args.includes('--reingest');
const skipPrices = args.includes('--skip-prices');
const skipProducts = args.includes('--skip-products');

/**
 * Get all known price book IDs
 */
async function getAllPriceBookIds() {
  try {
    const data = await fs.readFile('./data/buildright/price-books.json', 'utf-8');
    const priceBooks = JSON.parse(data);
    const localIds = priceBooks.map(pb => pb.priceBookId);
    
    // Add any legacy price book IDs
    const legacyIds = [
      'east-region-contract', 'east-commercial-contract', 'east-residential-contract',
      'west-region-contract', 'west-commercial-contract', 'west-residential-contract',
      'us-base-retail', 'east-region-retail', 'west-region-retail',
      'US_COMMERCIAL', 'US_CONTRACTOR', 'US_RETAIL', 'US_WHOLESALE'
    ];
    
    return [...new Set([...localIds, ...legacyIds])];
  } catch (error) {
    logger.warn('Could not read local price-books.json:', error.message);
    return [];
  }
}

/**
 * Main reset workflow
 */
async function resetAll() {
  logger.info('='.repeat(70));
  logger.info('ACO Data Reset - Complete Workflow');
  logger.info('='.repeat(70));
  
  if (dryRun) {
    logger.info('🔍 DRY RUN MODE - No data will be deleted');
  }
  
  logger.info('');
  logger.info('This will delete data in the following order:');
  if (!skipPrices) logger.info('  1. Prices');
  if (!skipPrices) logger.info('  2. Price Books');
  if (!skipProducts) logger.info('  3. Products (bundles + variants + simple)');
  logger.info('  4. Categories (not yet implemented)');
  logger.info('  5. Metadata (not yet implemented)');
  logger.info('');
  
  const results = {
    prices: null,
    priceBooks: null,
    products: null
  };
  
  try {
    // Step 1: Delete Prices
    if (!skipPrices) {
      logger.info('Step 1: Deleting all prices...');
      logger.info('');
      
      const priceBookIds = await getAllPriceBookIds();
      const skus = await getAllProductSKUs();
      
      logger.info(`Found ${priceBookIds.length} price books and ${skus.length} SKUs`);
      
      results.prices = await deleteAllPricesForPriceBooks(priceBookIds, {
        skus,
        dryRun
      });
      
      logger.info(`Prices: ${results.prices.deleted}/${results.prices.total} deleted`);
      logger.info('');
    }
    
    // Step 2: Delete Price Books
    if (!skipPrices && results.prices?.success) {
      logger.info('Step 2: Deleting price books...');
      logger.info('');
      
      const priceBookIds = await getAllPriceBookIds();
      results.priceBooks = await deletePriceBooks(priceBookIds, { dryRun });
      
      logger.info(`Price Books: ${results.priceBooks.deleted}/${results.priceBooks.total} deleted`);
      logger.info('');
    }
    
    // Step 3: Delete Products
    if (!skipProducts) {
      logger.info('Step 3: Deleting all products...');
      logger.info('');
      
      const skus = await getAllProductSKUs();
      results.products = await deleteProductsBySKUs(skus, { dryRun });
      
      logger.info(`Products: ${results.products.deleted}/${results.products.total} deleted`);
      logger.info('');
    }
    
    // Step 4: Categories (not implemented)
    logger.info('Step 4: Categories deletion not yet implemented (optional)');
    logger.info('');
    
    // Step 5: Metadata (not implemented)
    logger.info('Step 5: Metadata deletion not yet implemented (optional)');
    logger.info('');
    
    // Summary
    logger.info('='.repeat(70));
    logger.info('Reset Summary');
    logger.info('='.repeat(70));
    
    if (!skipPrices) {
      logger.info(`Prices deleted: ${results.prices?.deleted || 0}/${results.prices?.total || 0}`);
      logger.info(`Price books deleted: ${results.priceBooks?.deleted || 0}/${results.priceBooks?.total || 0}`);
    }
    if (!skipProducts) {
      logger.info(`Products deleted: ${results.products?.deleted || 0}/${results.products?.total || 0}`);
    }
    
    const totalErrors = (results.prices?.errors?.length || 0) + 
                       (results.priceBooks?.errors?.length || 0) + 
                       (results.products?.errors?.length || 0);
    logger.info(`Errors: ${totalErrors}`);
    logger.info('');
    
    const allSuccess = Object.values(results)
      .filter(r => r !== null)
      .every(r => r.success !== false);
    
    if (allSuccess && !dryRun) {
      logger.info('✅ All reset steps completed successfully!');
      
      if (reingest) {
        logger.info('');
        logger.info('Re-ingesting all data...');
        const { execSync } = await import('child_process');
        execSync('node scripts/ingest-all.js', {
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } else {
        logger.info('');
        logger.info('Next step: Re-ingest data with npm run ingest:all');
        logger.info('Or run with --reingest flag to do this automatically');
      }
    } else if (dryRun) {
      logger.info('🔍 Dry run complete - no data was deleted');
    } else {
      logger.warn('⚠️  Some reset steps failed - check logs above');
    }
    
    return { success: allSuccess, results };
    
  } catch (error) {
    logger.error('Reset failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await resetAll();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    logger.error('Fatal error during reset');
    process.exit(1);
  }
}

export default resetAll;

