# Adobe Commerce MSI Stocks Configuration Guide

## Overview

This guide provides step-by-step instructions for configuring the **single stock** that aggregates all 6 inventory sources for the BuildRight catalog. In Adobe Commerce MSI, stocks represent aggregated inventory pools assigned to sales channels (websites).

**What is a Stock?** A stock is a virtual inventory pool that:
- Aggregates inventory from multiple sources
- Is assigned to one or more sales channels (websites)
- Determines which sources fulfill orders for that sales channel
- Manages source priority for order fulfillment

## Prerequisites

- **Required:** All 6 sources created (see `01-adobe-commerce-sources.md`)
- **Required Access:** Adobe Commerce Admin UI credentials with Inventory Management permissions
- **Required Permissions:** Ability to create and manage inventory stocks
- **Adobe Commerce Version:** 2.4.x (UI may vary slightly by version)
- **Understanding:** Single-stock architecture decision (explained below)

## Estimated Time

**45-60 minutes** for single stock configuration

---

## Architecture Decision: Single Stock

### Why Single Stock?

BuildRight uses a **single-stock architecture** where all 6 sources are assigned to one stock serving the Main Website. This decision is based on:

1. **Adobe Commerce Constraint:** One stock per website per Adobe Commerce 2.4.x architecture
2. **Sales Channel Simplicity:** BuildRight serves customers from a single website (no multi-channel split)
3. **Distance-Based Routing:** Source selection still works automatically via latitude/longitude
4. **Demo Scope:** Single stock simplifies implementation while demonstrating full MSI capabilities

### Single-Stock Architecture Diagram

```
Main Website (Sales Channel)
    ↓
BuildRight Primary Stock
    ↓
├── warehouse_west (Western RDC)
├── warehouse_east (Eastern RDC)
├── warehouse_phoenix (Phoenix Metro)
├── warehouse_denver (Denver)
├── warehouse_atlanta (Atlanta Metro)
└── dropship_premium_windows (Virtual)

Order Fulfillment Flow:
Customer Order → Stock → Distance-Based Source Selection → Nearest Source with Inventory
```

### Trade-offs

**Advantages:**
- Simplified inventory management
- All products available from single sales channel
- Distance-based routing still functions
- Easier to implement and maintain

**Limitations:**
- Cannot separate inventory pools by region
- Cannot demonstrate multi-stock, multi-channel scenarios
- All sources share same inventory visibility

**Verdict:** Acceptable trade-off for BuildRight demo scope. Functionality still demonstrates Adobe Commerce MSI capabilities effectively.

---

## Stock Creation

### Step 1: Navigate to Stocks Management

1. Log in to **Adobe Commerce Admin**
2. Navigate to: **Stores > Inventory > Stocks**
3. Click the **"Add New Stock"** button in the top right

_[SCREENSHOT PLACEHOLDER: Stocks grid view with "Add New Stock" button highlighted]_

---

### Step 2: Configure Basic Stock Settings

1. **Stock Name:** Enter `BuildRight Primary Stock`
   - Clear, descriptive name for primary sales stock
   - _[SCREENSHOT PLACEHOLDER: Stock name field]_

2. **Stock Description:** Enter `Primary inventory stock aggregating all BuildRight sources for Main Website`
   - Internal reference for admin users
   - Optional but recommended for documentation

3. Click **"Save & Continue Edit"**
   - Saves initial stock creation
   - Opens stock detail view for source assignment

_[SCREENSHOT PLACEHOLDER: Basic stock settings form]_

---

### Step 3: Assign Sources to Stock

After saving the stock, you'll see the **"Sources"** section in the stock detail view.

1. Click the **"Assign Sources"** button

2. **Select All 6 Sources:**
   - [ ] `warehouse_west` - Western RDC - Sacramento
   - [ ] `warehouse_east` - Eastern RDC - Charlotte
   - [ ] `warehouse_phoenix` - Phoenix Metro Warehouse
   - [ ] `warehouse_denver` - Denver Warehouse
   - [ ] `warehouse_atlanta` - Atlanta Metro Warehouse
   - [ ] `dropship_premium_windows` - Drop Shipper - Premium Window Systems

3. Check the box next to each source in the grid

4. Click **"Done"** to confirm source selection

_[SCREENSHOT PLACEHOLDER: Source selection dialog with all 6 sources checked]_

---

### Step 4: Configure Source Priority (Optional)

Adobe Commerce supports two source selection algorithms:

#### Option A: Distance-Based Priority (Recommended - Default)

**How it works:** System automatically selects nearest source with available inventory using latitude/longitude coordinates.

**Configuration:** No action required - this is the default behavior.

