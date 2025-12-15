/**
 * Inventory distribution utilities for multi-source inventory
 * Handles quantity distribution across sources
 */

/**
 * Distribute total quantity across multiple sources
 * @param {number} totalQuantity - Total quantity to distribute
 * @param {Array} sourceCodes - Array of source codes
 * @param {Function} getQuantityMultiplier - Function to get min/max for each source
 * @param {Function} random - Seeded random function
 * @returns {Object} Object with source code as key and quantity as value
 */
export function distributeQuantity(totalQuantity, sourceCodes, getQuantityMultiplier, random) {
  if (!sourceCodes || sourceCodes.length === 0) {
    throw new Error('No sources provided for distribution');
  }

  if (totalQuantity <= 0) {
    // Return zero quantity for all sources
    const distribution = {};
    sourceCodes.forEach(sourceCode => {
      distribution[sourceCode] = 0;
    });
    return distribution;
  }

  const distribution = {};
  let remaining = totalQuantity;

  // Sort sources by priority (RDCs first, then regional, then drop shippers)
  const sortedSources = [...sourceCodes].sort((a, b) => {
    // RDCs have highest priority
    if ((a.includes('_west') || a.includes('_east')) &&
        !(b.includes('_west') || b.includes('_east'))) {
      return -1;
    }
    if (!(a.includes('_west') || a.includes('_east')) &&
        (b.includes('_west') || b.includes('_east'))) {
      return 1;
    }

    // Drop shippers have lowest priority
    if (a.includes('dropship') && !b.includes('dropship')) {
      return 1;
    }
    if (!a.includes('dropship') && b.includes('dropship')) {
      return -1;
    }

    return 0;
  });

  // Single source - all quantity goes to it
  if (sortedSources.length === 1) {
    distribution[sortedSources[0]] = totalQuantity;
    return distribution;
  }

  // Multiple sources - distribute based on source type and constraints
  sortedSources.forEach((sourceCode, index) => {
    const { min, max } = getQuantityMultiplier(sourceCode);

    // Last source gets all remaining quantity
    if (index === sortedSources.length - 1) {
      distribution[sourceCode] = Math.max(min, Math.min(max, remaining));
    } else {
      // Calculate this source's share
      const remainingSources = sortedSources.length - index;
      const baseShare = Math.floor(remaining / remainingSources);

      // Add some randomness (70% to 130% of base share)
      const randomFactor = 0.7 + (random() * 0.6);
      let quantity = Math.floor(baseShare * randomFactor);

      // Apply min/max constraints
      quantity = Math.max(min, Math.min(max, quantity));

      // Don't exceed remaining quantity
      quantity = Math.min(quantity, remaining);

      distribution[sourceCode] = quantity;
      remaining -= quantity;
    }
  });

  // Handle any remaining quantity due to rounding
  if (remaining > 0) {
    // Add to RDCs first (they can handle more)
    for (const sourceCode of sortedSources) {
      if (remaining <= 0) break;

      const { max } = getQuantityMultiplier(sourceCode);
      const currentQty = distribution[sourceCode];

      if (currentQty < max) {
        const addAmount = Math.min(remaining, max - currentQty);
        distribution[sourceCode] += addAmount;
        remaining -= addAmount;
      }
    }
  }

  return distribution;
}

/**
 * Generate base quantity for a product
 * @param {Object} product - Product object
 * @param {Function} random - Seeded random function
 * @returns {number} Base quantity for the product
 */
