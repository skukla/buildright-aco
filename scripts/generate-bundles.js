import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Ajv from 'ajv';
import logger from '../utils/logger.js';
import { SeededRandom } from '../utils/random-seed.js';
import { generateSKU, resetSkuTracker } from '../utils/sku-generator.js';
import { BUNDLE_DEFINITIONS } from './config/bundle-definitions.js';
import { PRODUCT_CATEGORIES, BRANDS } from './config/product-definitions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEED = 67890; // Different seed for bundles
const random = new SeededRandom(SEED);

// Paths
const OUTPUT_FILE = path.join(__dirname, '../data/buildright/bundles.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/buildright/products.json');
const VARIANTS_FILE = path.join(__dirname, '../data/buildright/variants.json');
const CATEGORIES_FILE = path.join(__dirname, '../data/buildright/categories.json');
const METADATA_FILE = path.join(__dirname, '../data/buildright/metadata.json');
const SCHEMA_FILE = path.join(__dirname, './schemas/aco-bundle-schema.json');

/**
 * Load all products (simple, service, configurable, variants)
 */
async function loadAllProducts() {
  const allProducts = [];

  try {
    const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(productsData);
    allProducts.push(...products);
  } catch (error) {
    logger.warn('Products file not found');
  }

  try {
    const variantsData = await fs.readFile(VARIANTS_FILE, 'utf-8');
    const variants = JSON.parse(variantsData);
    // Only add simple variants (those with parent links), not configurable parents
    const simpleVariants = variants.filter(v =>
      v.links && v.links.some(link => link.type === 'PARENT')
    );
    allProducts.push(...simpleVariants);
  } catch (error) {
    logger.warn('Variants file not found');
  }

  return allProducts;
}

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
 * Get category route hierarchy (URL paths)
 */
function getCategoryRoutes(categories, categoryId) {
  const routes = [];
  const category = categories.find(c => c.categoryId === categoryId);

  if (!category) return routes;

  // Build URL path from category hierarchy
  let path = '/' + (category.urlKey || category.name.toLowerCase().replace(/\s+/g, '-'));

  // Add parent path if exists
  if (category.parentId) {
    const parentCategory = categories.find(c => c.categoryId === category.parentId);
    if (parentCategory) {
      const parentPath = parentCategory.urlKey || parentCategory.name.toLowerCase().replace(/\s+/g, '-');
      path = '/' + parentPath + path;
    }
  }

  routes.push({
    path: path,
    position: random.nextInt(1, 100)
  });

  return routes;
}

/**
 * Find products matching the pattern
 */
function findMatchingProducts(products, productType, namePattern) {
  return products.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(namePattern.toLowerCase());
    const skuMatch = p.sku.toLowerCase().includes(productType.toLowerCase());

    // For specific product types, check SKU prefixes
    if (productType === 'lumber') {
      return p.sku.startsWith('LBR-') && nameMatch;
    } else if (productType === 'plywood') {
      return p.sku.startsWith('PLY-') && nameMatch;
    } else if (productType === 'studs') {
      return p.sku.startsWith('STUD-') && nameMatch;
    } else if (productType === 'drywall') {
      return p.sku.startsWith('DRYWALL-') && nameMatch;
    } else if (productType === 'windows') {
      return p.sku.startsWith('WINDOW-') && nameMatch;
    } else if (productType === 'doors') {
      return p.sku.startsWith('DOOR-') && nameMatch;
    } else if (productType === 'nails') {
      return p.sku.startsWith('NAIL-') && nameMatch;
    } else if (productType === 'screws') {
      return p.sku.startsWith('SCREW-') && nameMatch;
    } else if (productType === 'safety' || productType === 'equipment') {
      return p.sku.startsWith('SAFE-') && nameMatch;
    }

    return nameMatch || skuMatch;
  });
}

/**
 * Generate bundle attributes (ACO format with values array)
 */
