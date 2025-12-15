# ACO GraphQL Query Behaviors

## Summary of Learned Behaviors

This document captures critical findings about how ACO's GraphQL queries work, discovered through testing.

## Query Types

### 1. `products(skus: [...])`

**Purpose:** Look up specific products by SKU

**Behavior:**
- ✅ **NOT filtered by catalog view** - Returns products based on SKU alone
- ✅ Works with or without `AC-View-Id` header (header is ignored)
- ⚠️ **Requires Live Search indexing** (5-10 minute delay after ingestion)
- ⚠️ Returns empty array for newly ingested products until indexing completes
- ✅ Silently returns `[]` on error (doesn't throw)

**Headers:**
```javascript
{
  'AC-Environment-Id': '<tenant-id>',  // Required
  'AC-Source-Locale': 'en-US',         // Required
  'AC-View-Id': '<view-id>'            // Optional (ignored - has no effect)
}
```

**Use Case:**
- Product validation (does SKU exist in ACO?)
- Deletion verification (is product gone?)
- NOT suitable for checking catalog view membership

**Example:**
```graphql
query {
  products(skus: ["SKU-001", "SKU-002"]) {
    sku
    name
  }
}
```

---

### 2. `productSearch(phrase: "", page_size: N)`

**Purpose:** Search/browse products with filtering

**Behavior:**
- ✅ **IS filtered by catalog view** - Only returns products visible in specified view
- ✅ Respects catalog view policies and assignments
- ⚠️ **Requires Live Search indexing** (5-10 minute delay after ingestion)
- ⚠️ Returns `total_count: 0` for newly ingested products until indexing completes
- ✅ Returns different results per catalog view

**Headers:**
```javascript
{
  'AC-Environment-Id': '<tenant-id>',      // Required
  'AC-Source-Locale': 'en-US',             // Required
  'AC-View-Id': '<view-id>',               // Optional but recommended
  'AC-Price-Book-Id': '<price-book-id>'    // Optional
}
```

**Use Case:**
- Frontend product browsing
- Catalog view validation (which products are in this view?)
- Testing product visibility per persona

**Example:**
```graphql
query {
  productSearch(phrase: "", page_size: 10) {
    total_count
    items {
      productView {
        sku
        name
      }
    }
  }
}
```

---

## Indexing Delay

**Key Finding:** Both queries require Live Search indexing.

**Timeline:**
- Products ingested via Data Ingestion API: **Immediate** (milliseconds)
- Products visible in ACO UI Data Sync page: **Immediate**
- Products queryable via GraphQL: **5-10 minutes later** (after indexing)

**Implications:**
- ❌ Cannot immediately validate ingestion
- ❌ Cannot immediately detect orphans
- ✅ Must poll with patience (10-minute timeout recommended)
- ✅ Look for "first movement" to confirm indexing started

**Polling Strategy:**
```javascript
const maxAttempts = 60; // 10 minutes
const pollInterval = 10000; // 10 seconds
let indexingStarted = false;

while (attempt < maxAttempts && notDone) {
  const result = await queryACOProductsBySKUs(skus);
  
  // Detect when indexing starts
  if (!indexingStarted && result.length > 0) {
    indexingStarted = true;
    console.log('✓ Indexing started');
  }
  
  // Calculate ETA based on rate of change
  // ...
}
```

---

## Catalog View Filtering

### Products Visibility Rules

Products appear in a catalog view when:
1. **Assigned to that view** (explicitly or via parent category)
2. **Match view policies** (if policies exist)
3. **Properly indexed** (5-10 min after ingestion)

### Query Behavior Summary

| Query | Filtered by Catalog View? | Use Case |
|-------|--------------------------|----------|
| `products(skus: [...])` | ❌ No | Validation (does SKU exist anywhere?) |
| `productSearch(phrase: "")` | ✅ Yes | Frontend (what's visible to this persona?) |

---

## Validation Best Practices

### ✅ DO:
- Use `products(skus: [...])` for existence checks
- Use `productSearch` for catalog view membership checks
- Poll with 10-minute timeout
- Track rate of change for dynamic ETA
- Show "waiting for indexing" messages

### ❌ DON'T:
- Assume products are queryable immediately after ingestion
- Give up after 2-3 minutes (indexing takes longer)
- Use `AC-View-Id` with `products(skus: [...])` expecting it to filter
- Rely on GraphQL queries without understanding indexing delay

---

## Related Documentation

- [ACO API Architecture](./ACO-API-ARCHITECTURE.md) - Overview of ACO's three APIs
- [Catalog View Setup Guide](./manual-setup/catalog-view-setup-guide.md) - How to configure views

