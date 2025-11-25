/**
 * Product Description Generator
 * 
 * Generates marketing-quality descriptions for BuildRight products
 * based on category, brand, and UOM.
 */

/**
 * Generate a product description based on category and attributes
 * 
 * @param {string} category - Product category (e.g., 'structural_materials')
 * @param {string} brand - Product brand (e.g., 'ToughGrip')
 * @param {string} uom - Unit of measure (e.g., 'EA')
 * @param {string} productName - Full product name
 * @returns {string} Generated description
 */
export function generateProductDescription(category, brand, uom, productName) {
  // Category-specific description templates
  switch (category) {
    case 'structural_materials':
      return `Premium ${brand} treated lumber designed for structural applications. Meets building code requirements for load-bearing construction. Kiln-dried after treatment (KDAT) for dimensional stability. Ideal for framing, deck joists, and structural support. Sold per ${uom}.`;
    
    case 'fasteners_hardware':
      return `Professional-grade fastener engineered for secure connections in construction applications. Corrosion-resistant coating ensures long-lasting performance. Compatible with standard installation tools. Bulk packaging for high-volume projects.`;
    
    case 'framing_drywall':
    case 'roofing':
    case 'windows_doors':
    default:
      return `Professional-grade construction material built for demanding job site conditions. Engineered for reliability and long-term performance. Meets or exceeds industry standards for quality and safety.`;
  }
}

/**
 * Generate a short description (for meta tags, summaries)
 * 
 * @param {string} productName - Full product name
 * @param {string} brand - Product brand
 * @param {string} category - Product category
 * @returns {string} Short description
 */
export function generateShortDescription(productName, brand, category) {
  const categoryName = category.replace(/_/g, ' ');
  return `${productName} from ${brand}. Premium ${categoryName} for professional construction applications.`;
}

/**
 * Convert underscore-separated string to Title Case
 * @param {string} str - String to convert (e.g., 'structural_materials')
 * @returns {string} Title case string (e.g., 'Structural Materials')
 */
function toTitleCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate meta tags for a product
 * 
 * @param {string} productName - Full product name
 * @param {string} brand - Product brand
 * @param {string} category - Product category (e.g., 'structural_materials')
 * @param {string} subcategory - Product subcategory (e.g., 'framing_lumber')
 * @returns {object} Meta tags object with title, description, keywords
 */
export function generateMetaTags(productName, brand, category, subcategory) {
  // Convert category and subcategory to human-readable format for SEO
  const categoryReadable = toTitleCase(category);
  const subcategoryReadable = toTitleCase(subcategory);
  
  return {
    title: `${productName} | BuildRight`,
    description: `Shop ${productName}. Quality construction materials from BuildRight.`,
    keywords: [categoryReadable, subcategoryReadable, brand]
  };
}

