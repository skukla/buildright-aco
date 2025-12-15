# BuildRight Pricing Strategy

**Version**: 2.0 (Persona-Driven)  
**Date**: November 2024  
**Status**: Implemented

---

## Overview

BuildRight's pricing strategy combines **customer tier pricing** (based on who you are) with **volume tier pricing** (based on how much you buy) to create a realistic B2B building supply pricing model.

This two-layer pricing approach:
- Rewards different customer types with appropriate discounts
- Incentivizes larger orders with quantity-based savings
- Demonstrates ACO's hierarchical pricing capabilities
- Maps directly to 5 distinct persona experiences

---

## Price Book Structure

### **2-Level Hierarchy**

```
US-Retail (Base - USD)
├── Production-Builder (15% off retail)
├── Trade-Professional (10% off retail)
├── Wholesale-Reseller (25% off retail)
└── Retail-Registered (5% off retail)
```

**Total**: 5 price books

---

## Customer Tier Pricing (Layer 1)

### **Base: US-Retail**
- **Purpose**: Retail catalog pricing for general customers
- **Currency**: USD
- **Who Uses It**: 
  - General customers (unregistered, walk-ins)
  - David Thompson (can optionally use Retail-Registered)

### **Tier 1: Production-Builder**
- **Discount**: 15% off retail
- **Purpose**: Volume pricing for production home builders
- **Justification**: 
  - High-volume, predictable purchasing (120+ homes/year)
  - Large orders with phased delivery
  - Strategic customer relationship
- **Persona**: Sarah Martinez (Sunset Valley Homes)
- **Example**: 
  - Retail: $10.00/unit
  - Production-Builder: $8.50/unit (saves $1.50)

### **Tier 2: Trade-Professional**
- **Discount**: 10% off retail
- **Purpose**: Professional pricing for licensed contractors
- **Justification**:
  - Regular, moderate-volume purchases
  - Licensed professionals with established relationships
  - Frequent reorders
- **Personas**: 
  - Marcus Johnson (General Contractor, 3-5 homes/year)
  - Lisa Chen (Remodeling Contractor, 30-40 projects/year)
- **Example**:
  - Retail: $10.00/unit
  - Trade-Professional: $9.00/unit (saves $1.00)

### **Tier 3: Wholesale-Reseller**
- **Discount**: 25% off retail
- **Purpose**: Wholesale pricing for stores buying for resale
- **Justification**:
  - Buying for resale, not end-use
  - Cost-based pricing (cost + margin model)
  - High-frequency restocking orders
- **Persona**: Kevin Rodriguez (Store Manager, 2-3 orders/week)
- **Example**:
  - Retail: $10.00/unit
  - Wholesale-Reseller: $7.50/unit (saves $2.50)

### **Tier 4: Retail-Registered (Optional)**
- **Discount**: 5% off retail (loyalty discount)
- **Purpose**: Loyalty pricing for registered DIY customers
- **Justification**:
  - Rewards account creation
  - Encourages repeat business
  - Minimal discount for occasional buyers
- **Persona**: David Thompson (Pro Homeowner, DIY enthusiast)
- **Note**: David can also use base US-Retail pricing if preferred
- **Example**:
  - Retail: $10.00/unit
  - Retail-Registered: $9.50/unit (saves $0.50)

---

## Volume Tier Pricing (Layer 2)

### **Quantity-Based Discounts**

For **high-volume products** (lumber, fasteners, common materials), additional discounts apply based on order quantity:

| Quantity Range | Discount | Description |
|----------------|----------|-------------|
| **1-99 units** | 0% | Base tier price (individual/small orders) |
| **100-293 units** | -3% | Volume discount (multiple units) |
| **294+ units** | -8% | Pallet pricing (294 = typical pallet quantity) |

### **Product Applicability**

**Volume tiers apply to:**
- Lumber (2x4s, 2x6s, 2x8s, plywood, OSB)
- Fasteners (nails, screws, bolts in bulk)
- Common materials purchased in large quantities

**Flat pricing (no volume tiers) for:**
- Specialty products (windows, doors, fixtures)
- Tools and equipment
- Low-volume materials

---

## Combined Pricing Examples

### **Example 1: 2x4x8 SPF Stud (High-Volume Product)**

**Retail Base Price**: $10.00/unit

