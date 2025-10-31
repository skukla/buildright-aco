<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# BuildRight Solutions: Complete Step-by-Step Implementation Guide (Continued)

## Phase 9: Configure Customer Groups in Adobe Commerce


***

```
<a name="phase-9-customer-groups"></a>
```


## Phase 9: Configure Customer Groups in Adobe Commerce

### Overview

Configure customer groups in Adobe Commerce to map to ACO price books, create sample customer accounts for testing, and establish the connection between customer groups and pricing tiers. This phase bridges Commerce's customer management with ACO's pricing structure.

### Step 9.1: Review Customer Groups Created in Phase 2

**Verify existing customer groups from Phase 2.2:**

1. Navigate to Adobe Commerce Admin
2. Go to **Customers > Customer Groups**
3. Verify you see these groups already created:
    - General (system default - ID: 1)
    - NOT LOGGED IN (system default - ID: 0)
    - Wholesale (system default - ID: 2)
    - Retailer (system default - ID: 3)
    - Commercial Contractors - Tier 1 (Custom - ID: 4)
    - Commercial Contractors - Tier 2 (Custom - ID: 5)
    - Residential Builders (Custom - ID: 6)
    - Retail Customers (Custom - ID: 7)

**Total: 8 customer groups** (4 system default + 4 custom)

**If custom groups were not created, create them now following Phase 2.2 instructions.**

### Step 9.2: Extend Customer Group Mapping

**We need to differentiate by region. Create additional regional groups:**

#### Create Regional Customer Groups

**Group 5: Commercial Contractors - Tier 1 (West)**

1. Navigate to **Customers > Customer Groups**
2. Click **Add New Customer Group**
3. **Group Name:** `Commercial Contractors - Tier 1 (West)`
4. **Tax Class:** `Retail Customer`
5. Click **Save Customer Group**
6. **Note the Customer Group ID** (e.g., ID: 8)

**Group 6: Commercial Contractors - Tier 1 (East)**

1. Click **Add New Customer Group**
2. **Group Name:** `Commercial Contractors - Tier 1 (East)`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID (e.g., ID: 9)

**Group 7: Commercial Contractors - Tier 2 (West)**

1. Click **Add New Customer Group**
2. **Group Name:** `Commercial Contractors - Tier 2 (West)`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID (e.g., ID: 10)

**Group 8: Commercial Contractors - Tier 2 (East)**

1. Click **Add New Customer Group**
2. **Group Name:** `Commercial Contractors - Tier 2 (East)`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID (e.g., ID: 11)

**Group 9: Residential Builders (West)**

1. Click **Add New Customer Group**
2. **Group Name:** `Residential Builders (West)`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID (e.g., ID: 12)

**Group 10: Residential Builders (East)**

1. Click **Add New Customer Group**
2. **Group Name:** `Residential Builders (East)`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID (e.g., ID: 13)

**Group 11: Retail Customers (West)**

1. Click **Add New Customer Group**
2. **Group Name:** `Retail Customers (West)`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID (e.g., ID: 14)

**Group 12: Retail Customers (East)**

1. Click **Add New Customer Group**
2. **Group Name:** `Retail Customers (East)`
3. **Tax Class:** `Retail Customer`
4. Click **Save Customer Group**
5. Note the Customer Group ID (e.g., ID: 15)

**Screenshot checkpoint:** Take screenshot showing all customer groups

### Step 9.3: Document Customer Group to Price Book Mapping

**Update the mapping document from Phase 6.7:**

**Create/Update file: `docs/customer-group-price-book-mapping.md`**

