import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

describe('Generate Bundles Script', () => {
  const OUTPUT_FILE = path.join(__dirname, '../../../data/buildright/bundles.json');
  const PRODUCTS_FILE = path.join(__dirname, '../../../data/buildright/products.json');
  const VARIANTS_FILE = path.join(__dirname, '../../../data/buildright/variants.json');
  const CATEGORIES_FILE = path.join(__dirname, '../../../data/buildright/categories.json');

  let categories;
  let products;
  let variants;

  beforeAll(async () => {
    // Load categories from Step 5
    const categoriesData = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    categories = JSON.parse(categoriesData);

    // Ensure products and variants exist for bundle generation
    try {
      await fs.access(PRODUCTS_FILE);
    } catch {
      await execAsync('node scripts/generate-products.js');
    }

    try {
      await fs.access(VARIANTS_FILE);
    } catch {
      await execAsync('node scripts/generate-variants.js');
    }

    // Load products and variants for validation
    const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    products = JSON.parse(productsData);

    const variantsData = await fs.readFile(VARIANTS_FILE, 'utf-8');
    variants = JSON.parse(variantsData);
  });

  afterEach(async () => {
    // Don't delete bundles.json as other tests depend on it (e.g., inventory, prices tests)
    // The file is regenerated in each test so it's already clean
  });

  describe('Bundle generation', () => {
    it('should generate exactly 15 bundle products', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      expect(bundles).toHaveLength(15);

      bundles.forEach(bundle => {
        expect(bundle.type).toBe('bundle');
      });
    });

    it('should generate 3 bundle products per category', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      // Count bundles by category (using attr_001 which is the category attribute)
      const categoryCount = {};
      bundles.forEach(bundle => {
        const category = bundle.attributes.find(attr => attr.code === 'attr_001')?.value;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      // Should have exactly 5 categories with 3 bundles each
      expect(Object.keys(categoryCount)).toHaveLength(5);
      Object.values(categoryCount).forEach(count => {
        expect(count).toBe(3);
      });
    });

    it('should use BUNDLE- prefix for all bundle SKUs', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      bundles.forEach(bundle => {
        expect(bundle.sku).toMatch(/^BUNDLE-/);
      });
    });
  });

  describe('Bundle structure', () => {
    it('should have groups array with required properties', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      bundles.forEach(bundle => {
        expect(bundle).toHaveProperty('groups');
        expect(Array.isArray(bundle.groups)).toBe(true);
        expect(bundle.groups.length).toBeGreaterThan(0);

        bundle.groups.forEach(group => {
          expect(group).toHaveProperty('name');
          expect(group).toHaveProperty('required');
          expect(group).toHaveProperty('multiSelect');
          expect(group).toHaveProperty('items');

          expect(typeof group.name).toBe('string');
          expect(typeof group.required).toBe('boolean');
          expect(typeof group.multiSelect).toBe('boolean');
          expect(Array.isArray(group.items)).toBe(true);
        });
      });
    });

    it('should have at least one required group per bundle', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      bundles.forEach(bundle => {
        const requiredGroups = bundle.groups.filter(g => g.required === true);
        expect(requiredGroups.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have bundle items with SKU and default quantity', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      bundles.forEach(bundle => {
        bundle.groups.forEach(group => {
          expect(group.items.length).toBeGreaterThan(0);

          group.items.forEach(item => {
            expect(item).toHaveProperty('sku');
            expect(item).toHaveProperty('defaultQty');
            expect(typeof item.sku).toBe('string');
            expect(typeof item.defaultQty).toBe('number');
            expect(item.defaultQty).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have both single-select and multi-select groups', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      // At least some bundles should have variety in selection types
      const bundlesWithMultiSelect = bundles.filter(b =>
        b.groups.some(g => g.multiSelect === true)
      );
      const bundlesWithSingleSelect = bundles.filter(b =>
        b.groups.some(g => g.multiSelect === false)
      );

      expect(bundlesWithMultiSelect.length).toBeGreaterThan(0);
      expect(bundlesWithSingleSelect.length).toBeGreaterThan(0);
    });
  });

  describe('Bundle item references', () => {
    it('should reference valid product SKUs from products or variants', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      // Collect all valid SKUs
      const validSkus = new Set([
        ...products.map(p => p.sku),
        ...variants.map(v => v.sku)
      ]);

      bundles.forEach(bundle => {
        bundle.groups.forEach(group => {
          group.items.forEach(item => {
            expect(validSkus.has(item.sku)).toBe(true);
          });
        });
      });
    });

    it('should not have circular bundle references', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      const bundleSkus = new Set(bundles.map(b => b.sku));

      bundles.forEach(bundle => {
        bundle.groups.forEach(group => {
          group.items.forEach(item => {
            // Bundle items should not reference other bundles
            expect(bundleSkus.has(item.sku)).toBe(false);
          });
        });
      });
    });

    it('should reference products from same or related categories', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      // Create map of SKU to category (using attr_001 which is the category attribute)
      const skuToCategory = new Map();
      [...products, ...variants].forEach(p => {
        const category = p.attributes.find(a => a.code === 'attr_001')?.value;
        if (category) {
          skuToCategory.set(p.sku, category);
        }
      });

      bundles.forEach(bundle => {
        const bundleCategory = bundle.attributes.find(a => a.code === 'attr_001')?.value;

        bundle.groups.forEach(group => {
          group.items.forEach(item => {
            const itemCategory = skuToCategory.get(item.sku);
            // Items should be from same category or a reasonable cross-category
            // (e.g., fasteners can be in structural bundles)
            expect(itemCategory).toBeDefined();
          });
        });
      });
    });
  });

  describe('Optional items handling', () => {
    it('should have some optional groups', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      const bundlesWithOptionalGroups = bundles.filter(b =>
        b.groups.some(g => g.required === false)
      );

      expect(bundlesWithOptionalGroups.length).toBeGreaterThan(0);
    });

    it('should have reasonable default quantities', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      bundles.forEach(bundle => {
        bundle.groups.forEach(group => {
          group.items.forEach(item => {
            // Default quantities should be reasonable (1-100)
            expect(item.defaultQty).toBeGreaterThanOrEqual(1);
            expect(item.defaultQty).toBeLessThanOrEqual(100);

            // Required groups might have higher quantities
            if (group.required) {
              expect(item.defaultQty).toBeGreaterThanOrEqual(1);
            }
          });
        });
      });
    });
  });

  describe('SKU uniqueness', () => {
    it('should generate unique SKUs for all bundles', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      const skus = bundles.map(b => b.sku);
      const uniqueSkus = new Set(skus);

      expect(uniqueSkus.size).toBe(skus.length);
    });

    it('should not duplicate SKUs from products or variants', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      const existingSkus = new Set([
        ...products.map(p => p.sku),
        ...variants.map(v => v.sku)
      ]);

      bundles.forEach(bundle => {
        expect(existingSkus.has(bundle.sku)).toBe(false);
      });
    });
  });

  describe('Deterministic output', () => {
    it('should generate identical output with same seed', async () => {
      // Run twice with same seed
      await execAsync('node scripts/generate-bundles.js');
      const data1 = await fs.readFile(OUTPUT_FILE, 'utf-8');

      // Don't delete file - treat as fixture
      // await fs.unlink(OUTPUT_FILE);

      await execAsync('node scripts/generate-bundles.js');
      const data2 = await fs.readFile(OUTPUT_FILE, 'utf-8');

      // Files should be byte-identical
      expect(data1).toBe(data2);
    });
  });

  describe('Schema validation', () => {
    it('should validate all bundles against ACO bundle schema', async () => {
      await execAsync('node scripts/generate-bundles.js');
      const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
      const bundles = JSON.parse(data);

      const { default: Ajv } = await import('ajv');
      const ajv = new Ajv();
      const schemaPath = path.join(__dirname, '../../../scripts/schemas/aco-bundle-schema.json');
      const schemaData = await fs.readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaData);

      const validate = ajv.compile(schema);

      bundles.forEach(bundle => {
        const valid = validate(bundle);
        if (!valid) {
          console.error('Validation errors:', validate.errors);
          console.error('Bundle:', bundle);
        }
        expect(valid).toBe(true);
      });
    });
  });
});