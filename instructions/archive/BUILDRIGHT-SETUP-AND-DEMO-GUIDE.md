# BuildRight ACO Setup & Demonstration Guide

**Complete Setup and Delivery Playbook**

**Version:** 2.0
**Last Updated:** October 30, 2025
**Status:** Production Ready

---

## Document Purpose

This is the **complete setup and demonstration delivery guide** for the BuildRight Adobe Commerce Optimizer (ACO) implementation. Follow this guide from start to finish to:

1. **Build the demo environment** from scratch
2. **Validate** everything works correctly
3. **Deliver compelling demonstrations** to prospects

**Target Audience:** Sales engineers, implementation specialists, solution architects responsible for setting up and demonstrating ACO capabilities

**Total Time Estimate:** 12-16 hours for complete setup (can be spread over multiple days)

---

## Table of Contents

### PART 1: UNDERSTANDING
1. [Getting Started](#1-getting-started)
2. [Business Context](#2-business-context)
3. [Solution Architecture](#3-solution-architecture)

### PART 2: SETUP (Step-by-Step Implementation)
4. [Prerequisites & Environment Setup](#4-prerequisites--environment-setup)
5. [Phase 1 - Data Generation](#5-phase-1---data-generation)
6. [Phase 2 - Data Ingestion to ACO](#6-phase-2---data-ingestion-to-aco)
7. [Phase 3 - Multi-Source Inventory (MSI)](#7-phase-3---multi-source-inventory-msi)
8. [Phase 4 - B2B Company Configuration](#8-phase-4---b2b-company-configuration)
9. [Phase 5 - Trigger-Based Policies](#9-phase-5---trigger-based-policies)
10. [Complete System Validation](#10-complete-system-validation)

### PART 3: DEMONSTRATION
11. [Demo Scenarios](#11-demo-scenarios)
12. [Key Talking Points](#12-key-talking-points)

### PART 4: REFERENCE
13. [Troubleshooting](#13-troubleshooting)
14. [Technical Reference](#14-technical-reference)
15. [Appendices](#15-appendices)

---

# PART 1: UNDERSTANDING

## 1. Getting Started

### 1.1 What You'll Accomplish

By following this guide, you will build a complete, production-ready Adobe Commerce Optimizer demo showcasing:

**Data Scale:**
- 184 products across realistic product mix (simple, configurable, bundles, services)
- 10 hierarchical price books across 3 levels
- 6 inventory sources across 3 US regions
- 3 B2B companies with 6 locations and 12 users
- 34 rich metadata attributes for intelligent filtering

**Key Capabilities:**
- Hierarchical B2B pricing with automatic volume discounts
- Project-based catalog filtering (new construction, remodel, repair, restoration)
- Company-specific catalogs with shared pricing
- Trigger-based dynamic catalogs using HTTP headers
- Multi-source inventory with national distribution
- Pre-configured bundles and service products

### 1.2 Time Commitment

**Total:** 12-16 hours (can spread over 2-3 days)

| Phase | Activity | Time Estimate |
|-------|----------|---------------|
| **Setup** | Prerequisites & Environment | 30 minutes |
| **Setup** | Data Generation | 15 minutes |
| **Setup** | Data Ingestion to ACO | 1-2 hours |
| **Setup** | Multi-Source Inventory (MSI) | 2.5-4 hours |
| **Setup** | B2B Company Configuration | 6-8 hours |
| **Setup** | Trigger-Based Policies | 1-2 hours |
| **Validation** | Complete System Testing | 1 hour |
| **Demo Prep** | Review Scenarios | 30 minutes |

**Note:** B2B configuration is the longest phase. You can save this for day 2 if needed.

### 1.3 What You'll Need

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
- Web browser for Adobe Commerce Admin UI

**Required Knowledge:**
- Basic command line usage
- Understanding of Adobe Commerce concepts
- Familiarity with GraphQL queries (helpful but not required)

### 1.4 Document Conventions

**Command Prompts:**
```bash
# This is a command you run in terminal
npm run generate:all
```

**Configuration Files:**
```env
# This is content for .env file
CLIENT_ID=your-value-here
```

**Navigation Paths:**
- **Admin → Catalog → Products** means: Log into Admin UI, click Catalog menu, click Products

**Validation Checkpoints:**
- ✅ Indicates a validation step you should complete

**Important Notes:**
> **IMPORTANT:** Critical information you must read

**Tips:**
> **TIP:** Helpful information that will make your life easier

---

## 2. Business Context

### 2.1 What BuildRight Is

**BuildRight Solutions** is a multi-regional building materials distributor serving professional contractors, builders, and project managers across North America. This is a **fictional company** created to demonstrate ACO capabilities in the construction materials vertical.

Founded in 1978 as a single lumber yard in Sacramento, California, BuildRight has grown into a national building materials distributor with operations across three regions serving over 2,500 professional contractors.

**Three Operating Divisions:**

1. **BuildRight Commercial** - Large-scale commercial construction projects
   - Focus: Office buildings, hospitals, schools, retail
   - Customers: General contractors managing $5M-$50M+ projects
   - Purchasing: Full pallets and truckloads with job site delivery

2. **BuildRight Residential** - Production home builders and residential remodelers
   - Focus: Production homes and residential renovation
   - Customers: Home builders (50-200 homes annually), remodelers
   - Purchasing: Standardized materials at scale, repeat orders

3. **BuildRight Pro** - Specialty trade contractors
   - Focus: Electrical, plumbing, HVAC specialty trades
   - Customers: Licensed electricians, plumbers, HVAC technicians
   - Purchasing: Trade-specific products, smaller quantities but frequently

### 2.2 The Business Challenge

Traditional one-size-fits-all catalogs don't work for construction materials distribution. Consider these pain points:

**Problem 1: Catalog Overload**
- A commercial contractor building a 12-story office needs entirely different products than a residential remodeler replacing a kitchen
- Yet both browse the same massive 150,000+ SKU catalog
- Result: Contractors waste **60-70% of search time** browsing irrelevant products

**Problem 2: Ordering Errors**
- Contractors order wrong materials for project type
- Heavy structural lumber shown to residential contractors
- Residential products shown to commercial builders
- Result: Returns, delays, and customer frustration

**Problem 3: Pricing Complexity**
- Volume customers negotiate pricing manually with sales reps
- No transparency on tier-based discounts
- Quote requests delay purchasing decisions
- Result: Slow sales cycles and pricing inconsistency

**Problem 4: Regional Availability**
- Products shown regardless of regional inventory
- Customers order products not available in their distribution center
- Result: Backorders and fulfillment delays

### 2.3 The ACO Solution

Adobe Commerce Optimizer enables BuildRight to deliver **personalized, project-specific product catalogs** that dynamically adapt to:

1. **Customer segment** (Commercial, Residential, Pro)
2. **Project type** (New construction, Remodel, Repair, Restoration)
3. **Purchasing volume** (Tier-based automatic discounting)
4. **Geographic region** (Only show in-stock regional products)

**How It Works - Example Scenario:**

When **John Smith** from Premium Commercial Builders Inc. logs in to order materials for a new construction project, the system:

1. **Identifies his company** → Premium Commercial Builders = Commercial-Tier2 pricing
2. **Detects project context** → New construction framing phase
3. **Filters products** → Shows only structural materials tagged for new construction
4. **Applies pricing** → Tier2 volume discounts automatically (5% better than standard)
5. **Shows availability** → Only products in stock at Sacramento or Phoenix warehouses

**Result:** John sees ~48 products instead of 184, all relevant to his project, all correctly priced, all actually available. His search time drops **70%**.

### 2.4 Business Value Delivered

**For Contractors:**
- 60-70% reduction in product search time
- Automatic volume discounts without negotiation
- Access only to products available in their region
- Pre-configured bundles reduce 50-item orders to 3-4 selections

**For BuildRight:**
- Single product catalog serves all customer segments
- Automatic tier-based pricing rewards high-volume customers
- Real-time catalog composition without hundreds of static views
- Intelligent attribute assignment reduces data management overhead

**For Adobe (Demo Value):**
- Demonstrates ACO's composable catalog capabilities
- Showcases trigger-based personalization with HTTP headers
- Validates B2B hierarchical pricing model
- Proves enterprise-scale product metadata management

### 2.5 Real Pricing Examples

**Product:** 2x4x8 SPF Stud Standard Grade (SKU: LBR-D0414F1E)

| Customer Type | Price Book | Unit Price | Savings vs Base |
|---------------|------------|------------|-----------------|
| Base Contract | US-Contract | $8.50 | - |
| Commercial Standard | Contract-Commercial | $8.50 | $0 |
| Commercial Tier1 | Commercial-Tier1 | $8.25 | $0.25 (3%) |
| **Commercial Tier2** | **Commercial-Tier2** | **$8.08** | **$0.42 (5%)** |
| Residential Builder | Residential-Builder | $8.50 | $0 |

**Volume Tier Pricing** (additional discounts):
- 1-99 units: $8.08/unit
- 100-293 units: $7.84/unit (-3% additional)
- 294+ units (full bundle): $7.50/unit (-12% total)

**Business Impact:**
- On a 10,000-stud order (typical commercial project): **$10,000 in savings** (12%)
- Pricing is **automatic** - no manual quoting required

---

## 3. Solution Architecture

### 3.1 What We Built

**Data Overview:**

| Component | Count | Details |
|-----------|-------|---------|
| **Products** | 184 SKUs | 70 simple + 10 service + 92 variants + 15 bundles |
| **Price Books** | 10 (3 levels) | Hierarchical B2B pricing structure |
| **Inventory Sources** | 6 locations | National distribution across 3 regions |
| **Metadata Attributes** | 34 attributes | Rich product specifications |
| **Categories** | 19 (2-level) | Intuitive navigation hierarchy |
| **Price Entries** | 1,770 | Volume-based tiering |
| **Inventory Records** | 4,446 | Multi-source allocation |
| **B2B Companies** | 3 companies | Across 3 divisions |
| **B2B Locations** | 6 locations | 2 per company, nationally distributed |
| **B2B Users** | 12 users | 4 per company, 2 per location |

### 3.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Product Catalog                           │
│  184 SKUs with 34 metadata attributes                       │
│  - 70 simple products                                        │
│  - 10 service products                                       │
│  - 20 configurable parents + 92 variants                    │
│  - 15 bundle products                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Referenced by
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Hierarchical Pricing                        │
│  10 price books across 3 levels                             │
│  - Level 1: Base (2 books)                                  │
│  - Level 2: Segment (4 books)                               │
│  - Level 3: Tier (4 books)                                  │
│  1,770 price entries with volume tiers                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Assigned to
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   B2B Companies                              │
│  3 companies across 3 divisions                             │
│  - Each assigned to one price book (tier level)             │
│  - 6 locations (teams) across 6 states                      │
│  - 12 users with role-based permissions                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Filters via
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Trigger-Based Policies                          │
│  HTTP headers sent with API requests                        │
│  - AC-Policy-Project-Type: new_construction                 │
│  - AC-Policy-Product-Category: structural_materials         │
│  - AC-Policy-Brand: buildright_pro                          │
│  Real-time catalog composition without static views         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Checked against
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Multi-Source Inventory                          │
│  6 inventory sources across 3 regions                       │
│  - 2 regional distribution centers (primary)                │
│  - 3 regional warehouses (secondary)                        │
│  - 1 virtual drop shipper (specialty)                       │
│  4,446 inventory records for stock allocation               │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 National Distribution Model

BuildRight operates across **3 US regions** with **6 locations** nationally distributed:

**Western Region (CA, AZ):**
- Premium Commercial Builders Inc.
  - Los Angeles Headquarters (CA)
  - Phoenix Metro Division (AZ)
- Inventory: Sacramento RDC (warehouse_west), Phoenix Warehouse (warehouse_phoenix)

**Central Region (TX, CO):**
- Coastal Residential Builders
  - Dallas Headquarters (TX)
  - Denver Division (CO)
- Inventory: Denver Warehouse (warehouse_denver)

**Eastern Region (NC, GA):**
- Elite Trade Contractors
  - Charlotte Headquarters (NC)
  - Atlanta Division (GA)
- Inventory: Charlotte RDC (warehouse_east), Atlanta Warehouse (warehouse_atlanta)

**National Coverage:** 6 states, 3 regions, demonstrating true national distribution

### 3.4 Data Flow Overview

```
SETUP PHASE:
1. Generate Data (Local Scripts)
   └─> Node.js scripts create JSON files

2. Ingest to ACO (API Upload)
   └─> Metadata → Categories → Products → Variants → Bundles
   └─> Price Books → Prices

3. Configure MSI (Adobe Commerce Admin)
   └─> Create 6 inventory sources
   └─> Create 1 stock linking all sources
   └─> Assign 184 products to sources with quantities

4. Configure B2B (Adobe Commerce Admin)
   └─> Create 3 companies
   └─> Create 6 teams/locations
   └─> Create 12 users
   └─> Assign shared catalogs (price books)

5. Configure Policies (ACO Admin UI)
   └─> Create project type filter
   └─> Create category filter
   └─> Create brand filter

RUNTIME (DEMO):
1. User logs in → Company identified
2. Frontend sends HTTP headers (project type, category, etc.)
3. ACO applies policies → Filtered product catalog
4. ACO applies pricing → Company's tier pricing
5. MSI checks availability → Show only in-stock products
6. User sees personalized, priced, available catalog
```

### 3.5 What ACO Manages vs. What's Manual

**ACO Data Ingestion API Manages:**
- ✅ Product catalog (simple, configurable, bundles)
- ✅ Product attributes (34 metadata attributes)
- ✅ Categories (19-category hierarchy)
- ✅ Price books (10 hierarchical books)
- ✅ Product prices (1,770 price entries)

**Manual Configuration Required:**
- ⚙️ **Inventory (MSI)** - ACO does not support inventory operations
- ⚙️ **B2B Companies** - Adobe Commerce B2B admin workflow
- ⚙️ **Trigger Policies** - ACO Policy API or ACO Admin UI

This guide covers **all steps** - both automated (data ingestion) and manual (MSI, B2B, policies).

---

**End of Part 1: Understanding**

---

# PART 2: SETUP (Step-by-Step Implementation)

## 4. Prerequisites & Environment Setup

### 4.1 Required Access

Before you begin, ensure you have:

**ACO Instance Access:**
- Adobe Commerce Optimizer sandbox or production instance
- Tenant ID from Commerce Cloud Manager
- Region identifier (na1, eu1, etc.)

**Adobe Developer Console:**
- Access to create/manage integrations
- Ability to generate OAuth credentials
- Permission to add Adobe Commerce Optimizer API

**Adobe Commerce 2.4.x:**
- Admin access with full permissions
- B2B extension installed and enabled
- Multi-Source Inventory (MSI) enabled

**Tools Installed:**
- Node.js 20.14.0 or higher
- npm 9.x or higher
- Git (for cloning repository)
- Text editor (VS Code, Sublime, etc.)

### 4.2 Getting Your Credentials

#### Step 1: Get Adobe Developer Console Credentials

1. Go to [Adobe Developer Console](https://developer.adobe.com/console)
2. Click **Create new project** (or select existing project)
3. Click **Add API**
4. Search for and select **"Adobe Commerce Optimizer"**
5. Select **OAuth Server-to-Server** authentication
6. Click **Next**, then **Save configured API**
7. Navigate to the **Credentials** tab
8. Copy your **Client ID** and **Client Secret**

> **IMPORTANT:** Keep these credentials secure. Never commit them to version control.

#### Step 2: Get Your Tenant ID

1. Go to [Commerce Cloud Manager](https://experience.adobe.com/)
2. Navigate to **Commerce → Commerce Cloud Manager**
3. Select your ACO instance from the list
4. Click the **info icon** (ⓘ) to view instance details
5. Look for endpoint URLs like:
   ```
   https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/graphql
   ```
6. Copy the `{TENANT_ID}` portion (usually looks like: `8a72c12b-9...`)

#### Step 3: Identify Your Region and Environment

**Region:** Determined by your instance location
- `na1` - North America (most common)
- `eu1` - Europe
- `ap1` - Asia Pacific

**Environment:** Type of instance
- `sandbox` - Test/development environment
- `production` - Production environment

### 4.3 Clone Repository and Install Dependencies

Open your terminal and run:

```bash
# Clone the repository
git clone <repository-url>
cd buildright-aco

# Install dependencies
npm install
```

**Verify installation:**
```bash
# Check Node.js version
node --version
# Should show: v20.14.0 or higher

# Check npm version
npm --version
# Should show: 9.x or higher

# Verify dependencies installed
ls node_modules/@adobe-commerce
# Should show: aco-ts-sdk
```

### 4.4 Configure Environment Variables

Create your `.env` file from the template:

```bash
cp .env.dist .env
```

Open `.env` in your text editor and fill in your credentials:

```env
##################################################
# Adobe Commerce Optimizer Configuration
##################################################

# Required: OAuth Credentials (from Adobe Developer Console)
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here

# Required: Instance Configuration
TENANT_ID=your-tenant-id-here
REGION=na1
ENVIRONMENT=sandbox

# Optional: Query Configuration
VIEW_ID=default
SOURCE_LOCALE=en-US

# Optional: Data Generation (for reproducible builds)
SEED=12345

# Optional: Logging
LOG_LEVEL=info
```

**Field Descriptions:**
- `CLIENT_ID` - From Adobe Developer Console OAuth credentials
- `CLIENT_SECRET` - From Adobe Developer Console OAuth credentials
- `TENANT_ID` - From Commerce Cloud Manager instance details
- `REGION` - Your instance region (na1, eu1, or ap1)
- `ENVIRONMENT` - sandbox or production
- `VIEW_ID` - Catalog view ID (usually "default")
- `SOURCE_LOCALE` - Language/locale (en-US, en-GB, etc.)
- `SEED` - Seed value for deterministic random generation (12345 recommended)

### 4.5 Test Your Configuration

Verify your credentials work by testing OAuth authentication:

```bash
# Create a simple test script
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

**If you see errors:**
- "Missing required ACO configuration" → Check .env file exists and contains all variables
- "Invalid credentials" → Verify CLIENT_ID and CLIENT_SECRET are correct
- "Tenant not found" → Verify TENANT_ID matches your instance

✅ **VALIDATION CHECKPOINT:** Your environment is configured correctly when the test script runs without errors.

---

## 5. Phase 1 - Data Generation

**Time Estimate:** 15 minutes
**What You'll Do:** Generate all JSON data files locally using deterministic scripts

### 5.1 Understanding Data Generation

BuildRight's demo data is generated using Node.js scripts that create realistic, schema-compliant JSON files. All generation is **deterministic** (using `SEED=12345`) so you get identical output every time.

**What Gets Generated:**

| File | Records | Description |
|------|---------|-------------|
| `metadata.json` | 34 | Product attribute definitions |
| `categories.json` | 19 | Category hierarchy (2 levels) |
| `products.json` | 70 | Simple products |
| `variants.json` | 92 | Configurable products + variants |
| `bundles.json` | 15 | Bundle products |
| `price-books.json` | 10 | Hierarchical price books |
| `prices.json` | 1,770 | Pricing entries (simplified model) |
| `inventory.json` | 4,446 | Multi-source inventory records |

**All files saved to:** `data/buildright/`

### 5.2 Generate All Data at Once

The fastest way is to generate everything in one command:

```bash
SEED=12345 npm run generate:all
```

**What happens:**
1. Generates metadata (34 attributes) → `data/buildright/metadata.json`
2. Generates categories (19 categories) → `data/buildright/categories.json`
3. Generates simple products (70 products) → `data/buildright/products.json`
4. Generates variants (92 variants) → `data/buildright/variants.json`
5. Generates bundles (15 bundles) → `data/buildright/bundles.json`
6. Generates price books (10 books) → `data/buildright/price-books.json`
7. Generates prices (1,770 entries) → `data/buildright/prices.json`
8. Generates inventory (4,446 records) → `data/buildright/inventory.json`

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

**Time:** ~15 seconds to complete all generation

### 5.3 Verify Generated Files

Check that all files were created:

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

### 5.4 Understanding Individual Generation Scripts (Optional)

If you need to regenerate specific data types, use these individual commands:

**Product Catalog:**
```bash
npm run generate:metadata      # Product attributes
npm run generate:categories    # Category hierarchy
npm run generate:products      # Simple + service products
npm run generate:variants      # Configurable products + variants
npm run generate:bundles       # Bundle products
npm run generate:all-products  # All product types at once
```

**Pricing:**
```bash
npm run generate:price-books   # Price book structure
npm run generate:prices        # All pricing data
npm run generate:all-pricing   # Both at once
```

**Inventory:**
```bash
npm run generate:inventory     # Inventory records
```

### 5.5 Inspect Generated Data

Take a moment to understand what was generated:

**View metadata (product attributes):**
```bash
head -20 data/buildright/metadata.json
```

**View first product:**
```bash
jq '.[0]' data/buildright/products.json
```

**Count price entries:**
```bash
jq '. | length' data/buildright/prices.json
# Shows: 1770
```

**View price book hierarchy:**
```bash
jq '.[] | {id: .id, name: .name, parentId: .parentId}' data/buildright/price-books.json
```

✅ **VALIDATION CHECKPOINT:** All 8 JSON files exist in `data/buildright/` directory with non-zero file sizes.

---

## 6. Phase 2 - Data Ingestion to ACO

**Time Estimate:** 1-2 hours (includes API processing time)
**What You'll Do:** Upload generated data to Adobe Commerce Optimizer via Data Ingestion API

### 6.1 Understanding Data Ingestion

ACO provides a REST API for ingesting catalog data. The BuildRight scripts handle:
- OAuth authentication
- Batch processing (respecting API limits)
- Retry logic for transient failures
- Progress logging

**Ingestion Order (Important!):**
```
1. Metadata (attributes)     ← Must be first
2. Categories                ← Before products reference them
3. Products (simple)         ← Before variants reference them
4. Variants (configurable)   ← After parent products exist
5. Bundles                   ← After component products exist
6. Price Books               ← Before prices reference them
7. Prices                    ← Last
```

> **IMPORTANT:** Follow this order! Ingesting out of order will cause foreign key errors.

### 6.2 Pre-Ingestion Checklist

Before you begin, verify:

- ✅ All data files generated in Phase 1
- ✅ `.env` configured with valid credentials
- ✅ ACO client test passed (from Section 4.5)
- ✅ Stable internet connection (upload takes time)

### 6.3 Ingest Metadata (Product Attributes)

**Time:** 2-3 minutes

```bash
node scripts/ingest-metadata.js
```

**What this does:**
- Reads `data/buildright/metadata.json`
- Creates 34 product attributes in ACO
- Attributes like: product_category, project_types, brand, lumber_species, etc.

**Expected output:**
```
📤 Ingesting metadata attributes to ACO...
✓ Batch 1/1: 34 attributes
✅ Successfully ingested 34 attributes
```

**Validation:**
Log into ACO Admin UI → Catalog → Attributes
- Verify 34 BuildRight attributes appear
- Check attribute types (select, multiselect, text, number, boolean)

### 6.4 Ingest Categories

**Time:** 1-2 minutes

```bash
node scripts/ingest-categories.js
```

**What this does:**
- Reads `data/buildright/categories.json`
- Creates 19-category hierarchy (5 parents, 14 children)

**Expected output:**
```
📤 Ingesting categories to ACO...
✓ Batch 1/1: 19 categories
✅ Successfully ingested 19 categories
```

**Validation:**
ACO Admin UI → Catalog → Categories
- Verify 5 parent categories exist
- Verify 14 child categories with correct parent relationships

### 6.5 Ingest Products (Simple + Service)

**Time:** 10-15 minutes

```bash
node scripts/ingest-products.js
```

**What this does:**
- Reads `data/buildright/products.json`
- Creates 70 products (60 simple + 10 service)
- Batches requests (100 products per batch)

**Expected output:**
```
📤 Ingesting 70 products to ACO...
✓ Batch 1/1: 70 products
✅ Successfully ingested 70 products
⏱️  Time: 12 minutes
```

**Validation:**
ACO Admin UI → Catalog → Products
- Total product count: 70
- Check a few SKUs exist (e.g., LBR-D0414F1E, SVC-DEL-JOBSITE)

### 6.6 Ingest Variants (Configurable Products)

**Time:** 15-20 minutes

```bash
node scripts/ingest-variants.js
```

**What this does:**
- Reads `data/buildright/variants.json`
- Creates 20 configurable parent products
- Creates 92 variant products
- Links variants to parents via `variantReferenceId`

**Expected output:**
```
📤 Ingesting 92 variants (20 configurables) to ACO...
✓ Batch 1/1: 92 variants
✅ Successfully ingested 92 variants
⏱️  Time: 18 minutes
```

**Validation:**
ACO Admin UI → Products
- Find a configurable product (e.g., LBR-LVL-BEAM-CONFIG)
- Verify it shows variants/configurations

### 6.7 Ingest Bundles

**Time:** 8-10 minutes

```bash
node scripts/ingest-bundles.js
```

**What this does:**
- Reads `data/buildright/bundles.json`
- Creates 15 bundle products with bundle groups

**Expected output:**
```
📤 Ingesting 15 bundles to ACO...
✓ Batch 1/1: 15 bundles
✅ Successfully ingested 15 bundles
⏱️  Time: 9 minutes
```

**Validation:**
ACO Admin UI → Products
- Find bundle product (e.g., BUNDLE-FRAME-2X4-STD)
- Verify bundle components listed

### 6.8 Ingest Price Books

**Time:** 1-2 minutes

```bash
node scripts/ingest-price-books.js
```

**What this does:**
- Reads `data/buildright/price-books.json`
- Creates 10 hierarchical price books

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

**Validation:**
ACO Admin UI → Pricing → Price Books
- Verify 10 price books exist
- Check hierarchical relationships (parentId linkage)

### 6.9 Ingest Prices

**Time:** 30-45 minutes (largest dataset)

```bash
node scripts/ingest-prices.js
```

**What this does:**
- Reads `data/buildright/prices.json`
- Creates 1,770 price entries
- Batches in groups of 100

**Expected output:**
```
📤 Ingesting 1,770 prices to ACO...
✓ Batch 1/300: 100 prices
✓ Batch 2/300: 100 prices
...
✓ Batch 300/300: 53 prices
✅ Successfully ingested 1,770 prices
⏱️  Time: 42 minutes
```

> **NOTE:** This is the longest ingestion step. Be patient!

**Validation:**
ACO Admin UI → Pricing → Prices
- Search for a product SKU (e.g., LBR-D0414F1E)
- Verify pricing appears across multiple price books
- Check tier pricing exists (quantity-based discounts)

### 6.10 Verify Complete Ingestion

Run the verification script:

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

✅ **VALIDATION CHECKPOINT:** All data types show correct counts in validation script.

---

## 7. Phase 3 - Multi-Source Inventory (MSI)

**Time Estimate:** 2.5-4 hours
**What You'll Do:** Configure 6 inventory sources and assign products via Adobe Commerce Admin UI

> **IMPORTANT:** ACO Data Ingestion API **does not support inventory operations**. Multi-Source Inventory must be configured manually in Adobe Commerce.

### 7.1 Understanding MSI Architecture

BuildRight uses **6 inventory sources** across **3 US regions** in **1 stock** (BuildRight-Main-Stock):

**Regional Distribution Centers (Primary):**
1. **warehouse_west** (Sacramento, CA) - Priority 1
2. **warehouse_east** (Charlotte, NC) - Priority 2

**Regional Warehouses (Secondary):**
3. **warehouse_phoenix** (Phoenix, AZ) - Priority 3
4. **warehouse_denver** (Denver, CO) - Priority 4
5. **warehouse_atlanta** (Atlanta, GA) - Priority 5

**Virtual Drop Shipper (Fallback):**
6. **dropship_premium_windows** (Virtual) - Priority 6

**Why 1 Stock?** Adobe Commerce has a 1:1 relationship between stocks and websites. Since BuildRight uses a single website, we configure a single stock with all 6 sources assigned.

### 7.2 Step 1: Enable MSI

**Navigation:** Admin → Stores → Configuration → Catalog → Inventory

1. Set **Stock Options → Manage Stock:** Yes
2. Click **Save Config**
3. Navigate to **System → Cache Management**
4. Click **Flush Magento Cache**

✅ **Validation:** Navigate to Stores → Inventory → Sources menu appears

### 7.3 Step 2: Create Inventory Sources

**Navigation:** Admin → Stores → Inventory → Sources

**Create 6 sources (repeat for each):**

#### Source 1: warehouse_west

1. Click **Add New Source**
2. Fill in:
   - **Name:** Western RDC - Sacramento
   - **Code:** warehouse_west (⚠️ CANNOT be changed after creation)
   - **Enabled:** Yes
   - **Latitude:** 38.5816
   - **Longitude:** -121.4944
   - **Country:** United States
   - **State/Province:** California
   - **City:** Sacramento
   - **Street:** 500 Commerce Way
   - **Postcode:** 95814
   - **Phone:** 916-555-0100
   - **Email:** warehouse.west@buildright.com
   - **Use as Shipping Address:** Yes
3. Click **Save and Close**

#### Source 2: warehouse_east

- **Name:** Eastern RDC - Charlotte
- **Code:** warehouse_east
- **Latitude:** 35.2271
- **Longitude:** -80.8431
- **State/Province:** North Carolina
- **City:** Charlotte
- **Postcode:** 28202
- **Phone:** 704-555-0200
- **Email:** warehouse.east@buildright.com

#### Source 3: warehouse_phoenix

- **Name:** Phoenix Metro Warehouse
- **Code:** warehouse_phoenix
- **Latitude:** 33.4484
- **Longitude:** -112.074
- **State/Province:** Arizona
- **City:** Phoenix
- **Postcode:** 85001
- **Phone:** 602-555-0300
- **Email:** warehouse.phoenix@buildright.com

#### Source 4: warehouse_denver

- **Name:** Denver Warehouse
- **Code:** warehouse_denver
- **Latitude:** 39.7392
- **Longitude:** -104.9903
- **State/Province:** Colorado
- **City:** Denver
- **Postcode:** 80202
- **Phone:** 303-555-0400
- **Email:** warehouse.denver@buildright.com

#### Source 5: warehouse_atlanta

- **Name:** Atlanta Metro Warehouse
- **Code:** warehouse_atlanta
- **Latitude:** 33.749
- **Longitude:** -84.388
- **State/Province:** Georgia
- **City:** Atlanta
- **Postcode:** 30303
- **Phone:** 404-555-0500
- **Email:** warehouse.atlanta@buildright.com

#### Source 6: dropship_premium_windows

- **Name:** Drop Shipper - Premium Window Systems
- **Code:** dropship_premium_windows
- **Enabled:** Yes
- **Country:** United States
- **State/Province:** California (virtual)
- **City:** Virtual
- **Postcode:** 00000
- **Phone:** 800-555-0199
- **Email:** dropship@premiumwindows.com

✅ **Validation:** All 6 sources appear in Admin → Stores → Inventory → Sources grid

**Time:** 30-45 minutes

### 7.4 Step 3: Create Stock and Link Sources

**Navigation:** Admin → Stores → Inventory → Stocks

1. Click **Add New Stock**
2. Fill in:
   - **Name:** BuildRight-Main-Stock
   - **Assign Sales Channels:** Main Website (or Default)
3. Click **Assign Sources** tab
4. Click **Assign Sources** button
5. Select all 6 sources with priorities:
   - warehouse_west → Priority: 1
   - warehouse_east → Priority: 2
   - warehouse_phoenix → Priority: 3
   - warehouse_denver → Priority: 4
   - warehouse_atlanta → Priority: 5
   - dropship_premium_windows → Priority: 6
6. Click **Done**
7. Click **Save & Continue**

✅ **Validation:** BuildRight-Main-Stock shows 6 assigned sources in grid

**Time:** 10-15 minutes

### 7.5 Step 4: Assign Products to Sources

**Navigation:** Admin → Catalog → Products

This is the most time-consuming step. You must assign each of the **184 products** to the **6 sources** with quantities.

**For Each Product:**

1. Click **Edit** on product
2. Navigate to **Sources** tab
3. Check **Assign Sources**
4. Select all 6 sources
5. Enter quantities based on source type:
   - **RDCs** (warehouse_west, warehouse_east): 500-750 units each
   - **Regional Warehouses** (phoenix, denver, atlanta): 200-400 units each
   - **Drop Shipper** (dropship_premium_windows): 20-50 units
6. Set **Source Item Status:** In Stock (for all)
7. Click **Save**

**Recommended Quantities by Product Type:**

| Product Type | RDC Qty | Warehouse Qty | Drop Ship Qty |
|--------------|---------|---------------|---------------|
| High-volume lumber | 750 | 400 | 50 |
| Standard materials | 500 | 250 | 30 |
| Specialty items | 300 | 150 | 20 |
| Service products | 1000 | 500 | 0 |

**Time-Saving Tips:**
- Focus on first 20 products to validate process
- Can batch-select multiple products → Actions → Update Attributes (limited functionality)
- Consider using REST API script for bulk assignment (see MSI guide)

✅ **Validation (sample check):**
- Edit product LBR-D0414F1E
- Sources tab shows all 6 sources
- Quantities assigned
- Status: In Stock

**Time:** 1.5-2.5 hours (25-50 seconds per product)

> **TIP:** This is tedious but important. Take breaks! You can split this across multiple sessions.

### 7.6 Step 5: Configure Source Selection Algorithm

**Navigation:** Admin → Stores → Configuration → Catalog → Inventory → Distance Priority Algorithm

1. **Set Provider:** Google MAP (or offline calculation)
2. **Set Computation Mode:** Driving
3. **Set Value:** Distance
4. Click **Save Config**

This ensures orders are fulfilled from the nearest warehouse based on customer location.

**Time:** 5 minutes

✅ **VALIDATION CHECKPOINT:**
- All 6 sources created and enabled
- BuildRight-Main-Stock has all 6 sources assigned with priorities
- Sample products show inventory at multiple sources
- Products display "In Stock" on frontend

---

## 8. Phase 4 - B2B Company Configuration

**Time Estimate:** 6-8 hours
**What You'll Do:** Create 3 companies, 6 locations, 12 users, and assign shared catalogs

### 8.1 Understanding B2B Structure

BuildRight's B2B structure demonstrates national distribution:

**3 Companies:**
1. **Premium Commercial Builders Inc.** → Commercial-Tier2 pricing
2. **Coastal Residential Builders** → Residential-Builder pricing
3. **Elite Trade Contractors** → Pro-Specialty pricing

**6 Locations (2 per company):**
- Western: Los Angeles HQ (CA), Phoenix Metro (AZ)
- Central: Dallas HQ (TX), Denver Division (CO)
- Eastern: Charlotte HQ (NC), Atlanta Division (GA)

**12 Users (4 per company, 2 per location):**
- Roles: Company Admin, Approver, Senior Buyer, Default User

### 8.2 Step 1: Enable B2B Features

**Navigation:** Admin → Stores → Configuration → General → B2B Features

1. **Set Store View:** Default Config
2. **Enable Core Features:**
   - Enable Company: **Yes**
   - Enable Shared Catalog: **Yes** (auto-enabled)
   - Enable B2B Quote: **Yes**
   - Enable Requisition List: **Yes**
   - Enable Quick Order: **Yes**
3. **Configure Payment Methods:**
   - Applicable Payment Methods: **All Enabled Payment Methods**
   - Enable Purchase Order payment: **Yes**
4. **Save Configuration**
5. **Clear Cache:** System → Cache Management → Flush Magento Cache

✅ **Validation:** Navigate to Customers → Companies menu appears

**Time:** 30 minutes

### 8.3 Step 2: Verify Shared Catalogs Exist

**Navigation:** Admin → Catalog → Shared Catalogs

Verify all 10 price books were created from ACO ingestion:

**Base Level:**
- US-Retail
- US-Contract

**Segment Level:**
- Retail-Consumer
- Contract-Commercial
- Contract-Residential
- Contract-Pro

**Tier Level:**
- Commercial-Tier1
- Commercial-Tier2 ⭐
- Residential-Builder ⭐
- Pro-Specialty ⭐

✅ **Validation:** All 10 catalogs appear in grid

**Time:** 5 minutes

### 8.4 Step 3: Create Company 1 - Premium Commercial Builders Inc.

**Navigation:** Admin → Customers → Companies → Add New Company

**Company Information:**
- Company Name: **Premium Commercial Builders Inc.**
- Company Legal Name: **Premium Commercial Builders Inc.**
- Company Email: **admin@premiumcommercial.example.com**
- Sales Representative: **Default Sales Rep**

**Company Admin:**
- Job Title: **Purchasing Manager**
- Email: **jsmith@premiumcommercial.example.com**
- First Name: **John**
- Last Name: **Smith**
- Gender: **Male** (optional)

**Legal Address:**
- Street Address: **1500 Commerce Drive**
- City: **Los Angeles**
- State/Province: **California**
- ZIP/Postal Code: **90001**
- Country: **United States**
- Telephone: **+1 (323) 555-0101**

**Advanced Settings:**
- Customer Group: **General**
- Shared Catalog: **Commercial-Tier2** ⭐
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**
- Payment Methods: **Purchase Order, Credit Card**

Click **Save Company**

✅ **Validation:** Company appears in Customers → Companies grid

**Time:** 20-30 minutes

### 8.5 Step 4: Create Teams for Company 1

**Navigation:** Customers → Companies → Select "Premium Commercial Builders Inc." → Company Structure

**Team 1 - Los Angeles Headquarters:**
1. Click **Add Team**
2. Team Name: **Los Angeles Headquarters**
3. Description: **Main office and purchasing center**
4. Parent: **Premium Commercial Builders Inc.** (root)
5. Click **Save**

**Team 2 - Phoenix Metro Division:**
1. Click **Add Team**
2. Team Name: **Phoenix Metro Division**
3. Description: **Arizona operations**
4. Parent: **Premium Commercial Builders Inc.** (root)
5. Click **Save**

✅ **Validation:** Company Structure shows 2 teams under root company

**Time:** 10 minutes

### 8.6 Step 5: Create Users for Company 1

**Navigation:** Customers → Companies → Select Company → Company Users → Add User

**User 1 - John Smith (LA HQ):**
- Email: **jsmith@premiumcommercial.example.com** (already exists as admin)
- First Name: **John**
- Last Name: **Smith**
- Job Title: **Purchasing Manager**
- Role: **Company Administrator**
- Team: **Los Angeles Headquarters**
- Status: **Active**

**User 2 - Emily Johnson (LA HQ):**
- Email: **ejohnson@premiumcommercial.example.com**
- First Name: **Emily**
- Last Name: **Johnson**
- Job Title: **Senior Purchasing Agent**
- Role: **Senior Buyer**
- Team: **Los Angeles Headquarters**
- Status: **Active**

**User 3 - Michael Chen (Phoenix):**
- Email: **mchen@premiumcommercial.example.com**
- First Name: **Michael**
- Last Name: **Chen**
- Job Title: **Project Manager**
- Role: **Default User**
- Team: **Phoenix Metro Division**
- Status: **Active**

**User 4 - Amanda Garcia (Phoenix):**
- Email: **agarcia@premiumcommercial.example.com**
- First Name: **Amanda**
- Last Name: **Garcia**
- Job Title: **Buyer**
- Role: **Senior Buyer**
- Team: **Phoenix Metro Division**
- Status: **Active**

✅ **Validation:** 4 users appear in Company Users list

**Time:** 30-40 minutes

### 8.7 Step 6: Create Company 2 - Coastal Residential Builders

Repeat Steps 8.4-8.6 with these details:

**Company Information:**
- Company Name: **Coastal Residential Builders**
- Legal Name: **Coastal Residential Builders Inc.**
- Company Email: **admin@coastalresidential.example.com**
- Legal Address: **5000 Builder Parkway, Dallas, TX 75201**
- Shared Catalog: **Residential-Builder** ⭐

**Teams:**
1. Dallas Headquarters (TX)
2. Denver Division (CO)

**Users:**
1. Maria Garcia (Company Admin, Dallas)
2. Robert Taylor (Senior Buyer, Dallas)
3. Sarah Martinez (Default User, Denver)
4. James Wilson (Senior Buyer, Denver)

**Time:** 60-70 minutes

### 8.8 Step 7: Create Company 3 - Elite Trade Contractors

Repeat Steps 8.4-8.6 with these details:

**Company Information:**
- Company Name: **Elite Trade Contractors**
- Legal Name: **Elite Trade Contractors Inc.**
- Company Email: **admin@elitetrade.example.com**
- Legal Address: **2500 Trade Center Blvd, Charlotte, NC 28202**
- Shared Catalog: **Pro-Specialty** ⭐

**Teams:**
1. Charlotte Headquarters (NC)
2. Atlanta Division (GA)

**Users:**
1. David Chen (Company Admin, Charlotte)
2. Lisa Anderson (Senior Buyer, Charlotte)
3. Kevin Brown (Default User, Atlanta)
4. Jennifer Davis (Senior Buyer, Atlanta)

**Time:** 60-70 minutes

### 8.9 Validate B2B Configuration

**Check Company Setup:**
- Admin → Customers → Companies
- Verify 3 companies exist
- Check each company's shared catalog assignment

**Check Users:**
- Log out of admin
- Try logging in as a company user (e.g., jsmith@premiumcommercial.example.com)
- Verify you see catalog products
- Verify pricing matches assigned tier (Commercial-Tier2)

**Check Teams:**
- While logged in as company admin
- Navigate to Company Structure
- Verify teams appear

✅ **VALIDATION CHECKPOINT:**
- 3 companies created
- 6 teams/locations configured
- 12 users created and active
- Each company assigned correct shared catalog
- Can log in as company user and see products

---

## 9. Phase 5 - Trigger-Based Policies

**Time Estimate:** 1-2 hours
**What You'll Do:** Configure policies in ACO Admin UI for dynamic catalog filtering

### 9.1 Understanding Trigger Policies

Trigger-based policies enable real-time catalog filtering via HTTP headers sent with GraphQL API requests.

**BuildRight Policies:**
1. **Project Type Policy** - Filter by new_construction, remodel, repair, restoration
2. **Product Category Policy** - Filter by structural_materials, framing_insulation, etc.
3. **Brand Policy** - Filter by buildright_pro, toughgrip, etc.

### 9.2 Step 1: Access ACO Policy Management

1. Log into ACO Admin Console at:
   ```
   https://experience.adobe.com/#/@demosystem/in:{TENANT_ID}/commerce-optimizer-studio
   ```
2. Navigate to **Catalog Management → Policies**
3. Click **Create New Policy**

### 9.3 Step 2: Create Project Type Policy

**Policy Basics:**
- **Policy ID:** `project-type-filter`
- **Policy Name:** Project Type Filter
- **Policy Type:** EXCLUSIVE (trigger-based)

**Trigger Configuration:**
- **Trigger Name:** `AC-Policy-Project-Type`
- **Transport:** HTTP_HEADER
- **Data Type:** string

**Conditions:**
- **Attribute:** `project_types`
- **Operator:** CONTAINS
- **Value Source:** TRIGGER (from HTTP header)

**Associate with Catalog View:**
1. Navigate to **Catalog Views**
2. Select your default catalog view
3. In **Policies** section, click **Add Policy**
4. Select `project-type-filter`
5. Set **Priority:** 1
6. Save

✅ **Validation:** Test with curl:
```bash
curl -X POST "https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/graphql" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "AC-Policy-Project-Type: new_construction" \
  -d '{"query": "{ products { items { sku name } } }"}'
```

### 9.4 Step 3: Create Product Category Policy

**Policy Basics:**
- **Policy ID:** `category-filter`
- **Policy Name:** Product Category Filter
- **Policy Type:** EXCLUSIVE

**Trigger Configuration:**
- **Trigger Name:** `AC-Policy-Product-Category`
- **Transport:** HTTP_HEADER

**Conditions:**
- **Attribute:** `product_category`
- **Operator:** EQUALS
- **Value Source:** TRIGGER

Associate with catalog view, Priority: 2

### 9.5 Step 4: Create Brand Policy

**Policy Basics:**
- **Policy ID:** `brand-filter`
- **Policy Name:** Brand Filter
- **Policy Type:** EXCLUSIVE

**Trigger Configuration:**
- **Trigger Name:** `AC-Policy-Brand`
- **Transport:** HTTP_HEADER

**Conditions:**
- **Attribute:** `brand`
- **Operator:** EQUALS
- **Value Source:** TRIGGER

Associate with catalog view, Priority: 3

### 9.6 Test Combined Policies

Test multiple headers together:

```bash
curl -X POST "https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/graphql" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "AC-Policy-Project-Type: new_construction" \
  -H "AC-Policy-Product-Category: structural_materials" \
  -H "AC-Policy-Brand: buildright_pro" \
  -d '{"query": "{ products { items { sku name } } }"}'
```

**Expected:** Only products matching ALL conditions (logical AND)

✅ **VALIDATION CHECKPOINT:**
- 3 policies created in ACO
- Policies associated with catalog view
- HTTP header filtering works via GraphQL
- Multiple policies combine with AND logic

---

## 10. Complete System Validation

**Time Estimate:** 1 hour
**What You'll Do:** End-to-end testing of complete demo environment

### 10.1 Validation Checklist

**ACO Data:**
- ✅ 184 products exist (70 simple + 92 variants + 15 bundles + 10 services)
- ✅ 34 attributes defined
- ✅ 19 categories in hierarchy
- ✅ 10 price books with hierarchical relationships
- ✅ 1,770 price entries
- ✅ Products have project_types attribute assigned

**Inventory (MSI):**
- ✅ 6 inventory sources created
- ✅ 1 stock (BuildRight-Main-Stock) with all sources
- ✅ Products assigned to sources with quantities
- ✅ Products show "In Stock" status

**B2B:**
- ✅ 3 companies created
- ✅ 6 teams/locations configured
- ✅ 12 users created
- ✅ Shared catalogs assigned correctly
- ✅ Can log in as company user

**Policies:**
- ✅ 3 trigger policies created
- ✅ Policies associated with catalog view
- ✅ HTTP headers filter products correctly

### 10.2 Functional Test Scenarios

**Test 1: Hierarchical Pricing**

1. Query product LBR-D0414F1E in ACO
2. Verify pricing across price books:
   - US-Contract: $8.50
   - Commercial-Tier2: $8.08
3. Log in as John Smith (Premium Commercial)
4. View product on storefront
5. Verify price shows $8.08 (Tier2 pricing)

**Test 2: Project Type Filtering**

1. Send GraphQL query with header:
   ```
   AC-Policy-Project-Type: new_construction
   ```
2. Verify only products tagged with new_construction appear
3. Change header to `remodel`
4. Verify different product set appears

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
4. Verify sourcing information shows nearest warehouse

✅ **VALIDATION CHECKPOINT:** All test scenarios pass successfully

---

# PART 3: DEMONSTRATION

## 11. Demo Scenarios

**What You'll Learn:** How to deliver effective demonstrations of BuildRight ACO capabilities

### 11.1 Demo Scenario 1: Hierarchical Pricing (5 minutes)

**Objective:** Show how ACO delivers automatic tier-based pricing

**Setup:**
- Login to storefront as different company users
- Have product page open (e.g., 2x4x8 SPF Stud)

**Demo Steps:**

1. **Show Base Pricing:**
   - Log in as Retail customer (if configured)
   - Navigate to product: LBR-D0414F1E (2x4x8 Stud)
   - Point out price: $8.50

2. **Show Tier2 Pricing:**
   - Log in as John Smith (Premium Commercial Builders)
   - Navigate to same product
   - Point out price: $8.08 (5% better)

3. **Show Volume Discounts:**
   - Show quantity tier pricing:
     - 1-99 units: $8.08
     - 100-293 units: $7.84
     - 294+ units: $7.50

**Talking Points:**
- "Premium Commercial is a high-volume customer assigned to Tier2 pricing"
- "Pricing is automatic - no manual quotes or negotiations"
- "On a 10,000-stud order, they save $10,000 vs base pricing"
- "BuildRight rewards loyalty with transparent, automated discounting"

**Time:** 5 minutes

### 11.2 Demo Scenario 2: Project-Based Filtering (5 minutes)

**Objective:** Demonstrate dynamic catalog personalization

**Setup:**
- Have Postman or curl ready
- GraphQL endpoint configured with authorization

**Demo Steps:**

1. **Show Full Catalog:**
   ```bash
   # Query without filters
   curl ... -d '{"query": "{ products { totalCount } }"}'
   # Result: 184 products
   ```

2. **Apply New Construction Filter:**
   ```bash
   # Add project type header
   curl -H "AC-Policy-Project-Type: new_construction" ...
   # Result: ~45 products
   ```
   - Show product list contains structural materials
   - Point out framing lumber, concrete, fasteners

3. **Switch to Remodel Filter:**
   ```bash
   curl -H "AC-Policy-Project-Type: remodel" ...
   # Result: ~55 products
   ```
   - Show product list now emphasizes finishing materials
   - Point out windows, doors, drywall

**Talking Points:**
- "Contractors manage multiple projects simultaneously"
- "Each project type needs different materials"
- "Filtering reduces search time by 70%"
- "No static catalog views created - all dynamic via HTTP headers"

**Time:** 5 minutes

### 11.3 Demo Scenario 3: National Distribution (5 minutes)

**Objective:** Show multi-location B2B with regional inventory

**Setup:**
- Have company structure visible in admin
- Inventory sources configured

**Demo Steps:**

1. **Show Company Structure:**
   - Admin → Customers → Companies → Premium Commercial Builders
   - Point out 2 locations:
     - Los Angeles HQ (CA)
     - Phoenix Metro (AZ)

2. **Show Regional Inventory:**
   - Navigate to product page
   - Show inventory sources:
     - Sacramento RDC (warehouse_west): 750 units
     - Phoenix Warehouse (warehouse_phoenix): 400 units

3. **Show User Distribution:**
   - Show Company Users:
     - 2 users in LA office
     - 2 users in Phoenix office
   - All users receive same Tier2 pricing (company-level)

**Talking Points:**
- "BuildRight operates nationally across 6 states in 3 regions"
- "Each company has multiple locations reflecting real distribution"
- "Inventory sourcing optimizes fulfillment from nearest warehouse"
- "Company-level pricing ensures consistency across all locations"

**Time:** 5 minutes

### 11.4 Demo Scenario 4: Bundle Products (3 minutes)

**Objective:** Show simplified ordering with pre-configured bundles

**Setup:**
- Navigate to bundle product (BUNDLE-FRAME-2X4-STD)

**Demo Steps:**

1. **Show Bundle Structure:**
   - Product page for "Standard 2x4 Framing Package"
   - Components listed:
     - 100 studs
     - 50 plates
     - 25 OSB sheets
     - 5 boxes nails
     - 10 tubes adhesive

2. **Show Bundle Pricing:**
   - Bundle price: $1,450
   - Individual items total: $1,520
   - Savings: $70 (5%)

3. **Explain Time Savings:**
   - Traditional: Search 5 products, add each to cart (8-10 min)
   - Bundle: Select bundle, adjust quantities (2 min)
   - Time saved: 75%

**Talking Points:**
- "Contractors order the same combinations repeatedly"
- "Bundles reduce 50-item orders to 3-4 selections"
- "Pre-configured by BuildRight based on common project needs"
- "Customer can still modify quantities or substitute items"

**Time:** 3 minutes

---

## 12. Key Talking Points

### 12.1 Business Value Messaging

**For BuildRight (The Customer):**
- Single product catalog serves all customer segments
- Automatic tier-based pricing rewards high-volume customers
- Real-time catalog composition without managing hundreds of static views
- Reduced data management overhead through intelligent attribute assignment

**For Contractors (End Users):**
- 60-70% reduction in product search time
- Automatic volume discounts without negotiation
- See only products available in their region
- Pre-configured bundles streamline ordering

**For Adobe (Why ACO):**
- Demonstrates composable catalog architecture
- Showcases trigger-based personalization
- Validates B2B hierarchical pricing capabilities
- Proves enterprise-scale metadata management

### 12.2 Technical Differentiators

**Hierarchical Pricing:**
- 3-level price book structure (base → segment → tier)
- Parent-child inheritance reduces data duplication
- 1,770 price entries managed efficiently
- Volume tier pricing automatic

**Dynamic Filtering:**
- HTTP header-based triggers (no pre-built views)
- Multiple policies combine with logical AND
- Project types as multiselect attribute
- Intelligent category-aware assignment

**B2B Architecture:**
- National distribution model (6 states, 3 regions)
- Company-specific catalog assignment
- Multi-location teams within companies
- Role-based user permissions

### 12.3 Overcoming Objections

**Objection:** "This seems complex to set up"
**Response:** "The BuildRight demo took 12-16 hours total setup. Once configured, ongoing management is minimal. Adding new products, price changes, and catalog updates happen through API automation."

**Objection:** "What about inventory? I see that's manual"
**Response:** "Correct - ACO focuses on catalog and pricing, which is its core strength. Inventory is managed through Adobe Commerce's battle-tested MSI system. The integration between the two is seamless."

**Objection:** "Can this scale to our 50,000+ SKU catalog?"
**Response:** "Absolutely. BuildRight is intentionally sized for demos at 184 SKUs, but ACO is proven at enterprise scale with 100,000+ SKU catalogs. The deterministic generation scripts can be scaled to generate any catalog size you need."

---

# PART 4: REFERENCE

## 13. Troubleshooting

### 13.1 Common Setup Issues

**Issue:** OAuth authentication fails during data ingestion

**Symptoms:**
```
Error: Invalid credentials
Status: 401 Unauthorized
```

**Solutions:**
1. Verify CLIENT_ID and CLIENT_SECRET in `.env`
2. Check credentials in Adobe Developer Console
3. Ensure ACO API is added to your project
4. Verify TENANT_ID is correct
5. Try regenerating OAuth credentials

---

**Issue:** Products not appearing in ACO after ingestion

**Symptoms:** Validation script shows 0 products

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

**Issue:** Shared Catalogs not appearing in Adobe Commerce

**Symptoms:** Customers → Shared Catalogs menu missing

**Solutions:**
1. Verify B2B extension installed
2. Check Stores → Configuration → B2B Features → Enabled
3. Clear cache: System → Cache Management → Flush Magento Cache
4. Reindex: System → Index Management → Reindex All
5. Check price books ingested to ACO successfully

---

**Issue:** Trigger policies not filtering products

**Symptoms:** All products appear regardless of HTTP headers

**Solutions:**
1. Verify policy created in ACO Admin UI
2. Check policy associated with catalog view
3. Verify trigger name matches HTTP header exactly (case-sensitive)
4. Check attribute exists and products have values assigned
5. Test with curl to isolate frontend vs backend issue
6. Review operator (use CONTAINS for multiselect, EQUALS for select)

---

**Issue:** Company users can't see products

**Symptoms:** User logs in but catalog is empty

**Solutions:**
1. Verify company assigned to shared catalog
2. Check shared catalog has products assigned
3. Navigate to Admin → Catalog → Shared Catalogs → [Catalog] → Set Pricing and Structure
4. Verify products selected (use "Select All" or by category)
5. Clear cache and reindex
6. Check user's company membership is active

---

### 13.2 Performance Issues

**Issue:** Data ingestion taking extremely long

**Solutions:**
1. Reduce batch size (try 50 instead of 100)
2. Check network connection stability
3. Verify ACO instance health in Cloud Manager
4. Run during off-peak hours
5. Consider splitting large datasets across multiple sessions

---

**Issue:** GraphQL queries timeout

**Solutions:**
1. Reduce pageSize in queries
2. Add specific field selections (don't query all fields)
3. Check ACO instance status
4. Verify network latency to ACO endpoint
5. Use pagination for large result sets

---

## 14. Technical Reference

### 14.1 File Structure

```
buildright-aco/
├── data/buildright/          # Generated data files
│   ├── metadata.json         # 34 attributes
│   ├── categories.json       # 19 categories
│   ├── products.json         # 70 simple products
│   ├── variants.json         # 92 variants
│   ├── bundles.json          # 15 bundles
│   ├── price-books.json      # 10 price books
│   ├── prices.json           # 1,770 prices
│   ├── inventory.json        # 4,446 inventory records
│   └── sources.json          # 6 inventory sources
│
├── scripts/                  # Generation scripts
│   ├── generate-metadata.js
│   ├── generate-categories.js
│   ├── generate-products.js
│   ├── generate-variants.js
│   ├── generate-bundles.js
│   ├── generate-price-books.js
│   ├── generate-prices-hierarchical.js
│   └── generate-inventory.js
│
├── utils/                    # Utility libraries
│   ├── aco-client.js         # ACO SDK wrapper
│   ├── graphql-query.js      # GraphQL utilities
│   ├── oauth-token-manager.js # Token management
│   └── ... (19 utilities total)
│
├── tests/                    # Test suites
│   ├── unit/
│   └── integration/
│
├── .env                      # Environment configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project overview
```

### 14.2 npm Scripts Quick Reference

**Data Generation:**
```bash
npm run generate:all              # Generate everything
npm run generate:metadata          # Attributes only
npm run generate:categories        # Categories only
npm run generate:products          # Simple products only
npm run generate:variants          # Configurable products
npm run generate:bundles           # Bundles only
npm run generate:price-books       # Price books only
npm run generate:prices            # Prices only
npm run generate:inventory         # Inventory only
```

**Data Ingestion:**
```bash
npm run ingest:all                 # Ingest everything (not recommended)
node scripts/ingest-metadata.js    # Metadata
node scripts/ingest-categories.js  # Categories
node scripts/ingest-products.js    # Products
node scripts/ingest-variants.js    # Variants
node scripts/ingest-bundles.js     # Bundles
node scripts/ingest-price-books.js # Price books
node scripts/ingest-prices.js      # Prices
```

**Testing:**
```bash
npm test                           # Run all tests
npm run test:coverage              # With coverage report
```

### 14.3 Key Constants

**Inventory Sources (6):**
- warehouse_west (Sacramento, CA) - Priority 1
- warehouse_east (Charlotte, NC) - Priority 2
- warehouse_phoenix (Phoenix, AZ) - Priority 3
- warehouse_denver (Denver, CO) - Priority 4
- warehouse_atlanta (Atlanta, GA) - Priority 5
- dropship_premium_windows - Priority 6

**Price Books (10):**
- Level 1: US-Retail, US-Contract
- Level 2: Retail-Consumer, Contract-Commercial, Contract-Residential, Contract-Pro
- Level 3: Commercial-Tier1, Commercial-Tier2, Residential-Builder, Pro-Specialty

**Product Counts:**
- Simple: 70
- Service: 10 (included in simple)
- Configurable Parents: 20
- Variants: 92
- Bundles: 15
- **Total:** 184 products

---

## 15. Appendices

### Appendix A: Data Statistics

| Metric | Value | Notes |
|--------|-------|-------|
| Total Products | 184 | 70 simple + 92 variants + 15 bundles + 10 services |
| Attributes | 34 | Metadata definitions |
| Categories | 19 | 2-level hierarchy (5 parents, 14 children) |
| Price Books | 10 | 3-level hierarchy |
| Price Entries | 1,770 | Across all books and products |
| Inventory Sources | 6 | Multi-region distribution |
| Inventory Records | 4,446 | 184 products × avg 6 sources |
| B2B Companies | 3 | Across 3 divisions |
| B2B Locations | 6 | 2 per company |
| B2B Users | 12 | 4 per company |

### Appendix B: Pricing Example - 2x4x8 SPF Stud

| Price Book | Level | Unit Price | Volume (100+) | Bundle (294+) |
|------------|-------|------------|---------------|---------------|
| US-Contract | 1 | $8.50 | $8.25 | $7.84 |
| Contract-Commercial | 2 | $8.50 | $8.25 | $7.84 |
| Commercial-Tier1 | 3 | $8.25 | $8.00 | $7.64 |
| Commercial-Tier2 | 3 | $8.08 | $7.84 | $7.50 |
| Residential-Builder | 3 | $8.50 | $8.25 | $7.84 |

**Savings (10,000 studs @ Tier2 bundle pricing):**
- Base: $8.50 × 10,000 = $85,000
- Tier2: $7.50 × 10,000 = $75,000
- **Total Savings: $10,000 (12%)**

### Appendix C: Project Types Distribution

| Project Type | Description | Product Count (approx) |
|--------------|-------------|------------------------|
| new_construction | Ground-up building | ~45 products |
| remodel | Renovation work | ~55 products |
| repair | Maintenance/repair | ~32 products |
| restoration | Historic restoration | ~28 products |

**Note:** Products can have multiple project types (multiselect attribute)

### Appendix D: HTTP Headers Reference

**Project Type Filtering:**
```bash
-H "AC-Policy-Project-Type: new_construction"
-H "AC-Policy-Project-Type: remodel"
-H "AC-Policy-Project-Type: repair"
-H "AC-Policy-Project-Type: restoration"
```

**Product Category Filtering:**
```bash
-H "AC-Policy-Product-Category: structural_materials"
-H "AC-Policy-Product-Category: framing_insulation"
-H "AC-Policy-Product-Category: windows_doors"
-H "AC-Policy-Product-Category: fasteners_hardware"
-H "AC-Policy-Product-Category: safety_equipment"
```

**Brand Filtering:**
```bash
-H "AC-Policy-Brand: buildright_pro"
-H "AC-Policy-Brand: toughgrip"
-H "AC-Policy-Brand: safeguard"
# ... (10 brands total)
```

**Combined Example:**
```bash
curl -X POST "{ENDPOINT}/graphql" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "AC-Policy-Project-Type: new_construction" \
  -H "AC-Policy-Product-Category: structural_materials" \
  -H "AC-Policy-Brand: buildright_pro" \
  -d '{"query": "{ products { items { sku name } } }"}'
```

---

## Final Notes

**Document Version:** 2.0
**Target Audience:** Sales Engineers, Implementation Specialists
**Total Setup Time:** 12-16 hours
**Status:** Production Ready

**Related Documentation:**
- [B2B Architecture Diagram](./docs/architecture/buildright-b2b-structure.md)
- [MSI Configuration Details](./docs/manual-setup/msi-configuration-guide.md)
- [Trigger Policy Deep Dive](./docs/manual-setup/trigger-policy-guide.md)
- [Project README](./README.md)

**Support:**
For questions or issues during setup, refer to Section 13 (Troubleshooting) or review the related documentation links above.

---

**End of BuildRight ACO Setup & Demonstration Guide**
