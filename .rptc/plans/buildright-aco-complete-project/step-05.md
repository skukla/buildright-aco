# Step 5: Generation Scripts - Metadata & Categories

## Purpose

Create foundational data generation scripts for ACO metadata attributes and category hierarchy. These scripts will produce deterministic, schema-compliant JSON files representing the 20 metadata attributes and 19 categories specified in the reduced scope, with comprehensive validation, logging, and error handling.

**Why this step:** Metadata and categories establish the structural foundation for product generation in Step 6. These must be created first as products depend on valid category assignments and metadata attribute definitions.

---

## Prerequisites

- [x] Step 1-3: Foundation complete (validation, architecture decision, utilities)
- [x] Step 4: Core Utilities & Shared Libraries complete (ACO client, validators, logging, config)
- [ ] Access to reduced scope specification (20 attributes, 19 categories)
- [ ] Understanding of ACO metadata schema requirements
- [ ] Understanding of ACO category hierarchy structure

---

## Tests to Write First

### Happy Path Tests

- [ ] **Test: Generate metadata attributes with all required ACO fields**
  - **Given:** Metadata generator configured with 20 attributes from reduced scope
  - **When:** Generator runs with default configuration
  - **Then:** Produces metadata.json with 20 attribute objects, each containing required fields (attributeId, label, type, isRequired, defaultValue, options if applicable)
  - **File:** `tests/unit/scripts/generate-metadata.test.js`

- [ ] **Test: Generate category hierarchy with proper parent-child relationships**
  - **Given:** Category generator configured with 19 categories and hierarchical structure
  - **When:** Generator runs with default configuration
  - **Then:** Produces categories.json with 19 category objects, proper parentId references, no orphaned categories, valid root categories
  - **File:** `tests/unit/scripts/generate-categories.test.js`

- [ ] **Test: Validate generated metadata against ACO schema**
  - **Given:** Generated metadata.json file
  - **When:** Schema validator runs against ACO metadata schema
  - **Then:** Validation passes with zero errors, all required fields present, data types correct
  - **File:** `tests/unit/scripts/generate-metadata.test.js`

- [ ] **Test: Validate generated categories against ACO schema**
  - **Given:** Generated categories.json file
  - **When:** Schema validator runs against ACO category schema
  - **Then:** Validation passes with zero errors, hierarchy valid, no circular references
  - **File:** `tests/unit/scripts/generate-categories.test.js`

### Deterministic Output Tests

- [ ] **Test: Metadata generation produces identical output with same seed**
  - **Given:** Metadata generator with seed value 12345
  - **When:** Generator runs twice with same seed
  - **Then:** Both outputs produce byte-identical metadata.json files (reproducible data)
  - **File:** `tests/unit/scripts/generate-metadata.test.js`

- [ ] **Test: Category generation produces identical output with same seed**
  - **Given:** Category generator with seed value 12345
  - **When:** Generator runs twice with same seed
  - **Then:** Both outputs produce byte-identical categories.json files (reproducible data)
  - **File:** `tests/unit/scripts/generate-categories.test.js`

### Edge Case Tests

- [ ] **Test: Handle metadata attributes with empty option sets**
  - **Given:** Metadata attribute of type "text" (no options required)
  - **When:** Generator processes attribute
  - **Then:** Produces valid attribute without options field, no errors thrown
  - **File:** `tests/unit/scripts/generate-metadata.test.js`

- [ ] **Test: Handle category hierarchy with maximum depth**
  - **Given:** Category tree with 4 levels deep (root → L1 → L2 → L3 → L4)
  - **When:** Generator processes deep hierarchy
  - **Then:** All levels correctly linked, no stack overflow, valid parentId chains
  - **File:** `tests/unit/scripts/generate-categories.test.js`

- [ ] **Test: Handle special characters in category names**
  - **Given:** Category names with ampersands, quotes, unicode characters
  - **When:** Generator processes categories
  - **Then:** Special characters properly escaped, valid JSON output, no encoding issues
  - **File:** `tests/unit/scripts/generate-categories.test.js`

### Error Condition Tests

