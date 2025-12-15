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
 * Features:
 * - Smart detection (no hardcoded lists)
 * - Validation after deletion
 * - Zero orphaned data guarantee
 * 
 * Usage:
 *   npm run reset:all                    # Delete everything with validation
 *   node scripts/reset-all.js --dry-run  # Preview what would be deleted
 *   node scripts/reset-all.js --reingest # Delete and re-ingest all data
 * 
 * @module scripts/reset-all
 */

import { BuildRightDetector } from '../utils/smart-detector.js';
import {
  deleteAllPricesForPriceBooks,
  deletePriceBooks,
  deleteProductsBySKUs
} from '../utils/aco-delete.js';
import logger from '../utils/logger.js';
import { format, withProgress } from '../utils/format.js';
import { updateLine, finishLine } from '../utils/progress.js';
import chalk from 'chalk';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const reingest = args.includes('--reingest');
const skipPrices = args.includes('--skip-prices');
const skipProducts = args.includes('--skip-products');
const skipValidation = args.includes('--skip-validation');

/**
 * Smart BuildRight detector
 * Replaces hardcoded lists with intelligent pattern matching
 */
const detector = new BuildRightDetector({ silent: true });

/**
 * Main reset workflow
 */
async function resetAll() {
  console.log('');
  
  if (dryRun) {
    console.log(format.muted('Mode: DRY RUN - No data will be deleted'));
    console.log('');
  }
  
  const results = {
    prices: null,
    priceBooks: null,
    products: null
  };
  
  try {
    // Use smart detection to find all BuildRight entities
    const { updateLine, finishLine } = await import('../utils/progress.js');
    
    // Find data (single line) - Use state tracker or local files as source
    updateLine('🔍 Finding BuildRight data...');
    
    // Get ALL SKUs that should be deleted (from state tracker or local files)
    // Note: We don't query ACO because invisible variants (visibleIn: []) are not
    // searchable/queryable, but they still exist and need to be deleted.
    const { promises: fs } = await import('fs');
    const { join } = await import('path');
    const { getStateTracker } = await import('../utils/aco-state-tracker.js');
    
    let skus = [];
    
    // Try state tracker first (most accurate - records what was actually ingested)
    const stateTracker = getStateTracker();
    await stateTracker.load();
    const stateSkus = stateTracker.getAllProductSKUs();
    
    if (stateSkus.length > 0) {
      // Use state tracker (knows exactly what was ingested)
      skus = stateSkus;
    } else {
      // Fallback to local files (may include products that failed to ingest)
      const productsData = await fs.readFile(join(process.cwd(), 'data/buildright/products.json'), 'utf-8');
      const products = JSON.parse(productsData);
      
      const variantsData = await fs.readFile(join(process.cwd(), 'data/buildright/variants.json'), 'utf-8');
      const variants = JSON.parse(variantsData);
      
      skus = [...products.map(p => p.sku), ...variants.map(v => v.sku)];
    }
    
    // Validate price books using Catalog API (queries live ACO as source of truth)
    const priceBooks = await detector.findAllPriceBooks();
    const priceBookIds = priceBooks.map(pb => pb.priceBookId);
    
    if (skus.length > 0 || priceBookIds.length > 0) {
      updateLine(chalk.green(`✔ Finding BuildRight data (${skus.length} products, ${priceBookIds.length} price books)`));
      finishLine();
    } else {
      updateLine(chalk.green('✔ No BuildRight data found in ACO'));
      finishLine();
      
      console.log('');
      console.log(format.success('ACO is already clean!'));
      
      return {
        success: true,
        results,
        validation: { clean: true, issues: [] }
      };
    }
    
    // Step 1: Delete Prices (single line with spinner)
    if (!skipPrices && priceBookIds.length > 0) {
      results.prices = await deleteAllPricesForPriceBooks(priceBookIds, { skus, dryRun });
      if (results.prices.deleted > 0) {
        console.log(chalk.green(`✔ Deleted ${results.prices.deleted} prices`));
      }
    }
    
    // Step 2: Delete Price Books (single line with spinner)
    if (!skipPrices && results.prices?.success && priceBookIds.length > 0) {
      results.priceBooks = await deletePriceBooks(priceBookIds, { dryRun });
      if (results.priceBooks.deleted > 0) {
        console.log(chalk.green(`✔ Deleted ${results.priceBooks.deleted} price books`));
      }
    }
    
    // Step 3: Delete Products (single line with polling progress)
    if (!skipProducts && skus.length > 0) {
      updateLine('🗑️  Deleting products...');
      
      // Submit deletion request (silent mode - polling will show progress)
      const deleteResult = await deleteProductsBySKUs(skus, { dryRun, silent: true });
      
      // Poll to watch actual deletion progress
      if (!dryRun) {
        const { PollingProgress } = await import('../utils/progress.js');
        const progress = new PollingProgress('Deleting products', skus.length);
        
        const maxAttempts = 60; // 10 minutes max
        const pollInterval = 10000; // 10 seconds
        let attempt = 0;
        let currentCount = skus.length;
        let previousCount = skus.length;
        let deletionStarted = false;
        
        while (attempt < maxAttempts && currentCount > 0) {
          attempt++;
          
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          
          // Check how many products still exist
          const remainingProducts = await detector.queryACOProductsBySKUs(skus);
          currentCount = remainingProducts.length;
          const deletedCount = skus.length - currentCount;
          
          // Detect when deletion starts (first movement)
          if (!deletionStarted && currentCount < previousCount) {
            deletionStarted = true;
            console.log(format.success(`\n  ✓ Deletion processing started (${deletedCount} removed)`));
          }
          
          progress.update(deletedCount, attempt, maxAttempts);
          
          if (currentCount === 0) {
            progress.finish(deletedCount, true);
            break;
          }
          
          previousCount = currentCount;
        }
        
        if (currentCount > 0) {
          progress.finish(skus.length - currentCount, false);
          if (!deletionStarted) {
            console.log(format.warning(`\nDeletion submitted but not yet processed. Products may still appear in search.`));
          } else {
            throw new Error(`${currentCount} products still remain after ${attempt * 10}s`);
          }
        }
        
        deleteResult.actualDeleted = skus.length - currentCount;
      } else {
        updateLine(`✔ Deleting products (${deleteResult.deleted} deleted)`);
        finishLine();
      }
      
      results.products = deleteResult;
    }
    
    // Validation: Ensure ACO is completely clean (with auto-cleanup of orphans)
    const maxRetries = 3;
    let retryCount = 0;
    let validation = { clean: true, issues: [] };
    
    if (!dryRun && !skipValidation) {
      while (retryCount < maxRetries) {
        updateLine('🔍 Validating deletion...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        validation = await detector.validateClean();
        
        if (validation.clean) {
          // Success!
          updateLine('✔ Validating deletion (no orphaned data)');
          finishLine();
          break;
        }
        
        // Orphaned data detected - auto-cleanup
        finishLine();
        console.log('');
        console.log(format.warning(`Found orphaned data (attempt ${retryCount + 1}/${maxRetries}), cleaning up...`));
        validation.issues.forEach(issue => console.log(format.muted(`  • ${issue}`)));
        console.log('');
        
        // Re-find and delete orphaned data
        const orphanedProducts = await detector.queryACOProductsBySKUs(allLocalSkus);
        if (orphanedProducts.length > 0) {
          const orphanSkus = orphanedProducts.map(p => p.sku);
          console.log(`  Deleting ${orphanSkus.length} orphaned products...`);
          await deleteProductsBySKUs(orphanSkus, { dryRun, silent: true });
          
          // Poll for cleanup completion
          const { PollingProgress } = await import('../utils/progress.js');
          const progress = new PollingProgress('Cleaning up orphans', orphanSkus.length);
          
          let attempt = 0;
          let currentCount = orphanSkus.length;
          let previousCount = orphanSkus.length;
          let cleanupStarted = false;
          const maxAttempts = 30; // 5 minutes max
          
          while (attempt < maxAttempts && currentCount > 0) {
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
            const remaining = await detector.queryACOProductsBySKUs(orphanSkus);
            currentCount = remaining.length;
            
            // Detect when cleanup starts
            if (!cleanupStarted && currentCount < previousCount) {
              cleanupStarted = true;
              console.log(format.muted(`  ✓ Cleanup processing (${orphanSkus.length - currentCount} removed)`));
            }
            
            progress.update(orphanSkus.length - currentCount, attempt, maxAttempts);
            
            if (currentCount === 0) {
              progress.finish(orphanSkus.length, true);
              break;
            }
            
            previousCount = currentCount;
          }
        }
        
        retryCount++;
      }
      
      // Final check
      if (!validation.clean) {
        console.log('');
        console.log(format.error('Unable to clean all orphaned data after 3 attempts'));
        validation.issues.forEach(issue => console.log(format.error(`  • ${issue}`)));
        console.log('');
        
        return {
          success: false,
          results,
          validation
        };
      }
      
      // Clear state tracker after successful deletion
      const { getStateTracker } = await import('../utils/aco-state-tracker.js');
      const stateTracker = getStateTracker();
      await stateTracker.load();
      stateTracker.clearAll();
      await stateTracker.save();
    }
    
    // Summary
    console.log('');
    
    const allSuccess = Object.values(results)
      .filter(r => r !== null)
      .every(r => r.success !== false);
    
    const validationPassed = validation.clean;
    const overallSuccess = allSuccess && validationPassed;
    
    if (overallSuccess && !dryRun) {
      console.log(format.success('Data deletion complete!'));
      if (reingest) {
        console.log('');
        console.log(format.muted('Re-ingesting all data...'));
        const { execSync } = await import('child_process');
        execSync('node scripts/ingest-all.js', {
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } else {
        console.log(format.muted('You can now run: npm run import'));
      }
    } else if (dryRun) {
      console.log(format.muted('Dry run complete - no data was deleted'));
    } else if (!validationPassed) {
      console.log(format.error('Validation failed - orphaned data detected'));
    } else {
      console.log(format.warning('Some steps failed - check logs above'));
    }
    
    console.log('');
    
    return { success: overallSuccess, results, validation };
    
  } catch (error) {
    console.error(format.error(`Reset failed: ${error.message}`));
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

