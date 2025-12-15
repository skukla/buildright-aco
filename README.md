# BuildRight Catalog Definition Repository

> **Canonical Product Catalog Definitions for BuildRight Demo System**

This repository serves as the **data definition layer** for the BuildRight product catalog. It contains the authoritative definitions of products, bundles, variants, categories, and attributes that are imported into both Adobe Commerce and Adobe Commerce Operations (ACO).

---

## 🎯 Purpose

This is NOT just "ACO's repository" - it's the **BuildRight Catalog Definition Repository** that:

- ✅ Defines **what products exist** in the BuildRight catalog
- ✅ Specifies **business rules** (pricing, attributes, categories)
- ✅ Generates **canonical data files** that both Commerce and ACO import from
- ✅ Serves as the **single source of truth** for catalog definitions

---

## 🏗️ Architecture

### Two-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│  buildright-aco (THIS REPO)                             │
│  Product Catalog Definition Layer                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  - Product definitions (what products exist)            │
│  - Business rules (pricing, categorization)             │
│  - Attribute definitions (metadata schema)              │
│  - Generation scripts (create canonical data files)     │
└─────────────────────────────────────────────────────────┘
                          ↓
              Generated Data Files
              (data/buildright/*.json)
                          ↓
          ┌───────────────┴───────────────┐
          ↓                               ↓
┌─────────────────────┐         ┌─────────────────────┐
│  Commerce           │         │  ACO                │
│  (Operational)      │         │  (Enhanced Catalog) │
│  ━━━━━━━━━━━━━━━━━  │         │  ━━━━━━━━━━━━━━━━━  │
│  - Imports catalog  │         │  - Imports catalog  │
│  - Serves customers │         │  - Adds metadata    │
│  - SaaS syncs from  │         │  - Serves Mesh API  │
└─────────────────────┘         └─────────────────────┘
```

### Analogy: Database Schema

## 🚀 Quick Start

### Simple Two-Step Workflow

```bash
# 1. Clean slate
npm run delete

# 2. Fresh import
npm run import
```

**Result:** 255 products in ACO (154 simple + 101 variants) with verified state tracking

### From Commerce Orchestrator

```bash
# Run from buildright-commerce to orchestrate both systems
npm run delete    # Delete Commerce + ACO
npm run import    # Import to Commerce + ACO
```

📖 **[Full Commands Reference](./docs/COMMANDS.md)**

---

### Analogy: Database Schema

Think of this repository like a **database schema in version control**:

| Concept | Analogy | Repository |
|---------|---------|------------|
| **Schema Definition** | CREATE TABLE statements | **buildright-aco** (this repo) |
| **Production Database** | Live customer data | **buildright-commerce** |
| **Analytics Database** | Enhanced/aggregated views | **ACO instance** |

You keep the schema definition centralized and version-controlled, even though the production database is the "operational source of truth."

---

## 📁 Repository Structure

```
buildright-aco/
├── scripts/
│   ├── generate-products.js      # Generate product definitions
│   ├── generate-bundles.js       # Generate bundle definitions
│   ├── generate-variants.js      # Generate variant definitions
│   ├── generate-categories.js    # Generate category hierarchy
│   ├── generate-metadata.js      # Generate attribute definitions
│   ├── generate-price-books.js   # Generate pricing rules
│   ├── generate-prices.js        # Generate tier pricing
│   ├── ingest-*.js               # Ingest to ACO API
│   └── config/
│       ├── product-definitions.js     # Product data definitions
│       ├── bundle-definitions.js      # Bundle configurations
│       └── ingest-config.js           # ACO ingest settings
│
├── data/buildright/               # CANONICAL DATA FILES
│   ├── products.json              # ← Commerce & ACO read from here
│   ├── bundles.json               # ← Commerce & ACO read from here
│   ├── variants.json              # ← Commerce & ACO read from here
│   ├── categories.json            # ← Commerce & ACO read from here
│   ├── metadata.json              # ← Commerce & ACO read from here
│   ├── price-books.json           # ← ACO pricing configuration
│   └── prices.json                # ← ACO tier pricing
│
└── utils/
    ├── aco-client.js              # ACO API client
    └── ...                        # Helper utilities
```

---

## 🚀 Quick Start

### Generate Catalog Definitions

```bash
# Generate all catalog data files
npm run generate:all

# Or generate individually:
npm run generate:metadata      # Attributes (42 attributes)
npm run generate:categories    # Category tree (12 categories)
npm run generate:products      # Simple products (154 products)
npm run generate:variants      # Configurable products (96 products)
npm run generate:bundles       # Bundle products (12 bundles)
npm run generate:price-books   # Pricing tiers (18 price books)
npm run generate:prices        # Tier pricing (4716 prices)
```

**Output**: Generated files in `data/buildright/`

### Ingest to ACO

```bash
# Ingest all data to ACO
npm run ingest:all

# Or ingest individually:
npm run ingest:metadata
npm run ingest:products
npm run ingest:variants
npm run ingest:bundles
npm run ingest:price-books
npm run ingest:prices
```

---

## 🔄 Data Flow

### 1. Generate Canonical Data (This Repo)

```bash
cd buildright-aco
npm run generate:all
```

**Creates**:
- `data/buildright/products.json` (262 products)
- `data/buildright/metadata.json` (42 attributes)
- `data/buildright/categories.json` (12 categories)
- etc.

### 2. Import to Both Systems (Parallel)

**Commerce Import** (operational source):
```bash
cd ../buildright-commerce
npm run transform:metadata    # Transform ACO metadata to Commerce
npm run generate             # Generate Commerce datapack
npm run import:all           # Import to Commerce (20s with optimizations!)
```

**ACO Import** (enhanced catalog):
```bash
cd ../buildright-aco
npm run ingest:all           # Ingest to ACO (60s)
```

**Both can run in parallel!** Total time: ~60 seconds

### 3. SaaS Data Export (Optional - Background Sync)

After Commerce import, SaaS Data Export automatically syncs Commerce → Catalog Service → ACO.

This validates that both imports produced consistent data.

---

## 📊 Generated Data Summary

| Data Type | Count | File | Used By |
|-----------|-------|------|---------|
| Attributes | 42 | `metadata.json` | Commerce, ACO |
| Categories | 12 | `categories.json` | Commerce, ACO |
| Simple Products | 154 | `products.json` | Commerce, ACO |
| Configurable Products | 96 | `variants.json` | Commerce, ACO |
| Bundle Products | 12 | `bundles.json` | Commerce, ACO |
| Price Books | 18 | `price-books.json` | ACO only |
| Tier Prices | 4,716 | `prices.json` | ACO only |

**Total Products**: 262 (154 simple + 96 configurable + 12 bundles)

---

## 🎯 Use Cases

### Development: Fast Iteration

```bash
# 1. Generate catalog definitions
npm run generate:all

# 2. Import to both systems (parallel - use 2 terminals!)
cd ../buildright-commerce && npm run import:all    # Terminal 1
cd ../buildright-aco && npm run ingest:all          # Terminal 2

# 3. Test immediately (no waiting!)
cd ../buildright-eds && npm run dev

# Total time: ~60 seconds 🚀
```

### Production: Architectural Sync

```bash
# 1. Generate catalog definitions
npm run generate:all

# 2. Import to Commerce (operational source)
cd ../buildright-commerce && npm run import:all

# 3. Wait for SaaS Data Export sync (5-30 min)
bin/magento saas:resync --feed=products

# 4. ACO receives data automatically via Catalog Service

# Total time: ~30 minutes (validates architectural sync)
```

### Updating Product Data

```bash
# 1. Regenerate specific data
npm run generate:products

# 2. Re-import to both systems
cd ../buildright-commerce && npm run import:products
cd ../buildright-aco && npm run ingest:products

# 3. Changes appear immediately in frontend
```

---

## 🧪 Testing

### Verify Generated Data

```bash
# Validate JSON schemas
npm run validate:schema

# Check ingestion status
npm run validate:ingestion
```

### Clean & Regenerate

```bash
# Delete all ACO data
npm run reset:all

# Regenerate and re-ingest
npm run generate:all
npm run ingest:all
```

---

## 📚 Key Concepts

### Catalog Definitions vs Operational Data

| Layer | What | Where | Purpose |
|-------|------|-------|---------|
| **Definition Layer** | Product catalog schema | **buildright-aco** (this repo) | Defines what products exist |
| **Operational Layer** | Live customer data | **buildright-commerce** | Serves customer transactions |
| **Enhanced Layer** | Metadata & relationships | **ACO instance** | Advanced catalog features |

### Why This Architecture?

1. **DRY Principle**: Define products once, use everywhere
2. **Single Source**: All product definitions in one place
3. **Testability**: Can test ACO independently
4. **Maintainability**: Change definitions once, both systems get updates
5. **Clarity**: Clear separation of concerns

### "Commerce as Source of Truth"

This means Commerce is the **operational source** for:
- Customer transactions
- Inventory levels
- Order data
- SaaS Data Export origin

It does NOT mean Commerce **defines** the products - that's this repository's job!

---

## 🛠️ Development

### Prerequisites

- Node.js 18+
- ACO tenant credentials (in `.env`)

### Environment Setup

```bash
# Copy example env file
cp .env.example .env

# Edit with your ACO credentials
vi .env
```

### Scripts Reference

**Generation**:
- `npm run generate:all` - Generate all data
- `npm run generate:metadata` - Generate attributes
- `npm run generate:categories` - Generate categories
- `npm run generate:products` - Generate simple products
- `npm run generate:variants` - Generate configurable products
- `npm run generate:bundles` - Generate bundle products

**Ingestion**:
- `npm run ingest:all` - Ingest all to ACO
- `npm run ingest:metadata` - Ingest attributes
- `npm run ingest:products` - Ingest simple products
- `npm run ingest:variants` - Ingest configurable products
- `npm run ingest:bundles` - Ingest bundle products

**Cleanup**:
- `npm run reset:all` - Delete all ACO data
- `npm run reset:products` - Delete products only
- `npm run reset:price-books` - Delete price books

**Validation**:
- `npm run validate:schema` - Validate against ACO schemas
- `npm run validate:ingestion` - Check ingestion status

---

## 📖 Related Documentation

- [Full Architecture Guide](../buildright-commerce/docs/DATA-FLOW-ORCHESTRATION.md)
- [Fast Import Workflow](../buildright-commerce/docs/DATA-FLOW-UPDATED.md)
- [SaaS Data Export Analysis](../buildright-commerce/docs/SAAS-DATA-EXPORT-ANALYSIS.md)

---

## 🎯 Summary

This repository is the **BuildRight Catalog Definition Repository**:

✅ Defines **what products exist** (catalog schema)  
✅ Generates **canonical data files** (single source)  
✅ Both Commerce and ACO **import from it** (consumers)  
✅ Enables **fast parallel imports** (~60s vs 30min wait)  
✅ Maintains **architectural correctness** (SaaS sync validates)  

**Commerce** is the operational source for transactions.  
**This repo** is the definitional source for the catalog.

---

## 📝 License

MIT

## 🤝 Contributing

This is a demo repository. For production use, adapt the product definitions and generation logic to your specific needs.
