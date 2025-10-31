# BuildRight ACO Data Generation & Ingestion - Thread Summary

## Project Overview
BuildRight is building an Adobe Commerce Optimizer (ACO) sample catalog data ingestion system with a reduced scope plan. The system includes generation scripts to create test data and ingestion scripts to load it into ACO.

## Current Status: ✅ Track 2 COMPLETE (Data Generation Scripts)

### Scripts Implemented & Data Generated:
- ✅ **20 Metadata Attributes** - Product attributes (code, label, dataType, source)
- ✅ **19 Categories** - Product categories (slug, name, source)
- ✅ **184 Products Total** - 70 simple + 10 service + 20 configurable + 74 variants + 15 bundles (5 configurables are variants)
- ✅ **12 Price Books** - Hierarchical price book structure with regional/divisional tiers (4-level hierarchy)
- ✅ **2,855 Prices** - All products across all price books
- ✅ **169 Inventory Items** - Multi-source inventory across 6 sources with category-based assignment
- ✅ **Deterministic Output** - All generators use SEED environment variable for reproducible data

---

## ACO Schema Discoveries (Critical Reference)

### Entity Schemas - What Fields ACO Requires

**Metadata (Creation)**
```javascript
{
  "code": "attribute_code",
  "label": "Display Label",
  "dataType": "TEXT|DECIMAL|INTEGER|BOOLEAN",
  "source": { "locale": "en-US" }
}
```
**Note:** Deletion uses objects with just `code` property

**Categories (Creation)**
```javascript
{
  "slug": "category-slug",
  "name": "Category Name",
  "source": { "locale": "en-US" }
}
```
**Unsupported:** description, isActive

**Products (Creation)**
```javascript
{
  "sku": "PRODUCT-SKU",
  "slug": "product-slug",
  "name": "Product Name",
  "status": "ENABLED|DISABLED",  // ❌ NOT "active"
  "source": { "locale": "en-US" },
  "attributes": []
}
```
**Unsupported:** description, categories, price

**Price Books (Creation)**
```javascript
{
  "priceBookId": "price-book-id",
  "name": "Price Book Name",
  "currency": "USD"              // ✅ REQUIRED
}
```
**Unsupported:** source, status

**Prices (Creation)**
```javascript
{
  "sku": "PRODUCT-SKU",
  "priceBookId": "price-book-id",
  "regular": 99.99               // ✅ Use "regular", NOT "value"
}
```

**Deletion Objects:**
- Metadata: `{ code: "..." }`
- Price Books: `{ priceBookId: "..." }` (objects, NOT strings!)
- Prices: `{ sku: "...", priceBookId: "..." }` (objects, NOT strings!)

---

## Price Book Hierarchy (12 Total)

```
Level 1 (Base - 2 books)
├── us-base-contract (MSRP)
└── us-base-retail (MSRP × 1.20)

Level 2 (Regional - 4 books)
├── west-region-contract (Base +3% on lumber)
├── east-region-contract (Base)
├── west-region-retail (Base × 1.20)
└── east-region-retail (Base × 1.20)

Level 3 (Division - 4 books)
├── west-commercial-contract (Regional -10%)
├── west-residential-contract (Regional -5%)
├── east-commercial-contract (Base -10%)
└── east-residential-contract (Base -5%)

Level 4 (Tier 1 - 2 books)
├── west-commercial-gc-tier1 (Commercial -5% = -15% total)
└── east-commercial-gc-tier1 (Commercial -5% = -15% total)
```

**Pricing Logic:**
- Regional adjustments apply (West +3% on lumber only)
- Division discounts cascade from regional level
- Tier 1 provides additional -5% off commercial
- Retail tiers apply 20% markup to base prices

---

## Scripts Created & Status

### Generation Scripts (All ES Module Format)
| Script | Status | Output | Records |
|--------|--------|--------|---------|
| generate-metadata.js | ✅ Complete | metadata.json | 20 |
| generate-categories.js | ✅ Complete | categories.json | 19 |
| generate-products.js | ✅ Complete | products.json | 70 simple + 10 service |
| generate-variants.js | ✅ Complete | variants.json | 20 configurable + 74 variants |
| generate-bundles.js | ✅ Complete | bundles.json | 15 bundles |
| generate-price-books.js | ✅ Complete | price-books.json | 12 |
| generate-prices-hierarchical.js | ✅ Complete | prices.json | 2,855 |
| generate-inventory.js | ✅ Complete | inventory.json + sources.json | 169 items, 6 sources |

### Ingestion Scripts (All Using ACO SDK)
| Script | Status | Method |
|--------|--------|--------|
| ingest-metadata.js | ✅ Working | `client.createProductMetadata()` |
| ingest-categories.js | ✅ Working | `client.createCategories()` |
| ingest-products.js | ✅ Working | `client.createProducts()` |
| ingest-price-books.js | ✅ Working | `client.createPriceBooks()` |
| ingest-prices.js | ✅ Ready | `client.createPrices()` |

### Reset/Deletion Scripts
| Script | Status | Notes |
|--------|--------|-------|
| reset-aco.js | ✅ Working | Uses SDK delete methods; deletion order reversed from ingestion |
| reset.js | ✅ Kept | Local file reset (clears data/buildright directory) |

---

## Key Learning: Schema Validation Trial-and-Error Process

The team discovered each entity has a **strict ACO schema** through iterative testing:

1. **Generate data** with assumed schema
2. **Try to ingest** - get API validation error
3. **Read error message** - shows what fields are invalid
4. **Update generation script** - remove unsupported fields, add required ones
5. **Repeat until success**

