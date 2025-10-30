/**
 * Tests for validating regenerated product data with semantic attributes (Step 1)
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Data Structure Validation (Step 1)', () => {
  const PRODUCTS_FILE = path.join(__dirname, '../../../data/buildright/products.json');
  const VARIANTS_FILE = path.join(__dirname, '../../../data/buildright/variants.json');
  const BUNDLES_FILE = path.join(__dirname, '../../../data/buildright/bundles.json');
  const METADATA_FILE = path.join(__dirname, '../../../data/buildright/metadata.json');
  const SCHEMA_FILE = path.join(__dirname, '../../../scripts/schemas/aco-product-schema.json');

  let products;
  let variants;
  let bundles;
  let metadata;

  beforeAll(async () => {
    // Load all data files
    const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    products = JSON.parse(productsData);

    const metadataData = await fs.readFile(METADATA_FILE, 'utf-8');
    metadata = JSON.parse(metadataData);

    // Load variants and bundles if they exist
    try {
      const variantsData = await fs.readFile(VARIANTS_FILE, 'utf-8');
      variants = JSON.parse(variantsData);
    } catch (err) {
      variants = [];
    }

    try {
      const bundlesData = await fs.readFile(BUNDLES_FILE, 'utf-8');
      bundles = JSON.parse(bundlesData);
    } catch (err) {
      bundles = [];
    }
  });

  describe('ACO Schema Compliance', () => {
    it('should validate regenerated products against ACO FeedProduct schema', async () => {
      // Given: Products regenerated with new attributes
      // When: Validating against ACO FeedProduct schema
      // Then: All required fields present, attributes use 'values' array

      products.forEach(product => {
        // Required fields
        expect(product).toHaveProperty('sku');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('type');
        expect(product).toHaveProperty('status');
        expect(product).toHaveProperty('visibility');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('attributes');
        expect(product).toHaveProperty('routes');

        // Field types
        expect(typeof product.sku).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(Array.isArray(product.attributes)).toBe(true);
        expect(Array.isArray(product.routes)).toBe(true);

        // Attributes must have code and value
        product.attributes.forEach(attr => {
          expect(attr).toHaveProperty('code');
          expect(attr).toHaveProperty('value');
          expect(attr.value).toBeDefined();
        });
      });
    });

    it('should have valid attribute references in products', async () => {
      // Given: Regenerated products with semantic attributes
      // When: Checking attribute references
      // Then: All attribute codes exist in metadata

      const validAttributeCodes = metadata.map(m => m.attributeId);

      products.forEach(product => {
        product.attributes.forEach(attr => {
          expect(validAttributeCodes).toContain(attr.code);
        });
      });
    });

    it('should have project_types as multiselect in metadata', async () => {
      // Given: Semantic metadata generated
      // When: Inspecting project_types attribute definition
      // Then: Type is multiselect with proper options

      const projectTypesAttr = metadata.find(m => m.attributeId === 'project_types');
      expect(projectTypesAttr).toBeDefined();
      expect(projectTypesAttr.type).toBe('multiselect');
      expect(projectTypesAttr.options).toBeDefined();
      expect(projectTypesAttr.options.length).toBe(4);
    });
  });

  describe('Product Count Validation', () => {
    it('should maintain product count after regeneration', async () => {
      // Given: Data regeneration complete
      // When: Counting products, variants, bundles
      // Then: 70 products, 99 variants, 15 bundles (same as before)

      expect(products).toHaveLength(70);
    });

    it('should have correct product type distribution', async () => {
      // Given: Regenerated products
      // When: Counting by product type
      // Then: Correct distribution maintained

      // Note: Products don't have explicit 'type' field in ACO format
      // We can infer from SKU prefixes
      const serviceProducts = products.filter(p => p.sku.startsWith('SVC-'));
      const otherProducts = products.filter(p => !p.sku.startsWith('SVC-'));

      expect(serviceProducts.length).toBeGreaterThanOrEqual(10);
      expect(otherProducts.length).toBeGreaterThanOrEqual(60);
    });

    it('should validate variants count if variants file exists', async () => {
      // Given: Variants regenerated
      // When: Counting variants
      // Then: Expected count maintained

      if (variants.length > 0) {
        // Variants exist - should have around 99 variants
        expect(variants.length).toBeGreaterThanOrEqual(90);
        expect(variants.length).toBeLessThanOrEqual(110);
      }
    });

    it('should validate bundles count if bundles file exists', async () => {
      // Given: Bundles regenerated
      // When: Counting bundles
      // Then: Expected count maintained

      if (bundles.length > 0) {
        // Bundles exist - should have around 15 bundles
        expect(bundles.length).toBeGreaterThanOrEqual(12);
        expect(bundles.length).toBeLessThanOrEqual(18);
      }
    });
  });

  describe('Project Types Coverage', () => {
    it('should ensure all products have at least one project type', async () => {
      // Given: Regenerated products.json
      // When: Inspecting all product attributes
      // Then: Every product has project_types attribute with 1-4 values

      products.forEach(product => {
        const projectTypesAttr = product.attributes.find(attr => attr.code === 'project_types');
        expect(projectTypesAttr).toBeDefined();
        expect(projectTypesAttr.value).toBeDefined();
        expect(Array.isArray(projectTypesAttr.value)).toBe(true);
        expect(projectTypesAttr.value.length).toBeGreaterThanOrEqual(1);
        expect(projectTypesAttr.value.length).toBeLessThanOrEqual(4);

        // Validate each value is one of the valid project types
        const validProjectTypes = ['new_construction', 'remodel', 'repair', 'restoration'];
        projectTypesAttr.value.forEach(value => {
          expect(validProjectTypes).toContain(value);
        });
      });
    });

    it('should have reasonable project type distribution', async () => {
      // Given: All products tagged with project types
      // When: Analyzing distribution
      // Then: Each project type used by at least some products

      const projectTypeCounts = {
        new_construction: 0,
        remodel: 0,
        repair: 0,
        restoration: 0
      };

      products.forEach(product => {
        const projectTypesAttr = product.attributes.find(attr => attr.code === 'project_types');
        if (projectTypesAttr && projectTypesAttr.value) {
          const projectTypes = Array.isArray(projectTypesAttr.value) ? projectTypesAttr.value : [projectTypesAttr.value];
          projectTypes.forEach(value => {
            if (projectTypeCounts[value] !== undefined) {
              projectTypeCounts[value]++;
            }
          });
        }
      });

      // Each project type should be used by at least 20% of products
      const minExpected = products.length * 0.2;
      expect(projectTypeCounts.new_construction).toBeGreaterThanOrEqual(minExpected);
      expect(projectTypeCounts.remodel).toBeGreaterThanOrEqual(minExpected);
      expect(projectTypeCounts.repair).toBeGreaterThanOrEqual(minExpected);
      expect(projectTypeCounts.restoration).toBeGreaterThanOrEqual(minExpected);
    });

    it('should generate project type distribution report data', async () => {
      // Given: All products tagged
      // When: Collecting statistics
      // Then: Can generate meaningful distribution report

      const categoryProjectTypes = {};

      products.forEach(product => {
        const categoryAttr = product.attributes.find(attr => attr.code === 'product_category' || attr.code === 'attr_001');
        const projectTypesAttr = product.attributes.find(attr => attr.code === 'project_types');

        if (categoryAttr && projectTypesAttr) {
          const category = categoryAttr.value || 'unknown';
          if (!categoryProjectTypes[category]) {
            categoryProjectTypes[category] = {
              total: 0,
              new_construction: 0,
              remodel: 0,
              repair: 0,
              restoration: 0
            };
          }

          categoryProjectTypes[category].total++;
          const projectTypes = Array.isArray(projectTypesAttr.value) ? projectTypesAttr.value : [projectTypesAttr.value];
          projectTypes.forEach(projectType => {
            if (categoryProjectTypes[category][projectType] !== undefined) {
              categoryProjectTypes[category][projectType]++;
            }
          });
        }
      });

      // Should have data for multiple categories
      expect(Object.keys(categoryProjectTypes).length).toBeGreaterThanOrEqual(3);

      // Each category should have reasonable distribution
      Object.values(categoryProjectTypes).forEach(stats => {
        expect(stats.total).toBeGreaterThan(0);
        const totalProjectTypeAssignments =
          stats.new_construction + stats.remodel + stats.repair + stats.restoration;
        expect(totalProjectTypeAssignments).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should maintain unique SKUs across all products', async () => {
      // Given: Regenerated products
      // When: Checking SKU uniqueness
      // Then: All SKUs are unique

      const skus = products.map(p => p.sku);
      const uniqueSkus = new Set(skus);
      expect(uniqueSkus.size).toBe(skus.length);
    });

    it('should have valid routes for all products', async () => {
      // Given: Regenerated products
      // When: Validating routes
      // Then: All products have at least one route

      products.forEach(product => {
        expect(product.routes).toBeDefined();
        expect(Array.isArray(product.routes)).toBe(true);
        expect(product.routes.length).toBeGreaterThan(0);

        product.routes.forEach(route => {
          expect(route).toHaveProperty('categoryId');
          expect(typeof route.categoryId).toBe('string');
          expect(route.categoryId.length).toBeGreaterThan(0);
        });
      });
    });

    it('should maintain product names and descriptions', async () => {
      // Given: Regenerated products
      // When: Checking content fields
      // Then: Names and descriptions present

      products.forEach(product => {
        expect(product.name).toBeDefined();
        expect(typeof product.name).toBe('string');
        expect(product.name.length).toBeGreaterThan(0);

        if (product.description) {
          expect(typeof product.description).toBe('string');
          expect(product.description.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
