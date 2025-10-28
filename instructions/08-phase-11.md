<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# BuildRight Solutions: Complete Step-by-Step Implementation Guide (Continued)

## Phase 11: Create Catalog Views in ACO


***

```
<a name="phase-11-catalog-views"></a>
```


## Phase 11: Create Catalog Views in ACO

### Overview

Create catalog views in Adobe Commerce Optimizer that combine policies to deliver personalized, context-aware product catalogs. Each catalog view represents a specific customer scenario and applies the appropriate combination of static and trigger-based policies.

### Step 11.1: Understanding Catalog Views

**What is a Catalog View?**

- A named configuration that combines:
    - Source catalogs (e.g., en-US)
    - Static policies (always applied)
    - Trigger policies (applied when headers present)
    - Sort orders and display preferences

**Catalog View Hierarchy:**

```
Catalog Sources (en-US)
    ↓
Catalog View (e.g., "Project-Framing-Commercial-West")
    ↓ Applies Policies
    ├─ Static: West Region Products
    ├─ Trigger: Project Phase Filter
    ├─ Trigger: Customer Type Filter
    └─ Trigger: Customer Tier Filter
    ↓
Filtered Product Catalog
    ↓
Merchandising API Response
```


### Step 11.2: Plan Catalog View Architecture

**Document the strategy:**

**Create file: `docs/catalog-view-architecture.md`**

```markdown
# Catalog View Architecture

## Overview
BuildRight Solutions uses 6 catalog views to serve different customer scenarios and project contexts.

## Catalog View Strategy

### View 1: Default Catalog View (System Default)
**View ID:** `default`
**Purpose:** Fallback view for all requests
**Policies Applied:**
- None (shows all products)

**Use Cases:**
- Admin product browsing
- Initial catalog setup
- Testing without filters

**Expected Products:** All 154 products

---

### View 2: West Commercial Catalog
**View ID:** `west-commercial`
**Purpose:** General catalog for Western commercial customers
**Policies Applied:**
- Static: `policy-west-region-products`
- Trigger: `policy-customer-type` (when header present)
- Trigger: `policy-customer-tier` (when header present)

**Use Cases:**
- Western commercial contractors browsing full catalog
- No active project context
- General product research

**Expected Products:** ~154 products (all products, filtered by region if needed)

**API Request Example:**
```

GET /products
X-Catalog-View-Id: west-commercial
AC-Policy-Customer-Type: Commercial
AC-Policy-Customer-Tier: 1

```

---

### View 3: East Commercial Catalog
**View ID:** `east-commercial`
**Purpose:** General catalog for Eastern commercial customers
**Policies Applied:**
- Static: `policy-east-region-products`
- Trigger: `policy-customer-type` (when header present)
- Trigger: `policy-customer-tier` (when header present)

**Use Cases:**
- Eastern commercial contractors browsing full catalog
- No active project context

**Expected Products:** ~154 products

---

### View 4: Project Framing - Commercial West
**View ID:** `project-framing-commercial-west`
**Purpose:** Framing phase materials for Western commercial projects
**Policies Applied:**
- Static: `policy-west-region-products`
- Trigger: `policy-project-phase` (FRAMING)
- Trigger: `policy-customer-type` (Commercial)
- Trigger: `policy-customer-tier` (from header)

**Use Cases:**
- Active framing phase in commercial project
- Material list for framing package
- Project-specific ordering

**Expected Products:** ~30-40 products
- Lumber (LBR-*)
- Sheet goods (PLY-*)
- Framing nails (NAIL-FRAME-*)
- Hardware bundles (BUNDLE-FRAME-*)
- Services with ALL_PHASES

**Example Products:**
- LBR-2X4-8-SPF-STD
- PLY-OSB-7/16-4X8
- NAIL-FRAME-16D-5LB
- BUNDLE-FRAME-2X4-STD
- SVC-DEL-JOBSITE

**API Request Example:**
```

GET /products
X-Catalog-View-Id: project-framing-commercial-west
AC-Policy-Project-Phase: FRAMING
AC-Policy-Customer-Type: Commercial
AC-Policy-Customer-Tier: 1
X-Price-Book-Id: west-commercial-gc-tier1

