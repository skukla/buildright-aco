# Adobe Commerce MSI Sources Configuration Guide

## Overview

This guide provides step-by-step instructions for creating all **6 inventory sources** in Adobe Commerce Admin UI as part of the BuildRight Multi-Source Inventory (MSI) implementation. These sources represent physical warehouses and virtual drop shippers that fulfill BuildRight's catalog orders.

**What are Sources?** In Adobe Commerce MSI, sources represent physical or virtual locations from which products are shipped. Each source has inventory quantities and geographic location data used for distance-based source selection.

## Prerequisites

- **Required Access:** Adobe Commerce Admin UI credentials with Inventory Management permissions
- **Required Permissions:** Ability to create and manage inventory sources
- **Reference Data:** Source definitions from `data/buildright/sources.json`
- **Adobe Commerce Version:** 2.4.x (UI may vary slightly by version)

## Estimated Time

**3-4 hours total** for all 6 sources (30-45 minutes per source)

## Architecture Context

### BuildRight's 6-Source Multi-Source Inventory System

1. **Western RDC - Sacramento** (`warehouse_west`) - Primary distribution center for Western US
2. **Eastern RDC - Charlotte** (`warehouse_east`) - Primary distribution center for Eastern US
3. **Phoenix Metro Warehouse** (`warehouse_phoenix`) - Regional hub for Southwest
4. **Denver Warehouse** (`warehouse_denver`) - Regional hub for Mountain states
5. **Atlanta Metro Warehouse** (`warehouse_atlanta`) - Regional hub for Southeast
6. **Drop Shipper - Premium Window Systems** (`dropship_premium_windows`) - Virtual source for specialty products

### Distance-Based Source Selection

Adobe Commerce uses source latitude/longitude coordinates to automatically select the nearest source with available inventory for each order. This reduces shipping costs and delivery times.

**Example:** A customer in Phoenix (ZIP 85001) ordering lumber would have their order fulfilled by `warehouse_phoenix` (5 miles away) rather than `warehouse_west` (750 miles away) if both have stock.

---

## Navigation to Sources Management

1. Log in to **Adobe Commerce Admin**
2. Navigate to: **Stores > Inventory > Sources**
3. Click the **"Add New Source"** button in the top right

_[SCREENSHOT PLACEHOLDER: Sources grid view with "Add New Source" button highlighted]_

---

## Source 1: Western RDC - Sacramento

### Step-by-Step Configuration

**Important:** Source code cannot be changed after creation. Verify spelling carefully.

1. **Source Code:** Enter `warehouse_west`
   - Must be unique across all sources
   - No spaces, use underscores
   - _[SCREENSHOT PLACEHOLDER: Source code field highlighted with value "warehouse_west"]_

2. **Name:** Enter `Western RDC - Sacramento`
   - Display name shown in admin UI
   - _[SCREENSHOT PLACEHOLDER: Name field]_

3. **Is Enabled:** Select **Yes**
   - Makes source immediately active for order fulfillment
   - _[SCREENSHOT PLACEHOLDER: Enabled dropdown]_

4. **Description:** Enter `Western Regional Distribution Center serving Western US states`
   - Internal reference for admin users
   - _[SCREENSHOT PLACEHOLDER: Description field]_

5. **Latitude:** Enter `38.5816`
   - Used for distance-based source selection algorithm
   - Must be decimal format (not degrees/minutes/seconds)
   - _[SCREENSHOT PLACEHOLDER: Latitude field]_

6. **Longitude:** Enter `-121.4944`
   - Note: Negative value for Western Hemisphere (US)
   - Must be decimal format
   - _[SCREENSHOT PLACEHOLDER: Longitude field]_

7. **Country:** Select **United States**
   - Required field for source creation
   - _[SCREENSHOT PLACEHOLDER: Country dropdown]_

8. **State/Province:** Type or select **California**
   - Auto-populates region_id (5) internally
   - _[SCREENSHOT PLACEHOLDER: State dropdown]_

9. **City:** Enter `Sacramento`
   - _[SCREENSHOT PLACEHOLDER: City field]_

10. **Street Address:** Enter `1000 Distribution Way`
    - Example address - update with actual if known
    - _[SCREENSHOT PLACEHOLDER: Street address field]_

11. **Postcode:** Enter `95814`
    - Valid US ZIP code format required
    - _[SCREENSHOT PLACEHOLDER: Postcode field]_

12. **Phone:** Enter `916-555-0100`
    - Contact number for warehouse operations
    - _[SCREENSHOT PLACEHOLDER: Phone field]_

13. **Email:** Enter `warehouse.west@buildright.com`
    - Contact email for warehouse operations
    - _[SCREENSHOT PLACEHOLDER: Email field]_

14. **Contact Name:** Enter `West Coast Operations`
    - Primary contact for this source
    - _[SCREENSHOT PLACEHOLDER: Contact name field]_

15. Click **"Save & Continue Edit"**
    - Saves source and keeps form open for verification

### Verification Steps

