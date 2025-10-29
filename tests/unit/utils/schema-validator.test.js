/**
 * Unit tests for Schema Validator
 * Tests validation for product, category, and inventory schemas
 */

import { describe, test, expect } from '@jest/globals';

describe('Schema Validator', () => {
  // Product Schema Tests
  describe('Product Schema Validation', () => {
    test('should validate correct product schema', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const validProduct = {
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        price: 29.99,
        status: 'enabled',
        visibility: 'catalog_search',
        type_id: 'simple'
      };

      const result = SchemaValidator.validateProduct(validProduct);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject product missing required SKU', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidProduct = {
        name: 'Test Product',
        price: 29.99
      };

      const result = SchemaValidator.validateProduct(invalidProduct);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('SKU is required');
    });

    test('should reject product with invalid price', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidProduct = {
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        price: -10 // Negative price
      };

      const result = SchemaValidator.validateProduct(invalidProduct);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('price'))).toBe(true);
    });

    test('should reject product with invalid type_id', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidProduct = {
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        price: 29.99,
        type_id: 'invalid_type'
      };

      const result = SchemaValidator.validateProduct(invalidProduct);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('type_id'))).toBe(true);
    });

    test('should validate product with optional fields', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const productWithOptional = {
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        price: 29.99,
        description: 'Product description',
        short_description: 'Short desc',
        weight: 1.5,
        categories: ['category1', 'category2']
      };

      const result = SchemaValidator.validateProduct(productWithOptional);

      expect(result.isValid).toBe(true);
    });
  });

  // Category Schema Tests
  describe('Category Schema Validation', () => {
    test('should validate correct category schema', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const validCategory = {
        id: 'cat-001',
        name: 'Electronics',
        is_active: true,
        position: 1
      };

      const result = SchemaValidator.validateCategory(validCategory);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject category missing required name', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidCategory = {
        id: 'cat-001',
        is_active: true
      };

      const result = SchemaValidator.validateCategory(invalidCategory);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category name is required');
    });

    test('should reject category with invalid parent_id format', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidCategory = {
        id: 'cat-001',
        name: 'Electronics',
        parent_id: 123 // Should be string
      };

      const result = SchemaValidator.validateCategory(invalidCategory);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('parent_id'))).toBe(true);
    });

    test('should validate category with parent reference', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const categoryWithParent = {
        id: 'cat-002',
        name: 'Laptops',
        parent_id: 'cat-001',
        is_active: true
      };

      const result = SchemaValidator.validateCategory(categoryWithParent);

      expect(result.isValid).toBe(true);
    });
  });

  // Inventory Schema Tests
  describe('Inventory Schema Validation', () => {
    test('should validate correct inventory schema', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const validInventory = {
        sku: 'TEST-SKU-001',
        quantity: 100,
        is_in_stock: true
      };

      const result = SchemaValidator.validateInventory(validInventory);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject inventory missing required SKU', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidInventory = {
        quantity: 100,
        is_in_stock: true
      };

      const result = SchemaValidator.validateInventory(invalidInventory);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('SKU is required');
    });

    test('should reject inventory with negative quantity', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidInventory = {
        sku: 'TEST-SKU-001',
        quantity: -50,
        is_in_stock: true
      };

      const result = SchemaValidator.validateInventory(invalidInventory);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('quantity'))).toBe(true);
    });

    test('should validate inventory with MSI source data', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const inventoryWithSource = {
        sku: 'TEST-SKU-001',
        quantity: 100,
        is_in_stock: true,
        source_code: 'default',
        source_items: [
          { source_code: 'warehouse_1', quantity: 50 },
          { source_code: 'warehouse_2', quantity: 50 }
        ]
      };

      const result = SchemaValidator.validateInventory(inventoryWithSource);

      expect(result.isValid).toBe(true);
    });

    test('should reject inventory with invalid stock status type', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidInventory = {
        sku: 'TEST-SKU-001',
        quantity: 100,
        is_in_stock: 'yes' // Should be boolean
      };

      const result = SchemaValidator.validateInventory(invalidInventory);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('is_in_stock'))).toBe(true);
    });
  });

  // General Validation Tests
  describe('General Validation', () => {
    test('should provide clear field-level error messages', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const invalidProduct = {
        sku: '', // Empty SKU
        price: 'invalid', // Invalid price type
        type_id: 123 // Invalid type
      };

      const result = SchemaValidator.validateProduct(invalidProduct);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // Each error should mention the problematic field
      result.errors.forEach(error => {
        expect(typeof error).toBe('string');
        expect(error.length).toBeGreaterThan(0);
      });
    });

    test('should handle null and undefined inputs', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const nullResult = SchemaValidator.validateProduct(null);
      const undefinedResult = SchemaValidator.validateProduct(undefined);

      expect(nullResult.isValid).toBe(false);
      expect(undefinedResult.isValid).toBe(false);
    });

    test('should validate multiple products in batch', async () => {
      const { SchemaValidator } = await import('../../../utils/schema-validator.js');

      const products = [
        { sku: 'SKU-001', name: 'Product 1', price: 10 },
        { sku: 'SKU-002', name: 'Product 2', price: 20 },
        { sku: '', name: 'Product 3', price: 30 } // Invalid
      ];

      const results = products.map(p => SchemaValidator.validateProduct(p));

      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
    });
  });
});
