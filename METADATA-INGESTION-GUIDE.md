# ACO Metadata Ingestion Guide

## Why This Matters

When querying products from ACO Merchandising GraphQL API, attribute labels currently show as `"null"`:

```json
{
  "attributes": [
    {
      "label": "null",  // ❌ Problem
      "name": "brand",
      "value": "toughgrip"
    }
  ]
}
```

**Root Cause:** Attribute metadata (labels, visibility, searchability, etc.) has never been ingested to ACO.

**Solution:** Ingest metadata using the new `ingest:metadata` script.

## What Gets Ingested

The script ingests **attribute metadata** from `data/buildright/metadata.json`, which includes:

- **Labels**: Human-readable names ("Brand", "Product Category", etc.)
- **Data Types**: TEXT, DECIMAL, BOOLEAN, DATE
- **Visibility**: Where attributes appear (Product Detail, Listings, Search Results)
- **Searchability**: Can customers search by this attribute?
- **Search Weight**: How important is this attribute in search ranking (1-5)?
- **Filterability**: Can customers filter by this attribute?
- **Sortability**: Can customers sort by this attribute?

### Example Transformation

**Source** (`metadata.json`):
```json
{
  "attributeId": "brand",
  "label": "Brand",
  "type": "select",
  "sortOrder": 2
}
```

**Transformed to ACO Metadata API format**:
```json
{
  "code": "brand",
  "source": { "locale": "en-US" },
  "label": "Brand",
  "dataType": "TEXT",
  "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING", "SEARCH_RESULTS"],
  "filterable": true,
  "sortable": true,
  "searchable": true,
  "searchWeight": 3,
  "searchTypes": ["AUTOCOMPLETE"]
}
```

## How to Run

### Step 1: Dry-Run (Recommended First)

```bash
cd buildright-aco
npm run ingest:metadata:dry-run
```

**What This Does:**
- ✅ Validates metadata structure
- ✅ Transforms to ACO format
- ✅ Shows what would be ingested
- ❌ Does NOT send data to ACO

**Expected Output:**
```
✅ Validation passed
Sample transformed metadata (first 3):
  - product_category (Product Category): TEXT, searchWeight: 5, filterable: true
  - brand (Brand): TEXT, searchWeight: 3, filterable: true
  - unit_of_measure (Unit of Measure): TEXT, searchWeight: 2, filterable: true

Would ingest: 47 metadata definitions
Validation: PASSED ✅
No data was sent to ACO (dry-run mode)
```

### Step 2: Ingest to ACO

```bash
npm run ingest:metadata
```

**What This Does:**
- ✅ Validates metadata
- ✅ Transforms to ACO format
- ✅ Ingests to ACO in batches of 10
- ✅ Uses retry logic for transient failures

**Expected Output:**
```
Processing batch 1/5 (10 attributes)
✅ Batch 1 accepted: 10 attributes
Processing batch 2/5 (10 attributes)
✅ Batch 2 accepted: 10 attributes
...
========================================
Metadata Ingestion Summary
========================================
Total Metadata Definitions: 47
Successfully Ingested: 47
Failed: 0
Success Rate: 100.0%
Duration: 8.3s
========================================
✅ Metadata ingestion complete!
```

### Step 3: Verify Labels

After ingestion, query products via GraphQL:

```bash
curl -X POST https://edge-sandbox-graph.adobe.io/api/YOUR_MESH_ID/graphql \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { BuildRight_searchProducts(phrase: \"concrete\", pageSize: 1) { items { sku name attributes { label name value } } } }"
  }'
```

**Expected Result (labels fixed!):**
```json
{
  "attributes": [
    {
      "label": "Brand",  // ✅ No longer "null"!
      "name": "brand",
      "value": "toughgrip"
    },
    {
      "label": "Product Category",
      "name": "product_category",
      "value": "structural_materials"
    }
  ]
}
```

## Order of Operations

**CRITICAL:** Metadata MUST be ingested BEFORE products!

### Correct Order:

1. ✅ `npm run generate:metadata` (already done)
2. ✅ **`npm run ingest:metadata`** ← **DO THIS FIRST**
3. ✅ `npm run ingest:products` ← Then this

### Why?

ACO needs to know how to handle product attributes **before** products are ingested. If you ingest products first, ACO won't know:
- What the labels should be
- Whether attributes are searchable
- Whether attributes are filterable
- How to index the attributes

## Metadata Update Workflow

If you need to update existing metadata (e.g., change a label):

1. Edit `data/buildright/metadata.json`
2. Run `npm run ingest:metadata` again

**Note:** ACO's `createProductMetadata` will **update** existing metadata if it already exists, so re-running the script is safe.

## Troubleshooting

### Error: "CLIENT_ID and CLIENT_SECRET must be set"

**Solution:** Check your `.env` file:
```bash
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
TENANT_ID=X2duJmy3FaTKf1Mmr4GiQY
REGION=na1
ENVIRONMENT=sandbox
```

### Error: "Metadata validation failed"

**Solution:** Check `data/buildright/metadata.json` for:
- Missing `attributeId`
- Missing `label`
- Missing `type`
- Invalid `type` (must be: text, select, multiselect, number, boolean, date)

### Labels Still Show "null" After Ingestion

**Possible Causes:**
1. **Cache Issue**: Wait 1-2 minutes for ACO to index metadata
2. **Wrong Attribute Code**: Ensure product attribute `code` matches metadata `attributeId`
3. **Metadata Not Applied**: Re-run `npm run ingest:metadata` to ensure it completed

## Technical Details

### Script Location

`buildright-aco/scripts/ingest-metadata.js`

### Dependencies

- `@adobe-commerce/aco-ts-sdk` - Official ACO SDK
- `winston` - Logging
- Reuses existing utilities: `aco-client.js`, `retry-handler.js`

### Batch Size

Metadata is ingested in **batches of 10** (ACO recommendation for metadata operations).

### Retry Logic

Uses `executeWithRetry` with:
- Max retries: 3
- Retry delay: 2000ms
- Exponential backoff

### Search Weight Algorithm

```javascript
function getSearchWeight(attr) {
  // Core identification attributes (sku, name, product_category) → 5
  // Important discovery attributes (brand, project_types) → 3
  // Standard attributes (sortOrder ≤ 10) → 2
  // Less important attributes → 1
}
```

### Visibility Algorithm

```javascript
function getVisibilitySettings(attr) {
  // All attributes: PRODUCT_DETAIL, PRODUCT_LISTING
  // Core/important attributes also: SEARCH_RESULTS
}
```

## References

- [ACO Data Ingestion API - Metadata](https://developer.adobe.com/commerce/services/optimizer/data-ingestion/)
- [ACO TypeScript SDK](https://www.npmjs.com/package/@adobe-commerce/aco-ts-sdk)
- [buildright-service Documentation](../buildright-service/docs/ACO-ATTRIBUTE-LABELS-METADATA-API.md)

---

**Status:** Ready to run! 🚀

**Next Action:** Run `npm run ingest:metadata:dry-run` to validate, then `npm run ingest:metadata` to fix labels.