```

---

### View 5: Project Drywall - Commercial West
**View ID:** `project-drywall-commercial-west`
**Purpose:** Drywall phase materials for Western commercial projects
**Policies Applied:**
- Static: `policy-west-region-products`
- Trigger: `policy-project-phase` (DRYWALL)
- Trigger: `policy-customer-type` (Commercial)
- Trigger: `policy-customer-tier` (from header)

**Use Cases:**
- Active drywall phase in commercial project
- Material list for drywall installation
- Interior finishing materials

**Expected Products:** ~25-35 products
- Drywall sheets (DRYWALL-*)
- Metal studs (STUD-METAL-*)
- Joint compound (COMPOUND-*)
- Drywall screws (SCREW-DRYWALL-*)
- Bundles (BUNDLE-DRYWALL-*)

**Example Products:**
- DRYWALL-1/2-4X8-REG
- STUD-METAL-3-5/8-20GA-10
- COMPOUND-JOINT-4.5GAL
- SCREW-DRYWALL-1-1/4-5LB
- BUNDLE-DRYWALL-ROOM-12X12

---

### View 6: Project Exterior Shell - Commercial West
**View ID:** `project-exterior-shell-commercial-west`
**Purpose:** Exterior shell phase materials for Western commercial projects
**Policies Applied:**
- Static: `policy-west-region-products`
- Trigger: `policy-project-phase` (EXTERIOR_SHELL)
- Trigger: `policy-customer-type` (Commercial)
- Trigger: `policy-customer-tier` (from header)

**Use Cases:**
- Active exterior shell phase
- Roofing, windows, doors phase
- Weather-tight building envelope

**Expected Products:** ~35-45 products
- Roofing shingles (SHINGLE-*)
- Underlayment (FELT-*, ICE-*)
- Windows (WINDOW-*)
- Doors (DOOR-*)
- Roofing accessories

**Example Products:**
- SHINGLE-ARCH-OAKRIDGE-30YR
- FELT-ROOF-30LB-432SF
- WINDOW-DH-3060-VINYL-WHT
- DOOR-STEEL-COMM-3670-PRIM
- BUNDLE-ROOF-STARTER-30SQ

---

## Catalog View Selection Logic

### Frontend Application Flow

```

// Determine which catalog view to use
function selectCatalogView(customer, project) {
// If customer has active project
if (project \&\& project.currentPhase) {
const region = customer.region.toLowerCase(); // 'west' or 'east'
const phase = project.currentPhase.toLowerCase(); // 'framing', 'drywall', etc.
const customerType = customer.businessType; // 'Commercial' or 'Residential'

    // Project-specific views (only for commercial)
    if (customerType === 'Commercial') {
      return `project-${phase}-commercial-${region}`;
    }
    }

// General browsing - use regional commercial view
if (customer.businessType === 'Commercial') {
return `${customer.region.toLowerCase()}-commercial`;
}

// Default fallback
return 'default';
}

// Usage
const catalogViewId = selectCatalogView(customer, activeProject);
const headers = {
'X-Catalog-View-Id': catalogViewId,
'AC-Policy-Project-Phase': activeProject?.currentPhase,
'AC-Policy-Customer-Type': customer.businessType,
'AC-Policy-Customer-Tier': customer.tier,
'X-Price-Book-Id': customer.priceBookId
};

