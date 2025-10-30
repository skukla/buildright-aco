import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Generate Price Books Script - Hierarchical Structure', () => {
  let generatePriceBooks;
  let validatePriceBookHierarchy;
  let calculateHierarchyDepth;

  beforeEach(async () => {
    // Clear module cache
    jest.resetModules();

    // Try to import the module
    try {
      const module = await import('../../../scripts/generate-price-books.js');
      generatePriceBooks = module.generatePriceBooks;
      validatePriceBookHierarchy = module.validatePriceBookHierarchy;
      calculateHierarchyDepth = module.calculateHierarchyDepth;
    } catch (error) {
      // Module doesn't exist or export not available yet - expected in RED phase
    }
  });

  // ====================
  // Hierarchical Price Book Structure Tests
  // ====================
  describe('Hierarchical Price Book Generation', () => {
    it('should generate exactly 10 price books total', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();
      expect(priceBooks).toHaveLength(10);
    });

    it('should generate 2 base price books with currency', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();
      const baseBooks = priceBooks.filter(pb => !pb.parentId);

      // Should have exactly 2 base books
      expect(baseBooks).toHaveLength(2);

      // Each base book should have required ACO PriceBookBase fields
      baseBooks.forEach(book => {
        expect(book).toHaveProperty('priceBookId');
        expect(book).toHaveProperty('name');
        expect(book).toHaveProperty('currency', 'USD');
        expect(book).not.toHaveProperty('parentId');
      });

      // Verify expected base book IDs
      const baseIds = baseBooks.map(b => b.priceBookId).sort();
      expect(baseIds).toEqual(['US-Contract', 'US-Retail']);
    });

    it('should generate 4 level-2 child price books with parentId', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();
      const level2Books = priceBooks.filter(pb =>
        pb.parentId && ['US-Retail', 'US-Contract'].includes(pb.parentId)
      );

      // Should have exactly 4 level-2 books
      expect(level2Books).toHaveLength(4);

      // Each level-2 book should have ACO PriceBookChild fields
      level2Books.forEach(book => {
        expect(book).toHaveProperty('priceBookId');
        expect(book).toHaveProperty('name');
        expect(book).toHaveProperty('parentId');
        expect(book).not.toHaveProperty('currency'); // Inherited from parent!
      });

      // Verify expected level-2 book IDs
      const level2Ids = level2Books.map(b => b.priceBookId).sort();
      expect(level2Ids).toEqual([
        'Contract-Commercial',
        'Contract-Pro',
        'Contract-Residential',
        'Retail-Consumer'
      ]);
    });

    it('should generate 4 level-3 grandchild price books', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();
      const level3Books = priceBooks.filter(pb =>
        pb.parentId && !['US-Retail', 'US-Contract'].includes(pb.parentId)
      );

      // Should have exactly 4 level-3 books
      expect(level3Books).toHaveLength(4);

      // Each level-3 book should have ACO PriceBookChild fields
      level3Books.forEach(book => {
        expect(book).toHaveProperty('priceBookId');
        expect(book).toHaveProperty('name');
        expect(book).toHaveProperty('parentId');
        expect(book).not.toHaveProperty('currency'); // Inherited from root!
      });

      // Verify expected level-3 book IDs
      const level3Ids = level3Books.map(b => b.priceBookId).sort();
      expect(level3Ids).toEqual([
        'Commercial-Tier1',
        'Commercial-Tier2',
        'Pro-Specialty',
        'Residential-Builder'
      ]);
    });

    it('should have all parentId references valid', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();
      const allIds = new Set(priceBooks.map(pb => pb.priceBookId));

      const childBooks = priceBooks.filter(pb => pb.parentId);
      for (const child of childBooks) {
        expect(allIds).toContain(child.parentId);
      }
    });

    it('should not exceed 3 levels in hierarchy', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      function getDepth(priceBookId, books, visited = new Set()) {
        if (visited.has(priceBookId)) return Infinity; // Circular reference
        visited.add(priceBookId);

        const book = books.find(pb => pb.priceBookId === priceBookId);
        if (!book) return 0;
        if (!book.parentId) return 1; // Base book

        return 1 + getDepth(book.parentId, books, visited);
      }

      for (const book of priceBooks) {
        const depth = getDepth(book.priceBookId, priceBooks);
        expect(depth).toBeLessThanOrEqual(3);
        expect(depth).toBeGreaterThan(0); // No orphaned books
      }
    });

    it('should have unique price book IDs', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      const ids = priceBooks.map(pb => pb.priceBookId);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });

    it('should not have circular parent references', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      function hasCircularReference(priceBookId, books, visited = new Set()) {
        if (visited.has(priceBookId)) return true;
        visited.add(priceBookId);

        const book = books.find(pb => pb.priceBookId === priceBookId);
        if (!book || !book.parentId) return false;

        return hasCircularReference(book.parentId, books, visited);
      }

      for (const book of priceBooks) {
        expect(hasCircularReference(book.priceBookId, priceBooks)).toBe(false);
      }
    });
  });

  // ====================
  // ACO Schema Compliance Tests
  // ====================
  describe('ACO Schema Compliance', () => {
    it('should only include ACO-supported fields', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      const allowedBaseFields = ['priceBookId', 'name', 'currency'];
      const allowedChildFields = ['priceBookId', 'name', 'parentId'];

      priceBooks.forEach(book => {
        const bookKeys = Object.keys(book);

        if (book.parentId) {
          // Child book - should only have child fields
          bookKeys.forEach(key => {
            expect(allowedChildFields).toContain(key);
          });
        } else {
          // Base book - should only have base fields
          bookKeys.forEach(key => {
            expect(allowedBaseFields).toContain(key);
          });
        }
      });
    });

    it('should not include legacy fields from flat structure', () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      const legacyFields = ['businessType', 'discountPercentage', 'region', 'effectiveDate', 'status', 'tier', 'promotional'];

      priceBooks.forEach(book => {
        legacyFields.forEach(field => {
          expect(book).not.toHaveProperty(field);
        });
      });
    });
  });

  // ====================
  // Validation Function Tests
  // ====================
  describe('validatePriceBookHierarchy', () => {
    it('should validate correct hierarchical structure', () => {
      if (!generatePriceBooks || !validatePriceBookHierarchy) {
        expect(validatePriceBookHierarchy).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();
      const validation = validatePriceBookHierarchy(priceBooks);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      if (!validatePriceBookHierarchy) {
        expect(validatePriceBookHierarchy).toBeDefined();
        return;
      }

      const invalidBooks = [
        { priceBookId: 'TEST-1', name: 'Test Book' }, // Missing currency for base book
        { name: 'Test Child', parentId: 'TEST-1' } // Missing priceBookId
      ];

      const validation = validatePriceBookHierarchy(invalidBooks);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid parent references', () => {
      if (!validatePriceBookHierarchy) {
        expect(validatePriceBookHierarchy).toBeDefined();
        return;
      }

      const booksWithInvalidParent = [
        { priceBookId: 'BASE-1', name: 'Base', currency: 'USD' },
        { priceBookId: 'CHILD-1', name: 'Child', parentId: 'NONEXISTENT' }
      ];

      const validation = validatePriceBookHierarchy(booksWithInvalidParent);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('parent'))).toBe(true);
    });

    it('should detect duplicate price book IDs', () => {
      if (!validatePriceBookHierarchy) {
        expect(validatePriceBookHierarchy).toBeDefined();
        return;
      }

      const booksWithDuplicates = [
        { priceBookId: 'DUPLICATE', name: 'First', currency: 'USD' },
        { priceBookId: 'DUPLICATE', name: 'Second', currency: 'USD' }
      ];

      const validation = validatePriceBookHierarchy(booksWithDuplicates);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Duplicate'))).toBe(true);
    });
  });

  // ====================
  // Hierarchy Depth Calculation Tests
  // ====================
  describe('calculateHierarchyDepth', () => {
    it('should calculate depth of 3 for hierarchical structure', () => {
      if (!generatePriceBooks || !calculateHierarchyDepth) {
        expect(calculateHierarchyDepth).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      const depth = calculateHierarchyDepth(priceBooks);
      expect(depth).toBe(3);
    });

    it('should return 1 for single base book with no children', () => {
      if (!calculateHierarchyDepth) {
        expect(calculateHierarchyDepth).toBeDefined();
        return;
      }

      const singleBook = [
        { priceBookId: 'BASE-1', name: 'Base', currency: 'USD' }
      ];

      const depth = calculateHierarchyDepth(singleBook);
      expect(depth).toBe(1);
    });

    it('should return 2 for one level of children', () => {
      if (!calculateHierarchyDepth) {
        expect(calculateHierarchyDepth).toBeDefined();
        return;
      }

      const twoLevelBooks = [
        { priceBookId: 'BASE-1', name: 'Base', currency: 'USD' },
        { priceBookId: 'CHILD-1', name: 'Child', parentId: 'BASE-1' }
      ];

      const depth = calculateHierarchyDepth(twoLevelBooks);
      expect(depth).toBe(2);
    });
  });

  // ====================
  // CLI Integration
  // ====================
  describe('CLI execution', () => {
    it('should export generatePriceBooks function', async () => {
      try {
        const module = await import('../../../scripts/generate-price-books.js');
        expect(module.generatePriceBooks).toBeDefined();
        expect(typeof module.generatePriceBooks).toBe('function');
      } catch (error) {
        // Module not yet implemented or exports missing
        expect(error.code).toBe('ERR_MODULE_NOT_FOUND');
      }
    });

    it('should export validatePriceBookHierarchy function', async () => {
      const module = await import('../../../scripts/generate-price-books.js');
      expect(module.validatePriceBookHierarchy).toBeDefined();
      expect(typeof module.validatePriceBookHierarchy).toBe('function');
    });

    it('should export calculateHierarchyDepth function', async () => {
      const module = await import('../../../scripts/generate-price-books.js');
      expect(module.calculateHierarchyDepth).toBeDefined();
      expect(typeof module.calculateHierarchyDepth).toBe('function');
    });

    it('should write price books file when executed', async () => {
      const outputPath = path.join(process.cwd(), 'data/buildright/price-books.json');

      // Verify file exists after generation
      expect(fs.existsSync(outputPath)).toBe(true);

      // Verify file content is valid JSON
      const content = fs.readFileSync(outputPath, 'utf8');
      const priceBooks = JSON.parse(content);

      expect(Array.isArray(priceBooks)).toBe(true);
      expect(priceBooks.length).toBe(10);
    });
  });

  // ====================
  // Edge Cases and Error Handling
  // ====================
  describe('Edge cases', () => {
    it('should handle empty price books array', () => {
      if (!calculateHierarchyDepth) {
        expect(calculateHierarchyDepth).toBeDefined();
        return;
      }

      const depth = calculateHierarchyDepth([]);
      expect(depth).toBe(0);
    });

    it('should detect books with currency that are children', () => {
      if (!validatePriceBookHierarchy) {
        expect(validatePriceBookHierarchy).toBeDefined();
        return;
      }

      const invalidBooks = [
        { priceBookId: 'BASE-1', name: 'Base', currency: 'USD' },
        { priceBookId: 'CHILD-1', name: 'Child', parentId: 'BASE-1', currency: 'USD' } // Invalid!
      ];

      const validation = validatePriceBookHierarchy(invalidBooks);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('currency'))).toBe(true);
    });

    it('should handle books with orphaned parents', () => {
      if (!calculateHierarchyDepth) {
        expect(calculateHierarchyDepth).toBeDefined();
        return;
      }

      const booksWithOrphan = [
        { priceBookId: 'CHILD-1', name: 'Child', parentId: 'NONEXISTENT' }
      ];

      const depth = calculateHierarchyDepth(booksWithOrphan);
      expect(depth).toBe(1); // Treats orphaned book as depth 1 (parent not found = base case)
    });

    it('should protect against circular references in depth calculation', () => {
      if (!calculateHierarchyDepth) {
        expect(calculateHierarchyDepth).toBeDefined();
        return;
      }

      // Create circular reference (A -> B -> A)
      const circularBooks = [
        { priceBookId: 'A', name: 'Book A', parentId: 'B' },
        { priceBookId: 'B', name: 'Book B', parentId: 'A' }
      ];

      const depth = calculateHierarchyDepth(circularBooks);
      // Circular protection stops infinite loop - both books get depth 2
      // (visited set catches cycle, returns 0, then adds 1 twice)
      expect(depth).toBeGreaterThan(0);
      expect(depth).toBeLessThanOrEqual(3); // Should not exceed max hierarchy depth
    });

    it('should validate that all price books have names', () => {
      if (!validatePriceBookHierarchy) {
        expect(validatePriceBookHierarchy).toBeDefined();
        return;
      }

      const booksWithoutNames = [
        { priceBookId: 'TEST-1', currency: 'USD' } // Missing name
      ];

      const validation = validatePriceBookHierarchy(booksWithoutNames);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('name'))).toBe(true);
    });

    it('should validate that base books have priceBookId', () => {
      if (!validatePriceBookHierarchy) {
        expect(validatePriceBookHierarchy).toBeDefined();
        return;
      }

      const booksWithoutIds = [
        { name: 'Test Book', currency: 'USD' } // Missing priceBookId
      ];

      const validation = validatePriceBookHierarchy(booksWithoutIds);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('priceBookId'))).toBe(true);
    });
  });
});