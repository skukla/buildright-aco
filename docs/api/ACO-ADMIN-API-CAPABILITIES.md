# ACO Admin API Capabilities

## Overview

The **Adobe Commerce Optimizer (ACO) Admin API** is a GraphQL-based interface designed specifically for **administrative operations** within Adobe Commerce Optimizer. It is architecturally distinct from the **Catalog Service GraphQL API** (storefront-focused) and the **Data Ingestion REST API** (for bulk data uploads).

## API Endpoint

### Base URL Structure

```
https://{region}-{environment}.api.commerce.adobe.com/{tenantId}/admin/graphql
```

**Parameters:**
- `region`: Cloud region where your instance is deployed (e.g., `na1`, `eu1`)
- `environment`: Environment type
  - `sandbox` for non-production (e.g., `na1-sandbox`)
  - Production URLs omit the `-sandbox` suffix (e.g., `na1`)
- `tenantId`: Unique identifier for your organization's ACO instance

**Example:**
```
https://na1-sandbox.api.commerce.adobe.com/X2duJmy3FaTKf1Mmr4GiQY/admin/graphql
```

## Authentication

### Bearer Token

All Admin API requests require authentication via a bearer token in the request header:

```http
Authorization: Bearer {accessToken}
```

### Token Generation

The bearer token is generated using OAuth 2.0 client credentials from your Adobe Developer Project:

```javascript
const params = new URLSearchParams({
  grant_type: 'client_credentials',
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  scope: 'openid,AdobeID,additional_info.projectedProductContext'
});

const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params.toString()
});

const { access_token } = await response.json();
```

**Token Validity:** 24 hours

### Required Headers

```http
Content-Type: application/json
Authorization: Bearer {accessToken}
x-api-key: {clientId}
```

## Confirmed Capabilities

### 1. Catalog Views Management

The `catalogViews` query is **confirmed working** and provides administrative access to catalog view configurations.

**Query:**
```graphql
query {
  catalogViews {
    items {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
}
```

**Response Example:**
```json
{
  "data": {
    "catalogViews": {
      "items": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "US Retail",
          "description": "Default US retail catalog view",
          "createdAt": "2024-01-15T10:30:00Z",
          "updatedAt": "2024-06-20T14:22:00Z"
        }
      ]
    }
  }
}
```

**Use Cases:**
- Mapping persona names to catalog view UUIDs
- Validating catalog view configuration
- Documenting available views for integration

### 2. Policies Configuration

The Admin API supports **policies management** for defining merchandising rules, product visibility, and channel-specific configurations.

**Documented Use Cases:**
- Define policies for product presentation
- Configure rules for customer segments
- Manage channel-specific merchandising

> **Note:** Specific query syntax for policies is not yet tested in our codebase but is confirmed available per Adobe documentation.

## Known Limitations

### ❌ Product Listing Not Available

The Admin API **does not provide** queries for listing products. Adobe's architecture separates concerns:

- **Admin API**: Administrative operations (catalog views, policies)
- **Catalog Service GraphQL API** (storefront): Product queries (`products(skus)`, `productSearch`)
- **Data Ingestion REST API**: Bulk data uploads (products, metadata, prices)

**Why This Matters:**
- Cannot use Admin API to discover all products for deletion
- Cannot query products by namespace or attribute
- **Fallback Strategy Required:** Use local generated files as source of truth for deletion

### ❌ Price Books Not Available

The `priceBooks` field does not exist in the Admin API GraphQL schema.

**Tested Queries (All Failed):**
```graphql
query { priceBooks { items { id name } } }  # ❌ Field not found
query { priceBooks { id name } }            # ❌ Field not found
```

**Why This Matters:**
- Cannot query ACO to discover all price books
- **Fallback Strategy Required:** Use local generated files for deletion

### ❌ Metadata Not Available

Queries for `metadata`, `productMetadata`, or `attributes` are not supported in the Admin API.

**Why This Matters:**
- Cannot query ACO to discover all metadata entities
- **Fallback Strategy Required:** Use local generated files for deletion

### ❌ Introspection Disabled

