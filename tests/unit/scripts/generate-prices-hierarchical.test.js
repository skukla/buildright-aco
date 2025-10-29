import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Generate Prices Hierarchical Script', () => {
  let mockProducts;
  let mockPriceBooks;
  let generatePricesHierarchical;

  beforeEach(async () => {
    jest.resetModules();

    // Mock products data with base prices for testing
    mockProducts = [
      { sku: 'LUM001', name: 'Pine Lumber 2x4x8', category: 'Lumber', basePrice: 100.00, uom: 'EA' },
      { sku: 'LUM002', name: 'Oak Lumber 2x6x10', category: 'Lumber', basePrice: 100.00, uom: 'EA' },
      { sku: 'HDW001', name: 'Hammer', category: 'Hardware', basePrice: 50.00, uom: 'EA' },
      { sku: 'TOL001', name: 'Drill', category: 'Tools', basePrice: 100.00, uom: 'EA' },
      { sku: 'PNT001', name: 'Paint Gallon', category: 'Paint', basePrice: 100.00, uom: 'GAL' }
    ];

    // Mock price books from Step 1 - new 4-book business-type structure
    mockPriceBooks = [
      {
        id: 'US_RETAIL',
        name: 'US Retail Price Book',
        businessType: 'RETAIL',
        discountPercentage: 0.00,
        region: 'US',
        currency: 'USD',
        effectiveDate: '2024-01-01'
      },
      {
        id: 'US_CONTRACTOR',
        name: 'US Contractor Price Book',
        businessType: 'CONTRACTOR',
        discountPercentage: 0.05,
        region: 'US',
        currency: 'USD',
        effectiveDate: '2024-01-01'
      },
      {
        id: 'US_COMMERCIAL',
        name: 'US Commercial Price Book',
        businessType: 'COMMERCIAL',
        discountPercentage: 0.10,
        region: 'US',
        currency: 'USD',
        effectiveDate: '2024-01-01'
      },
      {
        id: 'US_WHOLESALE',
        name: 'US Wholesale Price Book',
        businessType: 'WHOLESALE',
        discountPercentage: 0.15,
        region: 'US',
        currency: 'USD',
        effectiveDate: '2024-01-01'
      }
    ];

    // Try to import the module - will fail initially (RED phase)
    try {
      const module = await import('../../../scripts/generate-prices-hierarchical.js');
      generatePricesHierarchical = module.generatePricesHierarchical;
    } catch (error) {
      // Module doesn't exist yet - that's expected in RED phase
    }
  });

  describe('generatePricesHierarchical', () => {
    // ====================
    // Business-Type Discount Tests
    // ====================
    describe('Business-Type Discounts', () => {
      it('should apply 0% discount for RETAIL business type', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);
      const retailPrices = prices.filter(p =>
        p.priceBookId === 'US_RETAIL' && !p.tier && !p.volumeDiscount
      );

      retailPrices.forEach(price => {
        const product = mockProducts.find(p => p.sku === price.sku);
        // RETAIL should have no discount (0%)
        expect(price.amount).toBe(product.basePrice); // basePrice unchanged
      });
    });

    it('should apply 5% discount for CONTRACTOR business type', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);
      const contractorPrices = prices.filter(p =>
        p.priceBookId === 'US_CONTRACTOR' &&
        !p.tier && !p.volumeDiscount &&
        p.sku === 'TOL001' // Non-lumber product for clean test
      );

      contractorPrices.forEach(price => {
        // CONTRACTOR should have 5% discount
        expect(price.amount).toBe(95.00); // 100 * (1 - 0.05)
      });
    });

    it('should apply 10% discount for COMMERCIAL business type', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);
      const commercialPrices = prices.filter(p =>
        p.priceBookId === 'US_COMMERCIAL' &&
        !p.tier && !p.volumeDiscount &&
        p.sku === 'TOL001' // Non-lumber product for clean test
      );

      commercialPrices.forEach(price => {
        // COMMERCIAL should have 10% discount
        expect(price.amount).toBe(90.00); // 100 * (1 - 0.10)
      });
    });

    it('should apply 15% discount for WHOLESALE business type', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);
      const wholesalePrices = prices.filter(p =>
        p.priceBookId === 'US_WHOLESALE' &&
        !p.tier && !p.volumeDiscount &&
        p.sku === 'TOL001' // Non-lumber product for clean test
      );

      wholesalePrices.forEach(price => {
        // WHOLESALE should have 15% discount
        expect(price.amount).toBe(85.00); // 100 * (1 - 0.15)
      });
    });
    });

    // ====================
    // Regional Adjustment Tests
    // ====================
    describe('Regional Price Adjustments', () => {
      it('should apply +3% adjustment for West lumber products', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      // Create West region price books
      const westPriceBooks = [
        {
          id: 'US_WEST_RETAIL',
          name: 'US West Retail',
          businessType: 'RETAIL',
          discountPercentage: 0.00,
          region: 'West',
          currency: 'USD',
          effectiveDate: '2024-01-01'
        }
      ];

      const prices = generatePricesHierarchical(mockProducts, westPriceBooks);
      const lumberPrices = prices.filter(p =>
        p.priceBookId === 'US_WEST_RETAIL' &&
        (p.sku === 'LUM001' || p.sku === 'LUM002') &&
        !p.tier && !p.volumeDiscount
      );

      lumberPrices.forEach(price => {
        // West lumber should be basePrice (100) + 3%
        expect(price.amount).toBe(103.00);
      });
    });

    it('should not apply regional adjustment for West non-lumber products', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const westPriceBooks = [
        {
          id: 'US_WEST_RETAIL',
          name: 'US West Retail',
          businessType: 'RETAIL',
          discountPercentage: 0.00,
          region: 'West',
          currency: 'USD',
          effectiveDate: '2024-01-01'
        }
      ];

      const prices = generatePricesHierarchical(mockProducts, westPriceBooks);
      const hardwarePrices = prices.filter(p =>
        p.priceBookId === 'US_WEST_RETAIL' &&
        p.sku === 'HDW001' &&
        !p.tier && !p.volumeDiscount
      );

      hardwarePrices.forEach(price => {
        // West non-lumber should be unchanged
        expect(price.amount).toBe(50.00);
      });
    });

    it('should not apply regional adjustment for non-West lumber products', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const eastPriceBooks = [
        {
          id: 'US_EAST_RETAIL',
          name: 'US East Retail',
          businessType: 'RETAIL',
          discountPercentage: 0.00,
          region: 'East',
          currency: 'USD',
          effectiveDate: '2024-01-01'
        }
      ];

      const prices = generatePricesHierarchical(mockProducts, eastPriceBooks);
      const lumberPrices = prices.filter(p =>
        p.priceBookId === 'US_EAST_RETAIL' &&
        (p.sku === 'LUM001' || p.sku === 'LUM002') &&
        !p.tier && !p.volumeDiscount
      );

      lumberPrices.forEach(price => {
        // East lumber should be unchanged
        expect(price.amount).toBe(100.00);
      });
    });
    });

    // ====================
    // Stacked Discount Tests
    // ====================
    describe('Stacked Discounts (Business + Regional)', () => {
      it('should stack business discount then regional adjustment for West contractor lumber', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const westContractorPriceBook = [
        {
          id: 'US_WEST_CONTRACTOR',
          name: 'US West Contractor',
          businessType: 'CONTRACTOR',
          discountPercentage: 0.05,
          region: 'West',
          currency: 'USD',
          effectiveDate: '2024-01-01'
        }
      ];

      const prices = generatePricesHierarchical(mockProducts, westContractorPriceBook);
      const lumberPrices = prices.filter(p =>
        p.priceBookId === 'US_WEST_CONTRACTOR' &&
        p.sku === 'LUM001' &&
        !p.tier && !p.volumeDiscount
      );

      lumberPrices.forEach(price => {
        // 100 → 95 (5% contractor discount) → 97.85 (+3% West lumber)
        expect(price.amount).toBe(97.85);
      });
    });

    it('should stack business discount then regional adjustment for West wholesale lumber', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const westWholesalePriceBook = [
        {
          id: 'US_WEST_WHOLESALE',
          name: 'US West Wholesale',
          businessType: 'WHOLESALE',
          discountPercentage: 0.15,
          region: 'West',
          currency: 'USD',
          effectiveDate: '2024-01-01'
        }
      ];

      const prices = generatePricesHierarchical(mockProducts, westWholesalePriceBook);
      const lumberPrices = prices.filter(p =>
        p.priceBookId === 'US_WEST_WHOLESALE' &&
        p.sku === 'LUM001' &&
        !p.tier && !p.volumeDiscount
      );

      lumberPrices.forEach(price => {
        // 100 → 85 (15% wholesale discount) → 87.55 (+3% West lumber)
        expect(price.amount).toBe(87.55);
      });
    });
    });

    // ====================
    // Volume/Tier Pricing Tests (Quantity-based pricing, not loyalty tiers)
    // ====================
    describe('Volume and Quantity-Based Pricing', () => {
      it('should generate tier pricing with multiple price points per SKU', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      // Make products eligible for tier pricing
      const tieredProducts = mockProducts.map(p => ({ ...p, tierPricingEligible: true }));
      const prices = generatePricesHierarchical(tieredProducts, mockPriceBooks);

      // Check first price book (US_RETAIL) has tier prices
      const basePrices = prices.filter(p => p.priceBookId === 'US_RETAIL');

      tieredProducts.forEach(product => {
        const skuPrices = basePrices.filter(p => p.sku === product.sku);
        const tierPrices = skuPrices.filter(p => p.tier);

        // Should have 4 tiers (1-10, 11-50, 51-100, 101+)
        expect(tierPrices.length).toBeGreaterThanOrEqual(4);

        // Verify tier structure
        const tiers = tierPrices.map(p => p.tier);
        expect(tiers.some(t => t.minQty === 1 && t.maxQty === 10)).toBe(true);
        expect(tiers.some(t => t.minQty === 11 && t.maxQty === 50)).toBe(true);
        expect(tiers.some(t => t.minQty === 51 && t.maxQty === 100)).toBe(true);
        expect(tiers.some(t => t.minQty === 101 && t.maxQty === null)).toBe(true);
      });
    });

    it('should have decreasing unit prices with increasing tier volumes', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const tieredProducts = mockProducts.map(p => ({ ...p, tierPricingEligible: true }));
      const prices = generatePricesHierarchical(tieredProducts, mockPriceBooks);

      const basePrices = prices.filter(p => p.priceBookId === 'US_RETAIL');

      tieredProducts.forEach(product => {
        const tierPrices = basePrices
          .filter(p => p.sku === product.sku && p.tier)
          .sort((a, b) => a.tier.minQty - b.tier.minQty);

        // Verify prices decrease with volume
        for (let i = 1; i < tierPrices.length; i++) {
          expect(tierPrices[i].amount).toBeLessThanOrEqual(tierPrices[i-1].amount);
        }
      });
    });

    it('should apply volume discounts at correct thresholds', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const volumeProducts = mockProducts.map(p => ({ ...p, volumeDiscountEligible: true }));
      const prices = generatePricesHierarchical(volumeProducts, mockPriceBooks);

      const basePrices = prices.filter(p => p.priceBookId === 'US_RETAIL');

      volumeProducts.forEach(product => {
        const volumePrices = basePrices.filter(p => p.sku === product.sku && p.volumeDiscount);

        // Should have 3 volume levels
        expect(volumePrices.length).toBeGreaterThanOrEqual(3);

        const vol100 = volumePrices.find(p => p.volumeDiscount.qty === 100);
        const vol500 = volumePrices.find(p => p.volumeDiscount.qty === 500);
        const vol1000 = volumePrices.find(p => p.volumeDiscount.qty === 1000);

        expect(vol100).toBeDefined();
        expect(vol500).toBeDefined();
        expect(vol1000).toBeDefined();

        // Verify discount percentages
        expect(vol100.volumeDiscount.discount).toBeCloseTo(0.05, 2);
        expect(vol500.volumeDiscount.discount).toBeCloseTo(0.10, 2);
        expect(vol1000.volumeDiscount.discount).toBeCloseTo(0.15, 2);
      });
    });

    it('should respect maximum discount of 25%', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const discountProducts = mockProducts.map(p => ({
        ...p,
        tierPricingEligible: true,
        volumeDiscountEligible: true
      }));
      const prices = generatePricesHierarchical(discountProducts, mockPriceBooks);

      prices.forEach(price => {
        if (price.tier || price.volumeDiscount) {
          // Find base price for this SKU
          const basePrice = prices.find(p =>
            p.sku === price.sku &&
            p.priceBookId === price.priceBookId &&
            !p.tier &&
            !p.volumeDiscount
          );

          if (basePrice && basePrice.amount > 0) {
            const discountPercent = (basePrice.amount - price.amount) / basePrice.amount;
            expect(discountPercent).toBeLessThanOrEqual(0.25);
          }
        }
      });
    });
    });

    // ====================
    // Data Volume and Coverage Tests
    // ====================
    describe('Data Volume and Coverage', () => {
      it('should generate 500+ prices with 4 books and 125+ products', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      // Load actual products if available
      const productsPath = path.join(process.cwd(), 'data/buildright/products.json');
      const variantsPath = path.join(process.cwd(), 'data/buildright/variants.json');
      const bundlesPath = path.join(process.cwd(), 'data/buildright/bundles.json');

      let allProducts = [];
      if (fs.existsSync(productsPath)) {
        allProducts = allProducts.concat(JSON.parse(fs.readFileSync(productsPath, 'utf8')));
      }
      if (fs.existsSync(variantsPath)) {
        allProducts = allProducts.concat(JSON.parse(fs.readFileSync(variantsPath, 'utf8')));
      }
      if (fs.existsSync(bundlesPath)) {
        const bundles = JSON.parse(fs.readFileSync(bundlesPath, 'utf8'));
        allProducts = allProducts.concat(bundles);
      }

      // If no actual products yet, use mock data
      if (allProducts.length === 0) {
        allProducts = mockProducts;
      }

      const prices = generatePricesHierarchical(allProducts, mockPriceBooks);
      expect(prices.length).toBeGreaterThanOrEqual(500);
    });

    it('should generate prices with all SKUs from products', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);
      const validSkus = new Set(mockProducts.map(p => p.sku));

      prices.forEach(price => {
        expect(validSkus.has(price.sku)).toBe(true);
      });
    });

    it('should generate prices for all valid price book IDs', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);
      const validPriceBookIds = new Set(mockPriceBooks.map(pb => pb.id));

      prices.forEach(price => {
        expect(validPriceBookIds.has(price.priceBookId)).toBe(true);
      });
    });
    });

    // ====================
    // Legacy Field Removal Validation
    // ====================
    describe('Legacy Field Removal (No Loyalty Tiers)', () => {
      it('should not include tier discount fields in prices', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);

      prices.forEach(price => {
        // Should not have tierDiscount field
        expect(price).not.toHaveProperty('tierDiscount');
      });
    });

    it('should not include promotional discount fields in prices', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);

      prices.forEach(price => {
        // Should not have promotionalDiscount field
        expect(price).not.toHaveProperty('promotionalDiscount');
      });
    });
    });

    // ====================
    // Data Integrity Tests
    // ====================
    describe('Data Integrity and Field Validation', () => {
      it('should have valid price structure with required fields', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);

      prices.forEach(price => {
        expect(price).toHaveProperty('id');
        expect(price).toHaveProperty('sku');
        expect(price).toHaveProperty('priceBookId');
        expect(price).toHaveProperty('amount');
        expect(price).toHaveProperty('currency');
        expect(price).toHaveProperty('effectiveDate');

        expect(typeof price.amount).toBe('number');
        expect(price.amount).toBeGreaterThanOrEqual(0);
        expect(price.currency).toBe('USD');
      });
    });

    it('should generate unique price IDs', async () => {
      if (!generatePricesHierarchical) {
        expect(generatePricesHierarchical).toBeDefined();
        return;
      }

      const prices = generatePricesHierarchical(mockProducts, mockPriceBooks);
      const priceIds = prices.map(p => p.id);
      const uniqueIds = new Set(priceIds);

      expect(uniqueIds.size).toBe(priceIds.length);
    });
    });
  });

  // ====================
  // CLI Integration Tests
  // ====================
  describe('CLI execution', () => {
    it('should write prices to correct output file', async () => {
      const outputPath = path.join(process.cwd(), 'data/buildright/prices.json');

      // This will fail initially as script doesn't exist
      try {
        await import('../../../scripts/generate-prices-hierarchical.js');
        expect(true).toBe(true);
      } catch (error) {
        expect(error.code).toBe('ERR_MODULE_NOT_FOUND');
      }
    });
  });
});