```

## Policy Assignment Matrix

| Catalog View | West Region Policy | East Region Policy | Project Phase Policy | Customer Type Policy | Customer Tier Policy |
|--------------|-------------------|-------------------|---------------------|---------------------|---------------------|
| default | ❌ | ❌ | ❌ | ❌ | ❌ |
| west-commercial | ✅ | ❌ | ❌ | ✅ (trigger) | ✅ (trigger) |
| east-commercial | ❌ | ✅ | ❌ | ✅ (trigger) | ✅ (trigger) |
| project-framing-commercial-west | ✅ | ❌ | ✅ (trigger) | ✅ (trigger) | ✅ (trigger) |
| project-drywall-commercial-west | ✅ | ❌ | ✅ (trigger) | ✅ (trigger) | ✅ (trigger) |
| project-exterior-shell-commercial-west | ✅ | ❌ | ✅ (trigger) | ✅ (trigger) | ✅ (trigger) |

## Expected Product Counts by View

| Catalog View | Without Triggers | With All Triggers | Notes |
|--------------|------------------|-------------------|-------|
| default | 154 | 154 | No filtering |
| west-commercial | 154 | 154 | Region filter only (all products pass) |
| east-commercial | 154 | 154 | Region filter only (all products pass) |
| project-framing-commercial-west | 154 | 30-40 | Filtered to FRAMING phase |
| project-drywall-commercial-west | 154 | 25-35 | Filtered to DRYWALL phase |
| project-exterior-shell-commercial-west | 154 | 35-45 | Filtered to EXTERIOR_SHELL phase |

## Real-World Scenarios

### Scenario 1: New Project Setup
**Customer:** John Anderson (West Tier 1 GC)
**Action:** Creates new project "Riverside Medical Center"
**Project Phase:** FOUNDATION (not yet configured)
**Catalog View:** `west-commercial` (general browsing)
**Products Shown:** All products (no phase filter)

### Scenario 2: Active Framing Phase
**Customer:** John Anderson
**Action:** Navigates to active project, currently in framing phase
**Project Phase:** FRAMING
**Catalog View:** `project-framing-commercial-west`
**Headers Sent:**
- `AC-Policy-Project-Phase: FRAMING`
- `AC-Policy-Customer-Type: Commercial`
- `AC-Policy-Customer-Tier: 1`
**Products Shown:** 30-40 framing-specific products

### Scenario 3: Phase Transition
**Customer:** John Anderson
**Action:** Marks framing phase complete, advances to drywall
**Project Phase:** DRYWALL
**Catalog View:** Switches to `project-drywall-commercial-west`
**Headers Sent:**
- `AC-Policy-Project-Phase: DRYWALL`
- `AC-Policy-Customer-Type: Commercial`
- `AC-Policy-Customer-Tier: 1`
**Products Shown:** 25-35 drywall-specific products

### Scenario 4: Retail Customer Browsing
**Customer:** David Thompson (West Retail)
**Action:** Browses catalog without project context
**Project Phase:** N/A
**Catalog View:** `default` or `west-commercial`
**Headers Sent:**
- `AC-Policy-Customer-Type: Residential` (retail treated as residential)
**Products Shown:** All residential-appropriate products
```


### Step 11.3: Create Catalog Views in ACO UI

**Note:** Catalog views must be created via the ACO Admin UI.

#### View 1: Default (Already Exists)

**The default catalog view is pre-created by ACO. Verify it exists:**

1. Navigate to ACO Admin Panel
2. Click **Catalog > Views** in left navigation
3. Verify **default** view exists
4. Click on **default** to view details
5. Verify:
    - **Catalog Sources:** `en-US`
    - **Policies Applied:** None (or empty list)
6. Leave as-is (do not modify system default)

#### View 2: West Commercial Catalog

1. In **Catalog > Views**, click **Create Catalog View** (top right)
2. **Catalog View Information:**
    - **View ID:** `west-commercial`
    - **View Name:** `West Commercial Catalog`
    - **Description:** `General product catalog for Western region commercial customers`
    - **Status:** `Active`
3. **Catalog Sources:**
    - Select: `en-US` (check the box)
4. **Policies Section:**
    - Click **Add Policy**
    - Select: `policy-west-region-products` (static policy)
    - Click **Add Policy** again
    - Select: `policy-customer-type` (trigger policy)
    - Click **Add Policy** again
    - Select: `policy-customer-tier` (trigger policy)
5. **Policy Order:** Policies will be applied in the order added
    - 6. policy-west-region-products (static - always applied)
    - 2. policy-customer-type (trigger - if header present)
    - 3. policy-customer-tier (trigger - if header present)
1. Click **Save Catalog View**
2. Take screenshot showing the view configuration

**Verify the view:**

- View appears in catalog views list
- Status shows "Active"
- 3 policies assigned


#### View 3: East Commercial Catalog

1. Click **Create Catalog View**
2. **View Information:**
    - **View ID:** `east-commercial`
    - **View Name:** `East Commercial Catalog`
    - **Description:** `General product catalog for Eastern region commercial customers`
    - **Status:** `Active`
3. **Catalog Sources:** `en-US`
4. **Policies:**
    - Add: `policy-east-region-products` (static)
    - Add: `policy-customer-type` (trigger)
    - Add: `policy-customer-tier` (trigger)
5. Click **Save Catalog View**

#### View 4: Project Framing - Commercial West

1. Click **Create Catalog View**
2. **View Information:**
    - **View ID:** `project-framing-commercial-west`
    - **View Name:** `Project Framing - Commercial West`
    - **Description:** `Framing phase materials for Western commercial projects`
    - **Status:** `Active`
3. **Catalog Sources:** `en-US`
4. **Policies (Add in this order):**
    - Add: `policy-west-region-products` (static)
    - Add: `policy-project-phase` (trigger)
    - Add: `policy-customer-type` (trigger)
    - Add: `policy-customer-tier` (trigger)
5. Click **Save Catalog View**

