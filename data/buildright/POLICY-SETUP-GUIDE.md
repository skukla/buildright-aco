# ACO Triggered Policy Setup Guide

**Purpose**: Manual configuration guide for ACO Admin UI

**IMPORTANT**: Triggered policies cannot be created via API. Each policy below must be created manually in the ACO Admin interface.

---

## Overview

This guide documents **10 policy categories** with **28 individual policies** for the BuildRight persona demo.

### Policy Categories

1. **CONSTRUCTION_PHASE**: 3 policies
2. **QUALITY_TIER**: 3 policies
3. **PACKAGE_TIER**: 3 policies
4. **ROOM_CATEGORY**: 3 policies
5. **DECK_SHAPE**: 3 policies
6. **DECK_MATERIAL**: 3 policies
7. **DECK_COMPATIBLE**: 1 policies
8. **STORE_VELOCITY**: 3 policies
9. **RESTOCK_PRIORITY**: 3 policies
10. **PROJECT_TYPE**: 3 policies

---

## CONSTRUCTION PHASE

### Policy: Foundation & Framing Phase

**Policy ID**: `foundation_framing`

**Configuration in ACO Admin UI:**

- **Name**: Foundation & Framing Phase
- **Trigger**: HTTP Header: AC-Policy-Phase
- **Filter Type**: attribute_match
- **Attribute**: `construction_phase`
- **Value**: `foundation_framing`

**Description**: Shows structural materials for foundation and framing work

**Use Case**: Marcus ordering Phase 1 materials for custom home

**Products Shown**: Concrete, rebar, lumber, fasteners, structural hardware

---

### Policy: Building Envelope Phase

**Policy ID**: `envelope`

**Configuration in ACO Admin UI:**

- **Name**: Building Envelope Phase
- **Trigger**: HTTP Header: AC-Policy-Phase
- **Filter Type**: attribute_match
- **Attribute**: `construction_phase`
- **Value**: `envelope`

**Description**: Shows materials for building envelope (weather barrier)

**Use Case**: Marcus ordering Phase 2 materials (windows, doors, roofing)

**Products Shown**: Windows, doors, roofing materials, weather barriers, flashing

---

### Policy: Interior Finish Phase

**Policy ID**: `interior_finish`

**Configuration in ACO Admin UI:**

- **Name**: Interior Finish Phase
- **Trigger**: HTTP Header: AC-Policy-Phase
- **Filter Type**: attribute_match
- **Attribute**: `construction_phase`
- **Value**: `interior_finish`

**Description**: Shows finish materials for interior work

**Use Case**: Marcus ordering Phase 3 materials (drywall, trim, flooring)

**Products Shown**: Drywall, trim, paint, flooring, fixtures

---

## QUALITY TIER

### Policy: Builder Grade Materials

**Policy ID**: `builder_grade`

**Configuration in ACO Admin UI:**

- **Name**: Builder Grade Materials
- **Trigger**: HTTP Header: AC-Policy-Quality
- **Filter Type**: attribute_match
- **Attribute**: `quality_tier`
- **Value**: `builder_grade`

**Description**: Shows budget-friendly builder grade products

**Use Case**: Marcus building spec home with cost constraints

**Products Shown**: Standard materials optimized for cost

---

### Policy: Professional Grade Materials

**Policy ID**: `professional`

**Configuration in ACO Admin UI:**

- **Name**: Professional Grade Materials
- **Trigger**: HTTP Header: AC-Policy-Quality
- **Filter Type**: attribute_match
- **Attribute**: `quality_tier`
- **Value**: `professional`

**Description**: Shows mid-tier professional grade products

**Use Case**: Marcus building custom home with quality expectations

**Products Shown**: Professional-grade materials balancing quality and cost

---

### Policy: Premium Grade Materials

**Policy ID**: `premium`

**Configuration in ACO Admin UI:**

- **Name**: Premium Grade Materials
- **Trigger**: HTTP Header: AC-Policy-Quality
- **Filter Type**: attribute_match
- **Attribute**: `quality_tier`
- **Value**: `premium`

**Description**: Shows high-end premium products

**Use Case**: Marcus building luxury custom home

**Products Shown**: Premium materials for high-end projects

