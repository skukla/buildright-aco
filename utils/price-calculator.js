/**
 * Price calculation utilities for business-type pricing
 * Handles business discounts, tier pricing, volume discounts, and regional adjustments
 */

/**
 * Business type discount configuration
 * Standard discounts by business type
 */
const BUSINESS_TYPE_DISCOUNTS = {
  'RETAIL': 0.00,      // 0% - list price
  'CONTRACTOR': 0.05,  // 5% discount
  'COMMERCIAL': 0.10,  // 10% discount
  'WHOLESALE': 0.15    // 15% discount
};

/**
 * Get business type discount percentage
 *
 * Business types and their standard discounts:
 * - RETAIL: 0% (list price)
 * - CONTRACTOR: 5% discount
 * - COMMERCIAL: 10% discount
 * - WHOLESALE: 15% discount
 *
 * @param {string} businessType - Business type (RETAIL, CONTRACTOR, COMMERCIAL, WHOLESALE)
 * @returns {number} Discount percentage as decimal (0-0.15)
 * @example
 * getBusinessTypeDiscount('CONTRACTOR') // returns 0.05
 * getBusinessTypeDiscount('WHOLESALE') // returns 0.15
 */
export function getBusinessTypeDiscount(businessType) {
  return BUSINESS_TYPE_DISCOUNTS[businessType] || 0;
}

/**
 * Apply regional price adjustments based on location and product type
 * @param {number} price - Price to adjust (after business discounts)
 * @param {Object} priceBook - Price book with region info
 * @param {Object} product - Product object with category info
 * @returns {number} Adjusted price
 */
export function applyRegionalAdjustment(price, priceBook, product) {
  // West region lumber gets +3% adjustment
  if (priceBook.region === 'West' && isLumberProduct(product)) {
    return price * 1.03;
  }
  return price;
}

/**
 * Check if product is a lumber product
 * @param {Object} product - Product to check
 * @returns {boolean} True if lumber product
 */
export function isLumberProduct(product) {
  // Check direct category field
  if (product.category === 'Lumber') {
    return true;
  }

  // Check SKU prefix for lumber products
  if (product.sku && product.sku.startsWith('LBR-')) {
    return true;
  }

  // Check category assignments
  if (product.categoryAssignments) {
    return product.categoryAssignments.some(cat =>
      cat.categoryCode === 'lumber' ||
      cat.categoryCode === 'building-materials/lumber'
    );
  }

  return false;
}

/**
 * Calculate tier price based on quantity and discount
 * @param {number} basePrice - Base price amount
 * @param {number} discount - Discount percentage (0-1)
 * @returns {number} Discounted price
 */
export function calculateTierPrice(basePrice, discount) {
  return basePrice * (1 - discount);
}

/**
 * Get tier pricing levels
 * @returns {Array} Array of tier definitions
 */
export function getTierLevels() {
  return [
    { minQty: 1, maxQty: 10, discount: 0 },
    { minQty: 11, maxQty: 50, discount: 0.05 },
    { minQty: 51, maxQty: 100, discount: 0.10 },
    { minQty: 101, maxQty: null, discount: 0.15 }
  ];
}

/**
 * Get volume discount levels
 * @returns {Array} Array of volume discount definitions
 */
export function getVolumeDiscountLevels() {
  return [
    { qty: 100, discount: 0.05 },
    { qty: 500, discount: 0.10 },
    { qty: 1000, discount: 0.15 }
  ];
}

// Removed getCustomerTierDiscounts() - no longer used with business-type pricing
// Removed getPromotionalDiscounts() - no longer used with business-type pricing

/**
 * Validate discount doesn't exceed maximum allowed
 * @param {number} discount - Discount percentage (0-1)
 * @returns {boolean} True if valid
 */
export function isValidDiscount(discount) {
  return discount >= 0 && discount <= 0.25;
}

/**
 * Check if product is eligible for tier pricing
 * @param {Object} product - Product to check
 * @returns {boolean} True if eligible
 */
export function isTierEligible(product) {
  // Explicitly marked as eligible
  if (product.tierPricingEligible === true) {
    return true;
  }

  // Explicitly marked as not eligible
  if (product.tierPricingEligible === false) {
    return false;
  }

  // Bundles typically not eligible for tier pricing
  if (product.type === 'BUNDLE' || product.type === 'bundle') {
    return false;
  }

  // Default to eligible for most products
  return true;
}

/**
 * Check if product is eligible for volume discounts
 * @param {Object} product - Product to check
 * @returns {boolean} True if eligible
 */
export function isVolumeEligible(product) {
  // Explicitly marked as eligible
  if (product.volumeDiscountEligible === true) {
    return true;
  }

  // Explicitly marked as not eligible
  if (product.volumeDiscountEligible === false) {
    return false;
  }

  // Lumber and hardware products typically eligible
  if (isLumberProduct(product)) {
    return true;
  }

  if (product.category === 'Hardware' ||
      (product.sku && product.sku.startsWith('HDW-'))) {
    return true;
  }

  return false;
}

/**
 * Format price to 2 decimal places
 * @param {number} price - Price to format
 * @returns {number} Formatted price
 */
export function formatPrice(price) {
  return parseFloat(price.toFixed(2));
}

/**
 * Generate psychological price ending
 * @param {number} price - Base price
 * @param {Object} random - Random number generator
 * @returns {number} Price with psychological ending
 */
export function generatePsychologicalPrice(price, random) {
  const rounded = Math.floor(price);
  const decimal = random.next() > 0.5 ? 0.99 : 0.49;
  return rounded + decimal;
}

export default {
  getBusinessTypeDiscount,
  applyRegionalAdjustment,
  isLumberProduct,
  calculateTierPrice,
  getTierLevels,
  getVolumeDiscountLevels,
  isValidDiscount,
  isTierEligible,
  isVolumeEligible,
  formatPrice,
  generatePsychologicalPrice
};