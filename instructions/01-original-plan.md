<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# I want you to use what you’ve learned from exploring the documentation here to create a new use case.

I want to focus in the building materials and supplies vertical.

Create a new company similar to building materials distributors https://www.bmdusa.com/ or Ferguson.

Come up with a new company structure using the concepts from Carvelo.

Research Adobe commerce MSI functionality and use it to add the concept of warehouses.

Research the type of catalog structure that would be used for this use case. For example, jobs or projects as well as merchandise? Services? Bundles? I want to showcase the flexibility of Adobe commerce composable catalog data model.

Once you have created the brief, we will use it with the documentation above to create a unique data set for Adobe commerce optimizer.

Based on my research into building materials distribution, Ferguson, BMD, Adobe Commerce MSI functionality, and B2B catalog structures, I'll now create a comprehensive use case brief for a building materials company.

# BuildRight Solutions: A Comprehensive Building Materials Distribution Use Case for Adobe Commerce Optimizer

## Executive Summary

**BuildRight Solutions** is a fictional multi-regional building materials distributor serving professional contractors, builders, project managers, and procurement specialists across North America. This use case demonstrates Adobe Commerce Optimizer's capabilities in managing complex B2B catalog structures, project-based ordering, multi-warehouse inventory (leveraging MSI concepts), and flexible pricing hierarchies in the building and construction materials vertical.

***

## Company Overview

### Business Model

BuildRight Solutions operates as a B2B2X building materials distribution company with the following structure:

**Parent Company:** BuildRight Solutions, Inc. (est. 1978)

**Operating Divisions:**

1. **BuildRight Commercial** - Serving large-scale commercial construction projects
2. **BuildRight Residential** - Supporting residential builders and remodelers
3. **BuildRight Pro** - Specialty trade contractors (electrical, plumbing, HVAC)

**Geographic Coverage:**

- **Western Region:** California, Nevada, Arizona, Oregon, Washington
- **Central Region:** Texas, Colorado, Kansas, Missouri, Oklahoma
- **Eastern Region:** North Carolina, South Carolina, Georgia, Florida, Virginia

### B2B Company Structure

BuildRight serves **3 demo companies** representing the three core operating divisions. These companies showcase BuildRight's hierarchical pricing model and streamlined multi-location service capabilities.

#### Demo Companies Overview

**BuildRight Commercial Division (1 company):**

1. **Premium Commercial Builders Inc.**
   - Type: Large-scale commercial construction
   - Pricing Tier: Commercial-Tier2 (highest volume tier)
   - Locations: 2 (Los Angeles HQ, San Francisco Bay Area)
   - Region: Western (California)
   - Users: 4 purchasing staff

**BuildRight Residential Division (1 company):**

2. **Coastal Residential Builders**
   - Type: Production home builder
   - Pricing Tier: Residential-Builder (production tier)
   - Locations: 2 (San Diego HQ, Carlsbad)
   - Region: Western (California)
   - Users: 4 purchasing staff

**BuildRight Pro Division (1 company):**

3. **Elite Trade Contractors**
   - Type: Specialty trade (electrical, plumbing, HVAC)
   - Pricing Tier: Pro-Specialty (specialty tier)
   - Locations: 2 (Seattle HQ, Bellevue)
   - Region: Western (Washington)
   - Users: 4 purchasing staff

**Summary Statistics:**
- **Total Companies:** 3 companies (1 per division)
- **Total Locations:** 6 (2 per company)
- **Total Users:** 12 purchasing staff (4 per company, 2 per location)
- **Geographic Coverage:** West Coast US (California, Washington)
- **Price Book Levels:** 3-tier hierarchical structure (10 total catalogs)

**Hierarchical Pricing Structure:**

Each company is assigned to a specific Shared Catalog (price book) based on their volume, customer type, and division alignment:

- **Level 1 - Base Catalogs:** US-Retail, US-Contract (currency-defined base pricing)
- **Level 2 - Segment Catalogs:** Retail-Consumer, Contract-Commercial, Contract-Residential, Contract-Pro (division-specific pricing)
- **Level 3 - Tier Catalogs:** Commercial-Tier1, Commercial-Tier2, Residential-Builder, Pro-Specialty (volume-based discounting)

**Pricing Strategy:** Companies purchasing higher volumes receive access to deeper tier pricing (Level 3), while standard contractors use segment-level catalogs (Level 2). This demonstrates Adobe Commerce's flexible B2B pricing capabilities with hierarchical price book inheritance.

***

## Product Catalog Structure

### Product Categories (17 Major Divisions)

#### 1. **Structural Materials**

- Lumber \& Engineered Wood Products
- Concrete \& Cement Products
- Steel Beams \& Structural Metal
- Rebar \& Reinforcement Materials
- ICF (Insulated Concrete Forms)


#### 2. **Framing \& Drywall**

- Metal Studs \& Track
- Drywall Sheets (Standard, Moisture-Resistant, Fire-Rated)
- Joint Compound \& Tape
- Corner Bead \& Trim
- Acoustical Products


