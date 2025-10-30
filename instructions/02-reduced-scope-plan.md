<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# BuildRight Solutions: Reduced Scope Implementation Guide

## Overview of Scope Reduction

I'll maintain all the innovative concepts from the comprehensive brief but scale down to a **manageable demonstration dataset** while introducing **Project-as-Dynamic-Bundle** using Adobe Commerce Optimizer's trigger-based policies.

***

## Reduced Scope Dataset Specifications

### Inventory Sources: 18 → **6 Sources**

**Regional Distribution Centers (2):**

1. **Western RDC** - Sacramento, CA
2. **Eastern RDC** - Charlotte, NC

**Regional Warehouses (3):**
3. **Phoenix Metro Warehouse** - Phoenix, AZ
4. **Denver Warehouse** - Denver, CO
5. **Atlanta Metro Warehouse** - Atlanta, GA

**Virtual Sources (1):**
6. **Drop Shipper - Premium Window Systems** (Virtual)

**Stock Configuration (2 Stocks):**

- **Stock 1: Western Sales Channel** (Sources: Western RDC, Phoenix, Denver)
- **Stock 2: Eastern Sales Channel** (Sources: Eastern RDC, Atlanta)

***

### Price Books: 54+ → **10 Hierarchical Price Books** (Updated in Step 2)

**Note:** Original plan specified 4 flat price books. During implementation (Step 2), this evolved to **10 hierarchical price books across 3 levels** to better demonstrate ACO's hierarchical pricing capabilities.

**Implemented Hierarchical Structure:**

**Level 1 (Base with Currency):**
1. **US-Retail** - Standard retail pricing (currency: USD)
2. **US-Contract** - Contract base pricing (currency: USD)

**Level 2 (Customer Segments):**
3. **Retail-Consumer** - Consumer segment pricing (parent: US-Retail)
4. **Contract-Commercial** - Commercial segment pricing (parent: US-Contract)
5. **Contract-Residential** - Residential segment pricing (parent: US-Contract)
6. **Contract-Pro** - Professional contractor pricing (parent: US-Contract)

**Level 3 (Volume Tiers):**
7. **Commercial-Tier1** - High-volume commercial (parent: Contract-Commercial)
8. **Commercial-Tier2** - Standard commercial (parent: Contract-Commercial)
9. **Residential-Builder** - Production builder pricing (parent: Contract-Residential)
10. **Pro-Specialty** - Specialty trade pricing (parent: Contract-Pro)

**Customer Group Mapping:**
- Each **Company** (Adobe Commerce B2B company entity) is assigned to one price book
- Hierarchical structure allows price inheritance from parent books
- Enables flexible 3-tier pricing strategy

***

### B2B Company & Location Structure

BuildRight Solutions sells to **Companies**, and each Company has multiple **Locations** (physical storefronts, branches, or job sites).

**Organizational Hierarchy:**

```
BuildRight Solutions (Supplier)
    ↓
Companies (Business Accounts)
    ↓
Locations (Branches/Stores/Sites)
    ↓
Buyers (Individual users at each location)
```

**Example Structure:**

**Company:** Ace Hardware Corporation
- **Business Type:** US-Retail (0% discount)
- **Locations:**
  - Ace Hardware - Phoenix Downtown (buyers: 3 users)
  - Ace Hardware - Scottsdale (buyers: 2 users)
  - Ace Hardware - Tempe (buyers: 2 users)

**Company:** Southwest Builders LLC
- **Business Type:** US-Contractor (5% discount)
- **Locations:**
  - Southwest Builders - Main Office (buyers: 5 users)
  - Southwest Builders - North Yard (buyers: 2 users)

**Company:** Metro Commercial Construction
- **Business Type:** US-Commercial (10% discount)
- **Locations:**
  - Metro Commercial - HQ (buyers: 8 users)
  - Metro Commercial - Project Site Alpha (buyers: 3 users)
  - Metro Commercial - Project Site Beta (buyers: 3 users)

