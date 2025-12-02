# BuildRight ACO - Modular Catalog Data Management

Complete Adobe Commerce Optimizer (ACO) integration with modular utilities for managing catalog data. This project provides a clean, reusable approach to generating, ingesting, and deleting ACO entities.

## ✨ Features

- **Modular Utilities**: Reusable query and delete functions (`aco-query.js`, `aco-delete.js`)
- **Unified Scripts**: Single commands for complete workflows (`ingest:all`, `reset:all`)
- **ACO-Only**: Supports only what the ACO SDK supports (no inventory)
- **Dry-Run Support**: Preview changes before executing
- **Error Handling**: Comprehensive logging and retry logic
- **Type-Safe**: Uses official Adobe Commerce Optimizer TypeScript SDK

## 🏗️ Architecture

```
buildright-aco/
├── utils/                      # Modular utilities (reusable)
│   ├── aco-client.js          # ACO SDK client wrapper
│   ├── aco-query.js           # Query functions (getAllProductSKUs, etc.)
│   ├── aco-delete.js          # Delete functions (prices, products, etc.)
│   ├── graphql-query.js       # GraphQL helpers
│   ├── logger.js              # Winston logger
│   ├── oauth-token-manager.js # OAuth authentication
│   └── retry-handler.js       # Retry logic
├── scripts/
│   ├── config/                # Configuration
│   ├── generate-*.js          # Generate local JSON data
│   ├── ingest-*.js            # Ingest data to ACO
│   ├── ingest-all.js          # Unified ingestion workflow
│   ├── reset-*.js             # Delete data from ACO
│   ├── reset-all.js           # Unified reset workflow
│   └── validate-*.js          # Validation scripts
└── data/buildright/           # Generated JSON data
```

## 🚀 Quick Start

### 1. Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your ACO credentials
```

### 2. Generate Data

```bash
# Generate all local JSON data files
npm run generate:all

# Or generate individual entities
npm run generate:products
npm run generate:price-books
npm run generate:prices

# Generate data for dependent projects
npm run generate:eds-data      # For buildright-eds frontend
npm run generate:service-data  # For buildright-service backend
```

### 3. Ingest to ACO

```bash
# Ingest all data (recommended)
npm run ingest:all

# Or ingest individual entities
npm run ingest:products      # Simple products
npm run ingest:variants      # Configurable products + variants
npm run ingest:bundles       # Bundle products
npm run ingest:price-books   # Price book hierarchy
npm run ingest:prices        # All prices

# Preview before ingesting
npm run ingest:all:dry-run
```

### 4. Reset ACO (Delete Data)

```bash
# Delete everything
npm run reset:all

# Delete specific entities
npm run reset:products       # Delete all products
npm run reset:price-books    # Delete prices + price books

# Preview before deleting
npm run reset:all:dry-run

# Delete and re-ingest
npm run reset:all:reingest
```

## 📊 Data Generation

### ACO Entities (Ingest to Adobe Commerce Optimizer)

| Entity | Generate | Ingest | Delete | Notes |
|--------|----------|--------|--------|-------|
| **Products** | ✅ | ✅ | ✅ | Simple + configurable + bundle |
| **Product Metadata** | ✅ | ✅ | ⏳ | Attributes (ingested with products) |
| **Categories** | ✅ | ⏳ | ⏳ | Optional, not yet implemented |
| **Price Books** | ✅ | ✅ | ✅ | Hierarchical structure |
| **Prices** | ✅ | ✅ | ✅ | All products × all price books |
| **Inventory** | ❌ | ❌ | ❌ | NOT supported (use Adobe Commerce MSI) |

### Dependent Projects (Export for downstream consumption)

| Entity | Script | Output | Consumer |
|--------|--------|--------|----------|
| **EDS Data** | `generate:eds-data` | `buildright-eds/data/` | Frontend (Edge Delivery Services) |
| **Service Data** | `generate:service-data` | `buildright-service/lib/data/` | Backend (BOM generation service) |

**Data Flow:**
```
buildright-aco (source) 
  → generate scripts 
    → buildright-eds/data/ (frontend)
    → buildright-service/lib/data/ (backend)
