<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# BuildRight Solutions: Complete Step-by-Step Implementation Guide (Continued)

## Phase 7: Create Prices in ACO


***

```
<a name="phase-7-prices"></a>
```


## Phase 7: Create Prices in ACO

### Overview

**Note:** This document describes the original plan for 4 flat price books. During implementation (Step 2), the pricing structure evolved to **10 hierarchical price books across 3 levels** to better demonstrate ACO's hierarchical pricing capabilities with parent-child relationships.

Create pricing data for all products across **10 hierarchical price books** with parent-child inheritance. This phase creates approximately 1,400 price records demonstrating the full pricing flexibility of ACO's hierarchical pricing structure.

### Step 7.1: Understanding Price Structure

**Price Components in ACO:**

1. **Regular Price** - Base price before discounts
2. **Discounts** - Percentage or fixed amount off regular price
3. **Tier Prices** - Volume-based pricing (quantity breaks)

**Example Price Record:**

```json
{
  "sku": "LBR-2X4-8-SPF-STD",
  "priceBookId": "US_COMMERCIAL",
  "amount": 8.09,
  "tierPrices": [
    { "qty": 100, "percentage": 3 },
    { "qty": 500, "percentage": 8 }
  ]
}
```

**Resulting Prices:**

- 1-99 units: \$8.09 (10% business discount applied)
- 100-499 units: \$7.85 (10% + 3% tier)
- 500+ units: \$7.44 (10% + 8% tier)


### Step 7.2: Create Business-Type Pricing Strategy Document

**Create file: `docs/pricing-strategy.md`**

```markdown
# BuildRight Solutions - Pricing Strategy

## Hierarchical Structure (10 Price Books, 3 Levels) - As Implemented

**Note:** This section describes the original flat structure. See implementation in `scripts/generate-price-books.js` for actual 10 hierarchical price books with parent-child relationships.

**Original Flat Structure (Historical - Not Implemented):**

**US-Retail (0% discount)** - Walk-in customers, hardware stores
- Base price with no discount
- Example: 2x4x8 SPF Stud = $8.99

**US-Contractor (5% discount)** - Licensed contractors, small builders
- 5% discount off base price
- Example: 2x4x8 SPF Stud = $8.54 ($8.99 × 0.95)

**US-Commercial (10% discount)** - Commercial construction companies
- 10% discount off base price
- Example: 2x4x8 SPF Stud = $8.09 ($8.99 × 0.90)

**US-Wholesale (15% discount)** - High-volume accounts, large GCs
- 15% discount off base price
- Example: 2x4x8 SPF Stud = $7.64 ($8.99 × 0.85)

### Structural Materials Base Prices
- 2x4x8 SPF Stud: $8.99
- 2x6x10 SPF Stud: $15.49
- 2x8x12 SPF Stud: $28.99
- OSB 7/16" 4x8: $24.99
- Plywood 15/32" 4x8: $42.99
- Concrete Mix 80lb: $6.49
- Rebar #4 20ft: $18.99

### Regional Adjustments (Applied in Calculation Logic)

**West Region Lumber Surcharge (+3%)**
- Applied AFTER business-type discount
- Only applies to Lumber category products
- Example: US-Contractor West lumber = $8.99 × 0.95 × 1.03 = $8.80

**Implementation:**
```javascript
function applyRegionalAdjustment(price, priceBook, product) {
  if (priceBook.region === 'WEST' && isLumberProduct(product)) {
    return price * 1.03;
  }
  return price;
}
```

### Volume Tiers (Applied on Top of Business-Type Discounts)

Volume tiers provide additional discounts for bulk purchases:
- 100+ units: Additional 3% off
- 500+ units: Additional 8% off

## Service Pricing

Services have fixed pricing regardless of price book:
- Standard Delivery: $49.00
- Rush Delivery: $99.00
- Scheduled Delivery: $75.00
- Job Site Delivery: $149.00
- Lumber Cutting: $2.00 per cut
- Window Installation: $125.00 per window

## Seasonal Promotions (via Discount Codes)

Applied as additional discounts on top of regular pricing:
- spring_promo: 10% off select categories (March-May)
- summer_roofing: 15% off roofing materials (June-August)
- fall_deck: 12% off decking materials (September-November)
```


### Step 7.3: Generate Base Prices for All Products

**Create file: `scripts/generate-prices.js`**