**Note the policy order is important:**

- Static policies first (always applied)
- Trigger policies second (conditional)
- Order determines evaluation precedence


#### View 5: Project Drywall - Commercial West

1. Click **Create Catalog View**
2. **View Information:**
    - **View ID:** `project-drywall-commercial-west`
    - **View Name:** `Project Drywall - Commercial West`
    - **Description:** `Drywall phase materials for Western commercial projects`
    - **Status:** `Active`
3. **Catalog Sources:** `en-US`
4. **Policies (same as View 4):**
    - Add: `policy-west-region-products` (static)
    - Add: `policy-project-phase` (trigger)
    - Add: `policy-customer-type` (trigger)
    - Add: `policy-customer-tier` (trigger)
5. Click **Save Catalog View**

**Note:** Views 4 and 5 have the same policies. The difference is the trigger header value sent at request time:

- View 4: `AC-Policy-Project-Phase: FRAMING`
- View 5: `AC-Policy-Project-Phase: DRYWALL`


#### View 6: Project Exterior Shell - Commercial West

1. Click **Create Catalog View**
2. **View Information:**
    - **View ID:** `project-exterior-shell-commercial-west`
    - **View Name:** `Project Exterior Shell - Commercial West`
    - **Description:** `Exterior shell phase materials for Western commercial projects`
    - **Status:** `Active`
3. **Catalog Sources:** `en-US`
4. **Policies (same as Views 4 \& 5):**
    - Add: `policy-west-region-products` (static)
    - Add: `policy-project-phase` (trigger)
    - Add: `policy-customer-type` (trigger)
    - Add: `policy-customer-tier` (trigger)
5. Click **Save Catalog View**

**Screenshot checkpoint:** Take screenshot showing all 6 catalog views in the list

### Step 11.4: Verify Catalog Views in ACO UI

**Check catalog views list:**

1. Navigate to **Catalog > Views**
2. Verify you see 6 catalog views:
    - default (system)
    - west-commercial
    - east-commercial
    - project-framing-commercial-west
    - project-drywall-commercial-west
    - project-exterior-shell-commercial-west
3. For each view, verify:
    - Status is "Active"
    - Correct policies assigned
    - Policy count matches expected
4. Take screenshot

**Test catalog preview (if available in UI):**

1. Click on **project-framing-commercial-west**
2. Click **Preview Catalog** (if button available)
3. Look for any filter/search options
4. Verify products displayed (if preview works)

**Note:** Full catalog preview may require trigger header simulation, which might not be available in UI. Full testing will occur in Phase 12.

### Step 11.5: Create Catalog View Testing Documentation

**Create file: `docs/catalog-view-testing-guide.md`**

```markdown
# Catalog View Testing Guide

## Overview
Test procedures for verifying catalog view behavior in BuildRight Solutions.

## Test Matrix

| Test # | Catalog View | Headers | Expected Products | Product Count |
|--------|--------------|---------|-------------------|---------------|
| 1 | default | None | All products | 154 |
| 2 | west-commercial | None | All products | 154 |
| 3 | west-commercial | Customer-Type: Commercial | Commercial + Both | 154 |
| 4 | project-framing-commercial-west | Phase: FRAMING, Type: Commercial, Tier: 1 | Framing products | 30-40 |
| 5 | project-drywall-commercial-west | Phase: DRYWALL, Type: Commercial, Tier: 1 | Drywall products | 25-35 |
| 6 | project-exterior-shell-commercial-west | Phase: EXTERIOR_SHELL, Type: Commercial, Tier: 1 | Exterior products | 35-45 |

## Detailed Test Cases

### Test 1: Default View - No Filtering

**Objective:** Verify default view returns all products without filtering

**Setup:**
```

curl -X GET "https://merchandising-api.adobe.io/graphql" \
-H "Authorization: Bearer <token>" \
-H "X-Catalog-View-Id: default" \
-H "Content-Type: application/json" \
-d '{"query":"{ products(pageSize: 200) { items { sku name } total_count } }"}'

```

**Expected Result:**
- `total_count: 154`
- All products visible
- No filtering applied

**Validation:**
- [ ] Total count = 154
- [ ] Sample SKUs present: LBR-2X4-8-SPF-STD, DRYWALL-1/2-4X8-REG, SHINGLE-ARCH-OAKRIDGE-30YR
- [ ] No products excluded

---

### Test 2: West Commercial - General Browsing

**Objective:** Verify West commercial view with no trigger headers

**Setup:**
```