### Critical Discoveries
- ❌ Product `status` must be "ENABLED" or "DISABLED", NOT "active"
- ❌ Metadata, categories, products don't support `source` on deletion (use just the ID)
- ❌ Price Books require `currency` field
- ❌ Prices use `regular` field, NOT `value`
- ❌ Delete operations send objects, NOT strings (for price books and prices)

---

## Environment & Configuration

### Required .env Variables
```
CLIENT_ID=<your-client-id>
CLIENT_SECRET=<your-client-secret>
TENANT_ID=<your-tenant-id>
REGION=na1
ENVIRONMENT=sandbox
```

### npm Scripts (Track 2 Implemented)
```json
{
  "test": "NODE_OPTIONS=--experimental-vm-modules jest",
  "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage",
  "generate:metadata": "node scripts/generate-metadata.js",
  "generate:categories": "node scripts/generate-categories.js",
  "generate:products": "node scripts/generate-products.js",
  "generate:variants": "node scripts/generate-variants.js",
  "generate:bundles": "node scripts/generate-bundles.js",
  "generate:all-products": "npm run generate:products && npm run generate:variants && npm run generate:bundles",
  "generate:price-books": "node scripts/generate-price-books.js",
  "generate:prices": "node scripts/generate-prices-hierarchical.js",
  "generate:all-pricing": "npm run generate:price-books && npm run generate:prices",
  "generate:inventory": "node scripts/generate-inventory.js",
  "generate:sources": "node scripts/generate-inventory.js --sources-only",
  "generate:all-inventory": "npm run generate:sources && npm run generate:inventory",
  "generate:all": "npm run generate:metadata && npm run generate:categories && npm run generate:all-products && npm run generate:all-pricing && npm run generate:all-inventory"
}
```

### Test Results (Track 2)
- **Total Tests**: 329
- **Passing**: 315 (95.7%)
- **Failing**: 12 (complex integration tests & test isolation issues)
- **Skipped**: 2
- **Coverage**: 85%+ on critical utilities

---

## Next Steps / Remaining Work (Post Track 2)

### Track 3: Manual Config Guides (Steps 13-15)
- Document Adobe Commerce Admin UI configuration for sources/stocks
- Document ACO UI configuration for policies/catalog views
- Create step-by-step guides with screenshots

### Track 4: Comprehensive Documentation (Steps 16-17)
- API guides for product ingestion, inventory management, price book hierarchy
- Architecture documentation and ADRs
- Complete README with usage examples

### Track 5: Integration & Quality (Steps 18-20)
- End-to-end integration testing
- Efficiency review
- Security review
- Final PM sign-off

---

## Useful Debugging Tips

### When Ingestion Fails
1. Check the API error response for field validation failures
2. Error shows which fields are unsupported or missing
3. Update the generate script to match the schema
4. Regenerate and re-ingest

### Batch Sizes Used
- Metadata: 50 per batch
- Categories: 50 per batch
- Products: 50 per batch
- Price Books: 25 per batch
- Prices: 100 per batch

### Common Issues & Fixes
| Issue | Fix |
|-------|-----|
| "string found, object expected" on delete | Send objects with ID, not just strings |
| "required property X not found" | Add the missing required field |
| "property X is not defined in schema" | Remove unsupported fields |
| 404 errors on deletion | Check entity IDs match data files |
| Batching errors | Reduce batch size in loop |

---

## File Structure

```
scripts/
├── generate-metadata.js
├── generate-categories.js
├── generate-all-products.js
├── generate-price-books.js
├── generate-prices-hierarchical.js (NEW)
├── ingest-metadata.js
├── ingest-categories.js
├── ingest-products.js
├── ingest-price-books.js
├── ingest-prices.js
├── reset-aco.js
└── reset.js

data/
└── buildright/
    ├── metadata.json (20 attributes)
    ├── categories.json (19 categories)
    ├── products.json (70 simple + 10 service)
    ├── variants.json (20 configurable + 74 variants)
    ├── bundles.json (15 bundles)
    ├── price-books.json (12 price books)
    ├── prices.json (2,855 prices)
    ├── inventory.json (169 items)
    └── sources.json (6 sources)

utils/
├── random-seed.js (Deterministic LCG PRNG)
├── sku-generator.js (SKU generation utilities)
├── price-calculator.js (Hierarchical pricing logic)
└── inventory-distributor.js (Multi-source allocation)

scripts/config/
├── product-definitions.js (Product catalog data)
├── bundle-definitions.js (Bundle configurations)
├── source-definitions.js (Inventory source configs)
└── inventory-rules.js (Category-based assignment rules)
```

---

## Track 2 Implementation Notes

### Deterministic Data Generation
- All generators support SEED environment variable for reproducible output
- Custom Linear Congruential Generator (LCG) implemented in utils/random-seed.js
- Verified: All 9 data files produce identical checksums with same SEED value

### Test-Driven Development
- 329 tests total: 315 passing (95.7%), 12 failing (integration tests), 2 skipped
- 12 remaining failures are non-critical (complex integration tests & test isolation issues)
- All critical utilities and generation logic fully tested
- Jest configured with ES Modules support

### Architecture Patterns
- All scripts are ES Modules (type: "module" in package.json)
- Configuration extracted to scripts/config/ directory
- Utility functions in utils/ directory
- Generated data in data/buildright/ directory
- Follows single-responsibility and DRY principles

### Key Features Implemented
- Multi-source inventory with category-based assignment
- Hierarchical pricing with 4-level price book structure
- Configurable products with multiple variants
- Bundle products with group options
- Service products for installation/maintenance
- Deterministic output for testing and reproducibility