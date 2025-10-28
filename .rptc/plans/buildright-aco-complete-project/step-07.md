# Step 7: Generation Scripts - Pricing

## Purpose

Implement pricing data generation scripts to create a hierarchical price book structure and comprehensive pricing data with regional adjustments, tier pricing, and volume discounts. This step establishes the pricing foundation for the BuildRight ACO system.

## Prerequisites

- [x] Step 6 completed (generate-all-products.js with 125 products, variants, and bundles)
- [x] Valid SKUs available from products generation
- [x] utilities/data-generator.js available (from Step 2)
- [x] Reference metadata for regions and price adjustments

## Tests to Write First

### Price Book Generation Tests

- [ ] **Test: Generate 12 price books in 4-level hierarchy**
  - **Given:** Empty price books data structure
  - **When:** generate-price-books.js executes
  - **Then:** Creates exactly 12 price books with parent-child relationships forming 4 levels
  - **File:** `tests/unit/scripts/generate-price-books.test.js`

- [ ] **Test: Validate price book hierarchy integrity**
  - **Given:** Generated price books with parent references
  - **When:** Validation runs
  - **Then:** All parent IDs reference existing price books, no circular references, depth <= 4
  - **File:** `tests/unit/scripts/generate-price-books.test.js`

- [ ] **Test: Price book required fields present**
  - **Given:** Generated price books
  - **When:** Field validation runs
  - **Then:** Each book has id, name, parentId (except root), effectiveDate, status
  - **File:** `tests/unit/scripts/generate-price-books.test.js`

### Hierarchical Pricing Generation Tests

- [ ] **Test: Generate 1,500+ prices**
  - **Given:** 125 valid SKUs and 12 price books
  - **When:** generate-prices-hierarchical.js executes
  - **Then:** Creates at least 1,500 price entries (12 books × 125 products minimum)
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

- [ ] **Test: All prices reference valid SKUs**
  - **Given:** Generated prices and SKU list from products
  - **When:** SKU validation runs
  - **Then:** Every price.sku exists in products data, no orphaned prices
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

- [ ] **Test: All prices reference valid price books**
  - **Given:** Generated prices and price book list
  - **When:** Price book validation runs
  - **Then:** Every price.priceBookId exists in price books data
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

### Regional Adjustment Tests

- [ ] **Test: West region lumber products get +3% adjustment**
  - **Given:** Lumber category products and West region price book
  - **When:** Regional adjustments applied
  - **Then:** Lumber prices in West region are exactly 3% higher than base prices
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

- [ ] **Test: Non-lumber products unchanged in West region**
  - **Given:** Non-lumber products and West region price book
  - **When:** Regional adjustments applied
  - **Then:** Non-lumber prices match base prices (no adjustment)
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

- [ ] **Test: Other regions have no adjustments**
  - **Given:** Products and non-West region price books
  - **When:** Regional adjustments applied
  - **Then:** Prices match base prices exactly
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

### Tier Pricing Tests

- [ ] **Test: Generate tier pricing for eligible products**
  - **Given:** Products marked for tier pricing
  - **When:** Tier pricing generation runs
  - **Then:** Creates multiple price points per SKU (e.g., 1-10, 11-50, 51+ units)
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

- [ ] **Test: Tier pricing decreases with volume**
  - **Given:** Generated tier prices for a SKU
  - **When:** Tier validation runs
  - **Then:** Unit price decreases as quantity tier increases
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

### Volume Discount Tests

- [ ] **Test: Volume discounts applied to bulk purchases**
  - **Given:** Products eligible for volume discounts
  - **When:** Volume discount calculation runs
  - **Then:** Discount percentage increases with quantity (e.g., 5% at 100 units, 10% at 500 units)
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

- [ ] **Test: Volume discounts within business rules**
  - **Given:** Generated volume discounts
  - **When:** Business rule validation runs
  - **Then:** Discounts <= 25% max, apply only to eligible categories
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