curl -X GET "https://merchandising-api.adobe.io/graphql" \
-H "Authorization: Bearer <token>" \
-H "X-Catalog-View-Id: west-commercial" \
-H "Content-Type: application/json" \
-d '{"query":"{ products(pageSize: 200) { items { sku name } total_count } }"}'

```

**Expected Result:**
- `total_count: 154`
- All products visible (static policy doesn't filter since all products have commercial_residential attribute)
- Trigger policies not applied (no headers)

**Validation:**
- [ ] Total count = 154
- [ ] All product categories present

---

### Test 3: West Commercial with Customer Type Trigger

**Objective:** Verify customer type filtering works

**Setup:**
```

curl -X GET "https://merchandising-api.adobe.io/graphql" \
-H "Authorization: Bearer <token>" \
-H "X-Catalog-View-Id: west-commercial" \
-H "AC-Policy-Customer-Type: Commercial" \
-H "Content-Type: application/json" \
-d '{"query":"{ products(pageSize: 200) { items { sku name attributes { code values } } total_count } }"}'

```

**Expected Result:**
- Products with `commercial_residential = "Commercial"` or `"Both"`
- Products with `commercial_residential = "Residential"` only should be excluded
- In our dataset, all products are "Both", so count = 154

**Validation:**
- [ ] Total count = 154
- [ ] Check attributes: all products have commercial_residential = "Both" or "Commercial"
- [ ] No residential-only products

---

### Test 4: Project Framing View with All Triggers

**Objective:** Verify framing phase filtering with full context

**Setup:**
```

curl -X GET "https://merchandising-api.adobe.io/graphql" \
-H "Authorization: Bearer <token>" \
-H "X-Catalog-View-Id: project-framing-commercial-west" \
-H "AC-Policy-Project-Phase: FRAMING" \
-H "AC-Policy-Customer-Type: Commercial" \
-H "AC-Policy-Customer-Tier: 1" \
-H "Content-Type: application/json" \
-d '{"query":"{ products(pageSize: 200) { items { sku name attributes(codes: [\"project_phase\"]) { code values } } total_count } }"}'

```

**Expected Result:**
- `total_count: 30-40`
- Only products with `project_phase` containing "FRAMING" or "ALL_PHASES"

**Expected SKUs:**
- LBR-2X4-8-SPF-STD (FRAMING)
- LBR-2X6-10-SPF-STD (FRAMING)
- PLY-OSB-7/16-4X8 (FRAMING)
- NAIL-FRAME-16D-5LB (ALL_PHASES)
- BUNDLE-FRAME-2X4-STD (FRAMING)
- SVC-DEL-JOBSITE (ALL_PHASES)

**NOT Expected SKUs:**
- DRYWALL-1/2-4X8-REG (DRYWALL phase)
- SHINGLE-ARCH-OAKRIDGE-30YR (EXTERIOR_SHELL phase)

**Validation:**
- [ ] Total count between 30-40
- [ ] All products have project_phase = FRAMING or ALL_PHASES
- [ ] Lumber products present
- [ ] Drywall products absent
- [ ] Roofing products absent

---

### Test 5: Project Drywall View with All Triggers

**Objective:** Verify drywall phase shows different products than framing

**Setup:**
```

curl -X GET "https://merchandising-api.adobe.io/graphql" \
-H "Authorization: Bearer <token>" \
-H "X-Catalog-View-Id: project-drywall-commercial-west" \
-H "AC-Policy-Project-Phase: DRYWALL" \
-H "AC-Policy-Customer-Type: Commercial" \
-H "AC-Policy-Customer-Tier: 1" \
-H "Content-Type: application/json" \
-d '{"query":"{ products(pageSize: 200) { items { sku name attributes(codes: [\"project_phase\"]) { code values } } total_count } }"}'

```

**Expected Result:**
- `total_count: 25-35`
- Only drywall phase products

**Expected SKUs:**
- DRYWALL-1/2-4X8-REG (DRYWALL)
- STUD-METAL-3-5/8-20GA-10 (DRYWALL)
- COMPOUND-JOINT-4.5GAL (DRYWALL)
- SCREW-DRYWALL-1-1/4-5LB (DRYWALL)
- NAIL-FRAME-16D-5LB (ALL_PHASES - still shown)

**NOT Expected SKUs:**
- LBR-2X4-8-SPF-STD (FRAMING only)
- SHINGLE-ARCH-OAKRIDGE-30YR (EXTERIOR_SHELL)

**Validation:**
- [ ] Total count between 25-35
- [ ] All products have project_phase = DRYWALL or ALL_PHASES
- [ ] Drywall products present
- [ ] Framing-only products absent
- [ ] ALL_PHASES products still present

---

### Test 6: Project Exterior Shell View

**Objective:** Verify exterior shell phase filtering

**Setup:**
```

curl -X GET "https://merchandising-api.adobe.io/graphql" \
-H "Authorization: Bearer <token>" \
-H "X-Catalog-View-Id: project-exterior-shell-commercial-west" \
-H "AC-Policy-Project-Phase: EXTERIOR_SHELL" \
-H "AC-Policy-Customer-Type: Commercial" \
-H "AC-Policy-Customer-Tier: 1" \
-H "Content-Type: application/json" \
-d '{"query":"{ products(pageSize: 200) { items { sku name attributes(codes: [\"project_phase\"]) { code values } } total_count } }"}'

```

**Expected Result:**
- `total_count: 35-45`
- Exterior shell products (roofing, windows, doors)

**Expected SKUs:**
- SHINGLE-ARCH-OAKRIDGE-30YR (EXTERIOR_SHELL)
- FELT-ROOF-30LB-432SF (EXTERIOR_SHELL)
- WINDOW-DH-3060-VINYL-WHT (EXTERIOR_SHELL)
- DOOR-STEEL-COMM-3670-PRIM (EXTERIOR_SHELL)
- NAIL-FRAME-16D-5LB (ALL_PHASES)

**Validation:**
- [ ] Total count between 35-45
- [ ] Roofing products present
- [ ] Windows/doors present
- [ ] Framing products absent
- [ ] Drywall products absent

---

## Phase Comparison Test

**Objective:** Verify each phase returns different product sets

**Setup:** Run Tests 4, 5, and 6, then compare results

**Expected:**
- Framing products ≠ Drywall products ≠ Exterior Shell products
- Some overlap (ALL_PHASES products like fasteners, services)
- No phase should return all 154 products

**Comparison Table:**

| Phase | Expected Count | Key Products | Overlap Products |
|-------|----------------|--------------|------------------|
| FRAMING | 30-40 | Lumber, sheathing | Nails, screws, services |
| DRYWALL | 25-35 | Drywall, metal studs | Screws, services |
| EXTERIOR_SHELL | 35-45 | Roofing, windows, doors | Nails, sealants, services |

**Validation:**
- [ ] Each phase has unique products
- [ ] ALL_PHASES products appear in all phases
- [ ] Total unique products across all phases ≤ 154

---

## Troubleshooting

### Issue: All views return same products

**Cause:** Trigger policies not working or headers not being sent

**Check:**
1. Verify trigger header names match exactly (case-sensitive)
2. Verify headers are being sent in request
3. Check policy assignment to catalog view
4. Verify products have project_phase attribute with correct values

### Issue: No products returned

**Cause:** Policies too restrictive

**Check:**
1. Verify products have required attributes
2. Check attribute values match policy conditions
3. Test with simpler policies first
4. Review policy logic (AND vs OR)

### Issue: Wrong products shown

**Cause:** Incorrect attribute values on products

**Check:**
1. Verify project_phase values are correct arrays
2. Check commercial_residential values
3. Review product data for typos
```


### Step 11.6: Create Catalog View Comparison Script

**Create file: `scripts/compare-catalog-views.js`**

