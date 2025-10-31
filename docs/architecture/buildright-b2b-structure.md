# BuildRight B2B Structure - Architecture Overview

## Purpose

This document provides a visual and conceptual overview of the BuildRight B2B organizational structure, including the hierarchical relationship between Shared Catalogs (price books), companies, teams, and users.

**Related Documentation:**
- Detailed setup instructions: `docs/manual-setup/b2b-configuration-guide.md`
- Price book data: `data/buildright/price-books.json`
- Creative brief: `instructions/01-original-plan.md`

---

## Hierarchical Architecture

### Overall Entity Hierarchy

```
Adobe Commerce B2B Structure
│
├── Shared Catalogs (Price Books) [10 hierarchical catalogs]
│   │
│   ├── Level 1: Base Catalogs (2)
│   │   ├── US-Retail (currency: USD)
│   │   └── US-Contract (currency: USD)
│   │
│   ├── Level 2: Segment Catalogs (4)
│   │   ├── Retail-Consumer (parent: US-Retail)
│   │   ├── Contract-Commercial (parent: US-Contract)
│   │   ├── Contract-Residential (parent: US-Contract)
│   │   └── Contract-Pro (parent: US-Contract)
│   │
│   └── Level 3: Tier Catalogs (4)
│       ├── Commercial-Tier1 (parent: Contract-Commercial)
│       ├── Commercial-Tier2 (parent: Contract-Commercial)
│       ├── Residential-Builder (parent: Contract-Residential)
│       └── Pro-Specialty (parent: Contract-Pro)
│
└── Companies [3 demo companies]
    │
    ├── BuildRight Commercial Division (1 company)
    │   └── Premium Commercial Builders Inc. → Commercial-Tier2
    │
    ├── BuildRight Residential Division (1 company)
    │   └── Coastal Residential Builders → Residential-Builder
    │
    └── BuildRight Pro Division (1 company)
        └── Elite Trade Contractors → Pro-Specialty
```

---

## Company Structure Details

### BuildRight Commercial Division

#### Company 1: Premium Commercial Builders Inc.
- **Shared Catalog:** Commercial-Tier2 (highest volume tier)
- **Location Count:** 2 locations
- **Teams:**
  - Los Angeles Headquarters (CA)
  - Phoenix Metro Division (AZ)
- **User Count:** 4 users (2 per location)
- **Region:** Western (California, Arizona)
- **Business Focus:** Large-scale commercial construction projects (office buildings, hospitals, schools)

---

### BuildRight Residential Division

#### Company 2: Coastal Residential Builders
- **Shared Catalog:** Residential-Builder (production builder tier)
- **Location Count:** 2 locations
- **Teams:**
  - Dallas Headquarters (TX)
  - Denver Division (CO)
- **User Count:** 4 users (2 per location)
- **Region:** Central (Texas, Colorado)
- **Business Focus:** Production home builders and residential remodelers (50-200 homes annually)

---

### BuildRight Pro Division

#### Company 3: Elite Trade Contractors
- **Shared Catalog:** Pro-Specialty (specialty tier)
- **Location Count:** 2 locations
- **Teams:**
  - Charlotte Headquarters (NC)
  - Atlanta Division (GA)
- **User Count:** 4 users (2 per location)
- **Region:** Eastern (North Carolina, Georgia)
- **Business Focus:** Specialty trade contractors (electrical, plumbing, HVAC)

---

## Shared Catalog Assignment Strategy

### Pricing Tier Distribution

**Commercial Division:**
- Highest volume customers → Commercial-Tier2 (deepest discounts)
- Mid-volume customers → Commercial-Tier1 (moderate discounts)
- Standard commercial → Contract-Commercial (base commercial pricing)

**Residential Division:**
- Production builders (high volume) → Residential-Builder (builder tier)
- Standard residential contractors → Contract-Residential (segment level)

**Pro Division:**
- Specialty trades (focused volume) → Pro-Specialty (specialty tier)
- General pro contractors → Contract-Pro (segment level)

### Visual Pricing Hierarchy

```
                    BASE LEVEL
               ┌─────────────────┐
               │   US-Contract   │
               │   (Base USD)    │
               └────────┬────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    SEGMENT LEVEL   SEGMENT LEVEL  SEGMENT LEVEL
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │Contract- │   │Contract- │   │Contract- │
    │Commercial│   │Residential│   │   Pro    │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
    ┌────┴────┐    ┌────┴────┐         │
    │         │    │         │         │
TIER LEVEL    │    │         │    TIER LEVEL
┌─────────┐   │    │         │   ┌─────────┐
│Commercial│  │    │         │   │   Pro-  │
│  Tier1   │  │    │         │   │Specialty│
└──────────┘  │    │         │   └─────────┘
              │    │         │
┌─────────────┘    │         │
│                  │         │
│              ┌───┘         │
│              │             │
TIER LEVEL     TIER LEVEL    │
┌─────────┐   ┌─────────┐   │
│Commercial│   │Residential│ │
│  Tier2   │   │  Builder  │ │
└──────────┘   └───────────┘ │
                              │
        Companies assigned    │
        to appropriate tiers  │
        based on volume ──────┘
```

