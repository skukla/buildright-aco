/**
 * Inventory rules for category-based source assignments
 * Defines which sources carry which product categories
 */

/**
 * Get sources for a product based on category and SKU patterns
 * @param {string} category - Product category
 * @param {string} sku - Product SKU
 * @returns {Array} Array of source codes
 */
export function getSourcesByCategory(category, sku) {
  const categoryLower = (category || '').toLowerCase();
  const skuUpper = (sku || '').toUpperCase();

  // Lumber products - 4 sources (West RDC, East RDC, Phoenix, Denver)
  if (categoryLower.includes('lumber') ||
      categoryLower.includes('structural') ||
      skuUpper.includes('LBR-') ||
      skuUpper.includes('PLYWOOD-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_phoenix',
      'warehouse_denver'
    ];
  }

  // Concrete/Cement - 3 sources (West RDC, East RDC, Atlanta)
  if (categoryLower.includes('concrete') ||
      categoryLower.includes('cement') ||
      skuUpper.includes('CEMENT-') ||
      skuUpper.includes('CONCRETE-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_atlanta'
    ];
  }

  // Framing/Drywall - 4 sources (West RDC, East RDC, Phoenix, Atlanta)
  if (categoryLower.includes('framing') ||
      categoryLower.includes('drywall') ||
      categoryLower.includes('insulation') ||
      skuUpper.includes('DRYWALL-') ||
      skuUpper.includes('FRAME-') ||
      skuUpper.includes('INSULATION-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_phoenix',
      'warehouse_atlanta'
    ];
  }

  // Roofing - 5 sources (all warehouses, no drop shipper)
  if (categoryLower.includes('roofing') ||
      categoryLower.includes('shingles') ||
      skuUpper.includes('ROOF-') ||
      skuUpper.includes('SHINGLE-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_phoenix',
      'warehouse_denver',
      'warehouse_atlanta'
    ];
  }

  // Windows/Doors - 2-3 sources (East RDC, Atlanta, Drop Shipper for premium)
  if (categoryLower.includes('window') ||
      categoryLower.includes('door') ||
      skuUpper.includes('WINDOW-') ||
      skuUpper.includes('DOOR-')) {

    // Premium windows go to drop shipper
    if (skuUpper.includes('PREMIUM') ||
        skuUpper.includes('-PRO-') ||
        skuUpper.includes('VINYL') ||
        categoryLower.includes('premium')) {
      return [
        'warehouse_east',
        'warehouse_atlanta',
        'dropship_premium_windows'
      ];
    }

    // Standard windows/doors
    return [
      'warehouse_east',
      'warehouse_atlanta'
    ];
  }

  // Fasteners/Hardware - 6 sources (ALL sources)
  if (categoryLower.includes('fastener') ||
      categoryLower.includes('hardware') ||
      categoryLower.includes('nail') ||
      categoryLower.includes('screw') ||
      categoryLower.includes('bolt') ||
      skuUpper.includes('NAIL-') ||
      skuUpper.includes('SCREW-') ||
      skuUpper.includes('BOLT-') ||
      skuUpper.includes('WASHER-') ||
      skuUpper.includes('ANCHOR-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_phoenix',
      'warehouse_denver',
      'warehouse_atlanta',
      'dropship_premium_windows'
    ];
  }

  // Tools/Equipment - 5 sources (all warehouses)
  if (categoryLower.includes('tool') ||
      categoryLower.includes('equipment') ||
      skuUpper.includes('TOOL-') ||
      skuUpper.includes('SAW-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_phoenix',
      'warehouse_denver',
      'warehouse_atlanta'
    ];
  }

  // Electrical - 4 sources (RDCs + Atlanta + Phoenix)
  if (categoryLower.includes('electrical') ||
      categoryLower.includes('wire') ||
      categoryLower.includes('outlet') ||
      skuUpper.includes('WIRE-') ||
      skuUpper.includes('OUTLET-') ||
      skuUpper.includes('SWITCH-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_phoenix',
      'warehouse_atlanta'
    ];
  }

  // Plumbing - 3 sources (RDCs + Denver)
  if (categoryLower.includes('plumbing') ||
      categoryLower.includes('pipe') ||
      categoryLower.includes('fitting') ||
      skuUpper.includes('PIPE-') ||
      skuUpper.includes('FITTING-') ||
      skuUpper.includes('VALVE-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_denver'
    ];
  }

  // Flooring - 3 sources (West RDC, East RDC, Atlanta)
  if (categoryLower.includes('flooring') ||
      categoryLower.includes('tile') ||
      categoryLower.includes('carpet') ||
      skuUpper.includes('FLOOR-') ||
      skuUpper.includes('TILE-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_atlanta'
    ];
  }

  // Paint/Finishes - 4 sources (RDCs + Phoenix + Atlanta)
  if (categoryLower.includes('paint') ||
      categoryLower.includes('stain') ||
      categoryLower.includes('finish') ||
      skuUpper.includes('PAINT-') ||
      skuUpper.includes('STAIN-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_phoenix',
      'warehouse_atlanta'
    ];
  }

  // Bundles/Kits - All warehouses except drop shipper
  if (categoryLower.includes('bundle') ||
      categoryLower.includes('kit') ||
      skuUpper.includes('BUNDLE-') ||
      skuUpper.includes('KIT-')) {
    return [
      'warehouse_west',
      'warehouse_east',
      'warehouse_phoenix',
      'warehouse_denver',
      'warehouse_atlanta'
    ];
  }

  // Default - RDCs only for unknown categories
  return [
    'warehouse_west',
    'warehouse_east'
  ];
}