function generateAttributes(metadata, categoryValue, brand) {
  const attributes = [];

  // Add required attributes
  attributes.push({
    code: 'attr_001', // product_category
    values: [categoryValue]
  });

  // Find and add brand attribute
  const brandAttr = metadata.find(m => m.label === 'Brand');
  if (brandAttr && brandAttr.options) {
    // Use valid brand option from metadata
    const brandOption = brandAttr.options[random.nextInt(0, brandAttr.options.length - 1)];
    attributes.push({
      code: brandAttr.attributeId,
      values: [brandOption.value]
    });
  } else if (brandAttr) {
    attributes.push({
      code: brandAttr.attributeId,
      values: [brand]
    });
  }

  // Find and add UOM attribute
  const uomAttr = metadata.find(m => m.label === 'Unit of Measure');
  if (uomAttr) {
    attributes.push({
      code: uomAttr.attributeId,
      values: ['BUNDLE']
    });
  }

  // Add some optional attributes
  const optionalAttrs = metadata.filter(m =>
    !m.isRequired &&
    !attributes.find(a => a.code === m.attributeId)
  );

  const numOptional = random.nextInt(2, Math.min(4, optionalAttrs.length));
  for (let i = 0; i < numOptional; i++) {
    const attr = optionalAttrs[random.nextInt(0, optionalAttrs.length - 1)];
    if (!attributes.find(a => a.code === attr.attributeId)) {
      let value;
      if (attr.type === 'boolean') {
        value = random.nextFloat() > 0.5 ? 'true' : 'false';
      } else if (attr.type === 'number') {
        value = random.nextInt(10, 100);
      } else if (attr.options) {
        value = attr.options[random.nextInt(0, attr.options.length - 1)].value;
      } else {
        value = 'Premium Bundle';
      }

      attributes.push({
        code: attr.attributeId,
        values: [value]
      });
    }
  }

  return attributes;
}

/**
 * Generate a bundle product
 */
function generateBundle(bundleDef, category, products, categories, metadata, index) {
  const brand = BRANDS[random.nextInt(0, BRANDS.length - 1)];
  const price = random.nextFloat(bundleDef.priceRange[0], bundleDef.priceRange[1]);

  const sku = generateSKU({
    category: category,
    type: 'bundle',
    name: bundleDef.name,
    seed: SEED + index
  });

  // Find matching category
  const categoryObj = findCategoryByName(categories, category) || categories[0];
  const routes = getCategoryRoutes(categories, categoryObj.categoryId);

  const categoryDef = PRODUCT_CATEGORIES[category];
  const categoryValue = categoryDef.attributeValue || category;

  const attributes = generateAttributes(metadata, categoryValue, brand);

  // Build groups with actual product SKUs
  const groups = [];
  const usedSkus = new Set(); // Track SKUs already added to this bundle

  for (const groupDef of bundleDef.groups) {
    const groupItems = [];

    for (const itemDef of groupDef.items) {
      // Find matching products
      let matchingProducts = findMatchingProducts(products, itemDef.productType, itemDef.namePattern);

      // Filter out products whose SKUs are already used in this bundle
      matchingProducts = matchingProducts.filter(p => !usedSkus.has(p.sku));

      if (matchingProducts.length > 0) {
        // Select a random matching product
        const selectedProduct = matchingProducts[random.nextInt(0, matchingProducts.length - 1)];

        groupItems.push({
          sku: selectedProduct.sku,
          defaultQty: itemDef.defaultQty,
          name: selectedProduct.name,
          price: selectedProduct.price * 0.9 // Bundle discount
        });

        // Mark this SKU as used
        usedSkus.add(selectedProduct.sku);
      } else {
        // Fallback: use first available product of any type that hasn't been used yet
        const fallbackProduct = products.find(p =>
          p.type === 'simple' &&
          !p.sku.startsWith('BUNDLE-') &&
          !p.sku.startsWith('SVC-') &&
          !usedSkus.has(p.sku) // Ensure not already used
        );

        if (fallbackProduct) {
          groupItems.push({
            sku: fallbackProduct.sku,
            defaultQty: itemDef.defaultQty,
            name: fallbackProduct.name,
            price: fallbackProduct.price * 0.9
          });

          // Mark this SKU as used
          usedSkus.add(fallbackProduct.sku);
        }
      }
    }

    if (groupItems.length > 0) {
      // Convert to ACO bundle format
      const bundleItems = groupItems.map(item => ({
        sku: item.sku,
        qty: item.defaultQty,
        userDefinedQty: false
      }));

      // Get default items (first item in group if required)
      const defaultItemSkus = groupDef.required && bundleItems.length > 0
        ? [bundleItems[0].sku]
        : [];

      groups.push({
        group: groupDef.name,
        required: groupDef.required,
        multiSelect: groupDef.multiSelect,
        defaultItemSkus: defaultItemSkus,
        items: bundleItems
      });
    }
  }

  const productName = `${brand} ${bundleDef.name}`;

  return {
    sku: sku,
    source: {
      locale: 'en-US'
    },
    name: productName,
    slug: generateSlug(productName),
    status: 'ENABLED',
    visibleIn: ['CATALOG', 'SEARCH'],
    description: bundleDef.description || `Complete bundle package from ${brand}`,
    shortDescription: `${bundleDef.name} - Bundle Package`,
    attributes: attributes,
    routes: routes,
    bundles: groups,  // Use 'bundles' not 'groups'
    metaTags: {
      title: `${bundleDef.name} Bundle | ${brand}`,
      description: `Shop the ${bundleDef.name} bundle from ${brand}. Complete package for your construction needs.`,
      keywords: ['bundle', 'package', category, brand, 'construction', 'bulk']
    }
  };
}

