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

## Handling Orphaned Invisible Variants

### The Problem

If you have orphaned invisible variants (e.g., from old pre-state-tracker workflow):
- ❌ Cannot query them (not searchable)
- ❌ Normal validation won't find them
- ❌ They remain as ghosts in ACO

### The Solution: Seed State Tracker

**Populate the state tracker from local JSON files:**

```bash
npm run seed-state  # Loads SKUs from data/buildright/*.json into state tracker
npm run delete      # Deletes all tracked SKUs (including invisible variants)
```

**What it does:**
1. Reads `products.json` and `variants.json`
2. Adds all SKUs to state tracker (both visible + invisible)
3. Deletion script reads state tracker and deletes ALL SKUs

**When to use:**
- State tracker is empty but products exist in ACO
- You have orphaned invisible variants
- Migrating from old non-state-tracker workflow (one-time operation)

### Implementation

See `scripts/seed-state-from-files.js`:

```javascript
// Load local files
const products = JSON.parse(await fs.readFile('products.json'));
const variants = JSON.parse(await fs.readFile('variants.json'));
const allSkus = [...products.map(p => p.sku), ...variants.map(v => v.sku)];

// Seed state tracker
const stateTracker = getStateTracker();
allSkus.forEach(sku => stateTracker.markProductIngested(sku));
await stateTracker.save();
```

## Limitations

### Cannot Detect

❌ **Invisible variants we didn't ingest AND aren't in local files** - not queryable at all

**Why this is acceptable:**
- State tracker ensures we always know what we ingested
- `seed-state` script handles orphans from old workflows
- Orphaned invisible variants can only occur if:
  1. Someone manually created invisible variants outside our scripts (shouldn't happen)
  2. State tracker file corrupted AND local files deleted (extremely rare)

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

