# BuildRight ACO Demo Presentation Guide

> **Purpose**: Quick reference for presenting the BuildRight ACO demo, connecting business narrative to technical implementation.
>
> **Audience**: Sales engineers, solution architects, demo presenters
>
> **Time**: 15-20 minute demo

---

## 1. Business Context

### BuildRight Solutions Overview

**BuildRight Solutions** is a fictional multi-regional building materials distributor serving professional contractors, builders, and project managers across North America. Founded in 1978, BuildRight has evolved into a B2B2X distribution company specializing in construction materials.

**The Challenge**: Traditional one-size-fits-all catalogs don't work for construction materials distribution. A commercial contractor building a high-rise needs entirely different products than a residential remodeler replacing a kitchen, yet both are browsing the same massive catalog. This creates friction, ordering errors, and wasted time.

**The Solution**: Adobe Commerce Optimizer (ACO) enables BuildRight to deliver personalized, project-specific product catalogs that dynamically adapt to customer type, project phase, and real-time requirements.

### Three-Division Operating Model

BuildRight operates three specialized divisions, each serving distinct customer segments:

1. **BuildRight Commercial** - Large-scale commercial construction projects (office buildings, hospitals, schools)
2. **BuildRight Residential** - Production home builders and residential remodelers
3. **BuildRight Pro** - Specialty trade contractors (electrical, plumbing, HVAC)

### Customer Segments & Pain Points

**Premium Commercial Builders**
- **Profile**: Large general contractors managing multi-million dollar projects
- **Pain Point**: Need industrial-grade materials with bulk pricing, but standard catalogs show residential products
- **Value Proposition**: See only commercial-grade products with tier-based volume pricing

**Production Residential Builders**
- **Profile**: Home builders constructing 50-200 homes annually
- **Pain Point**: Need standardized materials at scale, but catalogs include specialty items they'll never use
- **Value Proposition**: Streamlined catalog with residential-focused products and builder pricing tiers

**Specialty Trade Contractors**
- **Profile**: Licensed electricians, plumbers, HVAC technicians
- **Pain Point**: Need specialty products for their specific trade, waste time browsing irrelevant categories
- **Value Proposition**: Trade-specific product filtering with professional contractor pricing

### Solution Value Proposition

ACO personalization solves these challenges by:
- **Eliminating irrelevant products**: Contractors only see products appropriate for their segment and project type
- **Streamlining ordering**: Project-specific catalogs reduce search time by 60-70%
- **Reducing errors**: Automatic filtering prevents ordering wrong materials for project type
- **Optimizing pricing**: Hierarchical price books reward volume customers automatically
- **Improving fulfillment**: Location-based inventory ensures products are actually available

---

## 2. Demo Environment Overview

### What We Built

The BuildRight ACO demo showcases a reduced-scope but fully functional implementation:

**Products**: 184 total SKUs across 5 categories
- 70 Simple Products (dimensional lumber, concrete, fasteners)
- 92 Configurable Product Variants (doors, windows, beams with size/finish options)
- 15 Bundle Products (pre-configured kits: framing packages, drywall room kits)
- 10 Service Products (delivery, fabrication, installation services)

**Categories**: 5 main categories with 19 total in 2-level hierarchical structure
- Structural Materials (parent) → Lumber & Engineered Wood, Concrete & Cement Products (children)
- Framing & Insulation (parent) → Metal Framing, Drywall, Insulation (children)
- Roofing Materials (parent) → Shingles, Underlayment, Ventilation (children)
- Windows & Doors (parent) → Residential Windows, Commercial Doors, Door Hardware (children)
- Fasteners & Hardware (parent) → Nails, Screws, Adhesives (children)

**Enhancement Note**: Expanded from 5 planned to 19 total categories to demonstrate realistic industry taxonomy and ACO's hierarchical category capabilities.

**B2B Structure**: 3 companies, 6 locations, 12 users
- Premium Commercial Builders Inc. (2 locations in California)
- Coastal Residential Builders (2 locations in California)
- Elite Trade Contractors (2 locations in Washington)

**Pricing**: 10 hierarchical price books across 3 tiers
- Level 1: Base catalogs (US-Retail, US-Contract)
- Level 2: Segment catalogs (Retail-Consumer, Contract-Commercial, Contract-Residential, Contract-Pro)
- Level 3: Volume tier catalogs (Commercial-Tier1, Commercial-Tier2, Residential-Builder, Pro-Specialty)

