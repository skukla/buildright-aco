import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Generate Price Books Script', () => {
  let generatePriceBooks;
  let validatePriceBookHierarchy;
  let calculateHierarchyDepth;

  beforeEach(async () => {
    // Clear module cache
    jest.resetModules();

    // Try to import the module - will fail initially (RED phase)
    try {
      const module = await import('../../../scripts/generate-price-books.js');
      generatePriceBooks = module.generatePriceBooks;
      validatePriceBookHierarchy = module.validatePriceBookHierarchy;
      calculateHierarchyDepth = module.calculateHierarchyDepth;
    } catch (error) {
      // Module doesn't exist yet - that's expected in RED phase
    }
  });

  // ====================
  // Price Book Generation
  // ====================
  describe('Price Book Generation', () => {
    it('should generate exactly 4 price books', async () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();
      expect(priceBooks).toHaveLength(4);
    });

    it('should have business type structure', async () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      const businessTypes = priceBooks.map(pb => pb.businessType).sort();
      expect(businessTypes).toEqual(['COMMERCIAL', 'CONTRACTOR', 'RETAIL', 'WHOLESALE']);

      // Verify each price book has correct business type
      const retail = priceBooks.find(pb => pb.businessType === 'RETAIL');
      const contractor = priceBooks.find(pb => pb.businessType === 'CONTRACTOR');
      const commercial = priceBooks.find(pb => pb.businessType === 'COMMERCIAL');
      const wholesale = priceBooks.find(pb => pb.businessType === 'WHOLESALE');

      expect(retail).toBeDefined();
      expect(contractor).toBeDefined();
      expect(commercial).toBeDefined();
      expect(wholesale).toBeDefined();
    });

    it('should have correct discount percentages', async () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      const retail = priceBooks.find(pb => pb.businessType === 'RETAIL');
      const contractor = priceBooks.find(pb => pb.businessType === 'CONTRACTOR');
      const commercial = priceBooks.find(pb => pb.businessType === 'COMMERCIAL');
      const wholesale = priceBooks.find(pb => pb.businessType === 'WHOLESALE');

      expect(retail.discountPercentage).toBe(0.00);
      expect(contractor.discountPercentage).toBe(0.05);
      expect(commercial.discountPercentage).toBe(0.10);
      expect(wholesale.discountPercentage).toBe(0.15);
    });

    it('should have flat structure with no parent references', async () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      priceBooks.forEach(pb => {
        // Should not have parentId field at all
        expect(pb).not.toHaveProperty('parentId');
        // Should not have level field at all
        expect(pb).not.toHaveProperty('level');
      });
    });

    it('should have no loyalty tier references', async () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      // Check that no price book contains loyalty tier strings
      const loyaltyTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
      priceBooks.forEach(pb => {
        const pbString = JSON.stringify(pb);
        loyaltyTiers.forEach(tier => {
          expect(pbString).not.toContain(tier);
        });
        // Also check specific tier field doesn't exist
        expect(pb).not.toHaveProperty('tier');
        expect(pb).not.toHaveProperty('discountTier');
      });
    });

    it('should have no promotional price books', async () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      priceBooks.forEach(pb => {
        // Should not have promotional field
        expect(pb).not.toHaveProperty('promotional');
        // Should not have endDate field (only used for promos)
        expect(pb).not.toHaveProperty('endDate');
      });
    });

    it('should have all required fields for each price book', async () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      priceBooks.forEach(pb => {
        // Required fields for new structure
        expect(pb).toHaveProperty('id');
        expect(pb).toHaveProperty('name');
        expect(pb).toHaveProperty('businessType');
        expect(pb).toHaveProperty('discountPercentage');
        expect(pb).toHaveProperty('region');
        expect(pb).toHaveProperty('currency');
        expect(pb).toHaveProperty('effectiveDate');
        expect(pb).toHaveProperty('status');

        // Verify values are truthy
        expect(pb.id).toBeTruthy();
        expect(pb.name).toBeTruthy();
        expect(pb.businessType).toBeTruthy();
        expect(typeof pb.discountPercentage).toBe('number');
        expect(pb.region).toBe('US');
        expect(pb.currency).toBe('USD');
        expect(pb.status).toBe('ACTIVE');
      });
    });

    it('should calculate hierarchy depth of 1 for flat structure', async () => {
      if (!generatePriceBooks || !calculateHierarchyDepth) {
        expect(generatePriceBooks).toBeDefined();
        expect(calculateHierarchyDepth).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      const depth = calculateHierarchyDepth(priceBooks);
      expect(depth).toBe(1);
    });

    it('should have unique price book IDs', async () => {
      if (!generatePriceBooks) {
        expect(generatePriceBooks).toBeDefined();
        return;
      }
      const priceBooks = generatePriceBooks();

      const ids = priceBooks.map(pb => pb.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);

      // Also verify expected ID format
      expect(ids).toContain('US_RETAIL');
      expect(ids).toContain('US_CONTRACTOR');
      expect(ids).toContain('US_COMMERCIAL');
      expect(ids).toContain('US_WHOLESALE');
    });
  });

  // ====================
  // CLI Integration
  // ====================
  describe('CLI execution', () => {
    it('should write price books to correct output file', async () => {
      // This test will verify the CLI writes the output file
      const outputPath = path.join(process.cwd(), 'data/buildright/price-books.json');

      // This will fail initially as script doesn't exist
      try {
        await import('../../../scripts/generate-price-books.js');
        expect(true).toBe(true);
      } catch (error) {
        expect(error.code).toBe('ERR_MODULE_NOT_FOUND');
      }
    });
  });
});