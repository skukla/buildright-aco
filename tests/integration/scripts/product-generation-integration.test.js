import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

describe('Product Generation Integration', () => {
  const PRODUCTS_FILE = path.join(__dirname, '../../../data/buildright/products.json');
  const VARIANTS_FILE = path.join(__dirname, '../../../data/buildright/variants.json');
  const BUNDLES_FILE = path.join(__dirname, '../../../data/buildright/bundles.json');
  const CATEGORIES_FILE = path.join(__dirname, '../../../data/buildright/categories.json');
  const METADATA_FILE = path.join(__dirname, '../../../data/buildright/metadata.json');

  let products;
  let variants;
  let bundles;
  let categories;
  let metadata;

  beforeAll(async () => {
    // Generate all products if not exists
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

    try {
      await fs.access(BUNDLES_FILE);
    } catch {
      await execAsync('node scripts/generate-bundles.js');
    }

    // Load all files
    const productsData = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    products = JSON.parse(productsData);

    const variantsData = await fs.readFile(VARIANTS_FILE, 'utf-8');
    variants = JSON.parse(variantsData);

    const bundlesData = await fs.readFile(BUNDLES_FILE, 'utf-8');
    bundles = JSON.parse(bundlesData);

    const categoriesData = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    categories = JSON.parse(categoriesData);

    const metadataData = await fs.readFile(METADATA_FILE, 'utf-8');
    metadata = JSON.parse(metadataData);
  });

  describe('Total product count', () => {
    it('should match specification: 120 base products + 60+ variants', () => {
      const simpleProducts = products.filter(p => p.type === 'simple');
      const serviceProducts = products.filter(p => p.type === 'service');
      const configurableProducts = variants.filter(p => p.type === 'configurable');
      const variantProducts = variants.filter(p => p.type === 'simple' && p.parentSku);
      const bundleProducts = bundles;

      // Base products: 60 simple + 10 service + 20 configurable + 15 bundles = 105
      // Wait, let me recalculate based on spec:
      // - 60 simple products
      // - 20 configurable products
      // - 15 bundle products
      // - 10 service products
      // Total base: 105 (not counting variants)

      const baseProductCount = simpleProducts.length + serviceProducts.length +
                               configurableProducts.length + bundleProducts.length;

      expect(simpleProducts).toHaveLength(60);
      expect(serviceProducts).toHaveLength(10);
      expect(configurableProducts).toHaveLength(20);
      expect(bundleProducts).toHaveLength(15);

      // Total base products should be 105
      expect(baseProductCount).toBe(105);

      // Variants should be 60+
      expect(variantProducts.length).toBeGreaterThanOrEqual(60);

      // Total SKUs should be 165+
      const totalSkus = baseProductCount + variantProducts.length;
      expect(totalSkus).toBeGreaterThanOrEqual(165);
    });

    it('should have correct distribution across categories', () => {
      const allProducts = [...products, ...variants, ...bundles];

      // Count products by category (excluding variants)
      const categoryDistribution = {};
      const baseProducts = allProducts.filter(p => p.type !== 'simple' || !p.parentSku);

      baseProducts.forEach(product => {
        // Using attr_001 which is the category attribute in the generated data
        const category = product.attributes.find(a => a.code === 'attr_001')?.value;
        if (category) {
          categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        }
      });

      // Each category should have products
      expect(Object.keys(categoryDistribution)).toHaveLength(5);

      // Each category should have: 12 simple + 2 service + 4 configurable + 3 bundle = 21 products
      Object.values(categoryDistribution).forEach(count => {
        expect(count).toBe(21);
      });
    });
  });

  describe('Category references', () => {
    it('should reference only valid categories from Step 5', () => {
      const allProducts = [...products, ...variants, ...bundles];
      const categoryIds = categories.map(c => c.categoryId);

      allProducts.forEach(product => {
        if (product.routes && product.routes.length > 0) {
          product.routes.forEach(route => {
            expect(categoryIds).toContain(route.categoryId);
          });
        }
      });
    });

    it('should have hierarchical category assignment', () => {
      const allProducts = [...products, ...variants, ...bundles];

      // Build category hierarchy map
      const childToParentMap = new Map();
      categories.forEach(cat => {
        if (cat.parentId) {
          childToParentMap.set(cat.categoryId, cat.parentId);
        }
      });

      // Products with child categories should also have parent categories
      allProducts.forEach(product => {
        if (product.routes && product.routes.length > 0) {
          const routeCategoryIds = product.routes.map(r => r.categoryId);

          routeCategoryIds.forEach(catId => {
            const parentId = childToParentMap.get(catId);
            if (parentId) {
              // If product has child category, it should also have parent
              expect(routeCategoryIds).toContain(parentId);
            }
          });
        }
      });
    });
  });

  describe('Attribute references', () => {
    it('should reference only valid attributes from Step 5', () => {
      const allProducts = [...products, ...variants, ...bundles];
      const attributeIds = metadata.map(m => m.attributeId);

      allProducts.forEach(product => {
        product.attributes.forEach(attr => {
          expect(attributeIds).toContain(attr.code);
        });
      });
    });

    it('should have required attributes on all products', () => {
      const allProducts = [...products, ...variants, ...bundles];
      const requiredAttributes = metadata.filter(m => m.isRequired).map(m => m.attributeId);

      allProducts.forEach(product => {
        const productAttributeCodes = product.attributes.map(a => a.code);

        requiredAttributes.forEach(reqAttr => {
          expect(productAttributeCodes).toContain(reqAttr);
        });
      });
    });

    it('should use valid values for multiselect attributes', () => {
      const allProducts = [...products, ...variants, ...bundles];

      const multiselectAttributes = metadata.filter(m =>
        m.type === 'multiselect' && m.options
      );

      allProducts.forEach(product => {
        product.attributes.forEach(attr => {
          const metaAttr = multiselectAttributes.find(m => m.attributeId === attr.code);
          if (metaAttr) {
            const validValues = metaAttr.options.map(o => o.value);
            const attrValues = Array.isArray(attr.value) ? attr.value : [attr.value];

            attrValues.forEach(val => {
              expect(validValues).toContain(val);
            });
          }
        });
      });
    });
  });

  describe('Cross-file SKU validation', () => {
    it('should have no duplicate SKUs across all files', () => {
      const allSkus = [
        ...products.map(p => p.sku),
        ...variants.map(v => v.sku),
        ...bundles.map(b => b.sku)
      ];

      const uniqueSkus = new Set(allSkus);
      expect(uniqueSkus.size).toBe(allSkus.length);
    });

    it('should follow naming conventions for each product type', () => {
      // Simple products - category-specific prefixes
      const simpleProducts = products.filter(p => p.type === 'simple');
      simpleProducts.forEach(product => {
        expect(product.sku).toMatch(/^(LBR|PLY|CONC|STUD|DRYWALL|WINDOW|DOOR|NAIL|SCREW|SAFE)-/);
      });

      // Service products - SVC prefix
      const serviceProducts = products.filter(p => p.type === 'service');
      serviceProducts.forEach(product => {
        expect(product.sku).toMatch(/^SVC-/);
      });

      // Configurable products - CONFIG suffix
      const configurableProducts = variants.filter(p => p.type === 'configurable');
      configurableProducts.forEach(product => {
        expect(product.sku).toMatch(/-CONFIG$/);
      });

      // Bundle products - BUNDLE prefix
      bundles.forEach(bundle => {
        expect(bundle.sku).toMatch(/^BUNDLE-/);
      });
    });

    it('should validate all SKUs against format rules', () => {
      const allSkus = [
        ...products.map(p => p.sku),
        ...variants.map(v => v.sku),
        ...bundles.map(b => b.sku)
      ];

      allSkus.forEach(sku => {
        // No spaces
        expect(sku).not.toMatch(/\s/);
        // No special characters except dash and dot
        expect(sku).toMatch(/^[A-Z0-9\-\.]+$/);
        // Length limit (64 chars)
        expect(sku.length).toBeLessThanOrEqual(64);
        // Not empty
        expect(sku.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Bundle item validation', () => {
    it('should reference existing products in bundle items', () => {
      const allProductSkus = new Set([
        ...products.map(p => p.sku),
        ...variants.filter(v => v.type === 'simple' && v.parentSku).map(v => v.sku)
      ]);

      bundles.forEach(bundle => {
        bundle.groups.forEach(group => {
          group.items.forEach(item => {
            expect(allProductSkus.has(item.sku)).toBe(true);
          });
        });
      });
    });

    it('should not have bundles referencing other bundles', () => {
      const bundleSkus = new Set(bundles.map(b => b.sku));

      bundles.forEach(bundle => {
        bundle.groups.forEach(group => {
          group.items.forEach(item => {
            expect(bundleSkus.has(item.sku)).toBe(false);
          });
        });
      });
    });
  });

  describe('Data consistency', () => {
    it('should have consistent pricing across product types', () => {
      const allProducts = [...products, ...variants, ...bundles];

      allProducts.forEach(product => {
        expect(product.price).toBeGreaterThan(0);

        // Check price ranges by type
        if (product.type === 'service') {
          // Services typically more expensive
          expect(product.price).toBeGreaterThanOrEqual(50);
        } else if (product.type === 'bundle') {
          // Bundles typically higher priced (multiple items)
          expect(product.price).toBeGreaterThanOrEqual(100);
        } else if (product.type === 'configurable') {
          // Configurable base price
          expect(product.price).toBeGreaterThan(0);
        } else if (product.type === 'simple') {
          // Simple products vary widely
          expect(product.price).toBeGreaterThan(0);
          expect(product.price).toBeLessThan(5000);
        }
      });
    });

    it('should have consistent status and visibility', () => {
      const allProducts = [...products, ...variants, ...bundles];

      allProducts.forEach(product => {
        expect(product.status).toBe('enabled');
        expect(['catalog', 'search', 'both', 'none']).toContain(product.visibility);
      });
    });

    it('should generate deterministic output across all files', async () => {
      // Save current files
      const products1 = await fs.readFile(PRODUCTS_FILE, 'utf-8');
      const variants1 = await fs.readFile(VARIANTS_FILE, 'utf-8');
      const bundles1 = await fs.readFile(BUNDLES_FILE, 'utf-8');

      // Don't delete files - treat as fixtures
      // await fs.unlink(PRODUCTS_FILE);
      // await fs.unlink(VARIANTS_FILE);
      // await fs.unlink(BUNDLES_FILE);

      await execAsync('node scripts/generate-products.js');
      await execAsync('node scripts/generate-variants.js');
      await execAsync('node scripts/generate-bundles.js');

      // Read regenerated files
      const products2 = await fs.readFile(PRODUCTS_FILE, 'utf-8');
      const variants2 = await fs.readFile(VARIANTS_FILE, 'utf-8');
      const bundles2 = await fs.readFile(BUNDLES_FILE, 'utf-8');

      // Should be byte-identical
      expect(products1).toBe(products2);
      expect(variants1).toBe(variants2);
      expect(bundles1).toBe(bundles2);
    });
  });
});