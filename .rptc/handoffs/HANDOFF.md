# BuildRight ACO Project - Handoff Document

**Date:** 2025-10-29
**Status:** Development Phase - Schema Validation Required
**Branch:** `wip`

---

## Project Overview

BuildRight ACO Complete Project - A comprehensive data ingestion system for Adobe Commerce Optimizer (ACO) demonstrating multi-source inventory, hierarchical pricing, and complex product catalogs for a building materials distributor.

## Current Status: ✅ Schema Fixed - Track 3 80% Complete

**Latest Update:** 2025-10-29 (OAuth/GraphQL Implementation Session)
- Schema mismatch resolved ✅
- OAuth authentication implemented ✅
- Products & variants ingested successfully ✅ (169 items)
- Bundle generation bug found - needs fix before completion

**See:** `HANDOFF-TRACK3.md` for detailed session notes

### What's Working ✅

1. **Core Infrastructure (Track 1)**
   - ✅ ACO SDK client wrapper configured (`utils/aco-client.js`)
   - ✅ Environment variables loaded from `.env`
   - ✅ Authentication credentials configured (CLIENT_ID, CLIENT_SECRET, TENANT_ID)
   - ✅ Logger, config validator, schema validator utilities
   - ✅ Test suite passing (247/334 tests, 87 skipped)

2. **Data Generation (Track 2)**
   - ✅ All 9 data files generated successfully:
     - `metadata.json` - 10 product attributes (3.5K)
     - `categories.json` - 5 categories (3.8K)
     - `products.json` - 70 simple/service products (76K)
     - `variants.json` - 93 product variants (114K)
     - `bundles.json` - 15 bundle products (41K)
     - `inventory.json` - Multi-source inventory (39K)
     - `sources.json` - 6 inventory sources (2.8K)
     - `price-books.json` - 4 price books (1.3K)
     - `prices.json` - 1,418 prices across 178 products (398K)

3. **Ingestion Scripts (Track 3)**
   - ✅ 11 ingestion/validation scripts created
   - ✅ Batch processing with retry logic
   - ✅ Progress reporting and error handling
   - ✅ NPM scripts configured (`ingest:*`, `validate:*`, `reset:*`)
   - ✅ Terminology updated: "ingest" vs "upload" (aligned with Adobe)

### What's Broken ❌

**Critical Issue: Schema Mismatch Between Generated Data and ACO API**

When attempting to ingest products to ACO, the API returned **400 Bad Request** with validation errors. Our generated data schema does NOT match ACO's actual API schema.

#### Specific Schema Mismatches

1. **Status Field**
   - **Generated:** `"status": "enabled"` (lowercase)
   - **ACO Expects:** `"status": "ENABLED"` or `"DISABLED"` (uppercase enum)

2. **Attributes Structure**
   - **Generated:** `{ "code": "category", "value": "structural_materials" }`
   - **ACO Expects:** `{ "code": "category", "values": ["structural_materials"] }` (array)

3. **Missing Required Fields**
   - **ACO Requires:** `source` (string) - Missing in our data
   - **ACO Requires:** `slug` (string) - Missing in our data

4. **Routes/Categories Structure**
   - **Generated:** `{ "categoryId": "cat_007" }`
   - **ACO Expects:** `{ "path": "/category-url" }`

5. **Unsupported Extra Fields**
   - We include: `type`, `visibility`, `price`, `weight`, `metaTitle`, `metaDescription`, `metaKeywords`
   - ACO rejects: "property is not defined in the schema and the schema does not allow additional properties"

#### Error Message (Truncated)

```json
{
  "status": "FAILED",
  "message": "Items validation failed for 70 items",
  "errors": [
    {
      "itemIndex": 0,
      "code": "/status",
      "message": "/status: does not have a value in the enumeration [\"ENABLED\", \"DISABLED\"]",
      "value": "enabled"
    },
    {
      "itemIndex": 0,
      "code": "/attributes/0/values",
      "message": "/attributes/0: required property 'values' not found"
    },
    {
      "itemIndex": 0,
      "code": "/source",
      "message": "required property 'source' not found"
    },
    {
      "itemIndex": 0,
      "code": "/slug",
      "message": "required property 'slug' not found"
    }
    // ... 229,852 more characters
  ]
}
```

---

## Root Cause Analysis

### Why This Happened

The data generation scripts (Track 2) were built **before** we had access to the real ACO environment. We created a **mock schema** based on research and assumptions rather than the actual ACO API specification.

### What We Learned

