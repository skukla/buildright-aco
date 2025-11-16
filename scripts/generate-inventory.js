#!/usr/bin/env node

/**
 * Multi-Source Inventory Generator for BuildRight ACO
 * Generates comprehensive inventory across 6 sources with category-based assignments
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import { validateAgainstSchema } from '../utils/validator.js';
import { seedRandom } from '../utils/random-seed.js';
import { sourceDefinitions } from './config/source-definitions.js';
import {
  getSourcesByCategory,
  getQuantityMultiplier,
  shouldHaveInventory
} from './config/inventory-rules.js';
import {
  distributeQuantity,
  generateBaseQuantity,
  createSourcesArray,
  calculateTotalQuantity
} from '../utils/inventory-distributor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use consistent seed for reproducible results
// Convert string seed to numeric value
const SEED = 'buildright-inventory-2024'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
const random = seedRandom(SEED);

/**
 * Load all product catalogs from Step 6
 * @returns {Array} Combined array of all products
 */
async function loadProductCatalog() {
  const dataDir = path.join(__dirname, '..', 'data', 'buildright');

  try {
    // Load all product types
    const [products, variants, bundles] = await Promise.all([
      fs.readFile(path.join(dataDir, 'products.json'), 'utf-8')
        .then(data => JSON.parse(data))
        .catch(() => []),
      fs.readFile(path.join(dataDir, 'variants.json'), 'utf-8')
        .then(data => JSON.parse(data))
        .catch(() => []),
      fs.readFile(path.join(dataDir, 'bundles.json'), 'utf-8')
        .then(data => JSON.parse(data))
        .catch(() => [])
    ]);

    // Combine all products
    const allProducts = [...products, ...variants, ...bundles];

    logger.info(`Loaded ${allProducts.length} total products`);
    logger.info(`  - Simple products: ${products.length}`);
    logger.info(`  - Variants: ${variants.length}`);
    logger.info(`  - Bundles: ${bundles.length}`);

    return allProducts;
  } catch (error) {
    logger.error('Failed to load product catalog:', error);
    throw error;
  }
}

/**
 * Generate inventory item for a product
 * @param {Object} product - Product object
 * @returns {Object|null} Inventory item or null if product shouldn't have inventory
 */
function generateInventoryItem(product) {
  // Check if product should have inventory
  if (!shouldHaveInventory(product)) {
    return null;
  }

  // Get product category
  const categoryAttr = (product.attributes || []).find(a => a.code === 'product_category');
  const category = categoryAttr?.values?.[0] || categoryAttr?.value || '';

  // Get sources for this product
  const sourceCodes = getSourcesByCategory(category, product.sku);

  // Generate base quantity
  const baseQuantity = generateBaseQuantity(product, random);

  // Distribute quantity across sources
  const distribution = distributeQuantity(
    baseQuantity,
    sourceCodes,
    getQuantityMultiplier,
    random
  );

  // Create sources array
  const sources = createSourcesArray(distribution);

  // Calculate total quantity
  const totalQuantity = calculateTotalQuantity(sources);

  // Create inventory item
  const inventoryItem = {
    sku: product.sku,
    quantity: totalQuantity,
    sources: sources,
    is_in_stock: totalQuantity > 0,
    manage_stock: true,
    use_config_manage_stock: true,
    min_qty: 0,
    max_sale_qty: 10000,
    backorders: 'no_backorders',
    qty_increments: 1
  };

  return inventoryItem;
}

/**
 * Generate multi-source inventory for all products
 */