#### 3. **Insulation \& Weatherization**

- Fiberglass Batt Insulation
- Spray Foam Systems
- Rigid Board Insulation
- Vapor Barriers \& House Wrap
- Window Flashing \& Sealants


#### 4. **Roofing Materials**

- Asphalt Shingles
- Metal Roofing Panels
- TPO \& EPDM Membranes
- Underlayment \& Ice Shield
- Ventilation Products
- Roof Accessories \& Fasteners


#### 5. **Exterior Finishing**

- Siding (Vinyl, Fiber Cement, Metal, Wood)
- Exterior Trim \& Molding
- Soffit \& Fascia
- Exterior Shutters
- Rainware (Gutters \& Downspouts)


#### 6. **Windows \& Doors**

- Residential Windows (Single-Hung, Double-Hung, Casement)
- Commercial Windows \& Curtain Wall Systems
- Entry Doors (Steel, Fiberglass, Wood)
- Patio Doors \& Sliding Glass
- Garage Doors (Residential \& Commercial)
- Commercial Hollow Metal Doors \& Frames
- Door Hardware \& Locksets


#### 7. **Interior Finishing**

- Interior Doors \& Frames
- Millwork \& Molding
- Stair Parts \& Railings
- Paneling \& Wainscoting
- Ceiling Tiles \& Grid Systems


#### 8. **Flooring Materials**

- Hardwood Flooring
- Laminate \& LVP
- Carpet \& Carpet Tile
- Ceramic \& Porcelain Tile
- Natural Stone
- Underlayment \& Accessories
- Adhesives \& Grouts


#### 9. **Plumbing Supplies**

- PVC \& CPVC Pipe \& Fittings
- Copper Pipe \& Fittings
- PEX Systems
- Drainage Products
- Water Heaters
- Fixtures (Toilets, Sinks, Faucets)


#### 10. **Electrical Supplies**

- Wire \& Cable
- Conduit \& Fittings
- Boxes \& Brackets
- Panels \& Breakers
- Switches \& Outlets
- Lighting Fixtures


#### 11. **HVAC Products**

- Ductwork \& Fittings
- Registers \& Grilles
- Insulated Flex Duct
- HVAC Units (Residential \& Commercial)
- Thermostats \& Controls
- Refrigeration Line Sets


#### 12. **Fasteners \& Hardware**

- Nails (Framing, Finish, Roofing)
- Screws (Wood, Drywall, Deck, Metal)
- Bolts \& Anchors
- Construction Adhesives
- Tape \& Sealants
- General Hardware


#### 13. **Tools \& Equipment**

- Power Tools
- Hand Tools
- Ladders \& Scaffolding
- Safety Equipment
- Measuring \& Layout Tools
- Tool Storage


#### 14. **Concrete Accessories**

- Forming Systems
- Release Agents
- Curing Compounds
- Concrete Repair Products
- Decorative Concrete Supplies
- Concrete Colorants \& Stains


#### 15. **Outdoor Living**

- Decking Materials (Wood, Composite, PVC)
- Deck Railing Systems
- Pergolas \& Pavilions
- Outdoor Lighting
- Landscape Edging
- Pavers \& Retaining Wall Systems


#### 16. **Fire \& Life Safety**

- Fire-Rated Doors \& Frames
- Fire Dampers
- Fire-Rated Sealants
- Emergency Exit Hardware
- Fire Extinguishers \& Cabinets
- Smoke Detectors


#### 17. **Specialty Products**

- Accessibility Products (ADA Compliant)
- Sound Control Materials
- Radiant Heating Systems
- Green Building Materials
- Hurricane/Storm Protection
- Custom Millwork \& Fabrication

***

## Multi-Source Inventory (MSI) Implementation

**IMPORTANT: Manual Configuration Required**

Adobe Commerce Optimizer (ACO) Data Ingestion API does not support inventory operations. Multi-Source Inventory (MSI) must be configured manually through Adobe Commerce Admin UI or the Adobe Commerce Inventory REST API as a separate step from catalog ingestion.

**Configuration Guide:** See `docs/manual-setup/msi-configuration-guide.md` for complete setup instructions (estimated 2.5-4 hours for manual UI setup or 30-45 minutes for scripted REST API approach).

**Why Separate?** ACO focuses on product catalog optimization and pricing management. Inventory management is handled by Adobe Commerce's robust Multi-Source Inventory system, which provides warehouse management, stock allocation algorithms, and source prioritization.

### Warehouse \& Distribution Network

**Demo Implementation:** BuildRight Solutions operates **6 inventory sources** (simplified from 18-source conceptual architecture) mapped to Adobe Commerce MSI:

#### Regional Distribution Centers (RDCs)

1. **Western RDC** - Sacramento, CA (warehouse_west)
2. **Eastern RDC** - Charlotte, NC (warehouse_east)

#### Regional Warehouses

3. **Phoenix Metro Warehouse** - Phoenix, AZ (warehouse_phoenix)
4. **Denver Warehouse** - Denver, CO (warehouse_denver)
5. **Atlanta Metro Warehouse** - Atlanta, GA (warehouse_atlanta)