**Benefits:**
- Automatic optimization for shipping costs
- Reduced delivery times
- No manual priority management needed

**Example:**
- Customer in Phoenix, AZ → `warehouse_phoenix` selected (5 miles)
- Customer in Sacramento, CA → `warehouse_west` selected (local)
- Customer in Atlanta, GA → `warehouse_atlanta` selected (local)

#### Option B: Manual Priority Override (Advanced)

If you need to override distance-based selection with manual priorities:

1. In the **"Assigned Sources"** grid, locate the **"Priority"** column
2. Enter numeric priority values (lower number = higher priority):
   - **Priority 1 (Highest):** Primary RDCs
     - `warehouse_west`: Enter `1`
     - `warehouse_east`: Enter `1`
   - **Priority 2:** Regional warehouses
     - `warehouse_phoenix`: Enter `2`
     - `warehouse_denver`: Enter `2`
     - `warehouse_atlanta`: Enter `2`
   - **Priority 3 (Lowest):** Drop shippers
     - `dropship_premium_windows`: Enter `3`

3. Click **"Save Stock"**

_[SCREENSHOT PLACEHOLDER: Source priority grid with numeric priority values]_

**Note:** Manual priority overrides distance-based calculation. Use only if you have specific business requirements.

---

### Step 5: Assign Sales Channels

Stocks must be assigned to sales channels (websites) to function.

1. Scroll to the **"Sales Channels"** section in stock detail view

2. Check the box next to **"Main Website"**
   - This is typically the default Adobe Commerce website
   - If you have custom websites, select the appropriate one

3. Click **"Save Stock"**

_[SCREENSHOT PLACEHOLDER: Sales channel assignment with "Main Website" selected]_

---

### Step 6: Verify Stock Configuration

After saving, verify the stock configuration:

1. **Stock appears in Stocks grid** with name `BuildRight Primary Stock`
2. **Status:** Active
3. **Assigned Sources:** 6 sources listed
4. **Assigned Sales Channels:** Main Website

_[SCREENSHOT PLACEHOLDER: Completed stock in Stocks grid showing all details]_

---

## Verification Checklist

- [ ] Stock name: `BuildRight Primary Stock`
- [ ] Stock status: **Active**
- [ ] **All 6 sources assigned:**
  - [ ] warehouse_west
  - [ ] warehouse_east
  - [ ] warehouse_phoenix
  - [ ] warehouse_denver
  - [ ] warehouse_atlanta
  - [ ] dropship_premium_windows
- [ ] Sales channel assigned: **Main Website**
- [ ] Source priority configured (distance-based default or manual override)
- [ ] No validation errors displayed
- [ ] Green success message: "You saved the stock"

---

## Testing Distance-Based Source Selection

After completing stock configuration, test the source selection algorithm:

### Test Scenario 1: Phoenix Customer

1. Create a test order with shipping address:
   - **Address:** 123 Main Street
   - **City:** Phoenix
   - **State:** Arizona
   - **ZIP:** 85001

2. Add a product with inventory in multiple sources (e.g., lumber)

3. Process the order and check **Order Details → Source Selection**

4. **Expected Result:** `warehouse_phoenix` selected (nearest source)

### Test Scenario 2: Charlotte Customer

1. Create a test order with shipping address:
   - **Address:** 456 Trade Street
   - **City:** Charlotte
   - **State:** North Carolina
   - **ZIP:** 28202

2. Add the same product

3. **Expected Result:** `warehouse_east` selected (nearest source)

### Test Scenario 3: Denver Customer

1. Create a test order with shipping address:
   - **Address:** 789 Colorado Blvd
   - **City:** Denver
   - **State:** Colorado
   - **ZIP:** 80202

2. Add the same product

3. **Expected Result:** `warehouse_denver` selected (nearest source)

### Verification

If distance-based selection is working correctly:
- Phoenix orders → `warehouse_phoenix`
- Eastern US orders → `warehouse_east`
- Western US orders → `warehouse_west`
- Mountain states → `warehouse_denver`
- Southeast → `warehouse_atlanta`

If a selected source doesn't have inventory, system falls back to next nearest source with availability.

---

## Common Issues and Solutions

### Issue: "Cannot assign source to multiple stocks"

**Cause:** Attempting to assign the same source to more than one stock

**Solution:**
- Each source can only be assigned to **one stock at a time**
- Check existing stock-source assignments before creating new stock
- If you need to reassign, remove source from current stock first

### Issue: "Stock must have at least one assigned source"

**Cause:** Attempting to save stock without assigning any sources

**Solution:**
- Assign at least **one source** before saving stock
- For BuildRight, assign all 6 sources as documented

