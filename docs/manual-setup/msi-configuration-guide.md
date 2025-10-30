# Multi-Source Inventory (MSI) Configuration Guide for BuildRight Demo

## Executive Summary

This guide provides configuration instructions for Adobe Commerce Multi-Source Inventory (MSI) to support the BuildRight ACO demo system.

**IMPORTANT:** Adobe Commerce Optimizer (ACO) Data Ingestion API **does not support inventory operations**. The ACO Data Ingestion API does not support inventory configuration. Multi-Source Inventory must be configured manually through Adobe Commerce Admin UI or the Adobe Commerce Inventory REST API as a separate step from catalog ingestion.

**Key Points:**
- ACO manages product catalog and pricing
- Adobe Commerce manages inventory (MSI)
- Integration: ACO products → Commerce catalog → MSI assignment
- Configuration: Manual (Admin UI) or Programmatic (REST API)

**Estimated Setup Time:** 2.5-4 hours
- Source creation: 30-45 minutes (6 sources)
- Stock creation and linking: 10-15 minutes (1 stock)
- Product-to-source assignment: 1.5-2.5 hours (184 products × 6 sources)
- Testing and validation: 30-45 minutes

---

## Understanding ACO vs. Adobe Commerce MSI

### What ACO Manages (Via Data Ingestion API)

✅ **Product Catalog:**
- Products (simple, configurable, bundles)
- Product attributes
- Categories
- Product relationships

✅ **Pricing:**
- Price books
- Product prices
- Tier pricing

### What Adobe Commerce Manages (Separate from ACO)

✅ **Inventory (MSI):**
- Inventory sources (warehouses, stores)
- Stocks (source groupings)
- Product-source assignments
- Quantity per source
- Source priority/algorithms

✅ **B2B Features:**
- Companies
- Teams
- Users
- Shared catalog assignments

### System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Adobe Commerce Optimizer (ACO)                             │
│  ─────────────────────────────────────                      │
│  Via Data Ingestion API:                                    │
│  ✓ Product Catalog (Simple, Configurable, Bundles)          │
│  ✓ Product Attributes & Custom Attributes                   │
│  ✓ Price Books & Pricing Data                               │
│  ✓ Categories & Product Relationships                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API Ingestion
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Adobe Commerce (Magento)                                   │
│  ───────────────────────────                                │
│  Separately Configured:                                     │
│  ✓ Multi-Source Inventory (MSI) - via Admin UI or REST API │
│  ✓ B2B Features (Companies, Teams, Shared Catalogs)        │
│  ✓ Checkout & Order Management                             │
│  ✓ Customer Accounts & Permissions                         │
└─────────────────────────────────────────────────────────────┘

