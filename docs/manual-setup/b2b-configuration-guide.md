# BuildRight B2B Configuration Guide

## Executive Summary

This guide provides step-by-step instructions for manually configuring Adobe Commerce B2B companies, teams (locations), users, and Shared Catalog assignments for the BuildRight ACO demo system.

**Purpose:** Configure 8 demo companies representing BuildRight's three divisions (Commercial, Residential, Pro) with realistic team structures showcasing BuildRight's building materials distribution model.

**Estimated Manual Setup Time:**
- Initial B2B feature enablement: 0.5 hours
- Shared Catalog assignments: 2-3 hours (catalogs already created from price books)
- Company creation: 4 hours (8 companies @ 0.5 hours each)
- Team/location setup: 4-5 hours (21 locations)
- User creation: 5-6 hours (40-50 users)
- Testing and validation: 2-3 hours
- **Total: 18-22 hours for complete manual setup**

**Related Documentation:**
- Price book structure: `data/buildright/price-books.json`
- B2B architecture diagram: `docs/architecture/buildright-b2b-structure.md`
- ACO API schema: `docs/aco-api-schema.md`
- MSI configuration: `docs/manual-config/01-adobe-commerce-sources.md`

---

## Prerequisites

Before beginning configuration, ensure:

1. **Adobe Commerce 2.4.x with B2B extension installed**
2. **Admin access** with full permissions to Customers, Catalog modules
3. **Product catalog imported** (150 products from ACO)
4. **Hierarchical price books created** (10 books from Step 2)
5. **Base product pricing configured** on all SKUs

**Verify Price Books Exist:**
Navigate to Admin → Catalog → Shared Catalogs and confirm these 10 catalogs:
- **Base Level:** US-Retail, US-Contract
- **Segment Level:** Retail-Consumer, Contract-Commercial, Contract-Residential, Contract-Pro
- **Tier Level:** Commercial-Tier1, Commercial-Tier2, Residential-Builder, Pro-Specialty

---

## Feature Enablement

### Enable B2B Features

**Navigation:** Admin → Stores → Configuration → General → B2B Features

**Steps:**

1. **Set Store View:** Select "Default Config" or appropriate website scope
2. **Enable Core Features:**
   - Enable Company: **Yes**
   - Enable Shared Catalog: **Yes** (auto-enabled with Company)
   - Enable B2B Quote: **Yes**
   - Enable Requisition List: **Yes**
   - Enable Quick Order: **Yes**

3. **Configure Payment Methods:**
   - Applicable Payment Methods: **All Enabled Payment Methods**
   - Default B2B Payment Methods: **Yes**
   - Enable Purchase Order payment: **Yes** (for B2B)

4. **Configure Shipping Methods:**
   - Default B2B Shipping Methods: **Yes**

5. **Performance Settings:**
   - Enable Shared Catalog direct products price assigning: **Yes**

6. **Save Configuration**

7. **Clear Cache:** System → Cache Management → Flush Magento Cache

**Validation:** Navigate to Customers → Companies to confirm menu appears

---

## Shared Catalog Creation

Shared Catalogs function as price books in Adobe Commerce. BuildRight uses a hierarchical structure with 10 catalogs across 3 levels.

### Hierarchical Price Book Structure

**Base Catalogs (Level 1):**
- **US-Retail:** Standard retail pricing (currency: USD)
- **US-Contract:** Contract base pricing (currency: USD)

**Segment Catalogs (Level 2):**
- **Retail-Consumer:** Consumer segment pricing (parent: US-Retail)
- **Contract-Commercial:** Commercial segment pricing (parent: US-Contract)
- **Contract-Residential:** Residential segment pricing (parent: US-Contract)
- **Contract-Pro:** Professional contractor pricing (parent: US-Contract)

**Tier Catalogs (Level 3):**
- **Commercial-Tier1:** Volume tier 1 pricing (parent: Contract-Commercial)
- **Commercial-Tier2:** Volume tier 2 pricing (parent: Contract-Commercial)
- **Residential-Builder:** Production builder pricing (parent: Contract-Residential)
- **Pro-Specialty:** Specialty trade pricing (parent: Contract-Pro)

**Note:** These Shared Catalogs should already exist from Step 2 (price book generation). If not, they must be created first using the price-books.json file as reference.

### Verify Shared Catalog Configuration

**Navigation:** Admin → Catalog → Shared Catalogs

**For Each Catalog:**
1. Verify catalog exists in grid
2. Click **Set Pricing and Structure**
3. Verify products are assigned (Select All or by category)
4. Verify custom pricing is configured (if discount-based)
5. Save pricing structure