---

## PACKAGE TIER

### Policy: Good Tier Package

**Policy ID**: `good`

**Configuration in ACO Admin UI:**

- **Name**: Good Tier Package
- **Trigger**: HTTP Header: AC-Policy-Package-Tier
- **Filter Type**: attribute_match
- **Attribute**: `package_tier`
- **Value**: `good`

**Description**: Shows budget-friendly package components

**Use Case**: Lisa building "Good" bathroom remodel package

**Products Shown**: Builder-grade fixtures, standard materials

**Price Range**: $8,000-$12,000

---

### Policy: Better Tier Package

**Policy ID**: `better`

**Configuration in ACO Admin UI:**

- **Name**: Better Tier Package
- **Trigger**: HTTP Header: AC-Policy-Package-Tier
- **Filter Type**: attribute_match
- **Attribute**: `package_tier`
- **Value**: `better`

**Description**: Shows mid-range package components

**Use Case**: Lisa building "Better" bathroom remodel package

**Products Shown**: Mid-range fixtures, quality materials

**Price Range**: $14,000-$18,000

---

### Policy: Best Tier Package

**Policy ID**: `best`

**Configuration in ACO Admin UI:**

- **Name**: Best Tier Package
- **Trigger**: HTTP Header: AC-Policy-Package-Tier
- **Filter Type**: attribute_match
- **Attribute**: `package_tier`
- **Value**: `best`

**Description**: Shows premium package components

**Use Case**: Lisa building "Best" bathroom remodel package

**Products Shown**: Premium fixtures, designer materials

**Price Range**: $22,000-$28,000

---

## ROOM CATEGORY

### Policy: Bathroom Products

**Policy ID**: `bathroom`

**Configuration in ACO Admin UI:**

- **Name**: Bathroom Products
- **Trigger**: HTTP Header: AC-Policy-Room
- **Filter Type**: attribute_match
- **Attribute**: `room_category`
- **Value**: `bathroom`

**Description**: Shows bathroom-specific products

**Use Case**: Lisa selecting materials for bathroom remodel

**Products Shown**: Tubs, toilets, vanities, tile, fixtures

---

### Policy: Kitchen Products

**Policy ID**: `kitchen`

**Configuration in ACO Admin UI:**

- **Name**: Kitchen Products
- **Trigger**: HTTP Header: AC-Policy-Room
- **Filter Type**: attribute_match
- **Attribute**: `room_category`
- **Value**: `kitchen`

**Description**: Shows kitchen-specific products

**Use Case**: Lisa selecting materials for kitchen remodel

**Products Shown**: Cabinets, countertops, sinks, appliances

---

### Policy: Universal Room Products

**Policy ID**: `any_room`

**Configuration in ACO Admin UI:**

- **Name**: Universal Room Products
- **Trigger**: HTTP Header: AC-Policy-Room
- **Filter Type**: attribute_match
- **Attribute**: `room_category`
- **Value**: `any`

**Description**: Shows products applicable to any room

**Use Case**: Lisa browsing materials usable in multiple room types

**Products Shown**: Flooring, paint, trim, lighting, drywall

---

## DECK SHAPE

### Policy: Rectangular Deck Products

**Policy ID**: `rectangular`

**Configuration in ACO Admin UI:**

- **Name**: Rectangular Deck Products
- **Trigger**: HTTP Header: AC-Policy-Deck-Shape
- **Filter Type**: attribute_match
- **Attribute**: `deck_shape`
- **Value**: `rectangular`

**Description**: Shows products compatible with rectangular deck layouts

**Use Case**: David building 16x20 rectangular deck

**Products Shown**: Standard decking, joists, railings for rectangular layout

---

### Policy: L-Shaped Deck Products

**Policy ID**: `l_shaped`

**Configuration in ACO Admin UI:**

- **Name**: L-Shaped Deck Products
- **Trigger**: HTTP Header: AC-Policy-Deck-Shape
- **Filter Type**: attribute_match
- **Attribute**: `deck_shape`
- **Value**: `l_shaped`

**Description**: Shows products compatible with L-shaped deck layouts

**Use Case**: David building L-shaped deck around corner of house

**Products Shown**: Decking, corner joists, angled railings

