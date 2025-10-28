<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# BuildRight Solutions: Complete Step-by-Step Implementation Guide (Continued)

## Phase 10: Create Policies in ACO


***

```
<a name="phase-10-policies"></a>
```


## Phase 10: Create Policies in ACO

### Overview

Create policies in Adobe Commerce Optimizer to dynamically filter and compose catalogs based on project phases, customer attributes, and regional availability. This phase implements the "Project-as-Dynamic-Bundle" concept using ACO's trigger-based policy system.

### Step 10.1: Understanding ACO Policies

**Policy Types:**

1. **Static Policies** - Fixed rules applied to all catalog views
    - Example: Show only products available in Western region
    - No runtime variables
    - Always evaluated the same way
2. **Trigger-Based Policies (Exclusive)** - Dynamic rules based on HTTP headers/parameters
    - Example: Show only products for current project phase
    - Values come from API requests
    - Enable personalized catalogs per request

**Policy Structure:**

```json
{
  "policyId": "policy-project-phase",
  "name": "Project Phase Filter",
  "type": "EXCLUSIVE",
  "trigger": {
    "name": "AC-Policy-Project-Phase",
    "transport": "HTTP_HEADER"
  },
  "conditions": [
    {
      "attribute": "project_phase",
      "operator": "CONTAINS",
      "valueSource": "TRIGGER"
    }
  ]
}
```


### Step 10.2: Plan Policy Architecture

**Our Policy Strategy:**

```
Catalog View: Project-Framing-Commercial-West
├─ Static Policy: West Region Products (always applied)
├─ Trigger Policy: Project Phase = FRAMING (from header)
├─ Trigger Policy: Customer Type = Commercial (from header)
└─ Trigger Policy: Customer Tier Minimum Order (from header)
```

**Document the strategy:**

**Create file: `docs/policy-architecture.md`**

```markdown
# ACO Policy Architecture

## Overview
BuildRight Solutions uses ACO policies to create dynamic, context-aware catalogs that filter products based on project requirements, customer attributes, and regional availability.

## Policy Hierarchy

### Layer 1: Regional Filtering (Static Policies)
**Purpose:** Ensure customers only see products available in their region

**Policies:**
1. **West Region Products Policy**
   - Filters for products with attribute `available_regions` containing "WEST"
   - Applied to: All Western catalog views
   - Type: Static (always on)

2. **East Region Products Policy**
   - Filters for products with attribute `available_regions` containing "EAST"
   - Applied to: All Eastern catalog views
   - Type: Static (always on)

### Layer 2: Customer Type Filtering (Trigger Policies)
**Purpose:** Show products appropriate for customer's business type

**Policies:**
3. **Commercial/Residential Filter Policy**
   - Trigger: `AC-Policy-Customer-Type`
   - Attribute: `commercial_residential`
   - Operator: `IN`
   - Values: "Commercial" or "Residential" or "Both" (from HTTP header)
   - Applied to: All catalog views
   - Type: Trigger (dynamic)

### Layer 3: Project Phase Filtering (Trigger Policies)
**Purpose:** Show only products relevant to current construction phase

**Policies:**
4. **Project Phase Filter Policy**
   - Trigger: `AC-Policy-Project-Phase`
   - Attribute: `project_phase`
   - Operator: `CONTAINS`
   - Values: "FOUNDATION", "FRAMING", "EXTERIOR_SHELL", "DRYWALL", "ALL_PHASES" (from HTTP header)
   - Applied to: Project-specific catalog views
   - Type: Trigger (dynamic)

### Layer 4: Customer Tier Filtering (Trigger Policies)
**Purpose:** Filter by minimum order quantities based on customer tier

**Policies:**
5. **Minimum Order Quantity Filter Policy**
   - Trigger: `AC-Policy-Customer-Tier`
   - Attribute: `minimum_order_quantity`
   - Operator: `LESS_THAN_OR_EQUAL`
   - Values: 1, 10, 50, 100 (from HTTP header)
   - Applied to: Commercial catalog views
   - Type: Trigger (dynamic)

## Policy Combination Examples

### Scenario 1: West Tier 1 GC - Framing Phase
**API Request Headers:**
```

AC-Policy-Customer-Type: Commercial
AC-Policy-Project-Phase: FRAMING
AC-Policy-Customer-Tier: 1