**Adobe Commerce B2B Mapping:**
- **Company** = Adobe Commerce B2B Company entity
- **Location** = Company Team (sub-organization within company)
- **Buyer** = Company User (assigned to one or more teams)
- **Price Book** = Assigned at Company level, inherited by all locations/teams

**Demo Dataset:**
- **8 Companies** (2 per business type)
- **20 Total Locations** (2-4 locations per company)
- **50 Total Buyers** (2-5 buyers per location)

***

### Product Categories: 17 → **5 Major Categories**

1. **Structural Materials**
    - Lumber \& Engineered Wood
    - Concrete \& Cement Products
2. **Framing \& Drywall**
    - Metal Studs \& Track
    - Drywall Sheets
    - Joint Compound \& Accessories
3. **Roofing Materials**
    - Asphalt Shingles
    - Underlayment \& Accessories
    - Roof Ventilation
4. **Windows \& Doors**
    - Residential Windows
    - Entry Doors
    - Door Hardware
5. **Fasteners \& Hardware**
    - Nails
    - Screws
    - Construction Adhesives

***

### Product Count: 150,000+ → **120 Products**

**Product Distribution:**

- **60 Simple Products** (12 per category)
- **20 Configurable Products** (4 per category × 3-5 variants each)
- **15 Bundle Products** (3 per category)
- **10 Service Products** (delivery, fabrication, installation)
- **15 Project-Triggered Dynamic Bundles** (explained below)

**Total Including Variants:** ~120 base products + 60 variants = **180 total SKUs**

***

### Metadata Attributes: 45 → **20 Attributes**

#### Required Standard Attributes (5)

1. `sku` - TEXT
2. `name` - TEXT
3. `description` - TEXT
4. `shortDescription` - TEXT
5. `price` - DECIMAL

#### Custom Attributes (15)

**Product Classification (3):**
6. `product_category` - TEXT (filterable, searchable)
7. `csi_masterformat_number` - TEXT (searchable)
8. `brand` - TEXT (filterable, sortable, searchable)

**Physical Properties (4):**
9. `unit_of_measure` - TEXT (EA, LF, SF, BOX, BUNDLE, PALLET)
10. `weight_lbs` - DECIMAL (sortable)
11. `length_inches` - DECIMAL
12. `coverage_per_unit` - DECIMAL

**Material \& Compliance (4):**
13. `material_type` - TEXT (filterable)
14. `fire_rating` - TEXT (filterable)
15. `leed_eligible` - BOOLEAN (filterable)
16. `commercial_residential` - TEXT (filterable)

**Ordering \& Inventory (4):**
17. `minimum_order_quantity` - INTEGER
18. `units_per_package` - INTEGER
19. `special_order_item` - BOOLEAN
20. `project_phase` - TEXT (filterable) **[NEW for Project Bundles]**

***

## Projects as Dynamic Bundles Using Triggers

### Concept Overview

Instead of creating static bundle products, we'll use **Adobe Commerce Optimizer's trigger-based policies** to dynamically compose "Project Bundles" based on:

- HTTP headers sent with API requests
- Project metadata (type, phase, specifications)
- Customer segment and permissions

This demonstrates the **true power of composable catalogs** where products are assembled on-demand rather than pre-configured.

***

### Project Entity Structure (Metadata Only)

Projects exist as **external entities** (not in catalog) but drive catalog composition:

```json
{
  "projectId": "PROJ-2025-001",
  "projectName": "Riverside Office Complex",
  "projectType": "COMMERCIAL_OFFICE",
  "currentPhase": "FRAMING",
  "customerTier": "GC-TIER1",
  "region": "WEST",
  "estimatedValue": 500000,
  "priceBookId": "west-commercial-gc-tier1"
}
```


### Project Phases Mapped to Product Attributes

We add a new attribute **`project_phase`** to products indicating which construction phase they belong to:

**Phase Values:**

