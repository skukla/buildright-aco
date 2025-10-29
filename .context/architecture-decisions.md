# Architecture Decisions

**Project:** BuildRight ACO Complete Project
**Last Updated:** 2025-10-28

## Overview

This document records key architectural decisions made during the BuildRight ACO project implementation. Each decision includes context, options considered, decision made, and rationale.

## ADR-001: Multi-Source Inventory (MSI) Architecture Model

**Status:** DECIDED
**Date:** 2025-10-28
**Deciders:** TDD Sub-Agent, PM (pending review)

### Context

BuildRight requires a production-ready catalog data ingestion system that demonstrates Adobe Commerce's Multi-Source Inventory (MSI) capabilities while telling a compelling business story. Adobe Commerce enforces a 1:1 stock-to-website constraint, meaning each website can only be assigned to ONE stock (though that stock can aggregate inventory from multiple sources).

The architecture must:
- Comply with Adobe Commerce's 1:1 stock-to-website constraint
- Demonstrate at least 3 core MSI features (source priority, distance algorithms, inventory allocation)
- Align with BuildRight's business narrative as a regional building materials supplier
- Be configurable within demo timeframe constraints
- Support realistic demo scenarios

### Options Considered

Three single-stock MSI architecture models were evaluated:

#### Option 1: Digital Commerce Model
- Single stock with 5 sources organized by product category
- Source priority based on product specialization
- Score: 29/40 (72.5%)
- Pros: Good product categorization, realistic for specialized DCs
- Cons: Weaker distance algorithm demonstration, complex product mappings

#### Option 2: Unified Distribution Model
- Single stock with 5 sources organized by distribution tier (RDC → Regional → Drop-ship)
- Priority based on cost efficiency, distance algorithm for regional hubs
- Score: 36/40 (90%)
- Pros: Demonstrates ALL MSI features, authentic distribution network, compelling narrative
- Cons: Requires geographic data setup, slightly more complex configuration

#### Option 3: Source Priority Model
- Single stock with 5 sources organized purely by fulfillment speed/priority
- Algorithm-based priority assignment without geographic constraints
- Score: 27/40 (67.5%)
- Pros: Simplest configuration, clear priority logic
- Cons: Generic, weak narrative, doesn't showcase distance algorithm

### Decision

**SELECTED: Unified Distribution Model**

Architecture:
- **Single Stock:** "BuildRight Stock" assigned to BuildRight website
- **5 Sources:**
  1. Primary RDC Memphis (Priority 1)
  2. East Region Hub (Priority 2)
  3. West Region Hub (Priority 2)
  4. Central Region Hub (Priority 2)
  5. Vendor Drop-Ship (Priority 3)

Source Selection Logic:
- Priority 1 (RDC) attempted first for cost optimization
- Priority 2 (Regional hubs) selected by distance algorithm based on customer location
- Priority 3 (Drop-ship) used for extended catalog or backorders

### Rationale

The Unified Distribution Model was selected because it:

1. **Highest Evaluation Score (90%)** - Best overall fit across all criteria
2. **Maximum MSI Feature Coverage** - Demonstrates source priority, distance algorithm, inventory allocation, backorder management, and source selection
3. **Perfect Narrative Alignment** - Authentic building materials distribution scenario with regional hubs and RDC
4. **Real-World Authenticity** - Mirrors actual distribution networks used by building suppliers
5. **Compelling Demo Scenarios** - Enables cost vs. speed tradeoffs, geographic optimization, multi-source fulfillment
6. **Strong Business Context** - Audience can immediately understand value proposition

The model balances complexity (showcases MSI power) with clarity (configurable in demo timeframe).

### Consequences

**Positive:**
- Demonstrates full breadth of MSI capabilities
- Creates compelling, realistic demo scenarios
- Aligns perfectly with BuildRight's regional supplier narrative
- Distance algorithm provides "wow factor" in demos
- Supports multiple demo paths (cost-optimized, speed-optimized, extended catalog)

**Negative:**
- Requires geographic data setup (source locations, customer locations)
- More complex initial configuration than simple priority model
- May need custom source selection logic for edge cases

**Neutral:**
- Requires PM review to confirm narrative alignment
- Implementation follows standard MSI configuration patterns
- No custom development required (all standard Adobe Commerce features)

### Alternative

If geographic data or distance algorithm configuration proves too complex, the **Digital Commerce Model** is designated as the fallback option (72.5% score, good narrative fit, no distance algorithm dependency).

The **Source Priority Model** is NOT recommended for fallback due to weak business narrative (67.5% score).

### Implementation Plan

1. **Phase 1:** Basic priority configuration
   - Define 5 sources
   - Create single stock
   - Assign priorities
   - Validate source selection

2. **Phase 2:** Distance algorithm integration
   - Add geographic coordinates
   - Configure distance algorithm
   - Test location-based selection
   - Validate RDC fallback

3. **Phase 3:** Inventory scenarios
   - Load inventory data
   - Create demo scenarios
   - Test aggregation
   - Validate backorder handling

### References

- Research Document: `.rptc/research/msi-architecture-options.md`
- Recommendation Document: `.rptc/research/msi-recommendation.md`
- Adobe Commerce MSI API Validation: `.rptc/research/adobe-commerce-msi-api-validation.md`

## ADR-002: (Future Decision)

Reserved for next architectural decision.

---

**Document Conventions:**
- ADR = Architecture Decision Record
- Status values: PROPOSED → DECIDED → SUPERSEDED → DEPRECATED
- Decisions are numbered sequentially (ADR-001, ADR-002, etc.)
- Each decision includes: Context, Options, Decision, Rationale, Consequences
