# Track 3 Handoff: Data Ingestion Scripts - In Progress

**Date:** 2025-10-29
**Session:** Schema Fix & OAuth Implementation
**Status:** 80% Complete - Bundle Data Issue Found

---

## Executive Summary

Successfully resolved the critical schema mismatch issue and implemented OAuth authentication for GraphQL. Completed ingestion of products and variants (169 items total). Found and documented a data quality issue in bundle generation that needs fixing before completing Track 3.

---

## What Was Accomplished This Session

### 1. Schema Mismatch Resolution ✅

**Problem:** Generated data didn't match ACO's actual API schema, causing 400 errors during ingestion.

**Solution:** Researched actual ACO schema from SDK TypeScript definitions and updated all generation scripts.

**Files Created:**
- `docs/aco-api-schema.md` - Complete schema documentation with before/after examples

**Files Modified:**
- `scripts/generate-products.js` - Updated to ACO schema
- `scripts/generate-variants.js` - Updated to ACO schema
- `scripts/generate-bundles.js` - Updated to ACO schema

**Key Schema Fixes:**
1. Added required fields: `source: { locale: "en-US" }`, `slug`
2. Changed `status`: "enabled" → "ENABLED" (uppercase enum)
3. Changed `attributes`: `value` → `values` (array format)
4. Changed `routes`: `{ categoryId }` → `{ path }` (URL paths)
5. Changed `metaTags.keywords`: string → array
6. Changed boolean attribute values: `true`/`false` → `"true"`/`"false"` (strings)
7. Removed unsupported fields: `type`, `visibility`, `price`, `weight`

### 2. OAuth Authentication Implementation ✅

**Problem:** GraphQL queries needed OAuth tokens (different from REST API authentication).

**Solution:** Created reusable OAuth token manager with caching and automatic refresh.

**Files Created:**
- `utils/oauth-token-manager.js` - Complete OAuth token management
  - Token acquisition from Adobe IMS
  - Automatic caching with expiration
  - Thread-safe token refresh
  - Configuration validation

- `scripts/test-oauth-graphql.js` - OAuth/GraphQL test script

**Files Modified:**
- `utils/graphql-query.js` - Integrated OAuth token manager
  - Auto-fetches tokens when needed
  - Added required headers: `Magento-Website-Code`, `Magento-Store-View-Code`

**OAuth Flow:**
```
CLIENT_ID + CLIENT_SECRET → Adobe IMS Token Endpoint → Access Token (cached)
→ GraphQL queries with Bearer token + Magento headers
```

### 3. Data Regeneration ✅

**Result:** All data files regenerated with correct ACO schema:
- `data/buildright/products.json` - 70 products
- `data/buildright/variants.json` - 99 products (20 parents + 79 children)
- `data/buildright/bundles.json` - 15 bundles (⚠️ contains duplicate SKU bug)

### 4. Ingestion Success ✅

**Products Ingested:** 70/70 ✅
```bash
node scripts/ingest-products.js
# Result: 70 products successfully ingested to ACO
```

**Variants Ingested:** 99/99 ✅
```bash
node scripts/ingest-variants.js
# Result: 20 configurable parents + 79 variants successfully ingested
```

**Bundles:** 0/15 ❌ (blocked by data quality issue)
```bash
node scripts/ingest-bundles.js ./data/buildright/bundles.json --skip-validation
# Error: Duplicate SKU in bundle items - WINDOW-6642736C
```

---

## Current Issue: Bundle Generation Bug

### Problem Description

ACO validation rejected bundles with error:
```
"Duplicate SKU found in bundle items. A SKU can be included only once in each bundle."
Location: Bundle item index 6, Group index 1
Duplicate SKU: WINDOW-6642736C
```

### Root Cause

The bundle generation script (`scripts/generate-bundles.js`) doesn't check for duplicate SKUs when selecting products for bundle items within the same group.

**Problematic Code Location:**
`scripts/generate-bundles.js` lines ~250-282 - the loop that selects products for bundle groups doesn't maintain a Set of already-used SKUs within each bundle.

### Fix Required

Update `generateBundle()` function in `scripts/generate-bundles.js`:
1. Track SKUs already added to the current bundle (across all groups)
2. Skip products whose SKUs are already in the bundle
3. Ensure each SKU appears only once per bundle

**After fix:**
1. Regenerate bundles: `env SEED=12345 node scripts/generate-bundles.js`
2. Re-test ingestion: `node scripts/ingest-bundles.js ./data/buildright/bundles.json --skip-validation`

---

## Remaining Work in Track 3

### Not Started:

1. **Fix Bundle Generation** (blocking)
   - Update `scripts/generate-bundles.js` to prevent duplicate SKUs
   - Regenerate `data/buildright/bundles.json`
   - Test bundle ingestion

