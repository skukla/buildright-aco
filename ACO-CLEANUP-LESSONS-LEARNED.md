# ACO Cleanup: Lessons Learned

**📊 Document Type**: Post-Mortem / Knowledge Base  
**📅 Date**: 2024-11-26  
**🎯 Purpose**: Document what we learned about ACO data management

---

## Summary

Successfully cleaned duplicate products from ACO and established proper query/delete workflows.

**Problem**: 349 products in ACO (84 old + 265 new = duplicates)  
**Solution**: Query all products via GraphQL → Delete all → Re-ingest clean  
**Result**: ✅ Exactly 265 products in ACO

---

## Key Learnings

### 1. ACO Has TWO Product Views

| View | Purpose | Latency | Query Method |
|------|---------|---------|--------------|
| **Catalog Feed** | Source of truth | Real-time | Feed API (SDK) |
| **GraphQL Search** | Search/query interface | 5-30 min lag | GraphQL API |

**Important**: Always check **both** views when validating data:
- **ACO Web UI** shows Catalog Feed (real-time, accurate)
- **GraphQL queries** show Search Index (delayed, may be stale)

---

### 2. Correct GraphQL Headers for ACO

**❌ WRONG (Magento headers - don't work)**:
```javascript
{
  'Magento-Website-Code': 'base',
  'Magento-Store-Code': 'default',
  'Magento-Store-View-Code': 'default',
  'X-Api-Key': 'some-key'
}
```

**✅ CORRECT (ACO headers - required)**:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
  'AC-Environment-Id': 'X2duJmy3FaTKf1Mmr4GiQY',  // Your tenant ID
  'AC-Source-Locale': 'en-US'
  // Optional:
  // 'AC-View-Id': 'fa57b1c1-8a23-42c1-be83-ad74df501fc2',
  // 'AC-Price-Book-Id': 'gb-retail'
}
```

**Source**: Adobe colleague feedback

---

### 3. Query All Products with GraphQL

**❌ WRONG (returns "No index found")**:
```graphql
query {
  productSearch(phrase: "*") {  # Asterisk doesn't work
    items { ... }
  }
}
```

**✅ CORRECT (returns all products)**:
```graphql
query {
  productSearch(phrase: " ") {  # Space character works!
    total_count
    page_info {
      current_page
      total_pages
    }
    items {
      productView {
        sku
        name
      }
    }
  }
}
```

**Key**: Use `phrase: " "` (space) not `phrase: "*"` (asterisk)

---

### 4. Proper Delete Workflow

**Step 1: Query All Products**
```javascript
import { queryAllProducts } from './utils/aco-graphql-query.js';

const products = await queryAllProducts();
const allSKUs = products.map(p => p.sku);
console.log(`Found ${allSKUs.length} products`);
```

**Step 2: Delete Products**
```javascript
import { getACOClient } from './utils/aco-client.js';

const client = getACOClient();

// Format: array of objects with sku + source
const deleteItems = allSKUs.map(sku => ({
  sku,
  source: { locale: 'en-US' }
}));

const response = await client.deleteProducts(deleteItems);
console.log(`Deleted: ${response.data.acceptedCount}`);
```

**Step 3: Verify Deletion**
```javascript
import { getProductCount } from './utils/aco-graphql-query.js';

