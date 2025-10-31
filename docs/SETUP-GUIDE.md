# BuildRight ACO Setup Guide

**Complete Implementation Procedures**

---

## Overview

This guide provides step-by-step implementation procedures for setting up the BuildRight Adobe Commerce Optimizer demo environment from scratch.

**Total Time:** 12-16 hours (can be spread over 2-3 days)

**Target Audience:** Implementation engineers, sales engineers, solution architects

**Related Documentation:**
- [Case Study](BUILDRIGHT-CASE-STUDY.md) - Business context and outcomes
- [MSI Configuration Guide](manual-setup/msi-configuration-guide.md) - Detailed inventory setup
- [B2B Configuration Guide](manual-setup/b2b-configuration-guide.md) - Detailed company setup
- [Trigger Policy Guide](manual-setup/trigger-policy-guide.md) - Detailed policy configuration
- [B2B Architecture](architecture/buildright-b2b-structure.md) - Structure diagram

---

## Quick Reference

### Setup Phases

| Phase | Time | Type |
|-------|------|------|
| 1. Environment Setup | 30 min | Configuration |
| 2. Data Generation | 15 min | Automated |
| 3. Data Ingestion | 1-2 hrs | API Upload |
| 4. Multi-Source Inventory | 2.5-4 hrs | Manual UI |
| 5. B2B Configuration | 6-8 hrs | Manual UI |
| 6. Trigger Policies | 1-2 hrs | ACO Admin UI |
| 7. Validation | 1 hr | Testing |

### Key Data Counts

- **Products:** 184 (70 simple + 92 variants + 15 bundles + 10 services)
- **Price Books:** 10 (3-level hierarchy)
- **Price Entries:** 1,770
- **Inventory Sources:** 6 locations across 3 regions
- **B2B Companies:** 3 companies, 6 locations, 12 users

---

## Prerequisites

**Required Access:**
- Adobe Commerce Optimizer instance (sandbox or production)
- Adobe Developer Console (for OAuth credentials)
- Adobe Commerce 2.4.x with B2B extension
- Admin access to Adobe Commerce

**Required Tools:**
- Node.js 20.14.0+ and npm 9.x+
- Git for cloning repository
- Terminal/command line access
- Text editor for .env configuration

---

## Phase 1: Environment Setup

> **Context:** Configure OAuth credentials and environment variables to connect to your ACO instance.

### 1.1 Get Adobe Developer Console Credentials

