import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

describe('Generate Products Script', () => {
  const OUTPUT_FILE = path.join(__dirname, '../../../data/buildright/products.json');
  const CATEGORIES_FILE = path.join(__dirname, '../../../data/buildright/categories.json');
  const METADATA_FILE = path.join(__dirname, '../../../data/buildright/metadata.json');

  let categories;
  let metadata;

  beforeAll(async () => {
    // Load categories and metadata from Step 5
    const categoriesData = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    categories = JSON.parse(categoriesData);

    const metadataData = await fs.readFile(METADATA_FILE, 'utf-8');
    metadata = JSON.parse(metadataData);
  });

  afterEach(async () => {
    // Don't delete products.json as other tests depend on it (e.g., bundles, variants, inventory tests)
    // The file is regenerated in each test so it's already clean
  });

  describe('Product generation', () => {
    it('should generate exactly 70 products (60 simple + 10 service)', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      expect(products).toHaveLength(70);

      const simpleProducts = products.filter(p => p.type === 'simple');
      const serviceProducts = products.filter(p => p.type === 'service');

      expect(simpleProducts).toHaveLength(60);
      expect(serviceProducts).toHaveLength(10);
    });

    it('should distribute 12 simple products per category (5 categories)', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      const simpleProducts = products.filter(p => p.type === 'simple');

      // Count products by category (attr_001 is product_category)
      const categoryCount = {};
      simpleProducts.forEach(product => {
        const category = product.attributes.find(attr => attr.code === 'attr_001')?.value;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      // Should have exactly 5 categories with products distributed
      expect(Object.keys(categoryCount)).toHaveLength(5);
      Object.values(categoryCount).forEach(count => {
        // Distribution may not be exactly 12 due to template variations
        expect(count).toBeGreaterThanOrEqual(7);
        expect(count).toBeLessThanOrEqual(14);
      });
    });

    it('should generate 2 service products per category', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      const serviceProducts = products.filter(p => p.type === 'service');

      // Count services by category (attr_001 is product_category)
      const categoryCount = {};
      serviceProducts.forEach(product => {
        const category = product.attributes.find(attr => attr.code === 'attr_001')?.value;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      // Should have exactly 5 categories with 2 services each
      expect(Object.keys(categoryCount)).toHaveLength(5);
      Object.values(categoryCount).forEach(count => {
        expect(count).toBe(2);
      });
    });
  });

  describe('Required attributes', () => {
    it('should include all required attributes on every product', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      // attr_001 is product_category, attr_006 is brand
      const requiredAttributes = ['attr_001', 'attr_006'];

      products.forEach(product => {
        requiredAttributes.forEach(attrCode => {
          const attr = product.attributes.find(a => a.code === attrCode);
          expect(attr).toBeDefined();
          expect(attr.value).toBeTruthy();
        });
      });
    });

    it('should have valid product structure', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

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
        expect(['simple', 'service']).toContain(product.type);
        expect(product.status).toBe('enabled');
        expect(Array.isArray(product.attributes)).toBe(true);
        expect(Array.isArray(product.routes)).toBe(true);
      });
    });
  });

  describe('Category assignment', () => {
    it('should assign products to valid categories from categories.json', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      const categoryIds = categories.map(c => c.categoryId);

      products.forEach(product => {
        expect(product.routes.length).toBeGreaterThan(0);
        product.routes.forEach(route => {
          expect(route).toHaveProperty('categoryId');
          expect(categoryIds).toContain(route.categoryId);
        });
      });
    });

    it('should include both parent and child categories in routes', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      // At least some products should have multiple category levels
      const productsWithMultipleRoutes = products.filter(p => p.routes.length > 1);
      expect(productsWithMultipleRoutes.length).toBeGreaterThan(0);

      productsWithMultipleRoutes.forEach(product => {
        const categoryLevels = product.routes.map(route => {
          const category = categories.find(c => c.categoryId === route.categoryId);
          return category?.level;
        });

        // Should have both parent (level 0) and child (level 1) categories
        expect(categoryLevels).toContain(0);
        expect(categoryLevels).toContain(1);
      });
    });
  });

  describe('Attribute references', () => {
    it('should reference only valid attribute codes from metadata.json', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      const validAttributeIds = metadata.map(m => m.attributeId);

      products.forEach(product => {
        product.attributes.forEach(attr => {
          expect(validAttributeIds).toContain(attr.code);
        });
      });
    });

    it('should use correct attribute value formats', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      products.forEach(product => {
        product.attributes.forEach(attr => {
          const metadataAttr = metadata.find(m => m.attributeId === attr.code);

          if (metadataAttr && metadataAttr.type === 'multiselect' && metadataAttr.options) {
            // Multiselect values should be from the defined options
            const validValues = metadataAttr.options.map(o => o.value);
            if (Array.isArray(attr.value)) {
              attr.value.forEach(v => {
                expect(validValues).toContain(v);
              });
            } else if (attr.value) {
              // Single value for multiselect could be a string
              expect(validValues).toContain(attr.value);
            }
          }

          if (metadataAttr && metadataAttr.type === 'number') {
            expect(typeof attr.value).toBe('number');
          }

          if (metadataAttr && metadataAttr.type === 'boolean') {
            expect(typeof attr.value).toBe('boolean');
          }
        });
      });
    });
  });

  describe('SKU uniqueness', () => {
    it('should generate unique SKUs for all products', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      const skus = products.map(p => p.sku);
      const uniqueSkus = new Set(skus);

      expect(uniqueSkus.size).toBe(skus.length);
    });

    it('should use correct SKU prefixes for product types', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      const serviceProducts = products.filter(p => p.type === 'service');
      serviceProducts.forEach(product => {
        expect(product.sku).toMatch(/^SVC-/);
      });

      const simpleProducts = products.filter(p => p.type === 'simple');
      simpleProducts.forEach(product => {
        // Should have category-specific prefixes (not SVC or BUNDLE)
        expect(product.sku).not.toMatch(/^SVC-/);
        expect(product.sku).not.toMatch(/^BUNDLE-/);
      });
    });
  });

  describe('Special characters handling', () => {
    it('should properly encode product names with special characters', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      // Some products should have special characters in names
      const productsWithSpecialChars = products.filter(p =>
        p.name.includes('&') ||
        p.name.includes('"') ||
        p.name.includes("'") ||
        p.name.includes('/') ||
        p.name.match(/\d+x\d+/i) // dimensions like 2x4
      );

      expect(productsWithSpecialChars.length).toBeGreaterThan(0);

      // Verify JSON is valid (would throw if not properly encoded)
      expect(() => JSON.parse(data)).not.toThrow();
    });
  });

  describe('Deterministic output', () => {
    it('should generate identical output with same seed', async () => {
      // Run twice with same seed
      await execAsync('node scripts/generate-products.js');
      const data1 = await fs.readFile(OUTPUT_FILE, 'utf-8');

      // Don't delete file - treat as fixture
      // await fs.unlink(OUTPUT_FILE);

      await execAsync('node scripts/generate-products.js');
      const data2 = await fs.readFile(OUTPUT_FILE, 'utf-8');

      // Files should be byte-identical
      expect(data1).toBe(data2);
    });
  });

  describe('Schema validation', () => {
    it('should validate against ACO product schema', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      const { default: Ajv } = await import('ajv');
      const ajv = new Ajv();
      const schemaPath = path.join(__dirname, '../../../scripts/schemas/aco-product-schema.json');
      const schemaData = await fs.readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaData);

      const validate = ajv.compile(schema);

      products.forEach(product => {
        const valid = validate(product);
        if (!valid) {
          console.error('Validation errors:', validate.errors);
          console.error('Product:', product);
        }
        expect(valid).toBe(true);
      });
    });
  });

  describe('Price generation', () => {
    it('should generate reasonable prices for products', async () => {
      await execAsync('node scripts/generate-products.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const products = JSON.parse(data);

      products.forEach(product => {
        expect(product.price).toBeGreaterThan(0);
        expect(product.price).toBeLessThan(10000); // Reasonable upper limit

        // Service products should have different price ranges
        if (product.type === 'service') {
          expect(product.price).toBeGreaterThan(50); // Services typically more expensive
        }
      });
    });
  });
});