export function generateBaseQuantity(product, random) {
  // Find product category from attributes
  const categoryAttr = (product.attributes || []).find(a => a.code === 'product_category');
  const category = categoryAttr?.values?.[0] || categoryAttr?.value || '';
  const categoryLower = (category || '').toLowerCase();
  const skuUpper = (product.sku || '').toUpperCase();

  // High-volume fasteners and hardware
  if (categoryLower.includes('fastener') ||
      categoryLower.includes('hardware') ||
      categoryLower.includes('nail') ||
      categoryLower.includes('screw') ||
      skuUpper.includes('NAIL-') ||
      skuUpper.includes('SCREW-') ||
      skuUpper.includes('BOLT-')) {
    return Math.floor(random() * 1500) + 500; // 500-2000
  }

  // Medium-volume structural materials
  if (categoryLower.includes('lumber') ||
      categoryLower.includes('structural') ||
      categoryLower.includes('framing') ||
      skuUpper.includes('LBR-') ||
      skuUpper.includes('PLYWOOD-')) {
    return Math.floor(random() * 600) + 200; // 200-800
  }

  // Medium-volume building materials
  if (categoryLower.includes('drywall') ||
      categoryLower.includes('cement') ||
      categoryLower.includes('concrete') ||
      skuUpper.includes('DRYWALL-') ||
      skuUpper.includes('CEMENT-') ||
      skuUpper.includes('CONCRETE-')) {
    return Math.floor(random() * 500) + 150; // 150-650
  }

  // Low-volume specialty items
  if (categoryLower.includes('window') ||
      categoryLower.includes('door') ||
      categoryLower.includes('premium') ||
      skuUpper.includes('WINDOW-') ||
      skuUpper.includes('DOOR-')) {
    return Math.floor(random() * 150) + 50; // 50-200
  }

  // Tools and equipment
  if (categoryLower.includes('tool') ||
      categoryLower.includes('equipment') ||
      skuUpper.includes('TOOL-') ||
      skuUpper.includes('SAW-')) {
    return Math.floor(random() * 80) + 20; // 20-100
  }

  // Bundles and kits
  if (categoryLower.includes('bundle') ||
      categoryLower.includes('kit') ||
      skuUpper.includes('BUNDLE-') ||
      skuUpper.includes('KIT-')) {
    return Math.floor(random() * 120) + 30; // 30-150
  }

  // Roofing materials
  if (categoryLower.includes('roofing') ||
      categoryLower.includes('shingle') ||
      skuUpper.includes('ROOF-') ||
      skuUpper.includes('SHINGLE-')) {
    return Math.floor(random() * 400) + 100; // 100-500
  }

  // Electrical supplies
  if (categoryLower.includes('electrical') ||
      categoryLower.includes('wire') ||
      skuUpper.includes('WIRE-') ||
      skuUpper.includes('OUTLET-')) {
    return Math.floor(random() * 300) + 100; // 100-400
  }

  // Plumbing supplies
  if (categoryLower.includes('plumbing') ||
      categoryLower.includes('pipe') ||
      skuUpper.includes('PIPE-') ||
      skuUpper.includes('FITTING-')) {
    return Math.floor(random() * 250) + 75; // 75-325
  }

  // Paint and finishes
  if (categoryLower.includes('paint') ||
      categoryLower.includes('stain') ||
      skuUpper.includes('PAINT-') ||
      skuUpper.includes('STAIN-')) {
    return Math.floor(random() * 200) + 50; // 50-250
  }

  // Default range for unknown categories
  return Math.floor(random() * 400) + 100; // 100-500
}

/**
 * Create inventory sources array for a product
 * @param {Object} distribution - Object with source code as key and quantity as value
 * @returns {Array} Array of source objects with source_code and quantity
 */
export function createSourcesArray(distribution) {
  return Object.entries(distribution)
    .map(([source_code, quantity]) => ({
      source_code,
      quantity
    }))
    .filter(source => source.quantity > 0) // Only include sources with inventory
    .sort((a, b) => {
      // Sort RDCs first, then regional, then drop shippers
      const getPriority = (code) => {
        if (code.includes('_west') || code.includes('_east')) return 0;
        if (code.includes('dropship')) return 2;
        return 1;
      };
      return getPriority(a.source_code) - getPriority(b.source_code);
    });
}

/**
 * Calculate total quantity from sources array
 * @param {Array} sources - Array of source objects
 * @returns {number} Total quantity across all sources
 */
export function calculateTotalQuantity(sources) {
  return sources.reduce((total, source) => total + source.quantity, 0);
}