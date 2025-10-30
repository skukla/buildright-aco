# Adobe Commerce Optimizer (ACO) API Schema Documentation

## Overview

This document describes the actual ACO Product Ingestion API schema based on the `@adobe-commerce/aco-ts-sdk` TypeScript definitions.

## FeedProduct Interface

The `createProducts()` method accepts an array of `FeedProduct` objects.

### Required Fields

```typescript
interface FeedProduct {
  sku: string;              // Unique product identifier
  source: Source;           // Content locale object
  name: string;             // Product name
  slug: string;             // URL key for the product
  status: FeedProductStatusEnum; // "ENABLED" or "DISABLED"
}
```

### Optional Fields

```typescript
interface FeedProduct {
  // ... required fields above

  description?: string;                    // Main description
  shortDescription?: string;               // Short description
  visibleIn?: FeedProductVisibleInEnum[];  // ["CATALOG", "SEARCH"]
  metaTags?: ProductMetaAttribute;         // SEO meta tags
  attributes?: ProductAttribute[];         // Product attributes
  images?: ProductImage[];                 // Product images
  links?: ProductLink[];                   // Linked SKUs (e.g., variants)
  routes?: ProductRoutes[];                // URL paths
  configurations?: ProductConfiguration[]; // For configurable products
  bundles?: ProductBundle[];               // For bundle products
  externalIds?: ProductExternalId[];       // External system IDs
}
```

## Important Type Definitions

### Source (Required Object)

```typescript
interface Source {
  locale: string; // e.g., "en-US"
}
```

### FeedProductStatusEnum (Required)

```typescript
enum FeedProductStatusEnum {
  Enabled = "ENABLED",   // Must be uppercase
  Disabled = "DISABLED"  // Must be uppercase
}
```

### FeedProductVisibleInEnum (Optional)

```typescript
enum FeedProductVisibleInEnum {
  Catalog = "CATALOG",  // Visible on PLP and PDP
  Search = "SEARCH"     // Visible on search results and PDP
}
```

### ProductAttribute

```typescript
interface ProductAttribute {
  code: string;              // Attribute code (e.g., "category", "material")
  values: string[];          // Array of values (NOT singular "value"!)
  variantReferenceId?: string; // For configurable product variants
}
```

### ProductRoutes

```typescript
interface ProductRoutes {
  path: string;      // URL path (e.g., "/structural-materials/lumber")
  position?: number; // Position in URL path (default: 0)
}
```

### ProductMetaAttribute

```typescript
interface ProductMetaAttribute {
  title?: string;       // Meta title
  description?: string; // Meta description
  keywords?: string;    // Meta keywords
}
```

## Schema Mismatch Analysis

### Our Generated Schema (INCORRECT)

```json
{
  "sku": "BR-LUM-2X4-8",
  "type": "simple",
  "name": "2x4x8 Lumber",
  "status": "enabled",
  "visibility": "visible",
  "price": 5.99,
  "weight": 10.5,
  "description": "...",
  "shortDescription": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "metaKeywords": "...",
  "attributes": [
    {
      "code": "category",
      "value": "structural_materials"
    }
  ],
  "routes": [
    {
      "categoryId": "cat_007"
    }
  ]
}
```

### ACO Expected Schema (CORRECT)

```json
{
  "sku": "BR-LUM-2X4-8",
  "source": {
    "locale": "en-US"
  },
  "name": "2x4x8 Lumber",
  "slug": "2x4x8-lumber",
  "status": "ENABLED",
  "description": "...",
  "shortDescription": "...",
  "visibleIn": ["CATALOG", "SEARCH"],
  "metaTags": {
    "title": "...",
    "description": "...",
    "keywords": "..."
  },
  "attributes": [
    {
      "code": "category",
      "values": ["structural_materials"]
    }
  ],
  "routes": [
    {
      "path": "/structural-materials/lumber"
    }
  ]
}
```