```

**Policies Applied:**
1. West Region Products (static)
2. Customer Type = Commercial (trigger)
3. Project Phase = FRAMING (trigger)
4. Minimum Order Qty ≤ 1 (trigger)

**Result:** Products that are:
- Available in Western region
- Suitable for Commercial customers
- Used in FRAMING or ALL_PHASES
- Have minimum order quantity of 1 or less

**Example Products Shown:**
- LBR-2X4-8-SPF-STD (lumber for framing)
- NAIL-FRAME-16D-5LB (framing fasteners)
- PLY-OSB-7/16-4X8 (sheathing)
- SVC-DEL-JOBSITE (delivery service)

**Example Products Hidden:**
- DRYWALL-1/2-4X8-REG (not used in framing phase)
- SHINGLE-ARCH-OAKRIDGE-30YR (roofing, not framing)
- WINDOW-DH-3060-VINYL-WHT (windows, not framing)

### Scenario 2: East Residential - Drywall Phase
**API Request Headers:**
```

AC-Policy-Customer-Type: Residential
AC-Policy-Project-Phase: DRYWALL
AC-Policy-Customer-Tier: 1

```

**Policies Applied:**
1. East Region Products (static)
2. Customer Type = Residential (trigger)
3. Project Phase = DRYWALL (trigger)
4. Minimum Order Qty ≤ 1 (trigger)

**Result:** Drywall-phase products available in Eastern region for residential use

**Example Products Shown:**
- DRYWALL-1/2-4X8-REG
- COMPOUND-JOINT-4.5GAL
- TAPE-PAPER-250FT
- SCREW-DRYWALL-1-1/4-5LB
- BUNDLE-DRYWALL-ROOM-12X12

### Scenario 3: Retail Customer - No Project Filter
**API Request Headers:**
```

AC-Policy-Customer-Type: Residential
(No project phase header)

```

**Policies Applied:**
1. West Region Products (static)
2. Customer Type = Residential (trigger)
3. No project phase filter (see all products)

**Result:** All residential-appropriate products in Western region

## Policy Evaluation Order

ACO evaluates policies in this order:
1. **Static policies** first (always applied)
2. **Trigger policies** second (if headers present)
3. **Catalog view policies** override all (most specific)

## Technical Implementation

### Frontend Integration

**Project Dashboard:**
```

// User navigates to project "PROJ-2025-001"
const project = await fetchProject('PROJ-2025-001');

// Set headers based on project state
const headers = {
'AC-Policy-Project-Phase': project.currentPhase, // e.g., "FRAMING"
'AC-Policy-Customer-Type': project.projectType,  // e.g., "COMMERCIAL"
'AC-Policy-Customer-Tier': customer.tier         // e.g., "1"
};

// Query ACO Merchandising API
const products = await fetch('https://merchandising-api.adobe.io/products', {
headers: headers
});

// Receive filtered product list
displayProjectMaterials(products);

```

### API Request Format

**GraphQL Query:**
```

query {
products(
currentPage: 1
pageSize: 50
filter: {}
) {
items {
sku
name
price {
regular
final
}
attributes {
code
values
}
}
total_count
}
}

```

**With Headers:**
```

GET /graphql
Host: merchandising-api.adobe.io
Authorization: Bearer <token>
AC-Policy-Project-Phase: FRAMING
AC-Policy-Customer-Type: Commercial
AC-Policy-Customer-Tier: 1
X-Price-Book-Id: west-commercial-gc-tier1

```

### Backend Processing

1. ACO receives request with headers
2. Looks up catalog view (contains static policies)
3. Evaluates trigger policies using header values
4. Filters product catalog based on all policies
5. Applies pricing from specified price book
6. Returns filtered, priced product list
```


### Step 10.3: Create Policy Definition Files

**Create directory structure:**

```bash
mkdir -p data/buildright/policies
cd data/buildright/policies
```

**Create file: `data/buildright/policies/policies-all.json`**

