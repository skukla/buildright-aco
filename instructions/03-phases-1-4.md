<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# BuildRight Solutions: Complete Step-by-Step Implementation Guide

## Adobe Commerce Optimizer + PaaS Backend Integration


***

## Table of Contents

1. [Prerequisites \& Environment Setup](#prerequisites)
2. [Phase 1: Reset Existing ACO Instance](#phase-1-reset)
3. [Phase 2: Configure Adobe Commerce PaaS Backend](#phase-2-paas)
4. [Phase 3: Create Metadata in ACO](#phase-3-metadata)
5. [Phase 4: Create Categories in ACO](#phase-4-categories)
6. [Phase 5: Create Products in ACO](#phase-5-products)
7. [Phase 6: Create Price Books in ACO](#phase-6-price-books)
8. [Phase 7: Create Prices in ACO](#phase-7-prices)
9. [Phase 8: Configure Multi-Source Inventory (MSI) in Adobe Commerce](#phase-8-msi)
10. [Phase 9: Configure Customer Groups in Adobe Commerce](#phase-9-customer-groups)
11. [Phase 10: Create Policies in ACO](#phase-10-policies)
12. [Phase 11: Create Catalog Views in ACO](#phase-11-catalog-views)
13. [Phase 12: Testing \& Validation](#phase-12-testing)

***

<a name="prerequisites"></a>

## Prerequisites \& Environment Setup

### Required Access \& Credentials

**Adobe Commerce Optimizer (ACO):**

- ACO instance URL (e.g., `https://catalog.commerce.adobe.com`)
- Admin user credentials
- IMS Organization ID
- Tenant ID
- Environment: Sandbox or Production

**Adobe Commerce PaaS Backend:**

- Admin Panel URL (e.g., `https://your-store.commerce.adobe.com/admin`)
- Admin credentials with full permissions
- API credentials (Integration token)
- Cloud Project ID

**Development Tools:**

- Node.js 20.14.0 or higher
- Git
- Text editor (VS Code recommended)
- REST API client (Postman or Insomnia)
- Terminal/Command Line access


### Step 1: Clone Sample Repository

```bash
# Create project directory
mkdir buildright-aco-demo
cd buildright-aco-demo

# Clone Adobe Commerce Optimizer sample repository
git clone https://github.com/adobe-commerce/aco-sample-catalog-data-ingestion
cd aco-sample-catalog-data-ingestion
```


### Step 2: Install Dependencies

```bash
npm install
```


### Step 3: Configure Environment Variables

```bash
# Copy environment template
cp .env.dist .env
```

**Edit `.env` file with your credentials:**

```bash
# Adobe IMS Credentials
CLIENT_ID=your-client-id-here
CLIENT_SECRET=your-client-secret-here

# ACO Configuration
TENANT_ID=your-tenant-id-here
REGION=na1
ENVIRONMENT=sandbox

# Adobe Commerce PaaS
COMMERCE_BASE_URL=https://your-store.commerce.adobe.com
COMMERCE_ADMIN_TOKEN=your-admin-integration-token
```


### Step 4: Obtain Adobe IMS Credentials

1. Navigate to [Adobe Developer Console](https://developer.adobe.com/console)
2. Click **Create new project**
3. Click **Add API**
4. Select **Adobe Commerce Optimizer**
5. Choose **OAuth Server-to-Server** authentication
6. Click **Next** and **Save configured API**
7. Copy **Client ID** and **Client Secret** to `.env` file
8. Navigate to project overview, copy **Organization ID** (this is your Tenant ID)

### Step 5: Obtain Commerce Integration Token

**In Adobe Commerce Admin Panel:**

1. Navigate to **System > Extensions > Integrations**
2. Click **Add New Integration**
3. **Integration Info tab:**
    - Name: `ACO Data Ingestion Integration`
    - Email: your-email@company.com
    - Your Password: (enter admin password)
    - Callback URL: (leave blank)
    - Identity Link URL: (leave blank)
4. **API tab:**
    - Resource Access: **All**
5. Click **Save**
6. Click **Activate**
7. Click **Allow** on permission dialog
8. Copy **Access Token** to `.env` file as `COMMERCE_ADMIN_TOKEN`

***

```
<a name="phase-1-reset"></a>
```


## Phase 1: Reset Existing ACO Instance

### Overview

This phase removes all existing data from your ACO instance to prepare for the BuildRight Solutions demonstration.

### Step 1.1: Access ACO Admin Panel

1. Open browser and navigate to ACO Admin Panel
    - URL: `https://catalog.commerce.adobe.com`
2. Click **Sign in with Adobe ID**
3. Enter your Adobe credentials
4. Select your organization if prompted
5. Verify you see the ACO dashboard

### Step 1.2: Check Current Data Sync Status

1. In left navigation, click **Data Sync**
2. Review current sync status for:
    - Products
    - Categories
    - Metadata
    - Price Books
    - Prices
3. Note any pending syncs (wait for completion before proceeding)
4. Take screenshot for reference

### Step 1.3: Delete Existing Policies

**Important:** Delete policies before catalog views to avoid dependency errors.

1. In left navigation, click **Catalog > Policies**
2. For each existing policy:
    - Click the **three-dot menu** (⋮) on the right
    - Click **Delete**
    - Click **Confirm** in the dialog
3. Wait for "Policy deleted successfully" confirmation
4. Repeat until all policies are removed
5. Verify empty state message: "No policies found"

### Step 1.4: Delete Existing Catalog Views

1. In left navigation, click **Catalog > Views**
2. For each existing catalog view (except "Default"):
    - Click the **three-dot menu** (⋮) on the right
    - Click **Delete**
    - Click **Confirm** in the dialog
3. Wait for "Catalog view deleted successfully" confirmation
4. Repeat until only "Default" view remains
5. **Note:** Cannot delete "Default" catalog view

### Step 1.5: Prepare Data Deletion Script

**In your terminal (from project directory):**

```bash
# Navigate to scripts directory
cd aco-sample-catalog-data-ingestion

# Create new file for BuildRight reset script
touch reset-buildright.js
```

**Edit `reset-buildright.js` with the following content:**

```javascript
require('dotenv').config();
const { createClient } = require('@adobe-commerce/aco-ts-sdk');

const config = {
  credentials: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  },
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox',
  timeoutMs: 30000
};

async function resetACO() {
  console.log('Initializing ACO client...');
  const client = createClient(config);

  try {
    // Step 1: Delete all prices
    console.log('\n=== Step 1: Deleting all prices ===');
    const pricesResponse = await client.deletePrices([
      // Add your price deletion payloads here
      // Will be populated in Phase 7
    ]);
    console.log(`Prices deletion accepted: ${pricesResponse.acceptedCount}`);

    // Step 2: Delete all price books
    console.log('\n=== Step 2: Deleting all price books ===');
    const priceBookResponse = await client.deletePriceBooks([
      { priceBookId: 'us-base-contract' },
      { priceBookId: 'us-base-retail' },
      { priceBookId: 'west-region-contract' },
      { priceBookId: 'east-region-contract' },
      { priceBookId: 'west-region-retail' },
      { priceBookId: 'east-region-retail' },
      { priceBookId: 'west-commercial-contract' },
      { priceBookId: 'west-residential-contract' },
      { priceBookId: 'east-commercial-contract' },
      { priceBookId: 'east-residential-contract' },
      { priceBookId: 'west-commercial-gc-tier1' },
      { priceBookId: 'east-commercial-gc-tier1' }
    ]);
    console.log(`Price books deletion accepted: ${priceBookResponse.acceptedCount}`);

    // Step 3: Delete all products
    console.log('\n=== Step 3: Deleting all products ===');
    // Will be populated with actual SKUs in Phase 5

    // Step 4: Delete all categories
    console.log('\n=== Step 4: Deleting all categories ===');
    const categoriesResponse = await client.deleteCategories([
      { slug: 'structural-materials', source: { locale: 'en-US' } },
      { slug: 'framing-drywall', source: { locale: 'en-US' } },
      { slug: 'roofing-materials', source: { locale: 'en-US' } },
      { slug: 'windows-doors', source: { locale: 'en-US' } },
      { slug: 'fasteners-hardware', source: { locale: 'en-US' } }
    ]);
    console.log(`Categories deletion accepted: ${categoriesResponse.acceptedCount}`);

    // Step 5: Delete all metadata
    console.log('\n=== Step 5: Deleting all metadata ===');
    const metadataResponse = await client.deleteProductMetadata([
      { code: 'product_category', source: { locale: 'en-US' } },
      { code: 'csi_masterformat_number', source: { locale: 'en-US' } },
      { code: 'brand', source: { locale: 'en-US' } },
      { code: 'unit_of_measure', source: { locale: 'en-US' } },
      { code: 'weight_lbs', source: { locale: 'en-US' } },
      { code: 'length_inches', source: { locale: 'en-US' } },
      { code: 'coverage_per_unit', source: { locale: 'en-US' } },
      { code: 'material_type', source: { locale: 'en-US' } },
      { code: 'fire_rating', source: { locale: 'en-US' } },
      { code: 'leed_eligible', source: { locale: 'en-US' } },
      { code: 'commercial_residential', source: { locale: 'en-US' } },
      { code: 'minimum_order_quantity', source: { locale: 'en-US' } },
      { code: 'units_per_package', source: { locale: 'en-US' } },
      { code: 'special_order_item', source: { locale: 'en-US' } },
      { code: 'project_phase', source: { locale: 'en-US' } }
    ]);
    console.log(`Metadata deletion accepted: ${metadataResponse.acceptedCount}`);

    console.log('\n=== ACO Reset Complete ===');
    console.log('All data has been removed from ACO instance.');

  } catch (error) {
    console.error('Error during reset:', error);
    throw error;
  }
}

resetACO();
```


### Step 1.6: Execute Data Deletion

**Note:** We'll execute this script after we have all product SKUs. For now, proceed to manual verification.

### Step 1.7: Verify Clean State in ACO UI

1. Navigate to **Catalog > Views**
2. Click **Default** catalog view
3. Click **Preview Catalog** button
4. Verify you see: "No products found"
5. Navigate to **Data Sync**
6. Verify all entities show 0 records:
    - Products: 0
    - Categories: 0
    - Metadata: 0
    - Price Books: 0
    - Prices: 0

**Screenshot checkpoint:** Take screenshot showing empty state

***

```
<a name="phase-2-paas"></a>
```


## Phase 2: Configure Adobe Commerce PaaS Backend

### Overview

Configure customer groups, tax classes, and store configuration in Adobe Commerce to support ACO integration.

### Step 2.1: Access Adobe Commerce Admin

1. Open browser and navigate to Commerce Admin
    - URL: `https://your-store.commerce.adobe.com/admin`
2. Enter admin credentials
3. If 2FA is enabled, complete authentication
4. Verify you see the Admin Dashboard

### Step 2.2: Create Customer Groups

**Important:** Customer groups in Adobe Commerce map to price books in ACO.

#### Create Customer Group 1: Commercial Contractors Tier 1

1. Navigate to **Customers > Customer Groups**
2. Click **Add New Customer Group** button (top right)
3. **Group Name:** `Commercial Contractors - Tier 1`
4. **Tax Class:** `Retail Customer`
5. Click **Save Customer Group**
6. **Note the Customer Group ID** (visible in URL after save, e.g., `group_id=4`)
7. Take screenshot

#### Create Customer Group 2: Commercial Contractors Tier 2

1. Click **Add New Customer Group**
2. **Group Name:** `Commercial Contractors - Tier 2`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID

#### Create Customer Group 3: Residential Builders

1. Click **Add New Customer Group**
2. **Group Name:** `Residential Builders`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID

#### Create Customer Group 4: Retail Customers

1. Click **Add New Customer Group**
2. **Group Name:** `Retail Customers`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID

**Record your Customer Group IDs:**


| Group Name | ID |
| :-- | :-- |
| Commercial Contractors - Tier 1 | ___ |
| Commercial Contractors - Tier 2 | ___ |
| Residential Builders | ___ |
| Retail Customers | ___ |

### Step 2.3: Configure Multi-Source Inventory (MSI)

#### Enable MSI

1. Navigate to **Stores > Configuration**
2. In left panel, expand **Catalog**
3. Click **Inventory**
4. Expand **Stock Options** section
5. Set **Decrease Stock When Order is Placed:** `Yes`
6. Set **Display Out of Stock Products:** `No`
7. Set **Only X left Threshold:** `10`
8. Click **Save Config** (top right)

#### Create Inventory Sources

**Source 1: Western RDC**

1. Navigate to **Stores > Inventory > Sources**
2. Click **Add New Source** (top right)
3. **General tab:**
    - **Name:** `Western RDC`
    - **Code:** `western_rdc` (lowercase, no spaces)
    - **Is Enabled:** `Yes`
    - **Description:** `Western Regional Distribution Center - Sacramento, CA`
4. **Address Data tab:**
    - **Country:** `United States`
    - **State/Province:** `California`
    - **City:** `Sacramento`
    - **Street:** `1000 Distribution Way`
    - **Postcode:** `95815`
    - **Phone:** `916-555-0100`
5. Click **Save and Continue Edit**
6. Take screenshot of source configuration

**Source 2: Eastern RDC**

1. Click **Add New Source**
2. **General tab:**
    - **Name:** `Eastern RDC`
    - **Code:** `eastern_rdc`
    - **Is Enabled:** `Yes`
    - **Description:** `Eastern Regional Distribution Center - Charlotte, NC`
3. **Address Data tab:**
    - **Country:** `United States`
    - **State/Province:** `North Carolina`
    - **City:** `Charlotte`
    - **Street:** `2000 Distribution Parkway`
    - **Postcode:** `28208`
    - **Phone:** `704-555-0200`
4. Click **Save and Continue Edit**

**Source 3: Phoenix Metro Warehouse**

1. Click **Add New Source**
2. **General tab:**
    - **Name:** `Phoenix Metro Warehouse`
    - **Code:** `phoenix_warehouse`
    - **Is Enabled:** `Yes`
    - **Description:** `Phoenix Metropolitan Area Warehouse`
3. **Address Data tab:**
    - **Country:** `United States`
    - **State/Province:** `Arizona`
    - **City:** `Phoenix`
    - **Street:** `3000 Industrial Blvd`
    - **Postcode:** `85034`
    - **Phone:** `602-555-0300`
4. Click **Save and Continue Edit**

**Source 4: Denver Warehouse**

1. Click **Add New Source**
2. **General tab:**
    - **Name:** `Denver Warehouse`
    - **Code:** `denver_warehouse`
    - **Is Enabled:** `Yes`
    - **Description:** `Denver Regional Warehouse`
3. **Address Data tab:**
    - **Country:** `United States`
    - **State/Province:** `Colorado`
    - **City:** `Denver`
    - **Street:** `4000 Commerce Street`
    - **Postcode:** `80239`
    - **Phone:** `303-555-0400`
4. Click **Save and Continue Edit**

**Source 5: Atlanta Metro Warehouse**

1. Click **Add New Source**
2. **General tab:**
    - **Name:** `Atlanta Metro Warehouse`
    - **Code:** `atlanta_warehouse`
    - **Is Enabled:** `Yes`
    - **Description:** `Atlanta Metropolitan Area Warehouse`
3. **Address Data tab:**
    - **Country:** `United States`
    - **State/Province:** `Georgia`
    - **City:** `Atlanta`
    - **Street:** `5000 Logistics Lane`
    - **Postcode:** `30318`
    - **Phone:** `404-555-0500`
4. Click **Save and Continue Edit**

**Source 6: Premium Window Systems (Drop Shipper)**

1. Click **Add New Source**
2. **General tab:**
    - **Name:** `Drop Shipper - Premium Window Systems`
    - **Code:** `dropship_windows`
    - **Is Enabled:** `Yes`
    - **Description:** `Virtual source for drop-shipped window products`
3. **Address Data tab:**
    - **Country:** `United States`
    - **State/Province:** `Ohio`
    - **City:** `Cleveland`
    - **Street:** `6000 Manufacturing Drive`
    - **Postcode:** `44113`
    - **Phone:** `216-555-0600`
4. Click **Save and Continue Edit**

#### Verify All Sources Created

1. Navigate to **Stores > Inventory > Sources**
2. Verify you see 7 total sources (including "Default Source")
3. Take screenshot showing all sources

### Step 2.4: Create Inventory Stocks

**Stock 1: Western Sales Channel**

1. Navigate to **Stores > Inventory > Stocks**
2. Click **Add New Stock** (top right)
3. **General tab:**
    - **Name:** `Western Sales Channel`
    - **Is Enabled:** `Yes`
4. **Sales Channels tab:**
    - Check box next to **Main Website** (or your western website)
5. **Sources tab:**
    - Click **Assign Sources**
    - Check boxes next to:
        - `Western RDC`
        - `Phoenix Metro Warehouse`
        - `Denver Warehouse`
    - Click **Done**
6. **Priority column:**
    - Set `Western RDC` priority: `1`
    - Set `Phoenix Metro Warehouse` priority: `2`
    - Set `Denver Warehouse` priority: `3`
7. Click **Save Stock**
8. Take screenshot

**Stock 2: Eastern Sales Channel**

1. Click **Add New Stock**
2. **General tab:**
    - **Name:** `Eastern Sales Channel`
    - **Is Enabled:** `Yes`
3. **Sales Channels tab:**
    - Check box next to **Main Website** (or your eastern website)
4. **Sources tab:**
    - Click **Assign Sources**
    - Check boxes next to:
        - `Eastern RDC`
        - `Atlanta Metro Warehouse`
    - Click **Done**
5. **Priority column:**
    - Set `Eastern RDC` priority: `1`
    - Set `Atlanta Metro Warehouse` priority: `2`
6. Click **Save Stock**

### Step 2.5: Configure Source Selection Algorithm

1. Navigate to **Stores > Configuration**
2. Expand **Catalog** in left panel
3. Click **Inventory**
4. Expand **Distance Priority Algorithm** section
5. **Google API Key:** (enter if available, or leave blank for demo)
6. **Computation mode:** `Driving`
7. **Value:** `Distance`
8. Click **Save Config**

### Step 2.6: Verify MSI Configuration

1. Navigate to **Stores > Inventory > Sources**
2. Verify 6 custom sources + 1 default = 7 total
3. Navigate to **Stores > Inventory > Stocks**
4. Verify 2 custom stocks + 1 default = 3 total
5. Take screenshot of stocks list

**Checkpoint:** MSI configuration complete

***

```
<a name="phase-3-metadata"></a>
```


## Phase 3: Create Metadata in ACO

### Overview

Create product attribute metadata that defines searchability, filterability, and sorting for all product attributes.

### Step 3.1: Create Metadata Definition Files

**In your project directory, create data folder:**

```bash
mkdir -p data/buildright
cd data/buildright
```

**Create file: `metadata.json`**

```json
[
  {
    "code": "sku",
    "source": { "locale": "en-US" },
    "label": "SKU",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": true,
    "sortable": false,
    "searchable": true,
    "searchWeight": 3,
    "searchTypes": ["AUTOCOMPLETE", "CONTAINS", "STARTS_WITH"]
  },
  {
    "code": "name",
    "source": { "locale": "en-US" },
    "label": "Product Name",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING", "SEARCH_RESULTS"],
    "filterable": false,
    "sortable": true,
    "searchable": true,
    "searchWeight": 2,
    "searchTypes": ["AUTOCOMPLETE", "CONTAINS"]
  },
  {
    "code": "description",
    "source": { "locale": "en-US" },
    "label": "Product Description",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": false,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "shortDescription",
    "source": { "locale": "en-US" },
    "label": "Short Description",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_LISTING"],
    "filterable": false,
    "sortable": false,
    "searchable": true,
    "searchWeight": 1,
    "searchTypes": ["CONTAINS"]
  },
  {
    "code": "price",
    "source": { "locale": "en-US" },
    "label": "Price",
    "dataType": "DECIMAL",
    "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING"],
    "filterable": true,
    "sortable": true,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "product_category",
    "source": { "locale": "en-US" },
    "label": "Product Category",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING", "SEARCH_RESULTS"],
    "filterable": true,
    "sortable": false,
    "searchable": true,
    "searchWeight": 2,
    "searchTypes": ["AUTOCOMPLETE"]
  },
  {
    "code": "csi_masterformat_number",
    "source": { "locale": "en-US" },
    "label": "CSI MasterFormat Number",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": false,
    "sortable": false,
    "searchable": true,
    "searchWeight": 3,
    "searchTypes": ["STARTS_WITH", "CONTAINS"]
  },
  {
    "code": "brand",
    "source": { "locale": "en-US" },
    "label": "Brand",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING", "SEARCH_RESULTS"],
    "filterable": true,
    "sortable": true,
    "searchable": true,
    "searchWeight": 2,
    "searchTypes": ["AUTOCOMPLETE", "CONTAINS"]
  },
  {
    "code": "unit_of_measure",
    "source": { "locale": "en-US" },
    "label": "Unit of Measure",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING"],
    "filterable": true,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "weight_lbs",
    "source": { "locale": "en-US" },
    "label": "Weight (lbs)",
    "dataType": "DECIMAL",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": false,
    "sortable": true,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "length_inches",
    "source": { "locale": "en-US" },
    "label": "Length (inches)",
    "dataType": "DECIMAL",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": false,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "coverage_per_unit",
    "source": { "locale": "en-US" },
    "label": "Coverage Per Unit",
    "dataType": "DECIMAL",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": false,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "material_type",
    "source": { "locale": "en-US" },
    "label": "Material Type",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING"],
    "filterable": true,
    "sortable": false,
    "searchable": true,
    "searchWeight": 1,
    "searchTypes": ["AUTOCOMPLETE"]
  },
  {
    "code": "fire_rating",
    "source": { "locale": "en-US" },
    "label": "Fire Rating",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": true,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "leed_eligible",
    "source": { "locale": "en-US" },
    "label": "LEED Eligible",
    "dataType": "BOOLEAN",
    "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING"],
    "filterable": true,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "commercial_residential",
    "source": { "locale": "en-US" },
    "label": "Commercial/Residential",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL", "PRODUCT_LISTING"],
    "filterable": true,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "minimum_order_quantity",
    "source": { "locale": "en-US" },
    "label": "Minimum Order Quantity",
    "dataType": "INTEGER",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": false,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "units_per_package",
    "source": { "locale": "en-US" },
    "label": "Units Per Package",
    "dataType": "INTEGER",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": false,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "special_order_item",
    "source": { "locale": "en-US" },
    "label": "Special Order Item",
    "dataType": "BOOLEAN",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": true,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  },
  {
    "code": "project_phase",
    "source": { "locale": "en-US" },
    "label": "Project Phase",
    "dataType": "TEXT",
    "visibleIn": ["PRODUCT_DETAIL"],
    "filterable": true,
    "sortable": false,
    "searchable": false,
    "searchWeight": 1,
    "searchTypes": []
  }
]
```


### Step 3.2: Create Metadata Ingestion Script

**Create file: `scripts/ingest-metadata.js`**

```javascript
require('dotenv').config();
const { createClient } = require('@adobe-commerce/aco-ts-sdk');
const fs = require('fs');
const path = require('path');

const config = {
  credentials: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  },
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox',
  timeoutMs: 30000
};

async function ingestMetadata() {
  console.log('=== BuildRight Solutions: Metadata Ingestion ===\n');
  
  const client = createClient(config);
  
  // Load metadata from file
  const metadataPath = path.join(__dirname, '../data/buildright/metadata.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  console.log(`Loaded ${metadata.length} metadata definitions`);
  
  try {
    console.log('\nCreating product attribute metadata...');
    const response = await client.createProductMetadata(metadata);
    
    console.log(`\n✓ Status: ${response.status}`);
    console.log(`✓ Accepted: ${response.acceptedCount} attributes`);
    
    if (response.status === 'ACCEPTED') {
      console.log('\n✓ Metadata ingestion successful!');
      console.log('\nNext steps:');
      console.log('1. Wait 2-3 minutes for indexing');
      console.log('2. Verify in ACO UI: Data Sync page');
      console.log('3. Proceed to Category creation');
    }
    
  } catch (error) {
    console.error('\n✗ Error during metadata ingestion:');
    console.error(error);
    throw error;
  }
}

ingestMetadata();
```


### Step 3.3: Execute Metadata Ingestion

```bash
# From project root directory
node scripts/ingest-metadata.js
```

**Expected output:**

```
=== BuildRight Solutions: Metadata Ingestion ===

Loaded 20 metadata definitions

Creating product attribute metadata...

✓ Status: ACCEPTED
✓ Accepted: 20 attributes

✓ Metadata ingestion successful!

Next steps:
1. Wait 2-3 minutes for indexing
2. Verify in ACO UI: Data Sync page
3. Proceed to Category creation
```


### Step 3.4: Verify Metadata in ACO UI

1. Navigate to ACO Admin Panel
2. Click **Data Sync** in left navigation
3. Wait 2-3 minutes for sync to complete
4. Verify **Product Attributes** shows: `20 records`
5. Click **View Details** next to Product Attributes
6. Verify you see all 20 attributes:
    - sku
    - name
    - description
    - shortDescription
    - price
    - product_category
    - csi_masterformat_number
    - brand
    - unit_of_measure
    - weight_lbs
    - length_inches
    - coverage_per_unit
    - material_type
    - fire_rating
    - leed_eligible
    - commercial_residential
    - minimum_order_quantity
    - units_per_package
    - special_order_item
    - project_phase
7. Take screenshot

**Checkpoint:** Metadata creation complete

***

```
<a name="phase-4-categories"></a>
```


## Phase 4: Create Categories in ACO

### Overview

Create hierarchical category structure with 5 major categories and subcategories.

### Step 4.1: Create Categories Definition File

**Create file: `data/buildright/categories.json`**

```json
[
  {
    "slug": "structural-materials",
    "source": { "locale": "en-US" },
    "name": "Structural Materials",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "structural-materials/lumber-engineered-wood",
    "source": { "locale": "en-US" },
    "name": "Lumber & Engineered Wood",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "structural-materials/concrete-cement",
    "source": { "locale": "en-US" },
    "name": "Concrete & Cement Products",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "framing-drywall",
    "source": { "locale": "en-US" },
    "name": "Framing & Drywall",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "framing-drywall/metal-framing",
    "source": { "locale": "en-US" },
    "name": "Metal Studs & Track",
    "families": ["commercial"]
  },
  {
    "slug": "framing-drywall/drywall-sheets",
    "source": { "locale": "en-US" },
    "name": "Drywall Sheets",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "framing-drywall/joint-compound-accessories",
    "source": { "locale": "en-US" },
    "name": "Joint Compound & Accessories",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "roofing-materials",
    "source": { "locale": "en-US" },
    "name": "Roofing Materials",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "roofing-materials/shingles",
    "source": { "locale": "en-US" },
    "name": "Asphalt Shingles",
    "families": ["residential"]
  },
  {
    "slug": "roofing-materials/underlayment-accessories",
    "source": { "locale": "en-US" },
    "name": "Underlayment & Accessories",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "roofing-materials/ventilation",
    "source": { "locale": "en-US" },
    "name": "Roof Ventilation",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "windows-doors",
    "source": { "locale": "en-US" },
    "name": "Windows & Doors",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "windows-doors/residential-windows",
    "source": { "locale": "en-US" },
    "name": "Residential Windows",
    "families": ["residential"]
  },
  {
    "slug": "windows-doors/entry-doors",
    "source": { "locale": "en-US" },
    "name": "Entry Doors",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "windows-doors/hardware",
    "source": { "locale": "en-US" },
    "name": "Door Hardware",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "fasteners-hardware",
    "source": { "locale": "en-US" },
    "name": "Fasteners & Hardware",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "fasteners-hardware/nails",
    "source": { "locale": "en-US" },
    "name": "Nails",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "fasteners-hardware/screws",
    "source": { "locale": "en-US" },
    "name": "Screws",
    "families": ["commercial", "residential"]
  },
  {
    "slug": "fasteners-hardware/adhesives",
    "source": { "locale": "en-US" },
    "name": "Construction Adhesives",
    "families": ["commercial", "residential"]
  }
]
```


### Step 4.2: Create Categories Ingestion Script

**Create file: `scripts/ingest-categories.js`**

```javascript
require('dotenv').config();
const { createClient } = require('@adobe-commerce/aco-ts-sdk');
const fs = require('fs');
const path = require('path');

const config = {
  credentials: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  },
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox',
  timeoutMs: 30000
};

async function ingestCategories() {
  console.log('=== BuildRight Solutions: Categories Ingestion ===\n');
  
  const client = createClient(config);
  
  // Load categories from file
  const categoriesPath = path.join(__dirname, '../data/buildright/categories.json');
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  
  console.log(`Loaded ${categories.length} category definitions`);
  
  try {
    console.log('\nCreating categories...');
    const response = await client.createCategories(categories);
    
    console.log(`\n✓ Status: ${response.status}`);
    console.log(`✓ Accepted: ${response.acceptedCount} categories`);
    
    if (response.status === 'ACCEPTED') {
      console.log('\n✓ Categories ingestion successful!');
      console.log('\nCategory Hierarchy Created:');
      console.log('1. Structural Materials');
      console.log('   ├─ Lumber & Engineered Wood');
      console.log('   └─ Concrete & Cement Products');
      console.log('2. Framing & Drywall');
      console.log('   ├─ Metal Studs & Track');
      console.log('   ├─ Drywall Sheets');
      console.log('   └─ Joint Compound & Accessories');
      console.log('3. Roofing Materials');
      console.log('   ├─ Asphalt Shingles');
      console.log('   ├─ Underlayment & Accessories');
      console.log('   └─ Roof Ventilation');
      console.log('4. Windows & Doors');
      console.log('   ├─ Residential Windows');
      console.log('   ├─ Entry Doors');
      console.log('   └─ Door Hardware');
      console.log('5. Fasteners & Hardware');
      console.log('   ├─ Nails');
      console.log('   ├─ Screws');
      console.log('   └─ Construction Adhesives');
      console.log('\nNext steps:');
      console.log('1. Wait 2-3 minutes for indexing');
      console.log('2. Verify in ACO UI: Data Sync page');
      console.log('3. Proceed to Product creation');
    }
    
  } catch (error) {
    console.error('\n✗ Error during categories ingestion:');
    console.error(error);
    throw error;
  }
}

ingestCategories();
```


### Step 4.3: Execute Categories Ingestion

```bash
node scripts/ingest-categories.js
```

**Expected output:**

```
=== BuildRight Solutions: Categories Ingestion ===

Loaded 19 category definitions

Creating categories...

✓ Status: ACCEPTED
✓ Accepted: 19 categories

✓ Categories ingestion successful!
...
```


### Step 4.4: Verify Categories in ACO UI

1. Navigate to ACO Admin Panel
2. Click **Data Sync** in left navigation
3. Wait 2-3 minutes for sync to complete
4. Verify **Categories** shows: `19 records`
5. Take screenshot

**Checkpoint:** Categories creation complete

***

Due to the extensive length required to complete all 12 phases with this level of detail, I'll provide the remaining phases in a structured summary format. Would you like me to:

1. **Continue with the same level of detail** for all remaining phases (this will be a very long response)
2. **Provide the complete product data files** and remaining scripts as downloadable/copyable files
3. **Focus on specific phases** you'd like detailed next (e.g., Products, Price Books, Policies)

Please let me know your preference, and I'll continue accordingly. The full guide will include all 180 product SKUs, complete pricing data, MSI inventory assignments, policy configurations, and testing procedures.