1. **ACO's Product Schema** is more strict than anticipated
2. **Required fields** we didn't include: `source`, `slug`
3. **Attribute structure** uses arrays (`values`) not single values (`value`)
4. **Enum fields** are case-sensitive (uppercase)
5. **Extra fields not allowed** - ACO uses strict schema validation

---

## Next Steps to Fix

### Phase 1: Research Actual ACO Schema (Estimated: 2-3 hours)

**Objective:** Document the real ACO product/inventory/price schemas

**Actions:**
1. Review `@adobe-commerce/aco-ts-sdk` TypeScript types/interfaces
2. Check SDK documentation for product schema
3. Make test API calls to get schema validation errors
4. Create schema reference document: `docs/aco-api-schemas.md`

**Tools:**
```bash
# Check SDK types
cat node_modules/@adobe-commerce/aco-ts-sdk/dist/index.d.ts

# Test with minimal product
node -e "require('./test-minimal-product.js')"
```

### Phase 2: Update Generation Scripts (Estimated: 4-6 hours)

**Files to Update:**
1. `scripts/generate-products.js` - Fix product schema
2. `scripts/generate-variants.js` - Fix variant schema
3. `scripts/generate-bundles.js` - Fix bundle schema
4. `scripts/generate-inventory.js` - Verify inventory schema
5. `scripts/generate-prices-hierarchical.js` - Verify price schema

**Key Changes Needed:**

```javascript
// OLD (current - incorrect)
{
  sku: "PROD-001",
  name: "Product Name",
  status: "enabled",  // ❌ Wrong case
  attributes: [
    { code: "category", value: "lumber" }  // ❌ Should be 'values' array
  ],
  routes: [
    { categoryId: "cat_001" }  // ❌ Should be 'path'
  ],
  type: "simple",  // ❌ Extra field
  visibility: "both",  // ❌ Extra field
  price: 9.99,  // ❌ Extra field (prices separate)
  weight: 10.5  // ❌ Extra field
}

// NEW (target - correct)
{
  sku: "PROD-001",
  name: "Product Name",
  description: "Product description",
  status: "ENABLED",  // ✅ Uppercase
  source: "default",  // ✅ Required
  slug: "product-name",  // ✅ Required
  attributes: [
    { code: "category", values: ["lumber"] }  // ✅ Array
  ],
  routes: [
    { path: "/lumber/product-name" }  // ✅ Path instead of categoryId
  ]
  // ✅ No extra fields
}
```

### Phase 3: Regenerate All Data (Estimated: 30 minutes)

```bash
# Clean old data
rm -rf data/buildright/*.json

# Regenerate with correct schema
npm run generate:all

# Verify file sizes/counts
ls -lh data/buildright/
```

### Phase 4: Test Ingestion (Estimated: 1 hour)

```bash
# Test with small batch first
node -e "
const products = require('./data/buildright/products.json');
const fs = require('fs');
fs.writeFileSync('test-batch.json', JSON.stringify(products.slice(0, 5)));
"

# Ingest test batch
node scripts/ingest-products.js test-batch.json

# If successful, ingest all
npm run ingest:all
```

### Phase 5: Validation & Documentation (Estimated: 1 hour)

```bash
# Verify ingestion
npm run validate:ingestion --all --output-json
npm run validate:ingestion --all --output-text

# Document final schema
# Update README with actual usage
```

---

## Files & Directories

### Key Configuration Files

- `.env` - **ACO credentials configured** ✅
  - CLIENT_ID, CLIENT_SECRET, TENANT_ID set
  - Region: na1, Environment: sandbox

- `package.json` - All npm scripts defined
- `.rptc/plans/` - Step-by-step implementation plans (Steps 1-20)

### Generated Data (Current - INCOMPATIBLE SCHEMA)

```
data/buildright/
├── metadata.json        (3.5K)  - 10 attributes
├── categories.json      (3.8K)  - 5 categories
├── products.json        (76K)   - 70 products ⚠️ SCHEMA MISMATCH
├── variants.json        (114K)  - 93 variants ⚠️ SCHEMA MISMATCH
├── bundles.json         (41K)   - 15 bundles ⚠️ SCHEMA MISMATCH
├── inventory.json       (39K)   - Multi-source inventory ⚠️ VERIFY SCHEMA
├── sources.json         (2.8K)  - 6 sources
├── price-books.json     (1.3K)  - 4 price books ⚠️ VERIFY SCHEMA
└── prices.json          (398K)  - 1,418 prices ⚠️ VERIFY SCHEMA
```

### Scripts

