# BuildRight ACO Project - Restoration Context & Recovery Guide

**Last Updated:** 2025-10-28
**Project Status:** Plan Generation Phase (Steps 1-7 Complete, Step 6 & 8-20 Pending)
**Critical Data Backup:** Complete

## Executive Summary

This document preserves the complete context needed to restore and resume BuildRight ACO project work after data loss or system recovery. All plan documents, research, and configuration have been version-controlled in GitHub.

## What Happened (Current State)

### Phase: Plan Generation & Framework Setup
- Status: 35% complete (7 of 20 implementation steps planned)
- Last Activity: 2025-10-28
- All plan documents generated using RPTC workflow with Claude Code
- All research completed and documented
- Framework design finalized with PM approval

### Completed Deliverables
1. **Overview & Strategy** (overview.md)
   - 20-step implementation plan
   - Sequential track coordination (5 tracks)
   - 80-100 hour estimated timeline
   - Complete acceptance criteria defined

2. **Steps 1-5 & 7 Detailed Plans** (step-*.md files)
   - Context validation framework
   - Architecture decisions documented
   - Core utilities design
   - Generation script specifications
   - Test-first approach defined
   - **NOTE:** Step 6 is missing (likely product generation scripts)

3. **Research Completed** (adobe-commerce-msi-api-validation.md)
   - Adobe Commerce MSI API validation (75/100 alignment)
   - Field mapping and schema documentation
   - 6 inventory sources specified
   - 12 price book hierarchy validated
   - 120 base products with attributes

4. **Project Documentation** (instructions/)
   - Original implementation plan
   - Reduced scope documentation
   - Phase-by-phase breakdowns (Phases 1-12)
   - Thread summary with implementation log
   - Current implementation status tracker

## How to Resume Work

### 1. Clone Repository
```bash
git clone https://github.com/[YOUR_USERNAME]/buildright-aco.git
cd buildright-aco
```

### 2. Verify Restoration
```bash
# Verify all critical files present
ls -la .claude/settings.json
ls -la .rptc/research/adobe-commerce-msi-api-validation.md
ls -la .rptc/plans/buildright-aco-complete-project/

# Should show: overview.md, step-01.md through step-07.md (step-06 missing)
ls .rptc/plans/buildright-aco-complete-project/
```

### 3. Understand Current State
- Read `overview.md` for complete project scope
- Review `instructions/THREAD-SUMMARY.md` for implementation status
- Check `follow-up.md` for latest PM feedback (documentation rewrite request)
- Review `ongoing.md` for architectural guidance

### 4. Identify Next Steps

#### Missing Step 6
Step 6 is missing from the plan sequence. Based on step-05 (Metadata & Categories) and step-07 (Pricing Generation), step-06 likely covers:
- **Product data generation scripts** (generate-all-products.js)
- This is the critical path for 120 base products with variants and bundles
- Must be regenerated before continuing

#### Remaining Steps (8-20)
Based on overview.md, remaining steps cover:
- Steps 8-11: Ingestion scripts, reset scripts, validation scripts, test suite
- Steps 12-14: Manual configuration guides (MSI sources/stocks, customer groups, policies/catalog views)
- Steps 15-18: Comprehensive documentation (creative brief, architecture, API reference, implementation guide)
- Steps 19-20: Integration testing, quality gates, final review

### 5. Check PM Feedback Items
From ongoing.md and follow-up.md:
1. Simplify MSI to single-stock architecture (Adobe Commerce constraint: 1 stock per website)
2. Sources/stocks managed in Adobe Commerce PaaS backend (manual UI, not scriptable via ACO SDK)
3. Policies/Catalog Views not SDK-supported - need manual creation/deletion documentation
4. **Documentation rewrite**: Comprehensive rewrite needed with updated creative brief material
5. Testing: Keep simple but effective (Jest unit tests, sandbox integration, single E2E workflow)
6. Quality gates enabled (efficiency and security reviews apply to code AND documentation)

### 6. Prepare Environment
```bash
# Install dependencies
cd buildright-aco-demo/aco-sample-catalog-data-ingestion
npm install

# Check RPTC configuration
cat .claude/settings.json

# Access RPTC workflow commands:
# /rptc:plan "feature"                - Continue plan generation (for missing steps)
# /rptc:tdd @buildright-aco-complete-project/  - Execute TDD implementation
# /rptc:research "topic"              - Additional research if needed
# /rptc:commit                        - Commit verified changes
```

## Critical Implementation Decisions

