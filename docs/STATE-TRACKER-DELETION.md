# State Tracker-Based Deletion Strategy

## Problem

ACO product deletion was missing 101 variant SKUs on every deletion run, leaving orphaned data.

### Root Cause

**Invisible Variants Cannot Be Queried:**
- Products with `visibleIn: []` are not searchable/queryable
- The `products(skus: [...])` GraphQL query only returns indexed/visible products
- 154 simple products (visible) were queryable ✅
- 101 variants (invisible) were NOT queryable ❌

**Old Detection Logic:**
```javascript
// Read 255 SKUs from local files
const allSKUs = [154 products + 101 variants];

// Query ACO to validate
const acoProducts = await queryACOProductsBySKUs(allSKUs);
// Returns: 154 (only visible products!)

// Delete only what was found
await deleteProducts(acoProducts); // Missing 101 variants ❌
```

## Solution: State Tracker as Source of Truth

**The state tracker records ALL successfully ingested products**, including:
- ✅ Visible products (`visibleIn: ["CATALOG", "SEARCH"]`)
- ✅ Invisible variants (`visibleIn: []`)

**New Detection Logic:**
```javascript
// Get ALL SKUs from state tracker (source of truth)
const stateTracker = getStateTracker();
const allSKUs = stateTracker.getAllProductSKUs(); // All 255!

// Delete ALL SKUs directly (no query needed)
await deleteProducts(allSKUs); // ✅ Deletes all 255
```

### Key Insight

**ACO's delete API works on invisible variants!**
- ✅ Can DELETE invisible variants by SKU
- ❌ Cannot QUERY invisible variants
- 💡 Don't query for detection, use state tracker instead

## Validation Strategy

### Two-Tier Validation

**1. Known Products (State Tracker)**
```javascript
const expectedSKUs = stateTracker.getAllProductSKUs();
const remaining = await queryACOProductsBySKUs(expectedSKUs);
// Note: Only finds visible products, but that's ok for validation
```

**2. Unknown Orphans (ACO Query)**
```javascript
const allProducts = await queryACOProductsDirect('', 500);
const buildRightOrphans = allProducts.filter(p => 
  p.sku.match(/^(LBR|DOOR|WINDOW|ROOF|DRYWALL|PLY|NAIL|SCREW|STUD)-/)
);
```

### Orphan Cleanup

When orphans are detected:
1. Query for known orphans (our ingested SKUs still present)
2. Query for unknown orphans (BuildRight products we didn't ingest)
3. Combine and delete all found orphans
4. Poll until cleanup completes

## Limitations

### Cannot Detect

❌ **Invisible variants we didn't ingest** - not queryable at all

**Why this is acceptable:**
- State tracker ensures we always know what we ingested
- Orphaned invisible variants can only occur if:
  1. Ingestion succeeded but state tracker failed to save (rare)
  2. Someone manually created invisible variants (shouldn't happen)
  3. Previous deletion used old non-state-tracker logic (one-time issue)

### Can Detect and Clean

✅ **Visible products we ingested** - queryable via `products(skus: [])`  
✅ **Visible products we didn't ingest** - queryable via `productSearch('')`  
✅ **Invisible variants we ingested** - deletable via state tracker SKUs

## Implementation

### Detection (`scripts/reset-all.js`)

```javascript
const { getStateTracker } = await import('../utils/aco-state-tracker.js');

const stateTracker = getStateTracker();
await stateTracker.load();
const skus = stateTracker.getAllProductSKUs(); // All 255 (154 + 101)

// Delete all tracked SKUs
await deleteProductsBySKUs(skus);
```

### Validation (`utils/smart-detector.js`)

```javascript
async validateClean() {
  // 1. Check expected SKUs from state tracker
  const expectedSKUs = stateTracker.getAllProductSKUs();
  const remaining = await this.queryACOProductsBySKUs(expectedSKUs);
  
  // 2. Check for unknown orphans
  const unknownOrphans = await this.queryACOProductsDirect('', 500);
  const buildRightOrphans = unknownOrphans.filter(/* BuildRight pattern */);
  
  // Report issues
  if (remaining.length > 0 || buildRightOrphans.length > 0) {
    return { clean: false, issues: [...] };
  }
  
  return { clean: true, issues: [] };
}
```

### Delete API Response

The ACO delete API provides validation through its response:

```javascript
const response = await client.deleteProducts(productDeletes);
const accepted = response.data?.acceptedCount; // How many actually existed
const rejected = skus.length - accepted;       // How many didn't exist

// If rejected > 0, those SKUs don't exist in ACO (safe to ignore)
```

## Benefits

1. ✅ **Accurate**: Deletes ALL 255 products (154 visible + 101 invisible)
2. ✅ **Validated**: State tracker is authoritative source
3. ✅ **Safe**: ACO's delete API validates SKU existence
4. ✅ **Comprehensive**: Detects both known and unknown orphans
5. ✅ **Self-healing**: Auto-cleanup removes orphans in 3 attempts

## State Tracker Hygiene

The state tracker is cleared after successful deletion:

```javascript
if (validation.clean) {
  stateTracker.clearAll();
  await stateTracker.save();
}
```

This ensures:
- Clean slate for next ingestion
- No stale SKUs accumulate
- Validation always uses current data