- [ ] **Test: Handle missing required metadata fields in configuration**
  - **Given:** Metadata configuration missing required field (e.g., "type")
  - **When:** Generator validates configuration
  - **Then:** Throws descriptive error, logs missing field, no file written
  - **File:** `tests/unit/scripts/generate-metadata.test.js`

- [ ] **Test: Handle invalid category parent references**
  - **Given:** Category configuration with parentId pointing to non-existent category
  - **When:** Generator validates category hierarchy
  - **Then:** Throws descriptive error, logs invalid reference, no file written
  - **File:** `tests/unit/scripts/generate-categories.test.js`

- [ ] **Test: Handle file system write errors**
  - **Given:** Output directory is read-only or does not exist
  - **When:** Generator attempts to write JSON files
  - **Then:** Throws file system error, logs error with path, suggests remediation
  - **File:** `tests/integration/scripts/generator-error-handling.test.js`

### Logging and Error Handling Tests

- [ ] **Test: Log generation start, progress, and completion**
  - **Given:** Metadata or category generator running
  - **When:** Generator executes through full lifecycle
  - **Then:** Logs include: start timestamp, configuration summary, item count, completion timestamp, output file path
  - **File:** `tests/unit/scripts/generate-metadata.test.js`

- [ ] **Test: Log validation errors with detailed context**
  - **Given:** Generated data fails schema validation
  - **When:** Validator identifies errors
  - **Then:** Logs include: error type, field path, expected vs actual value, line number if applicable
  - **File:** `tests/unit/scripts/generate-categories.test.js`

---

## Files to Create/Modify

### New Files to Create

- [ ] `scripts/generate-metadata.js` - Main metadata generation script (20 attributes)
- [ ] `scripts/generate-categories.js` - Main category generation script (19 categories)
- [ ] `scripts/schemas/aco-metadata-schema.json` - ACO metadata JSON schema for validation
- [ ] `scripts/schemas/aco-category-schema.json` - ACO category JSON schema for validation
- [ ] `tests/unit/scripts/generate-metadata.test.js` - Metadata generator tests
- [ ] `tests/unit/scripts/generate-categories.test.js` - Category generator tests
- [ ] `tests/integration/scripts/generator-error-handling.test.js` - Cross-generator error handling tests
- [ ] `data/buildright/metadata.json` - Generated metadata output (created by script)
- [ ] `data/buildright/categories.json` - Generated categories output (created by script)

### Existing Files to Modify

- [ ] `utils/schema-validator.js` - Extend to support metadata and category schemas (if not already comprehensive from Step 4)
- [ ] `utils/logger.js` - Add generator-specific logging functions if needed (from Step 4)
- [ ] `package.json` - Add npm scripts: `npm run generate:metadata`, `npm run generate:categories`

---

## Implementation Details

### RED Phase (Write failing tests first)

```javascript
// tests/unit/scripts/generate-metadata.test.js
import { describe, it, expect } from '@jest/globals';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { generateMetadata } from '../../../scripts/generate-metadata.js';
import { validateSchema } from '../../../utils/schema-validator.js';

describe('Metadata Generation', () => {
  const outputPath = './data/buildright/metadata.json';

  afterEach(() => {
    // Clean up generated files after each test
    if (existsSync(outputPath)) {
      unlinkSync(outputPath);
    }
  });

  describe('Happy Path', () => {
    it('should generate metadata with all 20 required attributes', async () => {
      // Arrange
      const config = { count: 20, seed: 12345 };

      // Act
      await generateMetadata(config);

      // Assert
      const metadata = JSON.parse(readFileSync(outputPath, 'utf8'));
      expect(metadata).toHaveLength(20);
      expect(metadata[0]).toHaveProperty('attributeId');
      expect(metadata[0]).toHaveProperty('label');
      expect(metadata[0]).toHaveProperty('type');
      expect(metadata[0]).toHaveProperty('isRequired');
    });

    it('should pass ACO schema validation', async () => {
      // Arrange
      const config = { count: 20, seed: 12345 };

      // Act
      await generateMetadata(config);
      const metadata = JSON.parse(readFileSync(outputPath, 'utf8'));
      const validationResult = validateSchema(metadata, 'aco-metadata');

      // Assert
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });
  });

  describe('Deterministic Output', () => {
    it('should produce identical output with same seed', async () => {
      // Arrange
      const config = { count: 20, seed: 12345 };

      // Act
      await generateMetadata(config);
      const firstOutput = readFileSync(outputPath, 'utf8');

      unlinkSync(outputPath);

      await generateMetadata(config);
      const secondOutput = readFileSync(outputPath, 'utf8');

      // Assert
      expect(firstOutput).toEqual(secondOutput);
    });
  });

  describe('Edge Cases', () => {
    it('should handle text attributes without option sets', async () => {
      // Arrange
      const config = { count: 5, seed: 12345, includeTextAttributes: true };

      // Act
      await generateMetadata(config);

      // Assert
      const metadata = JSON.parse(readFileSync(outputPath, 'utf8'));
      const textAttribute = metadata.find(attr => attr.type === 'text');
      expect(textAttribute).toBeDefined();
      expect(textAttribute.options).toBeUndefined();
    });
  });

  describe('Error Conditions', () => {
    it('should throw error for missing required configuration fields', async () => {
      // Arrange
      const invalidConfig = { seed: 12345 }; // missing count

      // Act & Assert
      await expect(generateMetadata(invalidConfig)).rejects.toThrow(/count.*required/i);
    });
  });
});
```

