# BuildRight ACO Data Generation & Ingestion

Adobe Commerce Optimizer (ACO) sample catalog data generation and ingestion system for BuildRight Solutions - a construction materials supplier demo.

## Overview

This project provides comprehensive data generation scripts and ingestion utilities for Adobe Commerce Optimizer, demonstrating:

- **Multi-source inventory management** (6 inventory sources across 2 stocks)
- **Business-type pricing structure** (4 price books with tiered discounts)
- **Complex product catalog** (184 products including simple, configurable, bundles, and services)
- **Deterministic data generation** (reproducible with SEED environment variable)
- **Test-driven development** (96%+ test pass rate with 85%+ coverage)

## Project Status

✅ **Track 1 Complete:** Foundation & Analysis (Steps 1-4)
✅ **Track 2 Complete:** Data Generation Scripts (Steps 5-8)
⏳ **Track 3 Pending:** Upload Scripts (Steps 9-12)
⏳ **Track 4 Pending:** Manual Configuration Guides (Steps 13-15)
⏳ **Track 5 Pending:** Documentation & Quality (Steps 16-20)

**Current Progress:** 8/20 steps complete (40%)

---

## Quick Start

### Prerequisites

- **Node.js** 20.14.0 or higher
- **npm** 9.x or higher
- **Adobe Commerce Optimizer** sandbox or production instance
- **Adobe Developer Console** credentials (CLIENT_ID, CLIENT_SECRET)
- **Commerce Cloud Manager** access (TENANT_ID)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd buildright-aco

# Install dependencies
npm install

# Configure environment
cp .env.dist .env
# Edit .env and add your credentials
```

### Configuration

Edit `.env` with your Adobe Commerce Optimizer credentials:

```bash
# Required: Authentication
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here

# Required: Instance Configuration
TENANT_ID=your-tenant-id-here
REGION=na1
ENVIRONMENT=sandbox

# Optional: Query Configuration
VIEW_ID=default
SOURCE_LOCALE=en-US

# Optional: Data Generation
SEED=12345
```

#### Getting Your Credentials

**CLIENT_ID & CLIENT_SECRET:**
1. Go to [Adobe Developer Console](https://developer.adobe.com/console)
2. Create or select your project
3. Add "Adobe Commerce Optimizer" API
4. Generate OAuth credentials
5. Copy Client ID and Client Secret

**TENANT_ID:**
1. Go to [Commerce Cloud Manager](https://experience.adobe.com/)
2. Navigate to Commerce > Commerce Cloud Manager
3. Select your ACO instance
4. Click info icon to view instance details
5. Copy Tenant ID from endpoint URLs

---

## Data Generation

### Generate All Data

```bash
# Generate all data files with deterministic seed
SEED=12345 npm run generate:all

# Or run individual generators
npm run generate:metadata     # Product attributes
npm run generate:categories   # Category hierarchy
npm run generate:products     # Simple and service products
npm run generate:variants     # Configurable products and variants
npm run generate:bundles      # Bundle products
npm run generate:price-books  # Price book structure
npm run generate:prices       # All pricing data
npm run generate:inventory    # Multi-source inventory
```

### Generated Data Files

All generated files are saved to `data/buildright/`:

| File | Size | Records | Description |
|------|------|---------|-------------|
| `metadata.json` | 3.5K | 20 | Product attribute definitions |
| `categories.json` | 3.8K | 19 | Category hierarchy |
| `products.json` | 76K | 80 | Simple + service products |
| `variants.json` | 114K | 94 | Configurable products + variants |
| `bundles.json` | 41K | 15 | Bundle products |
| `price-books.json` | 1.3K | 4 | Business-type price books |
| `prices.json` | 398K | 1,418 | All pricing entries |
| `sources.json` | 2.8K | 6 | Inventory sources |
| `inventory.json` | 89K | 169 | Multi-source inventory |

**Total:** 184 products, 1,418 prices, 169 inventory items

---

## API Configuration

### Endpoint Structure

The SDK automatically constructs endpoints from your configuration:

**REST API (Data Ingestion):**
```
Sandbox:    https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/v1/catalog
Production: https://na1.api.commerce.adobe.com/{TENANT_ID}/v1/catalog
```

**GraphQL API (Queries):**
```
Sandbox:    https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/graphql
Production: https://na1.api.commerce.adobe.com/{TENANT_ID}/graphql
```

**ACO UI:**
```
https://experience.adobe.com/#/@demosystem/in:{TENANT_ID}/commerce-optimizer-studio
```

### Using the ACO Client

```javascript
import { getACOClient } from './utils/aco-client.js';

