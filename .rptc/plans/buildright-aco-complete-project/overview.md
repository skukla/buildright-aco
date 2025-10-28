# Implementation Plan: BuildRight ACO Complete Project

## Status Tracking

- [x] Planned
- [ ] In Progress (TDD Phase)
- [ ] Efficiency Review
- [ ] Security Review
- [ ] Complete

**Created:** 2025-10-27
**Last Updated:** 2025-10-27

---

## Executive Summary

**Feature:** Complete BuildRight ACO project with documentation rewrite, script cleanup, and full MSI implementation

**Purpose:** Create production-ready ACO catalog data ingestion scripts with comprehensive documentation for BuildRight's multi-source inventory, hierarchical pricing, and project-based bundling system

**Approach:** Sequential implementation across 5 tracks: (1) Foundation & Analysis - validate research and establish utilities, (2) Script Implementation - create all data generation scripts, (3) Manual Config Guides - document UI-based configurations, (4) Comprehensive Documentation - API guides and examples, (5) Integration & Quality - end-to-end testing and reviews

**Estimated Complexity:** Complex (20 steps, multi-track coordination, manual UI dependencies)

**Estimated Timeline:** 80-100 hours (2-3 weeks)

**Key Risks:** MSI architecture simplification decision, manual UI configuration dependencies (sources/stocks/policies), script recreation without originals, Adobe Commerce backend access requirements

---

## Research References

**Research Document:** `.rptc/research/adobe-commerce-msi-api-validation.md`

**Key Findings:**
- 75/100 alignment score - current implementation uses simplified MSI subset
- Missing required API fields: `country_id`, `postcode` for sources
- No Stock entity implementation (single-stock vs. multi-stock decision pending)
- 6 sources specified (2 RDCs, 3 regional warehouses, 1 virtual drop shipper)
- Batch processing approach aligns with API best practices (100 items/request)

**Relevant Files Identified:**
- None existing - project is greenfield implementation

---

## Test Strategy

### Testing Approach

- **Framework:** Jest with ES Modules support
- **Coverage Goal:** 85% overall, 100% critical utility functions
- **Test Distribution:** Unit (65%), Integration (30%), E2E (5%)

### Test Scenarios Summary

**Unit Tests:**
- Utility functions: price calculations, SKU generation, inventory distribution algorithms
- Data validation: schema compliance, required fields presence
- Format converters: ACO API format transformations

**Integration Tests:**
- Script execution: verify generated JSON files match ACO schema
- ACO SDK operations: product creation, price book assignment (against sandbox)
- Batch processing: pagination, error handling, retry logic

**E2E Tests:**
- Single complete workflow: generate all data → upload to sandbox → verify in ACO UI
- Covers critical path: products → inventory → prices → project bundles

**Note:** Detailed test scenarios are in each step file (step-01.md through step-20.md)

---

## Acceptance Criteria

**Definition of Done:**

- [ ] **Functionality:** All 21 script files operational (generators, validators, uploaders)
- [ ] **Testing:** All tests passing with 85%+ coverage on utilities and critical paths
- [ ] **Documentation:** Complete API guides, manual config guides, README with examples
- [ ] **Code Quality:** Passes linter, follows Node.js ES Module patterns, proper error handling
- [ ] **Data Validation:** All generated JSON validates against ACO/Adobe Commerce schemas
- [ ] **Manual Config Guides:** Step-by-step guides for sources, stocks, policies, catalog views
- [ ] **Integration Verified:** Single E2E workflow successfully uploads to ACO sandbox
- [ ] **Security:** No secrets in code, proper .env handling, API key management documented
- [ ] **Simplification Applied:** Code follows KISS/YAGNI principles, no premature abstractions

**Feature-Specific Criteria:**

- [ ] MSI architecture decision documented (single-stock vs. multi-stock)
- [ ] All 6 inventory sources defined with required API fields
- [ ] 12 price books with 4-level hierarchy correctly structured
- [ ] 120 base products across 5 categories with proper ACO attributes
- [ ] Project-triggered dynamic bundles with policy rules documented
- [ ] Quality gates completed (efficiency and security reviews) if enabled

---

## Risk Assessment

### Risk 1: MSI Architecture Simplification Decision

- **Category:** Technical
- **Likelihood:** High
- **Impact:** Medium
- **Priority:** High
- **Description:** Research indicates current spec requires multi-stock (2 stocks: Western/Eastern Sales Channels) but simpler single-stock approach is viable for demo. PM input requests research into Digital Commerce, Unified Distribution, or Source Priority models.
- **Mitigation:**
  1. Step 1 conducts architectural research comparing models
  2. Document trade-offs: complexity vs. demo fidelity
  3. PM approval required before Step 6 (source implementation)
  4. Flexible design allows later upgrade to multi-stock if needed
- **Contingency Plan:** Default to single-stock (all sources in default stock) if multi-stock proves too complex for demo timeline
- **Owner:** Master Planner → PM Decision

