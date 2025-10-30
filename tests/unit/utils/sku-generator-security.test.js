/**
 * Security Tests for SKU Generator
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { generateSKU, resetSkuTracker } from '../../../utils/sku-generator.js';

describe('SKU Generator Security', () => {
  beforeEach(() => {
    resetSkuTracker();
  });

  describe('Cryptographically Secure Random', () => {
    test('should generate different SKUs for same input without seed', () => {
      const options = {
        category: 'structural',
        subcategory: 'lumber',
        type: 'simple',
        name: 'Test Product'
      };

      const sku1 = generateSKU(options);
      resetSkuTracker(); // Reset to allow duplicate name
      const sku2 = generateSKU(options);

      // SKUs should be different due to random suffix
      expect(sku1).not.toBe(sku2);

      // Both should have the same prefix
      const prefix1 = sku1.split('-').slice(0, -1).join('-');
      const prefix2 = sku2.split('-').slice(0, -1).join('-');
      expect(prefix1).toBe(prefix2);
    });

    test('should generate cryptographically unique suffixes', () => {
      const skus = new Set();
      const options = {
        category: 'structural',
        subcategory: 'lumber',
        type: 'simple',
        name: 'Test'
      };

      // Generate 100 SKUs and check uniqueness
      for (let i = 0; i < 100; i++) {
        resetSkuTracker(); // Reset to test random suffix uniqueness
        const sku = generateSKU(options);
        const suffix = sku.split('-').pop();
        skus.add(suffix);
      }

      // With 3 hex chars (4096 possibilities), 100 suffixes should have very few collisions
      // Allow for up to 2 collisions (statistically reasonable)
      expect(skus.size).toBeGreaterThanOrEqual(98);
    });

    test('should generate hexadecimal random suffixes', () => {
      const options = {
        category: 'structural',
        subcategory: 'lumber',
        type: 'simple',
        name: 'Test Product'
      };

      const sku = generateSKU(options);
      const suffix = sku.split('-').pop();

      // Should be 3 character hex string (uppercase)
      expect(suffix).toMatch(/^[0-9A-F]{3}$/);
    });

    test('should use deterministic generation when seed provided', () => {
      const options = {
        category: 'structural',
        subcategory: 'lumber',
        type: 'simple',
        name: 'Test Product',
        seed: 12345
      };

      const sku1 = generateSKU(options);
      resetSkuTracker();
      const sku2 = generateSKU(options);

      // With same seed, SKUs should be identical
      expect(sku1).toBe(sku2);
    });

    test('should not expose internal random state', () => {
      const options = {
        category: 'structural',
        type: 'simple',
        name: 'Test'
      };

      // Generate multiple SKUs
      const skus = [];
      for (let i = 0; i < 10; i++) {
        resetSkuTracker();
        skus.push(generateSKU(options));
      }

      // Check that suffixes don't follow predictable pattern
      const suffixes = skus.map(sku => sku.split('-').pop());

      // No suffix should repeat (statistically unlikely with crypto.randomBytes)
      const uniqueSuffixes = new Set(suffixes);
      expect(uniqueSuffixes.size).toBe(suffixes.length);
    });
  });

  describe('Input Validation', () => {
    test('should handle very long product names safely', () => {
      const longName = 'A'.repeat(1000);
      const options = {
        category: 'structural',
        type: 'simple',
        name: longName
      };

      const sku = generateSKU(options);

      // SKU should be truncated to reasonable length
      expect(sku.length).toBeLessThanOrEqual(64);
    });

    test('should sanitize special characters in product names', () => {
      const options = {
        category: 'structural',
        type: 'simple',
        name: 'Test<script>alert("xss")</script>Product'
      };

      const sku = generateSKU(options);

      // Should not contain script tags or special characters
      expect(sku).not.toContain('<');
      expect(sku).not.toContain('>');
      expect(sku).not.toContain('script');
      expect(sku).not.toContain('"');
    });

    test('should handle null/undefined safely', () => {
      const options = {
        category: 'structural',
        type: 'simple',
        name: null
      };

      // Should not throw, should handle gracefully
      expect(() => generateSKU(options)).not.toThrow();
    });
  });

  describe('Collision Resistance', () => {
    test('should handle concurrent generation without collisions', () => {
      const skus = new Set();

      // Simulate concurrent generation
      const promises = Array(50).fill(null).map((_, i) => {
        return new Promise((resolve) => {
          const sku = generateSKU({
            category: 'structural',
            type: 'simple',
            name: `Product ${i}`
          });
          resolve(sku);
        });
      });

      return Promise.all(promises).then(results => {
        results.forEach(sku => skus.add(sku));

        // All SKUs should be unique
        expect(skus.size).toBe(50);
      });
    });
  });
});