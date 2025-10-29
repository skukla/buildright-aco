import fs from 'fs/promises';
import path from 'path';
import { generateInventory, generateSources } from '../../../scripts/generate-inventory.js';

describe('Inventory Generation Integration', () => {
  const dataDir = path.join(process.cwd(), 'data/buildright');
  const inventoryPath = path.join(dataDir, 'inventory.json');
  const sourcesPath = path.join(dataDir, 'sources.json');
  const productsPath = path.join(dataDir, 'products.json');
  const variantsPath = path.join(dataDir, 'variants.json');
  const bundlesPath = path.join(dataDir, 'bundles.json');

  let originalProducts;
  let originalVariants;
  let originalBundles;

  beforeAll(async () => {
    // Check if real product files exist from Step 6
    try {
      originalProducts = await fs.readFile(productsPath, 'utf-8');
      originalVariants = await fs.readFile(variantsPath, 'utf-8');
      originalBundles = await fs.readFile(bundlesPath, 'utf-8');
    } catch (error) {
      console.warn('Product files not found, integration tests will be limited');
    }
  });

  afterAll(async () => {
    // Don't delete files - treat as fixtures
    // try {
    //   await fs.unlink(inventoryPath);
    //   await fs.unlink(sourcesPath);
    // } catch (error) {
    //   // Files may not exist if tests failed
    // }
  });

  it('should reference all products from Step 6 catalog', async () => {
    if (!originalProducts) {
      console.warn('Skipping test - product files not found');
      return;
    }

    await generateInventory();

    const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf-8'));
    const products = JSON.parse(originalProducts);
    const variants = JSON.parse(originalVariants);
    const bundles = JSON.parse(originalBundles);

    // Combine all SKUs except service products
    const allProducts = [...products, ...variants, ...bundles];
    const physicalProducts = allProducts.filter(p =>
      !p.sku.startsWith('SVC-') && p.type !== 'service'
    );

    const inventorySkus = inventory.map(item => item.sku);
    const productSkus = physicalProducts.map(p => p.sku);

    // Every physical product should have inventory
    productSkus.forEach(sku => {
      expect(inventorySkus).toContain(sku);
    });

    // No inventory should exist for non-existent products
    inventorySkus.forEach(sku => {
      expect(productSkus).toContain(sku);
    });
  });

  it('should generate sources with valid coordinates for distance calculations', async () => {
    await generateSources();

    const sources = JSON.parse(await fs.readFile(sourcesPath, 'utf-8'));

    sources.forEach(source => {
      if (source.source_code !== 'dropship_premium_windows') {
        // Physical warehouses should have valid coordinates
        expect(source.latitude).toBeDefined();
        expect(source.longitude).toBeDefined();
        expect(typeof source.latitude).toBe('number');
        expect(typeof source.longitude).toBe('number');

        // Validate coordinate ranges
        expect(source.latitude).toBeGreaterThanOrEqual(-90);
        expect(source.latitude).toBeLessThanOrEqual(90);
        expect(source.longitude).toBeGreaterThanOrEqual(-180);
        expect(source.longitude).toBeLessThanOrEqual(180);
      } else {
        // Virtual drop shipper should have null coordinates
        expect(source.latitude).toBeNull();
        expect(source.longitude).toBeNull();
      }
    });
  });

  it('should ensure inventory data matches ACO MSI schema requirements', async () => {
    await generateInventory();

    const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf-8'));

    inventory.forEach(item => {
      // Validate inventory item structure
      expect(item).toHaveProperty('sku');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('sources');

      // SKU must be a non-empty string
      expect(typeof item.sku).toBe('string');
      expect(item.sku.length).toBeGreaterThan(0);

      // Quantity must be a non-negative integer
      expect(Number.isInteger(item.quantity)).toBe(true);
      expect(item.quantity).toBeGreaterThanOrEqual(0);

      // Sources must be an array with at least one source
      expect(Array.isArray(item.sources)).toBe(true);
      expect(item.sources.length).toBeGreaterThanOrEqual(1);

      // Validate each source
      item.sources.forEach(source => {
        expect(source).toHaveProperty('source_code');
        expect(source).toHaveProperty('quantity');

        // Source code must be a valid string
        expect(typeof source.source_code).toBe('string');
        expect(source.source_code.length).toBeGreaterThan(0);

        // Source quantity must be a non-negative integer
        expect(Number.isInteger(source.quantity)).toBe(true);
        expect(source.quantity).toBeGreaterThanOrEqual(0);
      });

      // Total quantity must match sum of source quantities
      const sumOfSources = item.sources.reduce((sum, s) => sum + s.quantity, 0);
      expect(item.quantity).toBe(sumOfSources);
    });
  });

  it('should generate complete inventory for 180+ SKUs', async () => {
    if (!originalProducts) {
      console.warn('Skipping test - product files not found');
      return;
    }

    await generateInventory();

    const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf-8'));

    // Should have at least 180 inventory items (excluding services)
    expect(inventory.length).toBeGreaterThanOrEqual(180);

    // Verify variety of SKU patterns
    const skuPatterns = {
      lumber: inventory.filter(i => i.sku.includes('LBR-')),
      cement: inventory.filter(i => i.sku.includes('CEMENT-')),
      nails: inventory.filter(i => i.sku.includes('NAIL-')),
      windows: inventory.filter(i => i.sku.includes('WINDOW-')),
      bundles: inventory.filter(i => i.sku.includes('BUNDLE-'))
    };

    // Should have items from multiple categories
    expect(skuPatterns.lumber.length).toBeGreaterThan(0);
    expect(skuPatterns.cement.length).toBeGreaterThan(0);
    expect(skuPatterns.nails.length).toBeGreaterThan(0);
  });

  it('should create exactly 6 sources with proper distribution', async () => {
    await generateSources();

    const sources = JSON.parse(await fs.readFile(sourcesPath, 'utf-8'));

    // Should have exactly 6 sources
    expect(sources).toHaveLength(6);

    // Check for specific sources
    const sourceCodes = sources.map(s => s.source_code);
    expect(sourceCodes).toContain('warehouse_west');
    expect(sourceCodes).toContain('warehouse_east');
    expect(sourceCodes).toContain('warehouse_phoenix');
    expect(sourceCodes).toContain('warehouse_denver');
    expect(sourceCodes).toContain('warehouse_atlanta');
    expect(sourceCodes).toContain('dropship_premium_windows');

    // Validate source types
    const rdcs = sources.filter(s =>
      s.source_code === 'warehouse_west' || s.source_code === 'warehouse_east'
    );
    expect(rdcs).toHaveLength(2);

    const regionalWarehouses = sources.filter(s =>
      s.source_code.includes('warehouse_') &&
      !s.source_code.includes('_west') &&
      !s.source_code.includes('_east')
    );
    expect(regionalWarehouses).toHaveLength(3);

    const dropShippers = sources.filter(s => s.source_code.includes('dropship'));
    expect(dropShippers).toHaveLength(1);
  });
});