- `FOUNDATION` - Concrete, forming, rebar
- `FRAMING` - Lumber, fasteners, structural materials
- `EXTERIOR_SHELL` - Roofing, windows, doors, siding
- `ROUGH_IN` - Electrical, plumbing, HVAC (not in reduced scope)
- `DRYWALL` - Drywall, metal studs, joint compound
- `FINISHING` - Paint, trim, flooring (not in reduced scope)
- `ALL_PHASES` - Items used across multiple phases (fasteners, tools)

**Example Product with Phase:**

```json
{
  "sku": "LBR-2X4-8-SPF-STD",
  "name": "2x4x8 SPF Stud Standard Grade",
  "attributes": [
    { "code": "project_phase", "values": ["FRAMING", "ALL_PHASES"] }
  ]
}
```


***

### Dynamic Bundle Implementation Using Triggers

#### Step 1: Create Trigger-Based Policies

**Policy 1: Project Phase Filter**

- **Policy Name:** `Project Phase Policy`
- **Trigger Name:** `AC-Policy-Project-Phase`
- **Transport Type:** `HTTP_HEADER`
- **Attribute:** `project_phase`
- **Operator:** `CONTAINS`
- **Value Source:** `TRIGGER`
- **Value:** Header value `AC-Policy-Project-Phase`

**Policy 2: Project Type Filter**

- **Policy Name:** `Project Type Policy`
- **Trigger Name:** `AC-Policy-Project-Type`
- **Transport Type:** `HTTP_HEADER`
- **Attribute:** `commercial_residential`
- **Operator:** `IN`
- **Value Source:** `TRIGGER`
- **Value:** Header value `AC-Policy-Project-Type`

**Policy 3: Customer Tier Filter**

- **Policy Name:** `Customer Tier Policy`
- **Trigger Name:** `AC-Policy-Customer-Tier`
- **Transport Type:** `HTTP_HEADER`
- **Attribute:** `minimum_order_quantity`
- **Operator:** `LESS_THAN_OR_EQUAL`
- **Value Source:** `TRIGGER`
- **Value:** Header value `AC-Policy-Customer-Tier`


#### Step 2: Create Project-Specific Catalog Views

**Catalog View: "Project Framing Phase View"**

- **Name:** `Project-Framing-Commercial-West`
- **Catalog Sources:** `en-US`
- **Policies Applied:**
    - Project Phase Policy (trigger: FRAMING)
    - Project Type Policy (trigger: Commercial)
    - Customer Tier Policy (trigger: 1)
    - West Region Products (static)

**Catalog View: "Project Drywall Phase View"**

- **Name:** `Project-Drywall-Commercial-West`
- **Catalog Sources:** `en-US`
- **Policies Applied:**
    - Project Phase Policy (trigger: DRYWALL)
    - Project Type Policy (trigger: Commercial)
    - Customer Tier Policy (trigger: 1)
    - West Region Products (static)


#### Step 3: API Request with Dynamic Headers

When a contractor accesses their project dashboard, the frontend application makes API calls with project-specific headers:

```http
GET /api/graphql
Host: merchandising-api.adobe.io
Authorization: Bearer <token>
AC-Policy-Project-Phase: FRAMING
AC-Policy-Project-Type: Commercial
AC-Policy-Customer-Tier: 1
Content-Type: application/json

{
  "query": "query { products(pageSize: 50) { items { sku name price { regular } attributes { code values } } } }"
}
```

**Result:** The Merchandising API returns ONLY products tagged with:

- `project_phase` = FRAMING or ALL_PHASES
- `commercial_residential` = Commercial or Both
- `minimum_order_quantity` ≤ 1 (Tier 1 customers can order singles)
- Available in Western region

This creates a **dynamic project bundle** without pre-defining bundle SKUs.

***

### Project Bundle Product Examples

#### Dynamic Bundle 1: "Framing Phase - Commercial"

**Triggered by Headers:**

- `AC-Policy-Project-Phase: FRAMING`
- `AC-Policy-Project-Type: Commercial`

**Products Returned (Example 15 SKUs):**

**Structural Materials:**