| Customer Tier | Price Book | Qty 1-99 | Qty 100-293 | Qty 294+ | 10,000 Units |
|---------------|-----------|----------|-------------|----------|--------------|
| **General/Guest** | US-Retail | $10.00 | $9.70 | $9.20 | **$92,000** |
| **David (DIY)** | Retail-Registered | $9.50 | $9.22 | $8.74 | **$87,400** |
| **Marcus/Lisa (Contractor)** | Trade-Professional | $9.00 | $8.73 | $8.28 | **$82,800** |
| **Sarah (Builder)** | Production-Builder | $8.50 | $8.25 | $7.82 | **$78,200** |
| **Kevin (Reseller)** | Wholesale-Reseller | $7.50 | $7.28 | $6.90 | **$69,000** |

**Key Insights:**
- Sarah ordering 50 units: $8.50/unit = $425
- Sarah ordering 10,000 units: $7.82/unit = $78,200 (8% additional savings from volume)
- Kevin saves $23,000 vs. retail on a 10,000-unit order (25% customer tier + 8% volume tier)

### **Example 2: Premium Window (Specialty Product - No Volume Tiers)**

**Retail Base Price**: $450.00/unit

| Customer Tier | Price Book | Unit Price | 10-Unit Order |
|---------------|-----------|------------|---------------|
| **General/Guest** | US-Retail | $450.00 | **$4,500** |
| **David (DIY)** | Retail-Registered | $427.50 | **$4,275** |
| **Marcus/Lisa (Contractor)** | Trade-Professional | $405.00 | **$4,050** |
| **Sarah (Builder)** | Production-Builder | $382.50 | **$3,825** |
| **Kevin (Reseller)** | Wholesale-Reseller | $337.50 | **$3,375** |

