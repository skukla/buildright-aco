# ACO Catalog View Setup Guide for BuildRight Personas

## Overview

This guide walks you through creating **5 ACO Catalog Views**, one for each BuildRight persona. Each catalog view controls product visibility (via policies), pricing (via price books), and locale settings.

**⚠️ IMPORTANT**: Catalog views CANNOT be created programmatically. They must be created manually in the ACO Admin UI.

---

## Prerequisites

Before creating catalog views, ensure:
- ✅ Products ingested to ACO (`npm run ingest:all`)
- ✅ Price books created in ACO (from BuildRight price-books.json)
- ✅ Policies created in ACO (see `docs/manual-setup/trigger-policy-guide.md`)
- ✅ Access to ACO Admin UI

---

## Catalog View Definitions

### 1. Production Builder View

**Name**: `BuildRight-Production-Builder`

**Purpose**: For Sarah Martinez persona - production builders ordering materials via templates.

**Configuration**:
- **Catalog Sources**: `en-US`
- **Policies**:
  - `CONSTRUCTION_PHASE` (trigger-based - allows dynamic filtering by construction phase)
- **Price Book**: `Commercial-Tier-2`
- **Use Case**: Sarah ordering Phase 1/2/3 materials via templates with production builder pricing

**Expected View ID**: `<capture-from-ui-after-creation>`

---

### 2. General Contractor View

**Name**: `BuildRight-General-Contractor`

**Purpose**: For Marcus Johnson persona - general contractors using the project wizard.

**Configuration**:
- **Catalog Sources**: `en-US`
- **Policies**:
  - `CONSTRUCTION_PHASE` (trigger-based)
  - `QUALITY_TIER` (trigger-based)
  - `PROJECT_TYPE` (trigger-based)
- **Price Book**: `Residential-Builder`
- **Use Case**: Marcus selecting materials by phase, quality tier, and project type

**Expected View ID**: `<capture-from-ui-after-creation>`

---

### 3. Remodeling Contractor View

**Name**: `BuildRight-Remodeling-Contractor`

**Purpose**: For Lisa Chen persona - remodeling contractors using the package builder.

**Configuration**:
- **Catalog Sources**: `en-US`
- **Policies**:
  - `PACKAGE_TIER` (trigger-based - Good/Better/Best)
  - `ROOM_CATEGORY` (trigger-based - bathroom/kitchen/any)
  - `PROJECT_TYPE` (trigger-based)
- **Price Book**: `Pro-Specialty`
- **Use Case**: Lisa building Good/Better/Best packages for bathroom/kitchen remodels

**Expected View ID**: `<capture-from-ui-after-creation>`

---

### 4. DIY Homeowner View

**Name**: `BuildRight-DIY-Homeowner`

**Purpose**: For David Thompson persona - pro homeowners using the deck builder wizard.

**Configuration**:
- **Catalog Sources**: `en-US`
- **Policies**:
  - `DECK_SHAPE` (trigger-based - rectangular/l-shaped/multi-level)
  - `DECK_MATERIAL` (trigger-based - wood/composite/pvc)
  - `DECK_COMPATIBLE` (trigger-based - true)
- **Price Book**: `Retail-Homeowner`
- **Use Case**: David building decks with wizard-guided selections

**Expected View ID**: `<capture-from-ui-after-creation>`

---

### 5. Store Manager View

**Name**: `BuildRight-Store-Manager`

**Purpose**: For Kevin Rodriguez persona - store managers using the restock dashboard.

**Configuration**:
- **Catalog Sources**: `en-US`
- **Policies**:
  - `STORE_VELOCITY` (trigger-based - high/medium/low)
  - `RESTOCK_PRIORITY` (trigger-based - critical/high/medium)
- **Price Book**: `Retail-Chain-Buyer`
- **Use Case**: Kevin viewing high-velocity items needing restock

**Expected View ID**: `<capture-from-ui-after-creation>`

---

## Step-by-Step Creation Process

### Access ACO Admin UI