## Key Differences

### 1. Missing Required Fields

❌ **Missing:** `source` object with `locale`
❌ **Missing:** `slug` (URL key)

### 2. Status Field Format

❌ **Wrong:** `"status": "enabled"` (lowercase string)
✅ **Correct:** `"status": "ENABLED"` (uppercase enum)

### 3. Attributes Structure

❌ **Wrong:** `{"code": "category", "value": "structural_materials"}`
✅ **Correct:** `{"code": "category", "values": ["structural_materials"]}`

**Key difference:** `value` (singular) → `values` (array)

### 4. Routes Structure

❌ **Wrong:** `{"categoryId": "cat_007"}`
✅ **Correct:** `{"path": "/structural-materials/lumber"}`

**Key difference:** `categoryId` → `path` (URL path, not ID)

### 5. Visibility

❌ **Wrong:** `"visibility": "visible"` (custom string)
✅ **Correct:** `"visibleIn": ["CATALOG", "SEARCH"]` (array of enums)

### 6. Meta Tags

❌ **Wrong:** Flat fields: `metaTitle`, `metaDescription`, `metaKeywords`
✅ **Correct:** Nested object: `metaTags: { title, description, keywords }`

### 7. Fields That Don't Exist in ACO Schema

The following fields we generated are **NOT** part of the FeedProduct interface:

- `type` (not needed - inferred from product structure)
- `visibility` (use `visibleIn` instead)
- `price` (managed separately via pricing API)
- `weight` (not in FeedProduct schema)
- `metaTitle`, `metaDescription`, `metaKeywords` (use `metaTags` object)

## Additional Product Types

### Configurable Products

Require both parent and variant products:

**Parent Product:**
```json
{
  "sku": "BR-SHIRT-CONFIG",
  "source": {"locale": "en-US"},
  "name": "Configurable Shirt",
  "slug": "configurable-shirt",
  "status": "ENABLED",
  "configurations": [
    {
      "attributeCode": "color",
      "label": "Color",
      "type": "CONFIGURABLE",
      "values": [
        {
          "variantReferenceId": "red-ref",
          "label": "Red"
        }
      ]
    }
  ]
}
```

**Variant Product:**
```json
{
  "sku": "BR-SHIRT-RED",
  "source": {"locale": "en-US"},
  "name": "Red Shirt",
  "slug": "red-shirt",
  "status": "ENABLED",
  "attributes": [
    {
      "code": "color",
      "values": ["red"],
      "variantReferenceId": "red-ref"
    }
  ],
  "links": [
    {
      "type": "PARENT",
      "sku": "BR-SHIRT-CONFIG"
    }
  ],
  "visibleIn": []
}
```

### Bundle Products

```json
{
  "sku": "BR-BUNDLE-001",
  "source": {"locale": "en-US"},
  "name": "Construction Bundle",
  "slug": "construction-bundle",
  "status": "ENABLED",
  "bundles": [
    {
      "group": "Tools",
      "required": true,
      "multiSelect": false,
      "items": [
        {
          "sku": "BR-TOOL-001",
          "qty": 1
        }
      ]
    }
  ]
}
```

## Next Steps

1. Update all generation scripts to match this schema
2. Add `source` field with locale
3. Add `slug` field (URL-friendly version of name)
4. Change `status` from "enabled" to "ENABLED"
5. Change attributes from `value` to `values` array
6. Change routes from `categoryId` to `path`
7. Remove unsupported fields: `type`, `visibility`, `price`, `weight`
8. Consolidate meta fields into `metaTags` object
9. Add `visibleIn` array for product visibility

## References

- SDK Package: `@adobe-commerce/aco-ts-sdk`
- Type Definitions: `node_modules/@adobe-commerce/aco-ts-sdk/dist/index.d.ts`
- Interface: `FeedProduct` (line 525)
- Method: `createProducts(data: FeedProduct[])` (line 1790)