**Inventory**: 6 inventory sources (MSI configuration)
- 2 Regional Distribution Centers (Sacramento CA, Charlotte NC)
- 3 Regional Warehouses (Phoenix, Denver, Atlanta)
- 1 Virtual Drop Shipper (Premium Window Systems)

### Key Personalization Capabilities

**Project Type Filtering**
- Products tagged with project types: new_construction, remodel, repair, restoration
- HTTP trigger headers filter products dynamically based on active project
- Same catalog shows different products for different project contexts

**Hierarchical Pricing**
- 3-tier price book structure rewards volume customers
- Premium Commercial Builders get Tier2 pricing (deepest discounts)
- Residential builders get builder-specific pricing
- Pricing inheritance from parent catalogs

**Company-Specific Catalogs**
- Each B2B company assigned to specific shared catalog (price book)
- Users within company automatically see company pricing
- Multi-location companies share same pricing across branches

**Brand & Category Filtering**
- Products tagged with brands: BuildRight Pro, ToughGrip, SafeWorks, QuickFast
- Category filtering: structural_materials, framing_insulation, windows_doors, etc.
- HTTP headers enable dynamic filtering in real-time

---

## 3. Demo Scenarios

### Scenario 1: Premium Commercial Builder Experience

**Business Story**: Premium Commercial Builders Inc. is building a 12-story office building in Los Angeles. They're in the framing phase and need structural materials. As a high-volume customer (Tier2), they receive the deepest discounts and access to bulk ordering.

**Technical Setup**:
- **Company**: Premium Commercial Builders Inc.
- **User**: John Smith (john.smith@premiumcommercial.example.com)
- **Pricing Tier**: Commercial-Tier2 (best pricing in demo)
- **Project Type**: New Construction
- **Product Category**: Structural Materials

**Demo Steps**:

1. **Log into ACO catalog** as John Smith
   - *Talking Point*: "This is a premium commercial contractor logged into their personalized BuildRight catalog."

2. **Navigate to Structural Materials category**
   - *Talking Point*: "Notice the catalog is already filtered to commercial-grade products. Residential items don't appear, reducing clutter."

3. **Apply project type filter**: Set HTTP header `AC-Policy-Project-Type: new_construction`
   - *Talking Point*: "We're simulating the contractor selecting their active project. ACO dynamically filters to show only products suitable for new construction."

4. **View product results**
   - *Talking Point*: "See products like 2x4x8 SPF Studs, LVL beams, OSB sheathing - all tagged for new construction framing work."

5. **Show pricing for Tier2 customer**
   - Example: 2x4x8 SPF Stud shows $8.08 per unit (5% Tier2 discount applied)
   - View tier pricing: 100+ units = $7.84, 294+ units (full bundle) = $7.50
   - *Talking Point*: "This high-volume customer automatically receives tier-based discounts. The more they buy, the better the pricing - no negotiations needed."

**Expected Outcome**: Streamlined catalog showing ~40-50 products instead of all 184, with best available pricing for this customer tier.

---

### Scenario 2: Residential Remodel Contractor Experience

**Business Story**: Coastal Residential Builders specializes in kitchen and bathroom remodels for homeowners. They need finishing materials, not heavy structural products. As a production builder, they receive builder-tier pricing.

**Technical Setup**:
- **Company**: Coastal Residential Builders
- **User**: Maria Garcia (maria.garcia@coastalresidential.example.com)
- **Pricing Tier**: Residential-Builder
- **Project Type**: Remodel
- **Product Category**: Windows & Doors

**Demo Steps**:

1. **Log in as Maria Garcia** (remodel contractor)
   - *Talking Point*: "This residential contractor works primarily on remodels, not new construction."

2. **Navigate to Windows & Doors**
   - *Talking Point*: "Remodel projects often involve window and door replacement."

3. **Apply project type filter**: `AC-Policy-Project-Type: remodel`
   - *Talking Point*: "By filtering for remodel projects, we show products appropriate for replacement work - residential-grade windows, entry doors, hardware."

4. **Compare to new construction view** (toggle header to `new_construction`)
   - *Talking Point*: "Notice how the product selection changes. New construction shows rough openings and bulk framing materials, while remodel focuses on finished products ready for installation."

5. **Show Residential-Builder pricing**
   - Example: Residential vinyl window shows builder pricing, not retail
   - *Talking Point*: "This builder receives contractor pricing across all purchases, different from both retail customers and commercial contractors."

**Expected Outcome**: Catalog emphasizes finishing materials and residential-grade products, excluding heavy commercial items. Pricing reflects residential builder tier.