1. Go to [Adobe Developer Console](https://developer.adobe.com/console)
2. Create new project or select existing project
3. Click **Add API** → Search "Adobe Commerce Optimizer"
4. Select **OAuth Server-to-Server** authentication
5. Click **Save configured API**
6. Navigate to **Credentials** tab
7. Copy **Client ID** and **Client Secret**

> **IMPORTANT:** Keep credentials secure. Never commit to version control.

### 1.2 Get Your Tenant ID

1. Go to [Commerce Cloud Manager](https://experience.adobe.com/)
2. Navigate to **Commerce → Commerce Cloud Manager**
3. Select your ACO instance
4. Click **info icon** (ⓘ) to view instance details
5. Copy `TENANT_ID` from endpoint URL:
   ```
   https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/graphql
   ```

### 1.3 Clone Repository and Install

```bash
# Clone repository
git clone <repository-url>
cd buildright-aco

# Install dependencies
npm install
```

**Verify installation:**
```bash
node --version  # Should show v20.14.0+
npm --version   # Should show 9.x+
```

### 1.4 Configure Environment Variables

```bash
# Create .env from template
cp .env.dist .env
```

Edit `.env` with your credentials:

```env
##################################################
# Adobe Commerce Optimizer Configuration
##################################################

# Required: OAuth Credentials
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here

# Required: Instance Configuration
TENANT_ID=your-tenant-id-here
REGION=na1
ENVIRONMENT=sandbox

# Optional: Configuration
VIEW_ID=default
SOURCE_LOCALE=en-US
SEED=12345
LOG_LEVEL=info
```

### 1.5 Test Configuration

```bash
node -e "
import { getACOClient } from './utils/aco-client.js';
const client = getACOClient();
console.log('✅ ACO Client initialized successfully');
console.log('Configuration:', {
  region: process.env.REGION,
  environment: process.env.ENVIRONMENT,
  tenantId: process.env.TENANT_ID ? '***' + process.env.TENANT_ID.slice(-4) : 'MISSING'
});
"
```

**Expected output:**
```
✅ ACO Client initialized successfully
Configuration: { region: 'na1', environment: 'sandbox', tenantId: '***xxxx' }
```

✅ **Checkpoint:** Test script runs without errors

---

## Phase 2: Data Generation

> **Context:** Generate 184 products, 10 price books, 1,770 prices, and 6 inventory sources using deterministic scripts. All generation uses SEED=12345 for reproducibility.

### 2.1 Generate All Data

```bash
SEED=12345 npm run generate:all
```

**Expected output:**
```
✓ Generated metadata: 34 attributes
✓ Generated categories: 19 categories
✓ Generated products: 70 simple products
✓ Generated variants: 92 variants (20 parents)
✓ Generated bundles: 15 bundles
✓ Generated price books: 10 price books
✓ Generated prices: 1,770 price entries
✓ Generated inventory: 4,446 inventory records

✅ All data generated successfully to data/buildright/
```

**Time:** ~15 seconds

### 2.2 Verify Generated Files

```bash
ls -lh data/buildright/
```

**Expected output:**
```
metadata.json        1.1 KB    34 records
categories.json      177 B     19 records
products.json        3.5 KB    70 records
variants.json        8.9 KB    92 records
bundles.json         2.0 KB    15 records
price-books.json     51 B      10 records
prices.json          360 KB    1,770 records
inventory.json       200 KB    4,446 records
sources.json         97 B      6 records
```

✅ **Checkpoint:** All 9 JSON files exist with non-zero sizes

### 2.3 Individual Generation (Optional)

If you need to regenerate specific data types:

```bash
# Product Catalog
npm run generate:metadata      # 34 attributes
npm run generate:categories    # 19 categories
npm run generate:products      # 70 simple products
npm run generate:variants      # 92 variants
npm run generate:bundles       # 15 bundles

# Pricing
npm run generate:price-books   # 10 price books
npm run generate:prices        # 1,770 price entries

# Inventory
npm run generate:inventory     # 4,446 inventory records
```

---

## Phase 3: Data Ingestion

> **Context:** Upload generated data to ACO via Data Ingestion API. Must follow order: metadata → categories → products → variants → bundles → price books → prices. Total ingestion time: 1-2 hours.

### 3.1 Ingest Metadata (2-3 min)

```bash
node scripts/ingest-metadata.js
```

**Expected output:**
```
📤 Ingesting metadata attributes to ACO...
✓ Batch 1/1: 34 attributes
✅ Successfully ingested 34 attributes
```

**Validation:** ACO Admin UI → Catalog → Attributes (verify 34 attributes appear)

### 3.2 Ingest Categories (1-2 min)

```bash
node scripts/ingest-categories.js
```

**Expected output:**
```
📤 Ingesting categories to ACO...
✓ Batch 1/1: 19 categories
✅ Successfully ingested 19 categories
```

**Validation:** ACO Admin UI → Catalog → Categories (verify 5 parent + 14 child categories)

### 3.3 Ingest Products (10-15 min)

```bash
node scripts/ingest-products.js
```

**Expected output:**
```
📤 Ingesting 70 products to ACO...
✓ Batch 1/1: 70 products
✅ Successfully ingested 70 products
⏱️  Time: 12 minutes
```

**Validation:** ACO Admin UI → Catalog → Products (verify 70 products, check SKU: LBR-D0414F1E exists)

### 3.4 Ingest Variants (15-20 min)

```bash
node scripts/ingest-variants.js
```

**Expected output:**
```
📤 Ingesting 92 variants (20 configurables) to ACO...
✓ Batch 1/1: 92 variants
✅ Successfully ingested 92 variants
⏱️  Time: 18 minutes
```

**Validation:** ACO Admin UI → Products (find configurable product LBR-LVL-BEAM-CONFIG, verify variants)

### 3.5 Ingest Bundles (8-10 min)

```bash
node scripts/ingest-bundles.js
```

**Expected output:**
```
📤 Ingesting 15 bundles to ACO...
✓ Batch 1/1: 15 bundles
✅ Successfully ingested 15 bundles
⏱️  Time: 9 minutes
```

**Validation:** ACO Admin UI → Products (find bundle BUNDLE-FRAME-2X4-STD, verify components)

### 3.6 Ingest Price Books (1-2 min)

```bash
node scripts/ingest-price-books.js
```

**Expected output:**
```
📤 Ingesting 10 price books to ACO...
✓ Created price book: US-Retail (base)
✓ Created price book: US-Contract (base)
✓ Created price book: Retail-Consumer (parent: US-Retail)
✓ Created price book: Contract-Commercial (parent: US-Contract)
...
✅ Successfully ingested 10 price books
```

**Validation:** ACO Admin UI → Pricing → Price Books (verify 10 books with hierarchical relationships)

### 3.7 Ingest Prices (30-45 min)

```bash
node scripts/ingest-prices.js
```

**Expected output:**
```
📤 Ingesting 1,770 prices to ACO...
✓ Batch 1/18: 100 prices
✓ Batch 2/18: 100 prices
...
✓ Batch 18/18: 70 prices
✅ Successfully ingested 1,770 prices
⏱️  Time: 42 minutes
```

> **NOTE:** This is the longest ingestion step. Be patient!

**Validation:** ACO Admin UI → Pricing → Prices (search SKU: LBR-D0414F1E, verify pricing across price books)

### 3.8 Verify Complete Ingestion

```bash
node scripts/validate-ingestion.js
```

**Expected output:**
```
🔍 Validating ACO data ingestion...

Products: 184 ✓
├─ Simple: 70 ✓
├─ Configurable: 20 ✓
├─ Variants: 92 ✓
└─ Bundles: 15 ✓

Categories: 19 ✓
Attributes: 34 ✓
Price Books: 10 ✓
Price Entries: 1,770 ✓

✅ All data successfully ingested!
```

✅ **Checkpoint:** All data types show correct counts

---

## Phase 4: Multi-Source Inventory (MSI)

> **Context:** Configure 6 inventory sources across 3 US regions (Western, Central, Eastern) and assign 184 products to sources with quantities. ACO does not support inventory operations - must be configured manually in Adobe Commerce Admin UI.

### Quick Summary

**Time:** 2.5-4 hours total
- Create 6 inventory sources: 30-45 min
- Create 1 stock linking sources: 10-15 min
- Assign 184 products to sources: 1.5-2.5 hrs
- Configure source selection: 5 min

**For complete step-by-step instructions with all fields:**
→ **[MSI Configuration Guide](manual-setup/msi-configuration-guide.md)**

### Inventory Sources to Create

**Regional Distribution Centers (Primary):**
1. **warehouse_west** - Sacramento, CA - Priority 1
2. **warehouse_east** - Charlotte, NC - Priority 2

**Regional Warehouses (Secondary):**
3. **warehouse_phoenix** - Phoenix, AZ - Priority 3
4. **warehouse_denver** - Denver, CO - Priority 4
5. **warehouse_atlanta** - Atlanta, GA - Priority 5

**Virtual Drop Shipper (Specialty):**
6. **dropship_premium_windows** - Virtual - Priority 6

### Stock Configuration

**Navigation:** Admin → Stores → Inventory → Stocks

- **Name:** BuildRight-Main-Stock
- **Sales Channel:** Main Website
- **Assigned Sources:** All 6 sources with priorities above

### Product Assignment

**Navigation:** Admin → Catalog → Products → Edit Product → Sources Tab

For each of 184 products, assign quantities:
- **RDCs** (warehouse_west, warehouse_east): 500-750 units
- **Regional Warehouses** (phoenix, denver, atlanta): 200-400 units
- **Drop Shipper** (dropship_premium_windows): 20-50 units
- **Status:** In Stock (all sources)

> **TIP:** This is the most time-consuming step. Take breaks! Can split across multiple sessions.

### Quick Validation

Admin → Catalog → Products → Edit product LBR-D0414F1E → Sources tab
- ✅ All 6 sources assigned
- ✅ Quantities configured
- ✅ Status: In Stock

✅ **Checkpoint:** Sample products show inventory at all 6 sources

---

## Phase 5: B2B Company Configuration

> **Context:** Create 3 companies representing BuildRight's divisions (Commercial, Residential, Pro), each with 2 locations and 4 users. Assign shared catalogs (price books) to enable tier-based pricing.

### Quick Summary

**Time:** 6-8 hours total
- Enable B2B features: 30 min
- Create 3 companies: 1.5 hrs
- Create 6 teams/locations: 1.5-2 hrs
- Create 12 users: 2-2.5 hrs
- Validate configuration: 1 hr

**For complete step-by-step instructions with all fields:**
→ **[B2B Configuration Guide](manual-setup/b2b-configuration-guide.md)**

### Enable B2B Features

**Navigation:** Admin → Stores → Configuration → General → B2B Features

1. Set Store View: Default Config
2. Enable Core Features:
   - Enable Company: **Yes**
   - Enable Shared Catalog: **Yes**
   - Enable B2B Quote: **Yes**
   - Enable Requisition List: **Yes**
   - Enable Quick Order: **Yes**
3. Configure Payment Methods: All Enabled + Purchase Order
4. **Save Configuration**
5. **Clear Cache:** System → Cache Management → Flush Magento Cache

**Validation:** Navigate to Customers → Companies menu appears

### Companies to Create

**1. Premium Commercial Builders Inc.**
- **Shared Catalog:** Commercial-Tier2
- **Admin:** John Smith (jsmith@premiumcommercial.example.com)
- **Address:** 1500 Commerce Drive, Los Angeles, CA 90001
- **Locations:** Los Angeles HQ (CA), Phoenix Metro Division (AZ)
- **Users:** John Smith (Admin), Emily Johnson (Senior Buyer), Michael Chen (Default User), Amanda Garcia (Senior Buyer)

**2. Coastal Residential Builders**
- **Shared Catalog:** Residential-Builder
- **Admin:** Maria Garcia (mgarcia@coastalresidential.example.com)
- **Address:** 5000 Builder Parkway, Dallas, TX 75201
- **Locations:** Dallas HQ (TX), Denver Division (CO)
- **Users:** Maria Garcia (Admin), Robert Taylor (Senior Buyer), Sarah Martinez (Default User), James Wilson (Senior Buyer)

**3. Elite Trade Contractors**
- **Shared Catalog:** Pro-Specialty
- **Admin:** David Chen (dchen@elitetrade.example.com)
- **Address:** 2500 Trade Center Blvd, Charlotte, NC 28202
- **Locations:** Charlotte HQ (NC), Atlanta Division (GA)
- **Users:** David Chen (Admin), Lisa Anderson (Senior Buyer), Kevin Brown (Default User), Jennifer Davis (Senior Buyer)

### Quick Validation

**Check Companies:**
- Admin → Customers → Companies: 3 companies exist
- Each company shows correct shared catalog assignment

**Check Users:**
- Log out of admin
- Log in as John Smith (jsmith@premiumcommercial.example.com)
- Verify catalog products visible
- Verify pricing matches Commercial-Tier2 tier

✅ **Checkpoint:** 3 companies, 6 teams, 12 users created; can log in as company user

---

## Phase 6: Trigger-Based Policies

> **Context:** Configure policies in ACO Admin UI to enable dynamic catalog filtering via HTTP headers (project type, product category, brand). Policies apply in real-time without pre-built static views.

### Quick Summary

**Time:** 1-2 hours total
- Create 3 trigger policies: 30-40 min each
- Associate with catalog view
- Test with GraphQL queries

**For complete step-by-step instructions with policy configuration:**
→ **[Trigger Policy Guide](manual-setup/trigger-policy-guide.md)**

### Access ACO Policy Management

1. Log into ACO Admin Console at:
   ```
   https://experience.adobe.com/#/@demosystem/in:{TENANT_ID}/commerce-optimizer-studio
   ```
2. Navigate to **Catalog Management → Policies**
3. Click **Create New Policy**

### Policies to Create

**1. Project Type Filter**
- **Policy ID:** `project-type-filter`
- **Policy Name:** Project Type Filter
- **Policy Type:** EXCLUSIVE (trigger-based)
- **Trigger Name:** `AC-Policy-Project-Type`
- **Transport:** HTTP_HEADER
- **Attribute:** `project_types` (multiselect)
- **Operator:** CONTAINS
- **Value Source:** TRIGGER
- **Priority:** 1

**2. Product Category Filter**
- **Policy ID:** `category-filter`
- **Policy Name:** Product Category Filter
- **Policy Type:** EXCLUSIVE
- **Trigger Name:** `AC-Policy-Product-Category`
- **Transport:** HTTP_HEADER
- **Attribute:** `product_category`
- **Operator:** EQUALS
- **Value Source:** TRIGGER
- **Priority:** 2

**3. Brand Filter**
- **Policy ID:** `brand-filter`
- **Policy Name:** Brand Filter
- **Policy Type:** EXCLUSIVE
- **Trigger Name:** `AC-Policy-Brand`
- **Transport:** HTTP_HEADER
- **Attribute:** `brand`
- **Operator:** EQUALS
- **Value Source:** TRIGGER
- **Priority:** 3

### Test Policies

```bash
curl -X POST "https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/graphql" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "AC-Policy-Project-Type: new_construction" \
  -H "AC-Policy-Product-Category: structural_materials" \
  -d '{"query": "{ products { items { sku name } } }"}'
```

**Expected:** Only products matching ALL conditions (logical AND)

✅ **Checkpoint:** 3 policies created; HTTP headers filter products correctly

---

## Phase 7: Complete Validation

### Validation Checklist

**ACO Data:**
```bash
node scripts/validate-ingestion.js
```
- ✅ 184 products (70 simple + 92 variants + 15 bundles + 10 services)
- ✅ 34 attributes, 19 categories
- ✅ 10 price books, 1,770 prices
- ✅ Products have project_types attribute assigned

**Inventory (MSI):**
- ✅ 6 inventory sources created and enabled
- ✅ BuildRight-Main-Stock has all 6 sources assigned with priorities
- ✅ Sample products show inventory at multiple sources
- ✅ Products display "In Stock" status

**B2B:**
- ✅ 3 companies created
- ✅ 6 teams/locations configured
- ✅ 12 users created and active
- ✅ Shared catalogs assigned correctly
- ✅ Can log in as company user and see products

**Policies:**
- ✅ 3 trigger policies created
- ✅ Policies associated with catalog view
- ✅ HTTP headers filter products correctly

### Functional Tests

**Test 1: Hierarchical Pricing**

1. Query product LBR-D0414F1E in ACO
2. Verify pricing across price books:
   - US-Contract: $8.50
   - Commercial-Tier2: $8.08
3. Log in as John Smith (Premium Commercial)
4. View product on storefront
5. Verify price shows $8.08 (Tier2 pricing)

**Test 2: Project Type Filtering**

```bash
# Test new_construction filter
curl -X POST "{ENDPOINT}/graphql" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "AC-Policy-Project-Type: new_construction" \
  -d '{"query": "{ products { totalCount } }"}'
# Expected: ~45 products

# Test remodel filter
curl -X POST "{ENDPOINT}/graphql" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "AC-Policy-Project-Type: remodel" \
  -d '{"query": "{ products { totalCount } }"}'
# Expected: ~55 products
```

**Test 3: Multi-Location B2B**

1. Log in as Emily Johnson (LA HQ, Company 1)
2. View products and pricing
3. Log out
4. Log in as Michael Chen (Phoenix, Company 1)
5. Verify same pricing (both users in same company)

**Test 4: Inventory Visibility**

1. Check product on storefront
2. Verify "In Stock" displays
3. Check quantity available
4. Verify sourcing shows nearest warehouse

✅ **Final Checkpoint:** All test scenarios pass successfully

---

## Troubleshooting

### OAuth Authentication Fails

**Error:** `Invalid credentials (401 Unauthorized)`

**Solutions:**
1. Verify CLIENT_ID and CLIENT_SECRET in `.env`
2. Check credentials in Adobe Developer Console
3. Ensure ACO API added to your project
4. Verify TENANT_ID is correct
5. Try regenerating OAuth credentials

---

### Products Not Appearing After Ingestion

**Error:** Validation script shows 0 products

**Solutions:**
1. Check ingestion logs for errors
2. Verify `.env` TENANT_ID matches your instance
3. Query GraphQL directly:
   ```bash
   curl -X POST "{ENDPOINT}/graphql" \
     -H "Authorization: Bearer {TOKEN}" \
     -d '{"query": "{ products { totalCount } }"}'
   ```
4. Verify metadata ingested before products
5. Check for schema validation errors in logs

---

### Shared Catalogs Not Appearing

**Error:** Customers → Shared Catalogs menu missing

**Solutions:**
1. Verify B2B extension installed
2. Check Stores → Configuration → B2B Features → Enabled
3. Clear cache: System → Cache Management → Flush Magento Cache
4. Reindex: System → Index Management → Reindex All
5. Check price books ingested to ACO successfully

---

### Trigger Policies Not Filtering

**Error:** All products appear regardless of HTTP headers

**Solutions:**
1. Verify policy created in ACO Admin UI
2. Check policy associated with catalog view
3. Verify trigger name matches HTTP header exactly (case-sensitive)
4. Check attribute exists and products have values assigned
5. Test with curl to isolate frontend vs backend issue
6. Review operator (use CONTAINS for multiselect, EQUALS for select)

---

### Company Users Can't See Products

**Error:** User logs in but catalog is empty

**Solutions:**
1. Verify company assigned to shared catalog
2. Check shared catalog has products assigned
3. Navigate to Admin → Catalog → Shared Catalogs → [Catalog] → Set Pricing and Structure
4. Verify products selected (use "Select All" or by category)
5. Clear cache and reindex
6. Check user's company membership is active

---

## Quick Command Reference

### Data Generation
```bash
SEED=12345 npm run generate:all              # Generate everything
npm run generate:metadata                     # Attributes only
npm run generate:categories                   # Categories only
npm run generate:products                     # Simple products only
npm run generate:variants                     # Configurable products
npm run generate:bundles                      # Bundles only
npm run generate:prices                       # Prices only
npm run generate:inventory                    # Inventory only
```

### Data Ingestion (in order)
```bash
node scripts/ingest-metadata.js              # 1. Metadata (2-3 min)
node scripts/ingest-categories.js            # 2. Categories (1-2 min)
node scripts/ingest-products.js              # 3. Products (10-15 min)
node scripts/ingest-variants.js              # 4. Variants (15-20 min)
node scripts/ingest-bundles.js               # 5. Bundles (8-10 min)
node scripts/ingest-price-books.js           # 6. Price books (1-2 min)
node scripts/ingest-prices.js                # 7. Prices (30-45 min)
```

### Validation
```bash
node scripts/validate-ingestion.js           # Verify all data ingested
```

---

## Key Constants

**Inventory Sources (6):**
- warehouse_west (Sacramento, CA) - Priority 1
- warehouse_east (Charlotte, NC) - Priority 2
- warehouse_phoenix (Phoenix, AZ) - Priority 3
- warehouse_denver (Denver, CO) - Priority 4
- warehouse_atlanta (Atlanta, GA) - Priority 5
- dropship_premium_windows (Virtual) - Priority 6

**Price Books (10):**
- **Level 1 (Base):** US-Retail, US-Contract
- **Level 2 (Segment):** Retail-Consumer, Contract-Commercial, Contract-Residential, Contract-Pro
- **Level 3 (Tier):** Commercial-Tier1, Commercial-Tier2, Residential-Builder, Pro-Specialty

**Product Counts:**
- Simple: 70 (includes 10 services)
- Configurable Parents: 20
- Variants: 92
- Bundles: 15
- **Total:** 184 products

**B2B Structure:**
- Companies: 3 (Premium Commercial, Coastal Residential, Elite Trade)
- Locations: 6 (2 per company)
- Users: 12 (4 per company)

---

## Related Documentation

### Business Context
- [BuildRight Case Study](BUILDRIGHT-CASE-STUDY.md) - Business narrative, challenge, solution, outcomes

### Detailed Implementation Guides
- [MSI Configuration Guide](manual-setup/msi-configuration-guide.md) - Complete inventory setup procedures
- [B2B Configuration Guide](manual-setup/b2b-configuration-guide.md) - Complete company setup procedures
- [Trigger Policy Guide](manual-setup/trigger-policy-guide.md) - Complete policy configuration procedures

### Architecture
- [B2B Structure Diagram](architecture/buildright-b2b-structure.md) - Company and location hierarchy

### Project Information
- [Project README](README.md) - Repository overview and quick start

---

**Document Version:** 1.0
**Last Updated:** October 31, 2025
**Total Setup Time:** 12-16 hours (can be spread over 2-3 days)
**Status:** Production Ready