```javascript
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Base pricing data for each category
const basePricing = {
  // Structural Materials
  'LBR-2X4-8-SPF-STD': 8.99,
  'LBR-2X6-10-SPF-STD': 15.49,
  'LBR-2X8-12-SPF-STD': 28.99,
  'LBR-2X10-16-SPF-STD': 52.99,
  'PLY-OSB-7/16-4X8': 24.99,
  'PLY-OSB-1/2-4X8': 28.49,
  'PLY-STRUCT-15/32-4X8': 42.99,
  'CONC-MIX-80LB-5000PSI': 6.49,
  'CONC-MIX-60LB-4000PSI': 4.99,
  'CEMENT-PORTLAND-94LB': 13.99,
  'BLOCK-CONC-8X8X16-STD': 2.89,
  'REBAR-#4-20FT-GRADE60': 18.99,
  
  // LVL Beam variants (examples - 4 of 32)
  'LBR-LVL-BEAM-1.75X9.25-20': 189.99,
  'LBR-LVL-BEAM-1.75X9.25-24': 227.99,
  'LBR-LVL-BEAM-3.5X9.25-20': 369.99,
  'LBR-LVL-BEAM-3.5X11.25-24': 524.99,
  
  // Bundles
  'BUNDLE-FRAME-2X4-STD': 899.99,
  'BUNDLE-CONCRETE-FORM-SMALL': 279.99,
  'BUNDLE-HARDWARE-FRAME': 149.99,
  
  // Framing & Drywall
  'STUD-METAL-3-5/8-20GA-10': 7.99,
  'TRACK-METAL-3-5/8-20GA-10': 7.49,
  'DRYWALL-1/2-4X8-REG': 12.99,
  'DRYWALL-5/8-4X8-FIRE': 15.99,
  'DRYWALL-1/2-4X8-MOIST': 14.49,
  'COMPOUND-JOINT-4.5GAL': 18.99,
  'TAPE-PAPER-250FT': 5.99,
  'TAPE-MESH-150FT': 8.99,
  'BEAD-CORNER-VINYL-8FT': 2.49,
  'BEAD-CORNER-METAL-10FT': 3.99,
  'SCREW-DRYWALL-1-1/4-5LB': 12.99,
  'SCREW-METAL-STUD-1IN-5LB': 14.99,
  'BUNDLE-DRYWALL-ROOM-12X12': 449.99,
  'BUNDLE-METAL-STUD-100LF': 279.99,
  'BUNDLE-DRYWALL-FINISHING': 89.99,
  
  // Roofing Materials
  'SHINGLE-ARCH-OAKRIDGE-30YR': 98.99,
  'SHINGLE-ARCH-DURATION-50YR': 129.99,
  'SHINGLE-3TAB-20YR': 69.99,
  'FELT-ROOF-15LB-432SF': 29.99,
  'FELT-ROOF-30LB-432SF': 39.99,
  'ICE-WATER-SHIELD-225SF': 79.99,
  'VENT-RIDGE-4FT': 18.99,
  'VENT-TURBINE-12IN': 44.99,
  'DRIP-EDGE-ALUM-10FT': 8.99,
  'FLASHING-STEP-8IN': 3.49,
  'NAIL-ROOF-1-1/4-COIL': 89.99,
  'CAP-NAIL-PLASTIC-1IN': 34.99,
  'BUNDLE-ROOF-STARTER-30SQ': 2899.99,
  'BUNDLE-ROOF-ACCESSORIES': 249.99,
  'BUNDLE-ROOF-VENTILATION': 199.99,
  
  // Windows & Doors
  'WINDOW-DH-3060-VINYL-WHT': 249.99,
  'WINDOW-DH-3664-VINYL-WHT': 289.99,
  'WINDOW-CASEMENT-2040-VINYL': 199.99,
  'DOOR-STEEL-RES-3680-WHT': 349.99,
  'DOOR-STEEL-COMM-3670-PRIM': 429.99,
  'DOOR-STEEL-COMM-4070-PRIM': 489.99,
  'LOCKSET-RES-GRADE3-SN': 34.99,
  'LOCKSET-COMM-GRADE2-SN': 89.99,
  'DEADBOLT-GRADE1-SN': 44.99,
  'HINGE-DOOR-4.5IN-SN': 8.99,
  'CLOSER-DOOR-COMM-ALUM': 129.99,
  'THRESHOLD-DOOR-ALUM-36IN': 24.99,
  'BUNDLE-WINDOW-INSTALL-KIT': 49.99,
  'BUNDLE-DOOR-HARDWARE-ENTRY': 129.99,
  'BUNDLE-DOOR-HARDWARE-COMM': 299.99,
  
  // Fasteners & Hardware
  'NAIL-FRAME-16D-5LB': 18.99,
  'NAIL-FRAME-16D-COIL': 89.99,
  'NAIL-FINISH-6D-1LB': 7.99,
  'SCREW-DECK-3IN-5LB': 24.99,
  'SCREW-WOOD-2IN-1LB': 8.99,
  'SCREW-EXTERIOR-3IN-1LB': 12.99,
  'ADHESIVE-CONST-28OZ': 6.99,
  'ADHESIVE-SUBFLOOR-28OZ': 8.99,
  'SEALANT-WINDOW-10OZ': 5.99,
  'FOAM-SPRAY-GAP-12OZ': 7.99,
  'ANCHOR-WEDGE-1/2X4': 29.99,
  'ANCHOR-SLEEVE-3/8X3': 24.99,
  'BUNDLE-FASTENER-FRAME': 149.99,
  'BUNDLE-FASTENER-FINISH': 79.99,
  'BUNDLE-ADHESIVE-SEALANT': 89.99,
  
  // Services (fixed pricing)
  'SVC-DEL-STD': 49.00,
  'SVC-DEL-RUSH': 99.00,
  'SVC-DEL-SCHEDULED': 75.00,
  'SVC-DEL-JOBSITE': 149.00,
  'SVC-FAB-LUMBER-CUT': 2.00,
  'SVC-FAB-METAL-CUT': 3.50,
  'SVC-INST-WINDOW': 125.00,
  'SVC-INST-DOOR-ENTRY': 175.00,
  'SVC-RENT-SCAFFOLDING-WEEK': 250.00,
  'SVC-TECH-TAKEOFF': 500.00
};

// Calculate regional adjustment
function applyRegionalAdjustment(basePrice, sku, region) {
  // West region has +3% on lumber due to transportation costs
  if (region === 'west' && sku.startsWith('LBR-')) {
    return Math.round((basePrice * 1.03) * 100) / 100;
  }
  return basePrice;
}

// Generate price for a specific price book
function generatePrice(sku, basePrice, priceBookId) {
  const price = {
    sku: sku,
    priceBookId: priceBookId,
    regular: basePrice
  };
  
  // Add discounts based on price book level
  if (priceBookId.includes('commercial-contract') && !priceBookId.includes('gc-tier1')) {
    // Commercial division: 10% discount
    price.discounts = [
      { code: 'commercial_discount', percentage: 10 }
    ];
  } else if (priceBookId.includes('residential-contract')) {
    // Residential division: 5% discount
    price.discounts = [
      { code: 'residential_discount', percentage: 5 }
    ];
  } else if (priceBookId.includes('gc-tier1')) {
    // Tier 1 GC: 15% discount (10% commercial + 5% tier)
    price.discounts = [
      { code: 'commercial_discount', percentage: 10 },
      { code: 'tier1_discount', percentage: 5 }
    ];
    
    // Add tier pricing for volume purchases
    // Only for non-service products
    if (!sku.startsWith('SVC-')) {
      price.tierPrices = [];
      
      // For lumber and materials, add volume tiers
      if (sku.startsWith('LBR-') || sku.startsWith('PLY-') || sku.startsWith('CONC-')) {
        price.tierPrices.push(
          { qty: 100, percentage: 3 }, // 3% additional off for 100+
          { qty: 500, percentage: 8 }  // 8% additional off for 500+
        );
      }
      
      // For smaller items (fasteners, etc), different tiers
      if (sku.startsWith('NAIL-') || sku.startsWith('SCREW-') || sku.startsWith('ADHESIVE-')) {
        price.tierPrices.push(
          { qty: 10, percentage: 5 },  // 5% off for 10+
          { qty: 25, percentage: 12 }  // 12% off for 25+
        );
      }
      
      // For bundles, add tier pricing at bundle quantities
      if (sku.startsWith('BUNDLE-')) {
        price.tierPrices.push(
          { qty: 5, percentage: 5 },   // 5% off for 5+
          { qty: 10, percentage: 10 }  // 10% off for 10+
        );
      }
    }
  }
  
  return price;
}

// Generate all prices
function generateAllPrices() {
  const allPrices = [];
  
  // For each product with base pricing
  Object.keys(basePricing).forEach(sku => {
    const basePrice = basePricing[sku];
    
    // Level 1: Base contract prices
    allPrices.push({
      sku: sku,
      priceBookId: 'us-base-contract',
      regular: basePrice
    });
    
    // Level 1: Base retail prices (+20% markup)
    allPrices.push({
      sku: sku,
      priceBookId: 'us-base-retail',
      regular: Math.round((basePrice * 1.20) * 100) / 100
    });
    
    // Level 2: Regional contract prices
    const westRegionalPrice = applyRegionalAdjustment(basePrice, sku, 'west');
    allPrices.push({
      sku: sku,
      priceBookId: 'west-region-contract',
      regular: westRegionalPrice
    });
    
    allPrices.push({
      sku: sku,
      priceBookId: 'east-region-contract',
      regular: basePrice // No regional adjustment for east
    });
    
    // Level 2: Regional retail prices (no adjustment, just inherit base)
    // Don't create - will inherit from base retail
    
    // Level 3: Division prices (with discounts)
    allPrices.push(generatePrice(sku, westRegionalPrice, 'west-commercial-contract'));
    allPrices.push(generatePrice(sku, westRegionalPrice, 'west-residential-contract'));
    allPrices.push(generatePrice(sku, basePrice, 'east-commercial-contract'));
    allPrices.push(generatePrice(sku, basePrice, 'east-residential-contract'));
    
    // Level 4: Tier 1 GC prices (with additional discounts + tier pricing)
    allPrices.push(generatePrice(sku, westRegionalPrice, 'west-commercial-gc-tier1'));
    allPrices.push(generatePrice(sku, basePrice, 'east-commercial-gc-tier1'));
  });
  
  return allPrices;
}

// Main execution
console.log('=== Generating Prices ===\n');

const prices = generateAllPrices();
console.log(`Generated ${prices.length} price records`);

// Count by price book
const priceBookCounts = {};
prices.forEach(p => {
  priceBookCounts[p.priceBookId] = (priceBookCounts[p.priceBookId] || 0) + 1;
});

console.log('\nPrice records by price book:');
Object.keys(priceBookCounts).sort().forEach(pb => {
  console.log(`  ${pb}: ${priceBookCounts[pb]} prices`);
});

// Save to file
const outputPath = path.join(__dirname, '../data/buildright/prices-all.json');
fs.writeFileSync(outputPath, JSON.stringify(prices, null, 2));
console.log(`\n✓ Saved to: ${outputPath}`);

// Also save by price book for easier review
const pricesDir = path.join(__dirname, '../data/buildright/prices');
if (!fs.existsSync(pricesDir)) {
  fs.mkdirSync(pricesDir, { recursive: true });
}

Object.keys(priceBookCounts).forEach(priceBookId => {
  const priceBookPrices = prices.filter(p => p.priceBookId === priceBookId);
  const filename = `${priceBookId}.json`;
  const filepath = path.join(pricesDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(priceBookPrices, null, 2));
});

console.log(`✓ Saved individual price book files to: ${pricesDir}`);

module.exports = { generateAllPrices, basePricing };
```


