/**
 * ACO Metadata Attribute Generation Script
 * Generates deterministic metadata attributes for Adobe Commerce catalog
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedRandom, seedRandomBoolean, seedRandomInt } from '../utils/random-seed.js';
import { validateSchema } from '../utils/schema-validator.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate metadata attributes for ACO catalog
 *
 * This function generates product attributes that can be used for ACO policy filtering.
 * When useSemantic=true, it generates semantic attributes (project_types, commercial_residential, brand)
 * instead of generic codes (attr_001, attr_002, etc.).
 *
 * @param {Object} config - Generation configuration
 * @param {number} config.count - Number of attributes to generate (default: 20)
 * @param {number} config.seed - Random seed for deterministic output
 * @param {string} config.outputPath - Output file path
 * @param {boolean} config.includeTextAttributes - Include text attributes without options
 * @param {boolean} config.useSemantic - Use semantic attribute codes (project_types, brand) instead of generic (attr_001)
 * @returns {Promise<Array>} Generated metadata attributes
 */
export async function generateMetadata(config = {}) {
  // Validate configuration first before applying defaults
  if (!config.count || typeof config.count !== 'number') {
    throw new Error('Configuration error: count is required and must be a number');
  }

  if (config.count <= 0) {
    throw new Error('Configuration error: count must be positive');
  }

  const {
    count = 20,
    seed = Date.now(),
    outputPath = './data/buildright/metadata.json',
    includeTextAttributes = true,
    useSemantic = false
  } = config;

  logger.info('Metadata Generation Started', { count, seed, outputPath, useSemantic });

  // Initialize seeded random number generators
  const random = seedRandom(seed);
  const randomBool = seedRandomBoolean(seed + 1);
  const randomInt = seedRandomInt(seed + 2);

  // Define semantic attributes for ACO policy filtering
  const semanticAttributes = [
    {
      attributeId: 'product_category',
      label: 'Product Category',
      type: 'select',
      isRequired: true,
      defaultValue: null,
      sortOrder: 1,
      options: [
        { value: 'structural_materials', label: 'Structural Materials' },
        { value: 'finishing_materials', label: 'Finishing Materials' },
        { value: 'fasteners_hardware', label: 'Fasteners & Hardware' },
        { value: 'safety_equipment', label: 'Safety Equipment' },
        { value: 'tools_equipment', label: 'Tools & Equipment' }
      ]
    },
    {
      attributeId: 'project_types',
      label: 'Project Types',
      type: 'multiselect',
      isRequired: false,
      defaultValue: null,
      sortOrder: 2,
      options: [
        { value: 'new_construction', label: 'New Construction' },
        { value: 'remodel', label: 'Remodel' },
        { value: 'repair', label: 'Repair' },
        { value: 'restoration', label: 'Restoration' }
      ]
    },
    {
      attributeId: 'commercial_residential',
      label: 'Commercial/Residential',
      type: 'select',
      isRequired: false,
      defaultValue: 'residential',
      sortOrder: 3,
      options: [
        { value: 'commercial', label: 'Commercial' },
        { value: 'residential', label: 'Residential' },
        { value: 'both', label: 'Both' }
      ]
    },
    {
      attributeId: 'brand',
      label: 'Brand',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 4,
      options: [
        { value: 'buildright_pro', label: 'BuildRight Pro' },
        { value: 'structuremaster', label: 'StructureMaster' },
        { value: 'proframe', label: 'ProFrame' },
        { value: 'safeguard', label: 'SafeGuard' },
        { value: 'fastenpro', label: 'FastenPro' },
        { value: 'durabuilt', label: 'DuraBuilt' }
      ]
    }
  ];

  // Define attribute types with weights
  const attributeTypes = [
    { type: 'text', hasOptions: false, weight: 0.3 },
    { type: 'select', hasOptions: true, weight: 0.35 },
    { type: 'multiselect', hasOptions: true, weight: 0.25 },
    { type: 'boolean', hasOptions: false, weight: 0.1 }
  ];

  // Define common attribute names for realistic metadata
  const attributeNames = [
    'Material', 'Color', 'Size', 'Weight', 'Dimensions', 'Brand', 'Model',
    'Warranty', 'Features', 'Specifications', 'Compatibility', 'Condition',
    'Certification', 'Style', 'Pattern', 'Season', 'Collection', 'Series',
    'Grade', 'Finish', 'Coating', 'Thickness', 'Length', 'Width', 'Height',
    'Capacity', 'Power', 'Voltage', 'Frequency', 'Temperature Range'
  ];

  // Generate attributes
  const attributes = [];
  const usedNames = new Set();

  // If using semantic naming, include semantic attributes first
  if (useSemantic) {
    semanticAttributes.forEach((semanticAttr, idx) => {
      attributes.push({
        ...semanticAttr,
        sortOrder: idx + 1
      });
      usedNames.add(semanticAttr.label);
    });
  }

  // Calculate how many additional attributes to generate
  const additionalCount = useSemantic ? count - semanticAttributes.length : count;

  for (let i = 0; i < additionalCount; i++) {
    const attrIndex = useSemantic ? semanticAttributes.length + i : i;

    // Force first attribute to be text if includeTextAttributes is true (and not using semantic)
    let selectedType;
    if (i === 0 && includeTextAttributes && !useSemantic) {
      selectedType = { type: 'text', hasOptions: false };
    } else {
      // Select type based on weighted distribution
      const typeRand = random();
      let cumulativeWeight = 0;
      selectedType = attributeTypes[0];

      for (const attrType of attributeTypes) {
        cumulativeWeight += attrType.weight;
        if (typeRand <= cumulativeWeight) {
          selectedType = attrType;
          break;
        }
      }
    }

    // Select unique attribute name
    let attributeName;
    if (i < attributeNames.length && !usedNames.has(attributeNames[i])) {
      attributeName = attributeNames[i];
      usedNames.add(attributeName);
    } else {
      // Generate generic name if we run out of predefined names
      attributeName = `Custom Attribute ${i + 1}`;
    }

    const attribute = {
      attributeId: `attr_${String(attrIndex + 1).padStart(3, '0')}`,
      label: attributeName,
      type: selectedType.type,
      isRequired: randomBool(0.3), // 30% of attributes are required
      defaultValue: null,
      sortOrder: attrIndex + 1
    };

    // Set appropriate default values based on type
    if (selectedType.type === 'boolean') {
      attribute.defaultValue = false;
    } else if (selectedType.type === 'text') {
      attribute.defaultValue = null; // No default for text fields
    }

    // Add options for select/multiselect types
    if (selectedType.hasOptions) {
      const optionCount = randomInt(3, 7); // 3-7 options
      attribute.options = [];

      // Generate contextual options based on attribute name
      const optionValues = generateContextualOptions(attributeName, optionCount, randomInt);

      for (let j = 0; j < optionCount; j++) {
        attribute.options.push({
          value: `${attributeName.toLowerCase().replace(/\s+/g, '_')}_option_${j + 1}`,
          label: optionValues[j] || `${attributeName} Option ${j + 1}`
        });
      }

      // Set default value to first option for select fields
      if (selectedType.type === 'select' && attribute.options.length > 0) {
        attribute.defaultValue = attribute.options[0].value;
      }
    }

    attributes.push(attribute);
  }

  // Validate against schema
  const validationResult = validateSchema(attributes, 'aco-metadata');
  if (!validationResult.isValid) {
    logger.error('Schema Validation Failed', { errors: validationResult.errors });
    throw new Error(`Schema validation failed: ${validationResult.errors.join(', ')}`);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Write to file with proper formatting
  await fs.writeFile(outputPath, JSON.stringify(attributes, null, 2), 'utf8');

  // Get file size for logging
  const stats = await fs.stat(outputPath);

  logger.info('Metadata Generation Complete', {
    count: attributes.length,
    outputPath,
    fileSize: stats.size,
    requiredAttributes: attributes.filter(a => a.isRequired).length,
    typeCounts: {
      text: attributes.filter(a => a.type === 'text').length,
      select: attributes.filter(a => a.type === 'select').length,
      multiselect: attributes.filter(a => a.type === 'multiselect').length,
      boolean: attributes.filter(a => a.type === 'boolean').length
    }
  });

  return attributes;
}

/**
 * Generate contextual options based on attribute name
 * @private
 */
function generateContextualOptions(attributeName, count, randomInt) {
  const contextualOptions = {
    'Color': ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gray', 'Brown', 'Orange', 'Purple'],
    'Size': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'],
    'Material': ['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather', 'Nylon', 'Acrylic', 'Rayon'],
    'Condition': ['New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor'],
    'Brand': ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E', 'Brand F'],
    'Grade': ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    'Style': ['Modern', 'Classic', 'Contemporary', 'Traditional', 'Minimalist', 'Industrial']
  };

  const options = contextualOptions[attributeName];
  if (options && options.length >= count) {
    // Shuffle and take first 'count' items
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  // Return generic options if no contextual match
  return Array.from({ length: count }, (_, i) => `Option ${i + 1}`);
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = {
    count: parseInt(process.env.ATTR_COUNT) || 20,
    seed: parseInt(process.env.SEED) || 12345,
    outputPath: process.env.OUTPUT_PATH || './data/buildright/metadata.json'
  };

  try {
    await generateMetadata(config);
    process.exit(0);
  } catch (error) {
    logger.error('Metadata Generation Failed', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    process.exit(1);
  }
}