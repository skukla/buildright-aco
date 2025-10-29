import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Ajv from 'ajv';
import logger from '../utils/logger.js';
import { SeededRandom } from '../utils/random-seed.js';
import { generateSKU, resetSkuTracker } from '../utils/sku-generator.js';
import { PRODUCT_CATEGORIES, BRANDS, UNITS_OF_MEASURE } from './config/product-definitions.js';

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
 * Get category route hierarchy
 */
function getCategoryRoutes(categories, categoryId) {
  const routes = [];
  const category = categories.find(c => c.categoryId === categoryId);

  if (!category) return routes;

  // Add the category itself
  routes.push({
    categoryId: category.categoryId,
    position: random.nextInt(1, 100)
  });

  // Add parent category if exists
  if (category.parentId) {
    routes.push({
      categoryId: category.parentId,
      position: random.nextInt(1, 100)
    });
  }

  return routes;
}

/**
 * Select random attribute value based on type
 */
function getAttributeValue(attribute, random) {
  if (attribute.type === 'multiselect' && attribute.options) {
    // Select 1-3 random options
    const numOptions = random.nextInt(1, Math.min(3, attribute.options.length));
    const selected = [];
    const optionsCopy = [...attribute.options];

    for (let i = 0; i < numOptions; i++) {
      const index = random.nextInt(0, optionsCopy.length - 1);
      selected.push(optionsCopy[index].value);
      optionsCopy.splice(index, 1);
    }

    return selected;
  } else if (attribute.type === 'select' && attribute.options) {
    const index = random.nextInt(0, attribute.options.length - 1);
    return attribute.options[index].value;
  } else if (attribute.type === 'boolean') {
    return random.nextFloat() > 0.5;
  } else if (attribute.type === 'number') {
    return random.nextInt(10, 1000);
  } else {
    // Text type - generate some sample text
    const texts = ['Premium quality', 'Professional grade', 'Heavy duty', 'Standard', 'Economy'];
    return texts[random.nextInt(0, texts.length - 1)];
  }
}

/**
 * Generate product attributes
 */
function generateAttributes(metadata, categoryValue, brand, uom, random) {
  const attributes = [];

  // Add required attributes
  attributes.push({
    code: 'attr_001', // product_category
    value: categoryValue
  });

  // Find brand and UOM attributes
  const brandAttr = metadata.find(m => m.label === 'Brand');
  if (brandAttr && brandAttr.options) {
    // Use valid brand option from metadata
    const brandOption = brandAttr.options[random.nextInt(0, brandAttr.options.length - 1)];
    attributes.push({
      code: brandAttr.attributeId,
      value: brandOption.value
    });
  } else if (brandAttr) {
    attributes.push({
      code: brandAttr.attributeId,
      value: brand
    });
  }

  const uomAttr = metadata.find(m => m.label === 'Unit of Measure');
  if (uomAttr) {
    attributes.push({
      code: uomAttr.attributeId,
      value: uom
    });
  }

  // Add some optional attributes
  const optionalAttrs = metadata.filter(m => !m.isRequired && m.attributeId !== 'attr_001');
  const numOptional = random.nextInt(2, Math.min(5, optionalAttrs.length));

  for (let i = 0; i < numOptional; i++) {
    const attr = optionalAttrs[random.nextInt(0, optionalAttrs.length - 1)];
    if (!attributes.find(a => a.code === attr.attributeId)) {
      attributes.push({
        code: attr.attributeId,
        value: getAttributeValue(attr, random)
      });
    }
  }

  return attributes;
}

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

  const attributes = generateAttributes(metadata, categoryValue, brand, template.uom, random);

  return {
    sku: sku,
    name: `${brand} ${template.name}`,
    type: 'simple',
    status: 'enabled',
    visibility: 'both',
    price: Math.round(price * 100) / 100,
    attributes: attributes,
    routes: routes,
    description: `High-quality ${template.name} from ${brand}`,
    shortDescription: `${template.name} - ${template.uom}`,
    weight: random.nextFloat(1, 50),
    metaTitle: `${template.name} | ${brand}`,
    metaDescription: `Shop ${brand} ${template.name} at BuildRight. Professional grade construction materials.`,
    metaKeywords: `${category}, ${subcategory}, ${brand}, construction, building materials`
  };
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

  const attributes = generateAttributes(metadata, categoryValue, 'BuildRight Services', 'SERVICE', random);

  return {
    sku: sku,
    name: service.name,
    type: 'service',
    status: 'enabled',
    visibility: 'both',
    price: Math.round(price * 100) / 100,
    attributes: attributes,
    routes: routes,
    description: `Professional ${service.name.toLowerCase()} provided by certified technicians`,
    shortDescription: `Expert ${service.name}`,
    weight: 0,
    metaTitle: `${service.name} | BuildRight Services`,
    metaDescription: `Professional ${service.name} available. Expert installation and consultation services.`,
    metaKeywords: `service, installation, consultation, ${category}, professional`
  };
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

    // Load and validate schema
    const schemaData = await fs.readFile(SCHEMA_FILE, 'utf-8');
    const schema = JSON.parse(schemaData);
    const ajv = new Ajv();
    const validate = ajv.compile(schema);

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

            // Validate product
            if (!validate(product)) {
              logger.error('Product validation failed:', validate.errors);
              logger.error('Product:', product);
              throw new Error(`Product validation failed for ${product.sku}`);
            }

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

          // Validate product
          if (!validate(product)) {
            logger.error('Product validation failed:', validate.errors);
            throw new Error(`Product validation failed for ${product.sku}`);
          }

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

          // Validate product
          if (!validate(product)) {
            logger.error('Service product validation failed:', validate.errors);
            throw new Error(`Product validation failed for ${product.sku}`);
          }

          products.push(product);
        }
      }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(outputDir, { recursive: true });

    // Write products to file
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(products, null, 2));

    logger.info(`Generated ${products.length} products`);
    logger.info(`- Simple products: ${products.filter(p => p.type === 'simple').length}`);
    logger.info(`- Service products: ${products.filter(p => p.type === 'service').length}`);
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