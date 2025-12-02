import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Ajv from 'ajv';
import logger from '../utils/logger.js';
import { SeededRandom } from '../utils/random-seed.js';
import { generateSKU, resetSkuTracker } from '../utils/sku-generator.js';
import { PRODUCT_CATEGORIES, BRANDS, UNITS_OF_MEASURE } from './config/product-definitions.js';
import { generateProductDescription, generateMetaTags } from './utils/description-generator.js';
import { generateAttributes, getAttributeValue, getProjectTypes } from './utils/attribute-generator.js';
import { generateSlug, transformAttributesToACO, createBaseACOProduct } from './utils/product-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEED = 12345; // Fixed seed for deterministic output
const random = new SeededRandom(SEED);

// Paths
const OUTPUT_FILE = path.join(__dirname, '../data/buildright/products.json');
const CATEGORIES_FILE = path.join(__dirname, '../data/buildright/categories.json');
const METADATA_FILE = path.join(__dirname, '../data/buildright/metadata.json');
const SCHEMA_FILE = path.join(__dirname, './schemas/aco-product-schema.json');

/**
 * Load categories from Step 5 output
 */
async function loadCategories() {
  const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Load metadata from Step 5 output
 */
async function loadMetadata() {
  const data = await fs.readFile(METADATA_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Find category by name pattern
 */
function findCategoryByName(categories, pattern) {
  if (!pattern) return null;
  return categories.find(cat => {
    if (!cat || !cat.name) return false;
    const nameMatch = cat.name.toLowerCase().includes(pattern.toLowerCase());
    const urlKeyMatch = cat.urlKey && cat.urlKey.includes(pattern.toLowerCase());
    return nameMatch || urlKeyMatch;
  });
}

/**
 * Generate URL-friendly slug from product name
 */
// Slug generation now imported from utils/product-generator.js

/**
 * Get category route hierarchy (ACO format with categoryId)
 */
function getCategoryRoutes(categories, categoryId) {
  const routes = [];
  const category = categories.find(c => c.categoryId === categoryId);

  if (!category) return routes;

  // Add parent category if exists
  if (category.parentId) {
    const parentCategory = categories.find(c => c.categoryId === category.parentId);
    if (parentCategory) {
      routes.push({
        categoryId: parentCategory.categoryId,
        position: random.nextInt(1, 100)
      });
    }
  }

  // Add the category itself
  routes.push({
    categoryId: categoryId,
    position: random.nextInt(1, 100)
  });

  return routes;
}

// Attribute generation functions now imported from utils/attribute-generator.js

/**
 * Generate a simple product
 */
function generateSimpleProduct(template, category, subcategory, categories, metadata, index) {
  const brand = BRANDS[random.nextInt(0, BRANDS.length - 1)];
  const price = random.nextFloat(template.priceRange[0], template.priceRange[1]);

  const sku = generateSKU({
    category: category,
    subcategory: subcategory,
    type: 'simple',
    name: template.name,
    seed: SEED + index
  });

  // Find matching category
  const categoryObj = findCategoryByName(categories, subcategory) ||
                     findCategoryByName(categories, category) ||
                     categories[0];

  const routes = getCategoryRoutes(categories, categoryObj.categoryId);

  const categoryDef = PRODUCT_CATEGORIES[category];
  const categoryValue = categoryDef.attributeValue || category;

  const productName = `${brand} ${template.name}`;

  const attributes = generateAttributes(metadata, categoryValue, brand, template.uom, random, category, subcategory, sku, productName);

  // Helper function to add attribute with label from metadata
  // This function overrides any randomly-generated attribute values with template-specific values
  const addAttributeWithLabel = (code, value) => {
    if (value !== undefined && value !== null) {
      const existingIndex = attributes.findIndex(a => a.code === code);
      const metadataAttr = metadata.find(m => m.attributeId === code);
      
      const attributeObj = {
        code,
        label: metadataAttr?.label || null,
        value
      };
      
      if (existingIndex !== -1) {
        // Override existing randomly-generated value with template-specific value
        attributes[existingIndex] = attributeObj;
      } else {
        // Add new attribute
        attributes.push(attributeObj);
      }
    }
  };
  
  // Add persona-specific attributes from template (with duplicate check)
  addAttributeWithLabel('construction_phase', template.construction_phase);
  addAttributeWithLabel('quality_tier', template.quality_tier);
  addAttributeWithLabel('package_tier', template.package_tier);
  addAttributeWithLabel('room_category', template.room_category);
  addAttributeWithLabel('deck_compatible', template.deck_compatible);
  addAttributeWithLabel('deck_shape', template.deck_shape);
  addAttributeWithLabel('deck_material_type', template.deck_material_type);
  addAttributeWithLabel('deck_railing_compatible', template.deck_railing_compatible);
  addAttributeWithLabel('store_velocity_category', template.store_velocity_category);
  addAttributeWithLabel('recommended_restock_quantity', template.recommended_restock_quantity);
  addAttributeWithLabel('typical_days_supply', template.typical_days_supply);
  addAttributeWithLabel('restock_priority', template.restock_priority);
  
  // Add material specification attributes (Phase 1: ACO Composable Attributes)
  addAttributeWithLabel('lumber_dimension', template.lumber_dimension);
  addAttributeWithLabel('lumber_length', template.lumber_length);
  addAttributeWithLabel('concrete_type', template.concrete_type);
  addAttributeWithLabel('concrete_psi', template.concrete_psi);
  addAttributeWithLabel('roofing_material', template.roofing_material);
  addAttributeWithLabel('roofing_style', template.roofing_style);
  addAttributeWithLabel('siding_material', template.siding_material);
  addAttributeWithLabel('flooring_material', template.flooring_material);
  addAttributeWithLabel('paint_type', template.paint_type);
  addAttributeWithLabel('paint_finish', template.paint_finish);
  addAttributeWithLabel('window_operation_type', template.window_operation_type);
  addAttributeWithLabel('window_material', template.window_material);
  addAttributeWithLabel('window_glazing_type', template.window_glazing_type);
  addAttributeWithLabel('door_type', template.door_type);
  addAttributeWithLabel('door_material', template.door_material);
  addAttributeWithLabel('door_core_type', template.door_core_type);
  addAttributeWithLabel('drywall_thickness', template.drywall_thickness);
  addAttributeWithLabel('fastener_type', template.fastener_type);
  addAttributeWithLabel('fastener_subtype', template.fastener_subtype);
  addAttributeWithLabel('sheathing_location', template.sheathing_location);
  addAttributeWithLabel('underlayment_type', template.underlayment_type);
  addAttributeWithLabel('insulation_type', template.insulation_type);
  addAttributeWithLabel('insulation_r_value', template.insulation_r_value);
  addAttributeWithLabel('light_type', template.light_type);
  addAttributeWithLabel('light_technology', template.light_technology);
  addAttributeWithLabel('fixture_type', template.fixture_type);
  addAttributeWithLabel('fixture_location', template.fixture_location);

  // Generate description and meta tags
  const description = template.description || generateProductDescription(categoryValue, brand, template.uom, productName);
  const metaTags = generateMetaTags(productName, brand, categoryValue, subcategory);

  // Use utility to create ACO product with proper attribute transformation
  return createBaseACOProduct({
    sku,
    name: productName,
    description,
    attributes,
    metaTags
  });
}

/**
 * Generate a service product
 */
function generateServiceProduct(service, category, categories, metadata, index) {
  const price = random.nextFloat(service.priceRange[0], service.priceRange[1]);

  const sku = generateSKU({
    category: 'services',
    type: 'service',
    name: service.name,
    seed: SEED + index + 1000
  });

  // Find matching category
  const categoryObj = findCategoryByName(categories, category) || categories[0];
  const routes = getCategoryRoutes(categories, categoryObj.categoryId);

  const categoryDef = PRODUCT_CATEGORIES[category];
  const categoryValue = categoryDef.attributeValue || category;

  const attributes = generateAttributes(metadata, categoryValue, 'BuildRight Services', 'SERVICE', random, category, 'services', sku, service.name, true);
  
  // Generate description and meta tags
  const description = service.description || generateProductDescription(categoryValue, 'BuildRight Services', 'SERVICE', service.name);
  const metaTags = generateMetaTags(service.name, 'BuildRight Services', categoryValue, 'services');

  // Use utility to create ACO product with proper attribute transformation
  return createBaseACOProduct({
    sku,
    name: service.name,
    description,
    attributes,
    metaTags
  });
}

/**
 * Main generation function
 */
async function generateProducts() {
  try {
    logger.info('Product Generation Started');

    // Reset SKU tracker for clean generation
    resetSkuTracker();

    // Load dependencies
    const categories = await loadCategories();
    const metadata = await loadMetadata();

    // Load and validate schema (DISABLED - ACO API will validate)
    // const schemaData = await fs.readFile(SCHEMA_FILE, 'utf-8');
    // const schema = JSON.parse(schemaData);
    // const ajv = new Ajv();
    // const validate = ajv.compile(schema);

    const products = [];
    let productIndex = 0;

    // Generate simple products (60 total - 12 per category)
    for (const [categoryKey, categoryDef] of Object.entries(PRODUCT_CATEGORIES)) {
      for (const [subcategoryKey, subcategoryDef] of Object.entries(categoryDef.subcategories)) {
        if (subcategoryKey === 'services') continue;

        if (subcategoryDef.simple) {
          // Generate 6 products from each subcategory (to reach 12 per main category)
          for (let i = 0; i < Math.min(6, subcategoryDef.simple.length); i++) {
            const template = subcategoryDef.simple[i];
            const product = generateSimpleProduct(
              template,
              categoryKey,
              subcategoryKey,
              categories,
              metadata,
              productIndex++
            );

            // Validate product (DISABLED - ACO API will validate)
            // if (!validate(product)) {
            //   logger.error('Product validation failed:', validate.errors);
            //   logger.error('Product:', product);
            //   throw new Error(`Product validation failed for ${product.sku}`);
            // }

            products.push(product);
          }
        }
      }
    }

    // Add remaining products to reach 60 simple products
    const remainingCount = 60 - products.length;
    if (remainingCount > 0) {
      // Distribute remaining products across categories
      const categoriesArray = Object.keys(PRODUCT_CATEGORIES);
      for (let i = 0; i < remainingCount; i++) {
        const categoryKey = categoriesArray[i % categoriesArray.length];
        const categoryDef = PRODUCT_CATEGORIES[categoryKey];
        const subcategories = Object.keys(categoryDef.subcategories).filter(k => k !== 'services');
        const subcategoryKey = subcategories[i % subcategories.length];
        const subcategoryDef = categoryDef.subcategories[subcategoryKey];

        if (subcategoryDef.simple && subcategoryDef.simple.length > 0) {
          const template = subcategoryDef.simple[i % subcategoryDef.simple.length];
          const product = generateSimpleProduct(
            template,
            categoryKey,
            subcategoryKey,
            categories,
            metadata,
            productIndex++
          );

          // Validate product (DISABLED - ACO API will validate)
          // if (!validate(product)) {
          //   logger.error('Product validation failed:', validate.errors);
          //   throw new Error(`Product validation failed for ${product.sku}`);
          // }

          products.push(product);
        }
      }
    }

    // Generate service products (10 total - 2 per category)
    for (const [categoryKey, categoryDef] of Object.entries(PRODUCT_CATEGORIES)) {
      if (categoryDef.subcategories.services) {
        for (const service of categoryDef.subcategories.services) {
          const product = generateServiceProduct(
            service,
            categoryKey,
            categories,
            metadata,
            productIndex++
          );

          // Validate product (DISABLED - ACO API will validate)
          // if (!validate(product)) {
          //   logger.error('Service product validation failed:', validate.errors);
          //   throw new Error(`Product validation failed for ${product.sku}`);
          // }

          products.push(product);
        }
      }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(outputDir, { recursive: true });

    // Write products to file (already in ACO schema format)
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(products, null, 2));

    // Count by checking SKU prefix
    const simpleCount = products.filter(p => !p.sku.startsWith('SVC-')).length;
    const serviceCount = products.filter(p => p.sku.startsWith('SVC-')).length;

    logger.info(`Generated ${products.length} products`);
    logger.info(`- Simple products: ${simpleCount}`);
    logger.info(`- Service products: ${serviceCount}`);
    logger.info(`Output written to: ${OUTPUT_FILE}`);

    logger.info('Product Generation Complete');

  } catch (error) {
    logger.error('Product generation failed:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateProducts();
}

export default generateProducts;