Data Flow:
1. ACO Data Ingestion API → Adobe Commerce Product Catalog
2. Admin configures MSI sources (manual or REST API)
3. Admin creates stocks and links sources
4. Admin assigns products to sources with quantities
5. Inventory available for storefront display and checkout
```

### Benefits of Separate Inventory Management

1. **Specialization:** Each system focuses on its core strength
2. **Flexibility:** Update inventory without re-ingesting catalog
3. **Real-time:** Inventory updates immediately without ACO sync delay
4. **Advanced Features:** Adobe Commerce MSI provides sophisticated source selection algorithms

---

## BuildRight Inventory Source Architecture

### 6 Physical Inventory Sources

Based on `data/buildright/sources.json`, BuildRight uses 6 inventory sources across multiple regions:

#### Regional Distribution Centers (RDCs)

**1. warehouse_west** (Sacramento, CA)
- Source Code: `warehouse_west`
- Name: Western RDC - Sacramento
- Region: US-West
- Postcode: 95814
- Coordinates: 38.5816, -121.4944
- Contact: warehouse.west@buildright.com
- Phone: 916-555-0100

**2. warehouse_east** (Charlotte, NC)
- Source Code: `warehouse_east`
- Name: Eastern RDC - Charlotte
- Region: US-East
- Postcode: 28202
- Coordinates: 35.2271, -80.8431
- Contact: warehouse.east@buildright.com
- Phone: 704-555-0200

#### Regional Warehouses

**3. warehouse_phoenix** (Phoenix, AZ)
- Source Code: `warehouse_phoenix`
- Name: Phoenix Metro Warehouse
- Region: US-Southwest
- Postcode: 85001
- Coordinates: 33.4484, -112.074
- Contact: warehouse.phoenix@buildright.com
- Phone: 602-555-0300

**4. warehouse_denver** (Denver, CO)
- Source Code: `warehouse_denver`
- Name: Denver Warehouse
- Region: US-Mountain
- Postcode: 80202
- Coordinates: 39.7392, -104.9903
- Contact: warehouse.denver@buildright.com
- Phone: 303-555-0400

**5. warehouse_atlanta** (Atlanta, GA)
- Source Code: `warehouse_atlanta`
- Name: Atlanta Metro Warehouse
- Region: US-Southeast
- Postcode: 30303
- Coordinates: 33.749, -84.388
- Contact: warehouse.atlanta@buildright.com
- Phone: 404-555-0500

#### Virtual Drop Shipper

**6. dropship_premium_windows** (Virtual)
- Source Code: `dropship_premium_windows`
- Name: Drop Shipper - Premium Window Systems
- Region: US-Virtual
- Virtual source (no physical location)
- Contact: dropship@premiumwindows.com
- Phone: 800-555-0199

### 1 Stock Definition

**BuildRight-Main-Stock**
- Sources: All 6 sources (warehouse_west, warehouse_east, warehouse_phoenix, warehouse_denver, warehouse_atlanta, dropship_premium_windows)
- Sales Channels: Default website (single website deployment)
- Priority: Configured by distance-based algorithm or manual priority
  - RDCs (warehouse_west, warehouse_east): Priority 1-2
  - Regional warehouses (warehouse_phoenix, warehouse_denver, warehouse_atlanta): Priority 3-5
  - Virtual drop shipper (dropship_premium_windows): Priority 6 (fallback)

**Architecture Rationale:**
- Adobe Commerce has a 1:1 relationship between stocks and websites
- Since BuildRight uses a single website, we configure a single stock
- All 6 inventory sources are assigned to this stock
- Source selection algorithm determines which source fulfills each order based on distance, priority, or availability

---

## Option 1: Manual Configuration via Admin UI

### Step 1: Enable MSI

**Navigation:** Admin → Stores → Configuration → Catalog → Inventory

1. Set **Stock Options → Manage Stock:** Yes
2. Click **Save Config**
3. Navigate to **System → Cache Management**
4. Click **Flush Magento Cache**

### Step 2: Create Inventory Sources

**Navigation:** Admin → Stores → Inventory → Sources

**For Each Source (Repeat 6 times):**

**Example: warehouse_west**

1. Click **Add New Source**
2. Fill in:
   - **Name:** Western RDC - Sacramento
   - **Code:** warehouse_west (CANNOT be changed after creation)
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

**Repeat for all 6 sources** using data from `data/buildright/sources.json`

**Estimated Time:** 30-45 minutes

### Step 3: Create Stock and Link Sources

**Navigation:** Admin → Stores → Inventory → Stocks

**Create BuildRight-Main-Stock**

1. Click **Add New Stock**
2. Fill in:
   - **Name:** BuildRight-Main-Stock
   - **Assign Sales Channels:** Main Website (or Default)
3. In **Assign Sources** tab:
   - Click **Assign Sources**
   - Select all 6 sources:
     - warehouse_west (Priority: 1)
     - warehouse_east (Priority: 2)
     - warehouse_phoenix (Priority: 3)
     - warehouse_denver (Priority: 4)
     - warehouse_atlanta (Priority: 5)
     - dropship_premium_windows (Priority: 6)
   - Click **Done**
4. Click **Save & Continue**

**Priority Strategy:**
- Priorities 1-2: Regional Distribution Centers (primary fulfillment)
- Priorities 3-5: Regional warehouses (secondary fulfillment)
- Priority 6: Drop shipper (fallback for out-of-stock items)

**Estimated Time:** 10-15 minutes

### Step 4: Assign Products to Sources

**Navigation:** Admin → Catalog → Products

**For Each Product (184 products):**

1. Click **Edit** on product
2. Navigate to **Sources** tab
3. Check **Assign Sources**
4. Select relevant sources (typically all 6 for building materials)
5. Enter quantities:
   - RDCs (warehouse_west, warehouse_east): 300-500 units each
   - Regional Warehouses: 100-200 units
   - Drop shipper: 20-50 units
6. Set **Source Item Status:** In Stock
7. Click **Save**

**Bulk Assignment Alternative:**

1. Select multiple products in product grid (checkbox)
2. Click **Actions → Update Attributes**
3. Use **Advanced Inventory** section for bulk qty updates
4. **Note:** This is limited; may still need individual assignment

**Estimated Time:** 1.5-2.5 hours (25-50 seconds per product)

### Step 5: Configure Source Selection Algorithm

**Navigation:** Admin → Stores → Configuration → Catalog → Inventory → Distance Priority Algorithm

1. **Set Provider:** Google MAP (or offline calculation)
2. **Set Computation Mode:** Driving, Walking, or Bicycling
3. **Set Value:** Distance (for distance-based allocation)
4. Click **Save Config**

**Estimated Time:** 5 minutes

---

## Option 2: Programmatic Configuration via REST API

### Overview

Use Adobe Commerce Inventory REST API to configure sources programmatically.

**Benefits:**
- Faster than manual UI (scripted)
- Repeatable and version-controlled
- Uses existing sources.json data

**Drawbacks:**
- Requires API authentication setup
- More technical implementation
- Less visual validation

### Prerequisites

- Adobe Commerce 2.4.x with REST API enabled
- Admin integration token or OAuth credentials
- Node.js with axios or similar HTTP client

### API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create Source | POST | `/rest/V1/inventory/sources` |
| Update Source | PUT | `/rest/V1/inventory/sources/{sourceCode}` |
| Get Source | GET | `/rest/V1/inventory/sources/{sourceCode}` |
| Create Stock | POST | `/rest/V1/inventory/stocks` |
| Link Stock-Source | POST | `/rest/V1/inventory/stock-source-links` |
| Assign Product-Source | POST | `/rest/V1/inventory/source-items` |

### Step 1: Create Sources via API

**Script Example:**

```javascript
// scripts/configure-msi-sources.js