```javascript
// tests/unit/scripts/generate-categories.test.js
import { describe, it, expect } from '@jest/globals';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { generateCategories } from '../../../scripts/generate-categories.js';
import { validateSchema } from '../../../utils/schema-validator.js';

describe('Category Generation', () => {
  const outputPath = './data/buildright/categories.json';

  afterEach(() => {
    if (existsSync(outputPath)) {
      unlinkSync(outputPath);
    }
  });

  describe('Happy Path', () => {
    it('should generate category hierarchy with proper parent-child relationships', async () => {
      // Arrange
      const config = { count: 19, seed: 12345 };

      // Act
      await generateCategories(config);

      // Assert
      const categories = JSON.parse(readFileSync(outputPath, 'utf8'));
      expect(categories).toHaveLength(19);

      // Verify at least one root category (parentId null or undefined)
      const rootCategories = categories.filter(cat => !cat.parentId);
      expect(rootCategories.length).toBeGreaterThan(0);

      // Verify all parent references are valid
      const categoryIds = new Set(categories.map(cat => cat.categoryId));
      const invalidParents = categories
        .filter(cat => cat.parentId)
        .filter(cat => !categoryIds.has(cat.parentId));
      expect(invalidParents).toHaveLength(0);
    });

    it('should pass ACO schema validation', async () => {
      // Arrange
      const config = { count: 19, seed: 12345 };

      // Act
      await generateCategories(config);
      const categories = JSON.parse(readFileSync(outputPath, 'utf8'));
      const validationResult = validateSchema(categories, 'aco-category');

      // Assert
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });
  });

  describe('Deterministic Output', () => {
    it('should produce identical output with same seed', async () => {
      // Arrange
      const config = { count: 19, seed: 12345 };

      // Act
      await generateCategories(config);
      const firstOutput = readFileSync(outputPath, 'utf8');

      unlinkSync(outputPath);

      await generateCategories(config);
      const secondOutput = readFileSync(outputPath, 'utf8');

      // Assert
      expect(firstOutput).toEqual(secondOutput);
    });
  });

  describe('Edge Cases', () => {
    it('should handle deep category hierarchy (4+ levels)', async () => {
      // Arrange
      const config = { count: 19, seed: 12345, maxDepth: 4 };

      // Act
      await generateCategories(config);

      // Assert
      const categories = JSON.parse(readFileSync(outputPath, 'utf8'));

      // Build hierarchy map
      const findDepth = (categoryId, depth = 0) => {
        const category = categories.find(c => c.categoryId === categoryId);
        if (!category || !category.parentId) return depth;
        return findDepth(category.parentId, depth + 1);
      };

      const maxDepth = Math.max(...categories.map(c => findDepth(c.categoryId)));
      expect(maxDepth).toBeGreaterThanOrEqual(3); // 0-indexed, so 3 = 4 levels
    });

    it('should handle special characters in category names', async () => {
      // Arrange
      const config = {
        count: 5,
        seed: 12345,
        includeSpecialChars: true
      };

      // Act
      await generateCategories(config);

      // Assert
      const categories = JSON.parse(readFileSync(outputPath, 'utf8'));
      const categoryNames = categories.map(c => c.name);

      // Verify special characters preserved and properly encoded
      expect(JSON.stringify(categoryNames)).not.toContain('\\u');
      expect(() => JSON.parse(readFileSync(outputPath, 'utf8'))).not.toThrow();
    });
  });

  describe('Error Conditions', () => {
    it('should throw error for invalid parent references', async () => {
      // Arrange
      const invalidConfig = {
        count: 19,
        seed: 12345,
        invalidParent: 'non-existent-id'
      };

      // Act & Assert
      await expect(generateCategories(invalidConfig)).rejects.toThrow(/invalid.*parent/i);
    });
  });
});
```