#### Virtual Sources

6. **Drop Shipper - Premium Window Systems** (dropship_premium_windows)

**Conceptual Full Architecture:** The complete BuildRight network includes 18 sources across 3 regions plus virtual sources (see original concept documentation for full detail). The demo uses a simplified 6-source implementation that demonstrates the same MSI capabilities.

### MSI Stock Configuration

**BuildRight-Main-Stock (Single Stock)**

- **Sources:** All 6 sources (warehouse_west, warehouse_east, warehouse_phoenix, warehouse_denver, warehouse_atlanta, dropship_premium_windows)
- **Sales Channel:** Default Website (single-website deployment)
- **Priority Configuration:**
  - Priority 1-2: Regional Distribution Centers (primary fulfillment)
  - Priority 3-5: Regional warehouses (secondary fulfillment)
  - Priority 6: Virtual drop shipper (fallback)

**Architecture Rationale:**
- Adobe Commerce has a 1:1 relationship between stocks and websites
- Single-website demo requires single stock
- All 6 sources assigned to one stock with priority-based or distance-based selection
- Demonstrates same MSI capabilities as multi-stock architecture


### Source Selection Algorithm Strategy

**Priority-Based Selection:**

1. **First Priority:** Local branch yards (same metro area as delivery address)
2. **Second Priority:** Regional warehouses (same region)
3. **Third Priority:** Regional Distribution Centers
4. **Fourth Priority:** Adjacent region sources
5. **Fifth Priority:** Drop shippers for specialty items

**Distance-Based Selection:**

- Activated for rush orders and job site deliveries
- Uses GPS coordinates for optimal routing
- Considers traffic patterns and delivery windows

***

## Hierarchical Pricing Structure

### Price Book Hierarchy (4 Levels)

#### Level 1: Base Price Books (3)

1. **US-Base-Retail** (Currency: USD)
    - MSRP pricing for retail sales
2. **US-Base-Contract** (Currency: USD)
    - Standard contract pricing
3. **US-Base-Government** (Currency: USD)
    - Government contract pricing (GSA Schedule)

#### Level 2: Regional Price Books (9)

**Under US-Base-Contract:**

- **West-Region-Contract**
- **Central-Region-Contract**
- **East-Region-Contract**

**Under US-Base-Retail:**

- **West-Region-Retail**
- **Central-Region-Retail**
- **East-Region-Retail**

**Under US-Base-Government:**

- **West-Region-Gov**
- **Central-Region-Gov**
- **East-Region-Gov**


#### Level 3: Division-Specific Price Books (27)

**Under West-Region-Contract:**

- **West-Commercial-Contract**
- **West-Residential-Contract**
- **West-Pro-Contract**

*(Repeat pattern for Central and East, plus Government divisions)*

#### Level 4: Customer Segment Price Books (54+)

**Under West-Commercial-Contract:**

- **West-Commercial-GC-Tier1** (General Contractors - Tier 1: \$10M+ annual)
- **West-Commercial-GC-Tier2** (General Contractors - Tier 2: \$2M-\$10M annual)
- **West-Commercial-GC-Tier3** (General Contractors - Tier 3: <\$2M annual)
- **West-Commercial-Specialty-Electric**
- **West-Commercial-Specialty-Plumbing**
- **West-Commercial-Specialty-HVAC**
- **West-Commercial-Specialty-Roofing**
- **West-Commercial-Specialty-Drywall**
- **West-Commercial-ProjectBased-Healthcare**
- **West-Commercial-ProjectBased-Education**
- **West-Commercial-ProjectBased-Hospitality**
- **West-Commercial-ProjectBased-Retail**
- **West-Commercial-ProjectBased-Industrial**

*(Similar structure repeated for Residential and Pro divisions)*

### Pricing Features

**Volume Discounts:**

- Tiered pricing based on quantity breaks (10+, 25+, 50+, 100+, 250+)
- Full pallet/bundle discounts
- Full truck load (TL) pricing

**Project-Based Pricing:**

- Custom pricing for jobs over \$50,000
- Quote management for bid packages
- Locked pricing for project duration (30-180 days)

**Seasonal Promotions:**

- Spring Building Season Sale
- Summer Roofing Promotion
- Fall Deck \& Fence Event
- Winter Tool Clearance

**Payment Terms Discounts:**

- Net 30: Standard
- Net 15: 1% discount
- Net 10: 2% discount
- COD: 3% discount

***

## Project-Based Catalog Management

### Project Entity Structure

BuildRight Solutions introduces a **Project** entity that extends beyond traditional catalog management:

#### Project Attributes