```markdown
# Customer Group to Price Book Mapping - Updated

## Overview
This document maps Adobe Commerce Customer Groups to ACO Price Books with regional differentiation.

## Complete Mapping Table

| Customer Group Name | Group ID | ACO Price Book ID | Region | Division | Tier | Website |
|---------------------|----------|-------------------|--------|----------|------|---------|
| Commercial Contractors - Tier 1 (West) | 8 | west-commercial-gc-tier1 | West | Commercial | Tier 1 | Main |
| Commercial Contractors - Tier 1 (East) | 9 | east-commercial-gc-tier1 | East | Commercial | Tier 1 | Main |
| Commercial Contractors - Tier 2 (West) | 10 | west-commercial-contract | West | Commercial | Tier 2 | Main |
| Commercial Contractors - Tier 2 (East) | 11 | east-commercial-contract | East | Commercial | Tier 2 | Main |
| Residential Builders (West) | 12 | west-residential-contract | West | Residential | Standard | Main |
| Residential Builders (East) | 13 | east-residential-contract | East | Residential | Standard | Main |
| Retail Customers (West) | 14 | west-region-retail | West | Retail | N/A | Main |
| Retail Customers (East) | 15 | east-region-retail | East | Retail | N/A | Main |

## System Default Groups (Not Used for ACO Pricing)

| Customer Group Name | Group ID | Usage |
|---------------------|----------|-------|
| General | 1 | Default for logged-in users without assignment |
| NOT LOGGED IN | 0 | Anonymous visitors (use us-base-retail) |
| Wholesale | 2 | Legacy - not used |
| Retailer | 3 | Legacy - not used |

## Price Inheritance Examples

### Example 1: West Commercial GC Tier 1 Customer
**Customer Group:** Commercial Contractors - Tier 1 (West) [ID: 8]
**Price Book:** west-commercial-gc-tier1

**Price Lookup Path:**
1. west-commercial-gc-tier1 (Tier 1 pricing with 15% discount + volume tiers)
2. → west-commercial-contract (if product price not found at Tier 1)
3. → west-region-contract (if not found at Commercial level)
4. → us-base-contract (if not found at Regional level)

**Pricing Breakdown for 2x4x8 SPF Stud:**
- Base: $8.99
- West regional (+3%): $9.26
- Commercial + Tier 1 discount (-15%): $7.87
- Volume tier 100+ (-3% additional): $7.63
- Volume tier 500+ (-8% additional): $7.25

### Example 2: East Residential Builder
**Customer Group:** Residential Builders (East) [ID: 13]
**Price Book:** east-residential-contract

**Price Lookup Path:**
1. east-residential-contract (5% residential discount)
2. → east-region-contract (if not found)
3. → us-base-contract (if not found)

**Pricing Breakdown for 2x4x8 SPF Stud:**
- Base: $8.99
- East regional (no markup): $8.99
- Residential discount (-5%): $8.54

### Example 3: West Retail Customer
**Customer Group:** Retail Customers (West) [ID: 14]
**Price Book:** west-region-retail

**Price Lookup Path:**
1. west-region-retail (inherits from us-base-retail)
2. → us-base-retail (+20% over contract pricing)

**Pricing Breakdown for 2x4x8 SPF Stud:**
- Base contract: $8.99
- Retail markup (+20%): $10.79

## Integration Architecture

### Customer Assignment Flow
```

Customer Registration/Admin Creation
↓
Commerce Customer Record Created
↓
Assigned to Customer Group (Group ID)
↓
Group ID Stored in customer_entity.group_id
↓
Frontend/API reads Group ID
↓
Lookup table maps Group ID → Price Book ID
↓
Price Book ID sent to ACO Merchandising API
↓
ACO returns prices for that Price Book
↓
Displayed to customer

```

### API Integration Points

**Adobe Commerce Side:**
- Customer Group assignment: `customer_entity` table, `group_id` column
- REST API endpoint: `GET /rest/V1/customers/:customerId`
- Response includes: `group_id`

**ACO Side:**
- Price Book parameter: HTTP header or query parameter
- Merchandising API: `GET /products` with price book context
- Returns: Products with prices from specified price book

### Frontend Implementation

**Storefront Session:**
```

// Customer logs in → session stores group_id
session.customer.group_id = 8;

// Map to price book
const priceBookMapping = {
8: 'west-commercial-gc-tier1',
9: 'east-commercial-gc-tier1',
10: 'west-commercial-contract',
11: 'east-commercial-contract',
12: 'west-residential-contract',
13: 'east-residential-contract',
14: 'west-region-retail',
15: 'east-region-retail',
0: 'us-base-retail' // Not logged in
};

const priceBookId = priceBookMapping[session.customer.group_id];

// Send to ACO Merchandising API
fetch('https://merchandising-api.adobe.io/products', {
headers: {
'X-Price-Book-Id': priceBookId
}
});

```

## Customer Service Guidelines

### Assigning Customers to Groups

**Tier 1 GC Criteria:**
- Annual volume > $10M
- Credit approved
- Reference check passed
- Requires executive approval

**Tier 2 GC Criteria:**
- Annual volume $2M-$10M
- Credit approved
- Standard application

**Residential Builder Criteria:**
- Valid contractor license
- Tax ID provided
- Annual volume < $5M

**Retail Criteria:**
- No special qualifications
- Walk-in or online customers
- Limited discount eligibility

### Regional Assignment

**West Region:**
- Business address in: CA, NV, AZ, OR, WA, CO
- Shipping primarily to western states
- Western RDC as primary fulfillment

**East Region:**
- Business address in: NC, SC, GA, FL, VA, TN, AL
- Shipping primarily to eastern states
- Eastern RDC as primary fulfillment
```