**Key Insights:**
- No volume tiers (windows aren't bought in bulk quantities)
- Customer tier discounts still apply
- Pricing remains consistent regardless of quantity

---

## Persona Mapping

| Persona | Customer Group | Price Book | Strategy | Order Pattern |
|---------|----------------|-----------|----------|---------------|
| **Sarah Martinez** | Production-Builder | Production-Builder | 15% base + volume tiers | Large, phased orders (8-unit home packages) |
| **Marcus Johnson** | Trade-Professional | Trade-Professional | 10% base + volume tiers | Project-based orders (custom homes) |
| **Lisa Chen** | Trade-Professional | Trade-Professional | 10% base + volume tiers | Package-based orders (kitchen/bath remodels) |
| **David Thompson** | Retail-Consumer | US-Retail or Retail-Registered | 0-5% base + volume tiers | Single project orders (deck build) |
| **Kevin Rodriguez** | Wholesale-Reseller | Wholesale-Reseller | 25% base + volume tiers | High-frequency restock orders |

---

## B2B Pricing Reality

### **What Makes This Realistic?**

✅ **Customer Tier Pricing**
- Different customer types receive appropriate pricing based on business relationship
- Mirrors real-world B2B contract pricing structures
- Clear incentive: grow your business → earn better pricing tier

✅ **Volume Tier Pricing**
- Larger orders receive lower per-unit costs
- Pallet pricing (294+ units) reflects real bulk purchasing economics
- Encourages consolidated orders vs. frequent small orders

✅ **Stacking Discounts**
- Both customer tier and volume tier discounts apply
- Example: Sarah gets 15% (customer tier) + 8% (volume tier) = ~22% total savings on large orders
- Realistic B2B behavior: loyalty + volume = best pricing

✅ **Transparent Savings**
- Customers see their savings: "You saved $X with your Pro account + volume discount"
- Builds loyalty through clear value demonstration
- No hidden negotiations or manual quoting needed

✅ **Incentivizes Growth**
- Order more units → save more per unit
- Grow your business → qualify for better customer tier
- Encourages long-term strategic partnerships

---

## Technical Implementation

### **Price Book Generation**

```bash
# Generate 5 price books
node scripts/generate-price-books.js
```

Output: `data/buildright/price-books.json`

### **Price Generation with Volume Tiers**

```bash
# Generate prices with customer tier + volume tier discounts
node scripts/generate-prices-simple.js
```

This script:
1. Loads all products
2. Calculates base retail price for each SKU
3. For each customer tier price book:
   - Applies customer tier discount
   - Generates 3 price points per SKU (for high-volume products):
     - Quantity 1: Base tier price
     - Quantity 100: Base tier price - 3%
     - Quantity 294: Base tier price - 8%

Output: `data/buildright/prices.json`

### **Ingestion to ACO**

```bash
# Ingest price books (must be done first)
node scripts/ingest-price-books.js

# Ingest prices (after price books are ingested)
node scripts/ingest-prices.js
```

---

## Comparison to Original Structure

### **Original BuildRight (10 books, 3 levels)**
```
Base Level (2):
- US-Retail
- US-Contract

Segment Level (4):
- Retail-Consumer (parent: US-Retail)
- Contract-Commercial (parent: US-Contract)
- Contract-Residential (parent: US-Contract)
- Contract-Pro (parent: US-Contract)

Tier Level (4):
- Commercial-Tier1, Commercial-Tier2
- Residential-Builder
- Pro-Specialty
```

### **New Persona-Driven (5 books, 2 levels)**
```
Base Level (1):
- US-Retail

Customer Tier Level (4):
- Production-Builder
- Trade-Professional
- Wholesale-Reseller
- Retail-Registered
```

### **Why the Change?**

| Aspect | Original | New | Benefit |
|--------|----------|-----|---------|
| **Hierarchy depth** | 3 levels | 2 levels | Simpler to understand |
| **Price books** | 10 books | 5 books | Easier to maintain |
| **Base separation** | Retail vs Contract | Single retail base | Clearer value communication |
| **Focus** | 3 business divisions | 5 individual personas | Aligns with persona demo |
| **Discount clarity** | Multi-level inheritance | Direct discount off retail | Transparent savings |

---

## Demo Value

### **Pricing Comparison Demos**

Show side-by-side pricing for the same product across personas:

**2x4x8 Stud - 500 units:**
- David pays: $4,370 (retail - 5% + volume)
- Marcus pays: $4,140 (trade - 10% + volume)
- Sarah pays: $3,910 (production - 15% + volume)
- Kevin pays: $3,450 (wholesale - 25% + volume)

**Sarah saves $920 vs. Marcus** (volume builder advantage)  
**Kevin saves $920 vs. David** (wholesale pricing advantage)

### **Volume Incentive Demos**

Show Sarah's pricing at different quantities:

**2x4x8 Stud (Production-Builder tier):**
- 50 units: $8.50/ea = $425
- 200 units: $8.25/ea = $1,650 (saves $50 with volume)
- 500 units: $7.82/ea = $3,910 (saves $340 with pallet pricing)

**Message**: "Order in full pallets and save 8% more!"

---

## Future Enhancements

### **Potential Additional Tiers**
- **Elite Production Builder**: 20% off (for 250+ homes/year)
- **Government/Institutional**: Special pricing for public projects
- **Non-Profit**: Discounted pricing for Habitat for Humanity, etc.

### **Dynamic Tier Qualification**
- Automatic tier upgrades based on annual purchase volume
- Seasonal promotions (additional 5% off in Q1)
- Loyalty points program integration

### **Regional Pricing Variations**
- Cost adjustments for high-demand markets
- Delivery surcharges for remote locations
- Regional sale events

---

## Success Metrics

### **For BuildRight:**
- ✅ **Simplified pricing management**: 5 books vs. 10 (50% reduction)
- ✅ **Clear persona alignment**: Each tier maps to specific personas
- ✅ **B2B realism**: Customer tier + volume tier = real-world pricing
- ✅ **Demo effectiveness**: Easy to show pricing differences

### **For Customers:**
- ✅ **Transparent savings**: "You saved $X" is clear
- ✅ **Predictable pricing**: No negotiations needed
- ✅ **Volume incentives**: Order more → save more
- ✅ **Loyalty rewards**: Business growth = better pricing

---

**Document Version**: 2.0  
**Related Documentation**:
- [BUILDRIGHT-CASE-STUDY.md](BUILDRIGHT-CASE-STUDY.md) - Business context and outcomes
- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Technical setup procedures
- [generate-price-books.js](../scripts/generate-price-books.js) - Price book generation script
- [generate-prices-simple.js](../scripts/generate-prices-simple.js) - Price generation with volume tiers