### GREEN Phase (Minimal implementation to pass tests)

1. **Create `scripts/generate-metadata.js`**

```javascript
import fs from 'fs/promises';
import path from 'path';
import { seedRandom } from '../utils/random-seed.js';
import { validateSchema } from '../utils/schema-validator.js';
import logger from '../utils/logger.js';

/**
 * Generate metadata attributes for ACO catalog
 * @param {Object} config - Generation configuration
 * @param {number} config.count - Number of attributes to generate (default: 20)
 * @param {number} config.seed - Random seed for deterministic output
 * @param {string} config.outputPath - Output file path
 */
export async function generateMetadata(config = {}) {
  const {
    count = 20,
    seed = Date.now(),
    outputPath = './data/buildright/metadata.json',
    includeTextAttributes = true
  } = config;

  // Validate configuration
  if (!count || typeof count !== 'number') {
    throw new Error('Configuration error: count is required and must be a number');
  }

  logger.info('Metadata Generation Started', { count, seed, outputPath });

  // Initialize seeded random number generator
  const random = seedRandom(seed);

  // Define attribute types
  const attributeTypes = [
    { type: 'text', hasOptions: false, weight: 0.3 },
    { type: 'select', hasOptions: true, weight: 0.4 },
    { type: 'multiselect', hasOptions: true, weight: 0.2 },
    { type: 'boolean', hasOptions: false, weight: 0.1 }
  ];

  // Generate attributes
  const attributes = [];
  for (let i = 0; i < count; i++) {
    // Select type based on weighted distribution
    const typeRand = random();
    let cumulativeWeight = 0;
    let selectedType = attributeTypes[0];

    for (const attrType of attributeTypes) {
      cumulativeWeight += attrType.weight;
      if (typeRand <= cumulativeWeight) {
        selectedType = attrType;
        break;
      }
    }

    const attribute = {
      attributeId: `attr_${String(i + 1).padStart(3, '0')}`,
      label: `Attribute ${i + 1}`,
      type: selectedType.type,
      isRequired: random() < 0.3, // 30% of attributes are required
      defaultValue: selectedType.type === 'boolean' ? false : null,
      sortOrder: i + 1
    };

    // Add options for select/multiselect types
    if (selectedType.hasOptions) {
      const optionCount = Math.floor(random() * 5) + 3; // 3-7 options
      attribute.options = [];
      for (let j = 0; j < optionCount; j++) {
        attribute.options.push({
          value: `option_${j + 1}`,
          label: `Option ${j + 1}`
        });
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

  // Write to file
  await fs.writeFile(outputPath, JSON.stringify(attributes, null, 2), 'utf8');

  logger.info('Metadata Generation Complete', {
    count: attributes.length,
    outputPath,
    fileSize: (await fs.stat(outputPath)).size
  });

  return attributes;
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
    logger.error('Metadata Generation Failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}
```

2. **Create `scripts/generate-categories.js`**