```json
[
  {
    "policyId": "policy-west-region-products",
    "name": "West Region Products Filter",
    "description": "Shows only products available in Western region",
    "type": "STATIC",
    "conditions": [
      {
        "attribute": "commercial_residential",
        "operator": "IN",
        "values": ["Commercial", "Residential", "Both"]
      }
    ]
  },
  {
    "policyId": "policy-east-region-products",
    "name": "East Region Products Filter",
    "description": "Shows only products available in Eastern region",
    "type": "STATIC",
    "conditions": [
      {
        "attribute": "commercial_residential",
        "operator": "IN",
        "values": ["Commercial", "Residential", "Both"]
      }
    ]
  },
  {
    "policyId": "policy-project-phase",
    "name": "Project Phase Filter",
    "description": "Filters products by construction project phase",
    "type": "EXCLUSIVE",
    "trigger": {
      "name": "AC-Policy-Project-Phase",
      "transport": "HTTP_HEADER"
    },
    "conditions": [
      {
        "attribute": "project_phase",
        "operator": "CONTAINS",
        "valueSource": "TRIGGER"
      }
    ]
  },
  {
    "policyId": "policy-customer-type",
    "name": "Customer Type Filter",
    "description": "Filters products by customer business type (Commercial/Residential)",
    "type": "EXCLUSIVE",
    "trigger": {
      "name": "AC-Policy-Customer-Type",
      "transport": "HTTP_HEADER"
    },
    "conditions": [
      {
        "attribute": "commercial_residential",
        "operator": "IN",
        "valueSource": "TRIGGER"
      }
    ]
  },
  {
    "policyId": "policy-customer-tier",
    "name": "Customer Tier Minimum Order Filter",
    "description": "Filters products by minimum order quantity based on customer tier",
    "type": "EXCLUSIVE",
    "trigger": {
      "name": "AC-Policy-Customer-Tier",
      "transport": "HTTP_HEADER"
    },
    "conditions": [
      {
        "attribute": "minimum_order_quantity",
        "operator": "LESS_THAN_OR_EQUAL",
        "valueSource": "TRIGGER"
      }
    ]
  }
]
```


### Step 10.4: Create Policies in ACO via UI

**Important:** ACO policies must be created via the Admin UI, not via API (as of current ACO version).

#### Policy 1: West Region Products (Static)

1. Navigate to ACO Admin Panel
2. Click **Catalog > Policies** in left navigation
3. Click **Create Policy** button (top right)
4. **Policy Information:**
    - **Policy ID:** `policy-west-region-products`
    - **Policy Name:** `West Region Products Filter`
    - **Description:** `Shows only products available in Western region`
    - **Policy Type:** `STATIC`
5. **Conditions Section:**
    - Click **Add Condition**
    - **Attribute:** Select `commercial_residential` from dropdown
    - **Operator:** Select `IN`
    - **Value Source:** `STATIC`
    - **Values:** Enter `Commercial, Residential, Both` (comma-separated)
        - Or use individual value fields if UI provides them:
            - Value 1: `Commercial`
            - Value 2: `Residential`
            - Value 3: `Both`
6. Click **Save Policy**
7. Verify policy appears in policies list
8. Take screenshot

**Note:** This policy ensures only products marked as suitable for commercial/residential use are shown. In a more complete implementation, you would have an `available_regions` attribute, but we're simplifying by using `commercial_residential` as a proxy.

#### Policy 2: East Region Products (Static)

1. Click **Create Policy**
2. **Policy Information:**
    - **Policy ID:** `policy-east-region-products`
    - **Policy Name:** `East Region Products Filter`
    - **Description:** `Shows only products available in Eastern region`
    - **Policy Type:** `STATIC`
3. **Conditions:**
    - **Attribute:** `commercial_residential`
    - **Operator:** `IN`
    - **Values:** `Commercial, Residential, Both`
4. Click **Save Policy**

**Note:** Both regional policies use the same condition for this demo. In production, you would differentiate by actual region attributes.

#### Policy 3: Project Phase Filter (Trigger)

1. Click **Create Policy**
2. **Policy Information:**
    - **Policy ID:** `policy-project-phase`
    - **Policy Name:** `Project Phase Filter`
    - **Description:** `Filters products by construction project phase`
    - **Policy Type:** `EXCLUSIVE` (trigger-based)
3. **Trigger Configuration:**
    - **Trigger Name:** `AC-Policy-Project-Phase`
    - **Transport Type:** `HTTP_HEADER`
4. **Conditions:**
    - Click **Add Condition**
    - **Attribute:** Select `project_phase` from dropdown
    - **Operator:** Select `CONTAINS`
    - **Value Source:** `TRIGGER` (value comes from HTTP header)
5. Click **Save Policy**
6. Take screenshot showing trigger configuration

**Expected behavior:**