### Pricing Hierarchy Inheritance

Price books inherit pricing from parent catalogs:

```
US-Contract (base pricing)
    ↓
Contract-Commercial (commercial segment adjustments)
    ↓
Commercial-Tier1 (volume tier 1 additional discounts)

US-Contract (base pricing)
    ↓
Contract-Commercial (commercial segment adjustments)
    ↓
Commercial-Tier2 (volume tier 2 deeper discounts)
```

---

## Geographic Distribution

### National Coverage (3 companies across 3 regions)

**Western Region:**
- Premium Commercial Builders Inc.: California (Los Angeles HQ), Arizona (Phoenix)

**Central Region:**
- Coastal Residential Builders: Texas (Dallas HQ), Colorado (Denver)

**Eastern Region:**
- Elite Trade Contractors: North Carolina (Charlotte HQ), Georgia (Atlanta)

**Total Coverage:** 6 states across 3 US regions (West, Central, East) - **National distribution**

---

## Team/Location Summary

**Total Locations:** 6 across 3 companies

**Distribution:**
- Each company: 2 locations

**Average:** 2 locations per company

---

## User Distribution

**Total Users:** 12 across all companies (4 per company)

**Role Distribution (Recommended):**
- Default User: 50% (6 users) - Standard buyers
- Senior Buyer: 25% (3 users) - Experienced purchasing
- Approver: 17% (2 users) - Order approval authority
- Administrator: 8% (1 user) - Full company management

**User Assignment:**
- Each company: 4 users (2 per location)

---

## Visual Hierarchy: Sample Company

### Premium Commercial Builders Inc. (Detailed View)

```
Premium Commercial Builders Inc.
│   Shared Catalog: Commercial-Tier2
│   Company Admin: John Smith (jsmith@premiumcommercial.example.com)
│   Legal Address: 1500 Commerce Drive, Los Angeles, CA 90001
│   Region: Western (CA, AZ)
│
├── Team 1: Los Angeles Headquarters (CA)
│   ├── User 1: John Smith (Company Admin / Approver)
│   └── User 2: Emily Johnson (Senior Buyer)
│
└── Team 2: Phoenix Metro Division (AZ)
    ├── User 3: Michael Chen (Default User)
    └── User 4: Amanda Garcia (Senior Buyer)
```

---

## Complete Company Overview: National Distribution

### All Three Companies with Geographic Coverage

```
WESTERN REGION
┌─────────────────────────────────────────────────────────────┐
│ Premium Commercial Builders Inc.                            │
│ Catalog: Commercial-Tier2 | Division: Commercial            │
│                                                              │
│ ├── Los Angeles HQ (CA)                                     │
│ │   ├── John Smith (Company Admin)                          │
│ │   └── Emily Johnson (Senior Buyer)                        │
│ │                                                            │
│ └── Phoenix Metro (AZ)                                      │
│     ├── Michael Chen (Default User)                         │
│     └── Amanda Garcia (Senior Buyer)                        │
└─────────────────────────────────────────────────────────────┘

CENTRAL REGION
┌─────────────────────────────────────────────────────────────┐
│ Coastal Residential Builders                                │
│ Catalog: Residential-Builder | Division: Residential        │
│                                                              │
│ ├── Dallas HQ (TX)                                          │
│ │   ├── Maria Garcia (Company Admin)                        │
│ │   └── Robert Taylor (Senior Buyer)                        │
│ │                                                            │
│ └── Denver Division (CO)                                    │
│     ├── Sarah Martinez (Default User)                       │
│     └── James Wilson (Senior Buyer)                         │
└─────────────────────────────────────────────────────────────┘

EASTERN REGION
┌─────────────────────────────────────────────────────────────┐
│ Elite Trade Contractors                                     │
│ Catalog: Pro-Specialty | Division: Pro                      │
│                                                              │
│ ├── Charlotte HQ (NC)                                       │
│ │   ├── David Chen (Company Admin)                          │
│ │   └── Lisa Anderson (Senior Buyer)                        │
│ │                                                            │
│ └── Atlanta Division (GA)                                   │
│     ├── Kevin Brown (Default User)                          │
│     └── Jennifer Davis (Senior Buyer)                       │
└─────────────────────────────────────────────────────────────┘
```

**National Coverage Summary:**
- **6 states**: CA, AZ, TX, CO, NC, GA
- **3 regions**: Western, Central, Eastern
- **6 locations**: 2 per company
- **12 users**: 4 per company, 2 per location
- **3 pricing tiers**: Commercial-Tier2, Residential-Builder, Pro-Specialty

