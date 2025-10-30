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
└── Companies [8 demo companies]
    │
    ├── BuildRight Commercial Division (3 companies)
    │   ├── Premium Commercial Builders Inc. → Commercial-Tier2
    │   ├── Metro Construction Group → Commercial-Tier1
    │   └── Industrial Builders Corp → Contract-Commercial
    │
    ├── BuildRight Residential Division (3 companies)
    │   ├── Coastal Residential Builders → Residential-Builder
    │   ├── Family Homes LLC → Contract-Residential
    │   └── Classic Remodeling Co. → Contract-Residential
    │
    └── BuildRight Pro Division (2 companies)
        ├── Elite Trade Contractors → Pro-Specialty
        └── Regional Pro Services → Contract-Pro
```

---

## Company Structure Details

### BuildRight Commercial Division

#### Company 1: Premium Commercial Builders Inc.
- **Shared Catalog:** Commercial-Tier2 (highest volume tier)
- **Location Count:** 3 locations
- **Teams:**
  - Los Angeles Headquarters
  - San Francisco Bay Area
  - Orange County Division
- **User Count:** 6-8 users
- **Region:** Western (California)

#### Company 2: Metro Construction Group
- **Shared Catalog:** Commercial-Tier1 (volume tier 1)
- **Location Count:** 3 locations
- **Teams:**
  - Phoenix Headquarters
  - Tucson Office
  - Flagstaff Branch
- **User Count:** 6-8 users
- **Region:** Western (Arizona)

#### Company 3: Industrial Builders Corp
- **Shared Catalog:** Contract-Commercial (segment level)
- **Location Count:** 3 locations
- **Teams:**
  - Las Vegas Headquarters
  - Henderson Office
  - Reno Branch
- **User Count:** 6-7 users
- **Region:** Western (Nevada)

---

### BuildRight Residential Division

#### Company 4: Coastal Residential Builders
- **Shared Catalog:** Residential-Builder (production builder tier)
- **Location Count:** 3 locations
- **Teams:**
  - San Diego Headquarters
  - Carlsbad Division
  - Chula Vista Office
- **User Count:** 5-7 users
- **Region:** Western (California)

#### Company 5: Family Homes LLC
- **Shared Catalog:** Contract-Residential (segment level)
- **Location Count:** 2 locations
- **Teams:**
  - Austin Headquarters
  - San Antonio Branch
- **User Count:** 4-5 users
- **Region:** Central (Texas)

#### Company 6: Classic Remodeling Co.
- **Shared Catalog:** Contract-Residential (segment level)
- **Location Count:** 2 locations
- **Teams:**
  - Portland Headquarters
  - Beaverton Branch
- **User Count:** 4-5 users
- **Region:** Western (Oregon)

---

### BuildRight Pro Division

#### Company 7: Elite Trade Contractors
- **Shared Catalog:** Pro-Specialty (specialty tier)
- **Location Count:** 3 locations
- **Teams:**
  - Seattle Headquarters
  - Bellevue Office
  - Tacoma Branch
- **User Count:** 5-6 users
- **Region:** Western (Washington)

#### Company 8: Regional Pro Services
- **Shared Catalog:** Contract-Pro (segment level)
- **Location Count:** 2 locations
- **Teams:**
  - Denver Headquarters
  - Colorado Springs Office
- **User Count:** 4-5 users
- **Region:** Central (Colorado)

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

### Western Region (6 companies)
- California: Premium Commercial Builders, Coastal Residential Builders
- Arizona: Metro Construction Group
- Nevada: Industrial Builders Corp
- Washington: Elite Trade Contractors
- Oregon: Classic Remodeling Co.

### Central Region (2 companies)
- Texas: Family Homes LLC
- Colorado: Regional Pro Services

**Total Coverage:** 8 states across Western and Central US regions

---

## Team/Location Summary

**Total Locations:** 21 across 8 companies

**Distribution:**
- 3-location companies: 6 companies (18 locations)
- 2-location companies: 2 companies (3 locations)

**Average:** 2.6 locations per company

---

## User Distribution

**Total Users:** 40-51 across all companies

**Role Distribution (Recommended):**
- Default User: 60% (24-30 users) - Standard buyers
- Senior Buyer: 25% (10-13 users) - Experienced purchasing
- Approver: 10% (4-5 users) - Order approval authority
- Administrator: 5% (2-3 users) - Full company management

**User Assignment:**
- Large companies (3 locations): 6-8 users
- Medium companies (2 locations): 4-5 users

---

## Visual Hierarchy: Sample Company

### Premium Commercial Builders Inc. (Detailed View)

```
Premium Commercial Builders Inc.
│   Shared Catalog: Commercial-Tier2
│   Company Admin: John Smith (jsmith@premiumcommercial.example.com)
│   Legal Address: 1500 Commerce Drive, Los Angeles, CA 90001
│
├── Team 1: Los Angeles Headquarters
│   ├── User 1: Emily Johnson (Senior Buyer)
│   ├── User 2: Michael Chen (Default User)
│   └── User 3: Amanda Garcia (Approver)
│
├── Team 2: San Francisco Bay Area
│   ├── User 4: Carlos Rodriguez (Project Manager / Default User)
│   ├── User 5: Jessica Lee (Senior Buyer)
│   └── User 6: Brian Wong (Default User)
│
└── Team 3: Orange County Division
    ├── User 7: Rachel Patel (Default User)
    └── User 8: David Kim (Senior Buyer)