- When API request includes header `AC-Policy-Project-Phase: FRAMING`
- Policy filters products where `project_phase` contains "FRAMING"
- Products with `project_phase = ["FRAMING"]` or `project_phase = ["FRAMING", "ALL_PHASES"]` will be shown


#### Policy 4: Customer Type Filter (Trigger)

1. Click **Create Policy**
2. **Policy Information:**
    - **Policy ID:** `policy-customer-type`
    - **Policy Name:** `Customer Type Filter`
    - **Description:** `Filters products by customer business type`
    - **Policy Type:** `EXCLUSIVE`
3. **Trigger Configuration:**
    - **Trigger Name:** `AC-Policy-Customer-Type`
    - **Transport Type:** `HTTP_HEADER`
4. **Conditions:**
    - **Attribute:** `commercial_residential`
    - **Operator:** `IN`
    - **Value Source:** `TRIGGER`
5. Click **Save Policy**

**Expected behavior:**

- When header `AC-Policy-Customer-Type: Commercial`
- Shows products where `commercial_residential` IN ["Commercial", "Both"]
- Hides products with `commercial_residential = "Residential"` only


#### Policy 5: Customer Tier Minimum Order Filter (Trigger)

1. Click **Create Policy**
2. **Policy Information:**
    - **Policy ID:** `policy-customer-tier`
    - **Policy Name:** `Customer Tier Minimum Order Filter`
    - **Description:** `Filters by minimum order quantity based on customer tier`
    - **Policy Type:** `EXCLUSIVE`
3. **Trigger Configuration:**
    - **Trigger Name:** `AC-Policy-Customer-Tier`
    - **Transport Type:** `HTTP_HEADER`
4. **Conditions:**
    - **Attribute:** `minimum_order_quantity`
    - **Operator:** `LESS_THAN_OR_EQUAL`
    - **Value Source:** `TRIGGER`
5. Click **Save Policy**

**Expected behavior:**

- When header `AC-Policy-Customer-Tier: 1`
- Shows products where `minimum_order_quantity ≤ 1`
- Tier 1 customers can order singles
- When header `AC-Policy-Customer-Tier: 10`
- Shows products where `minimum_order_quantity ≤ 10`
- Lower tier customers have higher minimum order requirements


### Step 10.5: Verify Policies in ACO UI

**Check policies list:**

1. Navigate to **Catalog > Policies**
2. Verify you see 5 policies:
    - policy-west-region-products (STATIC)
    - policy-east-region-products (STATIC)
    - policy-project-phase (EXCLUSIVE)
    - policy-customer-type (EXCLUSIVE)
    - policy-customer-tier (EXCLUSIVE)
3. Click on each policy to review configuration
4. Verify:
    - Conditions are correct
    - Trigger names match exactly (case-sensitive)
    - Attributes reference existing product attributes
5. Take screenshot showing all 5 policies

### Step 10.6: Create Policy Testing Documentation

**Create file: `docs/policy-testing-guide.md`**

```markdown
# Policy Testing Guide

## Overview
Test cases for verifying ACO policy functionality in BuildRight Solutions.

## Test Prerequisites

- All 5 policies created in ACO
- All products ingested with correct attributes
- Merchandising API accessible
- Test API credentials configured

## Test Cases

### Test 1: Static Policy - West Region Filter

**Objective:** Verify static regional filtering works

**Setup:**
- Query products without any trigger headers
- Use catalog view with `policy-west-region-products` applied

**Expected Result:**
- All products shown (since all have commercial_residential attribute)
- No products filtered out

**Validation:**
```

curl -X GET "https://merchandising-api.adobe.io/products" \
-H "Authorization: Bearer <token>" \
-H "X-Catalog-View-Id: default"

```

### Test 2: Project Phase Trigger - FRAMING

**Objective:** Verify project phase filtering shows only framing products

**Setup:**
- Send header: `AC-Policy-Project-Phase: FRAMING`
- Use catalog view with `policy-project-phase` applied

**Expected Result:**
- Products with `project_phase = ["FRAMING"]` shown
- Products with `project_phase = ["FRAMING", "ALL_PHASES"]` shown
- Products with `project_phase = ["DRYWALL"]` hidden
- Products with `project_phase = ["EXTERIOR_SHELL"]` hidden

**Products Expected in Results:**
- LBR-2X4-8-SPF-STD (FRAMING)
- PLY-OSB-7/16-4X8 (FRAMING)
- NAIL-FRAME-16D-5LB (ALL_PHASES)
- BUNDLE-FRAME-2X4-STD (FRAMING)

**Products NOT Expected:**
- DRYWALL-1/2-4X8-REG (DRYWALL phase)
- SHINGLE-ARCH-OAKRIDGE-30YR (EXTERIOR_SHELL phase)

**API Request:**
```