/**
 * Get quantity range multiplier based on source type
 * @param {string} sourceCode - Source code
 * @returns {Object} Object with min and max quantity ranges
 */
export function getQuantityMultiplier(sourceCode) {
  // RDCs have highest inventory (100-500 units)
  if (sourceCode === 'warehouse_west' || sourceCode === 'warehouse_east') {
    return { min: 100, max: 500 };
  }

  // Regional warehouses have medium inventory (50-200 units)
  if (sourceCode.includes('warehouse_')) {
    return { min: 50, max: 200 };
  }

  // Drop shippers have lowest inventory (5-20 units)
  if (sourceCode.includes('dropship')) {
    return { min: 5, max: 20 };
  }

  // Default range
  return { min: 10, max: 100 };
}

/**
 * Determine if a product should have inventory
 * @param {Object} product - Product object
 * @returns {boolean} True if product should have inventory
 */
export function shouldHaveInventory(product) {
  const sku = (product.sku || '').toUpperCase();
  const type = (product.type || '').toLowerCase();

  // Exclude service products
  if (sku.startsWith('SVC-') || type === 'service') {
    return false;
  }

  // Exclude virtual/downloadable products if any
  if (type === 'virtual' || type === 'downloadable') {
    return false;
  }

  // All other products should have inventory
  return true;
}

/**
 * Get base quantity range for a product based on category
 * @param {string} category - Product category
 * @returns {Object} Object with min and max base quantities
 */
export function getBaseQuantityRange(category) {
  const categoryLower = (category || '').toLowerCase();

  // High-volume items (fasteners, hardware)
  if (categoryLower.includes('fastener') ||
      categoryLower.includes('hardware') ||
      categoryLower.includes('nail') ||
      categoryLower.includes('screw')) {
    return { min: 500, max: 2000 };
  }

  // Medium-volume items (lumber, drywall, cement)
  if (categoryLower.includes('lumber') ||
      categoryLower.includes('structural') ||
      categoryLower.includes('drywall') ||
      categoryLower.includes('cement') ||
      categoryLower.includes('concrete')) {
    return { min: 200, max: 800 };
  }

  // Low-volume items (windows, doors, specialty)
  if (categoryLower.includes('window') ||
      categoryLower.includes('door') ||
      categoryLower.includes('premium')) {
    return { min: 50, max: 200 };
  }

  // Tools and equipment
  if (categoryLower.includes('tool') ||
      categoryLower.includes('equipment')) {
    return { min: 20, max: 100 };
  }

  // Bundles and kits
  if (categoryLower.includes('bundle') ||
      categoryLower.includes('kit')) {
    return { min: 30, max: 150 };
  }

  // Default range
  return { min: 100, max: 500 };
}

export const inventoryRules = {
  getSourcesByCategory,
  getQuantityMultiplier,
  shouldHaveInventory,
  getBaseQuantityRange
};