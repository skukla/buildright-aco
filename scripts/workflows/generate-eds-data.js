#!/usr/bin/env node

/**
 * Generate EDS-Compatible Data Files
 * 
 * Transforms ACO-format data into EDS-compatible JSON files for the buildright-eds frontend.
 * 
 * This script:
 * 1. Reads ACO data from buildright-aco/data/buildright/
 * 2. Transforms to EDS format
 * 3. Writes to buildright-eds/data/
 * 
 * Output files:
 * - mock-products.json: Product catalog for EDS frontend
 * - project-recommendations.json: Templates and packages for personas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger('generate-eds-data');

// Paths
const ACO_DATA_DIR = path.join(__dirname, '../data/buildright');
const EDS_OUTPUT_DIR = path.join(__dirname, '../../buildright-eds/data');

/**
 * Transform ACO products to EDS format
 * 
 * ACO format includes complex attributes array, ACO-specific fields
 * EDS format needs simpler structure with flattened attributes
 */
function generateEDSProducts() {
  logger.info('Generating EDS products from ACO data...');
  
  const acoProductsPath = path.join(ACO_DATA_DIR, 'products.json');
  const acoPricesPath = path.join(ACO_DATA_DIR, 'prices.json');
  
  if (!fs.existsSync(acoProductsPath)) {
    logger.warn('products.json not found. Run generate-products.js first.');
    return null;
  }
  
  const acoProducts = JSON.parse(fs.readFileSync(acoProductsPath, 'utf-8'));
  
  // Load prices if available
  let acoPrices = [];
  if (fs.existsSync(acoPricesPath)) {
    acoPrices = JSON.parse(fs.readFileSync(acoPricesPath, 'utf-8'));
  }
  
  // Create price lookup by SKU and price book
  const priceMap = {};
  acoPrices.forEach(priceEntry => {
    if (!priceMap[priceEntry.sku]) {
      priceMap[priceEntry.sku] = {};
    }
    if (!priceMap[priceEntry.sku][priceEntry.priceBookId]) {
      priceMap[priceEntry.sku][priceEntry.priceBookId] = [];
    }
    priceMap[priceEntry.sku][priceEntry.priceBookId].push(priceEntry);
  });
  
  const edsProducts = acoProducts.map(product => {
    // Flatten attributes array to object for easier access in EDS
    const attributes = {};
    if (product.attributes && Array.isArray(product.attributes)) {
      product.attributes.forEach(attr => {
        // ACO attributes use 'values' array, not 'value'
        // For single-value attributes, use first element; for multi-value, keep array
        if (attr.values && attr.values.length === 1) {
          attributes[attr.code] = attr.values[0];
        } else if (attr.values && attr.values.length > 1) {
          attributes[attr.code] = attr.values;
        }
      });
    }
    
    // Get retail pricing (base price book)
    const retailPrices = priceMap[product.sku]?.['US-Retail'] || [];
    const basePrice = retailPrices.length > 0 ? (retailPrices[0].amount || retailPrices[0].value || 0) : 0;
    
    return {
      // Core product info
      id: product.sku,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      
      // Pricing (base retail)
      price: basePrice,
      
      // Images
      image: product.images?.[0]?.url || `/images/products/${product.sku}.png`,
      images: product.images || [],
      
      // Categories
      categoryIds: product.categoryIds || [],
      
      // Flattened attributes for easy filtering
      attributes,
      
      // Meta tags (flattened from ACO metaTags object)
      metaTitle: product.metaTags?.title || null,
      metaDescription: product.metaTags?.description || null,
      metaKeyword: product.metaTags?.keywords ? product.metaTags.keywords.join(', ') : null,
      
      // Computed fields for EDS
      inStock: true, // Mock - real inventory would come from MSI
      rating: 4.5,   // Mock - real ratings would come from reviews
      reviewCount: Math.floor(Math.random() * 100) + 10,
      
      // Type info
      type: product.type || 'simple',
      
      // Preserve original for reference
      _acoSku: product.sku
    };
  });
  
  logger.info(`Transformed ${edsProducts.length} products to EDS format`);
  return edsProducts;
}

/**
 * Generate project recommendations JSON
 * Combines templates, packages, and deck kits for persona-specific views
 */
