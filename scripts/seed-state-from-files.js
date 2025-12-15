#!/usr/bin/env node
/**
 * Seed State Tracker from Local Files
 * 
 * Use this when:
 * - State tracker is empty but products exist in ACO
 * - You have orphaned invisible variants that can't be queried
 * - You want to populate state tracker from local JSON files
 * 
 * Usage:
 *   node scripts/seed-state-from-files.js
 *   npm run delete  # Will now delete using seeded SKUs
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getStateTracker } from '../utils/aco-state-tracker.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedStateFromFiles() {
  console.log('');
  console.log(chalk.bold('🌱 Seeding State Tracker from Local Files'));
  console.log('');
  
  try {
    // Load local files
    console.log('📂 Reading local product files...');
    
    const productsData = await fs.readFile(
      join(__dirname, '../data/buildright/products.json'), 
      'utf-8'
    );
    const products = JSON.parse(productsData);
    
    const variantsData = await fs.readFile(
      join(__dirname, '../data/buildright/variants.json'), 
      'utf-8'
    );
    const variants = JSON.parse(variantsData);
    
    const allSkus = [
      ...products.map(p => p.sku),
      ...variants.map(v => v.sku)
    ];
    
    console.log(`   Found ${products.length} products`);
    console.log(`   Found ${variants.length} variants`);
    console.log(`   Total: ${allSkus.length} SKUs`);
    console.log('');
    
    // Load state tracker
    const stateTracker = getStateTracker();
    await stateTracker.load();
    
    const existingCount = stateTracker.getProductCount();
    console.log(`📊 Current state tracker: ${existingCount} products`);
    console.log('');
    
    // Seed state tracker
    console.log('💾 Seeding state tracker...');
    
    let added = 0;
    let existing = 0;
    
    for (const sku of allSkus) {
      const wasAdded = stateTracker.markProductIngested(sku);
      if (wasAdded) {
        added++;
      } else {
        existing++;
      }
    }
    
    await stateTracker.save();
    
    console.log(chalk.green(`✔ State tracker seeded successfully`));
    console.log(`   Added: ${added} SKUs`);
    console.log(`   Already tracked: ${existing} SKUs`);
    console.log(`   Total: ${stateTracker.getProductCount()} SKUs`);
    console.log('');
    
    console.log(chalk.bold('✅ Ready to delete!'));
    console.log(chalk.muted('   Run: npm run delete'));
    console.log('');
    
    return { success: true, added, existing };
    
  } catch (error) {
    console.error(chalk.red('❌ Error seeding state tracker:'), error.message);
    return { success: false, error: error.message };
  }
}

// Run
seedStateFromFiles()
  .then(result => process.exit(result.success ? 0 : 1))
  .catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });

