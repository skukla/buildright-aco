# Step 2: MSI Architecture Research & Recommendation

## Purpose

Research and validate single-stock MSI architecture options that comply with Adobe Commerce's 1:1 stock-to-website constraint while maintaining a compelling BuildRight product narrative. This research will inform the simplified MSI configuration and update the creative brief with a realistic, demonstrable architecture.

## Prerequisites

- [x] Step 1: Context Analysis & Validation Report completed
- [ ] Access to Adobe Commerce MSI documentation
- [ ] Understanding of BuildRight creative brief requirements

## Tests to Write First

- [ ] **Test: Validate all three architecture options researched**
  - **Given:** Research document exists
  - **When:** Parse research findings
  - **Then:** Confirm Digital Commerce, Unified Distribution, and Source Priority models are documented with architecture diagrams
  - **File:** `tests/unit/research/architecture-options.test.js`

- [ ] **Test: Validate Adobe Commerce constraint compliance**
  - **Given:** Each architecture option
  - **When:** Check against 1:1 stock-to-website constraint
  - **Then:** Confirm all options comply with constraint and document workarounds if needed
  - **File:** `tests/unit/research/constraint-validation.test.js`

- [ ] **Test: Validate MSI feature demonstration capability**
  - **Given:** Recommended architecture
  - **When:** Evaluate against MSI features (source priority, distance algorithms, inventory allocation)
  - **Then:** Confirm architecture can demonstrate at least 3 core MSI features
  - **File:** `tests/unit/research/feature-demonstration.test.js`

- [ ] **Test: Validate recommendation rationale**
  - **Given:** Final recommendation document
  - **When:** Parse recommendation section
  - **Then:** Confirm includes scored evaluation matrix, pros/cons, and alignment with BuildRight narrative
  - **File:** `tests/unit/research/recommendation-validation.test.js`

## Files to Create/Modify

- [ ] `.rptc/research/msi-architecture-options.md` - Detailed research on all three architecture models
- [ ] `.rptc/research/msi-recommendation.md` - Final architecture recommendation with rationale
- [ ] `scripts/validate-msi-architecture.js` - Automated validation script for research completeness
- [ ] `.context/architecture-decisions.md` - Update with MSI architecture decision (create if doesn't exist)

## Implementation Details

### RED Phase (Write failing tests)

```javascript
// tests/unit/research/architecture-options.test.js
import { readFileSync } from 'fs';
import { parse } from 'yaml';

describe('MSI Architecture Research', () => {
  it('should document all three architecture options', () => {
    const researchDoc = readFileSync('.rptc/research/msi-architecture-options.md', 'utf8');

    // Arrange: Expected sections
    const requiredOptions = [
      'Digital Commerce Model',
      'Unified Distribution Model',
      'Source Priority Model'
    ];

    // Act: Check each option is documented
    const hasAllOptions = requiredOptions.every(option =>
      researchDoc.includes(option)
    );

    // Assert: All options present
    expect(hasAllOptions).toBe(true);
    expect(researchDoc).toMatch(/Architecture Diagram|Visual/i);
  });

  it('should validate 1:1 stock-to-website constraint compliance', () => {
    const researchDoc = readFileSync('.rptc/research/msi-architecture-options.md', 'utf8');

    // Assert: Constraint validation section exists
    expect(researchDoc).toMatch(/1:1 stock.*website constraint/i);
    expect(researchDoc).toMatch(/Compliance Status|Constraint Check/i);
  });
});
```

### GREEN Phase (Minimal implementation)

1. **Create research document structure**
   - Create `.rptc/research/msi-architecture-options.md` with sections for each architecture
   - Document Digital Commerce Model (single stock, multiple sources, source priority by product category)
   - Document Unified Distribution Model (single stock, sources represent distribution tiers)
   - Document Source Priority Model (single stock, algorithm-based priority assignment)

2. **Validate against Adobe Commerce constraints**
   - For each architecture, document how it complies with 1:1 stock-to-website limit
   - Identify workarounds or configurations needed
   - Reference Adobe Commerce MSI documentation

3. **Evaluate MSI feature demonstration**
   - Score each architecture on ability to demonstrate:
     - Source priority algorithms
     - Distance-based selection
     - Inventory allocation rules
     - Backorder handling
     - Multi-source picking
   - Use scoring matrix (1-5 scale per feature)

4. **Create recommendation document**
   - Create `.rptc/research/msi-recommendation.md`
   - Include evaluation matrix
   - Provide final recommendation with rationale
   - Align with BuildRight narrative (construction materials supplier story)

5. **Create validation script**
   - Create `scripts/validate-msi-architecture.js`
   - Parse research documents
   - Validate required sections present
   - Generate validation report

### REFACTOR Phase (Improve quality)

1. **Enhance documentation**
   - Add architecture diagrams (ASCII or mermaid format)
   - Include example inventory configurations
   - Add reference links to Adobe Commerce MSI docs

2. **Improve validation script**
   - Add scoring calculation
   - Generate comparison table
   - Export results to JSON for programmatic access

3. **Update architecture decisions**
   - Document final MSI architecture decision in `.context/architecture-decisions.md`
   - Include rationale and alternatives considered
   - Reference research documents

## Expected Outcome

- Comprehensive research document comparing three single-stock MSI architectures
- Clear recommendation with scored evaluation matrix
- Validation that chosen architecture complies with Adobe Commerce constraints
- Documentation ready to update creative brief with simplified MSI approach
- Architecture decision recorded for project context

**Tests passing:** 4 unit tests (architecture options validation, constraint compliance, feature demonstration, recommendation validation)

## Acceptance Criteria

- [ ] All three architecture options researched and documented
- [ ] Each option validated against 1:1 stock-to-website constraint
- [ ] Evaluation matrix completed with scores for MSI feature demonstration
- [ ] Final recommendation documented with clear rationale
- [ ] Recommendation aligns with BuildRight narrative requirements
- [ ] Architecture decision added to project context
- [ ] All validation tests passing
- [ ] Documentation includes diagrams/visual representations
- [ ] No placeholder content (all sections complete)

## Estimated Time

**3-4 hours**

- Research and documentation: 2 hours
- Validation script creation: 1 hour
- Testing and refinement: 1 hour

---

## Implementation Notes

**Key Research Sources:**
- Adobe Commerce DevDocs: MSI Architecture
- Adobe Commerce DevDocs: Stock-Website Assignment
- Adobe Commerce DevDocs: Source Priority Algorithms
- BuildRight creative brief (for narrative alignment)

**Evaluation Criteria:**
- Constraint compliance (pass/fail)
- MSI feature demonstration capability (1-5 score per feature)
- Narrative alignment with BuildRight story (1-5 score)
- Implementation complexity (1-5 score, lower is better)
- Future extensibility (1-5 score)

**Recommendation Format:**
- Executive summary (2-3 sentences)
- Evaluation matrix table
- Detailed rationale (pros/cons of each option)
- Final recommendation
- Implementation implications