// Get singleton client (uses .env configuration)
const client = getACOClient();

// Create products
await client.createProducts(products);

// Create metadata
await client.createProductMetadata(attributes);

// Create price books
await client.createPriceBooks(priceBooks);

// Create prices
await client.createPrices(prices);
```

### Using GraphQL Queries

```javascript
import {
  queryProductsBySKU,
  queryProducts,
  queryCategories,
  verifyDataIngestion
} from './utils/graphql-query.js';

// Query specific products
const products = await queryProductsBySKU(['SKU-001', 'SKU-002']);

// Search products
const results = await queryProducts({
  searchTerm: 'lumber',
  pageSize: 10
});

// Verify ingestion
const stats = await verifyDataIngestion();
console.log(`Products: ${stats.productCount}`);
```

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm test -- tests/unit/
npm test -- tests/integration/
```

**Current Test Status:**
- ✅ 321/334 tests passing (96.1%)
- ✅ 85%+ coverage on critical utilities
- ✅ Deterministic test data with SEED

---

## Architecture

### Pricing Structure

**4 Business-Type Price Books:**
- **US-Retail** (0% discount) - Walk-in customers
- **US-Contractor** (5% discount) - Licensed contractors
- **US-Commercial** (10% discount) - Commercial companies
- **US-Wholesale** (15% discount) - High-volume accounts

**Regional Adjustments:**
- West lumber: +3% surcharge (applied in calculation logic)

**Volume Tiers:**
- 100+ units: +3% additional discount
- 500+ units: +8% additional discount

### Inventory Sources

**6 Sources across 2 Stocks:**

**Stock 1 (Western Sales Channel):**
- Western RDC (Sacramento, CA)
- Phoenix Metro Warehouse (Phoenix, AZ)
- Denver Warehouse (Denver, CO)

**Stock 2 (Eastern Sales Channel):**
- Eastern RDC (Charlotte, NC)
- Atlanta Metro Warehouse (Atlanta, GA)

**Virtual Source:**
- Drop Shipper - Premium Window Systems

### Product Catalog

**184 Total Products:**
- 70 simple products
- 10 service products
- 20 configurable products (with 74 variants)
- 15 bundle products

**19 Categories:**
- Structural Materials (Lumber, Concrete, Masonry)
- Framing & Drywall
- Roofing Materials
- Windows & Doors
- Fasteners & Hardware

---

## Project Structure

```
buildright-aco/
├── .rptc/                          # RPTC workflow artifacts
│   ├── plans/                      # Implementation plans
│   └── research/                   # Research findings
├── data/
│   └── buildright/                 # Generated data files
├── docs/                           # Documentation
├── instructions/                   # Implementation guides
├── scripts/                        # Data generation scripts
│   ├── config/                     # Configuration data
│   ├── generate-metadata.js
│   ├── generate-categories.js
│   ├── generate-products.js
│   ├── generate-variants.js
│   ├── generate-bundles.js
│   ├── generate-price-books.js
│   ├── generate-prices-hierarchical.js
│   └── generate-inventory.js
├── tests/                          # Test suites
│   ├── unit/
│   └── integration/
├── utils/                          # Utility libraries
│   ├── aco-client.js              # ACO SDK wrapper
│   ├── graphql-query.js           # GraphQL utilities
│   ├── price-calculator.js        # Pricing logic
│   ├── inventory-distributor.js   # Inventory allocation
│   ├── sku-generator.js           # SKU generation
│   └── random-seed.js             # Deterministic PRNG
├── .env.dist                       # Environment template
├── package.json
└── README.md
```