```javascript
import fs from 'fs/promises';
import path from 'path';
import { seedRandom } from '../utils/random-seed.js';
import { validateSchema } from '../utils/schema-validator.js';
import logger from '../utils/logger.js';

/**
 * Generate category hierarchy for ACO catalog
 * @param {Object} config - Generation configuration
 * @param {number} config.count - Number of categories to generate (default: 19)
 * @param {number} config.seed - Random seed for deterministic output
 * @param {string} config.outputPath - Output file path
 * @param {number} config.maxDepth - Maximum category tree depth (default: 3)
 */
export async function generateCategories(config = {}) {
  const {
    count = 19,
    seed = Date.now(),
    outputPath = './data/buildright/categories.json',
    maxDepth = 3,
    includeSpecialChars = false
  } = config;

  // Validate configuration
  if (!count || typeof count !== 'number') {
    throw new Error('Configuration error: count is required and must be a number');
  }

  logger.info('Category Generation Started', { count, seed, outputPath, maxDepth });

  // Initialize seeded random number generator
  const random = seedRandom(seed);

  // Generate categories with hierarchical structure
  const categories = [];
  const categoryIds = [];

  for (let i = 0; i < count; i++) {
    const categoryId = `cat_${String(i + 1).padStart(3, '0')}`;
    categoryIds.push(categoryId);

    // Determine parent (root categories if i < 3, otherwise random parent from previous categories)
    let parentId = null;
    if (i >= 3) {
      // Ensure we don't exceed maxDepth
      const eligibleParents = categories.filter(cat => {
        const depth = getDepth(cat.categoryId, categories);
        return depth < maxDepth;
      });

      if (eligibleParents.length > 0) {
        const parentIndex = Math.floor(random() * eligibleParents.length);
        parentId = eligibleParents[parentIndex].categoryId;
      }
    }

    const category = {
      categoryId,
      name: includeSpecialChars
        ? `Category ${i + 1} & "Special" Chars`
        : `Category ${i + 1}`,
      parentId,
      isActive: true,
      sortOrder: i + 1,
      level: parentId ? getDepth(parentId, categories) + 1 : 0
    };

    categories.push(category);
  }

  // Validate parent references
  const invalidParents = categories
    .filter(cat => cat.parentId)
    .filter(cat => !categoryIds.includes(cat.parentId));

  if (invalidParents.length > 0) {
    throw new Error(`Invalid parent references found: ${invalidParents.map(c => c.categoryId).join(', ')}`);
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

  // Write to file
  await fs.writeFile(outputPath, JSON.stringify(categories, null, 2), 'utf8');

  logger.info('Category Generation Complete', {
    count: categories.length,
    rootCategories: categories.filter(c => !c.parentId).length,
    maxDepth: Math.max(...categories.map(c => c.level)),
    outputPath,
    fileSize: (await fs.stat(outputPath)).size
  });

  return categories;
}

/**
 * Calculate depth of category in hierarchy
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
    outputPath: process.env.OUTPUT_PATH || './data/buildright/categories.json',
    maxDepth: parseInt(process.env.MAX_DEPTH) || 3
  };

  try {
    await generateCategories(config);
    process.exit(0);
  } catch (error) {
    logger.error('Category Generation Failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}
```

3. **Create `utils/random-seed.js` (if not exists from Step 4)**

```javascript
/**
 * Seeded random number generator for deterministic output
 * Uses Linear Congruential Generator (LCG) algorithm
 */
export function seedRandom(seed) {
  let state = seed;

  return function() {
    // LCG parameters (same as Java's java.util.Random)
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}
```

4. **Create JSON schemas**

```json
// scripts/schemas/aco-metadata-schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["attributeId", "label", "type", "isRequired", "sortOrder"],
    "properties": {
      "attributeId": { "type": "string" },
      "label": { "type": "string" },
      "type": {
        "type": "string",
        "enum": ["text", "select", "multiselect", "boolean", "number", "date"]
      },
      "isRequired": { "type": "boolean" },
      "defaultValue": {},
      "sortOrder": { "type": "number" },
      "options": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["value", "label"],
          "properties": {
            "value": { "type": "string" },
            "label": { "type": "string" }
          }
        }
      }
    }
  }
}
```

```json
// scripts/schemas/aco-category-schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["categoryId", "name", "isActive", "sortOrder", "level"],
    "properties": {
      "categoryId": { "type": "string" },
      "name": { "type": "string" },
      "parentId": { "type": ["string", "null"] },
      "isActive": { "type": "boolean" },
      "sortOrder": { "type": "number" },
      "level": { "type": "number", "minimum": 0 }
    }
  }
}
```

5. **Update package.json scripts**