---

## Company Creation

BuildRight operates 8 demo companies across three divisions: Commercial, Residential, and Pro.

### Company Overview Matrix

| # | Company Name | Division | Shared Catalog | Locations | Users |
|---|--------------|----------|----------------|-----------|-------|
| 1 | Premium Commercial Builders Inc. | Commercial | Commercial-Tier2 | 3 | 6-8 |
| 2 | Metro Construction Group | Commercial | Commercial-Tier1 | 3 | 6-8 |
| 3 | Coastal Residential Builders | Residential | Residential-Builder | 3 | 5-7 |
| 4 | Family Homes LLC | Residential | Contract-Residential | 2 | 4-5 |
| 5 | Elite Trade Contractors | Pro | Pro-Specialty | 3 | 5-6 |
| 6 | Regional Pro Services | Pro | Contract-Pro | 2 | 4-5 |
| 7 | Classic Remodeling Co. | Residential | Contract-Residential | 2 | 4-5 |
| 8 | Industrial Builders Corp | Commercial | Contract-Commercial | 3 | 6-7 |
| **Total** | | | | **21** | **40-51** |

---

### Company 1: Premium Commercial Builders Inc.

**Division:** BuildRight Commercial
**Shared Catalog:** Commercial-Tier2 (highest volume tier)

**Navigation:** Admin → Customers → Companies → Add New Company

**Company Information:**
- Company Name: **Premium Commercial Builders Inc.**
- Company Legal Name: **Premium Commercial Builders Inc.**
- Company Email: **admin@premiumcommercial.example.com**
- Sales Representative: **Default Sales Rep** (or assign specific rep)

**Company Admin:**
- Job Title: **Purchasing Manager**
- Email: **jsmith@premiumcommercial.example.com**
- First Name: **John**
- Last Name: **Smith**
- Gender: **Male** (optional)

**Legal Address:**
- Street Address: **1500 Commerce Drive**
- City: **Los Angeles**
- State/Province: **California**
- ZIP/Postal Code: **90001**
- Country: **United States**
- Telephone: **+1 (323) 555-0101**

**Advanced Settings:**
- Customer Group: **General** (or B2B Customer Group)
- Sales Representative: **Admin User** (or assign)
- Shared Catalog: **Commercial-Tier2**
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**
- Payment Methods: **Purchase Order, Credit Card**

**Save Company**

---

### Company 2: Metro Construction Group

**Division:** BuildRight Commercial
**Shared Catalog:** Commercial-Tier1

**Company Information:**
- Company Name: **Metro Construction Group**
- Company Legal Name: **Metro Construction Group LLC**
- Company Email: **admin@metroconstruction.example.com**

**Company Admin:**
- Job Title: **Operations Director**
- Email: **sarah.jones@metroconstruction.example.com**
- First Name: **Sarah**
- Last Name: **Jones**

**Legal Address:**
- Street Address: **2200 Industrial Boulevard**
- City: **Phoenix**
- State/Province: **Arizona**
- ZIP/Postal Code: **85001**
- Country: **United States**
- Telephone: **+1 (602) 555-0202**

**Advanced Settings:**
- Shared Catalog: **Commercial-Tier1**
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**

**Save Company**

---

### Company 3: Coastal Residential Builders

**Division:** BuildRight Residential
**Shared Catalog:** Residential-Builder

**Company Information:**
- Company Name: **Coastal Residential Builders**
- Company Legal Name: **Coastal Residential Builders Inc.**
- Company Email: **admin@coastalresidential.example.com**

**Company Admin:**
- Job Title: **President**
- Email: **mike.taylor@coastalresidential.example.com**
- First Name: **Mike**
- Last Name: **Taylor**

**Legal Address:**
- Street Address: **3500 Pacific Coast Highway**
- City: **San Diego**
- State/Province: **California**
- ZIP/Postal Code: **92101**
- Country: **United States**
- Telephone: **+1 (619) 555-0303**

**Advanced Settings:**
- Shared Catalog: **Residential-Builder**
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**

**Save Company**

---

### Company 4: Family Homes LLC

**Division:** BuildRight Residential
**Shared Catalog:** Contract-Residential

**Company Information:**
- Company Name: **Family Homes LLC**
- Company Legal Name: **Family Homes LLC**
- Company Email: **admin@familyhomes.example.com**

**Company Admin:**
- Job Title: **General Manager**
- Email: **lisa.martinez@familyhomes.example.com**
- First Name: **Lisa**
- Last Name: **Martinez**