---

## Integration Points

### ACO Integration
- Companies purchasing from same product catalog (150 SKUs)
- Pricing differentiated via Shared Catalog assignment
- Order data flows to ACO for analytics and optimization

### MSI Integration
- **National distribution centers**: Sacramento CA, Charlotte NC aligned with company regions
- **Regional warehouses**: Phoenix AZ (West), Denver CO (Central), Atlanta GA (East)
- Team structure mirrors geographic warehouse distribution
- Order fulfillment optimized by location proximity to regional inventory

### Quote Management
- All companies enabled for B2B quotes
- Approvers can review and accept quotes
- Quote workflow aligns with company hierarchy

---

## Business Logic & Rules

### Catalog Assignment Rules
1. **Volume-based assignment:** Higher volume customers → deeper tier catalogs
2. **Segment specialization:** Division alignment (Commercial, Residential, Pro)
3. **Single catalog per company:** Each company assigned to exactly one Shared Catalog

### Team Structure Rules
1. **Geographic teams:** Teams represent physical locations/branches
2. **Flat hierarchy:** Single-level team structure (no nested sub-teams)
3. **2-4 locations per company:** Realistic multi-branch distribution model

### User Assignment Rules
1. **Team membership:** Each user assigned to one team within their company
2. **Role-based access:** Roles define purchasing and approval capabilities
3. **Active status required:** Only active users can place orders

---

## Demo Scenarios

### Scenario 1: Volume Tier Showcase
**Company:** Premium Commercial Builders Inc.
**Catalog:** Commercial-Tier2 (deepest discounts)
**Demo:** Show high-volume commercial customer receiving best pricing

### Scenario 2: Production Builder Pricing
**Company:** Coastal Residential Builders
**Catalog:** Residential-Builder (residential production tier)
**Demo:** Show residential production builder pricing vs commercial

### Scenario 3: Multi-Location Operations
**Company:** Premium Commercial Builders Inc.
**Catalog:** Commercial-Tier2
**Teams:** 2 locations (Los Angeles HQ, San Francisco Bay Area)
**Demo:** Show different teams within same company ordering

### Scenario 4: Specialty Trade Focus
**Company:** Elite Trade Contractors
**Catalog:** Pro-Specialty (specialty trades)
**Demo:** Show specialty contractor accessing specialized pricing

---

## Configuration Summary

### Manual Setup Requirements
- **Shared Catalogs:** 10 catalogs (already created from price books)
- **Companies:** 3 companies to create
- **Teams:** 6 teams to configure
- **Users:** 12 users to create
- **Estimated Time:** 6-8 hours

### Automation Opportunities
- Company creation could be scripted (if ACO supports Company API)
- User import via CSV (if Adobe Commerce import supported)
- Team structure templating for similar companies

### Maintenance Considerations
- Catalog pricing updates: Adjust in Shared Catalog pricing
- New location additions: Add teams to existing companies
- User lifecycle: Activate/deactivate based on employment status
- Seasonal adjustments: Update Shared Catalog tier assignments

---

## Alignment with BuildRight Narrative

### Three-Division Model
BuildRight operates three specialized divisions:
1. **BuildRight Commercial:** Serving large-scale commercial construction
2. **BuildRight Residential:** Supporting residential builders and remodelers
3. **BuildRight Pro:** Specialty trade contractors (electrical, plumbing, HVAC)

### Geographic Coverage
- **Western Region:** California, Nevada, Arizona, Oregon, Washington
- **Central Region:** Texas, Colorado

### Customer Types
- **Volume buyers:** Commercial-Tier1, Commercial-Tier2 (repeat high-volume)
- **Production builders:** Residential-Builder (standardized high-volume)
- **Specialty trades:** Pro-Specialty (focused product expertise)
- **Standard contractors:** Segment-level catalogs (Contract-*)

---

## Next Steps

1. **Manual Setup:** Follow `docs/manual-setup/b2b-configuration-guide.md` for detailed instructions
2. **Creative Brief Update:** Reference 3 companies in `instructions/01-original-plan.md`
3. **Storefront Testing:** Validate pricing and catalog visibility per company
4. **Quote Workflows:** Configure approval workflows if using quotes
5. **Analytics Setup:** Prepare for order tracking and reporting by company/division

---

## Appendix: Quick Reference Table

| Company | Division | Catalog | Level | Locations | Region |
|---------|----------|---------|-------|-----------|--------|
| Premium Commercial Builders Inc. | Commercial | Commercial-Tier2 | Tier (L3) | 2 | CA |
| Coastal Residential Builders | Residential | Residential-Builder | Tier (L3) | 2 | CA |
| Elite Trade Contractors | Pro | Pro-Specialty | Tier (L3) | 2 | WA |

**Total:** 3 companies, 6 locations, 3 divisions, 10 catalogs (3 levels)