### Architecture Decisions (From step-02.md, step-03.md)
- **MSI Approach:** Single-stock implementation (per PM feedback on Adobe Commerce constraint)
- **SDK Pattern:** Wrapper around @adobe-commerce/aco-ts-sdk with retry logic
- **Error Handling:** Structured error codes with categorization and retry strategies
- **Logging:** Hierarchical logging (DEBUG, INFO, WARN, ERROR) using Winston or Pino
- **Batch Processing:** 100 items per batch (aligned with API rate limits)

### Key Constraints
- **No Existing Code:** All scripts must be created fresh (originals lost)
- **Manual UI Configuration:** Sources, stocks, policies, catalog views created manually in Adobe Commerce/ACO UI
- **SDK Limitations:** Policies and Catalog Views not supported in @adobe-commerce/aco-ts-sdk
- **Test Coverage:** 85% minimum required for utilities and critical paths
- **Quality Gates:** Enabled (must pass efficiency and security reviews before completion)

## File Structure for Reference

```
.rptc/plans/buildright-aco-complete-project/
├── overview.md              # Complete project overview and acceptance criteria (14.7 KB)
├── step-01.md              # Context Analysis & Validation (9.9 KB)
├── step-02.md              # MSI Architecture Research (7.6 KB)
├── step-03.md              # Project Structure & Dev Environment (20.4 KB)
├── step-04.md              # Core Utilities & Shared Libraries (24.0 KB)
├── step-05.md              # Generation Scripts - Metadata & Categories (29.1 KB)
├── [step-06.md]            # MISSING - Product Generation Scripts
├── step-07.md              # Generation Scripts - Pricing (20.9 KB)
└── [step-08 through step-20]  # PENDING GENERATION

instructions/
├── 01-original-plan.md     # Original comprehensive plan
├── 02-reduced-scope-plan.md # Current scope (120 products, 6 sources, 12 price books)
├── 03-phases-1-4.md through 09-phase-12.md  # Phase documentation
└── THREAD-SUMMARY.md       # Implementation status with schema discoveries

.rptc/research/
└── adobe-commerce-msi-api-validation.md # Complete API reference (50.4 KB)

.claude/
└── settings.json           # RPTC workflow configuration (ultrathink mode enabled)
```

## Git History Recovery

All changes preserved in git commits. To review work:
```bash
git log --oneline --all
git log --stat                    # See what changed
git diff HEAD~1 HEAD              # See most recent changes
git show [commit-hash]            # Review specific commit
```

## Data Backups

If this was recovered from backup:
1. Verify all .md files in .rptc/plans/ are readable
2. Check .rptc/research/ contains adobe-commerce-msi-api-validation.md (50KB)
3. Confirm instructions/ folder has all 10 documentation files
4. Validate .claude/settings.json is valid JSON
5. Note missing step-06.md will need regeneration

## PM Feedback & Next Actions

### Follow-up Items (from follow-up.md)
1. **Rewrite Documentation Comprehensively**
   - Include updated creative brief material
   - Clean up existing implementation plan with accurate instructions
   - Add complete code examples throughout
   - Create step-by-step user guides

2. **Documentation Priorities**
   - User-facing guides for step-by-step process
   - API reference with schema examples
   - Manual configuration guides (UI-based for sources/stocks/policies)
   - Working code examples for each script

### Latest Feedback (from ongoing.md)
1. Stock/source simplification: Use single "digital" stock model
2. Validate all functionality against API research findings
3. Create manual guides for Policies and Catalog Views (not in SDK)
4. Keep testing simple but effective (no multi-environment, no complex error recovery)

## Contact & Support

For questions about plan generation or TDD execution:
- Review .rptc/CLAUDE.md for RPTC workflow instructions
- Check settings.json for current configuration (ultrathink mode enabled)
- Consult instructions/ folder for domain context

For technical questions:
- API reference: .rptc/research/adobe-commerce-msi-api-validation.md
- Implementation examples: In each step-*.md file's implementation section
- Test patterns: Defined in each step-*.md test section

## Recovery Verification Checklist

On recovery, verify:
- [ ] Git repository cloned and remote configured
- [ ] All .md files readable and intact
- [ ] JSON configuration files valid
- [ ] 7 plan step files present (note step-06 missing)
- [ ] ~197 KB of critical files restored
- [ ] npm packages reinstallable (package.json present in buildright-aco-demo/)
- [ ] Continue plan generation with `/rptc:plan` to generate missing steps

## Regeneration Commands

To regenerate missing step 6 and continue:
```bash
# Option 1: Continue plan generation for missing steps
/rptc:plan "@buildright-aco-complete-project/"

# Option 2: Start TDD execution (will identify missing step and prompt)
/rptc:tdd "@buildright-aco-complete-project/"
```

---

**This document should be updated after each major phase completion to reflect new status.**