1. `LBR-2X4-8-SPF-STD` - 2x4x8 SPF Stud Standard
2. `LBR-2X6-10-SPF-STD` - 2x6x10 SPF Stud Standard
3. `LBR-LVL-BEAM-3.5X14` - LVL Beam 3.5"x14"
4. `PLY-OSB-7/16-4X8` - 7/16" OSB Sheathing 4x8

**Fasteners:**
5. `NAIL-FRAME-16D-5LB` - 16d Framing Nails 5lb Box
6. `NAIL-FRAME-16D-COIL` - 16d Coil Framing Nails
7. `SCREW-DECK-3IN-5LB` - 3" Deck Screws 5lb Box

**Hardware:**
8. `SIMPSON-LUS28-2` - Simpson LUS Joist Hanger 2x8
9. `SIMPSON-A35-CLIP` - Simpson A35 Framing Clip
10. `ADHESIVE-CONST-28OZ` - Construction Adhesive 28oz

**Services:**
11. `SVC-DEL-JOBSITE` - Job Site Delivery with Equipment
12. `SVC-FAB-LUMBER-CUT` - Precision Lumber Cutting

**Bundles:**
13. `BUNDLE-FRAME-2X4-STD` - Standard Framing Package
14. `BUNDLE-HARDWARE-FRAME` - Framing Hardware Kit
15. `BUNDLE-FASTENER-FRAME` - Framing Fastener Assortment

***

#### Dynamic Bundle 2: "Drywall Phase - Commercial"

**Triggered by Headers:**

- `AC-Policy-Project-Phase: DRYWALL`
- `AC-Policy-Project-Type: Commercial`

**Products Returned (Example 12 SKUs):**

**Framing \& Drywall:**

1. `STUD-METAL-3-5/8-20GA-10` - 3-5/8" Metal Stud 20ga 10ft
2. `TRACK-METAL-3-5/8-20GA-10` - 3-5/8" Metal Track 20ga 10ft
3. `DRYWALL-1/2-4X8-REG` - 1/2" Regular Drywall 4x8
4. `DRYWALL-5/8-4X8-FIRE` - 5/8" Fire-Rated Drywall 4x8
5. `COMPOUND-JOINT-4.5GAL` - Joint Compound 4.5 Gallon
6. `TAPE-PAPER-250FT` - Paper Drywall Tape 250ft
7. `BEAD-CORNER-VINYL-8FT` - Vinyl Corner Bead 8ft

**Fasteners:**
8. `SCREW-DRYWALL-1-1/4-5LB` - 1-1/4" Drywall Screws 5lb

**Services:**
9. `SVC-DEL-SCHEDULED` - Scheduled Delivery
10. `SVC-FAB-METAL-CUT` - Metal Cutting \& Beveling

**Bundles:**
11. `BUNDLE-DRYWALL-ROOM-12X12` - Drywall Room Package 12x12
12. `BUNDLE-METAL-STUD-100LF` - Metal Stud Package 100LF

***

#### Dynamic Bundle 3: "Exterior Shell Phase - Commercial"

**Triggered by Headers:**

- `AC-Policy-Project-Phase: EXTERIOR_SHELL`
- `AC-Policy-Project-Type: Commercial`

**Products Returned (Example 15 SKUs):**

**Roofing:**

1. `SHINGLE-ARCH-OAKRIDGE-30YR` - Oakridge Architectural Shingles
2. `FELT-ROOF-30LB-432SF` - \#30 Roofing Felt 432 SF
3. `ICE-WATER-SHIELD-225SF` - Ice \& Water Shield 225 SF
4. `VENT-RIDGE-4FT` - Ridge Vent 4ft Section
5. `DRIP-EDGE-ALUM-10FT` - Aluminum Drip Edge 10ft

**Windows \& Doors:**
6. `WINDOW-DH-3060-VINYL-WHT` - 3'0x6'0 Double-Hung Vinyl Window
7. `DOOR-STEEL-COMM-3670-PRIM` - 3'6x7'0 Commercial Steel Door Primed
8. `LOCKSET-COMM-GRADE2-SN` - Commercial Grade 2 Lockset