GraphQL introspection is disabled on the Admin API endpoint for security reasons:

```json
{
  "errors": [{
    "message": "introspection has been disabled",
    "extensions": { "code": "INTROSPECTION_DISABLED" }
  }]
}
```

**Impact:**
- Cannot programmatically discover schema
- Must rely on Adobe documentation for available queries
- Cannot auto-generate TypeScript types from schema

## Architectural Implications

### ACO's API Design Philosophy

Adobe Commerce Optimizer uses a **separation of concerns** architecture:

| API | Purpose | Endpoint | Queries |
|-----|---------|----------|---------|
| **Admin API** | Administrative config | `/admin/graphql` | `catalogViews`, policies |
| **Catalog Service API** | Storefront product data | `/graphql` | `products(skus)`, `productSearch` (requires Live Search) |
| **Data Ingestion API** | Bulk data uploads | `/rest` | REST endpoints for POST/PUT/DELETE |

### Why Product Queries Aren't in Admin API

1. **Performance**: Product queries are high-volume, storefront-focused operations
2. **Separation**: Admin operations (config) vs. data operations (CRUD) vs. storefront (query)
3. **Scalability**: Storefront queries use different infrastructure (CDN, search indices)

### Implications for Deletion Strategy

Since the Admin API cannot list products, price books, or metadata, our deletion strategy must:

1. **Primary Source of Truth**: Use **local generated files** (products.json, price-books.json, metadata.json)
2. **Validation**: Use REST API (if available) or SDK methods for confirmation
3. **State Tracking**: Maintain `.aco-state.json` to track what was successfully ingested
4. **Defensive**: Accept that orphaned data may exist if files are lost or corrupted

This is **not a limitation of our code**, but rather an **architectural constraint of the ACO platform**.

## Comparison: ACO Admin API vs. Commerce REST API

| Feature | ACO Admin API | Commerce REST API |
|---------|---------------|-------------------|
| List all products | ❌ No | ✅ Yes (`/rest/V1/products`) |
| List by attribute | ❌ No | ✅ Yes (search criteria) |
| List by SKU prefix | ❌ No | ✅ Yes (search criteria) |
| List by category | ❌ No | ✅ Yes (search criteria) |
| Introspection | ❌ Disabled | N/A (REST) |
| Catalog Views | ✅ Yes | N/A |

**Key Takeaway**: Commerce provides far more query flexibility for "list all X" operations, while ACO's Admin API is purpose-built for administrative configuration only.

## Recommendations

### ✅ Use Admin API For:
- Fetching catalog view UUIDs for persona mapping
- Validating catalog view configuration
- Future: Policy configuration (when needed)

### ❌ Do NOT Use Admin API For:
- Listing products for deletion
- Discovering price books
- Querying metadata entities
- Any "list all" operations

### ✅ Use Local Files For:
- Source of truth for deletion operations
- Tracking what entities were created
- Idempotency and resume capabilities

### ✅ Use State Tracker For:
- Recording successful ingestions
- Validation during deletion
- Detecting orphaned data

## Future Exploration

### Potential Admin API Queries to Test

1. **Policies**
   ```graphql
   query { policies { items { id name rules } } }
   ```

2. **Merchandising Rules**
   ```graphql
   query { merchandisingRules { items { id name conditions } } }
   ```

3. **Sync Status**
   ```graphql
   query { syncStatus { lastSync status errors } }
   ```

### Documentation References

- [ACO Admin API Official Docs](https://developer.adobe.com/commerce/services/optimizer/admin/using-the-api/)
- [Data Ingestion API Docs](https://developer.adobe.com/commerce/services/optimizer/data-ingestion/using-the-api/)
- [Merchandising Services API Reference](https://developer.adobe.com/commerce/services/reference/)

## Summary

The ACO Admin API is **purpose-built for administrative configuration**, not data queries. This is an intentional architectural decision by Adobe. Our deletion strategy correctly adapts to this by:

1. Using local files as the source of truth
2. Maintaining a state tracker for validation
3. Accepting that ACO's API design differs fundamentally from Commerce's REST API

This approach is **robust, defensible, and aligned with ACO's architecture**.