```json
{
  "projectId": "PROJ-2024-12345",
  "projectName": "Riverside Medical Center - Phase 2",
  "projectType": "COMMERCIAL_HEALTHCARE",
  "customerCompany": "Apex Construction Group",
  "projectManager": "John Martinez",
  "jobSiteAddress": {
    "street": "4500 Medical Parkway",
    "city": "Austin",
    "state": "TX",
    "zip": "78731"
  },
  "estimatedValue": 2500000,
  "startDate": "2024-03-15",
  "completionDate": "2025-09-30",
  "billingType": "PROGRESS_BILLING",
  "priceBookId": "central-commercial-gc-tier1",
  "preferredWarehouse": "austin-branch",
  "deliveryInstructions": "Gate code 4582, deliver to north loading dock",
  "specialRequirements": ["LEED_CERTIFIED", "UNION_LABOR", "CERTIFIED_PAYROLL"]
}
```


#### Project Product Lists

**Saved Lists by Trade:**

- **Framing Package** (200 line items)
- **Drywall Package** (85 line items)
- **Roofing Materials** (65 line items)
- **Electrical Rough-In** (350 line items)
- **Plumbing Rough-In** (280 line items)
- **HVAC Materials** (175 line items)
- **Interior Finishes** (450 line items)

**Reorder Capability:**

- One-click reorder for standard packages
- Bulk SKU upload via CSV
- Quick order pad for rapid entry

***

## Service Products \& Custom Fabrication

### Service SKUs

BuildRight offers **service products** as SKUs:

1. **Delivery Services**
    - `SVC-DEL-STD` - Standard Delivery (2-3 business days)
    - `SVC-DEL-RUSH` - Rush Delivery (Next day)
    - `SVC-DEL-SCHEDULED` - Scheduled Delivery (Specific date/time)
    - `SVC-DEL-JOBSITE` - Job Site Delivery with Forklift/Crane
    - `SVC-DEL-MULTISITE` - Multi-Site Delivery (one order, multiple locations)
2. **Cutting \& Fabrication Services**
    - `SVC-FAB-LUMBER-CUT` - Precision Lumber Cutting (per cut)
    - `SVC-FAB-METAL-CUT` - Metal Cutting \& Beveling
    - `SVC-FAB-PANEL-CUT` - Panel Cutting (Drywall, Plywood)
    - `SVC-FAB-MILLWORK-CUSTOM` - Custom Millwork Fabrication
    - `SVC-FAB-COUNTERTOP` - Countertop Fabrication \& Installation
3. **Installation Services**
    - `SVC-INST-GARAGE-DOOR` - Garage Door Installation
    - `SVC-INST-WINDOW` - Window Installation
    - `SVC-INST-DOOR-ENTRY` - Entry Door Installation
    - `SVC-INST-DECK-RAIL` - Deck Railing Installation
4. **Equipment Rental**
    - `SVC-RENT-FORKLIFT-DAY` - Forklift Rental (Daily)
    - `SVC-RENT-SCAFFOLDING-WEEK` - Scaffolding Rental (Weekly)
    - `SVC-RENT-MIXER-DAY` - Concrete Mixer Rental (Daily)
5. **Technical Services**
    - `SVC-TECH-TAKEOFF` - Material Takeoff \& Estimating
    - `SVC-TECH-SUBMITTAL` - Submittal Package Preparation
    - `SVC-TECH-CAD` - CAD Drawing Services
    - `SVC-TECH-ONSITE-CONSULT` - On-Site Technical Consultation

### Service Product Features

- **Variable pricing** based on distance, complexity, timing
- **Linked to physical products** (e.g., installation service requires product purchase)
- **Scheduling integration** with calendar/appointment system
- **Technician assignment** and tracking

***

## Bundle Products \& Kits

### Pre-Configured Bundles

#### 1. **Framing Packages**

```
BUNDLE-FRAME-2X4-STD
├─ 2x4x8 SPF Studs (Qty: 500)
├─ 2x4x10 SPF Studs (Qty: 200)
├─ 2x4 Top/Bottom Plate (Qty: 300)
├─ 3-1/2" 16d Framing Nails (5 boxes)
└─ Simpson Strong-Tie Connector Kit
```


#### 2. **Drywall Room Packages**

```
BUNDLE-DRYWALL-ROOM-12X12
├─ 1/2" Drywall Sheets (Qty: 16)
├─ Joint Compound - All Purpose (4 boxes)
├─ Paper Tape (6 rolls)
├─ Corner Bead (32 linear feet)
├─ Drywall Screws #6 x 1-1/4" (2 boxes)
└─ Primer/Sealer (2 gallons)
```


#### 3. **Window Installation Kits**

```
BUNDLE-WINDOW-INSTALL-KIT
├─ Window of choice (Customer selects)
├─ Flashing Tape (1 roll)
├─ Low-Expansion Foam (3 cans)
├─ Exterior Caulk (2 tubes)
├─ Interior Trim Package (Optional)
└─ Installation Hardware Kit
```


#### 4. **Roofing Starter Packs**

```
BUNDLE-ROOF-STARTER-30SQ
├─ Architectural Shingles (30 squares, color selection)
├─ Roofing Felt #30 (3 rolls)
├─ Ice & Water Shield (2 rolls)
├─ Hip & Ridge Shingles (30 lin ft)
├─ Roofing Nails 1-1/4" (5 coils)
├─ Roof Ventilation Kit
└─ Drip Edge (100 lin ft)
```


#### 5. **Electrical Rough-In Kits**

```
BUNDLE-ELECTRIC-ROUGH-APARTMENT
├─ 14/2 NM-B Wire (500 ft)
├─ 12/2 NM-B Wire (250 ft)
├─ Single Gang Boxes (Qty: 40)
├─ 2-Gang Boxes (Qty: 15)
├─ Wire Nuts Assortment (1 kit)
├─ Staples & Fasteners
└─ Cable Ripper Tool
```


### Customizable Bundles

**"Build Your Own" Configurations:**

- **Deck Building Package**
    - Customer selects: Decking material type, railing system, fastener type, dimensions
    - System calculates: Required joists, beams, posts, concrete, hardware
- **Bathroom Remodel Package**
    - Customer selects: Vanity, toilet, tub/shower, flooring, fixtures
    - System adds: Plumbing rough-in materials, backing board, adhesives

***

## Custom Attributes \& Metadata

### Required Metadata (5 Standard + 40 Custom)

#### Standard Attributes (All Products)

1. `sku` - TEXT
2. `name` - TEXT
3. `description` - TEXT
4. `shortDescription` - TEXT
5. `price` - DECIMAL

#### Custom Attributes for Building Materials

6. **Product Classification**
    - `product_category` - TEXT (Primary category)
    - `product_subcategory` - TEXT
    - `csi_masterformat_number` - TEXT (e.g., "06 10 00" for Rough Carpentry)
    - `csi_masterformat_title` - TEXT
7. **Physical Properties**
    - `unit_of_measure` - TEXT (EA, LF, SF, CF, CY, GAL, BOX, PKG, BUNDLE, PALLET)
    - `weight_lbs` - DECIMAL
    - `length_inches` - DECIMAL
    - `width_inches` - DECIMAL
    - `height_thickness_inches` - DECIMAL
    - `cubic_feet` - DECIMAL
    - `coverage_per_unit` - DECIMAL (for materials like paint, sealant)
8. **Material Specifications**
    - `material_type` - TEXT (Wood, Metal, Concrete, Plastic, Composite, etc.)
    - `grade` - TEXT (Standard, Premium, Commercial, Residential)
    - `species` - TEXT (for lumber: SPF, Douglas Fir, Cedar, etc.)
    - `finish` - TEXT (Primed, Painted, Stained, Natural, Galvanized)
    - `color_options` - TEXT (Array of available colors)
    - `texture` - TEXT (Smooth, Textured, Embossed)
9. **Performance Ratings**
    - `fire_rating` - TEXT (Class A, B, C; or 20min, 60min, 90min, 2hr, 3hr)
    - `impact_resistance_rating` - TEXT
    - `moisture_resistance` - BOOLEAN
    - `load_bearing_capacity_lbs` - INTEGER
    - `r_value` - DECIMAL (for insulation)
    - `sound_transmission_class` - INTEGER (STC rating)
10. **Compliance \& Certifications**
    - `building_code_compliant` - BOOLEAN
    - `ibc_compliant` - BOOLEAN (International Building Code)
    - `irc_compliant` - BOOLEAN (International Residential Code)
    - `astm_standards` - TEXT (Array of ASTM standards met)
    - `ul_listed` - BOOLEAN
    - `greenguard_certified` - BOOLEAN
    - `leed_eligible` - BOOLEAN
    - `energy_star_rated` - BOOLEAN
    - `ada_compliant` - BOOLEAN
11. **Manufacturer Information**
    - `manufacturer` - TEXT
    - `brand` - TEXT
    - `manufacturer_part_number` - TEXT
    - `model_number` - TEXT
    - `country_of_origin` - TEXT
12. **Warranty \& Lifespan**
    - `warranty_years` - INTEGER
    - `warranty_type` - TEXT (Limited, Full, Prorated)
    - `expected_lifespan_years` - INTEGER
13. **Installation Requirements**
    - `installation_difficulty` - TEXT (DIY, Professional, Certified Installer Required)
    - `installation_time_hours` - DECIMAL
    - `special_tools_required` - TEXT
    - `substrate_requirements` - TEXT
14. **Application \& Use Case**
    - `interior_exterior` - TEXT (Interior, Exterior, Both)
    - `climate_zone_suitability` - TEXT (All, Hot-Humid, Cold, Marine, Dry)
    - `commercial_residential` - TEXT (Commercial, Residential, Both)
    - `project_types` - TEXT (New Construction, Remodel, Repair, Restoration)
15. **Ordering \& Packaging**
    - `minimum_order_quantity` - INTEGER
    - `order_increment` - INTEGER (must order in multiples of)
    - `units_per_package` - INTEGER
    - `units_per_pallet` - INTEGER
    - `pallet_quantity_available` - BOOLEAN
    - `special_order_item` - BOOLEAN
    - `lead_time_days` - INTEGER