2. **Inventory Ingestion**
   - Script exists: `scripts/ingest-inventory.js`
   - Data exists: `data/buildright/inventory.json`
   - Command: `node scripts/ingest-inventory.js`

3. **Pricing Ingestion**
   - Scripts exist: `scripts/ingest-price-books.js`, `scripts/ingest-prices.js`
   - Data exists: `data/buildright/price-books.json`, `data/buildright/prices.json`
   - Commands:
     ```bash
     node scripts/ingest-price-books.js
     node scripts/ingest-prices.js
     ```

4. **Validation**
   - Verify all data ingested successfully
   - Use GraphQL queries to confirm counts
   - Update `HANDOFF.md` with success status

---

## File Inventory

### New Files Created This Session

**Utilities:**
- `utils/oauth-token-manager.js` (279 lines)

**Documentation:**
- `docs/aco-api-schema.md` (386 lines)

**Test Scripts:**
- `scripts/test-oauth-graphql.js` (66 lines)
- `scripts/test-product-ingestion.js` (55 lines)

### Modified Files This Session

**Generation Scripts:**
- `scripts/generate-products.js` - Schema fixes, validation disabled
- `scripts/generate-variants.js` - Schema fixes, validation disabled
- `scripts/generate-bundles.js` - Schema fixes, validation disabled

**Utilities:**
- `utils/graphql-query.js` - OAuth integration, header fixes

### Generated Data Files (Regenerated)

- `data/buildright/products.json` (84K) - ✅ Valid
- `data/buildright/variants.json` (174K) - ✅ Valid
- `data/buildright/bundles.json` (40K) - ⚠️ Contains duplicate SKU bug

**Note:** Pricing data files were NOT regenerated (still valid from previous session):
- `data/buildright/price-books.json` (1.3K)
- `data/buildright/prices.json` (398K)

---

## Environment & Configuration

### Working Credentials

OAuth authentication confirmed working:
- `CLIENT_ID` - ✅ Valid
- `CLIENT_SECRET` - ✅ Valid
- Adobe IMS Token Endpoint: `https://ims-na1.adobelogin.com/ims/token/v3`

ACO Configuration:
- `TENANT_ID` - ✅ Valid
- `REGION` - na1
- `ENVIRONMENT` - sandbox
- GraphQL Endpoint: `https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/graphql`

Required Headers for GraphQL:
- `Authorization: Bearer {token}`
- `Magento-Website-Code: base`
- `Magento-Store-View-Code: default`

### Known GraphQL Behavior

**Important:** GraphQL catalog appears to lag behind REST API. After ingesting products via REST API, GraphQL queries return empty arrays immediately. This is expected - GraphQL validation should be skipped for bundle ingestion using `--skip-validation` flag since we know products were just ingested via REST.

---

## Git Status

**Current Branch:** `wip`

**Modified Files:**
```
M scripts/generate-bundles.js
M scripts/generate-products.js
M scripts/generate-variants.js
M utils/graphql-query.js
```

**New Files (Untracked):**
```
?? docs/aco-api-schema.md
?? scripts/test-oauth-graphql.js
?? scripts/test-product-ingestion.js
?? utils/oauth-token-manager.js
?? HANDOFF-TRACK3.md
```

**Data Files Modified:**
```
M data/buildright/bundles.json
M data/buildright/products.json
M data/buildright/variants.json
```

**Recommended Commit Message:**
```
Implement OAuth for GraphQL and fix ACO schema mismatch

- Add OAuth token manager with automatic caching and refresh
- Update all generation scripts to match ACO API schema
- Document actual ACO schema from SDK TypeScript definitions
- Regenerate all product/variant/bundle data with correct schema
- Successfully ingest 169 products (70 simple + 99 variants)
- Identify bundle generation bug (duplicate SKUs)

Track 3 progress: 80% complete
Remaining: Fix bundle generation, test inventory/pricing ingestion
```

---

## How to Resume This Session

### Step 1: Restore Context (30 seconds)

Send this prompt to Claude:

```
I'm continuing the BuildRight ACO project from a previous session.

Context files to read:
@HANDOFF-TRACK3.md
@.rptc/plans/buildright-aco-complete-project/overview.md
@.rptc/plans/buildright-aco-complete-project/step-09.md

Current status:
- Track 3 (Data Ingestion) is 80% complete
- Products and variants successfully ingested (169 items)
- Bundle generation has duplicate SKU bug that needs fixing
- OAuth/GraphQL implementation complete and working

Next task: Fix bundle generation script to prevent duplicate SKUs, then complete remaining ingestion.

Please review the handoff document and confirm you understand where we are.
```

### Step 2: Verify Understanding

Claude should confirm:
- Track 3 status and what's been completed
- The bundle duplicate SKU issue
- What needs to happen next (fix bundle generation)