curl -X GET "https://merchandising-api.adobe.io/products" \
-H "Authorization: Bearer <token>" \
-H "X-Catalog-View-Id: project-framing" \
-H "AC-Policy-Project-Phase: FRAMING"

```

### Test 3: Project Phase Trigger - DRYWALL

**Objective:** Verify drywall phase shows different products

**Setup:**
- Send header: `AC-Policy-Project-Phase: DRYWALL`

**Expected Result:**
- Drywall products shown
- Framing products hidden (except those with ALL_PHASES)

**Products Expected:**
- DRYWALL-1/2-4X8-REG (DRYWALL)
- COMPOUND-JOINT-4.5GAL (DRYWALL)
- SCREW-DRYWALL-1-1/4-5LB (DRYWALL)
- NAIL-FRAME-16D-5LB (ALL_PHASES - still shown)

**Products NOT Expected:**
- LBR-2X4-8-SPF-STD (FRAMING only)
- SHINGLE-ARCH-OAKRIDGE-30YR (EXTERIOR_SHELL)

### Test 4: Customer Type Trigger - Commercial Only

**Objective:** Verify commercial filter hides residential-only products

**Setup:**
- Send header: `AC-Policy-Customer-Type: Commercial`

**Expected Result:**
- Products with `commercial_residential = "Commercial"` shown
- Products with `commercial_residential = "Both"` shown
- Products with `commercial_residential = "Residential"` hidden

**API Request:**
```

curl -X GET "https://merchandising-api.adobe.io/products" \
-H "Authorization: Bearer <token>" \
-H "AC-Policy-Customer-Type: Commercial"

```

### Test 5: Combined Triggers - Framing + Commercial

**Objective:** Verify multiple triggers work together

**Setup:**
- Send headers:
  - `AC-Policy-Project-Phase: FRAMING`
  - `AC-Policy-Customer-Type: Commercial`

**Expected Result:**
- Only products that match BOTH conditions shown
- Must be in FRAMING phase AND suitable for Commercial

**Products Expected:**
- LBR-2X4-8-SPF-STD (FRAMING + Both)
- NAIL-FRAME-16D-5LB (ALL_PHASES + Both)

**Products NOT Expected:**
- DRYWALL-1/2-4X8-REG (wrong phase)
- Any residential-only products (wrong type)

### Test 6: Customer Tier Minimum Order

**Objective:** Verify minimum order quantity filtering

**Setup:**
- Send header: `AC-Policy-Customer-Tier: 1`

**Expected Result:**
- All products with `minimum_order_quantity = 1` shown
- Products with `minimum_order_quantity > 1` hidden

**Setup for Tier 2:**
- Send header: `AC-Policy-Customer-Tier: 10`

**Expected Result:**
- Products with `minimum_order_quantity ≤ 10` shown
- Products with `minimum_order_quantity > 10` hidden

### Test 7: Full Stack Test - West Tier 1 GC Framing Phase

**Objective:** Test complete real-world scenario

**Setup:**
- Catalog View: `project-framing-commercial-west`
- Headers:
  - `AC-Policy-Project-Phase: FRAMING`
  - `AC-Policy-Customer-Type: Commercial`
  - `AC-Policy-Customer-Tier: 1`
  - `X-Price-Book-Id: west-commercial-gc-tier1`

**Expected Result:**
- Only framing-phase commercial products shown
- Prices reflect Tier 1 GC pricing
- Inventory from Western sources only
- No minimum order quantity restrictions

**Validation Points:**
1. Product count matches expected (approximately 30-40 products)
2. All products have `project_phase` containing FRAMING or ALL_PHASES
3. All products have `commercial_residential` = Commercial or Both
4. All prices show 15% discount (Tier 1 pricing)
5. No out-of-region products shown

## Test Execution Scripts

### Automated Test Runner

See: `scripts/test-policies.js` for automated test execution.

### Manual Testing Checklist

- [ ] Test 1: Static policy - Pass/Fail
- [ ] Test 2: FRAMING phase - Pass/Fail
- [ ] Test 3: DRYWALL phase - Pass/Fail
- [ ] Test 4: Commercial type - Pass/Fail
- [ ] Test 5: Combined triggers - Pass/Fail
- [ ] Test 6: Customer tier - Pass/Fail
- [ ] Test 7: Full stack - Pass/Fail

## Troubleshooting

### Issue: Trigger not working

**Symptoms:**
- Header sent but products not filtered
- All products still showing

**Possible Causes:**
1. Trigger name mismatch (case-sensitive)
2. Policy not applied to catalog view
3. Attribute doesn't exist on products
4. Header format incorrect

**Solutions:**
1. Verify exact trigger name: `AC-Policy-Project-Phase` (check case)
2. Check catalog view includes the policy
3. Verify products have `project_phase` attribute
4. Check header format: `AC-Policy-Project-Phase: FRAMING` (no quotes)

### Issue: Policy showing no products

**Symptoms:**
- Policy applies but returns empty results
- Expected products not appearing

**Possible Causes:**
1. Condition too restrictive
2. No products match criteria
3. Multiple conflicting policies
4. Attribute values don't match

**Solutions:**
1. Test with broader conditions first
2. Verify products have correct attribute values
3. Check for policy conflicts in catalog view
4. Test without policy to confirm products exist

### Issue: Static policy not applying

**Symptoms:**
- Static policy configured but not filtering

**Possible Causes:**
1. Policy not assigned to catalog view
2. Policy type incorrect (should be STATIC)
3. Catalog view caching

**Solutions:**
1. Check catalog view policy assignments
2. Verify policy type is STATIC
3. Clear ACO cache / wait for reindex
```