---

### Policy: Multi-Level Deck Products

**Policy ID**: `multi_level`

**Configuration in ACO Admin UI:**

- **Name**: Multi-Level Deck Products
- **Trigger**: HTTP Header: AC-Policy-Deck-Shape
- **Filter Type**: attribute_match
- **Attribute**: `deck_shape`
- **Value**: `multi_level`

**Description**: Shows products for multi-level deck construction

**Use Case**: David building tiered deck with multiple levels

**Products Shown**: Step systems, level transitions, cascading railings

---

## DECK MATERIAL

### Policy: Wood Decking Material

**Policy ID**: `wood`

**Configuration in ACO Admin UI:**

- **Name**: Wood Decking Material
- **Trigger**: HTTP Header: AC-Policy-Deck-Material
- **Filter Type**: attribute_match
- **Attribute**: `deck_material_type`
- **Value**: `wood`

**Description**: Shows wood decking products and compatible accessories

**Use Case**: David selecting pressure-treated lumber decking

**Products Shown**: PT lumber, wood stain, wood screws, wood railings

**Maintenance**: Seal every 2 years

**Lifespan**: 15-20 years

---

### Policy: Composite Decking Material

**Policy ID**: `composite`

**Configuration in ACO Admin UI:**

- **Name**: Composite Decking Material
- **Trigger**: HTTP Header: AC-Policy-Deck-Material
- **Filter Type**: attribute_match
- **Attribute**: `deck_material_type`
- **Value**: `composite`

**Description**: Shows composite decking products and compatible accessories

**Use Case**: David selecting low-maintenance composite decking

**Products Shown**: Composite boards, hidden fasteners, composite railings

**Maintenance**: Wash annually

**Lifespan**: 25-30 years

---

### Policy: PVC Decking Material

**Policy ID**: `pvc`

**Configuration in ACO Admin UI:**

- **Name**: PVC Decking Material
- **Trigger**: HTTP Header: AC-Policy-Deck-Material
- **Filter Type**: attribute_match
- **Attribute**: `deck_material_type`
- **Value**: `pvc`

**Description**: Shows PVC decking products and compatible accessories

**Use Case**: David selecting premium PVC decking

**Products Shown**: PVC boards, specialized fasteners, PVC railings

**Maintenance**: Minimal maintenance

**Lifespan**: 30+ years

---

## DECK COMPATIBLE

### Policy: Deck-Compatible Products

**Policy ID**: `true`

**Configuration in ACO Admin UI:**

- **Name**: Deck-Compatible Products
- **Trigger**: HTTP Header: AC-Policy-Deck-Compatible
- **Filter Type**: attribute_match
- **Attribute**: `deck_compatible`
- **Value**: `true`

**Description**: Shows only products usable in deck projects

**Use Case**: David in deck wizard - sees only relevant products

**Products Shown**: Decking, joists, railings, post caps, lighting, fasteners

---

## STORE VELOCITY

### Policy: High Velocity Products

**Policy ID**: `high_velocity`

**Configuration in ACO Admin UI:**

- **Name**: High Velocity Products
- **Trigger**: HTTP Header: AC-Policy-Velocity
- **Filter Type**: attribute_match
- **Attribute**: `store_velocity_category`
- **Value**: `high`

**Description**: Shows fast-moving products needing frequent restock

**Use Case**: Kevin viewing high-priority restock items

**Products Shown**: Common lumber, popular fasteners, high-turnover items

**Restock Frequency**: 2-3 times per week

---

### Policy: Medium Velocity Products

**Policy ID**: `medium_velocity`

**Configuration in ACO Admin UI:**

- **Name**: Medium Velocity Products
- **Trigger**: HTTP Header: AC-Policy-Velocity
- **Filter Type**: attribute_match
- **Attribute**: `store_velocity_category`
- **Value**: `medium`

**Description**: Shows moderate-moving products

**Use Case**: Kevin reviewing standard restock items

**Products Shown**: Specialty lumber, seasonal items

**Restock Frequency**: Weekly

---

### Policy: Low Velocity Products

**Policy ID**: `low_velocity`

**Configuration in ACO Admin UI:**

