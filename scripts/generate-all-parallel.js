#!/usr/bin/env node
/**
 * ACO-Specific Data Generation
 * 
 * Generates ACO-specific features (price books, prices).
 * Note: Products/variants/categories/metadata come from Commerce transform.
 */

import { updateLine, finishLine } from '../utils/progress.js';
import { format } from '../utils/format.js';
import { execSync } from 'child_process';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

/**
 * Execute a generation step with single-line updates
 */
function executeGenerationStep(stepName, command) {
  const startTime = Date.now();
  
  updateLine(`Generating ${stepName}...`);
  
  try {
    execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    let message = `✔ Generating ${stepName}`;
    if (duration > 1) {
      message += ` (${duration}s)`;
    }
    
    updateLine(message);
    finishLine();
    
    return { success: true, duration: parseFloat(duration) };
  } catch (error) {
    finishLine();
    console.log(format.error(`✖ ${stepName} generation failed`));
    console.log(format.muted(`  ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Main generation workflow
 */
async function generateAll() {
  const startTime = Date.now();
  
  console.log('');
  console.log(format.muted(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`));
  console.log(format.muted('Note: Commerce is the source for catalog data'));
  console.log('');
  
  const results = {};
  
  try {
    // Generate Price Books
    results.priceBooks = executeGenerationStep('price books', 'npm run generate:price-books --silent');
    if (!results.priceBooks.success) {
      throw new Error('Price books generation failed');
    }
    
    // Generate Prices
    results.prices = executeGenerationStep('prices', 'npm run generate:prices --silent');
    if (!results.prices.success) {
      throw new Error('Prices generation failed');
    }
    
    console.log('');
    console.log(format.success('Data generation complete!'));
    console.log(format.muted('Next: npm run import'));
    console.log('');
    
    return { success: true, results };
    
  } catch (error) {
    console.log('');
    console.log(format.error(`Generation failed: ${error.message}`));
    console.log('');
    return { success: false, error: error.message };
  }
}

// Run
generateAll()
  .then(result => process.exit(result.success ? 0 : 1))
  .catch(error => {
    console.error(format.error('Fatal error:'), error);
    process.exit(1);
  });
