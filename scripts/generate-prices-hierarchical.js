#!/usr/bin/env node

/**
 * Generate Prices Hierarchical Script
 * Creates comprehensive pricing data with regional adjustments, tier pricing, and volume discounts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../utils/logger.js';
import { SeededRandom } from '../utils/random-seed.js';
import {
  getBusinessTypeDiscount,
  applyRegionalAdjustment,
  getTierLevels,
  getVolumeDiscountLevels,
  isTierEligible,
  isVolumeEligible,
  isLumberProduct,
  formatPrice,
  generatePsychologicalPrice
} from '../utils/price-calculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger('generate-prices-hierarchical');

/**
 * Generates hierarchical prices for all products across all price books
 * @param {Array} products - Array of products to price
 * @param {Array} priceBooks - Array of price books
 * @returns {Array} Array of price entries
 */
export function generatePricesHierarchical(products, priceBooks, randomSeed = 12345) {
  const prices = [];
  const random = new SeededRandom(randomSeed);

  // Generate base prices once for all products
  const productBasePrices = new Map();
  products.forEach(product => {
    productBasePrices.set(product.sku, product.basePrice || generateBasePrice(product, random));
  });

  priceBooks.forEach(priceBook => {
    products.forEach(product => {
      // Get the consistent base price for this product
      let baseAmount = productBasePrices.get(product.sku);

      // Apply business-type discount first
      const businessDiscount = getBusinessTypeDiscount(priceBook.businessType);
      let discountedPrice = baseAmount * (1 - businessDiscount);

      // Then apply regional adjustments (after business discount)
      let finalPrice = applyRegionalAdjustment(discountedPrice, priceBook, product);

      // Standard price entry
      prices.push({
        id: `PRICE_${priceBook.priceBookId}_${product.sku}`,
        sku: product.sku,
        priceBookId: priceBook.priceBookId,
        amount: formatPrice(finalPrice),
        currency: 'USD',
        uom: product.uom || 'EA',
        effectiveDate: priceBook.effectiveDate || '2024-01-01',
        explicit: true
      });

      // Generate tier pricing for eligible products (only for first price book to avoid duplication)
      if (priceBooks.indexOf(priceBook) === 0 && isTierEligible(product)) {
        const tiers = getTierLevels();

        tiers.forEach((tier, idx) => {
          // Apply tier discount on top of the final price (includes business and regional adjustments)
          const tierPrice = finalPrice * (1 - tier.discount);

          prices.push({
            id: `PRICE_${priceBook.priceBookId}_${product.sku}_TIER${idx + 1}`,
            sku: product.sku,
            priceBookId: priceBook.priceBookId,
            amount: formatPrice(tierPrice),
            currency: 'USD',
            uom: product.uom || 'EA',
            tier: {
              minQty: tier.minQty,
              maxQty: tier.maxQty,
              discount: tier.discount
            },
            effectiveDate: priceBook.effectiveDate || '2024-01-01',
            explicit: true
          });
        });
      }

      // Generate volume discounts for bulk items
      if (priceBooks.indexOf(priceBook) === 0 && isVolumeEligible(product)) {
        const volumes = getVolumeDiscountLevels();

        volumes.forEach(vol => {
          // Apply volume discount on top of the final price (includes business and regional adjustments)
          const volumePrice = finalPrice * (1 - vol.discount);

          prices.push({
            id: `PRICE_${priceBook.priceBookId}_${product.sku}_VOL${vol.qty}`,
            sku: product.sku,
            priceBookId: priceBook.priceBookId,
            amount: formatPrice(volumePrice),
            currency: 'USD',
            uom: product.uom || 'EA',
            volumeDiscount: {
              qty: vol.qty,
              discount: vol.discount
            },
            effectiveDate: priceBook.effectiveDate || '2024-01-01',
            explicit: true
          });
        });
      }

      // Remove old tier and promotional logic - no longer needed
    });
  });

  return prices;
}

/**
 * Generates a base price for a product based on its category
 * @param {Object} product - Product to generate price for
 * @param {SeededRandom} random - Seeded random instance
 * @returns {number} Generated base price
 */
function generateBasePrice(product, random) {
  const categoryMultipliers = {
    'Lumber': { min: 10, max: 200 },
    'Hardware': { min: 5, max: 150 },
    'Tools': { min: 25, max: 500 },
    'Paint': { min: 15, max: 100 },
    'Electrical': { min: 10, max: 300 },
    'Plumbing': { min: 8, max: 250 },
    'Flooring': { min: 20, max: 400 },
    'Roofing': { min: 15, max: 350 },
    'Insulation': { min: 12, max: 180 },
    'Windows': { min: 50, max: 800 }
  };

  // Determine category from various sources
  let category = product.category;

  // If no direct category, try to infer from SKU
  if (!category && product.sku) {
    const skuPrefix = product.sku.substring(0, 3);
    const skuCategoryMap = {
      'LBR': 'Lumber',
      'HDW': 'Hardware',
      'TLS': 'Tools',
      'PNT': 'Paint',
      'ELC': 'Electrical',
      'PLB': 'Plumbing',
      'FLR': 'Flooring',
      'RFG': 'Roofing',
      'INS': 'Insulation',
      'WND': 'Windows'
    };
    category = skuCategoryMap[skuPrefix];
  }

  const range = categoryMultipliers[category] || { min: 10, max: 100 };
  const basePrice = range.min + random.next() * (range.max - range.min);

  return generatePsychologicalPrice(basePrice, random);
}