- [ ] Source appears in Sources grid with status **"Enabled"**
- [ ] Source code displays exactly as entered: `warehouse_west`
- [ ] Latitude and longitude fields populated with correct values
- [ ] No validation errors displayed
- [ ] Green success message: "You saved the source"

_[SCREENSHOT PLACEHOLDER: Success message and source in grid]_

---

## Source 2: Eastern RDC - Charlotte

### Step-by-Step Configuration

Navigate back to **Stores > Inventory > Sources** and click **"Add New Source"** for the next source.

1. **Source Code:** `warehouse_east`
2. **Name:** `Eastern RDC - Charlotte`
3. **Is Enabled:** **Yes**
4. **Description:** `Eastern Regional Distribution Center serving Eastern US states`
5. **Latitude:** `35.2271`
6. **Longitude:** `-80.8431`
7. **Country:** **United States**
8. **State/Province:** **North Carolina**
9. **City:** `Charlotte`
10. **Street Address:** `2000 East Commerce Drive`
11. **Postcode:** `28202`
12. **Phone:** `704-555-0200`
13. **Email:** `warehouse.east@buildright.com`
14. **Contact Name:** `East Coast Operations`

15. Click **"Save & Continue Edit"**

### Verification Steps

- [ ] Source code: `warehouse_east`
- [ ] Status: Enabled
- [ ] Coordinates: Lat 35.2271, Lon -80.8431
- [ ] State: North Carolina (region_id: 33)

---

## Source 3: Phoenix Metro Warehouse

### Step-by-Step Configuration

1. **Source Code:** `warehouse_phoenix`
2. **Name:** `Phoenix Metro Warehouse`
3. **Is Enabled:** **Yes**
4. **Description:** `Regional warehouse serving Phoenix metro area and surrounding regions`
5. **Latitude:** `33.4484`
6. **Longitude:** `-112.074`
7. **Country:** **United States**
8. **State/Province:** **Arizona**
9. **City:** `Phoenix`
10. **Street Address:** `3000 Desert Commerce Way`
11. **Postcode:** `85001`
12. **Phone:** `602-555-0300`
13. **Email:** `warehouse.phoenix@buildright.com`
14. **Contact Name:** `Phoenix Operations`

15. Click **"Save & Continue Edit"**

### Verification Steps

- [ ] Source code: `warehouse_phoenix`
- [ ] Status: Enabled
- [ ] Coordinates: Lat 33.4484, Lon -112.074
- [ ] State: Arizona (region_id: 3)

---

## Source 4: Denver Warehouse

### Step-by-Step Configuration

1. **Source Code:** `warehouse_denver`
2. **Name:** `Denver Warehouse`
3. **Is Enabled:** **Yes**
4. **Description:** `Regional warehouse serving Denver and Mountain states`
5. **Latitude:** `39.7392`
6. **Longitude:** `-104.9903`
7. **Country:** **United States**
8. **State/Province:** **Colorado**
9. **City:** `Denver`
10. **Street Address:** `4000 Rocky Mountain Parkway`
11. **Postcode:** `80202`
12. **Phone:** `303-555-0400`
13. **Email:** `warehouse.denver@buildright.com`
14. **Contact Name:** `Denver Operations`

15. Click **"Save & Continue Edit"**

### Verification Steps

- [ ] Source code: `warehouse_denver`
- [ ] Status: Enabled
- [ ] Coordinates: Lat 39.7392, Lon -104.9903
- [ ] State: Colorado (region_id: 6)

---

## Source 5: Atlanta Metro Warehouse

### Step-by-Step Configuration

1. **Source Code:** `warehouse_atlanta`
2. **Name:** `Atlanta Metro Warehouse`
3. **Is Enabled:** **Yes**
4. **Description:** `Regional warehouse serving Atlanta metro and Southeast region`
5. **Latitude:** `33.749`
6. **Longitude:** `-84.388`
7. **Country:** **United States**
8. **State/Province:** **Georgia**
9. **City:** `Atlanta`
10. **Street Address:** `5000 Peachtree Industrial Boulevard`
11. **Postcode:** `30303`
12. **Phone:** `404-555-0500`
13. **Email:** `warehouse.atlanta@buildright.com`
14. **Contact Name:** `Atlanta Operations`

15. Click **"Save & Continue Edit"**

### Verification Steps

- [ ] Source code: `warehouse_atlanta`
- [ ] Status: Enabled
- [ ] Coordinates: Lat 33.749, Lon -84.388
- [ ] State: Georgia (region_id: 10)

---

## Source 6: Drop Shipper - Premium Window Systems (Virtual Source)

### Special Instructions for Virtual Sources

Virtual sources (drop shippers) don't have physical warehouse locations, so they use special field values:
- **Postcode:** `00000` (indicates virtual source)
- **Latitude/Longitude:** Leave **blank** (no geographic coordinates)
- **City/State:** Leave **blank**

### Step-by-Step Configuration