16. **Inventory Management**
    - `stock_status` - TEXT (In Stock, Low Stock, Out of Stock, Special Order, Discontinued)
    - `restock_date` - DATE
    - `seasonal_availability` - TEXT (Year-Round, Spring-Fall only, etc.)
    - `hazmat_classification` - TEXT (Non-Hazmat, Flammable, Corrosive, etc.)
    - `freight_class` - TEXT (for LTL shipping)

### Searchability Configuration

**Highly Searchable (searchWeight: 3):**

- `sku`, `manufacturer_part_number`, `model_number`, `csi_masterformat_number`

**Moderately Searchable (searchWeight: 2):**

- `name`, `brand`, `manufacturer`, `product_category`

**Lightly Searchable (searchWeight: 1):**

- `description`, `material_type`, `application`

**Filterable Attributes:**

- `product_category`, `brand`, `material_type`, `fire_rating`, `unit_of_measure`
- `installation_difficulty`, `leed_eligible`, `ada_compliant`, `interior_exterior`
- `commercial_residential`, `stock_status`, `price` (range filter)

**Sortable Attributes:**

- `name`, `price`, `brand`, `sku`, `weight_lbs`, `r_value`, `warranty_years`

***

## Categories \& Navigation

### Hierarchical Category Structure (5 Levels)

```
structural-materials
├─ lumber-engineered-wood
│  ├─ dimension-lumber
│  │  ├─ 2x4-lumber
│  │  ├─ 2x6-lumber
│  │  ├─ 2x8-lumber
│  │  ├─ 2x10-lumber
│  │  └─ 2x12-lumber
│  ├─ engineered-lumber
│  │  ├─ lvl-beams
│  │  ├─ i-joists
│  │  ├─ glulam-beams
│  │  └─ parallam
│  ├─ plywood-osb
│  │  ├─ structural-plywood
│  │  ├─ osb-sheathing
│  │  └─ specialty-panels
│  └─ treated-lumber
│     ├─ ground-contact
│     ├─ above-ground
│     └─ marine-grade
├─ concrete-cement
│  ├─ concrete-mix
│  ├─ cement
│  ├─ concrete-blocks
│  ├─ concrete-accessories
│  └─ forming-systems
└─ structural-steel
   ├─ steel-beams
   ├─ steel-columns
   ├─ steel-angles
   └─ metal-decking

framing-drywall
├─ metal-framing
│  ├─ studs
│  │  ├─ 3-5-8-inch-studs
│  │  ├─ 6-inch-studs
│  │  └─ 8-inch-studs
│  ├─ track
│  ├─ furring-channel
│  └─ accessories
├─ drywall
│  ├─ standard-drywall
│  │  ├─ 1-2-inch-drywall
│  │  └─ 5-8-inch-drywall
│  ├─ moisture-resistant
│  ├─ fire-rated
│  └─ specialty-drywall
├─ joint-compound-tape
└─ corner-bead-trim

...
(Continue for all 17 major categories)
```


### Product Families

**"Families"** group products across categories for policy management:

- `professional-grade` - Commercial/contractor products
- `residential-grade` - DIY and light commercial
- `green-building` - Sustainable/LEED products
- `fire-rated` - Fire-rated products across all categories
- `ada-compliant` - ADA-compliant products
- `hazmat` - Hazardous materials requiring special handling
- `heavy-freight` - Items requiring freight shipping
- `specialty-order` - Non-stock special order items

***

## Catalog Views \& Policies

### Catalog Views (12)

1. **Global Master Catalog**
    - All products, all regions
    - Used for: Master data management, reporting
2. **Western Commercial View**
    - Sources: Western region warehouses
    - Policies: Commercial-grade products, Western region pricing
3. **Western Residential View**
    - Sources: Western region warehouses
    - Policies: Residential-grade products, Western region pricing
4. **Western Pro View**
    - Sources: Western region + specialty drop shippers
    - Policies: Professional-grade, Specialty products

5-7. **Central Commercial/Residential/Pro Views**

- (Same structure as Western for Central region)

8-10. **Eastern Commercial/Residential/Pro Views**

- (Same structure as Western for Eastern region)

11. **Green Building Catalog**

- Sources: All regions
- Policies: LEED-eligible, GreenGuard certified, Energy Star products only

12. **Government/Public Works Catalog**

- Sources: All regions
- Policies: GSA-approved products, ADA-compliant, specific compliance requirements


### Policy Examples

#### Universal Policies (STATIC)

1. **Western Region Products**
    - Attribute: `available_regions`
    - Operator: `CONTAINS`
    - Value: `WEST`
2. **Commercial Grade Filter**
    - Attribute: `commercial_residential`
    - Operator: `IN`
    - Values: `Commercial`, `Both`
3. **Green Building Products**
    - Attribute: `leed_eligible`
    - Operator: `EQUALS`
    - Value: `true`

#### Exclusive Policies (TRIGGER)