---

## Batch Processing

ACO API batch limits:
- **Products:** 100 per batch
- **Prices:** 100 per batch
- **Metadata:** 50 per batch (recommended)
- **Categories:** 50 per batch (recommended)

The `batchProcess()` utility handles automatic batching:

```javascript
import { getACOClient, batchProcess } from './utils/aco-client.js';

const client = getACOClient();
const products = [...]; // Array of products

const results = await batchProcess(
  products,
  (batch) => client.createProducts(batch),
  100,  // Batch size
  'products'  // Entity type for logging
);

console.log(`Processed: ${results.processed}/${results.total}`);
console.log(`Failed: ${results.failed}`);
```

---

## Deterministic Data Generation

Use the `SEED` environment variable for reproducible data:

```bash
# Generate same data every time
SEED=12345 npm run generate:all

# Verify deterministic output
SEED=12345 npm run generate:products
md5sum data/buildright/products.json  # Hash 1

SEED=12345 npm run generate:products
md5sum data/buildright/products.json  # Hash 2 (should match Hash 1)
```

**Use Cases:**
- Automated testing with consistent fixtures
- Reproducible demo environments
- Regression testing after code changes

---

## Troubleshooting

### Authentication Errors

**Error:** `Missing required ACO configuration: CLIENT_ID, CLIENT_SECRET, TENANT_ID`

**Solution:**
1. Verify `.env` file exists and contains all required variables
2. Check credentials in Adobe Developer Console
3. Ensure TENANT_ID matches your ACO instance

### GraphQL Query Errors

**Error:** `TENANT_ID is required to construct GraphQL endpoint`

**Solution:**
1. Add `TENANT_ID` to your `.env` file
2. Verify TENANT_ID from Commerce Cloud Manager

### Batch Upload Failures

**Error:** Rate limit or timeout errors during bulk uploads

**Solution:**
1. Reduce batch size (try 50 instead of 100)
2. Increase `TIMEOUT_MS` in `.env`
3. Check ACO instance status in Cloud Manager

---

## npm Scripts Reference

### Data Generation
- `generate:metadata` - Generate product attributes
- `generate:categories` - Generate category hierarchy
- `generate:products` - Generate simple/service products
- `generate:variants` - Generate configurable products
- `generate:bundles` - Generate bundle products
- `generate:all-products` - Generate all product types
- `generate:price-books` - Generate price book structure
- `generate:prices` - Generate pricing data
- `generate:all-pricing` - Generate all pricing
- `generate:inventory` - Generate inventory data
- `generate:all` - Generate all data files

### Testing
- `test` - Run all tests
- `test:coverage` - Run tests with coverage report

### Validation
- `validate:msi` - Validate MSI architecture
- `validate:project` - Validate project context

---

## Resources

### Official Documentation
- [Adobe Commerce Optimizer](https://experienceleague.adobe.com/en/docs/commerce/optimizer/get-started)
- [ACO TypeScript SDK](https://github.com/adobe-commerce/aco-ts-sdk)
- [Data Ingestion API](https://developer.adobe.com/commerce/services/optimizer/data-ingestion/)
- [Adobe Developer Console](https://developer.adobe.com/console)

### Project Documentation
- [Reduced Scope Plan](./instructions/02-reduced-scope-plan.md)
- [Implementation Guides](./instructions/)
- [Architecture Decisions](./docs/architecture/)
- [Thread Summary](./instructions/THREAD-SUMMARY.md)

---

## Contributing

This project uses the **RPTC (Research → Plan → TDD → Commit)** workflow methodology.

See [`.rptc/CLAUDE.md`](./.rptc/CLAUDE.md) for workflow documentation.

---

## License

[Specify License]

---

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review official Adobe Commerce Optimizer documentation
3. Contact your Adobe representative

---

**Last Updated:** October 29, 2025
**Version:** Track 2 Complete (40% project completion)
