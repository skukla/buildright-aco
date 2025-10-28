# BuildRight ACO Data Generation & Ingestion - Thread Summary

## Project Overview
BuildRight is building an Adobe Commerce Optimizer (ACO) sample catalog data ingestion system with a reduced scope plan. The system includes generation scripts to create test data and ingestion scripts to load it into ACO.

## Current Status: ✅ COMPLETE (Core Functionality)

### Successfully Ingested:
- ✅ **20 Metadata Attributes** - Product attributes (code, label, dataType, source)
- ✅ **19 Categories** - Product categories (slug, name, source)
- ✅ **125 Products** - Product catalog (sku, slug, name, status, source, attributes)
- ✅ **12 Price Books** - Hierarchical price book structure with regional/divisional tiers
- ⏳ **1,500 Prices** - Ready to ingest (125 products × 12 price books)

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
| generate-metadata.js | ✅ Working | metadata.json | 20 |
| generate-categories.js | ✅ Working | categories.json | 19 |
| generate-all-products.js | ✅ Working | products/*.json | 125 |
| generate-price-books.js | ✅ Working | price-books.json | 12 |
| generate-prices-hierarchical.js | ✅ Ready | prices-all.json | 1,500 |

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

### npm Scripts (Typical)
```json
{
  "generate:metadata": "node scripts/generate-metadata.js",
  "generate:categories": "node scripts/generate-categories.js",
  "generate:products": "node scripts/generate-all-products.js",
  "generate:price-books": "node scripts/generate-price-books.js",
  "generate:prices": "node scripts/generate-prices.js",
  "ingest:metadata": "node scripts/ingest-metadata.js",
  "ingest:categories": "node scripts/ingest-categories.js",
  "ingest:products": "node scripts/ingest-products.js",
  "ingest:price-books": "node scripts/ingest-price-books.js",
  "ingest:prices": "node scripts/ingest-prices.js",
  "reset:aco": "node scripts/reset-aco.js"
}
```

---

## Next Steps / Remaining Work

1. **Test price ingestion** - Run `npm run generate:prices` then `npm run ingest:prices`
2. **Test reset flow** - Run `npm run reset:aco` to verify deletion works with full 1,500 prices
3. **Fix any remaining bugs** - Check API errors and update scripts as needed
4. **Documentation** - Create README documenting the full workflow

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
    ├── metadata.json
    ├── categories.json
    ├── price-books.json
    ├── prices-all.json
    └── products/
        ├── structural-materials.json
        ├── framing-systems.json
        ├── roofing-systems.json
        ├── windows-doors.json
        ├── hardware-fasteners.json
        ├── adhesives-sealants.json
        └── specialty-products.json
```

---

## Team Notes

- All scripts are ES Modules (type: "module" in package.json)
- Using @adobe-commerce/aco-ts-sdk for all operations
- Error handling logs detailed API responses for debugging
- Batch processing prevents timeouts with large datasets
- Regional pricing uses West region +3% on lumber only
- Successfully discovered ACO's strict schema requirements through methodical testing