1. **Source Code:** `dropship_premium_windows`
2. **Name:** `Drop Shipper - Premium Window Systems`
3. **Is Enabled:** **Yes**
4. **Description:** `Virtual drop shipper for premium window and door products`
5. **Latitude:** Leave **blank** (no coordinates for virtual source)
6. **Longitude:** Leave **blank**
7. **Country:** **United States**
8. **State/Province:** Leave **blank** or select **"Please Select"**
9. **City:** Leave **blank**
10. **Street Address:** Enter `Virtual Drop Ship Location` or leave blank
11. **Postcode:** Enter `00000` **(Important: This designates it as a virtual source)**
12. **Phone:** `800-555-0199`
13. **Email:** `dropship@premiumwindows.com`
14. **Contact Name:** `Premium Windows Partnership`

15. Click **"Save & Continue Edit"**

### Verification Steps

- [ ] Source code: `dropship_premium_windows`
- [ ] Status: Enabled
- [ ] Postcode: `00000` (virtual source indicator)
- [ ] Latitude/Longitude: Blank (no coordinates)
- [ ] City/State: Blank

_[SCREENSHOT PLACEHOLDER: Virtual source configuration showing blank coordinates and 00000 postcode]_

---

## Common Errors and Solutions

### Error: "Source code already exists"
**Cause:** Attempting to create a source with a duplicate `source_code`
**Solution:** Check existing sources in the grid first. If you need to modify an existing source, edit it rather than creating a new one.

### Error: "Please enter latitude and longitude values"
**Cause:** Coordinates required for physical sources (distance-based routing)
**Solution:**
- For **physical warehouses:** Enter valid decimal coordinates (e.g., 38.5816, -121.4944)
- For **virtual sources (drop shippers):** This error should not appear if postcode is `00000`

### Error: "Invalid postal code format"
**Cause:** Postcode doesn't match US format (99999 or 99999-9999)
**Solution:**
- For **physical sources:** Verify valid 5-digit US ZIP code
- For **virtual sources:** Use exactly `00000`

### Error: "Please select a state/province"
**Cause:** State field is required when country is United States
**Solution:**
- For **physical sources:** Select the appropriate US state
- For **virtual sources:** Either leave blank or select "Please Select" option

### Warning: Source not appearing in distance calculations
**Cause:** Missing or incorrect latitude/longitude values
**Solution:** Edit source and verify coordinates are:
- In decimal format (not degrees/minutes/seconds)
- Correct sign (negative for Western Hemisphere longitude)
- Accurate (verify via Google Maps if unsure)

---

## Final Verification Checklist

After creating all 6 sources, verify the following:

- [ ] **All 6 sources visible** in Sources grid
- [ ] **All sources have status "Enabled"**
- [ ] **Physical sources (5)** have valid latitude/longitude populated
- [ ] **Virtual source (1)** has postcode `00000` and blank coordinates
- [ ] **Contact information complete** for all sources
- [ ] **No validation errors** displayed in grid
- [ ] **Source codes match exactly:**
  - [ ] `warehouse_west`
  - [ ] `warehouse_east`
  - [ ] `warehouse_phoenix`
  - [ ] `warehouse_denver`
  - [ ] `warehouse_atlanta`
  - [ ] `dropship_premium_windows`

_[SCREENSHOT PLACEHOLDER: Complete sources grid showing all 6 enabled sources]_

---

## Testing Distance-Based Source Selection

After creating sources, test the distance-based selection algorithm:

1. Create a test order with shipping address in **Phoenix, AZ (ZIP: 85001)**
2. Add a product that has inventory in multiple sources
3. Check the order details to verify `warehouse_phoenix` was selected (nearest source)
4. Repeat test with different shipping addresses to verify correct source selection

**Expected Results:**
- Phoenix address → `warehouse_phoenix` selected
- Sacramento address → `warehouse_west` selected
- Charlotte address → `warehouse_east` selected
- Denver address → `warehouse_denver` selected
- Atlanta address → `warehouse_atlanta` selected

---

## Next Steps

After completing source configuration, proceed to:

**→ Step 2: Stock Configuration**
`docs/manual-config/02-adobe-commerce-stocks.md`

You will assign all 6 sources to a single stock (BuildRight Primary Stock) following Adobe Commerce's single-stock-per-website architecture.

---

## Reference Documents

- **Source Definitions:** `data/buildright/sources.json` (exact field values)
- **Implementation Step:** `.rptc/plans/buildright-aco-complete-project/step-08.md` (inventory generation)
- **Research Document:** `.rptc/research/adobe-commerce-msi-api-validation.md` (ACO MSI schema)
- **Architecture Decision:** Unified Distribution Model (ADR-001)

---

## Notes for Production Environments

- **Street Addresses:** Update with actual warehouse physical addresses
- **Contact Information:** Replace placeholder contacts with real warehouse operations contacts
- **Coordinates:** Verify latitude/longitude match actual warehouse locations via Google Maps
- **Source Codes:** Must match source codes used in inventory upload scripts (Step 9)
- **Virtual Sources:** Additional drop shippers can be added following Source 6 pattern

---

**Guide Version:** 1.0
**Last Updated:** 2025-10-28
**Adobe Commerce Version:** 2.4.x
**BuildRight Project:** ACO Complete Implementation