import axios from 'axios';
import fs from 'fs/promises';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // Generate via Admin → System → Integrations
const BASE_URL = process.env.COMMERCE_BASE_URL; // e.g., https://your-commerce-instance.com

async function createSource(sourceData) {
  const response = await axios.post(
    `${BASE_URL}/rest/V1/inventory/sources`,
    {
      source: {
        source_code: sourceData.source_code,
        name: sourceData.name,
        enabled: true,
        latitude: sourceData.latitude || null,
        longitude: sourceData.longitude || null,
        country_id: sourceData.country_id,
        postcode: sourceData.postcode,
        region: sourceData.region,
        city: sourceData.city || 'N/A',
        street: 'N/A',
        phone: sourceData.phone || 'N/A',
        email: sourceData.email
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

async function main() {
  // Load sources.json
  const sourcesData = JSON.parse(
    await fs.readFile('data/buildright/sources.json', 'utf-8')
  );

  // Create each source
  for (const source of sourcesData) {
    try {
      console.log(`Creating source: ${source.source_code}`);
      await createSource(source);
      console.log(`✓ Created ${source.source_code}`);
    } catch (error) {
      console.error(`✗ Failed to create ${source.source_code}:`, error.message);
    }
  }
}

main();
```

**Run:**
```bash
ADMIN_TOKEN="your-token" COMMERCE_BASE_URL="https://your-instance.com" node scripts/configure-msi-sources.js
```

**Estimated Time:** 5-10 minutes (scripted)

### Step 2: Create Stock and Link All Sources via API

**Script Example:**

```javascript
// Create BuildRight-Main-Stock
const stockResponse = await axios.post(
  `${BASE_URL}/rest/V1/inventory/stocks`,
  {
    stock: {
      name: 'BuildRight-Main-Stock',
      extension_attributes: {
        sales_channels: [
          { type: 'website', code: 'base' }
        ]
      }
    }
  },
  { headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } }
);

const stockId = stockResponse.data.stock_id;

// Link all 6 sources to the single stock with priority
const sources = [
  { code: 'warehouse_west', priority: 1 },
  { code: 'warehouse_east', priority: 2 },
  { code: 'warehouse_phoenix', priority: 3 },
  { code: 'warehouse_denver', priority: 4 },
  { code: 'warehouse_atlanta', priority: 5 },
  { code: 'dropship_premium_windows', priority: 6 }
];

for (const source of sources) {
  await axios.post(
    `${BASE_URL}/rest/V1/inventory/stock-source-links`,
    {
      links: [{
        stock_id: stockId,
        source_code: source.code,
        priority: source.priority
      }]
    },
    { headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } }
  );
}
```

**Estimated Time:** 5-10 minutes (scripted)

### Step 3: Assign Products to Sources via API

**Batch Assignment:**

```javascript
// Load products
const products = JSON.parse(
  await fs.readFile('data/buildright/products.json', 'utf-8')
);

// Load sources
const sources = JSON.parse(
  await fs.readFile('data/buildright/sources.json', 'utf-8')
);

// For each product, assign to all sources
for (const product of products) {
  const sourceItems = sources.map(source => ({
    sku: product.sku,
    source_code: source.source_code,
    quantity: determineQuantity(source), // RDC=500, Warehouse=200, Dropship=20
    status: 1 // In Stock
  }));

  // Batch assign (max 500 items per request)
  await axios.post(
    `${BASE_URL}/rest/V1/inventory/source-items`,
    { sourceItems },
    { headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` } }
  );
}

function determineQuantity(source) {
  if (source.source_code.includes('warehouse_west') || source.source_code.includes('warehouse_east')) {
    return 500; // RDCs
  }
  if (source.source_code.includes('dropship')) {
    return 20; // Drop shipper
  }
  return 200; // Regional warehouses
}
```

**Estimated Time:** 20-30 minutes (scripted, including API rate limits)

---

## Testing and Validation

### Validation Checklist

- [ ] All 6 sources created in Admin → Stores → Inventory → Sources
- [ ] All sources have correct region, city, postcode (required fields)
- [ ] 1 stock (BuildRight-Main-Stock) created with all 6 sources assigned
- [ ] Source priorities set correctly (warehouse_west=1, warehouse_east=2, etc.)
- [ ] Products show "In Stock" status
- [ ] Source selection algorithm configured
- [ ] Quantity displays correctly on product pages

### Test Scenario: Verify Source Assignment

1. Navigate to **Admin → Catalog → Products**
2. Edit any product (e.g., "2x4 Stud - 8ft")
3. Go to **Sources** tab
4. Verify:
   - All 6 sources appear
   - Quantities are assigned
   - Source Item Status: In Stock
5. Save product
6. View product on storefront
7. Verify "In Stock" displays

**Estimated Time:** 30 minutes

---

## Comparison: Manual UI vs. REST API

| Aspect | Manual UI | REST API |
|--------|-----------|----------|
| **Setup Time** | 3-5 hours | 45-60 minutes |
| **Technical Skill** | Low (point-and-click) | High (scripting required) |
| **Repeatability** | Manual repetition | Fully automated |
| **Error Prone** | Yes (typos, missed fields) | No (scripted validation) |
| **Visual Validation** | Immediate (see in UI) | Requires separate verification |
| **Version Control** | No | Yes (scripts committed) |

**Recommendation:** Use REST API approach for efficiency and repeatability. Fall back to manual UI for validation and troubleshooting.

---

## Appendix A: sources.json Schema

The BuildRight `sources.json` file contains:

```json
[
  {
    "source_code": "warehouse_west",
    "name": "Western RDC - Sacramento",
    "country_id": "US",
    "postcode": "95814",
    "enabled": true,
    "region": "US-West",
    "city": "Sacramento",
    "region_id": 5,
    "latitude": 38.5816,
    "longitude": -121.4944,
    "description": "Western Regional Distribution Center",
    "contact_name": "West Coast Operations",
    "email": "warehouse.west@buildright.com",
    "phone": "916-555-0100"
  }
  // ... 5 more sources
]
```

**Note:** This file is for reference only. Data must be manually entered into Adobe Commerce or imported via REST API.

---

## Appendix B: Cross-References

### Related Documentation

- **B2B Configuration Guide:** [`docs/manual-setup/b2b-configuration-guide.md`](./b2b-configuration-guide.md)
  - B2B companies can be mapped to specific inventory sources for location-based fulfillment
  - Company locations (teams) correlate with inventory source locations
  - Shared catalog assignment works independently of MSI source assignment

- **Price Book Configuration:** See `data/buildright/price-books.json`
  - Pricing and inventory are independent in Adobe Commerce
  - Update prices via ACO; update inventory via MSI

- **ACO Data Ingestion Documentation:** Adobe Commerce Optimizer official docs
  - ACO handles catalog and pricing ingestion
  - MSI configuration is outside ACO scope

### Integration Points

**MSI + B2B:**
- Assign company locations to nearby inventory sources for faster fulfillment
- Use source selection algorithms to prioritize local branch yards for company delivery addresses

**MSI + Pricing:**
- Shared catalog determines which products company sees
- MSI determines which sources fulfill the order
- Both work together transparently at checkout

---

## Appendix C: Troubleshooting

### Issue: Sources not appearing in product assignment

**Solution:** Ensure sources are enabled. Check **Admin → Stores → Inventory → Sources → [Source] → Enabled = Yes**

### Issue: Stock not available on storefront

**Solution:** Verify stock is assigned to sales channel. Check **Admin → Stores → Inventory → Stocks → [Stock] → Sales Channels** includes website.

### Issue: Distance Priority Algorithm not working

**Solution:** Ensure latitude/longitude are set for all sources. Check Google MAP API key is configured if using online calculation.

### Issue: Product shows "Out of Stock" despite source quantities

**Solution:**
1. Verify source is assigned to a stock
2. Check that stock is assigned to the sales channel (website)
3. Verify source priorities are set correctly
4. Clear cache: **System → Cache Management → Flush Magento Cache**

### Issue: API authentication fails when creating sources via REST

**Solution:**
1. Verify ADMIN_TOKEN is valid (tokens expire after configured time)
2. Check integration permissions include "Catalog" and "Inventory" resources
3. Ensure BASE_URL includes protocol (https://) and correct domain

---

**Document Version:** 1.0
**Last Updated:** 2025-10-29