### Issue: "Cannot change sales channel after stock creation"

**Cause:** Sales channel assignment is locked after initial stock save

**Solution:**
- **Delete and recreate stock** if wrong sales channel assigned
- Ensure correct sales channel selected before first save

### Issue: "Source selection always picks same source regardless of customer location"

**Cause:** Missing or incorrect latitude/longitude on sources

**Solution:**
1. Go to **Stores > Inventory > Sources**
2. Edit each source and verify:
   - Latitude/longitude fields populated
   - Coordinates are decimal format (e.g., 38.5816, -121.4944)
   - Longitude is negative for Western Hemisphere (US)
3. Save sources and test again

### Issue: "Distance-based selection not working - need manual priority"

**Cause:** Distance-based algorithm not suitable for business requirements

**Solution:**
- Use **manual priority override** (Step 4, Option B)
- Set priority numbers where lower = higher priority
- Test order fulfillment after setting priorities

---

## Understanding Source Selection Algorithm

### Distance Calculation

Adobe Commerce calculates distance from customer shipping address to each source using:
- Source latitude/longitude (from source configuration)
- Customer address ZIP code coordinates (geocoded)
- Great Circle distance formula (as the crow flies)

### Selection Logic

For each order line item:

1. **Check inventory availability** at all assigned sources
2. **Calculate distance** from customer address to each source with inventory
3. **Sort sources** by distance (nearest first)
4. **Select nearest source** with sufficient inventory
5. **Fall back** to next nearest if first choice insufficient inventory

### Priority Override

If manual priorities are set:

1. **Sort by priority number** (lower number = higher priority)
2. **Distance calculation** is **ignored**
3. **Inventory availability** still required
4. **Fall back** to next priority level if no inventory

---

## Advanced Configuration (Optional)

### Multiple Stock Scenario (Future Enhancement)

If BuildRight expands to multiple websites or sales channels:

**Example Multi-Stock Architecture:**
```
Website 1 (Retail)
    ↓
Retail Stock → warehouse_west, warehouse_east, regional warehouses

Website 2 (Wholesale B2B)
    ↓
Wholesale Stock → warehouse_west, warehouse_east only (no drop shippers)

Website 3 (International)
    ↓
International Stock → international warehouses (future sources)
```

**Current Implementation:** Single stock serves single website. Expandable to multi-stock if needed.

---

## Final Verification Checklist

Before proceeding to inventory upload:

- [ ] Stock "BuildRight Primary Stock" exists and is **Active**
- [ ] All 6 sources assigned to stock
- [ ] Sales channel **Main Website** assigned
- [ ] Source assignments visible in stock detail view
- [ ] Distance-based selection tested with sample orders from different locations
- [ ] Test orders correctly routed to nearest source with inventory
- [ ] No validation errors or warnings in admin UI

---

## Next Steps

After completing stock configuration, proceed to:

**→ Step 3: Customer Groups & Pricing Policies**
`docs/manual-config/03-customer-groups.md`

You will configure customer segments and assign hierarchical price books to support BuildRight's tier-based pricing structure.

**→ Inventory Upload**
After manual UI configuration complete, run inventory upload scripts (Step 9) to populate inventory quantities across all sources.

---

## Reference Documents

- **Source Definitions:** `data/buildright/sources.json`
- **Stock Architecture:** Unified Distribution Model (ADR-001)
- **Implementation Step:** `.rptc/plans/buildright-aco-complete-project/step-08.md` (inventory generation)
- **Research Document:** `.rptc/research/adobe-commerce-msi-api-validation.md`

---

## Notes for Production Environments

- **Source Priority:** Monitor order fulfillment patterns and adjust manual priorities if needed
- **Inventory Distribution:** Ensure popular products stocked at multiple sources for redundancy
- **Drop Shipper Priority:** Set lower priority for drop shippers to prefer warehouse fulfillment
- **Multi-Website Expansion:** Plan for additional stocks if expanding to B2B or international channels
- **Distance Calculation:** Periodically verify coordinates accurate as warehouse locations change

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Source not in selection pool | Source not assigned to stock | Assign source to stock (Step 3) |
| Always picks same source | Missing lat/lon coordinates | Add coordinates to sources |
| Wrong source selected | Incorrect coordinates | Verify lat/lon accuracy |
| No stock available error | No sources assigned to stock | Assign at least one source |
| Can't assign source | Source already in another stock | Remove from other stock first |
| Sales channel error | No channel assigned | Assign Main Website (Step 5) |

---

**Guide Version:** 1.0
**Last Updated:** 2025-10-28
**Adobe Commerce Version:** 2.4.x
**BuildRight Project:** ACO Complete Implementation