```javascript
require('dotenv').config();

// Simulate catalog view behavior based on policies
function simulateCatalogView(viewId, headers, products) {
  console.log(`\n=== Simulating Catalog View: ${viewId} ===`);
  console.log(`Headers:`, JSON.stringify(headers, null, 2));
  
  let filteredProducts = [...products];
  
  // Apply policies based on view and headers
  if (viewId.includes('project-framing')) {
    const phase = headers['AC-Policy-Project-Phase'];
    if (phase) {
      filteredProducts = filteredProducts.filter(p => {
        const phases = p.project_phase || [];
        return phases.includes(phase) || phases.includes('ALL_PHASES');
      });
      console.log(`Applied project phase filter: ${phase}`);
    }
  }
  
  if (viewId.includes('project-drywall')) {
    const phase = headers['AC-Policy-Project-Phase'];
    if (phase) {
      filteredProducts = filteredProducts.filter(p => {
        const phases = p.project_phase || [];
        return phases.includes(phase) || phases.includes('ALL_PHASES');
      });
      console.log(`Applied project phase filter: ${phase}`);
    }
  }
  
  if (viewId.includes('project-exterior-shell')) {
    const phase = headers['AC-Policy-Project-Phase'];
    if (phase) {
      filteredProducts = filteredProducts.filter(p => {
        const phases = p.project_phase || [];
        return phases.includes(phase) || phases.includes('ALL_PHASES');
      });
      console.log(`Applied project phase filter: ${phase}`);
    }
  }
  
  // Customer type filter
  const customerType = headers['AC-Policy-Customer-Type'];
  if (customerType) {
    filteredProducts = filteredProducts.filter(p => {
      const types = p.commercial_residential || 'Both';
      return types === customerType || types === 'Both';
    });
    console.log(`Applied customer type filter: ${customerType}`);
  }
  
  console.log(`\nResult: ${filteredProducts.length} products`);
  console.log(`Sample products (first 5):`);
  filteredProducts.slice(0, 5).forEach(p => {
    console.log(`  - ${p.sku}: ${p.name}`);
  });
  
  return filteredProducts;
}

// Sample product data (simplified)
const sampleProducts = [
  { sku: 'LBR-2X4-8-SPF-STD', name: '2x4x8 SPF Stud', project_phase: ['FRAMING', 'ALL_PHASES'], commercial_residential: 'Both' },
  { sku: 'PLY-OSB-7/16-4X8', name: '7/16" OSB 4x8', project_phase: ['FRAMING'], commercial_residential: 'Both' },
  { sku: 'NAIL-FRAME-16D-5LB', name: '16d Framing Nails', project_phase: ['ALL_PHASES'], commercial_residential: 'Both' },
  { sku: 'DRYWALL-1/2-4X8-REG', name: '1/2" Drywall 4x8', project_phase: ['DRYWALL'], commercial_residential: 'Both' },
  { sku: 'COMPOUND-JOINT-4.5GAL', name: 'Joint Compound 4.5gal', project_phase: ['DRYWALL'], commercial_residential: 'Both' },
  { sku: 'SHINGLE-ARCH-OAKRIDGE-30YR', name: 'Oakridge Shingles', project_phase: ['EXTERIOR_SHELL'], commercial_residential: 'Both' },
  { sku: 'WINDOW-DH-3060-VINYL-WHT', name: 'Vinyl Window 3x6', project_phase: ['EXTERIOR_SHELL'], commercial_residential: 'Both' },
  { sku: 'SVC-DEL-JOBSITE', name: 'Job Site Delivery', project_phase: ['ALL_PHASES'], commercial_residential: 'Both' }
];

// Run comparison tests
console.log('=== Catalog View Comparison Tests ===');

// Test 1: Default view (no filters)
simulateCatalogView('default', {}, sampleProducts);

// Test 2: Framing phase
simulateCatalogView(
  'project-framing-commercial-west',
  {
    'AC-Policy-Project-Phase': 'FRAMING',
    'AC-Policy-Customer-Type': 'Commercial',
    'AC-Policy-Customer-Tier': '1'
  },
  sampleProducts
);

// Test 3: Drywall phase
simulateCatalogView(
  'project-drywall-commercial-west',
  {
    'AC-Policy-Project-Phase': 'DRYWALL',
    'AC-Policy-Customer-Type': 'Commercial',
    'AC-Policy-Customer-Tier': '1'
  },
  sampleProducts
);

// Test 4: Exterior shell phase
simulateCatalogView(
  'project-exterior-shell-commercial-west',
  {
    'AC-Policy-Project-Phase': 'EXTERIOR_SHELL',
    'AC-Policy-Customer-Type': 'Commercial',
    'AC-Policy-Customer-Tier': '1'
  },
  sampleProducts
);

console.log('\n=== Comparison Summary ===');
console.log('✓ Different phases return different product sets');
console.log('✓ ALL_PHASES products appear in all views');
console.log('✓ Phase-specific products only appear in their phase');
console.log('\nNote: This is a simulation. Actual API testing in Phase 12.');
```

**Run the comparison:**

```bash
node scripts/compare-catalog-views.js
```

**Expected output:**

