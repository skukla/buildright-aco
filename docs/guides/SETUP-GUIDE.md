# BuildRight Setup Guide - Persona-Driven Demo

**Version**: 2.0  
**Last Updated**: November 2024  
**Audience**: Developers, Demo Engineers, Solutions Architects

---

## Overview

This guide provides complete step-by-step instructions for setting up the BuildRight persona-driven demo, including data generation, ACO ingestion, policy configuration, and frontend integration.

**What You'll Build:**
- 70-product catalog with persona-specific attributes
- 5 price books with customer tier + volume tier pricing
- 28 triggered policies for dynamic catalog filtering
- Frontend mock service for EDS development
- 5 complete persona experiences

**Time Estimate**: 6-8 hours (mostly ACO ingestion and policy setup)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Environment Setup](#phase-1-environment-setup)
3. [Phase 2: Data Generation](#phase-2-data-generation)
4. [Phase 3: ACO Ingestion](#phase-3-aco-ingestion)
5. [Phase 4: Price Book Configuration](#phase-4-price-book-configuration)
6. [Phase 5: Policy Configuration](#phase-5-policy-configuration)
7. [Phase 6: Frontend Integration](#phase-6-frontend-integration)
8. [Phase 7: Testing & Validation](#phase-7-testing--validation)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## Prerequisites

### Required Software

- **Node.js**: v20.14.0 or higher
- **npm**: v9.x or higher
- **Git**: For repository management
- **Text Editor**: VS Code, Sublime, or similar

### Required Access

- **Adobe Commerce Optimizer**: Sandbox or production instance
- **Adobe Developer Console**: For API credentials
  - CLIENT_ID
  - CLIENT_SECRET
  - TENANT_ID
- **ACO Admin UI Access**: For policy configuration (cannot be done via API)

### Knowledge Requirements

- Basic Node.js/npm usage
- Understanding of REST API concepts
- Familiarity with JSON data structures
- Basic GraphQL knowledge (for testing)

---

## Phase 1: Environment Setup

### 1.1 Clone Repository

```bash
# Clone the buildright-aco repository
git clone <repository-url>
cd buildright-aco

# Checkout persona branch
git checkout persona-enhancements

# Install dependencies
npm install
```

### 1.2 Configure Environment

```bash
# Copy environment template
cp .env.dist .env

# Edit .env with your credentials
nano .env  # or your preferred editor
```

**Required Environment Variables:**

```bash
# Adobe Commerce Optimizer Authentication
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here

# ACO Instance Configuration
TENANT_ID=your-tenant-id-here
REGION=na1                    # or your region (na1, emea1, apac1)
ENVIRONMENT=sandbox           # or production

# Optional: Query Configuration
PAGE_SIZE=100                 # Number of items per page in GraphQL queries
MAX_RETRIES=3                 # Number of retry attempts for failed requests
INITIAL_RETRY_DELAY_MS=1000   # Initial delay between retries
RETRY_BACKOFF_MULTIPLIER=2    # Exponential backoff multiplier

# Optional: Data Generation
SEED=12345                    # Seed for deterministic random generation
```

### 1.3 Verify Configuration

```bash
# Test ACO connection
npm run validate

# Expected output:
# ✓ Environment variables loaded
# ✓ ACO connection successful
# ✓ Tenant ID: <your-tenant-id>
```

**If connection fails:**
- Verify credentials in Adobe Developer Console
- Check TENANT_ID and REGION settings
- Ensure ACO instance is active

---

## Phase 2: Data Generation

### 2.1 Generate All Data

Run the complete data generation pipeline:

```bash
npm run generate:all
```

This executes 8 steps in sequence:
1. Metadata generation
2. Category generation
3. Product generation
4. Variant generation
5. Bundle generation
6. Price book generation
7. Price generation
8. Policy guide generation
9. EDS data generation

**Expected Duration**: ~8 minutes

**Output Files** (in `data/buildright/`):
- `metadata.json` - Product schema and attribute definitions
- `categories.json` - Category tree (19 categories)
- `products.json` - 70 products with persona attributes
- `variants.json` - Configurable product variants
- `bundles.json` - Bundle products
- `price-books.json` - 5 price books
- `prices.json` - Retail pricing + volume tiers (1,770 entries)
- `inventory.json` - Multi-source inventory
- `sources.json` - Inventory source definitions
- `POLICY-SETUP-GUIDE.md` - Policy configuration instructions

**Output Files** (in `../buildright-eds/data/`):
- `mock-products.json` - EDS-compatible products
- `project-recommendations.json` - Templates, packages, kits

### 2.2 Verify Generated Data

```bash
# Check product count
node -e "console.log(JSON.parse(require('fs').readFileSync('data/buildright/products.json')).length)"
# Expected: 70

# Check price book count
node -e "console.log(JSON.parse(require('fs').readFileSync('data/buildright/price-books.json')).length)"
# Expected: 5

# Check price entry count
node -e "console.log(JSON.parse(require('fs').readFileSync('data/buildright/prices.json')).length)"
# Expected: ~1770
```

### 2.3 Review Policy Guide

```bash
# View generated policy guide
cat data/buildright/POLICY-SETUP-GUIDE.md | head -50
```

This guide contains configuration instructions for all 28 policies you'll create in Phase 5.

---

## Phase 3: ACO Ingestion

### 3.1 Ingest Products

**Duration**: 2-3 hours (ACO API processing time)

```bash
# Ingest all products
npm run ingest:products
```

**Expected Output:**
```
✓ Validating products...
✓ 70 products validated
✓ Ingesting to ACO...
  Progress: [========================================] 70/70
✓ Products ingested successfully
  Success: 70, Failed: 0
```

**If ingestion fails:**
- Check ACO API rate limits
- Verify product schema matches ACO requirements
- Review error logs in console output
- Use `--dry-run` flag to test without ingesting

### 3.2 Ingest Variants (Optional)

If your catalog includes configurable products:

```bash
npm run ingest:variants
```

### 3.3 Ingest Bundles (Optional)

If your catalog includes bundle products:

```bash
npm run ingest:bundles
```

### 3.4 Verify Product Ingestion

**Using ACO Admin UI:**
1. Navigate to **ACO Admin** > **Catalog** > **Products**
2. Filter by date: "Created today"
3. Verify count: Should see 70 products
4. Spot-check a few products:
   - Check attributes exist (construction_phase, quality_tier, etc.)
   - Verify product names and descriptions
   - Confirm images are set

**Using GraphQL API:**
```graphql
query {
  products(filter: {}, pageSize: 100) {
    total_count
    items {
      sku
      name
      attributes {
        code
        value
      }
    }
  }
}
```

Expected: `total_count: 70`

---

## Phase 4: Price Book Configuration

### 4.1 Ingest Price Books

**Duration**: 30 minutes

```bash
# Ingest price book hierarchy
npm run ingest:price-books
```

**Expected Output:**
```
✓ Sorting price books by hierarchy...
✓ Ingesting: US-Retail (base)
✓ Ingesting: Production-Builder (child of US-Retail)
✓ Ingesting: Trade-Professional (child of US-Retail)
✓ Ingesting: Wholesale-Reseller (child of US-Retail)
✓ Ingesting: Retail-Registered (child of US-Retail)
✓ 5 price books ingested successfully
```

**Price Book Structure:**
```
US-Retail (base, currency: USD)
├── Production-Builder (15% off retail)
├── Trade-Professional (10% off retail)
├── Wholesale-Reseller (25% off retail)
└── Retail-Registered (5% off retail)
```

### 4.2 Ingest Prices

**Duration**: 1-2 hours (1,770 price entries)

```bash
# Ingest all prices with volume tiers
npm run ingest:prices
```

**Expected Output:**
```
✓ Validating prices...
✓ 1,770 price entries validated
✓ Ingesting to ACO...
  Progress: [========================================] 1770/1770
✓ Prices ingested successfully
  Success: 1770, Failed: 0
```

**Volume Tier Pricing:**

Each high-volume product has 3 price points per price book:
- Quantity 1 (1-99 units): Base tier price
- Quantity 100 (100-293 units): Base - 3%
- Quantity 294 (294+ units): Base - 8%

**Example: 2x4x8 Stud in Production-Builder price book**
```json
{
  "sku": "LBR-D0414F1E",
  "priceBookId": "Production-Builder",
  "prices": [
    { "quantity": 1, "value": 8.50 },
    { "quantity": 100, "value": 8.25 },
    { "quantity": 294, "value": 7.82 }
  ]
}
```

### 4.3 Verify Price Ingestion

**Using ACO Admin UI:**
1. Navigate to **ACO Admin** > **Pricing** > **Price Books**
2. Verify 5 price books exist:
   - US-Retail (base)
   - Production-Builder (child)
   - Trade-Professional (child)
   - Wholesale-Reseller (child)
   - Retail-Registered (child)
3. Open "Production-Builder" price book
4. Search for SKU: "LBR-D0414F1E"
5. Verify 3 price points:
   - Qty 1: $8.50
   - Qty 100: $8.25
   - Qty 294: $7.82

**Using GraphQL API:**
```graphql
query {
  priceBooks {
    id
    name
    parentId
    currency
  }
}
```

---

## Phase 5: Policy Configuration

**⚠️ IMPORTANT**: Triggered policies **cannot** be created via API. All 28 policies must be created manually in the ACO Admin UI.

**Duration**: 45-60 minutes

### 5.1 Access Policy Setup Guide

```bash
# Open the generated policy guide
cat data/buildright/POLICY-SETUP-GUIDE.md

# Or open in your browser/editor
code data/buildright/POLICY-SETUP-GUIDE.md
```

This guide contains detailed instructions for all 28 policies.

### 5.2 Policy Creation Workflow

For **each of the 28 policies** in the guide:

1. **Navigate to ACO Admin** > **CCDM** > **Policies** > **Create New**

2. **Enter Policy Details:**
   - **Name**: Copy from policy guide (e.g., "Foundation & Framing Phase")
   - **Trigger Type**: Select based on guide (e.g., "HTTP Header")
   - **Trigger Value**: Enter header name (e.g., "AC-Policy-Phase")

3. **Configure Filter:**
   - **Filter Type**: Select based on guide (e.g., "attribute_match")
   - **Attribute**: Enter attribute code (e.g., "construction_phase")
   - **Value**: Enter attribute value (e.g., "foundation_framing")

4. **Save and Activate:**
   - Click "Save"
   - Toggle "Active" to enable policy

5. **Test Policy:**
   - Use GraphQL playground
   - Send query with appropriate HTTP header
   - Verify products are filtered correctly

### 5.3 Policy Categories to Create

**Construction Phase** (3 policies):
- `foundation_framing` - Marcus, Sarah
- `envelope` - Marcus, Sarah
- `interior_finish` - Marcus, Sarah

**Quality Tier** (3 policies):
- `builder_grade` - Marcus
- `professional` - Marcus
- `premium` - Marcus

**Package Tier** (3 policies):
- `good` - Lisa
- `better` - Lisa
- `best` - Lisa

**Room Category** (3 policies):
- `bathroom` - Lisa
- `kitchen` - Lisa
- `any` - Lisa

**Deck Shape** (3 policies):
- `rectangular` - David
- `l_shaped` - David
- `multi_level` - David

**Deck Material** (3 policies):
- `wood` - David
- `composite` - David
- `pvc` - David

**Deck Compatible** (1 policy):
- `true` - David

**Store Velocity** (3 policies):
- `high` - Kevin
- `medium` - Kevin
- `low` - Kevin

**Restock Priority** (3 policies):
- `critical` - Kevin
- `high` - Kevin
- `medium` - Kevin

**Project Type** (3 policies):
- `new_construction` - All
- `remodel` - All
- `repair` - All

### 5.4 Policy Testing

After creating each category of policies, test them:

**Example: Test Construction Phase Policy**

```graphql
query GetFoundationProducts {
  products(filter: {}, pageSize: 100) {
    items {
      sku
      name
      attributes {
        code
        value
      }
    }
  }
}
```

**HTTP Headers:**
```
AC-Policy-Phase: foundation_framing
```

**Expected Result:**
- Products with `construction_phase = foundation_framing` attribute
- Other products filtered out

**Validation Checklist:**
- [ ] Policy appears in ACO Admin UI policy list
- [ ] Policy status = "Active"
- [ ] GraphQL query with header returns filtered results
- [ ] GraphQL query without header returns all products
- [ ] Multiple policies combine with AND logic

---

## Phase 6: Frontend Integration

### 6.1 Verify EDS Data Generation

EDS data should already be generated from Phase 2. Verify:

```bash
# Check EDS products exist
ls -lh ../buildright-eds/data/mock-products.json

# Check project recommendations exist
ls -lh ../buildright-eds/data/project-recommendations.json

# View product count
node -e "console.log(JSON.parse(require('fs').readFileSync('../buildright-eds/data/mock-products.json')).length)"
# Expected: 70
```

### 6.2 Update Frontend Mock Service (if needed)

The mock ACO service in `buildright-eds` should read the generated data files automatically. Verify paths are correct:

**File**: `buildright-eds/scripts/aco-service.js`

```javascript
const PRODUCTS_PATH = '../data/mock-products.json';
const RECOMMENDATIONS_PATH = '../data/project-recommendations.json';
```

### 6.3 Test Frontend Mock Service

```bash
# Navigate to buildright-eds
cd ../buildright-eds

# Start development server (if applicable)
npm run dev

# Or test mock service directly
node scripts/test-mock-service.js
```

**Expected Behavior:**
- Mock service loads products from `mock-products.json`
- Policy filters work client-side
- Pricing displays correctly

---

## Phase 7: Testing & Validation

### 7.1 End-to-End Product Flow

**Test: Complete product lifecycle**

1. **Generate product data**
   ```bash
   cd buildright-aco
   npm run generate:products
   ```
   ✓ Verify: `data/buildright/products.json` contains 70 products

2. **Ingest to ACO**
   ```bash
   npm run ingest:products
   ```
   ✓ Verify: ACO Admin shows 70 products

3. **Query via GraphQL**
   ```graphql
   query { products { total_count } }
   ```
   ✓ Verify: Returns `total_count: 70`

4. **Transform to EDS**
   ```bash
   npm run generate:eds-data
   ```
   ✓ Verify: `../buildright-eds/data/mock-products.json` contains 70 products

### 7.2 Pricing Validation

**Test: Volume tier pricing works correctly**

1. **Query product price** (Production-Builder tier):
   ```graphql
   query {
     productPrice(sku: "LBR-D0414F1E", priceBookId: "Production-Builder", quantity: 1) {
       value
     }
   }
   ```
   ✓ Expected: `value: 8.50`

2. **Query with volume tier** (100 units):
   ```graphql
   query {
     productPrice(sku: "LBR-D0414F1E", priceBookId: "Production-Builder", quantity: 100) {
       value
     }
   }
   ```
   ✓ Expected: `value: 8.25` (3% volume discount)

3. **Query with pallet tier** (294 units):
   ```graphql
   query {
     productPrice(sku: "LBR-D0414F1E", priceBookId: "Production-Builder", quantity: 294) {
       value
     }
   }
   ```
   ✓ Expected: `value: 7.82` (8% pallet discount)

### 7.3 Policy Filtering Validation

**Test: Policies filter correctly**

1. **No policy (baseline)**:
   ```graphql
   query { products { total_count } }
   ```
   ✓ Expected: `total_count: 70`

2. **Single policy** (Construction Phase):
   ```graphql
   query { products { total_count } }
   # Headers: AC-Policy-Phase: foundation_framing
   ```
   ✓ Expected: `total_count: ~20-25` (foundation products only)

3. **Multiple policies** (Phase + Quality):
   ```graphql
   query { products { total_count } }
   # Headers: 
   #   AC-Policy-Phase: foundation_framing
   #   AC-Policy-Quality: professional
   ```
   ✓ Expected: `total_count: ~12-15` (foundation + professional only)

4. **David's deck wizard** (progressive filtering):
   - Step 1: `AC-Policy-Deck-Compatible: true` → ~35 products
   - Step 2: `AC-Policy-Deck-Shape: rectangular` → ~25 products
   - Step 3: `AC-Policy-Deck-Material: composite` → ~18 products
   
   ✓ Expected: Progressive reduction from 70 → 18 products

### 7.4 Persona Experience Validation

**Test each persona's workflow:**

**✓ Sarah (Production Builder)**
- Can load template for "The Sedona"
- Can multiply quantities by 8 units
- Can add bonus room variant
- Sees Production-Builder pricing (15% off)
- Sees volume tier discounts on bulk orders

**✓ Marcus (General Contractor)**
- Can start project wizard
- Selecting "foundation_framing" phase filters products
- Selecting "professional" quality filters further
- Sees Trade-Professional pricing (10% off)

**✓ Lisa (Remodeling Contractor)**
- Can view Good/Better/Best package comparison
- Selecting "Better" filters to better-tier products
- Selecting "bathroom" filters to bathroom products
- Sees Trade-Professional pricing (10% off)

**✓ David (DIY Homeowner)**
- Can start deck wizard
- Each step progressively filters products
- Sees only compatible products at each step
- Sees Retail-Registered pricing (5% off) or retail

**✓ Kevin (Store Manager)**
- Can filter by velocity category (high/medium/low)
- Can filter by restock priority (critical/high/medium)
- Sees smart restock quantity suggestions
- Sees Wholesale-Reseller pricing (25% off)

---

## Troubleshooting

### Common Issues

#### Issue: "ACO Connection Failed"

**Symptoms:**
```
Error: Unable to connect to ACO
Status: 401 Unauthorized
```

**Solutions:**
1. Verify credentials in `.env` file
2. Check CLIENT_ID and CLIENT_SECRET are correct
3. Ensure TENANT_ID matches your ACO instance
4. Verify API credentials are active in Adobe Developer Console
5. Check for expired access tokens (regenerate if needed)

#### Issue: "Product Ingestion Failed"

**Symptoms:**
```
Error: Product validation failed
Field 'attributes' is required
```

**Solutions:**
1. Regenerate products: `npm run generate:products`
2. Verify products.json schema matches ACO requirements
3. Check for missing required fields (sku, name, attributes)
4. Use `--dry-run` to validate without ingesting

#### Issue: "Policies Not Filtering"

**Symptoms:**
- GraphQL query with header returns all products
- No filtering occurs

**Solutions:**
1. Verify policy is "Active" in ACO Admin UI
2. Check HTTP header name matches policy trigger exactly
3. Verify attribute code exists on products
4. Check attribute value matches (case-sensitive)
5. Use GraphQL playground to test headers directly

#### Issue: "Pricing Not Appearing"

**Symptoms:**
- Products show null or 0 price
- Volume tiers not applying

**Solutions:**
1. Verify price books are ingested: Check ACO Admin > Pricing > Price Books
2. Verify prices are ingested: Check ACO Admin > Pricing > Prices
3. Check price book hierarchy: Child books must reference parent correctly
4. Query with correct priceBookId parameter
5. Ensure quantity parameter triggers correct tier

#### Issue: "EDS Data Not Generated"

**Symptoms:**
```
Error: Cannot find module '../buildright-eds/data/mock-products.json'
```

**Solutions:**
1. Verify buildright-eds repository exists at `../buildright-eds`
2. Create data directory: `mkdir -p ../buildright-eds/data`
3. Regenerate EDS data: `npm run generate:eds-data`
4. Check file permissions (write access to buildright-eds/data/)

### Debug Mode

Enable verbose logging:

```bash
# Set log level to debug
export LOG_LEVEL=debug

# Run with debug output
npm run generate:all
```

### Validation Scripts

Run validation checks:

```bash
# Validate all generated data
npm run validate:all

# Validate specific data type
npm run validate:products
npm run validate:prices
npm run validate:policy-guide
```

---

## Maintenance

### Regenerating Data

**When to regenerate:**
- Adding new products
- Updating persona attributes
- Changing pricing structure
- Adding new policies

**How to regenerate:**

```bash
# Regenerate all data
npm run generate:all

# Regenerate specific data type
npm run generate:products
npm run generate:price-books
npm run generate:prices
npm run generate:policy-guide
npm run generate:eds-data
```

### Updating ACO Data

**Updating products:**

```bash
# Regenerate products
npm run generate:products

# Re-ingest to ACO (will update existing)
npm run ingest:products
```

**Updating prices:**

```bash
# Regenerate prices
npm run generate:prices

# Re-ingest to ACO
npm run ingest:prices
```

**Note**: ACO ingestion uses upsert logic - existing items are updated, new items are created.

### Adding a New Persona

**Steps to add a 6th persona:**

1. **Define persona attributes** (in `scripts/config/product-definitions.js`):
   ```javascript
   // Example: Property Manager persona
   property_type: ['residential', 'commercial', 'mixed_use']
   unit_count: ['small', 'medium', 'large']
   ```

2. **Tag products** with new attributes:
   ```javascript
   // Update product definitions to include new attributes
   ```

3. **Generate new data**:
   ```bash
   npm run generate:all
   ```

4. **Create new price book** (if pricing differs):
   - Edit `scripts/generate-price-books.js`
   - Add new tier to `PRICE_BOOK_STRUCTURE`

5. **Re-ingest to ACO**:
   ```bash
   npm run ingest:all
   ```

6. **Create new policies** in ACO Admin UI:
   - 3-5 new policies for persona-specific filtering
   - Follow policy creation workflow in Phase 5

7. **Update frontend** (`buildright-eds`):
   - Add persona to auth.js
   - Create persona-specific pages/components
   - Test end-to-end workflow

**Time estimate**: 3-5 hours

### Backup and Restore

**Backup generated data:**

```bash
# Create backup directory
mkdir -p backups/$(date +%Y-%m-%d)

# Copy all generated data
cp -r data/buildright/* backups/$(date +%Y-%m-%d)/
```

**Restore from backup:**

```bash
# Restore specific date
cp -r backups/2024-11-16/* data/buildright/
```

**Export ACO data** (via ACO Admin UI):
1. Navigate to **ACO Admin** > **Data Management** > **Export**
2. Select: Products, Price Books, Prices
3. Click "Export"
4. Save exported files for backup

---

## Quick Reference

### Common Commands

```bash
# Generate all data
npm run generate:all

# Ingest all data to ACO
npm run ingest:all

# Generate EDS data only
npm run generate:eds-data

# Validate configuration
npm run validate

# Reset ACO catalog (destructive!)
npm run reset:catalog --dry-run
```

### File Locations

**Generated Data:**
- `data/buildright/products.json` - ACO products
- `data/buildright/price-books.json` - Price book hierarchy
- `data/buildright/prices.json` - Price entries
- `data/buildright/POLICY-SETUP-GUIDE.md` - Policy instructions
- `../buildright-eds/data/mock-products.json` - EDS products
- `../buildright-eds/data/project-recommendations.json` - Templates/packages

**Configuration:**
- `scripts/config/product-definitions.js` - Product templates
- `scripts/config/policy-definitions.js` - Policy definitions
- `scripts/generate-price-books.js` - Price book structure
- `.env` - ACO credentials

**Documentation:**
- `docs/BUILDRIGHT-CASE-STUDY.md` - Complete case study
- `docs/PRICING-STRATEGY.md` - Pricing details
- `README.md` - Build process overview

### GraphQL Playground

**URL**: `https://aco.{REGION}.adobecommerce.com/graphql` (provided by Adobe)

**Authentication**: OAuth Bearer token (handled by SDK)

**Example Queries:**

```graphql
# Get all products
query { products { total_count items { sku name } } }

# Get products with policy filter
query { products { items { sku name } } }
# Headers: AC-Policy-Phase: foundation_framing

# Get product price
query {
  productPrice(sku: "LBR-D0414F1E", priceBookId: "Production-Builder", quantity: 100) {
    value
    currency
  }
}
```

---

## Support

### Resources

- **Case Study**: `docs/BUILDRIGHT-CASE-STUDY.md`
- **Pricing Strategy**: `docs/PRICING-STRATEGY.md`
- **Policy Guide**: `data/buildright/POLICY-SETUP-GUIDE.md`
- **Phase Plans**: `../buildright-eds/docs/PHASE-*.md`

### Contacts

- **Technical Issues**: Adobe Commerce Support
- **Demo Questions**: Solutions Engineering team
- **ACO API Documentation**: Adobe Developer Portal

---

**Document Version**: 2.0  
**Last Updated**: November 2024  
**Status**: Production Ready