**Generation Scripts (Need Updates):**
- `scripts/generate-metadata.js` ✅ (probably OK)
- `scripts/generate-categories.js` ⚠️ (verify)
- `scripts/generate-products.js` ❌ **NEEDS FIX**
- `scripts/generate-variants.js` ❌ **NEEDS FIX**
- `scripts/generate-bundles.js` ❌ **NEEDS FIX**
- `scripts/generate-inventory.js` ⚠️ (verify)
- `scripts/generate-price-books.js` ⚠️ (verify)
- `scripts/generate-prices-hierarchical.js` ⚠️ (verify)

**Ingestion Scripts (Working, awaiting correct data):**
- `scripts/ingest-products.js` ✅
- `scripts/ingest-variants.js` ✅
- `scripts/ingest-bundles.js` ✅
- `scripts/ingest-inventory.js` ✅
- `scripts/ingest-price-books.js` ✅
- `scripts/ingest-prices.js` ✅
- `scripts/validate-ingestion.js` ⚠️ (needs OAuth for GraphQL)
- `scripts/reset-catalog.js` ✅

### Utilities

- `utils/aco-client.js` - SDK wrapper ✅
- `utils/retry-handler.js` - Exponential backoff ✅
- `utils/ingest-helpers.js` - Progress reporting ✅
- `utils/graphql-query.js` - GraphQL queries ⚠️ (needs OAuth token)
- `utils/logger.js` - Winston logger ✅
- `utils/config-validator.js` - Config validation ✅
- `utils/schema-validator.js` - JSON schema validation ✅

---

## Git Status

**Current Branch:** `wip`

**Recent Commits:**
```
e65076a - Implement Track 3: Data Ingestion Scripts (Steps 9-12)
68e55c0 - Fix all failing tests - 100% test suite passing
8edd2ad - Add comprehensive ACO configuration and SDK integration
4608482 - Initial commit: RPTC plan framework
```

**Unstaged Changes:**
- `package.json` (axios added)
- `ongoing.md`
- `.rptc/validation/context-analysis-report.md`
- `data/buildright/inventory.json`

---

## NPM Scripts Reference

### Generation
```bash
npm run generate:metadata          # 10 product attributes
npm run generate:categories        # 5 categories
npm run generate:products          # 70 simple/service products
npm run generate:variants          # 93 configurable + variants
npm run generate:bundles           # 15 bundle products
npm run generate:all-products      # All product types
npm run generate:price-books       # 4 price books
npm run generate:prices            # 1,418 prices
npm run generate:all-pricing       # All pricing
npm run generate:inventory         # Multi-source inventory
npm run generate:sources           # 6 inventory sources
npm run generate:all               # Complete workflow
```

### Ingestion (Awaiting Schema Fix)
```bash
npm run ingest:products            # Ingest simple/service products
npm run ingest:variants            # Ingest configurables/variants
npm run ingest:bundles             # Ingest bundles
npm run ingest:all-products        # All product types
npm run ingest:inventory           # Multi-source inventory
npm run ingest:price-books         # Price books (hierarchical)
npm run ingest:prices              # Product prices
npm run ingest:all-pricing         # All pricing
npm run ingest:all                 # Complete workflow
```

### Validation & Reset
```bash
npm run validate:ingestion         # Verify ingestion success
npm run reset:catalog              # Clean catalog (with confirmation)
npm run reset:dry-run              # Preview deletion
```

### Testing
```bash
npm test                           # Run all tests
npm run test:coverage              # With coverage report
```

---

## Environment Configuration

`.env` file contains (values configured):
```bash
# Adobe Commerce Optimizer Configuration
CLIENT_ID=70a89eac56d5424e9c972f21c7aaace9
CLIENT_SECRET=p8e-grZ1slbtoh1-zcx9xiYDpWcUeZqy5wvb
TENANT_ID=X2duJmy3FaTKf1Mmr4GiQY
REGION=na1
ENVIRONMENT=sandbox

# Optional Configuration
TIMEOUT_MS=10000
LOG_LEVEL=info
VIEW_ID=default
SOURCE_LOCALE=en-US
SEED=12345

# Batch Processing
BATCH_SIZE=100
MAX_RETRIES=3
```

---

## Dependencies

**Production:**
- `@adobe-commerce/aco-ts-sdk@^1.1.0` - Official ACO SDK ✅
- `ajv@^8.17.1` - JSON schema validation
- `ajv-formats@^3.0.1` - Schema format validators
- `axios@^1.6.0` - HTTP client (for GraphQL)
- `dotenv@^16.3.1` - Environment variables
- `winston@^3.11.0` - Logging

