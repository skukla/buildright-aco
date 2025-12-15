# BuildRight ACO

**Adobe Commerce Optimizer (ACO) data management for the BuildRight B2B demo system**

This repository handles ACO ingestion for products, variants, price books, and pricing data. It complements [buildright-commerce](../buildright-commerce) which acts as the source of truth for product catalog data.

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Access to Adobe Commerce Optimizer instance
- Valid ACO API credentials (configured in `.env`)

### Setup
```bash
npm install
cp .env.example .env  # Configure your ACO credentials
```

### Deploy Demo Data
```bash
# Full deployment (all data)
npm run import

# Individual ingestion steps
npm run import:metadata    # Product attributes
npm run import:products    # Simple products
npm run import:variants    # Configurable variants
npm run import:price-books # Price book structure
npm run import:prices      # SKU-level pricing
```

### Delete Demo Data
```bash
# Delete all data
npm run delete

# Delete only products (keep pricing)
npm run delete:products
```

---

## Repository Structure

```
buildright-aco/
├── data/
│   └── prices/                      # Source configurations (human-friendly)
│       ├── price-book-definitions.json  # Price book structure
│       └── price-tier-rules.json        # Tier pricing rules
│
├── output/buildright/               # Generated ingestion files (committed)
│   ├── metadata.json                # → from Commerce transform
│   ├── products.json                # → from Commerce transform
│   ├── variants.json                # → from Commerce transform
│   ├── price-books.json             # → from ACO generator
│   └── prices.json                  # → from ACO generator
│
├── scripts/
│   ├── prices/                      # Price generation & ingestion (5 files)
│   ├── products/                    # Product ingestion (3 files)
│   ├── attributes/                  # Metadata ingestion (1 file)
│   ├── workflows/                   # Orchestration scripts (5 files)
│   ├── shared/                      # Utilities & helpers (36 files)
│   └── tools/                       # Dev tools (5 files)
│
├── docs/                            # Documentation (organized by type)
│   ├── INDEX.md                     # Documentation hub
│   ├── CURRENT-STATE.md             # Repository snapshot
│   ├── guides/                      # User guides (3 files)
│   ├── api/                         # API documentation (2 files)
│   ├── architecture/                # System design (2 files)
│   ├── operations/                  # Operational guides (2 files)
│   └── archive/                     # Historical docs (13 files)
│
└── tests/
    ├── unit/                        # Unit tests
    ├── integration/                 # Integration tests
    └── manual/                      # Manual test scripts (11 files)
```

---

## Data Flow

### Flow 1: Commerce → ACO Product Data

**Source of Truth:** [buildright-commerce](../buildright-commerce)

```
buildright-commerce
  ↓ npm run generate (5s)
  ↓ creates: scripts/output/buildright-datapack/
  ↓
  ↓ npm run transform:aco (1s)
  ↓ transforms: ACCS format → ACO format
  ↓ outputs to: buildright-aco/output/buildright/
  ├── metadata.json
  ├── products.json
  └── variants.json

buildright-aco
  ↓ npm run generate:all (1s)
  ↓ creates:
  ├── price-books.json
  └── prices.json
  ↓
  ↓ npm run import (90s)
  ↓ ingests all 5 files → ACO
```

### Flow 2: ACO Price Generation

**Source:** `data/prices/*.json` (local configs)

```
data/prices/
├── price-book-definitions.json  (defines tiers: Retail, Trade, Builder, Wholesale)
└── price-tier-rules.json        (quantity breakpoints & discounts)
  ↓
  ↓ npm run generate:all
  ↓
output/buildright/
├── price-books.json             (5 price books)
└── prices.json                  (1,405 price rules)
  ↓
  ↓ npm run import:price-books
  ↓ npm run import:prices
  ↓
ACO
```

---

## Key Documentation

- **[Documentation Index](docs/INDEX.md)** - Complete documentation hub
- **[Current State](docs/CURRENT-STATE.md)** - Repository structure & metrics
- **[Commands Guide](docs/guides/COMMANDS.md)** - All npm scripts
- **[Setup Guide](docs/guides/SETUP-GUIDE.md)** - Getting started
- **[Data Flows](../buildright-commerce/docs/DATA-FLOWS.md)** - End-to-end system flows (in Commerce repo)
- **[ACO Ingestion Requirements](../buildright-commerce/docs/ACO-INGESTION-REQUIREMENTS-2025-12-15.md)** - What ACO ingests & format specs

---

## Development

### Generate Pricing Data
```bash
npm run generate:all      # Generate price-books.json & prices.json
```

### Validate Data
```bash
npm run validate:schema     # Validate against ACO schema
npm run validate:ingestion  # Verify data in ACO
```

### Query ACO
```bash
npm run fetch:catalog-views       # List all catalog views
npm run fetch:catalog-views:json  # JSON output
```

---

## Related Repositories

- **[buildright-commerce](../buildright-commerce)** - Source of truth for products, variants, attributes
- **[buildright-service](../buildright-service)** - Main service integrating Commerce & ACO
- **[buildright-eds](../buildright-eds)** - Edge Delivery Services (product images & content)

---

## Features

### 🔄 Automated Data Management
- **Transform:** Commerce ACCS → ACO format
- **Generate:** Dynamic price books & tier pricing
- **Ingest:** Parallel batch processing for speed
- **Delete:** State-tracked smart deletion with orphan cleanup

### 💰 B2B Pricing Model
- **5 Persona-Driven Price Books:**
  - US-Retail (Base)
  - Retail-Registered (+5%)
  - Trade-Professional (+10%)
  - Production-Builder (+15%)
  - Wholesale-Reseller (+25%)
- **Quantity Tier Discounts:** Category-specific volume breakpoints

### 🏗️ Locality of Behavior (LOB)
- **Feature-Based Organization:** All related code grouped by feature
- **Shared Utilities:** 36 consolidated helpers in `scripts/shared/`
- **Clear Separation:** Source configs (data/) vs. generated outputs (output/)

---

## License

Proprietary - Adobe Internal Demo System

---

## Support

For questions or issues:
1. Check [docs/INDEX.md](docs/INDEX.md)
2. Review [DATA-FLOWS.md](../buildright-commerce/docs/DATA-FLOWS.md)
3. See Commerce repo's [ACO-REPOSITORY-AUDIT-2025-12-15.md](../buildright-commerce/docs/ACO-REPOSITORY-AUDIT-2025-12-15.md)