### Risk 2: Manual UI Configuration Dependencies

- **Category:** Dependency
- **Likelihood:** High
- **Impact:** Medium
- **Priority:** High
- **Description:** Sources/Stocks managed in Adobe Commerce Admin UI (no SDK support), Policies/Catalog Views in ACO UI (manual config). Scripts cannot automate these steps.
- **Mitigation:**
  1. Create detailed step-by-step guides with screenshots (Step 13-15)
  2. Document exact field values and settings required
  3. Provide verification checklist after manual steps
  4. Integration tests verify manual configs are correct
- **Contingency Plan:** Record video walkthroughs if written guides insufficient
- **Owner:** Documentation track (Steps 13-15)

### Risk 3: Script Recreation Without Originals

- **Category:** Technical
- **Likelihood:** Medium
- **Impact:** Medium
- **Priority:** Medium
- **Description:** No existing scripts to reference - building from specifications and research only. Risk of misinterpreting requirements or missing edge cases.
- **Mitigation:**
  1. Start with simple test data generators (Step 4-5)
  2. Progressive validation: generate → validate → iterate
  3. Integration tests catch schema mismatches early
  4. Reference Adobe Commerce API docs continuously
- **Contingency Plan:** Iterative refinement based on integration test failures
- **Owner:** Script Implementation track (Steps 4-12)

### Risk 4: Adobe Commerce Backend Access Requirements

- **Category:** Dependency
- **Likelihood:** Medium
- **Impact:** High
- **Priority:** High
- **Description:** Manual source/stock configuration requires Adobe Commerce Admin access. May not be available in sandbox environment.
- **Mitigation:**
  1. Document access requirements early (Step 2)
  2. Test manual configuration steps in sandbox immediately (Step 6)
  3. Provide alternative: mock data approach for demo if no backend access
  4. Fallback: document manual steps for customer environments only
- **Contingency Plan:** If no backend access, create JSON files representing sources/stocks and document "future integration" approach
- **Owner:** Foundation track (Step 2)

### Risk 5: Test Coverage for Generated Data

- **Category:** Quality
- **Likelihood:** Medium
- **Impact:** Medium
- **Priority:** Medium
- **Description:** Generated JSON data files are complex and large - difficult to achieve 85% coverage on generation logic due to randomization and business rules.
- **Mitigation:**
  1. Focus coverage on utility functions and algorithms (deterministic)
  2. Use snapshot testing for generated data structures
  3. Integration tests validate actual ACO upload success
  4. Exclude pure data files from coverage calculations
- **Contingency Plan:** Lower coverage target to 70% for generator scripts, maintain 85% for utilities
- **Owner:** Testing strategy (all steps)

---

## Dependencies

### New Packages to Install

- [ ] **Package:** `jest@^29.7.0`
  - **Purpose:** Unit and integration testing framework
  - **Risk:** Low
  - **Alternatives Considered:** Vitest (newer but less mature)
  - **Installation:** `npm install --save-dev jest`
  - **Documentation:** https://jestjs.io/

- [ ] **Package:** `supertest@^6.3.3`
  - **Purpose:** HTTP integration testing for ACO API calls
  - **Risk:** Low
  - **Alternatives Considered:** Direct axios (less ergonomic)
  - **Installation:** `npm install --save-dev supertest`
  - **Documentation:** https://github.com/ladjs/supertest

- [ ] **Package:** `dotenv@^16.3.1`
  - **Purpose:** Environment variable management for API keys
  - **Risk:** Low
  - **Alternatives Considered:** None (standard practice)
  - **Installation:** `npm install dotenv`
  - **Documentation:** https://github.com/motdotla/dotenv

### Configuration Changes

- [ ] **Config:** `package.json`
  - **Changes:** Add Jest configuration for ES Modules, test scripts, coverage thresholds
  - **Environment:** All environments
  - **Secrets:** None

- [ ] **Config:** `.env` (create if not exists)
  - **Changes:** Add ACO_API_KEY, ACO_ENVIRONMENT_ID, ADOBE_COMMERCE_ADMIN_URL, ADOBE_COMMERCE_API_TOKEN
  - **Environment:** Development and sandbox
  - **Secrets:** API keys and tokens (not committed to git)

- [ ] **Config:** `.gitignore`
  - **Changes:** Ensure .env, node_modules, coverage/, .DS_Store excluded
  - **Environment:** All environments
  - **Secrets:** None

### External Service Integrations

- [ ] **Service:** Adobe Commerce Optimizer (ACO) Sandbox
  - **Purpose:** Integration testing for product/price upload scripts
  - **Setup Required:** API key, environment ID (from .env)
  - **Error Handling:** Graceful degradation if sandbox unavailable (mock mode)

- [ ] **Service:** Adobe Commerce Backend (PaaS)
  - **Purpose:** Manual source/stock configuration via Admin UI
  - **Setup Required:** Admin credentials, access to Inventory Management module
  - **Error Handling:** Document manual steps; if no access, provide JSON reference files

