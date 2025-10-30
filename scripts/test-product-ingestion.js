import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getACOClient } from '../utils/aco-client.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PRODUCTS_FILE = path.join(__dirname, '../data/buildright/products.json');

async function testProductIngestion() {
  try {
    logger.info('Testing Product Ingestion with ACO Schema');

    // Load products
    const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const allProducts = JSON.parse(productsData);

    // Test with just first 2 products
    const testProducts = allProducts.slice(0, 2);

    logger.info(`Testing ingestion of ${testProducts.length} products`);
    logger.info(`Test SKUs: ${testProducts.map(p => p.sku).join(', ')}`);

    // Get ACO client
    const client = getACOClient();

    // Attempt ingestion
    logger.info('Sending products to ACO...');
    const response = await client.createProducts(testProducts);

    logger.info('Ingestion Response:', JSON.stringify(response, null, 2));

    if (response.status === 'SUCCESS') {
      logger.info('✅ Products ingested successfully!');
      logger.info('Schema validation passed!');
    } else if (response.status === 'FAILED') {
      logger.error('❌ Ingestion failed');
      logger.error('Errors:', JSON.stringify(response.errors, null, 2));
    }

  } catch (error) {
    logger.error('Test failed:', error.message);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
}

testProductIngestion();