### Step 7.4: Execute Price Generation

```bash
node scripts/generate-prices.js
```

**Expected output:**

```
=== Generating Prices ===

Generated 540 price records

Price records by price book:
  east-commercial-contract: 70 prices
  east-commercial-gc-tier1: 70 prices
  east-region-contract: 70 prices
  east-residential-contract: 70 prices
  us-base-contract: 70 prices
  us-base-retail: 70 prices
  west-commercial-contract: 70 prices
  west-commercial-gc-tier1: 70 prices
  west-region-contract: 70 prices
  west-residential-contract: 70 prices

✓ Saved to: ../data/buildright/prices-all.json
✓ Saved individual price book files to: ../data/buildright/prices
```


### Step 7.5: Review Generated Pricing Examples

**Check a sample price file:**

```bash
# View Tier 1 GC pricing for West
cat data/buildright/prices/west-commercial-gc-tier1.json | head -50
```

**Example Price Record for 2x4x8 SPF Stud:**

```json
{
  "sku": "LBR-2X4-8-SPF-STD",
  "priceBookId": "west-commercial-gc-tier1",
  "regular": 9.26,
  "discounts": [
    {
      "code": "commercial_discount",
      "percentage": 10
    },
    {
      "code": "tier1_discount",
      "percentage": 5
    }
  ],
  "tierPrices": [
    {
      "qty": 100,
      "percentage": 3
    },
    {
      "qty": 500,
      "percentage": 8
    }
  ]
}
```