```

## 🛠️ Available Commands

### Generate (Create Local JSON Data)

```bash
npm run generate:metadata         # Product attributes
npm run generate:categories       # Category hierarchy
npm run generate:products         # Simple products
npm run generate:variants         # Configurable products + variants
npm run generate:bundles          # Bundle products
npm run generate:price-books      # Price book structure
npm run generate:prices           # All pricing data
npm run generate:eds-data         # EDS-compatible data files (for buildright-eds)
npm run generate:service-data     # Service data files (for buildright-service)
npm run generate:all              # All of the above
```

### Ingest (Push to ACO)

```bash
npm run ingest:products           # Simple products only
npm run ingest:products:dry-run   # Preview products ingestion
npm run ingest:variants           # Configurable products + variants
npm run ingest:bundles            # Bundle products
npm run ingest:price-books        # Price books (hierarchical)
npm run ingest:prices             # All prices
npm run ingest:prices:dry-run     # Preview prices ingestion
npm run ingest:all                # Complete workflow (recommended)
npm run ingest:all:dry-run        # Preview complete workflow
```

### Reset (Delete from ACO)

```bash
npm run reset:products            # Delete all products
npm run reset:products:dry-run    # Preview product deletion
npm run reset:price-books         # Delete prices + price books
npm run reset:price-books:dry-run # Preview price book deletion
npm run reset:price-books:reingest # Delete and re-ingest prices
npm run reset:all                 # Delete everything
npm run reset:all:dry-run         # Preview full reset
npm run reset:all:reingest        # Delete and re-ingest everything
```

### Validate

```bash
npm run validate:schema           # Validate JSON against ACO schemas
npm run validate:ingestion        # Validate ingestion results
```

## 📖 Usage Examples

### Complete Workflow

```bash
# 1. Generate all data
npm run generate:all

# 2. Preview what will be ingested
npm run ingest:all:dry-run

# 3. Ingest to ACO
npm run ingest:all

# 4. Validate ingestion
npm run validate:ingestion
```

### Update Prices Only

```bash
# 1. Regenerate prices
npm run generate:prices

# 2. Reset existing prices and re-ingest
npm run reset:price-books:reingest
```

### Clean Slate

```bash
# Delete everything and start fresh
npm run reset:all:reingest
```

## 🔧 Modular Utilities

### Query Utilities (`utils/aco-query.js`)

```javascript
import { getAllProductSKUs, validateSKUsExist } from './utils/aco-query.js';

// Get all SKUs from local data
const skus = await getAllProductSKUs();

// Validate SKUs exist in ACO
const result = await validateSKUsExist(['SKU-001', 'SKU-002']);
console.log(`Found: ${result.found.length}, Missing: ${result.missing.length}`);
```

### Delete Utilities (`utils/aco-delete.js`)

```javascript
import {
  deleteAllPricesForPriceBooks,
  deletePriceBooks,
  deleteProductsBySKUs
} from './utils/aco-delete.js';

// Delete all prices for specific price books
await deleteAllPricesForPriceBooks(['US-Retail', 'Production-Builder']);

// Delete price books
await deletePriceBooks(['old-price-book-1', 'old-price-book-2']);

// Delete products
await deleteProductsBySKUs(['SKU-001', 'SKU-002']);
```

## 📁 Data Files

Generated JSON files are stored in `data/buildright/`:

| File | Records | Description |
|------|---------|-------------|
| `metadata.json` | 20 | Product attribute definitions |
| `categories.json` | 19 | Category hierarchy |
| `products.json` | 108 | Simple products |
| `variants.json` | 100 | Configurable products + variants |
| `bundles.json` | 15 | Bundle products |
| `price-books.json` | 5 | Price book hierarchy |
| `prices.json` | 1,115 | All prices (223 SKUs × 5 price books) |

**Total:** 223 products, 5 price books, 1,115 prices

## 🔐 Environment Variables

Required variables in `.env`:

```env
# ACO Credentials (from Adobe Developer Console)
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret

# ACO Instance (from Commerce Cloud Manager)
TENANT_ID=your-tenant-id
REGION=na1
ENVIRONMENT=sandbox

# Optional
TIMEOUT_MS=10000
WEBSITE_CODE=base
STORE_CODE=default
STORE_VIEW_CODE=default
```

## 🐛 Troubleshooting

### Price Ingestion Fails with "Bad Request"

**Issue**: ACO SDK requires `regular` field for prices, not `amount`.

**Solution**: The `ingest-prices.js` script automatically transforms `amount` → `regular`. If you're using custom scripts, ensure you use the correct field name.

### SKU Validation Fails

**Issue**: GraphQL `productSearch` requires a search index which may not be configured.

**Solution**: Use `--skip-validation` flag or rely on local SKU data with `getAllProductSKUs()`.

### Price Books Won't Delete

**Issue**: Price books with associated prices cannot be deleted.

**Solution**: Delete prices first using `reset:price-books` which handles the correct order.

## 📚 Resources

- [Adobe Commerce Optimizer Documentation](https://developer.adobe.com/commerce/services/optimizer/)
- [ACO TypeScript SDK](https://github.com/adobe-commerce/aco-ts-sdk)
- [ACO Sample Catalog Data](https://github.com/adobe-commerce/aco-sample-catalog-data-ingestion)

## 📝 License

MIT

---

**Version**: 2.0.0 (Modular & ACO-Only)