---

### Scenario 3: Project Type Filtering Comparison

**Business Story**: Demonstrating how the same catalog view transforms based on project context. A contractor managing multiple project types can switch between them seamlessly.

**Technical Setup**:
- **Company**: Premium Commercial Builders Inc.
- **User**: John Smith
- **Demo**: Compare 3 project type filters on same catalog view

**Demo Steps**:

1. **Start with base catalog** (no project type header)
   - *Talking Point*: "Without project context, the contractor sees all available products - 184 SKUs."

2. **Apply New Construction filter**: `AC-Policy-Project-Type: new_construction`
   - Show products: Structural lumber, concrete forms, bulk fasteners
   - *Talking Point*: "New construction emphasizes structural materials, bulk quantities, and products for ground-up building."

3. **Switch to Remodel filter**: `AC-Policy-Project-Type: remodel`
   - Show products: Finished lumber, specialty fasteners, installation materials
   - *Talking Point*: "Remodel projects focus on finished materials, replacement products, and smaller quantities."

4. **Switch to Repair filter**: `AC-Policy-Project-Type: repair`
   - Show products: Quick-fix materials, standard sizes, readily available items
   - *Talking Point*: "Repair projects need immediate availability and standard sizes. Products here are stocked items with minimal lead time."

5. **Switch to Restoration filter**: `AC-Policy-Project-Type: restoration`
   - Show products: Specialty materials, historic-compatible products
   - *Talking Point*: "Restoration work requires specialty products not typically used in standard construction - period-appropriate materials, specialty finishes."

**Expected Outcome**: Clear demonstration of how product selection changes dramatically based on project type, even for the same user and company.

---

### Scenario 4: Multi-Location Company Demo

**Business Story**: Premium Commercial Builders operates two branches: Los Angeles HQ and San Francisco Bay Area. Both locations share the same pricing tier but may have different users and project focuses.

**Technical Setup**:
- **Company**: Premium Commercial Builders Inc.
- **Location 1**: Los Angeles HQ (Team 1)
- **Location 2**: San Francisco Bay Area (Team 2)
- **Show**: Both teams access same catalog with same pricing

**Demo Steps**:

1. **Log in as LA user** (John Smith - LA Headquarters)
   - Show catalog access with Commercial-Tier2 pricing
   - *Talking Point*: "This is the LA headquarters team member accessing the catalog."

2. **View user's team assignment**
   - *Talking Point*: "This user is assigned to the Los Angeles Headquarters team within Premium Commercial Builders."

3. **Log in as SF user** (Carlos Rodriguez - SF Bay Area)
   - Show same catalog with same pricing
   - *Talking Point*: "Now we're logged in as a team member from the San Francisco office."

4. **Compare pricing between locations**
   - *Talking Point*: "Both locations receive identical Commercial-Tier2 pricing because they're part of the same company. Pricing is assigned at the company level, not per location."

5. **Show team-based reporting potential**
   - *Talking Point*: "While both teams share pricing, BuildRight can track which location is ordering what products, enabling branch-specific analytics and inventory planning."

**Expected Outcome**: Demonstrates multi-location B2B structure with shared pricing but separate team tracking.

---

## 4. Key Features & Talking Points

### Feature 1: Hierarchical Pricing

**What It Does**: 3-tier price book structure with inheritance from parent catalogs. Companies assigned to tier-level catalogs inherit pricing from segment and base levels.

**Business Value**: "This hierarchical structure allows BuildRight to reward high-volume customers with deeper discounts automatically. A commercial contractor buying $2M annually receives Tier2 pricing across all products without manual discounting or contract negotiations. Pricing updates cascade from base to tier levels, simplifying management."

**Demo Highlight**:
- Show 2x4x8 SPF Stud pricing across tiers
- Base Contract: $8.50
- Commercial-Tier1: $8.25 (volume discount)
- Commercial-Tier2: $8.08 (best volume discount)
- Show tier pricing at quantity breaks: 100+, 294+ (full bundle), 588+

---

### Feature 2: Project Type Filtering

**What It Does**: Products tagged with multiselect `project_types` attribute (new_construction, remodel, repair, restoration). HTTP trigger header `AC-Policy-Project-Type` filters products dynamically based on active project context. **Intelligent assignment logic** automatically assigns appropriate project types based on product category (services get all 4, structural gets 2-3, fasteners get all 4).

