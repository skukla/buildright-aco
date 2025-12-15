# Deprecated Generators

These generators have been moved here because **Commerce is now the source of truth** for catalog data.

## Moved to Commerce

The following generators are now in `buildright-commerce`:

- ✅ **generate-products.js** → Commerce generates simple products
- ✅ **generate-variants.js** → Commerce generates configurables + children
- ✅ **generate-categories.js** → Commerce generates catalog categories
- ✅ **generate-metadata.js** → Commerce generates product attributes
- ✅ **product-definitions.js** → Commerce owns product definitions

## Architecture

**Commerce as Source:**
```
buildright-commerce/
  scripts/config/product-definitions.js  (source)
  scripts/generators/generate-products.js
  scripts/generators/generate-variants.js
  scripts/generate-datapack.js
  scripts/transform-for-aco.js  → outputs to buildright-aco/data/
```

**ACO Ingests:**
```
buildright-aco/
  data/buildright/*.json  (from Commerce transform)
  scripts/generate-price-books.js  (ACO-specific)
  scripts/generate-prices.js  (ACO-specific)
  scripts/ingest-*.js  (ingests to ACO)
```

## What ACO Still Generates

ACO only generates **pricing and personalization** features:

- ✅ `generate-price-books.js` - Pricing tiers (Sarah/Joe/guest)
- ✅ `generate-prices.js` - Price data for products
- 🆕 `generate-bundles.js` - Personalized bundles (future)

## Migration Date

These generators were deprecated on 2025-12-15 as part of the "Commerce as Source" architecture refactor.

See: buildright-commerce commit 9df1006