4. **Customer Project Type Policy**
    - Trigger Name: `AC-Policy-Project-Type`
    - Transport: `HTTP_HEADER`
    - Attribute: `project_types`
    - Operator: `CONTAINS`
    - Value: From header (e.g., "New Construction", "Remodel")
5. **Customer Division Policy**
    - Trigger Name: `AC-Policy-Division`
    - Transport: `HTTP_HEADER`
    - Attribute: `product_family`
    - Operator: `IN`
    - Values: From header (e.g., ["professional-grade", "commercial"])

***

## Configurable Products Example

### Product: **Commercial Steel Entry Door System**

**Parent SKU:** `DOOR-STEEL-COMM-CONFIG`

**Configurations:**

1. **Door Size** (attributeCode: `door_size`)
    - 3'0" x 7'0" (variantReferenceId: `door-size-3070`)
    - 3'6" x 7'0" (variantReferenceId: `door-size-3670`)
    - 4'0" x 7'0" (variantReferenceId: `door-size-4070`)
    - 6'0" x 7'0" (variantReferenceId: `door-size-6070`)
2. **Fire Rating** (attributeCode: `fire_rating`)
    - 20-minute (variantReferenceId: `fire-20min`)
    - 90-minute (variantReferenceId: `fire-90min`)
    - 3-hour (variantReferenceId: `fire-3hr`)
3. **Finish** (attributeCode: `finish`)
    - Primed (variantReferenceId: `finish-primed`)
    - Galvanized (variantReferenceId: `finish-galvanized`)
    - Stainless Steel (variantReferenceId: `finish-stainless`)

**Variant Example:**

- SKU: `DOOR-STEEL-COMM-3670-90MIN-PRIM`
- Variant of: `DOOR-STEEL-COMM-CONFIG`
- Attributes:
    - door_size: 3'6" x 7'0" (variantReferenceId: door-size-3670)
    - fire_rating: 90-minute (variantReferenceId: fire-90min)
    - finish: Primed (variantReferenceId: finish-primed)

***

## Sample Product Data

### Product 1: Simple Product - Lumber

```json
{
  "sku": "LBR-2X4-8-SPF-STD",
  "source": { "locale": "en-US" },
  "name": "2x4x8 SPF Stud Standard Grade",
  "slug": "2x4x8-spf-stud-standard",
  "description": "Standard grade 2x4x8 SPF (Spruce-Pine-Fir) stud for framing applications. Kiln dried to 19% moisture content or less. Ideal for interior and exterior wall framing.",
  "shortDescription": "Standard 2x4x8 SPF framing stud",
  "status": "ENABLED",
  "visibleIn": ["CATALOG", "SEARCH"],
  "attributes": [
    { "code": "product_category", "values": ["Lumber & Engineered Wood"] },
    { "code": "product_subcategory", "values": ["Dimension Lumber"] },
    { "code": "csi_masterformat_number", "values": ["06 10 53"] },
    { "code": "material_type", "values": ["Wood"] },
    { "code": "species", "values": ["SPF"] },
    { "code": "grade", "values": ["Standard"] },
    { "code": "unit_of_measure", "values": ["EA"] },
    { "code": "length_inches", "values": ["96"] },
    { "code": "width_inches", "values": ["3.5"] },
    { "code": "height_thickness_inches", "values": ["1.5"] },
    { "code": "weight_lbs", "values": ["10.5"] },
    { "code": "interior_exterior", "values": ["Both"] },
    { "code": "commercial_residential", "values": ["Both"] },
    { "code": "manufacturer", "values": ["Pacific Lumber Co."] },
    { "code": "warranty_years", "values": ["0"] },
    { "code": "minimum_order_quantity", "values": ["1"] },
    { "code": "order_increment", "values": ["1"] },
    { "code": "units_per_bundle", "values": ["294"] }
  ],
  "routes": [
    { "path": "structural-materials" },
    { "path": "structural-materials/lumber-engineered-wood" },
    { "path": "structural-materials/lumber-engineered-wood/dimension-lumber" },
    { "path": "structural-materials/lumber-engineered-wood/dimension-lumber/2x4-lumber" }
  ]
}
```


### Product 2: Service Product

```json
{
  "sku": "SVC-DEL-JOBSITE",
  "source": { "locale": "en-US" },
  "name": "Job Site Delivery with Equipment",
  "slug": "jobsite-delivery-service",
  "description": "Professional delivery service to active construction job sites. Includes flatbed truck, certified operator, and equipment (forklift or crane) for safe material placement at specified location on site.",
  "shortDescription": "Delivery to job site with equipment",
  "status": "ENABLED",
  "visibleIn": ["CATALOG", "SEARCH"],
  "attributes": [
    { "code": "product_category", "values": ["Services"] },
    { "code": "product_subcategory", "values": ["Delivery Services"] },
    { "code": "unit_of_measure", "values": ["EA"] },
    { "code": "service_duration_hours", "values": ["2"] }
  ]
}
```


***

## Key Differentiators from Carvelo