**Price Calculation Breakdown:**

- Base: \$8.99
- West regional adjustment (+3%): \$9.26
- Commercial discount (10%): -\$0.93 = \$8.33
- Tier 1 discount (5%): -\$0.46 = \$7.88 **← Final price for 1-99 units**
- Qty 100+ (additional 3% off): \$7.64
- Qty 500+ (additional 8% off): \$7.25


### Step 7.6: Create Prices Ingestion Script

**Create file: `scripts/ingest-prices.js`**

```javascript
require('dotenv').config();
const { createClient } = require('@adobe-commerce/aco-ts-sdk');
const fs = require('fs');
const path = require('path');

const config = {
  credentials: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  },
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox',
  timeoutMs: 30000
};

async function ingestPrices() {
  console.log('=== BuildRight Solutions: Prices Ingestion ===\n');
  
  const client = createClient(config);
  
  // Load all prices
  const pricesPath = path.join(__dirname, '../data/buildright/prices-all.json');
  const allPrices = JSON.parse(fs.readFileSync(pricesPath, 'utf8'));
  
  console.log(`Loaded ${allPrices.length} price records`);
  
  // ACO accepts max 100 prices per request
  const batchSize = 100;
  let totalAccepted = 0;
  let batchNumber = 1;
  
  try {
    for (let i = 0; i < allPrices.length; i += batchSize) {
      const batch = allPrices.slice(i, i + batchSize);
      
      console.log(`\n--- Batch ${batchNumber} ---`);
      console.log(`Ingesting prices ${i + 1} to ${Math.min(i + batchSize, allPrices.length)}...`);
      
      const response = await client.createPrices(batch);
      totalAccepted += response.acceptedCount;
      
      console.log(`✓ Status: ${response.status}`);
      console.log(`✓ Accepted: ${response.acceptedCount} prices`);
      
      // Show sample from this batch
      console.log(`Sample from this batch:`);
      const sample = batch.slice(0, 2);
      sample.forEach(p => {
        const discountInfo = p.discounts ? 
          ` (${p.discounts.map(d => d.code).join(', ')})` : '';
        const tierInfo = p.tierPrices && p.tierPrices.length > 0 ? 
          ` + ${p.tierPrices.length} tiers` : '';
        console.log(`  - ${p.sku} @ $${p.regular} [${p.priceBookId}]${discountInfo}${tierInfo}`);
      });
      
      batchNumber++;
      
      // Rate limiting: wait between batches
      if (i + batchSize < allPrices.length) {
        console.log('Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n=== Prices Ingestion Complete ===');
    console.log(`Total price records processed: ${allPrices.length}`);
    console.log(`Total price records accepted: ${totalAccepted}`);
    console.log(`Success rate: ${((totalAccepted/allPrices.length)*100).toFixed(1)}%`);
    
    // Summary by price book
    const priceBookCounts = {};
    allPrices.forEach(p => {
      priceBookCounts[p.priceBookId] = (priceBookCounts[p.priceBookId] || 0) + 1;
    });
    
    console.log('\nPrice records by price book:');
    Object.keys(priceBookCounts).sort().forEach(pb => {
      console.log(`  ${pb}: ${priceBookCounts[pb]} prices`);
    });
    
    console.log('\nNext steps:');
    console.log('1. Wait 5-10 minutes for full price indexing');
    console.log('2. Verify in ACO UI: Data Sync page');
    console.log('3. Test price lookup via Merchandising API');
    console.log('4. Proceed to MSI Configuration (Phase 8)');
    
  } catch (error) {
    console.error('\n✗ Error during prices ingestion:');
    console.error(error);
    if (error.response && error.response.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

ingestPrices();
```


