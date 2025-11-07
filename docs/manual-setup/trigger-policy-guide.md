# ACO Trigger-Based Policy Configuration Guide

## Table of Contents

1. [Overview](#overview)
2. [Quick Reference](#quick-reference)
3. [Policy Types](#policy-types)
4. [Policy Architecture for BuildRight](#policy-architecture-for-buildright)
5. [Policy Examples](#policy-examples)
6. [Creating Policies in ACO UI](#creating-policies-in-aco-ui)
7. [Testing Policies with HTTP Headers](#testing-policies-with-http-headers)
8. [BuildRight-Specific Use Cases](#buildright-specific-use-cases)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Integration with BuildRight Demo](#integration-with-buildright-demo)
12. [Related Documentation](#related-documentation)

---

## Overview

Adobe Commerce Optimizer (ACO) policies enable dynamic catalog filtering based on product attributes and HTTP request headers. This guide demonstrates how to configure trigger-based policies for BuildRight Solutions, creating personalized product catalogs that respond to project requirements, customer attributes, and regional constraints.

**What You'll Learn:**
- Understanding ACO policy types (STATIC vs EXCLUSIVE)
- Creating trigger-based policies using HTTP headers
- Filtering products by project types and customer attributes
- Testing policies with HTTP headers
- Best practices for policy architecture

**Prerequisites:**
- ACO instance configured with BuildRight product catalog
- Product attributes created (product_category, lumber_species, brand, etc.)
- Products ingested with attribute values
- Access to ACO Admin UI or API

**Estimated Time:** 45-60 minutes

---

## Quick Reference

**Related Guides:**
- [B2B Configuration Guide](./b2b-configuration-guide.md) - Company and location setup for multi-tenant scenarios
- [MSI Configuration Guide](./msi-configuration-guide.md) - Inventory management and ACO limitations
- [ACO API Schema](../aco-api-schema.md) - Complete GraphQL schema and query examples

**BuildRight Attributes Used in Policies:**
- `product_category` (select): structural_materials, framing_insulation, windows_doors, fasteners_hardware, safety_equipment
- `project_types` (multiselect): new_construction, remodel, repair, restoration
- `brand` (select): buildright_pro, toughgrip, safeworks, quickfast, propanel, surebuild
- `lumber_species` (select): douglas_fir, southern_pine, spruce_pine_fir, hem_fir
- `ppe_category` (select): head_protection, eye_protection, hearing_protection, hand_protection, high_visibility
- `quality_tier` or `complexity_level` (select): basic, moderate, complex (Project Builder)
- `price_tier` (select, optional): under_5k, 5k_15k, 15k_30k, 30k_50k, 50k_plus (Project Builder)

**Common Trigger Headers:**
- `AC-Policy-Product-Category` - Filter by product category
- `AC-Policy-Project-Type` - Filter by project type
- `AC-Policy-Brand` - Filter by brand preference
- `AC-Policy-Lumber-Species` - Filter by lumber species
- `AC-Policy-Complexity` - Filter by quality/complexity tier (Project Builder)
- `AC-Policy-Budget-Range` - Filter by price range (Project Builder)

---

## Policy Types

ACO supports two distinct policy types for catalog filtering:

### STATIC Policies

**Purpose:** Apply fixed filtering rules that are always active for a catalog view.

**Characteristics:**
- No runtime variables
- Always evaluated the same way
- Applied to all requests to a catalog view
- Ideal for regional filtering, business segment restrictions

**Use Cases:**
- Show only products available in Western region
- Filter products by inventory location
- Restrict to specific product categories

**Example Scenario:**
A BuildRight West Coast catalog that always shows only products with Western distribution.

### EXCLUSIVE (Trigger-Based) Policies

**Purpose:** Apply dynamic filtering rules based on HTTP headers or query parameters passed with each API request.

**Characteristics:**
- Values come from HTTP request headers
- Enable per-request catalog personalization
- Multiple policies can be applied simultaneously
- Ideal for project-specific, customer-specific filtering

**Use Cases:**
- Show only products for current project type (new construction, remodel, repair)
- Filter by customer segment (commercial vs residential)
- Apply customer tier or pricing rules
- Project phase filtering (framing, finishing, etc.)

**Example Scenario:**
A contractor requesting products for a "residential remodel" project receives a different catalog than one requesting "commercial new construction" products, even from the same catalog view.

---

## Policy Architecture for BuildRight

### Layered Policy Strategy

BuildRight uses a layered approach combining STATIC and EXCLUSIVE policies:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Catalog Request                            │
│                   (GraphQL API Call)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: STATIC Policies (Regional/Base Filtering)             │
│ ────────────────────────────────────────────────────────────    │
│ ✓ Always Active                                                 │
│ ✓ No HTTP Headers Required                                      │
│ ✓ Example: West Region Products Only                            │
│ ✓ Filters: available_regions, product_category                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: EXCLUSIVE Policies (Project Context)                  │
│ ────────────────────────────────────────────────────────────    │
│ ⚡ Trigger: AC-Policy-Project-Type HTTP Header                  │
│ ✓ Values: new_construction, remodel, repair, restoration        │
│ ✓ Filters by: project_types attribute (multiselect)             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: EXCLUSIVE Policies (Category Context)                 │
│ ────────────────────────────────────────────────────────────    │
│ ⚡ Trigger: AC-Policy-Product-Category HTTP Header              │
│ ✓ Values: structural_materials, framing_insulation, etc.        │
│ ✓ Filters by: product_category attribute                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: EXCLUSIVE Policies (Brand Context)                    │
│ ────────────────────────────────────────────────────────────    │
│ ⚡ Trigger: AC-Policy-Brand HTTP Header                         │
│ ✓ Values: toughgrip, safeworks, quickfast, etc.                 │
│ ✓ Filters by: brand attribute                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 5: EXCLUSIVE Policies (Complexity - Project Builder)    │
│ ────────────────────────────────────────────────────────────    │
│ ⚡ Trigger: AC-Policy-Complexity HTTP Header                    │
│ ✓ Values: basic, moderate, complex                              │
│ ✓ Filters by: quality_tier or complexity_level attribute        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 6: EXCLUSIVE Policies (Budget Range - Project Builder)   │
│ ────────────────────────────────────────────────────────────    │
│ ⚡ Trigger: AC-Policy-Budget-Range HTTP Header                 │
│ ✓ Values: under_5k, 5k_15k, 15k_30k, 30k_50k, 50k_plus        │
│ ✓ Filters by: price_tier attribute or price range              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Personalized Product Catalog                       │
│ ────────────────────────────────────────────────────────────    │
│ Result: Products matching ALL policy conditions (Logical AND)   │
│ Example: West Region + New Construction + Moderate + 5k_15k     │
└─────────────────────────────────────────────────────────────────┘
```

**Result:** Each request receives a highly personalized catalog matching both static constraints (region) and dynamic context (project type, customer segment).

---

## Policy Examples

### Example 1: STATIC Policy - Product Category Filter

Filter all products to show only structural materials:

```json
{
  "policyId": "static-structural-materials",
  "name": "Structural Materials Only",
  "type": "STATIC",
  "conditions": [
    {
      "attribute": "product_category",
      "operator": "EQUALS",
      "value": "structural_materials"
    }
  ]
}
```

**When to Use:** When a catalog view should always show a specific product category.

### Example 2: EXCLUSIVE Policy - Project Type Filtering

Filter products suitable for specific project types:

```json
{
  "policyId": "project-new-construction",
  "name": "New Construction Project Filter",
  "type": "EXCLUSIVE",
  "trigger": {
    "name": "AC-Policy-Project-Type",
    "transport": "HTTP_HEADER"
  },
  "conditions": [
    {
      "attribute": "project_types",
      "operator": "CONTAINS",
      "valueSource": "TRIGGER"
    }
  ]
}
```

**When to Use:** When requesting a catalog for a specific project type. The HTTP header value (e.g., "new_construction") is matched against products' `project_types` multiselect attribute. Products tagged with multiple project types will appear when any match is found.

### Example 3: EXCLUSIVE Policy - Brand Filtering

Filter products by brand preference:

```json
{
  "policyId": "brand-filter",
  "name": "Brand Preference Filter",
  "type": "EXCLUSIVE",
  "trigger": {
    "name": "AC-Policy-Brand",
    "transport": "HTTP_HEADER"
  },
  "conditions": [
    {
      "attribute": "brand",
      "operator": "EQUALS",
      "valueSource": "TRIGGER"
    }
  ]
}
```

**When to Use:** When requesting a catalog for a specific brand. The HTTP header value (e.g., "toughgrip") is matched against products' `brand` attribute.

### Example 4: EXCLUSIVE Policy - Product Category Filtering

Filter products by category:

```json
{
  "policyId": "category-structural",
  "name": "Structural Materials Filter",
  "type": "EXCLUSIVE",
  "trigger": {
    "name": "AC-Policy-Product-Category",
    "transport": "HTTP_HEADER"
  },
  "conditions": [
    {
      "attribute": "product_category",
      "operator": "EQUALS",
      "valueSource": "TRIGGER"
    }
  ]
}
```

**When to Use:** When requesting a catalog for a specific product category. The HTTP header value (e.g., "structural_materials") is matched against products' `product_category` attribute.

### Example 5: EXCLUSIVE Policy - Brand Preference

Filter products by preferred brand:

```json
{
  "policyId": "brand-filter",
  "name": "Brand Preference Filter",
  "type": "EXCLUSIVE",
  "trigger": {
    "name": "AC-Policy-Brand",
    "transport": "HTTP_HEADER"
  },
  "conditions": [
    {
      "attribute": "brand",
      "operator": "EQUALS",
      "valueSource": "TRIGGER"
    }
  ]
}
```

**When to Use:** When contractors have established relationships with specific brands or contractual requirements.

### Example 6: STATIC Policy - Multi-Attribute Filtering

Combine multiple attribute filters in a static policy:

```json
{
  "policyId": "static-commercial-structural",
  "name": "Commercial Structural Materials",
  "type": "STATIC",
  "conditions": [
    {
      "attribute": "product_category",
      "operator": "EQUALS",
      "value": "structural_materials"
    },
    {
      "attribute": "brand",
      "operator": "IN",
      "value": ["toughgrip", "propanel"]
    }
  ]
}
```

**When to Use:** For catalog views dedicated to commercial structural material contractors.

---

## Creating Policies in ACO UI

### Step 1: Access Policy Management

1. Log in to ACO Admin Console
2. Navigate to **Catalog Management** > **Policies**
3. Click **Create New Policy**

### Step 2: Configure Policy Basics

1. **Policy ID:** Enter unique identifier (e.g., `project-new-construction`)
2. **Policy Name:** Descriptive name (e.g., "New Construction Project Filter")
3. **Policy Type:** Select **STATIC** or **EXCLUSIVE**

### Step 3: Configure Trigger (EXCLUSIVE Policies Only)

For EXCLUSIVE policies:

1. **Trigger Name:** HTTP header name (e.g., `AC-Policy-Project-Type`)
   - Convention: Use `AC-Policy-` prefix for consistency
   - Must match exactly what's sent in HTTP headers
2. **Transport:** Select **HTTP_HEADER**
3. **Data Type:** Select appropriate type (string, integer, etc.)

### Step 4: Define Conditions

Add one or more filtering conditions:

1. **Attribute:** Select product attribute (e.g., `project_types`)
   - Must be an attribute defined in your ACO metadata
   - Must have values assigned to products
2. **Operator:** Choose comparison operator:
   - **EQUALS:** Exact match (use for select attributes)
   - **CONTAINS:** Partial match (use for multiselect attributes)
   - **IN:** Value in list (use for multiselect attributes)
   - **NOT_EQUALS:** Exclusion filter
3. **Value Source:**
   - **STATIC:** Fixed value entered in policy
   - **TRIGGER:** Value from HTTP header (EXCLUSIVE policies)
4. **Value:** Enter value or leave empty if using TRIGGER source

### Step 5: Associate with Catalog View

1. Navigate to **Catalog Views**
2. Select target catalog view
3. In **Policies** section, click **Add Policy**
4. Select your newly created policy
5. Set **Priority** (lower numbers = higher priority)
6. **Save** catalog view configuration

### Step 6: Verify and Test

See "Testing Policies with HTTP Headers" section below.

---

## Testing Policies with HTTP Headers

### Testing STATIC Policies

STATIC policies are always active. Test by querying the catalog view:

```bash
curl -X POST "https://your-aco-instance.adobe.io/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "query": "{ products(catalogView: \"buildright-west\") { items { sku name } } }"
  }'
```

Verify results only include products matching the static policy conditions.

### Testing EXCLUSIVE Policies - Project Type Filter

Test project type filtering by passing the trigger header:

**New Construction Projects:**

```bash
curl -X POST "https://your-aco-instance.adobe.io/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "AC-Policy-Project-Type: new_construction" \
  -d '{
    "query": "{ products(catalogView: \"buildright-west\") { items { sku name attributes { attributeId value } } } }"
  }'
```

**Remodel Projects:**

```bash
curl -X POST "https://your-aco-instance.adobe.io/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "AC-Policy-Project-Type: remodel" \
  -d '{
    "query": "{ products(catalogView: \"buildright-west\") { items { sku name attributes { attributeId value } } } }"
  }'
```

**Repair Projects:**

```bash
curl -X POST "https://your-aco-instance.adobe.io/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "AC-Policy-Project-Type: repair" \
  -d '{
    "query": "{ products(catalogView: \"buildright-west\") { items { sku name } } }"
  }'
```

**Expected Behavior:** Each request returns only products tagged with the specified `project_types` value.

### Testing EXCLUSIVE Policies - Customer Segment Filter

Test customer segment filtering:

**Commercial Customers:**

```bash
curl -X POST "https://your-aco-instance.adobe.io/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "AC-Policy-Customer-Segment: commercial" \
  -d '{
    "query": "{ products(catalogView: \"buildright-west\") { items { sku name } } }"
  }'
```

**Residential Customers:**

```bash
curl -X POST "https://your-aco-instance.adobe.io/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "AC-Policy-Customer-Segment: residential" \
  -d '{
    "query": "{ products(catalogView: \"buildright-west\") { items { sku name } } }"
  }'
```

**Expected Behavior:** Commercial requests show products tagged "commercial" or "both". Residential requests show products tagged "residential" or "both".

### Testing Multiple Triggers Simultaneously

Combine multiple trigger headers to apply multiple policies:

```bash
curl -X POST "https://your-aco-instance.adobe.io/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "AC-Policy-Project-Type: new_construction" \
  -H "AC-Policy-Customer-Segment: commercial" \
  -H "AC-Policy-Brand: buildright_pro" \
  -d '{
    "query": "{ products(catalogView: \"buildright-west\") { items { sku name } } }"
  }'
```

**Expected Behavior:** Only products matching ALL policy conditions are returned (logical AND).

### Verifying Policy Application

Add the `appliedPolicies` field to verify which policies were applied:

```bash
curl -X POST "https://your-aco-instance.adobe.io/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "AC-Policy-Project-Type: new_construction" \
  -d '{
    "query": "{ products(catalogView: \"buildright-west\") { appliedPolicies items { sku name } } }"
  }'
```

---

## BuildRight-Specific Use Cases

### Use Case 1: Project Phase Filtering

A general contractor manages multiple projects simultaneously. Each project is at a different phase (foundation, framing, finishing). The contractor's team uses tablets on-site to order materials.

**Implementation:**
- Mobile app sends `AC-Policy-Project-Type` header based on active project
- New construction projects show structural materials
- Remodel projects emphasize finishing materials
- Repair projects show quick-fix and replacement products

**Benefit:** Workers see only relevant products for their current project phase, reducing ordering errors.

### Use Case 2: Customer Tier Pricing

BuildRight has contractor tiers (Bronze, Silver, Gold, Platinum) with different pricing and product access.

**Implementation:**
- Separate catalog views for each tier
- Trigger-based policies filter premium products for higher tiers
- STATIC policies ensure tier-appropriate base catalog

**Benefit:** Automatic enforcement of tier-based product access without manual catalog management.

### Use Case 3: Regional Inventory Management

BuildRight distributes products from regional warehouses. Products not stocked in a region should not appear in that region's catalog.

**Implementation:**
- STATIC policy on regional catalog views
- Filters by inventory location or distribution region attribute
- EXCLUSIVE policies layer additional filtering on top

**Benefit:** Customers never see products unavailable in their region, improving fulfillment rates.

### Use Case 4: Restoration Projects

Restoration projects often require specialty products (historic materials, specialty finishes).

**Implementation:**
- Products tagged with `project_types: restoration`
- EXCLUSIVE policy with `AC-Policy-Project-Type: restoration` header
- Catalog shows specialty items not typically needed for new construction

**Benefit:** Restoration contractors find specialty products easily without cluttered catalogs.

### Use Case 5: Project Builder Wizard

The Project Builder wizard guides contractors through a step-by-step process to create customized material kits. It requires additional policies beyond basic catalog filtering.

**Implementation:**
- **Project Type Policy**: Uses existing `AC-Policy-Project-Type` header
- **Project Detail Policy**: Uses existing `AC-Policy-Product-Category` header (maps room/area to categories)
- **Complexity Policy**: New `AC-Policy-Complexity` header filters by `quality_tier` or `complexity_level` attribute
  - Values: `basic`, `moderate`, `complex`
  - Products must have quality/complexity tier attribute assigned
- **Budget Range Policy**: New `AC-Policy-Budget-Range` header filters by price range
  - Values: `under_5k`, `5k_15k`, `15k_30k`, `30k_50k`, `50k_plus`
  - May require `price_tier` attribute or price range filtering logic

**Example Query:**
```bash
curl -X POST "https://na1-sandbox.api.commerce.adobe.com/{TENANT_ID}/graphql" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "AC-Policy-Project-Type: remodel" \
  -H "AC-Policy-Product-Category: fasteners_hardware" \
  -H "AC-Policy-Complexity: moderate" \
  -H "AC-Policy-Budget-Range: 5k_15k" \
  -d '{"query": "{ products { items { sku name } } }"}'
```

**Required Product Attributes:**
- `quality_tier` or `complexity_level` (select): `basic`, `moderate`, `complex`
- `price_tier` (optional, select): `under_5k`, `5k_15k`, `15k_30k`, `30k_50k`, `50k_plus`

**Benefit:** Contractors receive curated product bundles tailored to their specific project requirements, complexity level, and budget constraints, reducing decision fatigue and ensuring comprehensive material selection.

---

## Best Practices

### Policy Design

1. **Use Descriptive Names:** Policy names should clearly indicate purpose
   - Good: "New Construction Project Filter"
   - Bad: "Policy 1"

2. **Layer Policies Logically:**
   - Layer 1: Regional/location constraints (STATIC)
   - Layer 2: Project/customer context (EXCLUSIVE)
   - Layer 3: Fine-grained filtering (EXCLUSIVE)

3. **Keep Conditions Simple:** Each policy should have a clear, single purpose

4. **Use Consistent Naming Conventions:**
   - Trigger headers: `AC-Policy-{Context}`
   - Policy IDs: `{type}-{purpose}-{attribute}`

### HTTP Header Conventions

1. **Standardize Header Names:**
   - Use `AC-Policy-` prefix for all trigger headers
   - Use PascalCase or kebab-case consistently
   - Document headers for frontend teams

2. **Validate Header Values:**
   - Ensure values match attribute option values exactly
   - Handle missing headers gracefully (policies won't trigger)

3. **Test Without Headers First:**
   - Verify base catalog works without any triggers
   - Then add triggers incrementally

### Attribute Requirements

1. **Attributes Must Exist:**
   - All attributes referenced in policies must be defined in ACO metadata
   - Attributes must have values assigned to products

2. **Use Appropriate Attribute Types:**
   - Multiselect attributes work great for project_types (products can belong to multiple)
   - Select attributes best for product_category, brand, lumber_species (exclusive choice)
   - Multiselect attributes can use CONTAINS operator (project_types, lumber_certification)
   - Boolean attributes suitable for yes/no filtering (window_energy_star)

3. **Tag Products Thoroughly:**
   - Products without attribute values won't match policies
   - Test with products that have all attribute values set

### Testing Strategy

1. **Test Each Policy Independently:**
   - Create test catalog view with single policy
   - Verify expected products appear

2. **Test Policy Combinations:**
   - Add multiple policies to catalog view
   - Verify logical AND behavior

3. **Test Edge Cases:**
   - Missing trigger headers
   - Invalid trigger values
   - Products with no attribute values

4. **Document Test Cases:**
   - Create postman collections or curl scripts
   - Share with team for regression testing

---

## Troubleshooting

### Quick Diagnostic Table

| Symptom | Common Cause | Quick Check | Fix |
|---------|--------------|-------------|-----|
| All products appear | Policy not associated | Check catalog view policies | Associate policy with catalog view |
| All products appear | Header name mismatch | Compare trigger name to header | Fix spelling/case in header |
| No products returned | Too many filters | Test policies individually | Remove or adjust restrictive policies |
| No products returned | Missing attribute values | Query products for attribute | Tag products with attribute values |
| Wrong products appear | Incorrect operator | Check attribute type | Use CONTAINS for multiselect, EQUALS for select |
| Trigger ignored | Policy type is STATIC | Check policy configuration | Change policy type to EXCLUSIVE |
| Empty results | Value doesn't match | Compare header value to attribute options | Use exact attribute option values |

### Issue: Policy Not Filtering Products

**Symptoms:** All products appear regardless of policy configuration

**Possible Causes:**
1. Policy not associated with catalog view
2. Trigger header name mismatch (check spelling, case sensitivity)
3. Attribute not assigned to products
4. Incorrect operator (use CONTAINS for multiselect, EQUALS for select)

**Resolution:**
1. Verify policy is added to catalog view and enabled
2. Check HTTP header name matches trigger name exactly
3. Query products directly to verify attribute values exist
4. Review operator choice for attribute type

### Issue: No Products Returned

**Symptoms:** Empty result set when policy should match products

**Possible Causes:**
1. Overly restrictive policy combination (too many filters)
2. Trigger value doesn't match any product attribute values
3. Products missing required attribute values

**Resolution:**
1. Test policies individually to isolate issue
2. Verify trigger value matches product attribute option values
3. Query products to confirm attribute assignments

### Issue: Unexpected Products Appear

**Symptoms:** Products not matching policy conditions appear in results

**Possible Causes:**
1. Multiple policies with OR logic (check policy type)
2. Product tagged with multiple values (multiselect attribute)
3. STATIC policy less restrictive than expected

**Resolution:**
1. Review all policies on catalog view
2. Check product attribute values for unexpected tags
3. Adjust policy priority or conditions

### Issue: Trigger Header Not Recognized

**Symptoms:** Policy behaves as if header not sent

**Possible Causes:**
1. Header name mismatch (case sensitivity)
2. Header not sent in request
3. Policy type set to STATIC instead of EXCLUSIVE

**Resolution:**
1. Use browser developer tools or curl -v to verify headers sent
2. Check policy configuration for exact trigger name
3. Verify policy type is EXCLUSIVE

---

## Integration with BuildRight Demo

### Headers for Demo Scenarios

**Scenario 1: Commercial New Construction**
```bash
-H "AC-Policy-Project-Type: new_construction"
-H "AC-Policy-Customer-Segment: commercial"
```

**Scenario 2: Residential Remodel**
```bash
-H "AC-Policy-Project-Type: remodel"
-H "AC-Policy-Customer-Segment: residential"
```

**Scenario 3: Emergency Repair**
```bash
-H "AC-Policy-Project-Type: repair"
-H "AC-Policy-Customer-Segment: residential"
```

**Scenario 4: Historic Restoration**
```bash
-H "AC-Policy-Project-Type: restoration"
-H "AC-Policy-Customer-Segment: commercial"
```

### Frontend Integration

Your frontend application should:

1. Capture project context from user (project type, customer segment)
2. Include appropriate headers with all ACO GraphQL requests
3. Handle cases where policies return empty results
4. Provide UI to change project context (which updates headers)

**Example React Hook:**

```javascript
const useACOHeaders = (projectType, customerSegment) => {
  return {
    'AC-Policy-Project-Type': projectType,
    'AC-Policy-Customer-Segment': customerSegment,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  };
};
```

---

## Related Documentation

- [B2B Configuration Guide](./b2b-configuration-guide.md) - Configure companies, locations, and user management
- [MSI Configuration Guide](./msi-configuration-guide.md) - Understand ACO inventory limitations
- [ACO API Schema](../aco-api-schema.md) - Complete GraphQL schema reference
- [Product Attribute Guide](../../instructions/07-phase-10.md) - Original policy architecture concepts

---

## Summary

ACO trigger-based policies enable BuildRight to deliver highly personalized product catalogs based on real-time project context. By combining STATIC policies (regional constraints) with EXCLUSIVE policies (project and customer context), contractors receive targeted product selections that improve ordering accuracy and reduce time spent searching.

**Key Takeaways:**
- STATIC policies apply fixed rules to catalog views
- EXCLUSIVE policies use HTTP headers for dynamic per-request filtering
- Policies filter by product attributes (project_types, product_category, brand, etc.)
- Multiple policies combine with logical AND
- Proper attribute tagging on products is essential
- Test policies individually before combining

**Next Steps:**
1. Create policies in ACO admin UI
2. Associate policies with catalog views
3. Test with curl commands and HTTP headers
4. Integrate headers into frontend application
5. Monitor catalog performance and adjust policies as needed