**Fasteners:**
9. `NAIL-ROOF-1-1/4-COIL` - 1-1/4" Roofing Nails Coil
10. `SCREW-EXTERIOR-3IN-1LB` - 3" Exterior Screws 1lb

**Sealants:**
11. `SEALANT-WINDOW-10OZ` - Window \& Door Sealant 10oz
12. `FOAM-SPRAY-GAP-12OZ` - Spray Foam Gap Filler 12oz

**Bundles:**
13. `BUNDLE-ROOF-STARTER-30SQ` - Roofing Starter Pack 30 Squares
14. `BUNDLE-WINDOW-INSTALL-KIT` - Window Installation Kit
15. `SVC-INST-WINDOW` - Window Installation Service

***

### Advantages of Project-as-Dynamic-Bundle

**1. Eliminates SKU Explosion**

- Instead of creating 100+ pre-configured bundle SKUs for every project type/phase combination
- Products are composed dynamically based on project state

**2. Real-Time Catalog Updates**

- Add/remove products from phases by updating attributes
- No need to modify bundle definitions

**3. Personalized Per Project**

- Each project can have unique filters (budget, specifications, customer tier)
- Same product catalog, different views

**4. Simplified Data Management**

- Maintain single source of truth for products
- Policies control visibility and composition

**5. Flexible Pricing**

- Price books still apply based on customer segment
- Project-level pricing overrides can be managed via price book hierarchy

**6. Supports Project Evolution**

- As project moves through phases, simply change header value
- Frontend updates which products are visible

***

### Implementation Workflow

#### Phase 1: Data Setup

1. Create 120 base products with `project_phase` attribute
2. Define 12 price books with hierarchical structure
3. Create 6 inventory sources with stock assignments
4. Set up 5 major categories with hierarchical slugs

#### Phase 2: Policy Configuration

1. Create 3 trigger-based policies (Phase, Type, Tier)
2. Create 2 static policies (Region filters)
3. Define 6 catalog views combining policies

#### Phase 3: Project Integration

1. Build project management interface
2. Implement header injection based on active project
3. Query Merchandising API with dynamic headers
4. Display "Project Materials List" as dynamic bundle

#### Phase 4: Testing \& Validation

1. Test phase transitions (FRAMING → DRYWALL → EXTERIOR_SHELL)
2. Verify pricing applies correctly per customer tier
3. Validate inventory visibility across regions
4. Confirm policy triggers filter appropriately

***

## Reduced Scope Product Examples

### Category 1: Structural Materials (12 Simple + 4 Configurable + 3 Bundles)

#### Simple Products

**1. LBR-2X4-8-SPF-STD**

```json
{
  "sku": "LBR-2X4-8-SPF-STD",
  "source": { "locale": "en-US" },
  "name": "2x4x8 SPF Stud Standard Grade",
  "slug": "2x4x8-spf-stud-standard",
  "status": "ENABLED",
  "visibleIn": ["CATALOG", "SEARCH"],
  "attributes": [
    { "code": "product_category", "values": ["Structural Materials"] },
    { "code": "brand", "values": ["Pacific Lumber"] },
    { "code": "unit_of_measure", "values": ["EA"] },
    { "code": "weight_lbs", "values": ["10.5"] },
    { "code": "material_type", "values": ["Wood"] },
    { "code": "commercial_residential", "values": ["Both"] },
    { "code": "project_phase", "values": ["FRAMING", "ALL_PHASES"] },
    { "code": "minimum_order_quantity", "values": ["1"] },
    { "code": "units_per_package", "values": ["294"] }
  ],
  "routes": [
    { "path": "structural-materials" },
    { "path": "structural-materials/lumber-engineered-wood" }
  ]
}
```