### Step 9.4: Create Sample Customer Accounts

**Create test customers for each group to enable pricing testing:**

#### Customer 1: West Tier 1 GC

1. Navigate to **Customers > All Customers**
2. Click **Add New Customer**
3. **Account Information tab:**
    - **Associate to Website:** Main Website
    - **Customer Group:** `Commercial Contractors - Tier 1 (West)`
    - **First Name:** `John`
    - **Last Name:** `Anderson`
    - **Email:** `john.anderson@apexconstruction.example`
    - **Send Welcome Email:** No (for demo)
4. **Addresses tab:**
    - Click **Add New Address**
    - **First Name:** `John`
    - **Last Name:** `Anderson`
    - **Company:** `Apex Construction Group`
    - **Street Address:** `1234 Construction Way`
    - **City:** `Phoenix`
    - **State/Province:** `Arizona`
    - **ZIP/Postal Code:** `85001`
    - **Country:** `United States`
    - **Telephone:** `602-555-0100`
    - Check: **Use as default billing address**
    - Check: **Use as default shipping address**
5. Click **Save Customer**
6. **Note the Customer ID** (e.g., 1001)

#### Customer 2: East Tier 1 GC

1. Click **Add New Customer**
2. **Account Information:**
    - **Customer Group:** `Commercial Contractors - Tier 1 (East)`
    - **First Name:** `Sarah`
    - **Last Name:** `Mitchell`
    - **Email:** `sarah.mitchell@buildrightpro.example`
3. **Addresses:**
    - **Company:** `BuildRight Pro LLC`
    - **Street Address:** `5678 Builder Boulevard`
    - **City:** `Charlotte`
    - **State:** `North Carolina`
    - **ZIP:** `28202`
4. Click **Save Customer**

#### Customer 3: West Residential Builder

1. Click **Add New Customer**
2. **Account Information:**
    - **Customer Group:** `Residential Builders (West)`
    - **First Name:** `Michael`
    - **Last Name:** `Chen`
    - **Email:** `michael.chen@chenbuilders.example`
3. **Addresses:**
    - **Company:** `Chen Custom Homes`
    - **Street Address:** `9012 Residential Circle`
    - **City:** `Denver`
    - **State:** `Colorado`
    - **ZIP:** `80202`
4. Click **Save Customer**

#### Customer 4: East Residential Builder

1. Click **Add New Customer**
2. **Account Information:**
    - **Customer Group:** `Residential Builders (East)`
    - **First Name:** `Emily`
    - **Last Name:** `Rodriguez`
    - **Email:** `emily.rodriguez@southernhomes.example`
3. **Addresses:**
    - **Company:** `Southern Custom Homes`
    - **Street Address:** `3456 Builder Lane`
    - **City:** `Atlanta`
    - **State:** `Georgia`
    - **ZIP:** `30303`
4. Click **Save Customer**

#### Customer 5: West Retail Customer

1. Click **Add New Customer**
2. **Account Information:**
    - **Customer Group:** `Retail Customers (West)`
    - **First Name:** `David`
    - **Last Name:** `Thompson`
    - **Email:** `david.thompson@email.example`
3. **Addresses:**
    - **Company:** (leave blank)
    - **Street Address:** `7890 Homeowner Street`
    - **City:** `San Diego`
    - **State:** `California`
    - **ZIP:** `92101`
4. Click **Save Customer**

#### Customer 6: East Retail Customer

1. Click **Add New Customer**
2. **Account Information:**
    - **Customer Group:** `Retail Customers (East)`
    - **First Name:** `Lisa`
    - **Last Name:** `Williams`
    - **Email:** `lisa.williams@email.example`
3. **Addresses:**
    - **Company:** (leave blank)
    - **Street Address:** `2468 Consumer Avenue`
    - **City:** `Raleigh`
    - **State:** `North Carolina`
    - **ZIP:** `27601`
4. Click **Save Customer**

**Screenshot checkpoint:** Take screenshot of customers list showing all 6 test customers

### Step 9.5: Export Customer Data for Reference

**Create a customer reference file:**

**Create file: `docs/test-customers.md`**