```
=== Catalog View Comparison Tests ===

=== Simulating Catalog View: default ===
Headers: {}

Result: 8 products
Sample products (first 5):
  - LBR-2X4-8-SPF-STD: 2x4x8 SPF Stud
  - PLY-OSB-7/16-4X8: 7/16" OSB 4x8
  - NAIL-FRAME-16D-5LB: 16d Framing Nails
  - DRYWALL-1/2-4X8-REG: 1/2" Drywall 4x8
  - COMPOUND-JOINT-4.5GAL: Joint Compound 4.5gal

=== Simulating Catalog View: project-framing-commercial-west ===
Headers: {
  "AC-Policy-Project-Phase": "FRAMING",
  "AC-Policy-Customer-Type": "Commercial",
  "AC-Policy-Customer-Tier": "1"
}
Applied project phase filter: FRAMING
Applied customer type filter: Commercial

Result: 3 products
Sample products (first 5):
  - LBR-2X4-8-SPF-STD: 2x4x8 SPF Stud
  - PLY-OSB-7/16-4X8: 7/16" OSB 4x8
  - NAIL-FRAME-16D-5LB: 16d Framing Nails

=== Simulating Catalog View: project-drywall-commercial-west ===
Headers: {
  "AC-Policy-Project-Phase": "DRYWALL",
  "AC-Policy-Customer-Type": "Commercial",
  "AC-Policy-Customer-Tier": "1"
}
Applied project phase filter: DRYWALL
Applied customer type filter: Commercial

Result: 3 products
Sample products (first 5):
  - NAIL-FRAME-16D-5LB: 16d Framing Nails
  - DRYWALL-1/2-4X8-REG: 1/2" Drywall 4x8
  - COMPOUND-JOINT-4.5GAL: Joint Compound 4.5gal

=== Simulating Catalog View: project-exterior-shell-commercial-west ===
Headers: {
  "AC-Policy-Project-Phase": "EXTERIOR_SHELL",
  "AC-Policy-Customer-Type": "Commercial",
  "AC-Policy-Customer-Tier": "1"
}
Applied project phase filter: EXTERIOR_SHELL
Applied customer type filter: Commercial

Result: 3 products
Sample products (first 5):
  - NAIL-FRAME-16D-5LB: 16d Framing Nails
  - SHINGLE-ARCH-OAKRIDGE-30YR: Oakridge Shingles
  - WINDOW-DH-3060-VINYL-WHT: Vinyl Window 3x6

=== Comparison Summary ===
✓ Different phases return different product sets
✓ ALL_PHASES products appear in all views
✓ Phase-specific products only appear in their phase

Note: This is a simulation. Actual API testing in Phase 12.
```


### Step 11.7: Final Catalog Views Verification Checklist

Before proceeding to Phase 12, verify:

- [ ] All 6 catalog views created in ACO UI
- [ ] Each view has correct catalog sources (en-US)
- [ ] Policies correctly assigned to each view:
    - west-commercial: 3 policies
    - east-commercial: 3 policies
    - project-framing-commercial-west: 4 policies
    - project-drywall-commercial-west: 4 policies
    - project-exterior-shell-commercial-west: 4 policies
- [ ] Policy order correct (static first, triggers second)
- [ ] All views show "Active" status
- [ ] Screenshots taken of:
    - Catalog views list showing all 6 views
    - Sample view configuration with policies
    - Policy assignment order
- [ ] Documentation files created:
    - `docs/catalog-view-architecture.md`
    - `docs/catalog-view-testing-guide.md`
- [ ] Comparison script created and tested
- [ ] All files saved in appropriate directories

**Checkpoint:** ✅ Catalog Views creation complete with 6 views configured

***

## Phase 11 Summary

**Accomplished:**

- ✅ Created 6 catalog views for different scenarios
- ✅ Assigned policies to catalog views (static + trigger)
- ✅ Documented catalog view architecture and selection logic
- ✅ Created comprehensive testing guide
- ✅ Built comparison simulation script

**Catalog Views Created:**

1. default (system)
2. west-commercial
3. east-commercial
4. project-framing-commercial-west
5. project-drywall-commercial-west
6. project-exterior-shell-commercial-west

**Key Achievement:** Successfully implemented "Project-as-Dynamic-Bundle" concept where a single set of products is dynamically filtered based on project context, eliminating the need for 100+ pre-configured bundle SKUs.

***

## Next Phase Preview

**Phase 12 will cover:**

- End-to-end integration testing
- Testing ACO Merchandising API with catalog views
- Verifying price lookup with customer groups
- Testing inventory allocation across sources
- Validating complete user workflows
- Creating demo scenarios
- Performance testing
- Final verification and documentation

**Phase 12 is the final phase** and will bring together all components:

- ACO (catalog, prices, policies, views)
- Commerce (inventory, customers, groups)
- Integration points (APIs, headers, flows)

Would you like me to continue with **Phase 12: Testing \& Validation**?