**Business Value**: "Contractors managing multiple projects don't waste time browsing irrelevant products. A framing crew working on new construction sees structural materials, while a remodel team sees finishing products. This reduces ordering errors by 60% and cuts search time by 70%, per BuildRight's internal analysis. The intelligent assignment algorithm ensures products are tagged appropriately based on their category - no manual tagging required."

**Demo Highlight**:
- Toggle between project types using HTTP headers
- Show how product count and selection changes dramatically
- Highlight products that appear in multiple project types (fasteners, adhesives appear in all 4)
- Explain intelligent assignment: "Services automatically tagged with all 4 types, structural materials get 2-3 types based on typical use"
- Reference implementation: `scripts/generate-products.js:122-167`

---

### Feature 3: Company-Specific Catalogs

**What It Does**: Each B2B company assigned to specific shared catalog (price book) in Adobe Commerce. All users within company inherit company's pricing and product access.

**Business Value**: "BuildRight serves diverse customer segments - commercial contractors, residential builders, and specialty trades - each with different needs and pricing expectations. Company-specific catalogs ensure every user sees the right products at the right price, automatically. New users onboarded to a company immediately receive appropriate catalog access."

**Demo Highlight**:
- Log in as users from different companies
- Show different pricing for same product across companies
- Demonstrate automatic catalog assignment (no manual configuration per user)

---

### Feature 4: Trigger-Based Dynamic Catalogs

**What It Does**: HTTP headers sent with GraphQL API requests trigger real-time catalog filtering. Headers like `AC-Policy-Project-Type`, `AC-Policy-Brand`, `AC-Policy-Product-Category` filter products without creating separate static catalog views.

**Business Value**: "Traditional B2B platforms require creating hundreds of pre-configured catalogs for every combination of customer type and project context. ACO's trigger-based policies enable unlimited catalog variations from a single product dataset. BuildRight can introduce new project types or customer segments without rebuilding catalogs."

**Demo Highlight**:
- Show GraphQL request with multiple trigger headers
- Demonstrate combining filters (project type + brand + category)
- Show how catalog adapts in real-time without page reloads

---

### Feature 5: Product Bundles & Kits

**What It Does**: 15 pre-configured bundle products combine frequently purchased items (e.g., "Standard Framing Package" includes studs, plates, sheathing, fasteners). Bundles include items from multiple categories with default quantities.

**Business Value**: "Construction projects require purchasing dozens of related products. Bundles reduce the 50-item framing order down to 3-4 bundle selections. This speeds ordering, ensures nothing is forgotten, and reduces errors. Pre-configured bundles also enable BuildRight to promote preferred product combinations and move excess inventory."

**Demo Highlight**:
- Show bundle product structure (BUNDLE-FRAME-2X4-STD)
- Display bundle components with quantities
- Compare ordering bundles vs individual products (time savings)

---

### Feature 6: Service Products Integration

**What It Does**: 10 service SKUs exist alongside physical products (delivery, fabrication, installation, equipment rental, technical services). Services can be ordered as standalone items or bundled with products.

**Business Value**: "BuildRight differentiates by offering full-service fulfillment. Contractors can order job-site delivery with forklift, precision lumber cutting, or window installation - all in the same order as materials. This creates a comprehensive project management platform, not just a catalog."

**Demo Highlight**:
- Show service product: SVC-DEL-JOBSITE (Job Site Delivery with Equipment)
- Demonstrate adding service to cart with material products
- Discuss integration potential with scheduling and dispatch systems

---

## 5. Technical Architecture

### Data Model Overview

**Products**: 184 SKUs stored as composable catalog entities
- Simple products (single SKU, fixed attributes)
- Configurable products (parent SKU with variants based on size, color, finish)
- Bundle products (container SKU with component items)
- Service products (non-physical SKUs for services)

**Attributes**: 34 metadata attributes for rich product descriptions (enhanced from 20 planned)
- Classification (8): product_category, brand, unit_of_measure, model_number, lumber_species, lumber_grade, lumber_treatment, safety_rating
- Physical properties (5): weight_lbs, length_inches, width_inches, height_thickness_inches, coverage_per_unit
- Material specs (6): material_type, fire_rating, leed_eligible, commercial_residential, interior_exterior, moisture_resistant
- Application (2): **project_types** (multiselect with intelligent assignment), service_duration_hours
- Ordering (8): minimum_order_quantity, order_increment, units_per_package, units_per_pallet, pallet_quantity_available, special_order_item, lead_time_days, stock_status
- Performance (5): r_value, insulation_type, warranty_years, hazmat_classification, sustainability_certified