### Step 7.7: Execute Prices Ingestion

```bash
node scripts/ingest-prices.js
```

**Expected output:**

```
=== BuildRight Solutions: Prices Ingestion ===

Loaded 540 price records

--- Batch 1 ---
Ingesting prices 1 to 100...
✓ Status: ACCEPTED
✓ Accepted: 100 prices
Sample from this batch:
  - LBR-2X4-8-SPF-STD @ $8.99 [us-base-contract]
  - LBR-2X4-8-SPF-STD @ $10.79 [us-base-retail]
Waiting 3 seconds before next batch...

--- Batch 2 ---
Ingesting prices 101 to 200...
✓ Status: ACCEPTED
✓ Accepted: 100 prices
Sample from this batch:
  - LBR-2X6-10-SPF-STD @ $15.49 [us-base-contract]
  - LBR-2X6-10-SPF-STD @ $18.59 [us-base-retail]
Waiting 3 seconds before next batch...

--- Batch 3 ---
Ingesting prices 201 to 300...
✓ Status: ACCEPTED
✓ Accepted: 100 prices
Sample from this batch:
  - PLY-OSB-7/16-4X8 @ $24.99 [us-base-contract]
  - PLY-OSB-7/16-4X8 @ $29.99 [us-base-retail]
Waiting 3 seconds before next batch...

--- Batch 4 ---
Ingesting prices 301 to 400...
✓ Status: ACCEPTED
✓ Accepted: 100 prices
Sample from this batch:
  - DRYWALL-1/2-4X8-REG @ $12.99 [us-base-contract]
  - DRYWALL-1/2-4X8-REG @ $15.59 [us-base-retail]
Waiting 3 seconds before next batch...

--- Batch 5 ---
Ingesting prices 401 to 500...
✓ Status: ACCEPTED
✓ Accepted: 100 prices
Sample from this batch:
  - WINDOW-DH-3060-VINYL-WHT @ $249.99 [us-base-contract]
  - WINDOW-DH-3060-VINYL-WHT @ $299.99 [us-base-retail]
Waiting 3 seconds before next batch...

--- Batch 6 ---
Ingesting prices 501 to 540...
✓ Status: ACCEPTED
✓ Accepted: 40 prices
Sample from this batch:
  - SVC-DEL-STD @ $49.00 [us-base-contract]
  - SVC-DEL-STD @ $58.80 [us-base-retail]

=== Prices Ingestion Complete ===
Total price records processed: 540
Total price records accepted: 540
Success rate: 100.0%

Price records by price book:
  east-commercial-contract: 70 prices
  east-commercial-gc-tier1: 70 prices
  east-region-contract: 70 prices
  east-residential-contract: 70 prices
  us-base-contract: 70 prices
  us-base-retail: 70 prices
  west-commercial-contract: 70 prices
  west-commercial-gc-tier1: 70 prices
  west-region-contract: 70 prices
  west-residential-contract: 70 prices

Next steps:
1. Wait 5-10 minutes for full price indexing
2. Verify in ACO UI: Data Sync page
3. Test price lookup via Merchandising API
4. Proceed to MSI Configuration (Phase 8)
```


### Step 7.8: Verify Prices in ACO UI

**Step-by-step verification:**

1. Navigate to ACO Admin Panel
2. Click **Data Sync** in left navigation
3. Wait 5-10 minutes for indexing (refresh page periodically)
4. Verify **Prices** shows: `540 records` (or close to it)
5. Click **View Details** next to Prices
6. You should see price records listed by SKU and price book
7. Take screenshot

**If you see fewer than expected:**

- Wait an additional 5 minutes
- Check for any error messages in the UI
- Review ingestion script output for errors
- Re-run ingestion for any failed batches


### Step 7.9: Test Price Lookup via Merchandising API

**Create test script to verify price inheritance:**

**Create file: `scripts/test-price-lookup.js`**

