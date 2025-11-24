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
 * Generate URL-friendly slug from product name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

/**
 * Select random attribute value based on type
 */
function getAttributeValue(attribute, random) {
  if (attribute.type === 'multiselect' && attribute.options) {
    // Select 1-3 random options and return as array
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
 * Get project types for a product based on its category
 * Returns array of project type values
 * @param {string} categoryValue - Product category
 * @param {object} random - Random number generator
 * @param {boolean} isService - Whether this is a service product
 */
function getProjectTypes(categoryValue, random, isService = false) {
  const allTypes = ['new_construction', 'remodel', 'repair', 'restoration'];

  // Services are always available for all project types
  if (isService) {
    return allTypes;
  }

  switch(categoryValue) {
    case 'structural_materials':
      // Structural materials primarily for new construction and remodels
      const structuralTypes = ['new_construction', 'remodel'];
      // 40% chance to also include repair
      if (random.nextFloat() < 0.4) {
        structuralTypes.push('repair');
      }
      return structuralTypes;

    case 'framing_insulation':
      // Framing used in construction, remodels, and restoration
      return ['new_construction', 'remodel', 'restoration'];

    case 'windows_doors':
      // Windows/doors for construction, remodels, and restoration
      return ['new_construction', 'remodel', 'restoration'];

    case 'fasteners_hardware':
      // Fasteners used in all project types
      return allTypes;

    case 'safety_equipment':
      // PPE needed for all project types
      return allTypes;

    default:
      // Default: new construction and remodel
      return ['new_construction', 'remodel'];
  }
}

/**
 * Generate product attributes (ACO format with value field)
 */
function generateAttributes(metadata, categoryValue, brand, uom, random, category, subcategory, sku, productName, isService = false) {
  const attributes = [];

  // Add required attributes
  const productCategoryAttr = metadata.find(m => m.attributeId === 'product_category');
  if (productCategoryAttr) {
    attributes.push({
      code: 'product_category',
      value: categoryValue
    });
  }

  // Find brand and UOM attributes
  const brandAttr = metadata.find(m => m.label === 'Brand' || m.attributeId === 'brand');
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

  // Add project_types attribute with intelligent assignment based on category
  const projectTypesAttr = metadata.find(m => m.attributeId === 'project_types');
  if (projectTypesAttr) {
    const projectTypes = getProjectTypes(categoryValue, random, isService);
    attributes.push({
      code: 'project_types',
      value: projectTypes
    });
  }

  // Add some optional attributes (excluding already-added attributes)
  const optionalAttrs = metadata.filter(m =>
    !m.isRequired &&
    m.attributeId !== 'product_category' &&
    m.attributeId !== 'project_types'
  );
  const numOptional = random.nextInt(2, Math.min(5, optionalAttrs.length));

  for (let i = 0; i < numOptional; i++) {
    const attr = optionalAttrs[random.nextInt(0, optionalAttrs.length - 1)];
    if (!attributes.find(a => a.code === attr.attributeId)) {
      const attrValue = getAttributeValue(attr, random);
      attributes.push({
        code: attr.attributeId,
        value: attrValue
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

  const productName = `${brand} ${template.name}`;

  const attributes = generateAttributes(metadata, categoryValue, brand, template.uom, random, category, subcategory, sku, productName);

  // Add persona-specific attributes from template
  if (template.construction_phase) {
    attributes.push({
      code: 'construction_phase',
      value: template.construction_phase
    });
  }
  
  if (template.quality_tier) {
    attributes.push({
      code: 'quality_tier',
      value: template.quality_tier
    });
  }
  
  if (template.package_tier) {
    attributes.push({
      code: 'package_tier',
      value: template.package_tier
    });
  }
  
  if (template.room_category) {
    attributes.push({
      code: 'room_category',
      value: template.room_category
    });
  }
  
  if (template.deck_compatible !== undefined) {
    attributes.push({
      code: 'deck_compatible',
      value: template.deck_compatible
    });
  }
  
  if (template.deck_shape) {
    attributes.push({
      code: 'deck_shape',
      value: template.deck_shape
    });
  }
  
  if (template.deck_material_type) {
    attributes.push({
      code: 'deck_material_type',
      value: template.deck_material_type
    });
  }
  
  if (template.deck_railing_compatible) {
    attributes.push({
      code: 'deck_railing_compatible',
      value: template.deck_railing_compatible
    });
  }
  
  if (template.store_velocity_category) {
    attributes.push({
      code: 'store_velocity_category',
      value: template.store_velocity_category
    });
  }
  
  if (template.recommended_restock_quantity) {
    attributes.push({
      code: 'recommended_restock_quantity',
      value: template.recommended_restock_quantity
    });
  }
  
  if (template.typical_days_supply) {
    attributes.push({
      code: 'typical_days_supply',
      value: template.typical_days_supply
    });
  }
  
  if (template.restock_priority) {
    attributes.push({
      code: 'restock_priority',
      value: template.restock_priority
    });
  }

  // Generate slug from product name
  const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // ACO FeedProduct schema (v1.1.0+)
  return {
    sku: sku,
    source: { locale: 'en-US' },
    name: productName,
    slug: slug,
    description: template.description || '',
    status: 'ENABLED',
    visibleIn: ['CATALOG', 'SEARCH'],
    attributes: attributes.map(attr => ({
      code: attr.code,
      // ACO multiselect workaround: convert arrays to comma-separated strings
      // Instead of values: ["val1", "val2"], ACO expects values: ["val1, val2"]
      values: Array.isArray(attr.value) 
        ? [attr.value.join(', ')] 
        : [String(attr.value)]
    }))
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

  const attributes = generateAttributes(metadata, categoryValue, 'BuildRight Services', 'SERVICE', random, category, 'services', sku, service.name, true);

  // Generate slug from service name
  const slug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  
  // ACO FeedProduct schema (v1.1.0+)
  return {
    sku: sku,
    source: { locale: 'en-US' },
    name: service.name,
    slug: slug,
    description: service.description || '',
    status: 'ENABLED',
    visibleIn: ['CATALOG', 'SEARCH'],
    attributes: attributes.map(attr => ({
      code: attr.code,
      // ACO multiselect workaround: convert arrays to comma-separated strings
      // Instead of values: ["val1", "val2"], ACO expects values: ["val1, val2"]
      values: Array.isArray(attr.value) 
        ? [attr.value.join(', ')] 
        : [String(attr.value)]
    }))
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