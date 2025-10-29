import crypto from 'crypto';

// Category to SKU prefix mapping
const CATEGORY_PREFIXES = {
  'structural': {
    'lumber': 'LBR',
    'plywood': 'PLY',
    'concrete': 'CONC',
    'default': 'STRUCT'
  },
  'framing': {
    'studs': 'STUD',
    'drywall': 'DRYWALL',
    'insulation': 'INSUL',
    'default': 'FRAME'
  },
  'windows-doors': {
    'windows': 'WINDOW',
    'doors': 'DOOR',
    'hardware': 'HDWR',
    'default': 'WD'
  },
  'fasteners': {
    'nails': 'NAIL',
    'screws': 'SCREW',
    'bolts': 'BOLT',
    'anchors': 'ANCHOR',
    'default': 'FAST'
  },
  'safety': {
    'equipment': 'SAFE',
    'gear': 'SAFE',
    'default': 'SAFE'
  },
  'services': 'SVC'
};

// Track generated SKUs to ensure uniqueness
const generatedSkus = new Set();

/**
 * Generate a SKU based on product options
 * @param {Object} options - SKU generation options
 * @param {string} options.category - Main category
 * @param {string} [options.subcategory] - Subcategory
 * @param {string} options.type - Product type (simple, service, bundle, configurable)
 * @param {string} options.name - Product name
 * @param {number} [options.seed] - Optional seed for deterministic generation
 * @returns {string} Generated SKU
 */
export function generateSKU(options) {
  const { category, subcategory, type, name, seed } = options;

  let prefix = '';

  // Handle special product types first
  if (type === 'service') {
    prefix = 'SVC';
  } else if (type === 'bundle') {
    prefix = 'BUNDLE';
  } else {
    // Get category-specific prefix
    const categoryPrefixes = CATEGORY_PREFIXES[category];

    if (typeof categoryPrefixes === 'string') {
      prefix = categoryPrefixes;
    } else if (categoryPrefixes) {
      prefix = categoryPrefixes[subcategory] || categoryPrefixes.default || category.toUpperCase();
    } else {
      prefix = category.toUpperCase().substring(0, 4);
    }
  }

  // Generate unique identifier
  let identifier = '';

  if (seed !== undefined) {
    // Deterministic generation with seed
    const hash = crypto.createHash('md5');
    hash.update(`${prefix}-${name}-${seed}`);
    identifier = hash.digest('hex').substring(0, 8).toUpperCase();
  } else {
    // Generate from name
    const nameWords = name.split(/\s+/);
    const abbreviated = nameWords.map(word => {
      // Handle special words
      if (word.match(/^\d+x\d+/i)) {
        return word.toUpperCase().replace('X', 'X');
      }
      if (word.match(/^\d+/)) {
        return word;
      }
      return word.substring(0, 3).toUpperCase();
    }).join('-');

    identifier = abbreviated.substring(0, 20);

    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    identifier = `${identifier}-${randomSuffix}`;
  }

  let sku = `${prefix}-${identifier}`;

  // Add CONFIG suffix for configurable products
  if (type === 'configurable') {
    sku = `${sku}-CONFIG`;
  }

  // For deterministic generation with seed, don't add uniqueness counter
  if (seed !== undefined) {
    // With a seed, we should get the same SKU every time
    // Only track if not already present
    if (!generatedSkus.has(sku)) {
      generatedSkus.add(sku);
    }
    return sku;
  }

  // Ensure uniqueness for non-seeded generation
  let counter = 1;
  let uniqueSku = sku;
  while (generatedSkus.has(uniqueSku)) {
    uniqueSku = `${sku}-${counter}`;
    counter++;
  }

  generatedSkus.add(uniqueSku);

  // Ensure SKU length is within limits
  if (uniqueSku.length > 64) {
    uniqueSku = uniqueSku.substring(0, 64);
  }

  return uniqueSku;
}

/**
 * Generate a variant SKU from parent SKU and attributes
 * @param {string} parentSKU - Parent configurable product SKU
 * @param {Object} attributes - Variant attributes
 * @returns {string} Generated variant SKU
 */
export function generateVariantSKU(parentSKU, attributes) {
  // Remove -CONFIG suffix if present
  let baseSku = parentSKU.replace('-CONFIG', '');

  // Extract prefix and simplify base
  const parts = baseSku.split('-');
  const prefix = parts[0];
  const baseIdentifier = parts.slice(1, 2).join('-');

  // Build variant identifier from attributes
  let variantParts = [];

  // Handle dimension attributes (width, depth, length, thickness)
  if (attributes.depth && attributes.width) {
    variantParts.push(`${attributes.depth}X${attributes.width}`);
  } else if (attributes.thickness && attributes.width && attributes.length) {
    variantParts.push(`${attributes.thickness}-${attributes.width}X${attributes.length}`);
  }

  if (attributes.length && !variantParts.some(p => p.includes(attributes.length))) {
    variantParts.push(attributes.length.toString());
  }

  // Handle gauge for metal products
  if (attributes.gauge) {
    // For metal studs, format should be like: STUD-METAL-20GA-3.5-10
    variantParts = [`${attributes.gauge}GA`];
    if (attributes.width) {
      variantParts.push(attributes.width.toString());
    }
    if (attributes.length) {
      variantParts.push(attributes.length.toString());
    }
  }

  // Build final SKU
  let variantSku = prefix;

  if (baseIdentifier && baseIdentifier !== 'CONFIG') {
    variantSku += `-${baseIdentifier}`;
  }

  if (variantParts.length > 0) {
    variantSku += `-${variantParts.join('-')}`;
  } else {
    // Fallback: use hash of attributes
    const attrString = JSON.stringify(attributes);
    const hash = crypto.createHash('md5').update(attrString).digest('hex');
    variantSku += `-VAR-${hash.substring(0, 6).toUpperCase()}`;
  }

  // Ensure uniqueness
  let counter = 1;
  let uniqueSku = variantSku;
  while (generatedSkus.has(uniqueSku)) {
    uniqueSku = `${variantSku}-${counter}`;
    counter++;
  }

  generatedSkus.add(uniqueSku);

  return uniqueSku;
}

/**
 * Validate SKU format
 * @param {string} sku - SKU to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateSKU(sku) {
  if (!sku || typeof sku !== 'string') {
    return false;
  }

  // Check length (max 64 characters)
  if (sku.length === 0 || sku.length > 64) {
    return false;
  }

  // Check for valid characters (alphanumeric, dash, dot)
  const validPattern = /^[A-Z0-9\-\.]+$/;
  if (!validPattern.test(sku)) {
    return false;
  }

  // Check for spaces or special characters
  if (sku.includes(' ') || sku.includes('@') || sku.includes('!')) {
    return false;
  }

  return true;
}

/**
 * Reset SKU tracker (useful for tests)
 */
export function resetSkuTracker() {
  generatedSkus.clear();
}

export default {
  generateSKU,
  generateVariantSKU,
  validateSKU,
  resetSkuTracker
};