/**
 * Attribute Generation Utilities
 * 
 * Shared logic for generating product attributes across all product types
 * (simple, configurable, variant, bundle, service)
 */

/**
 * Generate a random value for an attribute based on its type
 * @param {object} attribute - Attribute metadata
 * @param {object} random - Seeded random number generator
 * @returns {*} Generated attribute value
 */
export function getAttributeValue(attribute, random) {
  if (attribute.type === 'multiselect' && attribute.options && attribute.options.length > 0) {
    // For multiselect, return 1-3 random options
    const numOptions = random.nextInt(1, Math.min(3, attribute.options.length));
    const optionsCopy = [...attribute.options];
    const selected = [];
    
    for (let i = 0; i < numOptions; i++) {
      const index = random.nextInt(0, optionsCopy.length - 1);
      selected.push(optionsCopy[index].value);
      optionsCopy.splice(index, 1);
    }
    
    return selected;
  } else if (attribute.type === 'select' && attribute.options && attribute.options.length > 0) {
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
 * @returns {string[]} Array of project type values
 */
export function getProjectTypes(categoryValue, random, isService = false) {
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
 * Generate product attributes (internal format with 'value' field)
 * 
 * This function generates attributes in the internal format used during generation.
 * The attributes will later be transformed to ACO format (with 'values' array).
 * 
 * @param {object} metadata - Attribute metadata definitions
 * @param {string} categoryValue - Product category value
 * @param {string} brand - Product brand
 * @param {string} uom - Unit of measure
 * @param {object} random - Seeded random number generator
 * @param {string} category - Category key (for logging)
 * @param {string} subcategory - Subcategory key (for logging)
 * @param {string} sku - Product SKU (for logging)
 * @param {string} productName - Product name (for logging)
 * @param {boolean} isService - Whether this is a service product
 * @returns {Array} Array of attribute objects with {code, value}
 */
export function generateAttributes(metadata, categoryValue, brand, uom, random, category, subcategory, sku, productName, isService = false) {
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