**Product Relationships**:
- Categories (hierarchical): structural-materials > lumber-engineered-wood > dimension-lumber
- Variants (configurable): LBR-LVL-BEAM-CONFIG > LBR-LVL-BEAM-1.75X9.25-20 (32 variants)
- Bundles: BUNDLE-FRAME-2X4-STD contains LBR-2X4-8-SPF-STD (100 qty) + PLY-OSB-7/16-4X8 (25 qty) + fasteners

**Price Books**: 10 hierarchical shared catalogs
- Level 1: Base catalogs with currency (US-Retail, US-Contract)
- Level 2: Segment catalogs (Retail-Consumer, Contract-Commercial, Contract-Residential, Contract-Pro)
- Level 3: Volume tier catalogs (Commercial-Tier1, Commercial-Tier2, Residential-Builder, Pro-Specialty)

**Companies & Users**: B2B structure
- 3 Companies (one per division)
- 6 Locations/Teams (2 per company)
- 12 Users (4 per company, 2 per location)

### ACO Integration Points

**What ACO Provides**:

**Real-Time Personalization**
- Catalog filtering based on HTTP headers (project type, brand, category)
- Dynamic product visibility without pre-built catalog views
- Sub-second response times for personalized queries

**Trigger Policies**
- HTTP_HEADER transport for passing context with API requests
- Operators: EQUALS, CONTAINS, IN, NOT_EQUALS, LESS_THAN, GREATER_THAN
- Multiple policies combine with logical AND

**GraphQL API**
- Query products with filters, pagination, sorting
- Retrieve product attributes, pricing, inventory (via separate MSI API)
- Search products with relevance ranking

**Multi-Tenant Catalog Management**
- Shared catalogs (price books) assigned to B2B companies
- Hierarchical price book inheritance
- Company-level customization without duplicating product data

### What's Outside ACO Scope

**Inventory Management**
- ACO does not manage inventory (quantity, stock status, allocation)
- Adobe Commerce Multi-Source Inventory (MSI) handles 6 inventory sources
- Manual configuration required via Adobe Commerce Admin or REST API

**Order Management**
- ACO provides product catalog and pricing
- Orders placed through Adobe Commerce storefront/API
- Order fulfillment, shipping, invoicing handled by Adobe Commerce

**User Authentication**
- B2B company users authenticate via Adobe Commerce
- ACO receives authenticated requests with company context
- No user management within ACO

---

## 6. Demo Tips & Troubleshooting

### Pre-Demo Checklist

- [ ] **ACO environment is accessible**
  - Confirm GraphQL endpoint URL
  - Verify access token is valid and not expired
  - Test basic GraphQL query (e.g., retrieve 5 products)

- [ ] **Sample products are ingested**
  - Confirm 184 products exist in catalog
  - Verify product attributes are populated (project_types, brand, product_category)
  - Check at least 3 products per category exist

- [ ] **Price books are configured**
  - Verify 10 shared catalogs exist with hierarchical relationships
  - Check pricing is set for sample products in multiple price books
  - Confirm tier pricing (quantity breaks) is configured for key products

- [ ] **Policies are active**
  - Verify trigger-based policies are created (Project-Type, Brand, Category)
  - Confirm policies are associated with catalog views
  - Test policies with sample HTTP headers (see troubleshooting section)

- [ ] **B2B companies are set up**
  - Verify 3 demo companies exist (Premium Commercial, Coastal Residential, Elite Trade)
  - Confirm each company assigned to appropriate shared catalog
  - Check sample users exist and can authenticate

- [ ] **HTTP header testing tools ready**
  - Prepare curl commands or Postman collection with sample headers
  - Have browser developer tools ready to inspect GraphQL requests
  - Bookmark ACO GraphQL playground (if available)

---

### Common Questions & Answers

**Q**: "How many products can ACO handle? What's the scalability limit?"

**A**: "ACO is designed for enterprise-scale catalogs. Adobe has demonstrated catalogs with 1M+ products in production. The BuildRight demo uses 184 products to keep the demo manageable, but a real implementation could include BuildRight's full 150,000+ product inventory across all categories, brands, and variants. Performance remains sub-second even at scale due to ACO's optimized indexing and caching."

**Q**: "Can we integrate ACO with our existing ERP system (SAP, Oracle, NetSuite)?"

**A**: "Yes. ACO integrates with Adobe Commerce, which has robust ERP integration capabilities. Your ERP remains the source of truth for product master data, pricing, and inventory. Adobe Commerce syncs that data (via REST API, middleware, or batch imports), and ACO provides the personalized catalog layer. BuildRight's architecture would sync product data from their ERP nightly, with real-time pricing and inventory updates via API."