- **Name**: Low Velocity Products
- **Trigger**: HTTP Header: AC-Policy-Velocity
- **Filter Type**: attribute_match
- **Attribute**: `store_velocity_category`
- **Value**: `low`

**Description**: Shows slow-moving specialty products

**Use Case**: Kevin checking specialty item stock levels

**Products Shown**: Specialty items, rare materials

**Restock Frequency**: As needed / monthly

---

## RESTOCK PRIORITY

### Policy: Critical Restock Priority

**Policy ID**: `critical`

**Configuration in ACO Admin UI:**

- **Name**: Critical Restock Priority
- **Trigger**: HTTP Header: AC-Policy-Restock-Priority
- **Filter Type**: attribute_match
- **Attribute**: `restock_priority`
- **Value**: `critical`

**Description**: Shows items at critically low stock levels

**Use Case**: Kevin viewing items needing immediate reorder

**Products Shown**: Items below minimum stock threshold

**Action Required**: Order today

---

### Policy: High Restock Priority

**Policy ID**: `high`

**Configuration in ACO Admin UI:**

- **Name**: High Restock Priority
- **Trigger**: HTTP Header: AC-Policy-Restock-Priority
- **Filter Type**: attribute_match
- **Attribute**: `restock_priority`
- **Value**: `high`

**Description**: Shows items approaching restock threshold

**Use Case**: Kevin planning next restock order

**Products Shown**: Items at 20-40% of optimal stock

**Action Required**: Order within 2-3 days

---

### Policy: Medium Restock Priority

**Policy ID**: `medium`

**Configuration in ACO Admin UI:**

- **Name**: Medium Restock Priority
- **Trigger**: HTTP Header: AC-Policy-Restock-Priority
- **Filter Type**: attribute_match
- **Attribute**: `restock_priority`
- **Value**: `medium`

**Description**: Shows items with adequate but declining stock

**Use Case**: Kevin monitoring upcoming needs

**Products Shown**: Items at 40-60% of optimal stock

**Action Required**: Order within 1 week

---

## PROJECT TYPE

### Policy: New Construction Project

**Policy ID**: `new_construction`

**Configuration in ACO Admin UI:**

- **Name**: New Construction Project
- **Trigger**: HTTP Header: AC-Policy-Project-Type
- **Filter Type**: include_categories
- **Categories**: structural_materials, fasteners_hardware, roofing

**Description**: Shows products relevant to new construction projects

**Use Case**: Any persona filtering for new construction materials

**Products Shown**: Structural lumber, concrete, fasteners, roofing

---

### Policy: Remodel Project

**Policy ID**: `remodel`

**Configuration in ACO Admin UI:**

- **Name**: Remodel Project
- **Trigger**: HTTP Header: AC-Policy-Project-Type
- **Filter Type**: include_categories
- **Categories**: windows_doors, flooring, drywall, fixtures

**Description**: Shows products for remodel projects

**Use Case**: Any persona filtering for remodel materials

**Products Shown**: Windows, doors, flooring, trim, fixtures

---

### Policy: Repair Project

**Policy ID**: `repair`

**Configuration in ACO Admin UI:**

- **Name**: Repair Project
- **Trigger**: HTTP Header: AC-Policy-Project-Type
- **Filter Type**: include_all

**Description**: Shows all products for repair work

**Use Case**: Any persona browsing for repair materials

**Products Shown**: All product categories (repairs vary widely)

---

## Implementation Notes

### HTTP Header Format

When querying the ACO GraphQL API, policies are triggered via HTTP headers:

```http
AC-Policy-Phase: foundation_framing
AC-Policy-Quality: professional
AC-Policy-Deck-Shape: rectangular
```

### Frontend Implementation

```javascript
// Example: Marcus selecting Phase 1 materials
const response = await fetch(ACO_GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: {
    'AC-Policy-Phase': 'foundation_framing',
    'AC-Policy-Quality': 'professional'
  },
  body: JSON.stringify({ query: PRODUCTS_QUERY })
});
```

### Testing Policies

1. Create policy in ACO Admin UI
2. Send GraphQL query with appropriate HTTP header
3. Verify product list is filtered correctly
4. Test with multiple policies (they combine with AND logic)