---

## File Reference Map

### Existing Files (To Modify)

**None** - This is a greenfield implementation

### New Files (To Create)

**Foundation & Utilities (Track 1):**
- `utils/aco-api-client.js` - ACO SDK wrapper with error handling
- `utils/schema-validator.js` - JSON schema validation utilities
- `utils/price-calculator.js` - Hierarchical price book calculations
- `utils/sku-generator.js` - SKU generation following BuildRight patterns

**Data Generation Scripts (Track 2):**
- `scripts/generate-products.js` - 120 base products across 5 categories
- `scripts/generate-inventory.js` - Multi-source inventory distribution
- `scripts/generate-prices.js` - 12 price books with 4-level hierarchy
- `scripts/generate-bundles.js` - Static and project-triggered bundles
- `scripts/generate-policies.js` - Policy rules for dynamic bundles (reference data)
- `scripts/validate-data.js` - Validate all generated JSON against schemas

**Upload Scripts (Track 2):**
- `scripts/upload-products.js` - Batch upload to ACO
- `scripts/upload-inventory.js` - Batch inventory upload
- `scripts/upload-prices.js` - Price book hierarchy upload
- `scripts/upload-bundles.js` - Bundle product upload

**Test Files (All Tracks):**
- `tests/unit/utils/price-calculator.test.js`
- `tests/unit/utils/sku-generator.test.js`
- `tests/unit/utils/schema-validator.test.js`
- `tests/integration/scripts/generate-products.test.js`
- `tests/integration/scripts/upload-products.test.js`
- `tests/e2e/complete-workflow.test.js`

**Documentation (Tracks 3 & 4):**
- `docs/manual-config/01-adobe-commerce-sources.md`
- `docs/manual-config/02-adobe-commerce-stocks.md`
- `docs/manual-config/03-aco-policies.md`
- `docs/manual-config/04-aco-catalog-views.md`
- `docs/api-guides/product-ingestion.md`
- `docs/api-guides/inventory-management.md`
- `docs/api-guides/price-book-hierarchy.md`
- `docs/architecture/msi-architecture-decision.md`
- `README.md` - Complete project overview with usage examples

**Data Files (Generated):**
- `data/buildright/products.json`
- `data/buildright/inventory.json`
- `data/buildright/prices.json`
- `data/buildright/bundles.json`
- `data/buildright/sources.json` (reference for manual config)
- `data/buildright/stocks.json` (reference for manual config)
- `data/buildright/policies.json` (reference for manual config)

**Total Files:** 21 script/utility files + 10 test files + 12 documentation files + 7 data files = **50 files**

---

## Coordination Notes

### Step Dependencies: Sequential Execution Required

**Track 1 (Foundation) → Track 2 (Scripts) → Track 5 (Integration)**
- Step 1-2 must complete before Step 4 (architectural decisions inform script design)
- Step 3 (utilities) must complete before all generation scripts (Steps 4-8)
- Steps 4-8 (generators) must complete before Steps 9-12 (uploaders)
- Steps 13-15 (manual configs) must complete before Step 18 (E2E test)

**Parallel Opportunities:**
- Steps 4-8 can run in parallel after Step 3 (independent generators)
- Steps 9-12 can run in parallel after Step 8 (independent uploaders)
- Steps 13-15 can run in parallel (manual config guides)
- Steps 16-17 can run in parallel (API documentation)

### Integration Points

**ACO SDK Integration:**
- All upload scripts depend on `utils/aco-api-client.js` (Step 3)
- Integration tests require ACO sandbox credentials (.env)

**Adobe Commerce Admin UI:**
- Manual source/stock configuration (Steps 13-14) external to scripts
- No API automation available - requires human interaction

**Quality Gates:**
- Steps 19-20 are quality reviews (efficiency, security)
- Triggered after all implementation complete
- Require PM approval to proceed if quality gates enabled

### Quality Gates

**When:** After Step 19 (all implementation and tests complete)

**Process:**
1. Efficiency Review: Code optimization opportunities, performance analysis
2. Security Review: API key handling, input validation, error exposure
3. PM Approval: Review findings, approve proceed or request changes
4. Applies to: Code AND documentation files

**Note:** Currently disabled in `.claude/settings.json` (`qualityGatesEnabled: false`)

---

## Next Actions

**After Overview Complete:**

1. **For PM:** Review overview, approve MSI architecture approach (Step 1 prerequisite)
2. **For Step Generator Sub-Agents:** Generate individual step-01.md through step-20.md files
3. **For Developer:** Execute with `/rptc:tdd "@buildright-aco-complete-project/"` after all step files created

**First Step:** Step 01 - MSI Architecture Research & Decision (Digital Commerce vs. Unified Distribution vs. Source Priority models)

---

_Overview created by Overview Generator Sub-Agent_
_Status: Ready for Step Generation_