**Legal Address:**
- Street Address: **800 Main Street**
- City: **Austin**
- State/Province: **Texas**
- ZIP/Postal Code: **78701**
- Country: **United States**
- Telephone: **+1 (512) 555-0404**

**Advanced Settings:**
- Shared Catalog: **Contract-Residential**
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**

**Save Company**

---

### Company 5: Elite Trade Contractors

**Division:** BuildRight Pro
**Shared Catalog:** Pro-Specialty

**Company Information:**
- Company Name: **Elite Trade Contractors**
- Company Legal Name: **Elite Trade Contractors Inc.**
- Company Email: **admin@elitetrade.example.com**

**Company Admin:**
- Job Title: **Owner**
- Email: **david.nguyen@elitetrade.example.com**
- First Name: **David**
- Last Name: **Nguyen**

**Legal Address:**
- Street Address: **950 Trade Center Way**
- City: **Seattle**
- State/Province: **Washington**
- ZIP/Postal Code: **98101**
- Country: **United States**
- Telephone: **+1 (206) 555-0505**

**Advanced Settings:**
- Shared Catalog: **Pro-Specialty**
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**

**Save Company**

---

### Company 6: Regional Pro Services

**Division:** BuildRight Pro
**Shared Catalog:** Contract-Pro

**Company Information:**
- Company Name: **Regional Pro Services**
- Company Legal Name: **Regional Pro Services Corp.**
- Company Email: **admin@regionalproservices.example.com**

**Company Admin:**
- Job Title: **Managing Director**
- Email: **jennifer.brown@regionalproservices.example.com**
- First Name: **Jennifer**
- Last Name: **Brown**

**Legal Address:**
- Street Address: **1200 Professional Drive**
- City: **Denver**
- State/Province: **Colorado**
- ZIP/Postal Code: **80201**
- Country: **United States**
- Telephone: **+1 (303) 555-0606**

**Advanced Settings:**
- Shared Catalog: **Contract-Pro**
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**

**Save Company**

---

### Company 7: Classic Remodeling Co.

**Division:** BuildRight Residential
**Shared Catalog:** Contract-Residential

**Company Information:**
- Company Name: **Classic Remodeling Co.**
- Company Legal Name: **Classic Remodeling Company Inc.**
- Company Email: **admin@classicremodeling.example.com**

**Company Admin:**
- Job Title: **VP of Operations**
- Email: **robert.wilson@classicremodeling.example.com**
- First Name: **Robert**
- Last Name: **Wilson**

**Legal Address:**
- Street Address: **450 Renovation Road**
- City: **Portland**
- State/Province: **Oregon**
- ZIP/Postal Code: **97201**
- Country: **United States**
- Telephone: **+1 (503) 555-0707**

**Advanced Settings:**
- Shared Catalog: **Contract-Residential**
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**

**Save Company**

---

### Company 8: Industrial Builders Corp

**Division:** BuildRight Commercial
**Shared Catalog:** Contract-Commercial

**Company Information:**
- Company Name: **Industrial Builders Corp**
- Company Legal Name: **Industrial Builders Corporation**
- Company Email: **admin@industrialbuilders.example.com**

**Company Admin:**
- Job Title: **Procurement Manager**
- Email: **patricia.davis@industrialbuilders.example.com**
- First Name: **Patricia**
- Last Name: **Davis**

**Legal Address:**
- Street Address: **3300 Industrial Park Blvd**
- City: **Las Vegas**
- State/Province: **Nevada**
- ZIP/Postal Code: **89101**
- Country: **United States**
- Telephone: **+1 (702) 555-0808**

**Advanced Settings:**
- Shared Catalog: **Contract-Commercial**
- Allow Quotes: **Yes**
- Enable Purchase Orders: **Yes**

**Save Company**

---

## Team Setup

Teams represent organizational divisions, locations, or departments within companies. For BuildRight demo companies, teams represent geographic locations or branches.

### Team/Location Structure by Company

#### Company 1: Premium Commercial Builders Inc. (3 locations)

**Navigation:** Customers → Companies → Select "Premium Commercial Builders Inc." → Company Structure

**Team 1 - Los Angeles HQ:**
- Team Name: **Los Angeles Headquarters**
- Description: **Main office and purchasing center**
- Parent: **Premium Commercial Builders Inc.** (root)

**Team 2 - San Francisco Branch:**
- Team Name: **San Francisco Bay Area**
- Description: **Northern California operations**
- Parent: **Premium Commercial Builders Inc.** (root)