```

---

## Integration Points

### ACO Integration
- Companies purchasing from same product catalog (150 SKUs)
- Pricing differentiated via Shared Catalog assignment
- Order data flows to ACO for analytics and optimization

### MSI Integration
- Company locations may align with inventory sources
- Team structure mirrors geographic warehouse distribution
- Order fulfillment optimized by location proximity

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
**Demo:** Show high-volume customer receiving best pricing

### Scenario 2: Segment Pricing
**Company:** Family Homes LLC
**Catalog:** Contract-Residential (residential segment)
**Demo:** Show residential contractor pricing vs commercial

### Scenario 3: Multi-Location Operations
**Company:** Metro Construction Group
**Catalog:** Commercial-Tier1
**Teams:** 3 locations (Phoenix, Tucson, Flagstaff)
**Demo:** Show different teams within same company ordering

### Scenario 4: Specialty Trade Focus
**Company:** Elite Trade Contractors
**Catalog:** Pro-Specialty (specialty trades)
**Demo:** Show specialty contractor accessing specialized pricing

---

## Configuration Summary

### Manual Setup Requirements
- **Shared Catalogs:** 10 catalogs (already created from price books)
- **Companies:** 8 companies to create
- **Teams:** 21 teams to configure
- **Users:** 40-51 users to create
- **Estimated Time:** 18-22 hours

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
2. **Creative Brief Update:** Reference 8 companies in `instructions/01-original-plan.md`
3. **Storefront Testing:** Validate pricing and catalog visibility per company
4. **Quote Workflows:** Configure approval workflows if using quotes
5. **Analytics Setup:** Prepare for order tracking and reporting by company/division

---

## Appendix: Quick Reference Table

| Company | Division | Catalog | Level | Locations | Region |
|---------|----------|---------|-------|-----------|--------|
| Premium Commercial Builders Inc. | Commercial | Commercial-Tier2 | Tier (L3) | 3 | CA |
| Metro Construction Group | Commercial | Commercial-Tier1 | Tier (L3) | 3 | AZ |
| Industrial Builders Corp | Commercial | Contract-Commercial | Segment (L2) | 3 | NV |
| Coastal Residential Builders | Residential | Residential-Builder | Tier (L3) | 3 | CA |
| Family Homes LLC | Residential | Contract-Residential | Segment (L2) | 2 | TX |
| Classic Remodeling Co. | Residential | Contract-Residential | Segment (L2) | 2 | OR |
| Elite Trade Contractors | Pro | Pro-Specialty | Tier (L3) | 3 | WA |
| Regional Pro Services | Pro | Contract-Pro | Segment (L2) | 2 | CO |

**Total:** 8 companies, 21 locations, 3 divisions, 10 catalogs (3 levels)