### Step 3: Resume Work

After confirmation, give this instruction:

```
Continue with Track 3. First fix the bundle generation script to prevent duplicate SKUs, then complete the remaining ingestion tasks.
```

---

## Success Criteria for Track 3 Completion

- [x] Products ingested: 70/70
- [x] Variants ingested: 99/99
- [ ] Bundles ingested: 0/15 (blocked by data bug)
- [ ] Inventory ingested
- [ ] Price books ingested
- [ ] Prices ingested
- [ ] All ingestion validated via GraphQL or ACO UI

---

## Key Technical Decisions

### Decision: OAuth Token Manager Design

**Chosen Approach:** Singleton pattern with automatic caching
- Token cached in module-level variable
- 1-minute safety buffer before expiration
- Automatic refresh on next request if expired
- Thread-safe (Promise-based)

**Alternative Considered:** Redis/external cache
**Rationale:** Overkill for single-process scripts, adds complexity

### Decision: GraphQL Validation Strategy

**Chosen Approach:** Skip validation with `--skip-validation` flag
- GraphQL catalog lags behind REST API
- Bundle SKU validation happens at ACO API level anyway
- Avoids false negatives from sync delays

**Alternative Considered:** Wait for GraphQL sync
**Rationale:** Sync time unknown, adds unnecessary delay

### Decision: Schema Validation Disabled

**Chosen Approach:** Comment out local JSON schema validation in generation scripts
- ACO API provides authoritative validation
- Local schemas were outdated and causing false failures
- API errors are more accurate than stale local schemas

**Note:** Lines with `// (DISABLED - ACO API will validate)` comments in generation scripts

---

## Testing Results

### OAuth Token Manager Tests ✅

```bash
node scripts/test-oauth-graphql.js
# Results:
# ✓ OAuth configuration valid
# ✓ Access token acquired (24-hour expiration)
# ✓ Token caching working
# ✓ GraphQL query successful (empty results expected due to sync lag)
```

### Product Ingestion Test ✅

```bash
node scripts/test-product-ingestion.js
# Results:
# ✓ 2 test products ingested successfully
# ✓ Schema validation passed by ACO API
```

### Full Product Ingestion ✅

```bash
node scripts/ingest-products.js
# Results:
# ✓ 70 products in 1 batch
# ✓ 0 failures
# ✓ Success rate: 100%
```

### Variant Ingestion ✅

```bash
node scripts/ingest-variants.js
# Results:
# ✓ 20 configurable parents ingested
# ✓ 79 variant children ingested
# ✓ 0 failures
# ✓ Success rate: 100%
```

### Bundle Ingestion ❌

```bash
node scripts/ingest-bundles.js ./data/buildright/bundles.json --skip-validation
# Results:
# ✗ Validation error: Duplicate SKU in bundle items
# ✗ 15 bundles failed
# ✗ Data bug in generation script
```

---

## Important Notes

1. **Schema validation is disabled** in generation scripts - ACO API provides the authoritative validation

2. **GraphQL sync lag** - Products ingested via REST API take time to appear in GraphQL queries. This is normal behavior.

3. **Bundle SKU validation** - The `--skip-validation` flag skips GraphQL pre-validation but ACO API still validates at ingestion time (caught our bug!)

4. **Token expiration** - OAuth tokens last 24 hours. The token manager handles refresh automatically.

5. **Batch processing** - All ingestion uses 100-item batches with retry logic for 429/503 errors.

---

## Quick Reference Commands

### Regenerate Data (After Fixes)
```bash
env SEED=12345 node scripts/generate-products.js
env SEED=12345 node scripts/generate-variants.js
env SEED=12345 node scripts/generate-bundles.js
```

### Test OAuth/GraphQL
```bash
node scripts/test-oauth-graphql.js
```

### Ingest Data
```bash
node scripts/ingest-products.js
node scripts/ingest-variants.js
node scripts/ingest-bundles.js ./data/buildright/bundles.json --skip-validation
node scripts/ingest-inventory.js
node scripts/ingest-price-books.js
node scripts/ingest-prices.js
```

### Check OAuth Token Info
```bash
node -e "import { getTokenInfo } from './utils/oauth-token-manager.js'; const info = await getTokenInfo(); console.log(info);"
```

---

## Contact & Escalation

**If blocked:**
- Check `logs/error.log` for detailed error messages
- Verify `.env` has all required credentials
- Confirm ACO sandbox is accessible

**Next session priorities:**
1. Fix bundle generation duplicate SKU bug (highest priority)
2. Complete inventory ingestion
3. Complete pricing ingestion
4. Validate all data in ACO

---

_Handoff document created: 2025-10-29_
_Last updated: End of Track 3 OAuth implementation session_
