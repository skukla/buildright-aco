#!/usr/bin/env node

/**
 * Parallel Data Generation for BuildRight ACO
 * Optimized to run independent generation tasks in parallel
 * 
 * Generation phases:
 * - Phase 1 (parallel): metadata, categories, price-books (no dependencies)
 * - Phase 2 (parallel): products, variants (depend on Phase 1)
 * - Phase 3 (sequential): prices (depends on Phase 2)
 * - Phase 4 (sequential): EDS data, service data (depend on all above)
 */

import { promisify } from 'util';
import { exec } from 'child_process';
import logger from '../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Run a generation script and return timing
 */
async function runScript(name, command) {
  const startTime = Date.now();
  
  try {
    logger.info(`[${name}] Starting...`);
    const { stdout, stderr } = await execAsync(command);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.info(`[${name}] ✓ Complete (${duration}s)`);
    
    return { name, success: true, duration, stdout, stderr };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.error(`[${name}] ✗ Failed (${duration}s): ${error.message}`);
    
    return { name, success: false, duration, error: error.message };
  }
}

/**
 * Run multiple scripts in parallel
 */
async function runParallel(tasks) {
  return await Promise.all(
    tasks.map(task => runScript(task.name, task.command))
  );
}

/**
 * Main parallel generation function
 */
async function generateAllParallel() {
  const overallStart = Date.now();
  
  logger.info('\n╔══════════════════════════════════════════════════════════╗');
  logger.info('║     BuildRight ACO Parallel Data Generation             ║');
  logger.info('╚══════════════════════════════════════════════════════════╝\n');
  
  const results = {
    phase1: [],
    phase2: [],
    phase3: [],
    phase4: []
  };
  
  try {
    // Phase 1: Independent data (parallel)
    logger.info('📦 Phase 1: Independent data generation (parallel)');
    logger.info('   - metadata, categories, price-books\n');
    
    results.phase1 = await runParallel([
      { name: 'metadata', command: 'npm run generate:metadata --silent' },
      { name: 'categories', command: 'npm run generate:categories --silent' },
      { name: 'price-books', command: 'npm run generate:price-books --silent' }
    ]);
    
    const phase1Failed = results.phase1.filter(r => !r.success);
    if (phase1Failed.length > 0) {
      throw new Error(`Phase 1 failures: ${phase1Failed.map(r => r.name).join(', ')}`);
    }
    
    const phase1Duration = results.phase1.reduce((sum, r) => sum + parseFloat(r.duration), 0) / results.phase1.length;
    logger.info(`✓ Phase 1 complete (avg ${phase1Duration.toFixed(1)}s per task)\n`);
    
    // Phase 2: Products and variants (parallel, depend on Phase 1)
    logger.info('📦 Phase 2: Product generation (parallel)');
    logger.info('   - products, variants\n');
    
    results.phase2 = await runParallel([
      { name: 'products', command: 'npm run generate:products --silent' },
      { name: 'variants', command: 'npm run generate:variants --silent' }
    ]);
    
    const phase2Failed = results.phase2.filter(r => !r.success);
    if (phase2Failed.length > 0) {
      throw new Error(`Phase 2 failures: ${phase2Failed.map(r => r.name).join(', ')}`);
    }
    
    const phase2Duration = results.phase2.reduce((sum, r) => sum + parseFloat(r.duration), 0) / results.phase2.length;
    logger.info(`✓ Phase 2 complete (avg ${phase2Duration.toFixed(1)}s per task)\n`);
    
    // Phase 3: Prices (sequential, depends on Phase 2)
    logger.info('📦 Phase 3: Price generation (sequential)');
    logger.info('   - prices\n');
    
    const pricesResult = await runScript('prices', 'npm run generate:prices --silent');
    results.phase3 = [pricesResult];
    
    if (!pricesResult.success) {
      throw new Error(`Phase 3 failure: prices`);
    }
    
    logger.info(`✓ Phase 3 complete (${pricesResult.duration}s)\n`);
    
    // Phase 4: EDS and service data (parallel, depend on all above)
    logger.info('📦 Phase 4: Supplementary data (parallel)');
    logger.info('   - EDS data, service data\n');
    
    results.phase4 = await runParallel([
      { name: 'eds-data', command: 'npm run generate:eds-data --silent' },
      { name: 'service-data', command: 'npm run generate:service-data --silent' }
    ]);
    
    const phase4Failed = results.phase4.filter(r => !r.success);
    if (phase4Failed.length > 0) {
      logger.warn(`Phase 4 had failures: ${phase4Failed.map(r => r.name).join(', ')}`);
    }
    
    const phase4Duration = results.phase4.reduce((sum, r) => sum + parseFloat(r.duration), 0) / results.phase4.length;
    logger.info(`✓ Phase 4 complete (avg ${phase4Duration.toFixed(1)}s per task)\n`);
    
    // Summary
    const overallDuration = ((Date.now() - overallStart) / 1000).toFixed(1);
    const allResults = [...results.phase1, ...results.phase2, ...results.phase3, ...results.phase4];
    const successCount = allResults.filter(r => r.success).length;
    const totalCount = allResults.length;
    
    logger.info('\n╔══════════════════════════════════════════════════════════╗');
    logger.info('║                   Generation Complete                    ║');
    logger.info('╚══════════════════════════════════════════════════════════╝\n');
    logger.info(`✓ Success: ${successCount}/${totalCount} tasks`);
    logger.info(`⏱  Total duration: ${overallDuration}s`);
    
    // Calculate sequential time (for comparison)
    const sequentialTime = allResults.reduce((sum, r) => sum + parseFloat(r.duration), 0);
    const savings = ((sequentialTime - parseFloat(overallDuration)) / sequentialTime * 100).toFixed(0);
    logger.info(`⚡ Time saved: ${savings}% (vs sequential: ${sequentialTime.toFixed(1)}s)`);
    
    logger.info('\n📊 Task breakdown:');
    allResults.forEach(r => {
      const status = r.success ? '✓' : '✗';
      logger.info(`   ${status} ${r.name}: ${r.duration}s`);
    });
    
    if (successCount < totalCount) {
      logger.warn(`\n⚠️  ${totalCount - successCount} task(s) failed`);
      process.exit(1);
    }
    
  } catch (error) {
    logger.error(`\n❌ Generation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllParallel().catch(error => {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

export { generateAllParallel };

