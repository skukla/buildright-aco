#!/usr/bin/env node
/**
 * Find and delete orphaned products (in ACO but not in local data)
 * 
 * Usage:
 *   node scripts/delete-orphans.js           # Find orphans only
 *   node scripts/delete-orphans.js --delete  # Find and delete orphans
 */

import { promises as fs } from 'fs';
import { getACOClient } from '../utils/aco-client.js';
import logger from '../utils/logger.js';

const MESH_ENDPOINT = 'https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql';
const CATALOG_VIEW_ID = '6792f1d5-9e79-4813-8d8e-df5ed76e5692'; // BuildRight-Default view

const args = process.argv.slice(2);
const shouldDelete = args.includes('--delete');

async function getLocalSkus() {
  const dataDir = new URL('../data/buildright/', import.meta.url);
  
  const products = JSON.parse(await fs.readFile(new URL('products.json', dataDir), 'utf-8'));
  const variants = JSON.parse(await fs.readFile(new URL('variants.json', dataDir), 'utf-8'));
  
  return new Set([
    ...products.map(p => p.sku),
    ...variants.map(v => v.sku)
  ]);
}

async function getACOProducts() {
  // Fetch all products (limit 500 should cover our catalog)
  const response = await fetch(MESH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Catalog-View-Id': CATALOG_VIEW_ID
    },
    body: JSON.stringify({
      query: `{ BuildRight_productSearchFilter(phrase: "", limit: 500) { products { items { sku name } } totalCount } }`
    })
  });
  
  const data = await response.json();
  const result = data.data?.BuildRight_productSearchFilter;
  
  if (!result) {
    throw new Error('Failed to fetch ACO products: ' + JSON.stringify(data));
  }
  
  logger.info(`Total in ACO: ${result.totalCount}`);
  return result.products.items;
}

async function main() {
  logger.info('Find Orphaned Products');
  logger.info('');
  
  logger.info('Loading local SKUs...');
  const localSkus = await getLocalSkus();
  logger.info(`Local SKUs: ${localSkus.size}`);
  
  logger.info('Fetching ACO products...');
  const acoProducts = await getACOProducts();
  logger.info(`ACO products: ${acoProducts.length}`);
  logger.info('');
  
  const orphans = acoProducts.filter(p => !localSkus.has(p.sku));
  
  if (orphans.length === 0) {
    logger.info('No orphaned products found!');
    return;
  }
  
  logger.info(`Found ${orphans.length} orphaned product(s):`);
  orphans.forEach(p => logger.info(`  - ${p.sku}: ${p.name}`));
  logger.info('');
  
  if (!shouldDelete) {
    logger.info('Run with --delete to remove these products');
    return;
  }
  
  logger.info('Deleting orphaned products...');
  
  const client = getACOClient();
  const deleteRequest = orphans.map(p => ({
    sku: p.sku,
    source: { locale: 'en-US' }
  }));
  
  try {
    const result = await client.deleteProducts(deleteRequest);
    
    if (result.ok && result.data?.acceptedCount > 0) {
      logger.info(`Deleted ${result.data.acceptedCount} orphaned product(s)`);
      logger.info('Note: Search index may take a few minutes to update.');
    } else {
      logger.warn('Delete request returned but no items accepted');
      logger.info('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    logger.error('Delete failed:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