### Price Inheritance Chain Tests

- [ ] **Test: Child price books inherit from parents**
  - **Given:** Price books with parent-child relationships
  - **When:** Inheritance validation runs
  - **Then:** Child book without explicit price uses parent's price
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

- [ ] **Test: Child prices override parent prices**
  - **Given:** Child price book with explicit price for SKU
  - **When:** Price lookup runs
  - **Then:** Child's explicit price used, not parent's
  - **File:** `tests/unit/scripts/generate-prices-hierarchical.test.js`

## Files to Create/Modify

- [ ] `scripts/generate-price-books.js` - Generate 12 price books in 4-level hierarchy
- [ ] `scripts/generate-prices-hierarchical.js` - Generate 1,500+ prices with all pricing logic
- [ ] `tests/unit/scripts/generate-price-books.test.js` - Unit tests for price book generation
- [ ] `tests/unit/scripts/generate-prices-hierarchical.test.js` - Unit tests for price generation
- [ ] `data/generated/price-books.json` - Output: Price book hierarchy data
- [ ] `data/generated/prices.json` - Output: Comprehensive pricing data

## Implementation Details

### RED Phase (Write Failing Tests First)

```javascript
// tests/unit/scripts/generate-price-books.test.js
const { generatePriceBooks, validatePriceBookHierarchy } = require('../../../scripts/generate-price-books');

describe('generate-price-books', () => {
  describe('Price Book Generation', () => {
    it('should generate exactly 12 price books', () => {
      const priceBooks = generatePriceBooks();
      expect(priceBooks).toHaveLength(12);
    });

    it('should create 4-level hierarchy', () => {
      const priceBooks = generatePriceBooks();
      const depths = priceBooks.map(pb => calculateDepth(pb, priceBooks));
      expect(Math.max(...depths)).toBe(4);
    });

    it('should have valid parent references', () => {
      const priceBooks = generatePriceBooks();
      const result = validatePriceBookHierarchy(priceBooks);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Price Book Structure', () => {
    it('should have required fields', () => {
      const priceBooks = generatePriceBooks();
      priceBooks.forEach(pb => {
        expect(pb).toHaveProperty('id');
        expect(pb).toHaveProperty('name');
        expect(pb).toHaveProperty('effectiveDate');
        expect(pb).toHaveProperty('status');
      });
    });
  });
});

// tests/unit/scripts/generate-prices-hierarchical.test.js
const { generatePricesHierarchical, validatePriceReferences } = require('../../../scripts/generate-prices-hierarchical');
const products = require('../../../data/generated/all-products.json');
const priceBooks = require('../../../data/generated/price-books.json');

describe('generate-prices-hierarchical', () => {
  describe('Price Generation Volume', () => {
    it('should generate at least 1,500 prices', () => {
      const prices = generatePricesHierarchical(products, priceBooks);
      expect(prices.length).toBeGreaterThanOrEqual(1500);
    });
  });

  describe('Reference Validation', () => {
    it('should reference only valid SKUs', () => {
      const prices = generatePricesHierarchical(products, priceBooks);
      const validSKUs = new Set(products.map(p => p.sku));
      prices.forEach(price => {
        expect(validSKUs.has(price.sku)).toBe(true);
      });
    });

    it('should reference only valid price books', () => {
      const prices = generatePricesHierarchical(products, priceBooks);
      const validPriceBookIds = new Set(priceBooks.map(pb => pb.id));
      prices.forEach(price => {
        expect(validPriceBookIds.has(price.priceBookId)).toBe(true);
      });
    });
  });

  describe('Regional Adjustments', () => {
    it('should apply +3% to lumber in West region', () => {
      const prices = generatePricesHierarchical(products, priceBooks);
      const westPriceBook = priceBooks.find(pb => pb.region === 'West');
      const lumberProducts = products.filter(p => p.category === 'Lumber');

      lumberProducts.forEach(lumber => {
        const basePrice = prices.find(p => p.sku === lumber.sku && p.priceBookId === 'BASE');
        const westPrice = prices.find(p => p.sku === lumber.sku && p.priceBookId === westPriceBook.id);
        expect(westPrice.amount).toBeCloseTo(basePrice.amount * 1.03, 2);
      });
    });
  });

  describe('Tier Pricing', () => {
    it('should create multiple tiers for eligible products', () => {
      const prices = generatePricesHierarchical(products, priceBooks);
      const tierEligibleProduct = products.find(p => p.tierPricingEligible);
      const tieredPrices = prices.filter(p => p.sku === tierEligibleProduct.sku && p.tier);
      expect(tieredPrices.length).toBeGreaterThanOrEqual(3);
    });

    it('should decrease unit price with volume', () => {
      const prices = generatePricesHierarchical(products, priceBooks);
      const tierEligibleProduct = products.find(p => p.tierPricingEligible);
      const tieredPrices = prices.filter(p => p.sku === tierEligibleProduct.sku && p.tier)
        .sort((a, b) => a.tier.minQty - b.tier.minQty);

      for (let i = 1; i < tieredPrices.length; i++) {
        expect(tieredPrices[i].amount).toBeLessThan(tieredPrices[i - 1].amount);
      }
    });
  });

  describe('Price Inheritance', () => {
    it('should inherit from parent when no explicit price', () => {
      const prices = generatePricesHierarchical(products, priceBooks);
      const childPriceBook = priceBooks.find(pb => pb.parentId);
      const testSKU = products[0].sku;

      const parentPrice = prices.find(p => p.sku === testSKU && p.priceBookId === childPriceBook.parentId);
      const childPrice = prices.find(p => p.sku === testSKU && p.priceBookId === childPriceBook.id);

      if (!childPrice.explicit) {
        expect(childPrice.amount).toBe(parentPrice.amount);
      }
    });
  });
});
```