const count = await getProductCount();
console.log(`Remaining products: ${count}`);
```

**Step 4: Re-Ingest Clean Data**
```bash
npm run ingest:all
```

---

### 5. Why Original Reset Script Failed

**Problem**: `reset-all.js` only deleted products from **local JSON files**

```javascript
// OLD APPROACH (doesn't work for orphaned products)
const localSKUs = getAllProductSKUs(); // Only from local files
await deleteProductsBySKUs(localSKUs); // Misses old/orphaned products
```

**Solution**: Query ACO directly for ALL products

```javascript
// NEW APPROACH (works for all products)
const acoProducts = await queryAllProducts(); // From ACO GraphQL
const allSKUs = acoProducts.map(p => p.sku);
await deleteProductsBySKUs(allSKUs); // Deletes everything
```

---

### 6. ACO SDK Limitations

The ACO TypeScript SDK **does NOT provide**:
- ❌ `listProducts()` - No method to list/query products
- ❌ `getProducts()` - No method to fetch all products
- ❌ `queryProducts()` - No method to search products

The ACO TypeScript SDK **only provides**:
- ✅ `createProducts()` - Ingest products
- ✅ `updateProducts()` - Update existing products
- ✅ `deleteProducts()` - Delete products **by SKU** (must know SKUs)

**Solution**: Use GraphQL API to query, SDK to delete

---

## Updated Reset Workflow

### New Script: `scripts/reset-all-from-aco.js`

```javascript
import { queryAllProducts } from '../utils/aco-graphql-query.js';
import { getACOClient } from '../utils/aco-client.js';

async function resetAllFromACO() {
  console.log('Step 1: Query ALL products from ACO...');
  const products = await queryAllProducts();
  const skus = products.map(p => p.sku);
  
  console.log(`Found ${skus.length} products in ACO`);
  
  if (skus.length === 0) {
    console.log('✅ ACO is already empty');
    return;
  }
  
  console.log('Step 2: Delete all products...');
  const client = getACOClient();
  const deleteItems = skus.map(sku => ({
    sku,
    source: { locale: 'en-US' }
  }));
  
  const response = await client.deleteProducts(deleteItems);
  console.log(`✅ Deleted ${response.data.acceptedCount} products`);
}
```

**Usage**:
```bash
node scripts/reset-all-from-aco.js
npm run ingest:all
```

---

## Files Created/Updated

### New Files
- ✅ `utils/aco-graphql-query.js` - GraphQL utilities with correct headers
- ✅ `ACO-CLEANUP-LESSONS-LEARNED.md` - This document

### Files to Update
- ⏭️ `scripts/reset-all.js` - Use `queryAllProducts()` instead of local files
- ⏭️ `utils/aco-query.js` - Update to use correct headers
- ⏭️ `package.json` - Add `reset:from-aco` script

---

## Recommended npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "reset:from-aco": "node scripts/reset-all-from-aco.js",
    "reset:clean": "npm run reset:from-aco && npm run ingest:all",
    "aco:count": "node -e \"import('./utils/aco-graphql-query.js').then(m => m.getProductCount().then(c => console.log('Products in ACO:', c)))\"",
    "aco:list": "node -e \"import('./utils/aco-graphql-query.js').then(m => m.queryAllProducts().then(p => p.forEach(x => console.log(x.sku, x.name))))\""
  }
}
```

**Usage**:
```bash
npm run aco:count          # Check product count
npm run aco:list           # List all products
npm run reset:clean        # Complete reset + re-ingest
```

---

## Current State (2024-11-26 18:50 PST)

✅ **ACO Catalog**: 265 products (clean)
- 154 simple products
- 96 variant products
- 15 bundle products
- 5 price books
- 1,325 prices

✅ **Product Categories Expanded**:
- Concrete & Foundation (6 products)
- Electrical Systems (8 products)
- Plumbing Pipes & Fittings (9 products)
- HVAC Systems (10 products)
- Drywall & Supplies (7 products)
- Kitchen Appliances (8 products)

✅ **New UOMs Added**:
- CY (Cubic Yard), SQ (Square 100sqft), SY (Square Yard)
- BUCKET (5-gal), TON (HVAC), KIT (Assortments)

---

## Next Steps

1. ✅ **Complete**: Product catalog expanded and ingested
2. ⏭️ **Next**: Build BOM calculator service
3. ⏭️ **Next**: Document persona product reuse process
4. ⏭️ **Next**: Test end-to-end Sarah workflow

---

**Last Updated**: 2024-11-26 18:50 PST  
**Status**: ✅ ACO Clean, Ready for BOM Work