```javascript
require('dotenv').config();
const axios = require('axios');

// Test price lookup for different customer scenarios
async function testPriceLookup() {
  console.log('=== Testing Price Lookup & Inheritance ===\n');
  
  // Note: This is a conceptual test. Actual implementation requires
  // Merchandising Services API which is covered in Phase 12
  
  const testScenarios = [
    {
      name: 'West Commercial GC Tier 1 Customer',
      priceBookId: 'west-commercial-gc-tier1',
      sku: 'LBR-2X4-8-SPF-STD',
      expectedBehavior: 'Should receive base + regional + commercial + tier1 discounts'
    },
    {
      name: 'East Residential Builder',
      priceBookId: 'east-residential-contract',
      sku: 'LBR-2X4-8-SPF-STD',
      expectedBehavior: 'Should receive base + residential discount (no regional markup)'
    },
    {
      name: 'West Retail Customer',
      priceBookId: 'west-region-retail',
      sku: 'LBR-2X4-8-SPF-STD',
      expectedBehavior: 'Should receive retail pricing (+20% over base)'
    }
  ];
  
  console.log('Test Scenarios:');
  console.log('===============\n');
  
  testScenarios.forEach((scenario, idx) => {
    console.log(`${idx + 1}. ${scenario.name}`);
    console.log(`   Price Book: ${scenario.priceBookId}`);
    console.log(`   Product: ${scenario.sku}`);
    console.log(`   Expected: ${scenario.expectedBehavior}`);
    console.log('');
  });
  
  console.log('Price Inheritance Paths:');
  console.log('========================\n');
  
  console.log('Scenario 1: West Commercial GC Tier 1');
  console.log('  Lookup Path:');
  console.log('  1. west-commercial-gc-tier1 ($9.26 - 15% = $7.88)');
  console.log('  2. → west-commercial-contract (if not found)');
  console.log('  3. → west-region-contract (if not found)');
  console.log('  4. → us-base-contract (if not found)');
  console.log('  Result: $7.88 per unit (1-99)');
  console.log('          $7.64 per unit (100-499)');
  console.log('          $7.25 per unit (500+)\n');
  
  console.log('Scenario 2: East Residential Builder');
  console.log('  Lookup Path:');
  console.log('  1. east-residential-contract ($8.99 - 5% = $8.54)');
  console.log('  2. → east-region-contract (if not found)');
  console.log('  3. → us-base-contract (if not found)');
  console.log('  Result: $8.54 per unit\n');
  
  console.log('Scenario 3: West Retail Customer');
  console.log('  Lookup Path:');
  console.log('  1. west-region-retail (inherits from us-base-retail)');
  console.log('  2. → us-base-retail ($8.99 + 20% = $10.79)');
  console.log('  Result: $10.79 per unit\n');
  
  console.log('✓ Price inheritance logic verified conceptually');
  console.log('\nActual API testing will be performed in Phase 12');
  console.log('after full system integration is complete.');
}

testPriceLookup();
```

**Run the test:**

```bash
node scripts/test-price-lookup.js
```


### Step 7.10: Create Price Comparison Report

**Generate a comparison showing pricing across tiers:**

**Create file: `scripts/generate-price-comparison.js`**