```json
{
  "scripts": {
    "generate:metadata": "node scripts/generate-metadata.js",
    "generate:categories": "node scripts/generate-categories.js",
    "generate:all": "npm run generate:metadata && npm run generate:categories"
  }
}
```

### REFACTOR Phase (Improve while keeping tests green)

1. **Extract common generation patterns**
   - If duplication exists between generators, extract to `utils/generator-helpers.js`
   - Common patterns: file writing, directory creation, schema validation
   - Keep each generator focused on its specific domain logic

2. **Enhance error messages**
   - Add context to errors (which attribute/category failed, why)
   - Include suggestions for remediation
   - Log stack traces in debug mode only

3. **Improve logging structure**
   - Use structured logging (JSON format for easy parsing)
   - Add performance metrics (generation time, items per second)
   - Include memory usage for large data sets

4. **Code quality**
   - Add JSDoc comments for all exported functions
   - Follow project style guide (ES modules, consistent naming)
   - Remove any debug console.log statements
   - Verify all tests still pass after refactoring

---

## Expected Outcome

After completing this step:

- **Two generation scripts operational:** `generate-metadata.js` and `generate-categories.js`
- **All tests passing:** 15+ test cases covering happy path, deterministic output, edge cases, error conditions
- **Generated data files:**
  - `data/buildright/metadata.json` - 20 attribute definitions, schema-validated
  - `data/buildright/categories.json` - 19 categories with valid hierarchy, schema-validated
- **Deterministic output verified:** Same seed produces byte-identical files (reproducibility)
- **Schema validation integrated:** Both generators validate output against ACO schemas
- **Comprehensive logging:** Start/complete timestamps, item counts, file sizes, validation status
- **CLI-ready scripts:** Can be run via npm scripts with environment variable configuration
- **Foundation for Step 6:** Products can now reference valid categories and use metadata attributes

---

## Acceptance Criteria

- [ ] All tests passing (15+ test cases, 85%+ coverage for generator scripts)
- [ ] Metadata generator produces 20 attributes matching reduced scope specification
- [ ] Category generator produces 19 categories with valid hierarchy (no orphans, no circular refs)
- [ ] Deterministic output verified (same seed = identical files)
- [ ] Schema validation passing for both metadata and categories
- [ ] Generated JSON files are valid (parse without errors)
- [ ] Logging includes all required information (timestamps, counts, validation status, file paths)
- [ ] Error handling covers missing config, invalid parents, file system errors
- [ ] Code follows project style guide (ES modules, proper imports, JSDoc comments)
- [ ] No debug code (console.log removed or replaced with logger)
- [ ] npm scripts work: `npm run generate:metadata`, `npm run generate:categories`
- [ ] Files created in correct location: `data/buildright/` directory

---

## Dependencies from Other Steps

**Prerequisites:**
- Step 4: Core Utilities & Shared Libraries (uses validators, logger, config loader)

**Blocks:**
- Step 6: Product generation (requires categories and metadata attributes)

---

## Estimated Time

**3-4 hours**

- Test design and implementation: 1.5 hours
- Generator script implementation (metadata + categories): 1.5 hours
- Schema creation and validation integration: 0.5 hour
- Refactoring and code quality: 0.5 hour
- Testing and verification: 0.5 hour

---

## Implementation Notes

**Key Considerations:**

1. **Deterministic Output:** Critical for reproducibility in demos and testing. Use seeded random number generator, not Math.random()
2. **Schema Compliance:** ACO has strict schema requirements. Validate before writing files to catch errors early
3. **Category Hierarchy:** Must be acyclic directed graph (DAG). Validate no circular references exist
4. **Special Characters:** Categories may contain ampersands, quotes. Ensure proper JSON encoding
5. **Reduced Scope Alignment:** Verify 20 attributes and 19 categories match reduced scope specification exactly

**Reference Documents:**
- Reduced scope specification (for attribute/category counts and types)
- Research document (ACO schema requirements)

**Reference SOPs:**
- `testing-guide.md` (SOP) - For TDD methodology
- `architecture-patterns.md` (SOP) - For generator pattern and file organization
- `languages-and-style.md` (SOP) - For Node.js ES module conventions

---

_Step 5 ready for TDD implementation._