**Q**: "How do we assign customers to different price books? Is it manual?"

**A**: "It's flexible. In Adobe Commerce B2B, you assign each company to a shared catalog (price book) manually during company setup, or automate it based on business rules (sales volume, customer segment, region). Once assigned, all users within that company automatically inherit the pricing. For BuildRight, we'd assign companies to tiers based on annual purchasing volume, automatically upgrading them when they reach thresholds."

**Q**: "What happens if a contractor's project type changes mid-project?"

**A**: "The frontend application simply changes the HTTP header value in subsequent API requests. If a contractor switches from 'framing' to 'drywall' phase, the UI updates the `AC-Policy-Project-Type` header from `new_construction` to `remodel`, and the next catalog query returns the new filtered product set. No backend configuration changes needed - it's dynamic and instantaneous."

**Q**: "Can we add new product attributes without rebuilding the catalog?"

**A**: "Yes. ACO's composable catalog model allows you to add new attributes at any time. In fact, BuildRight's implementation demonstrates this flexibility - the original plan specified 20 attributes for the reduced scope, but we expanded to 34 attributes during implementation to better demonstrate industry coverage. We added lumber-specific attributes (species, grade, treatment), insulation properties (r_value, insulation_type), and the innovative project_types multiselect attribute - all without disrupting existing product data or catalog structure."

**Q**: "How does ACO handle inventory management?"

**A**: "ACO focuses on catalog and pricing, not inventory. Inventory is managed separately by Adobe Commerce's Multi-Source Inventory (MSI) system. BuildRight's 6 inventory sources (warehouses and drop shippers) are configured in Adobe Commerce, which tracks stock levels, allocates inventory, and provides availability data. The storefront queries ACO for catalog/pricing and Adobe Commerce for inventory status."

**Q**: "Can contractors create custom bundles or saved lists?"

**A**: "Yes, through Adobe Commerce's requisition list and quick order features. Contractors can save frequently ordered product lists (e.g., 'My Standard Framing Order'), which can include products from across categories. While ACO provides pre-configured bundles like 'Standard Framing Package', contractors can also build their own custom lists for one-click reordering."

---

### Demo Variants

**Short Version (10 minutes)**: Focus on business value and one demo scenario
- Business context (2 min): BuildRight's challenge and ACO solution
- Scenario 1 only: Premium Commercial Builder (5 min)
- Key features: Hierarchical pricing + project type filtering (2 min)
- Q&A (1 min)

**Standard Version (20 minutes)**: Full demo with all 4 scenarios
- Business context (3 min)
- Scenario 1: Premium Commercial Builder (4 min)
- Scenario 2: Residential Remodel Contractor (4 min)
- Scenario 3: Project Type Filtering Comparison (4 min)
- Key features: All 6 features with talking points (4 min)
- Q&A (1 min)

**Deep Dive Version (30-45 minutes)**: Add technical architecture and live coding
- Business context (3 min)
- All 4 scenarios (15 min)
- All key features (6 min)
- Technical architecture walkthrough (8 min):
  - Show ACO data model (products, attributes, categories)
  - Demonstrate GraphQL API queries with headers
  - Show policy configuration in ACO UI
  - Explain B2B company structure
- Live troubleshooting demonstration (3 min):
  - Toggle HTTP headers in real-time
  - Show how policies affect results
- Q&A (5 min)

**Executive Summary (5 minutes)**: Business value only, no live demo
- BuildRight's business challenge (1 min)
- ACO solution overview (2 min)
- Business outcomes: 60% fewer ordering errors, 70% faster product discovery (1 min)
- ROI discussion: reduced support calls, improved fulfillment rates (1 min)

---

### Troubleshooting During Demo

**Issue**: Policy not filtering products (all products appear)

**Quick Fix**:
1. Verify HTTP header name matches trigger name exactly: `AC-Policy-Project-Type` (case-sensitive)
2. Check header is being sent (use browser DevTools Network tab)
3. Confirm policy is associated with catalog view and enabled

**Issue**: No products returned (empty result set)

**Quick Fix**:
1. Remove all trigger headers and test base catalog (isolate issue)
2. Check trigger header value matches product attribute values (e.g., use `new_construction`, not `new-construction`)
3. Query products directly to verify attribute values exist

**Issue**: Wrong pricing displayed