```markdown
# Test Customer Accounts

## Overview
Sample customer accounts for testing customer group-based pricing in BuildRight Solutions demo.

## Customer List

### 1. John Anderson - West Tier 1 GC
- **Email:** john.anderson@apexconstruction.example
- **Company:** Apex Construction Group
- **Customer Group:** Commercial Contractors - Tier 1 (West)
- **Group ID:** 8
- **Price Book:** west-commercial-gc-tier1
- **Location:** Phoenix, AZ
- **Annual Volume:** $15M
- **Expected Pricing:** Base -15% + volume tiers
- **Test Scenario:** Large orders with volume discounts

### 2. Sarah Mitchell - East Tier 1 GC
- **Email:** sarah.mitchell@buildrightpro.example
- **Company:** BuildRight Pro LLC
- **Customer Group:** Commercial Contractors - Tier 1 (East)
- **Group ID:** 9
- **Price Book:** east-commercial-gc-tier1
- **Location:** Charlotte, NC
- **Annual Volume:** $12M
- **Expected Pricing:** Base -15% + volume tiers
- **Test Scenario:** Large multi-site projects

### 3. Michael Chen - West Residential Builder
- **Email:** michael.chen@chenbuilders.example
- **Company:** Chen Custom Homes
- **Customer Group:** Residential Builders (West)
- **Group ID:** 12
- **Price Book:** west-residential-contract
- **Location:** Denver, CO
- **Annual Volume:** $3M
- **Expected Pricing:** Base -5% (West region +3% on lumber)
- **Test Scenario:** Custom home builds

### 4. Emily Rodriguez - East Residential Builder
- **Email:** emily.rodriguez@southernhomes.example
- **Company:** Southern Custom Homes
- **Customer Group:** Residential Builders (East)
- **Group ID:** 13
- **Price Book:** east-residential-contract
- **Location:** Atlanta, GA
- **Annual Volume:** $2.5M
- **Expected Pricing:** Base -5%
- **Test Scenario:** Residential developments

### 5. David Thompson - West Retail Customer
- **Email:** david.thompson@email.example
- **Company:** (None - Individual)
- **Customer Group:** Retail Customers (West)
- **Group ID:** 14
- **Price Book:** west-region-retail
- **Location:** San Diego, CA
- **Annual Volume:** N/A
- **Expected Pricing:** Base +20% (retail markup)
- **Test Scenario:** DIY home improvement projects

### 6. Lisa Williams - East Retail Customer
- **Email:** lisa.williams@email.example
- **Company:** (None - Individual)
- **Customer Group:** Retail Customers (East)
- **Group ID:** 15
- **Price Book:** east-region-retail
- **Location:** Raleigh, NC
- **Annual Volume:** N/A
- **Expected Pricing:** Base +20% (retail markup)
- **Test Scenario:** Small home repair purchases

## Login Credentials

**For Demo Purposes - All Accounts:**
- Username: [email address above]
- Password: `BuildRight2025!`

**Note:** In production, customers would set their own passwords during registration.

## Testing Matrix

| Customer | Product | Qty | Expected Price | Test Purpose |
|----------|---------|-----|----------------|--------------|
| John Anderson | LBR-2X4-8-SPF-STD | 1 | $7.87 | Tier 1 base pricing |
| John Anderson | LBR-2X4-8-SPF-STD | 100 | $7.63 | Volume tier 1 |
| John Anderson | LBR-2X4-8-SPF-STD | 500 | $7.25 | Volume tier 2 |
| Sarah Mitchell | LBR-2X4-8-SPF-STD | 1 | $7.64 | East Tier 1 (no regional markup) |
| Michael Chen | LBR-2X4-8-SPF-STD | 1 | $8.78 | West residential (with +3% lumber) |
| Emily Rodriguez | LBR-2X4-8-SPF-STD | 1 | $8.54 | East residential |
| David Thompson | LBR-2X4-8-SPF-STD | 1 | $10.79 | West retail |
| Lisa Williams | LBR-2X4-8-SPF-STD | 1 | $10.79 | East retail |

## Customer Attributes for Advanced Features

### Custom Attributes (If Needed)

**project_type** - For project-based catalog filtering
- Possible values: NEW_CONSTRUCTION, REMODEL, COMMERCIAL, RESIDENTIAL

**preferred_delivery_time** - For scheduling
- Possible values: MORNING, AFTERNOON, EVENING

**requires_liftgate** - For delivery equipment
- Type: Boolean
- Default: false

**tax_exempt** - For government/institutional customers
- Type: Boolean
- Default: false

**credit_limit** - For B2B credit terms
- Type: Decimal
- Default: 50000.00
```


### Step 9.6: Configure Customer Group Permissions

**Set up what each group can access:**

#### Set Price Display Rules