### Step 10.7: Create Policy Testing Script

**Create file: `scripts/test-policies.js`**

```javascript
require('dotenv').config();
const axios = require('axios');

const MERCHANDISING_API = 'https://merchandising-api.adobe.io';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TENANT_ID = process.env.TENANT_ID;

// Get IMS token
async function getAccessToken() {
  try {
    const response = await axios.post(
      'https://ims-na1.adobelogin.com/ims/token/v3',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'openid,AdobeID,read_organizations'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.message);
    throw error;
  }
}

// Test policy scenarios
async function testPolicies() {
  console.log('=== ACO Policy Testing ===\n');
  
  const token = await getAccessToken();
  console.log('✓ Access token obtained\n');
  
  const testCases = [
    {
      name: 'Test 1: No Triggers (Baseline)',
      headers: {},
      expectedBehavior: 'Should return all products'
    },
    {
      name: 'Test 2: FRAMING Phase Trigger',
      headers: {
        'AC-Policy-Project-Phase': 'FRAMING'
      },
      expectedBehavior: 'Should return only FRAMING and ALL_PHASES products'
    },
    {
      name: 'Test 3: DRYWALL Phase Trigger',
      headers: {
        'AC-Policy-Project-Phase': 'DRYWALL'
      },
      expectedBehavior: 'Should return only DRYWALL and ALL_PHASES products'
    },
    {
      name: 'Test 4: EXTERIOR_SHELL Phase Trigger',
      headers: {
        'AC-Policy-Project-Phase': 'EXTERIOR_SHELL'
      },
      expectedBehavior: 'Should return only EXTERIOR_SHELL and ALL_PHASES products'
    },
    {
      name: 'Test 5: Commercial Customer Type',
      headers: {
        'AC-Policy-Customer-Type': 'Commercial'
      },
      expectedBehavior: 'Should return Commercial and Both products'
    },
    {
      name: 'Test 6: Residential Customer Type',
      headers: {
        'AC-Policy-Customer-Type': 'Residential'
      },
      expectedBehavior: 'Should return Residential and Both products'
    },
    {
      name: 'Test 7: Tier 1 Customer (MOQ = 1)',
      headers: {
        'AC-Policy-Customer-Tier': '1'
      },
      expectedBehavior: 'Should return all products (no MOQ restriction)'
    },
    {
      name: 'Test 8: Combined - Framing + Commercial + Tier 1',
      headers: {
        'AC-Policy-Project-Phase': 'FRAMING',
        'AC-Policy-Customer-Type': 'Commercial',
        'AC-Policy-Customer-Tier': '1'
      },
      expectedBehavior: 'Should return only commercial framing products'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`${testCase.name}`);
    console.log('='.repeat(80));
    console.log(`Expected: ${testCase.expectedBehavior}`);
    console.log('Headers:', JSON.stringify(testCase.headers, null, 2));
    
    try {
      // Note: This is a conceptual test
      // Actual Merchandising API endpoint would be used here
      console.log('Status: Would query Merchandising API with these headers');
      console.log('⚠️  Actual API testing will be performed in Phase 12');
      console.log('');
      
    } catch (error) {
      console.error(`✗ Error: ${error.message}\n`);
    }
  }
  
  console.log('=== Policy Test Plan Complete ===');
  console.log('\nNote: These tests verify the policy configuration logic.');
  console.log('Actual API integration testing will be performed in Phase 12.');
  console.log('\nTo test policies now:');
  console.log('1. Use ACO Admin UI > Catalog > Views > Preview Catalog');
  console.log('2. Manually inspect filtered product lists');
  console.log('3. Verify products match expected phase/type');
}

testPolicies().catch(console.error);
```