/**
 * Loads products from Step 6 outputs
 * @returns {Array} Combined array of all products
 */
function loadProducts() {
  const products = [];
  const dataDir = path.join(process.cwd(), 'data/buildright');

  // Load standard products
  const productsPath = path.join(dataDir, 'products.json');
  if (fs.existsSync(productsPath)) {
    const standardProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    products.push(...standardProducts);
    logger.info(`Loaded ${standardProducts.length} standard products`);
  }

  // Load variants
  const variantsPath = path.join(dataDir, 'variants.json');
  if (fs.existsSync(variantsPath)) {
    const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
    products.push(...variants);
    logger.info(`Loaded ${variants.length} product variants`);
  }

  // Load bundles
  const bundlesPath = path.join(dataDir, 'bundles.json');
  if (fs.existsSync(bundlesPath)) {
    const bundles = JSON.parse(fs.readFileSync(bundlesPath, 'utf8'));
    products.push(...bundles);
    logger.info(`Loaded ${bundles.length} product bundles`);
  }

  return products;
}

/**
 * Loads price books from previous generation
 * @returns {Array} Array of price books
 */
function loadPriceBooks() {
  const priceBooksPath = path.join(process.cwd(), 'data/buildright/price-books.json');

  if (!fs.existsSync(priceBooksPath)) {
    throw new Error('Price books file not found. Please run generate-price-books.js first.');
  }

  const priceBooks = JSON.parse(fs.readFileSync(priceBooksPath, 'utf8'));
  logger.info(`Loaded ${priceBooks.length} price books`);

  return priceBooks;
}

/**
 * Main execution function
 */
async function main() {
  logger.info('Starting hierarchical price generation...');

  try {
    // Initialize random seed for consistency
    const randomSeed = 12345;

    // Load products and price books
    const products = loadProducts();
    const priceBooks = loadPriceBooks();

    if (products.length === 0) {
      logger.error('No products found. Please run product generation scripts first.');
      process.exit(1);
    }

    logger.info(`Processing ${products.length} products across ${priceBooks.length} price books`);

    // Generate prices
    logger.info('Generating hierarchical prices...');
    const prices = generatePricesHierarchical(products, priceBooks, randomSeed);
    logger.info(`Generated ${prices.length} price entries`);

    // Validate prices
    const validationErrors = [];

    // Check for negative prices
    const negativePrices = prices.filter(p => p.amount < 0);
    if (negativePrices.length > 0) {
      validationErrors.push(`Found ${negativePrices.length} negative prices`);
    }

    // Check for excessive discounts (>25%)
    const excessiveDiscounts = prices.filter(p => {
      if (p.tier && p.tier.discount > 0.25) return true;
      if (p.volumeDiscount && p.volumeDiscount.discount > 0.25) return true;
      if (p.promotionalDiscount && p.promotionalDiscount > 0.25) return true;
      return false;
    });

    if (excessiveDiscounts.length > 0) {
      validationErrors.push(`Found ${excessiveDiscounts.length} prices with discounts > 25%`);
    }

    if (validationErrors.length > 0) {
      logger.error('Validation errors:', validationErrors);
      process.exit(1);
    }

    logger.info('All price validations passed');

    // Calculate statistics
    const stats = {
      totalPrices: prices.length,
      standardPrices: prices.filter(p => !p.tier && !p.volumeDiscount).length,
      tierPrices: prices.filter(p => p.tier).length,
      volumePrices: prices.filter(p => p.volumeDiscount).length,
      explicitPrices: prices.filter(p => p.explicit).length,
      inheritedPrices: prices.filter(p => !p.explicit).length,
      pricesByBook: {}
    };

    priceBooks.forEach(pb => {
      stats.pricesByBook[pb.priceBookId] = prices.filter(p => p.priceBookId === pb.priceBookId).length;
    });

    logger.info('Price generation statistics:', stats);

    // Write to file
    const outputPath = path.join(process.cwd(), 'data/buildright/prices.json');
    fs.writeFileSync(outputPath, JSON.stringify(prices, null, 2));
    logger.info(`Prices written to ${outputPath}`);

    // Log summary
    logger.info('Hierarchical price generation complete:');
    logger.info(`  Total prices: ${stats.totalPrices}`);
    logger.info(`  Standard prices: ${stats.standardPrices}`);
    logger.info(`  Tier prices: ${stats.tierPrices}`);
    logger.info(`  Volume prices: ${stats.volumePrices}`);
    logger.info(`  Explicit prices: ${stats.explicitPrices}`);
    logger.info(`  Inherited prices: ${stats.inheritedPrices}`);

    // Log business-type breakdown
    const businessTypes = ['RETAIL', 'CONTRACTOR', 'COMMERCIAL', 'WHOLESALE'];
    businessTypes.forEach(businessType => {
      const typePrices = prices.filter(p => {
        const pb = priceBooks.find(book => book.priceBookId === p.priceBookId);
        return pb && pb.businessType === businessType && !p.tier && !p.volumeDiscount;
      });
      logger.info(`  ${businessType} prices: ${typePrices.length}`);
    });

    // Log regional adjustments
    const westLumberPrices = prices.filter(p => {
      const pb = priceBooks.find(book => book.priceBookId === p.priceBookId);
      const prod = products.find(product => product.sku === p.sku);
      return pb && pb.region === 'West' && prod && isLumberProduct(prod) && !p.tier && !p.volumeDiscount;
    });
    logger.info(`  West lumber prices (with +3% adjustment): ${westLumberPrices.length}`);

  } catch (error) {
    logger.error('Error generating hierarchical prices:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}