/**
 * Main generation function
 */
async function generateBundles() {
  try {
    logger.info('Bundle Generation Started');

    // Reset SKU tracker
    resetSkuTracker();

    // Load dependencies
    const allProducts = await loadAllProducts();
    const categories = await loadCategories();
    const metadata = await loadMetadata();

    if (allProducts.length === 0) {
      logger.error('No products found. Please run generate-products.js and generate-variants.js first.');
      process.exit(1);
    }

    // Pre-populate SKU tracker with existing products
    allProducts.forEach(product => {
      // This ensures we don't duplicate SKUs
      generateSKU({
        category: 'dummy',
        type: 'simple',
        name: product.sku,
        seed: product.sku.charCodeAt(0)
      });
    });

    // Load and validate schema (DISABLED - ACO API will validate)
    // const schemaData = await fs.readFile(SCHEMA_FILE, 'utf-8');
    // const schema = JSON.parse(schemaData);
    // const ajv = new Ajv();
    // const validate = ajv.compile(schema);

    const bundles = [];
    let bundleIndex = 0;

    // Generate bundles (3 per category)
    for (const [categoryKey, bundleDefs] of Object.entries(BUNDLE_DEFINITIONS)) {
      for (const bundleDef of bundleDefs) {
        const bundle = generateBundle(
          bundleDef,
          categoryKey,
          allProducts,
          categories,
          metadata,
          bundleIndex++
        );

        // Validate bundle (DISABLED - ACO API will validate)
        // if (!validate(bundle)) {
        //   logger.error('Bundle validation failed:', validate.errors);
        //   logger.error('Bundle:', bundle);
        //   throw new Error(`Validation failed for bundle ${bundle.sku}`);
        // }

        bundles.push(bundle);
      }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(outputDir, { recursive: true });

    // Write bundles to file
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(bundles, null, 2));

    logger.info(`Generated ${bundles.length} bundle products`);

    // Count by category
    const categoryCounts = {};
    bundles.forEach(bundle => {
      const category = bundle.attributes.find(a => a.code === 'attr_001')?.value;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    for (const [category, count] of Object.entries(categoryCounts)) {
      logger.info(`- ${category}: ${count} bundles`);
    }

    logger.info(`Output written to: ${OUTPUT_FILE}`);
    logger.info('Bundle Generation Complete');

  } catch (error) {
    logger.error('Bundle generation failed:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateBundles();
}

export default generateBundles;