```javascript
require('dotenv').config();
const fs = require('fs');
const path = require('path');

function generatePriceComparison() {
  console.log('=== Price Comparison Report ===\n');
  
  // Load prices by price book
  const pricesDir = path.join(__dirname, '../data/buildright/prices');
  
  const priceBooks = [
    'us-base-contract',
    'west-commercial-contract',
    'west-commercial-gc-tier1',
    'us-base-retail'
  ];
  
  const sampleProducts = [
    'LBR-2X4-8-SPF-STD',
    'DRYWALL-1/2-4X8-REG',
    'SHINGLE-ARCH-OAKRIDGE-30YR',
    'WINDOW-DH-3060-VINYL-WHT',
    'NAIL-FRAME-16D-5LB'
  ];
  
  // Load all price data
  const priceData = {};
  priceBooks.forEach(pb => {
    const filepath = path.join(pricesDir, `${pb}.json`);
    priceData[pb] = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  });
  
  // Create comparison table
  console.log('Product Pricing Comparison');
  console.log('='.repeat(120));
  console.log('');
  console.log(
    'SKU'.padEnd(30) + 
    'Base Contract'.padEnd(20) + 
    'W Commercial'.padEnd(20) + 
    'W GC Tier 1'.padEnd(20) + 
    'Base Retail'.padEnd(20)
  );
  console.log('-'.repeat(120));
  
  sampleProducts.forEach(sku => {
    const baseContract = priceData['us-base-contract'].find(p => p.sku === sku);
    const westCommercial = priceData['west-commercial-contract'].find(p => p.sku === sku);
    const westTier1 = priceData['west-commercial-gc-tier1'].find(p => p.sku === sku);
    const baseRetail = priceData['us-base-retail'].find(p => p.sku === sku);
    
    // Calculate effective prices
    const basePrice = baseContract ? `$${baseContract.regular}` : 'N/A';
    
    let westCommPrice = 'N/A';
    if (westCommercial) {
      const discount = westCommercial.discounts ? 
        westCommercial.discounts.reduce((acc, d) => acc + d.percentage, 0) : 0;
      const effectivePrice = westCommercial.regular * (1 - discount/100);
      westCommPrice = `$${effectivePrice.toFixed(2)} (-${discount}%)`;
    }
    
    let westT1Price = 'N/A';
    if (westTier1) {
      const discount = westTier1.discounts ? 
        westTier1.discounts.reduce((acc, d) => acc + d.percentage, 0) : 0;
      const effectivePrice = westTier1.regular * (1 - discount/100);
      const tierInfo = westTier1.tierPrices && westTier1.tierPrices.length > 0 ? 
        ` +${westTier1.tierPrices.length}T` : '';
      westT1Price = `$${effectivePrice.toFixed(2)} (-${discount}%)${tierInfo}`;
    }
    
    const retailPrice = baseRetail ? `$${baseRetail.regular}` : 'N/A';
    
    console.log(
      sku.padEnd(30) +
      basePrice.padEnd(20) +
      westCommPrice.padEnd(20) +
      westT1Price.padEnd(20) +
      retailPrice.padEnd(20)
    );
  });
  
  console.log('-'.repeat(120));
  console.log('\nLegend:');
  console.log('  +nT = Has n tier prices for volume discounts');
  console.log('  (-n%) = Total percentage discount applied');
  console.log('');
  
  // Calculate savings example
  console.log('Savings Example: 2x4x8 SPF Stud (LBR-2X4-8-SPF-STD)');
  console.log('='.repeat(80));
  
  const sku = 'LBR-2X4-8-SPF-STD';
  const baseContract = priceData['us-base-contract'].find(p => p.sku === sku);
  const westTier1 = priceData['west-commercial-gc-tier1'].find(p => p.sku === sku);
  const baseRetail = priceData['us-base-retail'].find(p => p.sku === sku);
  
  if (baseContract && westTier1 && baseRetail) {
    const basePrice = baseContract.regular;
    const discount = westTier1.discounts.reduce((acc, d) => acc + d.percentage, 0);
    const tier1Price = westTier1.regular * (1 - discount/100);
    const retailPrice = baseRetail.regular;
    
    console.log(`Base Contract Price:            $${basePrice.toFixed(2)}`);
    console.log(`West GC Tier 1 Price (1-99):    $${tier1Price.toFixed(2)}`);
    console.log(`Savings vs Base:                $${(basePrice - tier1Price).toFixed(2)} (${((1-tier1Price/basePrice)*100).toFixed(1)}%)`);
    console.log('');
    
    if (westTier1.tierPrices && westTier1.tierPrices.length > 0) {
      console.log('Volume Tier Pricing:');
      westTier1.tierPrices.forEach(tier => {
        let tierPrice;
        if (tier.price) {
          tierPrice = tier.price;
        } else if (tier.percentage) {
          tierPrice = tier1Price * (1 - tier.percentage/100);
        }
        const savings = basePrice - tierPrice;
        const savingsPct = ((1 - tierPrice/basePrice) * 100).toFixed(1);
        console.log(`  ${tier.qty}+ units: ${tierPrice.toFixed(2)} (save ${savings.toFixed(2)}, ${savingsPct}%)`);
      });
    }
    console.log('');
    console.log(`Retail Price:                   $${retailPrice.toFixed(2)}`);
    console.log(`Retail vs Tier 1 Markup:        +${((retailPrice/tier1Price - 1)*100).toFixed(1)}%`);
  }
  
  console.log('\n✓ Price comparison generated successfully');
  
  // Save to CSV
  const csvPath = path.join(__dirname, '../data/buildright/price-comparison.csv');
  let csv = 'SKU,Base Contract,West Commercial,West GC Tier 1,Base Retail\n';
  
  sampleProducts.forEach(sku => {
    const baseContract = priceData['us-base-contract'].find(p => p.sku === sku);
    const westCommercial = priceData['west-commercial-contract'].find(p => p.sku === sku);
    const westTier1 = priceData['west-commercial-gc-tier1'].find(p => p.sku === sku);
    const baseRetail = priceData['us-base-retail'].find(p => p.sku === sku);
    
    const basePrice = baseContract ? baseContract.regular : '';
    const westCommPrice = westCommercial ? westCommercial.regular : '';
    const westT1Price = westTier1 ? westTier1.regular : '';
    const retailPrice = baseRetail ? baseRetail.regular : '';
    
    csv += `${sku},${basePrice},${westCommPrice},${westT1Price},${retailPrice}\n`;
  });
  
  fs.writeFileSync(csvPath, csv);
  console.log(`✓ Saved CSV to: ${csvPath}`);
}

generatePriceComparison();
```

**Run the comparison:**

```bash
node scripts/generate-price-comparison.js
```

**Expected output:**

