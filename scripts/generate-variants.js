import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Ajv from 'ajv';
import logger from '../utils/logger.js';
import { SeededRandom } from '../utils/random-seed.js';
import { generateSKU, generateVariantSKU, resetSkuTracker } from '../utils/sku-generator.js';
import { PRODUCT_CATEGORIES, BRANDS, getVariantCombinations } from './config/product-definitions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEED = 54321; // Different seed from products for variety
const random = new SeededRandom(SEED);

// Paths
const OUTPUT_FILE = path.join(__dirname, '../data/buildright/variants.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/buildright/products.json');
const CATEGORIES_FILE = path.join(__dirname, '../data/buildright/categories.json');
const METADATA_FILE = path.join(__dirname, '../data/buildright/metadata.json');
const SCHEMA_FILE = path.join(__dirname, './schemas/aco-product-schema.json');

/**
 * Load existing products to ensure SKU uniqueness
 */
async function loadProducts() {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logger.warn('Products file not found, continuing without it');
    return [];
  }
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
 * Generate attributes for products (ACO format with values array)
 */
function generateAttributes(metadata, categoryValue, brand, uom, additionalAttrs = {}, variantReferenceId = null) {
  const attributes = [];

  // Add required attributes
  attributes.push({
    code: 'product_category',
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
      values: [uom]
    });
  }

  // Add additional attributes (like dimensions for variants)
  for (const [key, value] of Object.entries(additionalAttrs)) {
    // Try to find matching attribute in metadata
    const metaAttr = metadata.find(m =>
      m.label.toLowerCase() === key.toLowerCase() ||
      m.attributeId === key
    );

    if (metaAttr) {
      const attrObj = {
        code: metaAttr.attributeId,
        values: Array.isArray(value) ? value : [value]
      };
      // Add variantReferenceId if this is a configurable dimension
      if (variantReferenceId) {
        attrObj.variantReferenceId = variantReferenceId;
      }
      attributes.push(attrObj);
    }
  }

  // Add some random optional attributes
  const optionalAttrs = metadata.filter(m =>
    !m.isRequired &&
    !attributes.find(a => a.code === m.attributeId)
  );

  const numOptional = random.nextInt(1, Math.min(3, optionalAttrs.length));
  for (let i = 0; i < numOptional; i++) {
    const attr = optionalAttrs[random.nextInt(0, optionalAttrs.length - 1)];
    if (!attributes.find(a => a.code === attr.attributeId)) {
      const value = attr.type === 'boolean' ? (random.nextFloat() > 0.5 ? 'true' : 'false') :
                   attr.type === 'number' ? random.nextInt(10, 100) :
                   attr.options ? attr.options[random.nextInt(0, attr.options.length - 1)].value :
                   'Standard';

      attributes.push({
        code: attr.attributeId,
        values: [value]
      });
    }
  }

  return attributes;
}

/**
 * Generate a configurable product
 */
function generateConfigurableProduct(template, category, subcategory, categories, metadata, index) {
  const brand = BRANDS[random.nextInt(0, BRANDS.length - 1)];
  const basePrice = random.nextFloat(50, 200);

  const sku = generateSKU({
    category: category,
    subcategory: subcategory,
    type: 'configurable',
    name: template.name,
    seed: SEED + index
  });

  const categoryObj = findCategoryByName(categories, subcategory) ||
                     findCategoryByName(categories, category) ||
                     categories[0];

  const routes = getCategoryRoutes(categories, categoryObj.categoryId);

  const categoryDef = PRODUCT_CATEGORIES[category];
  const categoryValue = categoryDef.attributeValue || category;

  const attributes = generateAttributes(metadata, categoryValue, brand, 'EA', {});

  // Build configurations for ACO (with variantReferenceId for each value)
  const configurations = [];
  for (const [dimKey, dimValues] of Object.entries(template.dimensions)) {
    const configValues = dimValues.map((value, idx) => ({
      variantReferenceId: `${dimKey}-${value}-ref`,
      label: value.toString()
    }));

    configurations.push({
      attributeCode: dimKey,
      label: dimKey.charAt(0).toUpperCase() + dimKey.slice(1),
      type: 'CONFIGURABLE',
      values: configValues
    });
  }

  const productName = `${brand} ${template.name} - Configurable`;

  return {
    sku: sku,
    source: {
      locale: 'en-US'
    },
    name: productName,
    slug: generateSlug(productName),
    status: 'ENABLED',
    visibleIn: ['CATALOG', 'SEARCH'],
    description: `Customizable ${template.name} from ${brand}. Available in multiple sizes and configurations.`,
    shortDescription: `${template.name} - Multiple Options Available`,
    attributes: attributes,
    routes: routes,
    configurations: configurations,
    metaTags: {
      title: `${template.name} - Configurable | ${brand}`,
      description: `Shop customizable ${template.name} from ${brand}. Multiple sizes and options available.`,
      keywords: ['configurable', category, subcategory, brand, 'custom', 'options']
    }
  };
}