**Quick Fix**:
1. Verify which company/user is logged in (check shared catalog assignment)
2. Confirm price book hierarchy is correct (child inherits from parent)
3. Check product has pricing set in the assigned shared catalog

**Issue**: Demo environment slow or unresponsive

**Quick Fix**:
1. Check network connectivity to ACO instance
2. Reduce query complexity (request fewer fields, smaller page size)
3. Verify access token hasn't expired (refresh if needed)

**Issue**: Presenter forgets HTTP header values

**Quick Fix**: Keep this cheat sheet visible:
- Project types: `new_construction`, `remodel`, `repair`, `restoration`
- Categories: `structural_materials`, `framing_insulation`, `windows_doors`, `fasteners_hardware`
- Brands: `buildright_pro`, `toughgrip`, `safeworks`, `quickfast`

---

## Appendix: Quick Reference

### Demo User Credentials

| Company | Division | User Name | Email | Pricing Tier |
|---------|----------|-----------|-------|--------------|
| Premium Commercial Builders Inc. | Commercial | John Smith | john.smith@premiumcommercial.example.com | Commercial-Tier2 |
| Coastal Residential Builders | Residential | Maria Garcia | maria.garcia@coastalresidential.example.com | Residential-Builder |
| Elite Trade Contractors | Pro | David Chen | david.chen@elitetrade.example.com | Pro-Specialty |

*(Note: Actual credentials and authentication method depend on Adobe Commerce configuration)*

---

### Sample Products by Category

**Structural Materials**:
- `LBR-2X4-8-SPF-STD` - 2x4x8 SPF Stud Standard Grade ($8.08 Tier2 price)
- `LBR-LVL-BEAM-1.75X9.25-20` - 1.75"x9.25"x20' LVL Beam
- `PLY-OSB-7/16-4X8` - 7/16" OSB Sheathing 4x8

**Framing & Drywall**:
- `STUD-METAL-3-5/8-20GA-10` - 3-5/8" Metal Stud 20ga 10ft
- `DRYWALL-1/2-4X8-REG` - 1/2" Regular Drywall 4x8
- `COMPOUND-JOINT-4.5GAL` - Joint Compound 4.5 Gallon

**Roofing Materials**:
- `SHINGLE-ARCH-OAKRIDGE-30YR` - Oakridge Architectural Shingles 30yr
- `FELT-ROOF-30LB-432SF` - #30 Roofing Felt 432 SF
- `VENT-RIDGE-4FT` - Ridge Vent 4ft Section

**Windows & Doors**:
- `WINDOW-DH-3060-VINYL-WHT` - 3'0"x6'0" Double-Hung Vinyl Window White
- `DOOR-STEEL-COMM-3670-PRIM` - 3'6"x7'0" Commercial Steel Door Primed
- `LOCKSET-COMM-GRADE2-SN` - Commercial Grade 2 Lockset Satin Nickel

**Fasteners & Hardware**:
- `NAIL-FRAME-16D-5LB` - 16d Framing Nails 5lb Box
- `SCREW-DRYWALL-1-1/4-5LB` - 1-1/4" Drywall Screws 5lb
- `ADHESIVE-CONST-28OZ` - Construction Adhesive 28oz

**Service Products**:
- `SVC-DEL-JOBSITE` - Job Site Delivery with Equipment
- `SVC-FAB-LUMBER-CUT` - Precision Lumber Cutting
- `SVC-INST-WINDOW` - Window Installation Service

---

### Price Book Structure Summary

| Level | Name | Type | Parent | Assigned Companies |
|-------|------|------|--------|-------------------|
| 1 | US-Retail | Base (Currency: USD) | - | (Consumer segment) |
| 1 | US-Contract | Base (Currency: USD) | - | (Contract segment) |
| 2 | Retail-Consumer | Segment | US-Retail | (Consumer customers) |
| 2 | Contract-Commercial | Segment | US-Contract | (Commercial base) |
| 2 | Contract-Residential | Segment | US-Contract | (Residential base) |
| 2 | Contract-Pro | Segment | US-Contract | (Pro base) |
| 3 | Commercial-Tier1 | Volume Tier | Contract-Commercial | (Mid-volume commercial) |
| 3 | Commercial-Tier2 | Volume Tier | Contract-Commercial | Premium Commercial Builders |
| 3 | Residential-Builder | Volume Tier | Contract-Residential | Coastal Residential Builders |
| 3 | Pro-Specialty | Volume Tier | Contract-Pro | Elite Trade Contractors |