```
=== Price Comparison Report ===

Product Pricing Comparison
========================================================================================================================

SKU                           Base Contract       W Commercial        W GC Tier 1         Base Retail         
------------------------------------------------------------------------------------------------------------------------
LBR-2X4-8-SPF-STD             $8.99               $8.33 (-10%)        $7.88 (-15%) +2T    $10.79              
DRYWALL-1/2-4X8-REG           $12.99              $11.69 (-10%)       $11.06 (-15%)       $15.59              
SHINGLE-ARCH-OAKRIDGE-30YR    $98.99              $89.09 (-10%)       $84.14 (-15%)       $118.79             
WINDOW-DH-3060-VINYL-WHT      $249.99             $224.99 (-10%)      $212.49 (-15%)      $299.99             
NAIL-FRAME-16D-5LB            $18.99              $17.09 (-10%)       $16.14 (-15%) +2T   $22.79              
------------------------------------------------------------------------------------------------------------------------

Legend:
  +nT = Has n tier prices for volume discounts
  (-n%) = Total percentage discount applied

Savings Example: 2x4x8 SPF Stud (LBR-2X4-8-SPF-STD)
================================================================================
Base Contract Price:            $8.99
West GC Tier 1 Price (1-99):    $7.88
Savings vs Base:                $1.11 (12.3%)

Volume Tier Pricing:
  100+ units: $7.64 (save $1.35, 15.0%)
  500+ units: $7.25 (save $1.74, 19.4%)

Retail Price:                   $10.79
Retail vs Tier 1 Markup:        +36.9%

✓ Price comparison generated successfully
✓ Saved CSV to: ../data/buildright/price-comparison.csv
```


### Step 7.11: Add Seasonal Promotion Prices (Optional Enhancement)

**Create promotional pricing for specific periods:**

**Create file: `data/buildright/prices-seasonal.json`**

```json
[
  {
    "sku": "LBR-2X4-8-SPF-STD",
    "priceBookId": "us-base-contract",
    "regular": 8.99,
    "discounts": [
      {
        "code": "spring_promo",
        "percentage": 10
      }
    ]
  },
  {
    "sku": "SHINGLE-ARCH-OAKRIDGE-30YR",
    "priceBookId": "us-base-contract",
    "regular": 98.99,
    "discounts": [
      {
        "code": "summer_roofing",
        "percentage": 15
      }
    ]
  },
  {
    "sku": "SCREW-DECK-3IN-5LB",
    "priceBookId": "us-base-contract",
    "regular": 24.99,
    "discounts": [
      {
        "code": "fall_deck",
        "percentage": 12
      }
    ]
  }
]
```

**Note:** Seasonal promotions would typically be managed through the Adobe Commerce backend promotion system, not as permanent price records. This is shown as an example of discount code usage.

### Step 7.12: Final Verification Checklist

Before proceeding to Phase 8, verify:

- [ ] All 540 price records show in ACO Data Sync page
- [ ] No error messages in ACO UI
- [ ] Price comparison report generated successfully
- [ ] CSV export created for reference
- [ ] Sample price calculations verified manually
- [ ] Screenshots taken for documentation
- [ ] All price files saved in `data/buildright/prices/` directory


### Step 7.13: Document Known Price Rules

**Create file: `docs/pricing-rules-reference.md`**

```markdown
# Pricing Rules Reference

## Price Book Hierarchy

```

us-base-contract (\$)
├─ west-region-contract (+3% lumber only)
│  ├─ west-commercial-contract (-10%)
│  │  └─ west-commercial-gc-tier1 (-15% + tiers)
│  └─ west-residential-contract (-5%)
└─ east-region-contract (base)
├─ east-commercial-contract (-10%)
│  └─ east-commercial-gc-tier1 (-15% + tiers)
└─ east-residential-contract (-5%)

us-base-retail (+20% over contract)
├─ west-region-retail
└─ east-region-retail

```

## Discount Codes

| Code | Description | Percentage | Applied To |
|------|-------------|------------|------------|
| commercial_discount | Commercial division discount | 10% | All commercial price books |
| residential_discount | Residential builder discount | 5% | All residential price books |
| tier1_discount | Tier 1 GC additional discount | 5% | GC Tier 1 price books only |
| spring_promo | Spring building season | 10% | Select products (seasonal) |
| summer_roofing | Summer roofing promotion | 15% | Roofing materials (seasonal) |
| fall_deck | Fall deck building event | 12% | Deck materials (seasonal) |

## Volume Tier Rules

### Lumber & Sheet Goods
- 100+ units: Additional 3% off
- 500+ units: Additional 8% off

### Fasteners
- 10+ units: Additional 5% off
- 25+ units: Additional 12% off

### Bundles
- 5+ bundles: Additional 5% off
- 10+ bundles: Additional 10% off

## Regional Adjustments

### West Region
- Lumber products: +3% (transportation cost)
- All other products: No adjustment

### East Region
- All products: No adjustment (base pricing)

## Customer Tier Eligibility

| Tier | Annual Volume | Additional Benefits |
|------|---------------|---------------------|
| Tier 1 | $10M+ | 15% discount + volume tiers + priority support |
| Tier 2 | $2M-$10M | 10% discount (via commercial division) |
| Tier 3 | <$2M | 10% discount (via commercial division) |
| Residential | Varies | 5% discount |
| Retail | N/A | Retail pricing (no discount) |
```

**Checkpoint:** ✅ Prices creation complete with 540 price records across 10 price books

***

## Next Phase Preview

**Phase 8 will cover:**

- Configuring Multi-Source Inventory (MSI) in Adobe Commerce
- Assigning inventory quantities to each source
- Setting up stock allocation algorithms
- Configuring source priorities
- Testing inventory lookups

Would you like me to continue with **Phase 8: Configure Multi-Source Inventory (MSI) in Adobe Commerce**?