**Team 3 - Orange County:**
- Team Name: **Orange County Division**
- Description: **Southern California satellite office**
- Parent: **Premium Commercial Builders Inc.** (root)

---

#### Company 2: Metro Construction Group (3 locations)

**Team 1 - Phoenix HQ:**
- Team Name: **Phoenix Headquarters**
- Description: **Central Arizona operations**

**Team 2 - Tucson:**
- Team Name: **Tucson Office**
- Description: **Southern Arizona operations**

**Team 3 - Flagstaff:**
- Team Name: **Flagstaff Branch**
- Description: **Northern Arizona projects**

---

#### Company 3: Coastal Residential Builders (3 locations)

**Team 1 - San Diego HQ:**
- Team Name: **San Diego Headquarters**
- Description: **Main residential operations**

**Team 2 - Carlsbad:**
- Team Name: **Carlsbad Division**
- Description: **North County coastal projects**

**Team 3 - Chula Vista:**
- Team Name: **Chula Vista Office**
- Description: **South County operations**

---

#### Company 4: Family Homes LLC (2 locations)

**Team 1 - Austin HQ:**
- Team Name: **Austin Headquarters**
- Description: **Central Texas operations**

**Team 2 - San Antonio:**
- Team Name: **San Antonio Branch**
- Description: **South Texas expansion**

---

#### Company 5: Elite Trade Contractors (3 locations)

**Team 1 - Seattle HQ:**
- Team Name: **Seattle Headquarters**
- Description: **Main specialty trade operations**

**Team 2 - Bellevue:**
- Team Name: **Bellevue Office**
- Description: **Eastside service area**

**Team 3 - Tacoma:**
- Team Name: **Tacoma Branch**
- Description: **South Sound operations**

---

#### Company 6: Regional Pro Services (2 locations)

**Team 1 - Denver HQ:**
- Team Name: **Denver Headquarters**
- Description: **Metro Denver operations**

**Team 2 - Colorado Springs:**
- Team Name: **Colorado Springs Office**
- Description: **Southern Colorado service area**

---

#### Company 7: Classic Remodeling Co. (2 locations)

**Team 1 - Portland HQ:**
- Team Name: **Portland Headquarters**
- Description: **Metro Portland operations**

**Team 2 - Beaverton:**
- Team Name: **Beaverton Branch**
- Description: **Westside service area**

---

#### Company 8: Industrial Builders Corp (3 locations)

**Team 1 - Las Vegas HQ:**
- Team Name: **Las Vegas Headquarters**
- Description: **Nevada commercial operations**

**Team 2 - Henderson:**
- Team Name: **Henderson Office**
- Description: **Southern Nevada industrial**

**Team 3 - Reno:**
- Team Name: **Reno Branch**
- Description: **Northern Nevada operations**

**Total Locations: 21** (within 20-24 target range)

---

## User Management

Company users represent buyers, approvers, and administrators within each company. Users are assigned to teams and have defined roles.

### User Roles

Adobe Commerce B2B provides these default roles:
- **Default User:** Can view and purchase
- **Senior Buyer:** Can manage orders and requisition lists
- **Approver:** Can approve orders and quotes
- **Administrator:** Full company management access

### Sample User Creation (Company 1 Example)

**Navigation:** Customers → Companies → Select Company → Company Users → Add User

**User 1 - Purchasing Agent (Los Angeles HQ Team):**
- Email: **purchasing1@premiumcommercial.example.com**
- First Name: **Emily**
- Last Name: **Johnson**
- Job Title: **Senior Purchasing Agent**
- Role: **Senior Buyer**
- Team: **Los Angeles Headquarters**
- Status: **Active**

**User 2 - Project Manager (San Francisco Team):**
- Email: **pm1@premiumcommercial.example.com**
- First Name: **Carlos**
- Last Name: **Rodriguez**
- Job Title: **Project Manager**
- Role: **Default User**
- Team: **San Francisco Bay Area**
- Status: **Active**

**Repeat for all companies**, creating 40-50 total users across 21 locations with distributed roles.

**User Distribution Recommendation:**
- Large companies (3 locations): 6-8 users
- Medium companies (2 locations): 4-5 users
- Mix of roles: 60% Default User, 25% Senior Buyer, 10% Approver, 5% Administrator

---

## Testing

### Validation Checklist

After completing configuration, verify:

**B2B Features:**
- [ ] B2B features enabled in configuration
- [ ] Companies menu visible in Admin
- [ ] Shared Catalogs menu accessible