/**
 * Generate variant products for a configurable
 */
function generateVariants(parentProduct, template, category, subcategory, categories, metadata) {
  const variants = [];

  // Get variant combinations (limit to 3-5 per configurable)
  const allCombinations = getVariantCombinations(template.dimensions);
  const numVariants = Math.min(random.nextInt(3, 5), allCombinations.length);

  // Randomly select combinations
  const selectedCombinations = [];
  const combinationsCopy = [...allCombinations];

  for (let i = 0; i < numVariants; i++) {
    if (combinationsCopy.length === 0) break;
    const index = random.nextInt(0, combinationsCopy.length - 1);
    selectedCombinations.push(combinationsCopy[index]);
    combinationsCopy.splice(index, 1);
  }

  // Generate variant for each combination
  for (const combination of selectedCombinations) {
    const variantSku = generateVariantSKU(parentProduct.sku, combination);

    // Calculate variant price (base price + adjustments)
    let priceAdjustment = 0;
    for (const [key, value] of Object.entries(combination)) {
      // Price increases for larger sizes
      if (key === 'width' || key === 'length' || key === 'depth') {
        priceAdjustment += parseFloat(value) * 2;
      } else if (key === 'thickness') {
        priceAdjustment += parseFloat(value) * 10;
      }
    }

    const variantPrice = parentProduct.price + priceAdjustment;

    // Build variant name
    const dimensionStrings = [];
    if (combination.depth && combination.width) {
      dimensionStrings.push(`${combination.depth}" × ${combination.width}"`);
    }
    if (combination.length) {
      dimensionStrings.push(`${combination.length}ft`);
    }
    if (combination.thickness) {
      dimensionStrings.push(`${combination.thickness}" thick`);
    }
    if (combination.gauge) {
      dimensionStrings.push(`${combination.gauge} gauge`);
    }

    const variantName = `${parentProduct.name.replace(' - Configurable', '')} - ${dimensionStrings.join(' ')}`;

    const categoryDef = PRODUCT_CATEGORIES[category];
    const categoryValue = categoryDef.attributeValue || category;

    // Get brand from parent
    const parentBrandAttr = parentProduct.attributes.find(a =>
      a.values && Array.isArray(a.values) && a.values.some(v => BRANDS.includes(v))
    );
    const parentBrand = parentBrandAttr?.values[0] || BRANDS[0];

    // Build attributes with variantReferenceIds for configurable dimensions
    const variantAttrs = {};
    for (const [key, value] of Object.entries(combination)) {
      variantAttrs[key] = value;
    }

    // Generate attributes with variantReferenceId for each configurable dimension
    const attributes = [];

    // Add basic attributes
    const basicAttrs = generateAttributes(metadata, categoryValue, parentBrand, 'EA', {});
    attributes.push(...basicAttrs);

    // Add variant-specific attributes with variantReferenceId
    for (const [dimKey, dimValue] of Object.entries(combination)) {
      const variantRefId = `${dimKey}-${dimValue}-ref`;
      const existingAttr = attributes.find(a => a.code === dimKey);

      if (existingAttr) {
        existingAttr.values = [dimValue.toString()];
        existingAttr.variantReferenceId = variantRefId;
      } else {
        attributes.push({
          code: dimKey,
          values: [dimValue.toString()],
          variantReferenceId: variantRefId
        });
      }
    }

    const variant = {
      sku: variantSku,
      source: {
        locale: 'en-US'
      },
      name: variantName,
      slug: generateSlug(variantName),
      status: 'ENABLED',
      visibleIn: [],  // Variants not visible standalone
      description: `${variantName}. Part of the ${parentProduct.name} series.`,
      shortDescription: variantName,
      attributes: attributes,
      routes: parentProduct.routes,
      links: [
        {
          type: 'PARENT',
          sku: parentProduct.sku
        }
      ],
      metaTags: {
        title: `${variantName} | BuildRight`,
        description: `Shop ${variantName}. Quality construction materials from BuildRight.`,
        keywords: [category, subcategory, 'variant', ...Object.values(combination).map(v => String(v))]
      }
    };

    variants.push(variant);
  }

  return variants;
}