**2. LBR-2X6-10-SPF-STD** - 2x6x10 SPF Stud Standard
**3. LBR-2X8-12-SPF-STD** - 2x8x12 SPF Stud Standard
**4. LBR-2X10-16-SPF-STD** - 2x10x16 SPF Stud Standard
**5. PLY-OSB-7/16-4X8** - 7/16" OSB Sheathing 4x8
**6. PLY-OSB-1/2-4X8** - 1/2" OSB Sheathing 4x8
**7. PLY-STRUCT-15/32-4X8** - 15/32" Structural Plywood 4x8
**8. CONC-MIX-80LB-5000PSI** - 80lb Concrete Mix 5000 PSI
**9. CONC-MIX-60LB-4000PSI** - 60lb Concrete Mix 4000 PSI
**10. CEMENT-PORTLAND-94LB** - Portland Cement 94lb Bag
**11. BLOCK-CONC-8X8X16-STD** - 8x8x16 Standard Concrete Block
**12. REBAR-\#4-20FT-GRADE60** - \#4 Rebar 20ft Grade 60

#### Configurable Products

**13. LBR-LVL-BEAM-CONFIG** (Configurable Parent)

- Configurations:
    - Depth: 9.25", 11.25", 14", 16" (4 options)
    - Width: 1.75", 3.5" (2 options)
    - Length: 20', 24', 28', 32' (4 options)
- Variants: 32 SKUs (e.g., LBR-LVL-BEAM-1.75X9.25-20)

**14. PLY-SANDED-CONFIG** (Configurable Parent)

- Configurations:
    - Thickness: 1/4", 1/2", 3/4" (3 options)
    - Grade: A-C, B-C, BC (3 options)
    - Size: 4x8, 4x10 (2 options)
- Variants: 18 SKUs

**15. CONC-FORM-CONFIG** (Configurable Parent)

- Configurations:
    - Type: Steel, Aluminum, Plastic (3 options)
    - Height: 8", 12", 16" (3 options)
- Variants: 9 SKUs

**16. REBAR-CONFIG** (Configurable Parent)

- Configurations:
    - Size: \#3, \#4, \#5, \#6 (4 options)
    - Length: 10', 20', 40', 60' (4 options)
- Variants: 16 SKUs


#### Bundle Products

**17. BUNDLE-FRAME-2X4-STD**

```json
{
  "sku": "BUNDLE-FRAME-2X4-STD",
  "name": "Standard 2x4 Framing Package",
  "bundles": [
    {
      "group": "studs",
      "required": true,
      "multiSelect": false,
      "items": [
        { "sku": "LBR-2X4-8-SPF-STD", "defaultQty": 100 }
      ]
    },
    {
      "group": "plates",
      "required": true,
      "multiSelect": false,
      "items": [
        { "sku": "LBR-2X4-10-SPF-STD", "defaultQty": 50 }
      ]
    },
    {
      "group": "sheathing",
      "required": true,
      "multiSelect": false,
      "items": [
        { "sku": "PLY-OSB-7/16-4X8", "defaultQty": 25 }
      ]
    },
    {
      "group": "fasteners",
      "required": true,
      "multiSelect": true,
      "items": [
        { "sku": "NAIL-FRAME-16D-5LB", "defaultQty": 5 },
        { "sku": "ADHESIVE-CONST-28OZ", "defaultQty": 10 }
      ]
    }
  ],
  "attributes": [
    { "code": "project_phase", "values": ["FRAMING"] }
  ]
}
```

**18. BUNDLE-CONCRETE-FORM-SMALL** - Small Concrete Forming Package
**19. BUNDLE-HARDWARE-FRAME** - Framing Hardware Kit

***

### Category 2: Framing \& Drywall (12 Simple + 4 Configurable + 3 Bundles)

*(Follow same structure as Category 1 with metal studs, drywall, compound, etc.)*

### Category 3: Roofing Materials (12 Simple + 4 Configurable + 3 Bundles)

*(Shingles, underlayment, ventilation, etc.)*

### Category 4: Windows \& Doors (12 Simple + 4 Configurable + 3 Bundles)

*(Windows, doors, hardware, etc.)*

### Category 5: Fasteners \& Hardware (12 Simple + 4 Configurable + 3 Bundles)