function generateProjectRecommendations(edsProducts) {
  logger.info('Generating project recommendations...');
  
  if (!edsProducts) {
    logger.warn('No products available for recommendations');
    return null;
  }
  
  // Helper: Find products by attribute
  const findProducts = (attributeKey, attributeValue) => {
    return edsProducts.filter(p => p.attributes[attributeKey] === attributeValue);
  };
  
  // SARAH'S TEMPLATES (Production Builder)
  const templates = [
    {
      id: 'sedona',
      name: 'The Sedona',
      description: '2-story single-family home with optional bonus room',
      sqft: 2450,
      stories: 2,
      bedrooms: 4,
      bathrooms: 2.5,
      image: '/images/floor-plans/sedona.png',
      finishedImage: '/images/finished-homes/sedona.jpg',
      variants: [
        {
          id: 'standard',
          name: 'Standard',
          description: 'Base 2,450 sqft layout'
        },
        {
          id: 'bonus_room',
          name: 'With Bonus Room',
          description: 'Adds 800 sqft bonus room above garage',
          additionalSqft: 800
        }
      ],
      // Template BOM would be populated from products with construction_phase attributes
      phases: [
        {
          phase: 'foundation_framing',
          name: 'Foundation & Framing',
          week: 1,
          products: findProducts('construction_phase', 'foundation_framing').slice(0, 15).map(p => ({
            sku: p.sku,
            name: p.name,
            quantity: 1,
            multiplier: 'per_unit'
          }))
        },
        {
          phase: 'envelope',
          name: 'Building Envelope',
          week: 3,
          products: findProducts('construction_phase', 'envelope').slice(0, 10).map(p => ({
            sku: p.sku,
            name: p.name,
            quantity: 1,
            multiplier: 'per_unit'
          }))
        }
      ]
    }
  ];
  
  // LISA'S PACKAGES (Remodeling Contractor)
  const bathroomPackages = ['good', 'better', 'best'].map(tier => {
    const tierProducts = findProducts('package_tier', tier);
    const bathroomProducts = tierProducts.filter(p => 
      p.attributes.room_category === 'bathroom' || p.attributes.room_category === 'any'
    );
    
    const tierPrices = {
      good: 8500,
      better: 14200,
      best: 23800
    };
    
    return {
      id: `bathroom-${tier}`,
      tier,
      name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Package`,
      type: 'bathroom_remodel',
      price: tierPrices[tier],
      image: `/images/packages/bathroom-${tier}.jpg`,
      products: bathroomProducts.slice(0, 12).map(p => ({
        sku: p.sku,
        name: p.name,
        category: p.attributes.product_category || 'general',
        defaultQuantity: 1,
        swappable: true // Indicates product can be swapped within tier
      })),
      features: tier === 'good' ? [
        'Builder-grade fixtures',
        'Standard bathtub',
        'Laminate vanity',
        'Ceramic tile'
      ] : tier === 'better' ? [
        'Mid-range fixtures',
        'Acrylic tub',
        'Semi-custom vanity',
        'Porcelain tile'
      ] : [
        'Premium fixtures',
        'Soaking tub',
        'Custom vanity',
        'Natural stone tile'
      ]
    };
  });
  
  // DAVID'S DECK KITS (Pro Homeowner)
  const deckKits = [
    {
      id: 'deck-16x20-composite',
      name: '16x20 Composite Deck Kit',
      type: 'deck',
      shape: 'rectangular',
      material: 'composite',
      dimensions: { width: 16, depth: 20, sqft: 320 },
      price: 6817,
      image: '/images/kits/deck-composite.jpg',
      products: findProducts('deck_compatible', true)
        .filter(p => p.attributes.deck_material_type === 'composite')
        .slice(0, 8)
        .map(p => ({
          sku: p.sku,
          name: p.name,
          quantity: 1,
          category: p.attributes.product_category || 'decking'
        })),
      features: [
        'Low maintenance composite decking',
        'Aluminum railing system',
        'Hidden fastener system',
        'LED post cap lights',
        'Complete hardware kit',
        'Installation guide included'
      ],
      requirements: [
        'Intermediate DIY skill level',
        '4-6 weekend project',
        'Basic tools required'
      ],
      notIncluded: [
        'Concrete mix for footings',
        'Post-hole digger',
        'Power tools'
      ]
    }
  ];
  
  // KEVIN'S RESTOCK CATEGORIES (Store Manager)
  const restockCategories = ['high', 'medium', 'low'].map(velocity => {
    const velocityProducts = findProducts('store_velocity_category', velocity);
    
    return {
      id: `restock-${velocity}`,
      velocityCategory: velocity,
      name: `${velocity.charAt(0).toUpperCase() + velocity.slice(1)} Velocity Items`,
      frequency: velocity === 'high' ? '2-3 times per week' : 
                 velocity === 'medium' ? 'Weekly' : 'As needed',
      products: velocityProducts.slice(0, 20).map(p => ({
        sku: p.sku,
        name: p.name,
        // Mock current stock levels
        currentStock: Math.floor(Math.random() * 50),
        recommendedStock: p.attributes.recommended_restock_quantity || 100,
        daysSupply: p.attributes.typical_days_supply || 7,
        velocityCategory: velocity,
        restockPriority: p.attributes.restock_priority || 'medium'
      }))
    };
  });
  
  return {
    personas: {
      sarah: {
        id: 'sarah',
        name: 'Sarah Martinez',
        title: 'Production Builder',
        description: 'Managing 12 spec homes per year',
        attributes: {
          construction_phase: 'foundation_framing',
          customer_tier: 'Production-Builder'
        }
      },
      marcus: {
        id: 'marcus',
        name: 'Marcus Johnson',
        title: 'General Contractor',
        description: 'Custom homes and major renovations',
        attributes: {
          construction_phase: 'foundation_framing',
          quality_tier: 'professional',
          customer_tier: 'Trade-Professional'
        }
      },
      lisa: {
        id: 'lisa',
        name: 'Lisa Chen',
        title: 'Remodeling Contractor',
        description: 'High-end residential remodels',
        attributes: {
          package_tier: 'better',
          room_category: 'bathroom',
          customer_tier: 'Trade-Professional'
        }
      },
      david: {
        id: 'david',
        name: 'David Thompson',
        title: 'Pro Homeowner',
        description: 'DIY enthusiast building a deck',
        attributes: {
          deck_compatible: true,
          deck_shape: 'rectangular',
          deck_material_type: 'composite',
          customer_tier: 'Retail-Registered'
        }
      },
      kevin: {
        id: 'kevin',
        name: 'Kevin Rodriguez',
        title: 'Store Manager',
        description: 'Managing inventory for pro contractor store',
        attributes: {
          store_velocity_category: 'high_volume',
          restock_priority: 'high',
          customer_tier: 'Wholesale-Reseller'
        }
      }
    },
    templates,
    packages: {
      bathroom: bathroomPackages
    },
    deckKits,
    restockCategories,
    metadata: {
      generated: new Date().toISOString(),
      version: '2.0',
      source: 'buildright-aco'
    }
  };
}

/**
 * Main execution function
 */
async function main() {
  logger.info('Starting EDS data generation...');
  logger.info(`Source: ${ACO_DATA_DIR}`);
  logger.info(`Output: ${EDS_OUTPUT_DIR}`);
  
  try {
    // Ensure output directory exists
    if (!fs.existsSync(EDS_OUTPUT_DIR)) {
      logger.warn(`Output directory does not exist: ${EDS_OUTPUT_DIR}`);
      logger.warn('Creating output directory...');
      fs.mkdirSync(EDS_OUTPUT_DIR, { recursive: true });
    }
    
    // Generate EDS products
    const edsProducts = generateEDSProducts();
    
    if (edsProducts) {
      // Write products as array (data-mock.js will handle the format)
      const productsOutputPath = path.join(EDS_OUTPUT_DIR, 'mock-products.json');
      fs.writeFileSync(productsOutputPath, JSON.stringify(edsProducts, null, 2));
      logger.info(`✓ Generated mock-products.json (${edsProducts.length} products)`);
      
      // Generate project recommendations
      const recommendations = generateProjectRecommendations(edsProducts);
      
      if (recommendations) {
        const recsOutputPath = path.join(EDS_OUTPUT_DIR, 'project-recommendations.json');
        fs.writeFileSync(recsOutputPath, JSON.stringify(recommendations, null, 2));
        logger.info('✓ Generated project-recommendations.json');
        logger.info(`  - Templates: ${recommendations.templates.length}`);
        logger.info(`  - Bathroom packages: ${recommendations.packages.bathroom.length}`);
        logger.info(`  - Deck kits: ${recommendations.deckKits.length}`);
        logger.info(`  - Restock categories: ${recommendations.restockCategories.length}`);
      }
    }
    
    logger.info('');
    logger.info('EDS data generation complete!');
    logger.info('');
    logger.info('Output files:');
    logger.info(`  - ${EDS_OUTPUT_DIR}/mock-products.json`);
    logger.info(`  - ${EDS_OUTPUT_DIR}/project-recommendations.json`);
    logger.info('');
    logger.info('Next steps:');
    logger.info('  1. Review generated files in buildright-eds/data/');
    logger.info('  2. Test frontend mock ACO service with new data');
    logger.info('  3. Validate persona-specific filtering works correctly');
    
  } catch (error) {
    logger.error('Error generating EDS data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