export async function generateInventory() {
  logger.info('Starting multi-source inventory generation...');

  try {
    // Load product catalog
    const products = await loadProductCatalog();

    if (!products || products.length === 0) {
      throw new Error('No products found in catalog');
    }

    // Generate inventory for each product
    const inventory = [];
    let skippedCount = 0;

    for (const product of products) {
      const inventoryItem = generateInventoryItem(product);

      if (inventoryItem) {
        inventory.push(inventoryItem);
      } else {
        skippedCount++;
        logger.info(`Skipped inventory for ${product.sku} (service/virtual product)`);
      }
    }

    // Sort inventory by SKU for consistency
    inventory.sort((a, b) => a.sku.localeCompare(b.sku));

    // Validate against schema
    const schemaPath = path.join(__dirname, 'schemas', 'aco-inventory-schema.json');
    const schema = JSON.parse(await fs.readFile(schemaPath, 'utf-8'));
    const validation = validateAgainstSchema(inventory, schema);

    if (!validation.valid) {
      logger.error('Inventory validation failed:', validation.errors);
      throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
    }

    // Save inventory
    const outputPath = path.join(__dirname, '..', 'data', 'buildright', 'inventory.json');
    await fs.writeFile(outputPath, JSON.stringify(inventory, null, 2));

    // Log statistics
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const avgQuantity = Math.round(totalQuantity / totalItems);
    const inStockCount = inventory.filter(item => item.is_in_stock).length;
    const outOfStockCount = totalItems - inStockCount;

    // Source distribution statistics
    const sourceStats = {};
    inventory.forEach(item => {
      item.sources.forEach(source => {
        if (!sourceStats[source.source_code]) {
          sourceStats[source.source_code] = {
            itemCount: 0,
            totalQuantity: 0
          };
        }
        sourceStats[source.source_code].itemCount++;
        sourceStats[source.source_code].totalQuantity += source.quantity;
      });
    });

    logger.info('\n========================================');
    logger.info('✅ Inventory Generation Complete!');
    logger.info('========================================');
    logger.info(`Total inventory items: ${totalItems}`);
    logger.info(`Skipped items (services): ${skippedCount}`);
    logger.info(`In stock items: ${inStockCount}`);
    logger.info(`Out of stock items: ${outOfStockCount}`);
    logger.info(`Total quantity: ${totalQuantity.toLocaleString()}`);
    logger.info(`Average quantity per item: ${avgQuantity}`);
    logger.info('\nSource Distribution:');

    Object.entries(sourceStats).forEach(([source, stats]) => {
      const avgQty = Math.round(stats.totalQuantity / stats.itemCount);
      logger.info(`  ${source}:`);
      logger.info(`    - Items: ${stats.itemCount}`);
      logger.info(`    - Total Qty: ${stats.totalQuantity.toLocaleString()}`);
      logger.info(`    - Avg Qty: ${avgQty}`);
    });

    logger.info(`\nInventory saved to: ${outputPath}`);

    return inventory;
  } catch (error) {
    logger.error('Failed to generate inventory:', error);
    throw error;
  }
}

/**
 * Generate source reference JSON
 */
export async function generateSources() {
  logger.info('Generating source reference JSON...');

  try {
    // Validate against schema
    const schemaPath = path.join(__dirname, 'schemas', 'aco-source-schema.json');
    const schema = JSON.parse(await fs.readFile(schemaPath, 'utf-8'));
    const validation = validateAgainstSchema(sourceDefinitions, schema);

    if (!validation.valid) {
      logger.error('Source validation failed:', validation.errors);
      throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
    }

    // Save sources
    const outputPath = path.join(__dirname, '..', 'data', 'buildright', 'sources.json');
    await fs.writeFile(outputPath, JSON.stringify(sourceDefinitions, null, 2));

    // Log source summary
    const enabledSources = sourceDefinitions.filter(s => s.enabled);
    const warehouseSources = sourceDefinitions.filter(s => s.source_code.includes('warehouse_'));
    const dropShipSources = sourceDefinitions.filter(s => s.source_code.includes('dropship'));

    logger.info('\n========================================');
    logger.info('✅ Source Generation Complete!');
    logger.info('========================================');
    logger.info(`Total sources: ${sourceDefinitions.length}`);
    logger.info(`Enabled sources: ${enabledSources.length}`);
    logger.info(`Warehouse sources: ${warehouseSources.length}`);
    logger.info(`Drop ship sources: ${dropShipSources.length}`);
    logger.info('\nSource List:');

    sourceDefinitions.forEach(source => {
      const type = source.source_code.includes('dropship') ? 'Drop Shipper' :
                   (source.source_code.includes('_west') || source.source_code.includes('_east')) ? 'RDC' :
                   'Regional Warehouse';
      logger.info(`  - ${source.source_code}: ${source.name} (${type})`);
    });

    logger.info(`\nSources saved to: ${outputPath}`);

    return sourceDefinitions;
  } catch (error) {
    logger.error('Failed to generate sources:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Generate sources first
    await generateSources();

    // Generate inventory
    await generateInventory();

    logger.info('\n✅ All inventory generation tasks completed successfully!');
  } catch (error) {
    logger.error('Inventory generation failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}