1. Log in to [Adobe Experience Cloud](https://experience.adobe.com/)
2. Navigate to **Commerce** → **Commerce Cloud Manager**
3. Select your BuildRight ACO instance (sandbox environment)
4. Click the **Merchandising** or **Catalog Views** section

### Create Each Catalog View

For each of the 5 personas above:

#### Step 1: Create Catalog View
1. Click **"Create catalog view"**
2. Enter the **Name** (e.g., `BuildRight-Production-Builder`)
3. Select **Catalog sources**: `en-US`

#### Step 2: Add Policies
1. Click **"Add policies"**
2. Select the relevant policies for this persona (see definitions above)
3. **Note**: Policies must already exist (see `trigger-policy-guide.md`)

#### Step 3: Link Price Book
1. Choose **"Allow selected price books only"**
2. Click **"Add allowed price books"**
3. Select the appropriate price book (e.g., `Commercial-Tier-2`)
4. Click **"Add"**

#### Step 4: Save and Capture View ID
1. Click **"Add"** to create the catalog view
2. After creation, click the **info icon (ℹ)** next to the catalog view
3. **Copy the "View ID"** (UUID format: `9ced53d7-35a6-40c5-830e-8288c00985ad`)
4. **Save this View ID** - you'll need it for the persona mapping configuration

---

## Post-Creation: Update Persona Mappings

After creating all 5 catalog views and capturing their View IDs, update the persona mappings in `buildright-service`:

### File: `buildright-service/actions/utils/persona-mappings.js`

```javascript
function getPersonaMappings() {
  return {
    '1': {
      id: 'production-builder',
      name: 'Sarah Martinez - Production Builder',
      catalogViewId: '<VIEW-ID-FROM-ACO-UI>', // ← ADD THIS
      tier: 2,
      priceBookId: 'Commercial-Tier-2',
      policies: ['production_building', 'template_ordering'],
      defaultView: 'templates',
      features: ['bom_generation', 'template_configurator', 'phase_ordering']
    },
    '2': {
      id: 'general-contractor',
      name: 'Marcus Johnson - General Contractor',
      catalogViewId: '<VIEW-ID-FROM-ACO-UI>', // ← ADD THIS
      tier: 1,
      priceBookId: 'Residential-Builder',
      policies: ['residential_building', 'phase_based_ordering'],
      defaultView: 'project-wizard',
      features: ['project_wizard', 'phase_selection', 'educational_content']
    },
    // ... repeat for all 5 personas
  };
}
```

---

## Verification Steps

### Test Catalog View in ACO

After creating a catalog view:

1. **Navigate to "View details"** in the ACO UI
2. **Verify**:
   - ✅ Correct policies are listed
   - ✅ Correct price book is linked
   - ✅ Catalog source is `en-US`
   - ✅ View ID is a valid UUID

### Test via GraphQL API

```bash
curl -X POST https://na1-sandbox.api.commerce.adobe.com/<TENANT_ID>/graphql \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "AC-Environment-Id: <TENANT_ID>" \
  -H "AC-View-Id: <CATALOG-VIEW-ID>" \
  -H "AC-Source-Locale: en-US" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ productSearch(phrase: \"\") { items { productView { name sku } } } }"
  }'
```

**Expected Response**:
- Products filtered by catalog view's policies
- Prices from catalog view's price book

---

## Troubleshooting

### "Policy not found" Error
**Cause**: Policy doesn't exist in ACO  
**Fix**: Create policies first using `trigger-policy-guide.md`

### "Price book not found" Error
**Cause**: Price book hasn't been ingested  
**Fix**: Run `npm run ingest:price-books` in buildright-aco

### No products returned
**Cause**: No products match the catalog view's policies  
**Fix**: Check product attributes align with policy filters

### Cannot delete catalog view
**Cause**: Catalog view is in use by storefronts  
**Fix**: Remove storefront association first

---

## Integration with BuildRight Service

After catalog views are created:

1. **Update persona mappings** with catalog view IDs
2. **Update mesh resolvers** to pass `AC-View-Id` header
3. **Test persona switching** to verify correct catalog filtering
4. **Verify pricing** matches expected price book

**Next Steps**:
- See `buildright-service/docs/CATALOG-VIEW-INTEGRATION.md` (to be created)
- Update mesh configuration to support view IDs

---

## Summary Table

| Persona | Customer Group | Catalog View Name | Price Book | Policies |
|---------|----------------|-------------------|------------|----------|
| Sarah Martinez | 1 | BuildRight-Production-Builder | Commercial-Tier-2 | CONSTRUCTION_PHASE |
| Marcus Johnson | 2 | BuildRight-General-Contractor | Residential-Builder | CONSTRUCTION_PHASE, QUALITY_TIER, PROJECT_TYPE |
| Lisa Chen | 3 | BuildRight-Remodeling-Contractor | Pro-Specialty | PACKAGE_TIER, ROOM_CATEGORY, PROJECT_TYPE |
| David Thompson | 4 | BuildRight-DIY-Homeowner | Retail-Homeowner | DECK_SHAPE, DECK_MATERIAL, DECK_COMPATIBLE |
| Kevin Rodriguez | 5 | BuildRight-Store-Manager | Retail-Chain-Buyer | STORE_VELOCITY, RESTOCK_PRIORITY |

---

## Resources

- [Adobe Commerce Optimizer - Catalog Views](https://experienceleague.adobe.com/en/docs/commerce/optimizer/setup/catalog-view)
- [Trigger Policy Setup Guide](./trigger-policy-guide.md)
- [BuildRight B2B Structure](../architecture/buildright-b2b-structure.md)

---

**Last Updated**: November 29, 2025  
**Status**: Manual setup required - catalog views cannot be created via API