1. Navigate to **Stores > Configuration**
2. Expand **Customers** → **Customer Configuration**
3. Expand **Create New Account Options**
4. **Default Group:** `General`
5. **Default Group for Tax Calculation:** `Retail Customer`
6. Expand **Name and Address Options**
7. **Show Telephone:** `Required`
8. **Show Company:** `Optional` (Required for commercial groups)
9. Click **Save Config**

#### Configure B2B Features (If B2B Module Enabled)

**Note:** Adobe Commerce B2B is a separate module. If available:

1. Navigate to **Stores > Configuration**
2. Expand **General** → **B2B Features**
3. **Enable Company:** `Yes`
4. **Enable Shared Catalog:** `Yes`
5. **Enable Quick Order:** `Yes` (for commercial customers)
6. **Enable Requisition List:** `Yes` (for project-based ordering)
7. Click **Save Config**

**If B2B module is not available, skip this section.**

### Step 9.7: Create Customer Group-Specific Catalog Rules

**Create catalog price rules (optional, for additional promotions):**

#### Rule 1: Tier 1 GC Spring Promotion

1. Navigate to **Marketing > Promotions > Catalog Price Rules**
2. Click **Add New Rule**
3. **Rule Information:**
    - **Rule Name:** `Tier 1 GC Spring Lumber Promotion`
    - **Description:** `Additional 5% off lumber for Tier 1 GCs during spring`
    - **Status:** `Active`
    - **Websites:** `Main Website`
    - **Customer Groups:**
        - Select: `Commercial Contractors - Tier 1 (West)`
        - Select: `Commercial Contractors - Tier 1 (East)`
    - **From Date:** `03/01/2025`
    - **To Date:** `05/31/2025`
    - **Priority:** `0`
4. **Conditions tab:**
    - Click **Add** (+)
    - **Condition:** `Category`
    - **is:** `Structural Materials`
5. **Actions tab:**
    - **Apply:** `By Percentage of Original`
    - **Discount Amount:** `5`
    - **Discard Subsequent Rules:** `No`
6. Click **Save and Apply**

**Screenshot checkpoint:** Take screenshot of catalog price rule

### Step 9.8: Test Customer Group Assignment via API

**Create script to verify customer group functionality:**

**Create file: `scripts/test-customer-groups.js`**