**Pricing Strategy**: Companies assigned to Tier 3 catalogs receive best pricing through hierarchical inheritance (Tier3 → Segment → Base). Higher purchase volumes qualify for deeper tier assignments.

---

### HTTP Headers for Demo Scenarios

**Scenario 1: Commercial New Construction**
```bash
-H "AC-Policy-Project-Type: new_construction"
-H "AC-Policy-Product-Category: structural_materials"
```

**Scenario 2: Residential Remodel**
```bash
-H "AC-Policy-Project-Type: remodel"
-H "AC-Policy-Product-Category: windows_doors"
```

**Scenario 3: Project Type Comparison**
```bash
# Test 1: New Construction
-H "AC-Policy-Project-Type: new_construction"

# Test 2: Remodel
-H "AC-Policy-Project-Type: remodel"

# Test 3: Repair
-H "AC-Policy-Project-Type: repair"

# Test 4: Restoration
-H "AC-Policy-Project-Type: restoration"
```

**Scenario 4: Brand Filtering**
```bash
-H "AC-Policy-Brand: buildright_pro"
```

---

### GraphQL Query Examples

**Basic Product Query** (no filtering):
```graphql
query {
  products(pageSize: 20) {
    items {
      sku
      name
      price {
        regular
      }
      attributes {
        code
        values
      }
    }
  }
}
```

**Product Query with Project Type Filter** (requires HTTP header `AC-Policy-Project-Type: new_construction`):
```graphql
query {
  products(pageSize: 20) {
    items {
      sku
      name
      attributes(codes: ["project_types", "product_category", "brand"]) {
        code
        values
      }
    }
  }
}
```

**Price Query for Specific Product**:
```graphql
query {
  product(sku: "LBR-2X4-8-SPF-STD") {
    sku
    name
    price {
      regular
      minimum
      maximum
      tierPrices {
        quantity
        price
      }
    }
  }
}
```

---

## Summary & Next Steps

### Key Takeaways

**Business Value**:
- ACO enables BuildRight to serve diverse customer segments with personalized catalogs
- 60% reduction in ordering errors through project-specific product filtering
- 70% faster product discovery by eliminating irrelevant catalog clutter
- Hierarchical pricing rewards volume customers automatically
- Intelligent attribute assignment reduces manual data entry and ensures consistency

**Technical Innovation**:
- Trigger-based policies enable unlimited catalog variations from single product dataset
- Real-time filtering via HTTP headers (no pre-built catalog views required)
- Composable catalog model supports complex B2B scenarios
- Integration with Adobe Commerce B2B for company/pricing management
- **Intelligent project type assignment**: Category-aware algorithm automatically assigns appropriate project types based on product classification

**Demo Highlights**:
- 4 demo scenarios covering commercial, residential, project types, multi-location
- 6 key features with business value talking points
- 184 products across 19 categories (5 parent, 14 child) demonstrating real-world construction materials
- 10 hierarchical price books showing volume tier pricing
- **34 metadata attributes** (enhanced from 20 planned) demonstrating comprehensive industry coverage
- **Intelligent assignment logic** showcasing AI-driven data management capabilities

### Next Steps for Presenters

1. **Practice the Demo**:
   - Run through all 4 scenarios at least twice before presenting
   - Test HTTP header commands in advance
   - Have backup curl commands ready in case of UI issues

2. **Customize for Audience**:
   - Use short version (10 min) for executives
   - Use standard version (20 min) for business stakeholders
   - Use deep dive version (30-45 min) for technical architects

3. **Prepare for Questions**:
   - Review "Common Questions & Answers" section
   - Know ACO's limitations (inventory management not included)
   - Understand integration points with Adobe Commerce and ERP systems

4. **Follow-Up Materials**:
   - Share this guide with attendees post-demo
   - Provide link to BuildRight architecture documentation
   - Offer to schedule technical deep dive session

---

**Document Version**: 1.1
**Last Updated**: 2025-10-30
**Enhancement Documentation Added**: Implementation enhancements (34 attributes, project_types intelligent assignment, 19 categories)

**Related Documentation**:
- `/docs/architecture/buildright-b2b-structure.md` - B2B company/team hierarchy
- `/docs/manual-setup/trigger-policy-guide.md` - Complete policy configuration guide
- `/instructions/01-original-plan.md` - Full creative brief with Implementation Enhancements section
- `/instructions/02-reduced-scope-plan.md` - Implementation scope with actual implementation details (34 attributes, 19 categories)
- `/.rptc/research/data-mapping-to-creative-brief/research.md` - Comprehensive verification report (92% alignment)
