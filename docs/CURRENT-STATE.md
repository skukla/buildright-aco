# BuildRight-ACO Current State

**Date:** 2025-12-15  
**Status:** Pre-Reorganization Snapshot

## Quick Reference

### Scripts to Run
```bash
npm run generate:all      # Generate ACO pricing data
npm run import             # Ingest all data to ACO
npm run delete             # Delete all data from ACO
```

### Key Files
- **Config:** `config/aco-config.json`
- **Ingestion Data:** `data/buildright/*.json`
- **Pricing Configs:** `data/prices/*.json` (new)

## Current Data Files

### Data Structure (Before Reorganization)
```
data/buildright/
├── metadata.json                  (42 attributes)
├── products.json                  (146 simple products)
├── variants.json                  (135 variants)
├── price-books.json               (5 price books)
├── prices.json                    (1,405 price rules)
├── categories.json                (NOT USED in ingestion)
├── inventory.json                 (NOT USED in ingestion)
├── sources.json                   (NOT USED in ingestion)
└── bom-*.json files               (BOM service data only)
```

### What ACO Actually Ingests (5 files only)
1. `metadata.json` - Product attributes
2. `products.json` - Simple products
3. `variants.json` - Configurable variants
4. `price-books.json` - Price book definitions
5. `prices.json` - Price rules per SKU

## Scripts Organization (Before Reorganization)

### Flat Structure (39 files in scripts/)
```
scripts/
├── generate-price-books.js
├── generate-prices.js
├── generate-service-data.js
├── generate-eds-data.js
├── generate-all-parallel.js
├── ingest-metadata.js
├── ingest-products.js
├── ingest-variants.js
├── ingest-price-books.js
├── ingest-prices.js
├── ingest-all.js
├── reset-all.js
├── reset-price-books.js
├── fetch-catalog-views.js
├── query-aco-products.js
├── introspect-admin-api.js
├── validate-aco-schema.js
├── validate-ingestion.js
├── delete-orphans.js
├── delete-skus.js
├── force-delete-all-aco.js
├── config/                        (2 files)
├── utils/                         (5 files)
└── deprecated/                    (old scripts)
```

### Utilities (Duplicated Locations)
- `scripts/utils/` - 5 files
- `utils/` - 31 files (main location)

### Test Files
- **Root directory:** 11 test-*.js files
- **tests/ directory:** Organized test suites

## Documentation (Before Organization)

### Current Structure (19 files in docs/)
```
docs/
├── ACO-CLEANUP-LESSONS-LEARNED.md
├── ACO-FULL-IMPLEMENTATION-COMPLETE.md
├── ACO-QUERY-BEHAVIORS.md
├── ATTRIBUTE-LABELS-ADDED.md
├── BUILDRIGHT-CASE-STUDY*.md (3 versions)
├── COMMANDS.md
├── IMPLEMENTATION-COMPLETE-SUMMARY.md
├── METADATA-INGESTION-COMPLETE.md
├── METADATA-INGESTION-GUIDE.md
├── PRICING-STRATEGY.md
├── QUICK-REFERENCE-CARD.md
├── QUICK-WINS-IMPLEMENTATION-COMPLETE.md
├── REFACTORING-SUMMARY.md
├── SETUP-GUIDE.md/.html
├── SMART-DELETION-IMPLEMENTATION-COMPLETE.md
├── STATE-TRACKER-DELETION.md
├── VISUAL-SUMMARY.md
├── api/                           (2 files)
├── architecture/                  (1 file)
└── manual-setup/                  (multiple files)
```

## Reorganization Plan

### Target Structure (Feature-Based LOB)
```
scripts/
├── prices/                        ← NEW (5 files)
├── products/                      ← NEW (3 files)
├── attributes/                    ← NEW (1 file)
├── workflows/                     ← NEW (5 files)
├── shared/                        ← NEW (36 utilities consolidated)
├── tools/                         ← NEW (5 dev tools)
└── config/                        ← KEEP (2 files)

data/
├── prices/                        ← NEW (source configs)
│   ├── price-book-definitions.json
│   └── price-tier-rules.json

output/buildright/                 ← NEW (generated outputs)
├── metadata.json
├── products.json
├── variants.json
├── price-books.json
└── prices.json

tests/
├── e2e/
├── integration/
├── unit/
└── manual/                        ← NEW (11 test files from root)

docs/
├── INDEX.md                       ← NEW
├── CURRENT-STATE.md               ← THIS FILE
├── guides/                        ← NEW (4 files)
├── api/                           ← KEEP (2 files)
├── architecture/                  ← KEEP (1 file, add DATA-FLOWS.md)
├── operations/                    ← NEW (2 files)
└── archive/                       ← NEW (12 completed impl docs)
```

## Key Metrics

- **Scripts to Move:** 37 files
- **Imports to Update:** ~80 import statements
- **Package.json Scripts:** 14 to update
- **Documentation to Archive:** 12 files
- **Test Files to Move:** 11 files
- **Utils to Consolidate:** 36 files (from 2 locations)

## Next Steps

See [ACO-REPOSITORY-AUDIT-2025-12-15.md](../../buildright-commerce/docs/ACO-REPOSITORY-AUDIT-2025-12-15.md) for complete implementation plan.

**Current Phase:** Phase 1 - Foundation (In Progress)

