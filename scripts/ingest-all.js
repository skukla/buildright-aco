#!/usr/bin/env node
/**
 * Unified ACO Data Ingestion
 * 
 * Ingests all supported ACO entities in the correct dependency order:
 * 1. Metadata (product attributes)
 * 2. Categories (optional)
 * 3. Products (simple + variants + bundles)
 * 4. Price Books
 * 5. Prices
 * 
 * Usage:
 *   npm run ingest:all                # Ingest everything
 *   node scripts/ingest-all.js --dry-run    # Preview what would be ingested
 *   node scripts/ingest-all.js --skip-metadata  # Skip metadata ingestion
 * 
 * @module scripts/ingest-all
 */

import { execSync } from 'child_process';
import logger from '../utils/logger.js';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipMetadata = args.includes('--skip-metadata');
const skipCategories = args.includes('--skip-categories');
const skipProducts = args.includes('--skip-products');
const skipPricing = args.includes('--skip-pricing');

/**
 * Run a script and handle errors
 */
function runScript(scriptPath, description) {
  logger.info('');
  logger.info('='.repeat(70));
  logger.info(`${description}...`);
  logger.info('='.repeat(70));
  
  try {
    const dryRunFlag = dryRun ? ' --dry-run' : '';
    const command = `node ${scriptPath}${dryRunFlag}`;
    
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    logger.info(`✅ ${description} complete`);
    return { success: true };
  } catch (error) {
    logger.error(`❌ ${description} failed:`, error.message);
    return { success: false, error };
  }
}

/**
 * Main ingestion workflow
 */
async function ingestAll() {
  logger.info('='.repeat(70));
  logger.info('ACO Data Ingestion - Complete Workflow');
  logger.info('='.repeat(70));
  
  if (dryRun) {
    logger.info('🔍 DRY RUN MODE - No data will be ingested');
  }
  
  logger.info('');
  logger.info('This will ingest data in the following order:');
  if (!skipMetadata) logger.info('  1. Product Metadata (attributes)');
  if (!skipCategories) logger.info('  2. Categories (optional)');
  if (!skipProducts) logger.info('  3. Products (simple + variants + bundles)');
  if (!skipPricing) logger.info('  4. Price Books');
  if (!skipPricing) logger.info('  5. Prices');
  logger.info('');
  
  const results = {
    metadata: { skipped: skipMetadata },
    categories: { skipped: skipCategories },
    products: { skipped: skipProducts },
    priceBooks: { skipped: skipPricing },
    prices: { skipped: skipPricing }
  };
  
  // 1. Metadata (must be first - products reference attributes)
  if (!skipMetadata) {
    // Note: metadata ingestion script doesn't exist yet, but products.js handles it
    logger.info('ℹ️  Metadata is ingested with products');
    results.metadata = { success: true, skipped: false };
  }
  
  // 2. Categories (optional - products can reference categories)
  if (!skipCategories) {
    logger.info('ℹ️  Categories ingestion not yet implemented (optional)');
    results.categories = { success: true, skipped: true };
  }
  
  // 3. Products (simple, variants, bundles)
  if (!skipProducts) {
    results.products = runScript(
      'scripts/ingest-products.js',
      'Ingesting Products (simple products)'
    );
    
    if (results.products.success) {
      results.variants = runScript(
        'scripts/ingest-variants.js',
        'Ingesting Product Variants (configurable products)'
      );
    }
    
    if (results.products.success && results.variants.success) {
      results.bundles = runScript(
        'scripts/ingest-bundles.js',
        'Ingesting Bundle Products'
      );
    }
  }
  
  // 4. Price Books (must be before prices)
  if (!skipPricing && results.products?.success) {
    results.priceBooks = runScript(
      'scripts/ingest-price-books.js',
      'Ingesting Price Books'
    );
  }
  
  // 5. Prices (requires products and price books)
  if (!skipPricing && results.priceBooks?.success) {
    results.prices = runScript(
      'scripts/ingest-prices.js --skip-validation',
      'Ingesting Prices'
    );
  }
  
  // Summary
  logger.info('');
  logger.info('='.repeat(70));
  logger.info('Ingestion Summary');
  logger.info('='.repeat(70));
  
  const summary = [];
  if (!results.metadata.skipped) summary.push(`Metadata: ${results.metadata.success ? '✅' : '❌'}`);
  if (!results.categories.skipped) summary.push(`Categories: ${results.categories.success ? '✅' : '❌'}`);
  if (!results.products.skipped) {
    summary.push(`Products: ${results.products.success ? '✅' : '❌'}`);
    if (results.variants) summary.push(`Variants: ${results.variants.success ? '✅' : '❌'}`);
    if (results.bundles) summary.push(`Bundles: ${results.bundles.success ? '✅' : '❌'}`);
  }
  if (!results.priceBooks?.skipped) summary.push(`Price Books: ${results.priceBooks?.success ? '✅' : '❌'}`);
  if (!results.prices?.skipped) summary.push(`Prices: ${results.prices?.success ? '✅' : '❌'}`);
  
  summary.forEach(line => logger.info(line));
  logger.info('');
  
  const allSuccess = Object.values(results)
    .filter(r => !r.skipped)
    .every(r => r.success);
  
  if (allSuccess && !dryRun) {
    logger.info('🎉 All ingestion steps completed successfully!');
  } else if (dryRun) {
    logger.info('🔍 Dry run complete - no data was ingested');
  } else {
    logger.warn('⚠️  Some ingestion steps failed - check logs above');
  }
  
  return { success: allSuccess, results };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await ingestAll();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    logger.error('Fatal error during ingestion:', error);
    process.exit(1);
  }
}

export default ingestAll;