**Shared Catalogs:**
- [ ] All 10 Shared Catalogs exist (US-Retail through Pro-Specialty)
- [ ] Products assigned to each catalog
- [ ] Custom pricing configured (if applicable)
- [ ] Hierarchical structure (parentId references) validated

**Companies:**
- [ ] All 8 companies created
- [ ] Company admins configured
- [ ] Shared Catalog assigned correctly to each company
- [ ] Legal addresses complete
- [ ] Payment methods enabled

**Teams:**
- [ ] 21 teams created across all companies
- [ ] Team descriptions accurate
- [ ] Geographic distribution realistic (Western, Central regions)

**Users:**
- [ ] 40-51 users created
- [ ] Users assigned to appropriate teams
- [ ] Roles distributed appropriately
- [ ] All users have active status

**Storefront Testing:**
- [ ] Company admin can log in
- [ ] Assigned Shared Catalog products visible
- [ ] Correct pricing displays per company
- [ ] Team members can place orders
- [ ] Quote functionality works (if enabled)

---

## Troubleshooting

### Common Issues

**Issue:** Shared Catalog not appearing for company
- **Solution:** Verify catalog assignment in Company → Advanced Settings → Shared Catalog

**Issue:** Products not visible to company users
- **Solution:** Check products are assigned in Shared Catalog → Set Pricing and Structure

**Issue:** Incorrect pricing displays
- **Solution:** Verify Shared Catalog custom pricing, clear cache, reindex
- **Example:** If Premium Commercial Builders sees retail pricing instead of Commercial-Tier2:
  1. Verify company's Advanced Settings → Shared Catalog = "Commercial-Tier2"
  2. Check Shared Catalog → Set Pricing and Structure → Products assigned
  3. Clear all caches: System → Cache Management → Flush Magento Cache
  4. Reindex pricing: System → Index Management → Select "Customer Group Prices" → Reindex
  5. Log out and back in as company user to verify

**Issue:** Team structure not saving
- **Solution:** Ensure parent company exists, clear browser cache
- **Tip:** Use browser incognito mode to avoid cached admin panel issues

**Issue:** Users cannot log in
- **Solution:** Verify user status is "Active", check email confirmation sent
- **Note:** New company users must confirm email before first login (unless email confirmation disabled in config)

### Cache Management

After any B2B configuration change:
1. Navigate to System → Cache Management
2. Select: Configuration, Page Cache, Block HTML Output
3. Click "Flush Magento Cache"
4. Reindex if pricing changes: System → Index Management → Reindex All

---

## Appendix: Quick Reference

### 8 Companies Summary

1. **Premium Commercial Builders Inc.** → Commercial-Tier2 → 3 locations (LA, SF, OC)
2. **Metro Construction Group** → Commercial-Tier1 → 3 locations (Phoenix, Tucson, Flagstaff)
3. **Coastal Residential Builders** → Residential-Builder → 3 locations (San Diego, Carlsbad, Chula Vista)
4. **Family Homes LLC** → Contract-Residential → 2 locations (Austin, San Antonio)
5. **Elite Trade Contractors** → Pro-Specialty → 3 locations (Seattle, Bellevue, Tacoma)
6. **Regional Pro Services** → Contract-Pro → 2 locations (Denver, Colorado Springs)
7. **Classic Remodeling Co.** → Contract-Residential → 2 locations (Portland, Beaverton)
8. **Industrial Builders Corp** → Contract-Commercial → 3 locations (Las Vegas, Henderson, Reno)

### Hierarchical Price Book Reference

**Level 1 (Base):** US-Retail, US-Contract
**Level 2 (Segment):** Retail-Consumer, Contract-Commercial, Contract-Residential, Contract-Pro
**Level 3 (Tier):** Commercial-Tier1, Commercial-Tier2, Residential-Builder, Pro-Specialty

### Time Estimate Summary

- Feature Enablement: 0.5 hours
- Shared Catalog Setup: 2-3 hours
- Company Creation: 4 hours
- Team Setup: 4-5 hours
- User Creation: 5-6 hours
- Testing: 2-3 hours
- **Total: 18-22 hours**

---

## Next Steps

After completing B2B configuration:
1. Review B2B architecture diagram: `docs/architecture/buildright-b2b-structure.md`
2. Test price book inheritance on storefront
3. Validate MSI integration with company locations
4. Configure quote workflows (if using quotes)
5. Set up approval workflows (if required)

For ACO ingestion workflows, refer to: `docs/api/aco-ingestion-guide.md`