### GREEN Phase (Minimal Implementation)

#### 1. Create `scripts/generate-price-books.js`

```javascript
const fs = require('fs');
const path = require('path');

function generatePriceBooks() {
  const priceBooks = [];

  // Level 1: Base price book
  priceBooks.push({
    id: 'BASE',
    name: 'Base Price Book',
    parentId: null,
    effectiveDate: '2024-01-01',
    status: 'ACTIVE',
    level: 1
  });

  // Level 2: Regional price books (4 regions)
  const regions = ['North', 'South', 'East', 'West'];
  regions.forEach((region, idx) => {
    priceBooks.push({
      id: `REGION_${region.toUpperCase()}`,
      name: `${region} Region Price Book`,
      parentId: 'BASE',
      region,
      effectiveDate: '2024-01-01',
      status: 'ACTIVE',
      level: 2
    });
  });

  // Level 3: Customer tier price books (4 tiers under West region as example)
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  tiers.forEach(tier => {
    priceBooks.push({
      id: `TIER_WEST_${tier.toUpperCase()}`,
      name: `West ${tier} Tier`,
      parentId: 'REGION_WEST',
      tier,
      effectiveDate: '2024-01-01',
      status: 'ACTIVE',
      level: 3
    });
  });

  // Level 4: Promotional price books (3 under Gold tier)
  ['SPRING_PROMO', 'SUMMER_SALE', 'CLEARANCE'].forEach(promo => {
    priceBooks.push({
      id: `PROMO_${promo}`,
      name: promo.replace('_', ' '),
      parentId: 'TIER_WEST_GOLD',
      effectiveDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'ACTIVE',
      level: 4
    });
  });

  return priceBooks;
}

function validatePriceBookHierarchy(priceBooks) {
  const errors = [];
  const priceBookIds = new Set(priceBooks.map(pb => pb.id));

  priceBooks.forEach(pb => {
    if (pb.parentId && !priceBookIds.has(pb.parentId)) {
      errors.push(`Price book ${pb.id} references non-existent parent ${pb.parentId}`);
    }
  });

  // Check for circular references
  priceBooks.forEach(pb => {
    const visited = new Set();
    let current = pb;
    while (current.parentId) {
      if (visited.has(current.id)) {
        errors.push(`Circular reference detected: ${current.id}`);
        break;
      }
      visited.add(current.id);
      current = priceBooks.find(p => p.id === current.parentId);
      if (!current) break;
    }
  });

  return { valid: errors.length === 0, errors };
}

function main() {
  console.log('Generating price books...');

  const priceBooks = generatePriceBooks();
  const validation = validatePriceBookHierarchy(priceBooks);

  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    process.exit(1);
  }

  const outputPath = path.join(__dirname, '../data/generated/price-books.json');
  fs.writeFileSync(outputPath, JSON.stringify(priceBooks, null, 2));

  console.log(`✓ Generated ${priceBooks.length} price books`);
  console.log(`✓ Saved to ${outputPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { generatePriceBooks, validatePriceBookHierarchy };
```

#### 2. Create `scripts/generate-prices-hierarchical.js`

```javascript
const fs = require('fs');
const path = require('path');

function generatePricesHierarchical(products, priceBooks) {
  const prices = [];

  priceBooks.forEach(priceBook => {
    products.forEach(product => {
      // Base price calculation
      let baseAmount = product.basePrice || generateBasePrice(product);

      // Apply regional adjustments
      if (priceBook.region === 'West' && product.category === 'Lumber') {
        baseAmount *= 1.03; // +3% for West lumber
      }

      // Generate standard price entry
      prices.push({
        id: `${priceBook.id}_${product.sku}`,
        sku: product.sku,
        priceBookId: priceBook.id,
        amount: parseFloat(baseAmount.toFixed(2)),
        currency: 'USD',
        uom: product.uom || 'EA',
        effectiveDate: priceBook.effectiveDate,
        explicit: priceBook.level === 1 // Base prices are explicit
      });

      // Generate tier pricing for eligible products
      if (product.tierPricingEligible && priceBook.level === 1) {
        const tiers = [
          { minQty: 1, maxQty: 10, discount: 0 },
          { minQty: 11, maxQty: 50, discount: 0.05 },
          { minQty: 51, maxQty: 100, discount: 0.10 },
          { minQty: 101, maxQty: null, discount: 0.15 }
        ];

        tiers.forEach((tier, idx) => {
          prices.push({
            id: `${priceBook.id}_${product.sku}_TIER${idx + 1}`,
            sku: product.sku,
            priceBookId: priceBook.id,
            amount: parseFloat((baseAmount * (1 - tier.discount)).toFixed(2)),
            currency: 'USD',
            uom: product.uom || 'EA',
            tier,
            effectiveDate: priceBook.effectiveDate,
            explicit: true
          });
        });
      }

      // Generate volume discounts for bulk items
      if (product.volumeDiscountEligible && priceBook.level === 1) {
        const volumes = [
          { qty: 100, discount: 0.05 },
          { qty: 500, discount: 0.10 },
          { qty: 1000, discount: 0.15 }
        ];

        volumes.forEach(vol => {
          prices.push({
            id: `${priceBook.id}_${product.sku}_VOL${vol.qty}`,
            sku: product.sku,
            priceBookId: priceBook.id,
            amount: parseFloat((baseAmount * (1 - vol.discount)).toFixed(2)),
            currency: 'USD',
            uom: product.uom || 'EA',
            volumeDiscount: vol,
            effectiveDate: priceBook.effectiveDate,
            explicit: true
          });
        });
      }
    });
  });

  return prices;
}

function generateBasePrice(product) {
  // Simple price generation based on product attributes
  const categoryMultipliers = {
    'Lumber': 50,
    'Hardware': 25,
    'Tools': 100,
    'Paint': 40,
    'Electrical': 30
  };

  const multiplier = categoryMultipliers[product.category] || 50;
  return Math.random() * multiplier + 10;
}

function validatePriceReferences(prices, products, priceBooks) {
  const errors = [];
  const validSKUs = new Set(products.map(p => p.sku));
  const validPriceBookIds = new Set(priceBooks.map(pb => pb.id));

  prices.forEach((price, idx) => {
    if (!validSKUs.has(price.sku)) {
      errors.push(`Price ${idx}: Invalid SKU ${price.sku}`);
    }
    if (!validPriceBookIds.has(price.priceBookId)) {
      errors.push(`Price ${idx}: Invalid price book ID ${price.priceBookId}`);
    }
  });

  return { valid: errors.length === 0, errors };
}

function main() {
  console.log('Generating hierarchical prices...');

  // Load dependencies
  const products = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/generated/all-products.json'), 'utf8')
  );
  const priceBooks = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/generated/price-books.json'), 'utf8')
  );

  const prices = generatePricesHierarchical(products, priceBooks);
  const validation = validatePriceReferences(prices, products, priceBooks);

  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    process.exit(1);
  }

  const outputPath = path.join(__dirname, '../data/generated/prices.json');
  fs.writeFileSync(outputPath, JSON.stringify(prices, null, 2));

  console.log(`✓ Generated ${prices.length} price entries`);
  console.log(`✓ Saved to ${outputPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { generatePricesHierarchical, validatePriceReferences, generateBasePrice };
```

#### 3. Create test files and run tests

- Implement test files as shown in RED phase
- Run tests: `npm test -- tests/unit/scripts/generate-price-books.test.js`
- Run tests: `npm test -- tests/unit/scripts/generate-prices-hierarchical.test.js`
- Verify all tests pass

### REFACTOR Phase (Improve Quality)

1. **Extract price calculation logic**
   - Create `utilities/price-calculator.js` for reusable pricing functions
   - Move regional adjustment logic to dedicated function
   - Move tier and volume discount calculations to utilities

2. **Improve validation**
   - Add comprehensive validation for price ranges (no negative prices)
   - Add validation for discount limits (max 25%)
   - Add logging for pricing decisions

3. **Enhance test coverage**
   - Add edge case tests for boundary conditions (0 quantity, max discount)
   - Add integration tests for full script execution
   - Verify price inheritance chains work correctly

4. **Code quality**
   - Add JSDoc comments for all functions
   - Ensure consistent error handling
   - Remove any console.log statements
   - Follow project style guide

## Expected Outcome

After completing this step:

- **12 price books generated** in 4-level hierarchy (Base → Regional → Tier → Promotional)
- **1,500+ prices created** covering all products across all price books
- **Regional adjustments working** (West lumber products +3% higher)
- **Tier pricing implemented** for eligible products with volume-based discounts
- **Volume discounts applied** to bulk-eligible products
- **Price inheritance validated** - child books correctly inherit or override parent prices
- **All references validated** - no orphaned prices, all SKUs and price books exist
- **Tests passing** - 100% of price generation and validation tests green

## Acceptance Criteria

- [ ] All tests passing for this step (price books + prices generation)
- [ ] `data/generated/price-books.json` contains exactly 12 price books
- [ ] Price book hierarchy validated: 4 levels, no circular references
- [ ] `data/generated/prices.json` contains at least 1,500 price entries
- [ ] All prices reference valid SKUs from `all-products.json`
- [ ] All prices reference valid price book IDs from `price-books.json`
- [ ] West region lumber prices are 3% higher than base prices
- [ ] Tier pricing decreases unit price as volume increases
- [ ] Volume discounts apply correctly (5%, 10%, 15% at thresholds)
- [ ] Price inheritance chains validated (children inherit from parents)
- [ ] Code follows project style guide (no console.log, proper error handling)
- [ ] Coverage ≥ 80% for new code

## Estimated Time

**4-6 hours**

- Price book generation: 1 hour
- Hierarchical price generation: 2 hours
- Regional adjustments and tier/volume logic: 1.5 hours
- Testing and validation: 1.5 hours