1. **Multi-Source Inventory (MSI):** Leverages 6 physical sources (demo) with sophisticated stock allocation
2. **Service Products:** SKUs for delivery, fabrication, installation, rentals, and technical services
3. **Project-Based Commerce:** Project entity with saved lists, progress billing, and job site management
4. **Bundles \& Kits:** Pre-configured and customizable bundle products
5. **Rich Metadata:** 40+ custom attributes supporting CSI MasterFormat, compliance, and specifications
6. **Complex Catalog Structure:** 17 major categories, 5-level hierarchy, product families
7. **B2B Workflows:** Quote management, takeoffs, submittals, multi-site delivery
8. **Vertical-Specific:** Purpose-built for construction materials distribution

***

## Success Metrics

- **6 inventory sources** across 2 regions (demo)
- **54+ price books** in 4-level hierarchy
- **150,000+ product SKUs** spanning 17 major categories
- **2,000+ configurable products** (doors, windows, HVAC systems)
- **500+ bundle products** (pre-configured kits)
- **200+ service SKUs** (delivery, fabrication, installation)
- **12 catalog views** for different divisions and channels
- **40+ custom attributes** per product for detailed specifications

***

## Next Steps

This brief provides the foundation for creating a comprehensive dataset for Adobe Commerce Optimizer that demonstrates:

- Multi-source inventory management
- Complex pricing hierarchies for B2B
- Project-based commerce workflows
- Service product integration
- Rich metadata and compliance tracking
- Bundle/kit configuration
- Vertical-specific features for building materials

**We are now ready to translate this brief into a complete data ingestion guide similar to the Carvelo demonstration, including:**

1. Step-by-step metadata creation
2. Category hierarchy implementation
3. Product data examples across all types
4. Price book and pricing structure
5. MSI source and stock configuration
6. Catalog view and policy setup
<span style="display:none">[^1][^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^2][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^3][^30][^31][^32][^33][^34][^35][^36][^37][^38][^39][^4][^40][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://www.arcat.com/products/building_products_categories

[^2]: https://www.ferguson.com/category/building-supplies/?prefn1=sku_brand_s\&prefv1=Eagle

[^3]: https://www.bmdusa.com/business-divisions/

[^4]: https://www.bmdusa.com

[^5]: https://www.tlferguson.com/building-supplies

[^6]: https://ironspring.com/4-the-rise-of-the-building-material-distributors/

[^7]: https://www.bmdusa.com/national/

[^8]: https://www.corporate.ferguson.com/about-us/Our-Businesses/

[^9]: https://www.linkedin.com/company/bmd

[^10]: https://www.primesourcebp.com

[^11]: https://www.ferguson.com/search

[^12]: https://www.clodura.ai/directory/company/building-material-distributors-inc-bmd-inc

[^13]: https://www.fbmsales.com

[^14]: https://www.fergusonindustrial.com/products/

[^15]: https://www.zoominfo.com/c/bmd-inc/5062849

[^16]: https://www.abcsupply.com/products/

[^17]: https://www.fergusonhvac.com/product-info/

[^18]: https://www.prnewswire.com/news-releases/bmd-inc-expands-engineered-wood-product-distribution-to-southern-california-302486619.html

[^19]: https://www.masterwholesale.com/construction-materials.html

[^20]: https://www.fergusonhome.com/commercial

[^21]: https://developer.adobe.com/commerce/webapi/rest/inventory/

[^22]: https://experienceleague.adobe.com/en/docs/commerce-learn/tutorials/catalog/inventory-management

[^23]: https://www.amast.com

[^24]: https://experienceleague.adobe.com/en/docs/commerce-admin/inventory/guide-overview

[^25]: https://www.xerago.com/insights/adobe-commerce-order-inventory-management

[^26]: https://www.bigcommerce.com/blog/b2b-building-and-construction-materials-ecommerce/

[^27]: https://www.magestore.com/blog/complete-guide-for-magento-inventory-msi/

[^28]: https://experienceleague.adobe.com/en/docs/commerce-admin/inventory/configuration/enable

[^29]: https://www.buildstock.com

[^30]: https://experienceleague.adobe.com/en/docs/commerce-admin/inventory/introduction

[^31]: https://swiftotter.com/adobe-commerce-vs-bigcommerce-comparison/adobe-commerce-bigcommerce-inventory-management

[^32]: https://cloudfy.com/solutions/sector/construction-materials/

[^33]: https://github.com/magento/inventory

[^34]: https://experienceleague.adobe.com/en/docs/commerce-admin/inventory/sources/sources-manage

[^35]: https://yourorderbook.com/construction-and-building-materials-b2b-ecommerce.html

[^36]: https://community.magento.com/t5/Magento-2-x-Admin-Configuration/Question-regarding-Multi-Source-Inventory/td-p/508415

[^37]: https://www.ziffity.com/blog/adobe-commerce-inventory-management/

[^38]: https://deslinc.com/blog/buy-construction-material-online

[^39]: https://commercemarketplace.adobe.com/webkul-marketplace-msi.html

[^40]: https://brandhause.com/b2c-vs-b2b-marketing-for-building-materials-companies/