*(Nails, screws, adhesives, etc.)*

***

### Service Products (10 SKUs)

1. `SVC-DEL-STD` - Standard Delivery
2. `SVC-DEL-RUSH` - Rush Delivery
3. `SVC-DEL-SCHEDULED` - Scheduled Delivery
4. `SVC-DEL-JOBSITE` - Job Site Delivery with Equipment
5. `SVC-FAB-LUMBER-CUT` - Precision Lumber Cutting
6. `SVC-FAB-METAL-CUT` - Metal Cutting \& Beveling
7. `SVC-INST-WINDOW` - Window Installation
8. `SVC-INST-DOOR-ENTRY` - Entry Door Installation
9. `SVC-RENT-SCAFFOLDING-WEEK` - Scaffolding Rental (Weekly)
10. `SVC-TECH-TAKEOFF` - Material Takeoff \& Estimating

***

## Sample Pricing Data

### Product: LBR-2X4-8-SPF-STD

**Base Price Book (US-Base-Contract):** \$8.50
**Regional Pricing:**

- West-Region-Contract: \$8.75
- East-Region-Contract: \$8.50

**Division Pricing:**

- West-Commercial-Contract: \$8.50 (10% discount on base)
- West-Residential-Contract: \$8.75 (no discount)

**Customer Segment with Volume Discounts:**

```json
{
  "sku": "LBR-2X4-8-SPF-STD",
  "priceBookId": "west-commercial-gc-tier1",
  "regular": 8.50,
  "discounts": [
    {
      "code": "tier1_discount",
      "percentage": 5
    }
  ],
  "tierPrices": [
    { "qty": 100, "percentage": 3 },
    { "qty": 294, "price": 7.50 },
    { "qty": 588, "percentage": 15 }
  ]
}
```

**Final Pricing for Tier 1 Customer:**

- 1-99 units: \$8.08 (5% off)
- 100-293 units: \$7.84 (5% + 3% tier)
- 294-587 units: \$7.50 (full bundle price)
- 588+ units: \$6.87 (5% + 15% tier)

***

## Summary: Reduced Scope Benefits

### What We Kept (All Concepts)

✅ Multi-source inventory (MSI) with 6 sources
✅ Hierarchical pricing (4 levels, 12 price books)
✅ 5 product categories with depth
✅ Simple, configurable, bundle, and service products
✅ 20 rich metadata attributes including `project_phase`
✅ Project-based commerce workflows
✅ Dynamic catalog composition via triggers

### What We Reduced (For Manageability)

📉 Inventory sources: 18 → 6
📉 Price books: 54+ → 12
📉 Product categories: 17 → 5
📉 Products: 150,000+ → 120 base (180 total with variants)
📉 Metadata attributes: 45 → 20

### New Innovation: Project-as-Dynamic-Bundle

🎯 Uses trigger-based policies to compose catalogs on-demand
🎯 Eliminates need for 100+ pre-configured bundle SKUs
🎯 Demonstrates true composable commerce capabilities
🎯 Products filter by `project_phase` attribute dynamically
🎯 Frontend sends headers that control catalog visibility
🎯 Same product set creates infinite project combinations

***

## Next Steps

With this reduced scope, we can now create:

1. **Complete metadata definitions** (20 attributes × JSON payloads)
2. **Category hierarchy** (5 categories with slugs)
3. **120 product examples** across all types
4. **Price book structure** (12 price books with sample prices)
5. **Inventory source configuration** (6 sources, 2 stocks)
6. **Policy definitions** (3 trigger policies + 2 static policies)
7. **Catalog view setup** (6 views for different scenarios)
8. **Sample API requests** showing dynamic bundle composition

This demonstrates Adobe Commerce Optimizer's full capabilities while remaining implementable for a demonstration environment. The **Project-as-Dynamic-Bundle** approach showcases innovation beyond the Carvelo example by leveraging triggers for real-time catalog composition rather than pre-defined bundles.

Would you like me to proceed with creating the detailed step-by-step data ingestion guide using this reduced scope?

