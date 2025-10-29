import { generateSKU, generateVariantSKU, validateSKU } from '../../../utils/sku-generator.js';

describe('SKU Generator', () => {
  describe('generateSKU', () => {
    describe('Category-based SKU prefixes', () => {
      it('should generate LBR- prefix for structural lumber', () => {
        const sku = generateSKU({
          category: 'structural',
          subcategory: 'lumber',
          type: 'simple',
          name: '2x4 Stud'
        });
        expect(sku).toMatch(/^LBR-/);
      });

      it('should generate PLY- prefix for plywood', () => {
        const sku = generateSKU({
          category: 'structural',
          subcategory: 'plywood',
          type: 'simple',
          name: 'OSB Sheathing'
        });
        expect(sku).toMatch(/^PLY-/);
      });

      it('should generate CONC- prefix for concrete', () => {
        const sku = generateSKU({
          category: 'structural',
          subcategory: 'concrete',
          type: 'simple',
          name: 'Ready Mix Concrete'
        });
        expect(sku).toMatch(/^CONC-/);
      });

      it('should generate STUD- prefix for framing studs', () => {
        const sku = generateSKU({
          category: 'framing',
          subcategory: 'studs',
          type: 'simple',
          name: 'Metal Stud'
        });
        expect(sku).toMatch(/^STUD-/);
      });

      it('should generate DRYWALL- prefix for drywall products', () => {
        const sku = generateSKU({
          category: 'framing',
          subcategory: 'drywall',
          type: 'simple',
          name: 'Drywall Sheet'
        });
        expect(sku).toMatch(/^DRYWALL-/);
      });

      it('should generate WINDOW- prefix for windows', () => {
        const sku = generateSKU({
          category: 'windows-doors',
          subcategory: 'windows',
          type: 'simple',
          name: 'Double Hung Window'
        });
        expect(sku).toMatch(/^WINDOW-/);
      });

      it('should generate DOOR- prefix for doors', () => {
        const sku = generateSKU({
          category: 'windows-doors',
          subcategory: 'doors',
          type: 'simple',
          name: 'Entry Door'
        });
        expect(sku).toMatch(/^DOOR-/);
      });

      it('should generate NAIL- prefix for nails', () => {
        const sku = generateSKU({
          category: 'fasteners',
          subcategory: 'nails',
          type: 'simple',
          name: 'Framing Nails'
        });
        expect(sku).toMatch(/^NAIL-/);
      });

      it('should generate SCREW- prefix for screws', () => {
        const sku = generateSKU({
          category: 'fasteners',
          subcategory: 'screws',
          type: 'simple',
          name: 'Deck Screws'
        });
        expect(sku).toMatch(/^SCREW-/);
      });

      it('should generate SAFE- prefix for safety equipment', () => {
        const sku = generateSKU({
          category: 'safety',
          subcategory: 'equipment',
          type: 'simple',
          name: 'Hard Hat'
        });
        expect(sku).toMatch(/^SAFE-/);
      });

      it('should generate SVC- prefix for service products', () => {
        const sku = generateSKU({
          category: 'services',
          type: 'service',
          name: 'Installation Service'
        });
        expect(sku).toMatch(/^SVC-/);
      });

      it('should generate BUNDLE- prefix for bundle products', () => {
        const sku = generateSKU({
          category: 'structural',
          type: 'bundle',
          name: 'Framing Package'
        });
        expect(sku).toMatch(/^BUNDLE-/);
      });
    });

    describe('SKU uniqueness', () => {
      it('should generate unique SKUs for different products', () => {
        const skus = new Set();
        for (let i = 0; i < 100; i++) {
          const sku = generateSKU({
            category: 'structural',
            subcategory: 'lumber',
            type: 'simple',
            name: `Product ${i}`
          });
          expect(skus.has(sku)).toBe(false);
          skus.add(sku);
        }
      });

      it('should generate deterministic SKUs with same seed', () => {
        const options = {
          category: 'structural',
          subcategory: 'lumber',
          type: 'simple',
          name: '2x4 Stud',
          seed: 12345
        };
        const sku1 = generateSKU(options);
        const sku2 = generateSKU(options);
        expect(sku1).toBe(sku2);
      });
    });

    describe('Configurable product SKUs', () => {
      it('should append -CONFIG suffix for configurable products', () => {
        const sku = generateSKU({
          category: 'structural',
          subcategory: 'lumber',
          type: 'configurable',
          name: 'Dimensional Lumber'
        });
        expect(sku).toMatch(/^LBR-.*-CONFIG$/);
      });
    });
  });

  describe('generateVariantSKU', () => {
    it('should generate variant SKU from parent SKU and attributes', () => {
      const parentSKU = 'LBR-DIM-CONFIG';
      const attributes = {
        width: '9.25',
        depth: '1.75',
        length: '20'
      };
      const variantSKU = generateVariantSKU(parentSKU, attributes);
      expect(variantSKU).toMatch(/^LBR-DIM-1\.75X9\.25-20$/);
    });

    it('should handle multiple dimension combinations', () => {
      const parentSKU = 'PLY-OSB-CONFIG';
      const attributes = {
        thickness: '0.5',
        width: '4',
        length: '8'
      };
      const variantSKU = generateVariantSKU(parentSKU, attributes);
      expect(variantSKU).toMatch(/^PLY-OSB-0\.5-4X8$/);
    });

    it('should handle variant SKUs without CONFIG suffix', () => {
      const parentSKU = 'STUD-METAL-CONFIG';
      const attributes = {
        gauge: '20',
        width: '3.5',
        length: '10'
      };
      const variantSKU = generateVariantSKU(parentSKU, attributes);
      expect(variantSKU).not.toContain('-CONFIG');
      expect(variantSKU).toMatch(/^STUD-METAL-20GA-3\.5-10$/);
    });
  });

  describe('validateSKU', () => {
    it('should validate correct SKU formats', () => {
      expect(validateSKU('LBR-2X4-8FT')).toBe(true);
      expect(validateSKU('PLY-OSB-4X8')).toBe(true);
      expect(validateSKU('CONC-MIX-80LB')).toBe(true);
      expect(validateSKU('SVC-INSTALL-001')).toBe(true);
      expect(validateSKU('BUNDLE-FRAME-001')).toBe(true);
    });

    it('should reject invalid SKU formats', () => {
      expect(validateSKU('')).toBe(false);
      expect(validateSKU('invalid sku')).toBe(false); // spaces not allowed
      expect(validateSKU('invalid@sku')).toBe(false); // special chars not allowed
      expect(validateSKU('a'.repeat(65))).toBe(false); // too long (>64 chars)
    });

    it('should enforce SKU length limits', () => {
      const validSKU = 'LBR-' + 'A'.repeat(59); // 63 chars total
      const tooLongSKU = 'LBR-' + 'A'.repeat(61); // 65 chars total

      expect(validateSKU(validSKU)).toBe(true);
      expect(validateSKU(tooLongSKU)).toBe(false);
    });

    it('should allow dots and dashes in SKUs', () => {
      expect(validateSKU('LBR-1.75X9.25-20')).toBe(true);
      expect(validateSKU('STUD-METAL-20GA-3.5-10')).toBe(true);
    });
  });
});