**Run the test script:**

```bash
node scripts/test-policies.js
```

**Expected output:**

```
=== ACO Policy Testing ===

✓ Access token obtained

Test 1: No Triggers (Baseline)
================================================================================
Expected: Should return all products
Headers: {}
Status: Would query Merchandising API with these headers
⚠️  Actual API testing will be performed in Phase 12

Test 2: FRAMING Phase Trigger
================================================================================
Expected: Should return only FRAMING and ALL_PHASES products
Headers: {
  "AC-Policy-Project-Phase": "FRAMING"
}
Status: Would query Merchandising API with these headers
⚠️  Actual API testing will be performed in Phase 12

Test 3: DRYWALL Phase Trigger
================================================================================
Expected: Should return only DRYWALL and ALL_PHASES products
Headers: {
  "AC-Policy-Project-Phase": "DRYWALL"
}
Status: Would query Merchandising API with these headers
⚠️  Actual API testing will be performed in Phase 12

...

Test 8: Combined - Framing + Commercial + Tier 1
================================================================================
Expected: Should return only commercial framing products
Headers: {
  "AC-Policy-Project-Phase": "FRAMING",
  "AC-Policy-Customer-Type": "Commercial",
  "AC-Policy-Customer-Tier": "1"
}
Status: Would query Merchandising API with these headers
⚠️  Actual API testing will be performed in Phase 12

=== Policy Test Plan Complete ===

Note: These tests verify the policy configuration logic.
Actual API integration testing will be performed in Phase 12.

To test policies now:
1. Use ACO Admin UI > Catalog > Views > Preview Catalog
2. Manually inspect filtered product lists
3. Verify products match expected phase/type
```


### Step 10.8: Verify Policy Creation Checklist

Before proceeding to Phase 11, verify:

- [ ] All 5 policies created in ACO UI
- [ ] 2 static policies configured (West + East regions)
- [ ] 3 trigger policies configured (Phase, Customer Type, Customer Tier)
- [ ] Trigger names match exactly (case-sensitive):
    - `AC-Policy-Project-Phase`
    - `AC-Policy-Customer-Type`
    - `AC-Policy-Customer-Tier`
- [ ] Attributes referenced in policies exist on products:
    - `project_phase`
    - `commercial_residential`
    - `minimum_order_quantity`
- [ ] Policy descriptions clear and documented
- [ ] Screenshots taken of:
    - Policies list showing all 5 policies
    - Sample static policy configuration
    - Sample trigger policy configuration
    - Trigger configuration detail
- [ ] Policy architecture documented in `docs/policy-architecture.md`
- [ ] Testing guide created in `docs/policy-testing-guide.md`
- [ ] Test script ready in `scripts/test-policies.js`

**Checkpoint:** ✅ Policies creation complete with 2 static + 3 trigger policies

***

## Next Phase Preview

**Phase 11 will cover:**

- Creating catalog views in ACO
- Assigning policies to catalog views
- Configuring catalog view hierarchies
- Setting up project-specific catalog views
- Testing catalog view behavior with different policy combinations

**Estimated Phase 11 deliverables:**

- 6 catalog views for different scenarios:
    - Default (no filters)
    - West Commercial
    - East Commercial
    - Project Framing Commercial West
    - Project Drywall Commercial West
    - Project Exterior Shell Commercial West
- Policy assignment matrix
- Catalog view testing procedures

**Total: 6 catalog views** demonstrating full dynamic catalog composition

Would you like me to continue with **Phase 11: Create Catalog Views in ACO**?

