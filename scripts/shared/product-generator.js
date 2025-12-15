/**
 * Product Generation Utilities
 * 
 * Shared helpers for product generation across all product types
 */

/**
 * Generate a URL-friendly slug from a product name
 * @param {string} name - Product name
 * @returns {string} URL-friendly slug
 */
export function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Transform attributes from internal format to ACO API format
 * 
 * Internal format: {code: 'attr', label: 'Attr Label', value: 'val' or ['val1', 'val2']}
 * ACO format: {code: 'attr', values: ['val1', 'val2']}
 * 
 * Note: ACO supports proper array values for multiselect attributes.
 * Each value becomes a separate facet option.
 * 
 * @param {Array} attributes - Attributes in internal format
 * @returns {Array} Attributes in ACO format
 */
export function transformAttributesToACO(attributes) {
  return attributes.map(attr => ({
    code: attr.code,
    // NOTE: ACO Data Ingestion API does NOT accept 'label' field here
    // Labels are configured separately in ACO attribute metadata
    // Keep arrays as arrays - each value becomes a separate facet option
    values: Array.isArray(attr.value) 
      ? attr.value.map(String)
      : [String(attr.value)]
  }));
}

/**
 * Create base ACO product object with common fields
 * @param {object} params - Product parameters
 * @param {string} params.sku - Product SKU
 * @param {string} params.name - Product name
 * @param {string} params.description - Product description
 * @param {Array} params.attributes - Product attributes (internal format)
 * @param {object} params.metaTags - SEO meta tags
 * @returns {object} Base ACO product object
 */
export function createBaseACOProduct({ sku, name, description, attributes, metaTags }) {
  return {
    sku,
    source: { locale: 'en-US' },
    name,
    slug: generateSlug(name),
    description: description || '',
    status: 'ENABLED',
    visibleIn: ['CATALOG', 'SEARCH'],
    attributes: transformAttributesToACO(attributes),
    metaTags: metaTags || {
      title: `${name} | BuildRight`,
      description: `Shop ${name}. Quality construction materials from BuildRight.`,
      keywords: []
    }
  };
}

