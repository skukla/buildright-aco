/**
 * ACO Category Hierarchy Generation Script
 * Generates deterministic category hierarchy for Adobe Commerce catalog
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedRandom, seedRandomInt, seedRandomBoolean } from '../shared/random-seed.js';
import { validateSchema } from '../shared/schema-validator.js';
import logger from '../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate category hierarchy for ACO catalog
 * @param {Object} config - Generation configuration
 * @param {number} config.count - Number of categories to generate (default: 19)
 * @param {number} config.seed - Random seed for deterministic output
 * @param {string} config.outputPath - Output file path
 * @param {number} config.maxDepth - Maximum category tree depth (default: 3)
 * @param {boolean} config.includeSpecialChars - Include special characters in names
 * @param {boolean} config.forceInvalidParent - Force invalid parent for testing
 */
export async function generateCategories(config = {}) {
  // Validate configuration first before applying defaults
  if (!config.count || typeof config.count !== 'number') {
    throw new Error('Configuration error: count is required and must be a number');
  }

  if (config.count <= 0) {
    throw new Error('Configuration error: count must be positive');
  }

  const {
    count = 19,
    seed = Date.now(),
    outputPath = './output/buildright/categories.json',
    maxDepth = 3,
    includeSpecialChars = false,
    forceInvalidParent = false
  } = config;

  logger.info('Category Generation Started', {
    count,
    seed,
    outputPath,
    maxDepth
  });

  // Initialize seeded random number generators
  const random = seedRandom(seed);
  const randomInt = seedRandomInt(seed + 1);
  const randomBool = seedRandomBoolean(seed + 2);

  // Define BuildRight-specific category structure
  const categoryStructure = [
    // Root categories (Level 0)
    { name: 'Tools & Equipment', level: 0, parent: null },
    { name: 'Building Materials', level: 0, parent: null },
    { name: 'Safety & Protection', level: 0, parent: null },

    // Tools & Equipment subcategories (Level 1)
    { name: 'Power Tools', level: 1, parent: 'Tools & Equipment' },
    { name: 'Hand Tools', level: 1, parent: 'Tools & Equipment' },
    { name: 'Tool Storage', level: 1, parent: 'Tools & Equipment' },

    // Building Materials subcategories (Level 1)
    { name: 'Lumber', level: 1, parent: 'Building Materials' },
    { name: 'Concrete & Masonry', level: 1, parent: 'Building Materials' },
    { name: 'Insulation', level: 1, parent: 'Building Materials' },
    { name: 'Roofing', level: 1, parent: 'Building Materials' },

    // Safety subcategories (Level 1)
    { name: 'Personal Protection', level: 1, parent: 'Safety & Protection' },
    { name: 'Site Safety', level: 1, parent: 'Safety & Protection' },

    // Power Tools subcategories (Level 2)
    { name: 'Drills', level: 2, parent: 'Power Tools' },
    { name: 'Saws', level: 2, parent: 'Power Tools' },
    { name: 'Sanders', level: 2, parent: 'Power Tools' },

    // Hand Tools subcategories (Level 2)
    { name: 'Hammers', level: 2, parent: 'Hand Tools' },
    { name: 'Wrenches', level: 2, parent: 'Hand Tools' },
    { name: 'Screwdrivers', level: 2, parent: 'Hand Tools' },

    // Personal Protection subcategories (Level 2)
    { name: 'Safety Helmets', level: 2, parent: 'Personal Protection' }
  ];

  // Generate categories with hierarchical structure
  const categories = [];
  const categoryMap = new Map(); // Map of name to categoryId

  // Take only the requested count of categories
  const categoriesToGenerate = categoryStructure.slice(0, count);

  for (let i = 0; i < categoriesToGenerate.length; i++) {
    const template = categoriesToGenerate[i];
    const categoryId = `cat_${String(i + 1).padStart(3, '0')}`;

    // Store mapping for parent lookups
    categoryMap.set(template.name, categoryId);

    // Determine parent ID
    let parentId = null;
    if (template.parent) {
      parentId = categoryMap.get(template.parent) || null;
    }

    // Apply special characters if requested
    let categoryName = template.name;
    if (includeSpecialChars && i < 5) {
      // Add special characters to first 5 categories for testing
      const specialChars = [' & ', '"', "'", '®', '™'];
      const charIndex = i % specialChars.length;
      categoryName = `${template.name}${specialChars[charIndex]}Special`;
    }

    const category = {
      categoryId,
      name: categoryName,
      parentId,
      isActive: true,
      sortOrder: i + 1,
      level: template.level
    };

    // Add optional fields with some randomness
    if (randomBool(0.7)) { // 70% chance to have description
      category.description = `Description for ${categoryName}`;
    }

    if (randomBool(0.5)) { // 50% chance to have URL key
      category.urlKey = categoryName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    categories.push(category);
  }

  // If we need more categories than our predefined structure, generate generic ones
  if (count > categoryStructure.length) {
    for (let i = categoryStructure.length; i < count; i++) {
      const categoryId = `cat_${String(i + 1).padStart(3, '0')}`;

      // Randomly assign to existing categories as parents
      let parentId = null;
      let level = 0;

      if (categories.length > 3 && randomBool(0.7)) {
        // 70% chance to have a parent
        const eligibleParents = categories.filter(cat => cat.level < maxDepth);
        if (eligibleParents.length > 0) {
          const parentIndex = randomInt(0, eligibleParents.length - 1);
          const parent = eligibleParents[parentIndex];
          parentId = parent.categoryId;
          level = parent.level + 1;
        }
      }

      const category = {
        categoryId,
        name: `Additional Category ${i + 1}`,
        parentId,
        isActive: true,
        sortOrder: i + 1,
        level
      };

      categories.push(category);
    }
  }

  // Force invalid parent for testing if requested
  if (forceInvalidParent && categories.length > 0) {
    categories[categories.length - 1].parentId = 'invalid_parent_id';
    throw new Error('Invalid parent reference detected: invalid_parent_id');
  }

  // Validate parent references
  const categoryIds = new Set(categories.map(cat => cat.categoryId));
  const invalidParents = categories
    .filter(cat => cat.parentId)
    .filter(cat => !categoryIds.has(cat.parentId));

  if (invalidParents.length > 0) {
    const invalidRefs = invalidParents.map(c => `${c.categoryId} -> ${c.parentId}`);
    throw new Error(`Invalid parent references found: ${invalidRefs.join(', ')}`);
  }

  // Validate for circular references
  const checkCircular = (categoryId, visited = new Set()) => {
    if (visited.has(categoryId)) return true;

    const category = categories.find(c => c.categoryId === categoryId);
    if (!category || !category.parentId) return false;

    visited.add(categoryId);
    return checkCircular(category.parentId, visited);
  };

  for (const category of categories) {
    if (checkCircular(category.categoryId)) {
      throw new Error(`Circular reference detected in category hierarchy starting from ${category.categoryId}`);
    }
  }

  // Validate against schema
  const validationResult = validateSchema(categories, 'aco-category');
  if (!validationResult.isValid) {
    logger.error('Schema Validation Failed', { errors: validationResult.errors });
    throw new Error(`Schema validation failed: ${validationResult.errors.join(', ')}`);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Write to file with proper formatting
  await fs.writeFile(outputPath, JSON.stringify(categories, null, 2), 'utf8');

  // Get file size for logging
  const stats = await fs.stat(outputPath);

  // Calculate hierarchy statistics
  const rootCategories = categories.filter(c => !c.parentId);
  const maxActualDepth = Math.max(...categories.map(c => c.level));
  const avgChildrenPerParent = categories.filter(c => c.parentId).length /
                              categories.filter(c => categories.some(child => child.parentId === c.categoryId)).length || 0;

  logger.info('Category Generation Complete', {
    count: categories.length,
    rootCategories: rootCategories.length,
    maxDepth: maxActualDepth,
    outputPath,
    fileSize: stats.size,
    averageChildrenPerParent: Math.round(avgChildrenPerParent * 100) / 100,
    levelDistribution: {
      level0: categories.filter(c => c.level === 0).length,
      level1: categories.filter(c => c.level === 1).length,
      level2: categories.filter(c => c.level === 2).length,
      level3Plus: categories.filter(c => c.level >= 3).length
    }
  });

  return categories;
}

/**
 * Calculate depth of category in hierarchy
 * @private
 */
function getDepth(categoryId, categories) {
  const category = categories.find(c => c.categoryId === categoryId);
  if (!category || !category.parentId) return 0;
  return 1 + getDepth(category.parentId, categories);
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = {
    count: parseInt(process.env.CAT_COUNT) || 19,
    seed: parseInt(process.env.SEED) || 12345,
    outputPath: process.env.OUTPUT_PATH || './output/buildright/categories.json',
    maxDepth: parseInt(process.env.MAX_DEPTH) || 3
  };

  try {
    await generateCategories(config);
    process.exit(0);
  } catch (error) {
    logger.error('Category Generation Failed', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    process.exit(1);
  }
}