/**
 * Main generation function
 */
async function generateVariantsAndConfigurables() {
  try {
    logger.info('Variant Generation Started');

    // Reset SKU tracker
    resetSkuTracker();

    // Load dependencies
    const existingProducts = await loadProducts();
    const categories = await loadCategories();
    const metadata = await loadMetadata();

    // Pre-populate SKU tracker with existing products
    existingProducts.forEach(product => {
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

    const products = [];
    let configurableIndex = 0;

    // Generate configurable products and their variants (4 per category)
    for (const [categoryKey, categoryDef] of Object.entries(PRODUCT_CATEGORIES)) {
      let categoryConfigurableCount = 0;

      for (const [subcategoryKey, subcategoryDef] of Object.entries(categoryDef.subcategories)) {
        if (subcategoryKey === 'services') continue;

        if (subcategoryDef.configurable) {
          for (const template of subcategoryDef.configurable) {
            if (categoryConfigurableCount >= 4) break;

            // Generate configurable parent
            const configurableProduct = generateConfigurableProduct(
              template,
              categoryKey,
              subcategoryKey,
              categories,
              metadata,
              configurableIndex++
            );

            // Validate configurable (DISABLED - ACO API will validate)
            // if (!validate(configurableProduct)) {
            //   logger.error('Configurable validation failed:', validate.errors);
            //   throw new Error(`Validation failed for ${configurableProduct.sku}`);
            // }

            products.push(configurableProduct);

            // Generate variants
            const variants = generateVariants(
              configurableProduct,
              template,
              categoryKey,
              subcategoryKey,
              categories,
              metadata
            );

            // Validate each variant (DISABLED - ACO API will validate)
            for (const variant of variants) {
              // if (!validate(variant)) {
              //   logger.error('Variant validation failed:', validate.errors);
              //   logger.error('Variant:', variant);
              //   throw new Error(`Validation failed for variant ${variant.sku}`);
              // }
              products.push(variant);
            }

            categoryConfigurableCount++;
          }
        }
      }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(outputDir, { recursive: true });

    // Write products to file (already in ACO schema format)
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(products, null, 2));

    const configurableCount = products.filter(p => p.configurations && p.configurations.length > 0).length;
    const variantCount = products.filter(p => p.links && p.links.some(l => l.type === 'PARENT')).length;

    logger.info(`Generated ${products.length} products`);
    logger.info(`- Configurable products: ${configurableCount}`);
    logger.info(`- Variant products: ${variantCount}`);
    logger.info(`Output written to: ${OUTPUT_FILE}`);

    logger.info('Variant Generation Complete');

  } catch (error) {
    logger.error('Variant generation failed:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateVariantsAndConfigurables();
}

export default generateVariantsAndConfigurables;