**Development:**
- `jest@^29.7.0` - Testing framework

---

## Key Learnings & Insights

### What Went Well

1. **SDK Integration** - ACO TypeScript SDK works perfectly for authentication
2. **Retry Logic** - Exponential backoff implementation is solid
3. **Batch Processing** - 100 items/batch with progress reporting works well
4. **Test Coverage** - 247 tests passing gives us confidence in utilities
5. **Terminology** - Using "ingest" aligns with Adobe's official API naming

### What Needs Improvement

1. **Schema Discovery Earlier** - Should have validated against real API before building generation scripts
2. **API Documentation** - Need to document actual ACO schemas for future reference
3. **Validation Strategy** - Need better upfront schema validation in generation scripts
4. **GraphQL Auth** - GraphQL queries need OAuth token (SDK only handles REST auth)

### Technical Debt

1. **GraphQL Validation** - `validate-ingestion.js` needs OAuth implementation for GraphQL queries
2. **Schema Validator** - `utils/schema-validator.js` validates our mock schema, not ACO's real schema
3. **Test Data** - Integration tests use mock data, need tests with real ACO responses
4. **Error Messages** - Need better error messages explaining schema mismatches

---

## Questions to Answer

1. **What's the complete ACO product schema?**
   - Need TypeScript interface or JSON schema from SDK
   - Which fields are required vs optional?
   - What are the exact enum values for status, visibility, etc.?

2. **How do routes/categories work in ACO?**
   - Do we use category IDs or URL paths?
   - Is there a category assignment API separate from products?

3. **What's the `source` field in products?**
   - Is this related to inventory sources?
   - What are valid values?

4. **How are prices attached to products?**
   - Are prices part of product payload or separate?
   - How does price book hierarchy work in API?

5. **GraphQL Authentication**
   - How to get OAuth token for GraphQL queries?
   - Does SDK provide token method?

---

## Recommended Immediate Actions

### Priority 1: Schema Research (Critical)

```bash
# 1. Check SDK TypeScript definitions
cat node_modules/@adobe-commerce/aco-ts-sdk/dist/index.d.ts | grep -A 50 "interface Product"

# 2. Create minimal test product
cat > test-minimal-product.js << 'EOF'
import { getACOClient } from './utils/aco-client.js';

const minimalProduct = {
  sku: "TEST-001",
  name: "Test Product",
  status: "ENABLED",
  source: "default",
  slug: "test-product",
  description: "Minimal test product",
  attributes: []
};

const client = getACOClient();
await client.createProducts([minimalProduct]);
EOF

# 3. Test minimal product
node test-minimal-product.js
```

### Priority 2: Update One Generator (Validation)

Pick one generator (products), fix it, test it end-to-end before updating others.

### Priority 3: Document Schema

Create `docs/aco-api-schemas.md` with:
- Actual product schema
- Actual inventory schema
- Actual price schema
- Required vs optional fields
- Enum values
- Example payloads

---

## Success Criteria

The project will be considered "working" when:

1. ✅ Generation scripts output ACO-compatible JSON
2. ✅ Ingestion scripts successfully create products in ACO sandbox
3. ✅ All 178 products ingested without errors
4. ✅ Multi-source inventory assigned correctly
5. ✅ Hierarchical pricing applied across 4 price books
6. ✅ Validation script confirms 100% success rate
7. ✅ Integration tests pass against real ACO environment

---

## Contact & Handoff

**Project Location:** `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco`

**Key Files for Next Developer:**
- This document: `HANDOFF.md`
- Environment: `.env` (credentials configured)
- Plans: `.rptc/plans/buildright-aco-complete-project/`
- User notes: `ongoing.md`

**First Task:** Research actual ACO product schema from SDK documentation or test API calls.

**Estimated Time to Resolution:** 8-12 hours of focused work to fix schemas and re-test ingestion.

---

## Appendix: Full Error Log Sample

See truncated API error above. Full error message is 229,852+ characters showing validation failures for all 70 products with identical schema issues.

**Common Error Patterns:**
- `/status` - case mismatch (enabled vs ENABLED)
- `/attributes/*/values` - missing array field
- `/attributes/*/value` - extra field not allowed
- `/source` - required field missing
- `/slug` - required field missing
- `/routes/*/path` - missing field
- `/routes/*/categoryId` - extra field not allowed
- `/type`, `/visibility`, `/price`, `/weight`, `/meta*` - extra fields not allowed

---

**End of Handoff Document**

*Last Updated: 2025-10-29 16:45 UTC*