```javascript
require('dotenv').config();
const axios = require('axios');

const COMMERCE_BASE_URL = process.env.COMMERCE_BASE_URL;
const ADMIN_TOKEN = process.env.COMMERCE_ADMIN_TOKEN;

async function testCustomerGroups() {
  console.log('=== Testing Customer Group Functionality ===\n');
  
  // Test customer emails (from our created customers)
  const testCustomers = [
    { email: 'john.anderson@apexconstruction.example', expectedGroup: 8, expectedPriceBook: 'west-commercial-gc-tier1' },
    { email: 'sarah.mitchell@buildrightpro.example', expectedGroup: 9, expectedPriceBook: 'east-commercial-gc-tier1' },
    { email: 'michael.chen@chenbuilders.example', expectedGroup: 12, expectedPriceBook: 'west-residential-contract' },
    { email: 'emily.rodriguez@southernhomes.example', expectedGroup: 13, expectedPriceBook: 'east-residential-contract' },
    { email: 'david.thompson@email.example', expectedGroup: 14, expectedPriceBook: 'west-region-retail' },
    { email: 'lisa.williams@email.example', expectedGroup: 15, expectedPriceBook: 'east-region-retail' }
  ];
  
  // Price book mapping
  const groupToPriceBook = {
    8: 'west-commercial-gc-tier1',
    9: 'east-commercial-gc-tier1',
    10: 'west-commercial-contract',
    11: 'east-commercial-contract',
    12: 'west-residential-contract',
    13: 'east-residential-contract',
    14: 'west-region-retail',
    15: 'east-region-retail',
    0: 'us-base-retail'
  };
  
  console.log('Customer Group to Price Book Mapping:');
  console.log('='.repeat(80));
  Object.keys(groupToPriceBook).forEach(groupId => {
    console.log(`  Group ${groupId} → ${groupToPriceBook[groupId]}`);
  });
  console.log('');
  
  console.log('Testing Customer Lookups:');
  console.log('='.repeat(80));
  
  for (const customer of testCustomers) {
    try {
      // Search for customer by email
      const searchResponse = await axios.get(
        `${COMMERCE_BASE_URL}/rest/V1/customers/search`,
        {
          params: {
            'searchCriteria[filterGroups][0][filters][0][field]': 'email',
            'searchCriteria[filterGroups][0][filters][0][value]': customer.email,
            'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq'
          },
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`
          }
        }
      );
      
      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        const customerData = searchResponse.data.items[0];
        const groupId = customerData.group_id;
        const priceBook = groupToPriceBook[groupId];
        const match = groupId == customer.expectedGroup ? '✓' : '✗';
        
        console.log(`${match} ${customer.email}`);
        console.log(`    Group ID: ${groupId} (expected: ${customer.expectedGroup})`);
        console.log(`    Price Book: ${priceBook}`);
        console.log(`    Customer ID: ${customerData.id}`);
        console.log('');
      } else {
        console.log(`✗ ${customer.email} - NOT FOUND`);
        console.log('');
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`✗ ${customer.email} - ERROR: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('=== Test Complete ===');
  console.log('\nNote: This test verifies customer group assignments.');
  console.log('Actual price lookups will be tested in Phase 12.');
}

// Run test
testCustomerGroups().catch(console.error);
```

**Run the test:**

```bash
node scripts/test-customer-groups.js
```

**Expected output:**

```
=== Testing Customer Group Functionality ===

Customer Group to Price Book Mapping:
================================================================================
  Group 0 → us-base-retail
  Group 8 → west-commercial-gc-tier1
  Group 9 → east-commercial-gc-tier1
  Group 10 → west-commercial-contract
  Group 11 → east-commercial-contract
  Group 12 → west-residential-contract
  Group 13 → east-residential-contract
  Group 14 → west-region-retail
  Group 15 → east-region-retail

Testing Customer Lookups:
================================================================================
✓ john.anderson@apexconstruction.example
    Group ID: 8 (expected: 8)
    Price Book: west-commercial-gc-tier1
    Customer ID: 1001

✓ sarah.mitchell@buildrightpro.example
    Group ID: 9 (expected: 9)
    Price Book: east-commercial-gc-tier1
    Customer ID: 1002

✓ michael.chen@chenbuilders.example
    Group ID: 12 (expected: 12)
    Price Book: west-residential-contract
    Customer ID: 1003

✓ emily.rodriguez@southernhomes.example
    Group ID: 13 (expected: 13)
    Price Book: east-residential-contract
    Customer ID: 1004

✓ david.thompson@email.example
    Group ID: 14 (expected: 14)
    Price Book: west-region-retail
    Customer ID: 1005

✓ lisa.williams@email.example
    Group ID: 15 (expected: 15)
    Price Book: east-region-retail
    Customer ID: 1006

=== Test Complete ===

Note: This test verifies customer group assignments.
Actual price lookups will be tested in Phase 12.
```


### Step 9.9: Configure Customer Registration

**Set up customer registration to capture group assignment criteria:**

#### Create Custom Registration Form Fields

1. Navigate to **Stores > Attributes > Customer**
2. Click **Add New Attribute**
3. **Attribute Properties:**
    - **Attribute Code:** `business_type`
    - **Input Type:** `Dropdown`
    - **Values Required:** `Yes`
    - **Default Label:** `Business Type`
4. **Storefront Properties:**
    - **Show on Storefront:** `Yes`
    - **Sort Order:** `10`
    - **Forms to Use In:**
        - Check: `Customer Registration`
        - Check: `Customer Account Edit`
5. **Manage Options (Values):**
    - Add option: `Commercial GC - Tier 1`
    - Add option: `Commercial GC - Tier 2`
    - Add option: `Residential Builder`
    - Add option: `Retail/DIY`
6. Click **Save Attribute**

#### Create Region Selection Field

1. Click **Add New Attribute**
2. **Attribute Properties:**
    - **Attribute Code:** `service_region`
    - **Input Type:** `Dropdown`
    - **Values Required:** `Yes`
    - **Default Label:** `Service Region`
3. **Manage Options:**
    - Add option: `Western Region (CA, NV, AZ, OR, WA, CO)`
    - Add option: `Eastern Region (NC, SC, GA, FL, VA, TN, AL)`
4. **Forms to Use In:**
    - Check: `Customer Registration`
5. Click **Save Attribute**

#### Create Annual Volume Field

1. Click **Add New Attribute**
2. **Attribute Properties:**
    - **Attribute Code:** `annual_volume`
    - **Input Type:** `Text Field`
    - **Default Label:** `Estimated Annual Purchase Volume`
3. **Validation Rules:**
    - **Input Validation:** `Decimal Number`
4. **Forms to Use In:**
    - Check: `Customer Registration` (only for business types)
5. Click **Save Attribute**

### Step 9.10: Create Customer Group Assignment Automation

**Set up automatic group assignment based on registration data:**

**Create file: `scripts/auto-assign-customer-groups.js`**

```javascript
require('dotenv').config();
const axios = require('axios');

const COMMERCE_BASE_URL = process.env.COMMERCE_BASE_URL;
const ADMIN_TOKEN = process.env.COMMERCE_ADMIN_TOKEN;

// Business rules for group assignment
function determineCustomerGroup(businessType, serviceRegion, annualVolume) {
  // Parse annual volume
  const volume = parseFloat(annualVolume) || 0;
  
  // Determine tier and region
  let tier = 'retail';
  let region = serviceRegion.includes('Western') ? 'west' : 'east';
  
  if (businessType === 'Commercial GC - Tier 1' || volume >= 10000000) {
    tier = 'commercial-tier1';
  } else if (businessType === 'Commercial GC - Tier 2' || (businessType.includes('Commercial') && volume >= 2000000)) {
    tier = 'commercial-tier2';
  } else if (businessType === 'Residential Builder') {
    tier = 'residential';
  } else {
    tier = 'retail';
  }
  
  // Map to group ID
  const groupMapping = {
    'west-commercial-tier1': 8,
    'east-commercial-tier1': 9,
    'west-commercial-tier2': 10,
    'east-commercial-tier2': 11,
    'west-residential': 12,
    'east-residential': 13,
    'west-retail': 14,
    'east-retail': 15
  };
  
  const key = `${region}-${tier}`;
  return groupMapping[key] || 1; // Default to General if not found
}

async function autoAssignCustomerGroup(customerId, businessType, serviceRegion, annualVolume) {
  console.log(`\n=== Auto-Assigning Group for Customer ${customerId} ===`);
  console.log(`Business Type: ${businessType}`);
  console.log(`Service Region: ${serviceRegion}`);
  console.log(`Annual Volume: $${annualVolume}`);
  
  const groupId = determineCustomerGroup(businessType, serviceRegion, annualVolume);
  
  try {
    // Get customer data
    const customerResponse = await axios.get(
      `${COMMERCE_BASE_URL}/rest/V1/customers/${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );
    
    const customer = customerResponse.data;
    customer.group_id = groupId;
    
    // Update customer
    await axios.put(
      `${COMMERCE_BASE_URL}/rest/V1/customers/${customerId}`,
      { customer: customer },
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✓ Assigned to Group ID: ${groupId}`);
    return groupId;
    
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    throw error;
  }
}

// Test with sample data
async function testAutoAssignment() {
  console.log('=== Testing Auto-Assignment Logic ===\n');
  
  const testCases = [
    {
      businessType: 'Commercial GC - Tier 1',
      serviceRegion: 'Western Region (CA, NV, AZ, OR, WA, CO)',
      annualVolume: '15000000',
      expectedGroup: 8
    },
    {
      businessType: 'Residential Builder',
      serviceRegion: 'Eastern Region (NC, SC, GA, FL, VA, TN, AL)',
      annualVolume: '3000000',
      expectedGroup: 13
    },
    {
      businessType: 'Retail/DIY',
      serviceRegion: 'Western Region (CA, NV, AZ, OR, WA, CO)',
      annualVolume: '0',
      expectedGroup: 14
    }
  ];
  
  testCases.forEach((test, idx) => {
    const result = determineCustomerGroup(test.businessType, test.serviceRegion, test.annualVolume);
    const match = result === test.expectedGroup ? '✓' : '✗';
    console.log(`${match} Test ${idx + 1}: ${test.businessType} + ${test.serviceRegion.split(' ')[0]}`);
    console.log(`   Result: Group ${result} (expected: ${test.expectedGroup})`);
  });
}

testAutoAssignment();

module.exports = { autoAssignCustomerGroup, determineCustomerGroup };
```

**Run the test:**

```bash
node scripts/auto-assign-customer-groups.js
```


### Step 9.11: Document Customer Onboarding Process

**Create file: `docs/customer-onboarding-process.md`**

```markdown
# Customer Onboarding Process

## Overview
Step-by-step process for onboarding new customers to BuildRight Solutions with proper customer group assignment.

## Process Flow

### Step 1: Customer Registration

**Online Registration:**
1. Customer visits BuildRight Solutions website
2. Clicks "Create Account" or "Register"
3. Fills out registration form:
   - First Name, Last Name
   - Email Address
   - Company Name (required for business customers)
   - Business Type (dropdown)
   - Service Region (dropdown)
   - Estimated Annual Volume (text field)
   - Business Address
   - Tax ID (for business customers)
4. Submits registration
5. System validates information
6. System auto-assigns to appropriate customer group based on business rules

**Admin Registration (Phone/Walk-in):**
1. Customer service representative creates account via Admin
2. Navigates to Customers > All Customers > Add New Customer
3. Fills out all required information
4. Manually selects appropriate customer group
5. Saves customer account
6. Sends welcome email with login credentials

### Step 2: Account Verification

**For Business Customers:**
1. Customer service team reviews:
   - Business license verification
   - Tax ID verification
   - Credit application (for net terms)
   - Trade references (for Tier 1 GCs)
2. Documents uploaded to customer account
3. Approval workflow:
   - Tier 1 GC: Requires executive approval
   - Tier 2 GC: Requires manager approval
   - Residential: Standard verification
4. Upon approval, group assignment confirmed/adjusted

**For Retail Customers:**
1. Email verification required
2. No additional verification needed
3. Account active immediately

### Step 3: Pricing Confirmation

1. Customer receives welcome email with:
   - Account details
   - Assigned customer group
   - Pricing tier information
   - Discount percentages
   - Volume tier thresholds
2. First order: Customer service reviews pricing with customer
3. Pricing questions directed to assigned account manager

### Step 4: Training & Resources

**Tier 1 & Tier 2 GCs:**
- Dedicated account manager assigned
- Training on:
  - Online ordering system
  - Project management tools
  - Saved lists and quick reorder
  - Job site delivery scheduling
  - Volume pricing calculator
- Quarterly business reviews scheduled

**Residential Builders:**
- Account rep assigned (shared among multiple customers)
- Training materials:
  - Quick start guide
  - Video tutorials
  - Product catalogs
- Support: Email and phone

**Retail Customers:**
- Self-service support
- Knowledge base articles
- General customer service line

## Business Rules for Group Assignment

### Automatic Assignment Logic

```

IF annual_volume >= \$10M OR business_type == "Commercial GC - Tier 1"
THEN assign to [region]-commercial-tier1

ELSE IF annual_volume >= \$2M OR business_type == "Commercial GC - Tier 2"
THEN assign to [region]-commercial-tier2

ELSE IF business_type == "Residential Builder"
THEN assign to [region]-residential

ELSE
THEN assign to [region]-retail

```

### Manual Review Triggers

The following scenarios trigger manual review:
- Annual volume > $50M (enterprise account)
- Government/institutional customer
- Multi-location business
- International shipping required
- Special payment terms requested
- Credit limit > $500K

## Account Manager Assignment

### Tier 1 GCs
- Dedicated account manager
- Direct phone line
- 4-hour response time SLA
- Quarterly business reviews
- Custom pricing negotiation available

### Tier 2 GCs
- Shared account manager (1:20 ratio)
- Email and phone support
- 24-hour response time SLA
- Annual business reviews
- Standard pricing with volume tiers

### Residential Builders
- Customer service team
- Email support
- 48-hour response time
- Self-service tools

### Retail Customers
- General customer service
- Phone/email/chat support
- No dedicated representative
```


### Step 9.12: Final Customer Groups Verification Checklist

Before proceeding to Phase 10, verify:

- [ ] All 8 regional customer groups created (4 West + 4 East)
- [ ] Customer group IDs documented in mapping table
- [ ] 6 test customer accounts created (2 Tier 1, 2 Residential, 2 Retail)
- [ ] Customer addresses include regional information
- [ ] Customer group to price book mapping documented
- [ ] Custom customer attributes created (business_type, service_region)
- [ ] Auto-assignment logic tested and validated
- [ ] API test script runs successfully
- [ ] Screenshots taken of:
    - Customer groups list
    - Sample customer account with group assignment
    - Customer attributes configuration
- [ ] All documentation files saved in `docs/` directory

**Checkpoint:** ✅ Customer Groups configuration complete with 8 regional groups + 6 test customers

***

## Next Phase Preview

**Phase 10 will cover:**

- Creating trigger-based policies in ACO
- Creating static policies for regional filtering
- Configuring policy inheritance and precedence
- Setting up project-phase policies for dynamic bundles
- Testing policy application

**Estimated Phase 10 deliverables:**

- 3 trigger-based policies (Project Phase, Customer Type, Customer Tier)
- 2 static policies (West Region Products, East Region Products)
- Policy testing scripts
- **Total: 5 policies** enabling dynamic catalog composition

Would you like me to continue with **Phase 10: Create Policies in ACO**?

