# Step 1: Context Analysis & Validation Report

## Purpose

Establish a comprehensive understanding of the project's current state by analyzing all project documentation, comparing against actual implementation status, and validating technical capabilities. This foundational analysis will guide all subsequent implementation steps and prevent scope creep or misaligned expectations.

**Why this is first:** Must understand what exists, what's missing, and what's technically feasible before planning implementation steps.

---

## Prerequisites

- [ ] Access to all project documentation in `instructions/` directory
- [ ] Access to `.rptc/research/adobe-commerce-msi-api-validation.md` (75/100 score findings)
- [ ] Access to `THREAD-SUMMARY.md` implementation log
- [ ] Understanding of Adobe Commerce ACO SDK capabilities (@adobe-commerce/aco-ts-sdk)
- [ ] Knowledge of PM constraints: single-stock MSI, manual UI configuration, 85% coverage target

---

## Tests to Write First

### Validation Script Tests

- [ ] **Test: Validation script identifies all required documentation files**
  - **Given:** Project directory structure with instructions/ folder
  - **When:** Validation script scans for required documents (creative brief, reduced scope, phases 1-12)
  - **Then:** Script returns list of found documents and flags any missing critical files
  - **File:** `scripts/validate-project-context.test.js`

- [ ] **Test: Script parses THREAD-SUMMARY.md and extracts implementation status**
  - **Given:** THREAD-SUMMARY.md file exists with implementation log entries
  - **When:** Parser extracts completed features, pending items, and known issues
  - **Then:** Returns structured object with categorized implementation status
  - **File:** `scripts/validate-project-context.test.js`

- [ ] **Test: Script validates ACO API capabilities against scope requirements**
  - **Given:** Research findings (75/100 score, missing fields, 3/6 sources implemented)
  - **When:** Script compares required features vs available API endpoints
  - **Then:** Returns gap analysis (what's possible via API, what requires manual config)
  - **File:** `scripts/validate-project-context.test.js`

- [ ] **Test: Validation report generation includes all required sections**
  - **Given:** Analysis data collected from previous validation steps
  - **When:** Report generator runs
  - **Then:** Produces markdown report with sections: Documentation Summary, Implementation Status, API Capabilities, Gap Analysis, Recommendations
  - **File:** `scripts/validate-project-context.test.js`

---

## Files to Create/Modify

- [ ] `scripts/validate-project-context.js` - Validation script to analyze project state
- [ ] `scripts/validate-project-context.test.js` - Tests for validation script
- [ ] `.rptc/validation/context-analysis-report.md` - Comprehensive validation report output

---

## Implementation Details

### RED Phase (Write failing tests first)

```javascript
// scripts/validate-project-context.test.js
import { describe, it, expect } from '@jest/globals';
import {
  scanProjectDocumentation,
  parseThreadSummary,
  validateAPICapabilities,
  generateValidationReport
} from './validate-project-context.js';

describe('Context Validation', () => {
  describe('scanProjectDocumentation', () => {
    it('should identify all required documentation files', () => {
      const result = scanProjectDocumentation('./instructions');

      expect(result.found).toContain('creative-brief.md');
      expect(result.found).toContain('reduced-scope.md');
      expect(result.found).toContain('phases-1-12.md');
      expect(result.missing).toEqual([]);
    });
  });

  describe('parseThreadSummary', () => {
    it('should extract implementation status from THREAD-SUMMARY.md', () => {
      const result = parseThreadSummary('./THREAD-SUMMARY.md');

      expect(result).toHaveProperty('completed');
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.completed)).toBe(true);
    });
  });

  describe('validateAPICapabilities', () => {
    it('should identify gaps between scope and API capabilities', () => {
      const scope = ['msi-sources', 'msi-stocks', 'msi-policies'];
      const result = validateAPICapabilities(scope);

      expect(result).toHaveProperty('apiSupported');
      expect(result).toHaveProperty('manualConfigRequired');
      expect(result).toHaveProperty('recommendations');
    });
  });

  describe('generateValidationReport', () => {
    it('should produce comprehensive markdown report', () => {
      const analysisData = {
        documentation: { found: [], missing: [] },
        implementation: { completed: [], pending: [] },
        apiGaps: { apiSupported: [], manualConfigRequired: [] }
      };

      const report = generateValidationReport(analysisData);

      expect(report).toContain('# Context Analysis & Validation Report');
      expect(report).toContain('## Documentation Summary');
      expect(report).toContain('## Implementation Status');
      expect(report).toContain('## API Capabilities');
      expect(report).toContain('## Gap Analysis');
      expect(report).toContain('## Recommendations');
    });
  });
});
```

### GREEN Phase (Minimal implementation to pass tests)

1. **Create `scripts/validate-project-context.js`**
   ```javascript
   import fs from 'fs';
   import path from 'path';

   export function scanProjectDocumentation(instructionsDir) {
     // Read directory, identify required files
     // Return { found: [...], missing: [...] }
   }

   export function parseThreadSummary(threadSummaryPath) {
     // Parse THREAD-SUMMARY.md
     // Extract completed, pending, issues sections
     // Return structured object
   }

   export function validateAPICapabilities(scopeRequirements) {
     // Compare scope against known ACO API capabilities
     // Reference research findings (75/100 score)
     // Return gap analysis
   }

   export function generateValidationReport(analysisData) {
     // Generate markdown report with all required sections
     // Include actionable recommendations
     // Return formatted markdown string
   }
   ```

2. **Implement minimal logic to pass each test**
   - Focus on correctness, not optimization
   - Handle file I/O safely
   - Structure data clearly

3. **Generate validation report**
   - Run validation script: `node scripts/validate-project-context.js`
   - Output saved to `.rptc/validation/context-analysis-report.md`
   - Review report for completeness

### REFACTOR Phase (Improve while keeping tests green)

1. **Extract common patterns**
   - Create utility functions for file parsing if repeated
   - Improve error handling for missing files
   - Add logging for transparency

2. **Improve report formatting**
   - Use clear markdown structure
   - Add tables for comparison data
   - Include actionable next steps

3. **Ensure code quality**
   - Follow project style guide
   - Add JSDoc comments for exported functions
   - Remove any debug logging
   - Verify all tests still pass

---

## Expected Outcome

After completing this step:

- **Validation script** (`scripts/validate-project-context.js`) successfully analyzes project state
- **All tests passing** (4 test suites covering documentation scan, status parsing, API validation, report generation)
- **Comprehensive validation report** (`.rptc/validation/context-analysis-report.md`) produced with:
  - Complete inventory of project documentation
  - Current implementation status from THREAD-SUMMARY.md
  - Clear gap analysis (intended vs actual state)
  - API capability matrix (what's possible via SDK vs manual config)
  - Actionable recommendations for subsequent steps
- **Foundation established** for informed decision-making in Steps 2-20

---

## Acceptance Criteria

- [ ] All tests passing for validation script (4 test suites)
- [ ] Validation script runs without errors: `node scripts/validate-project-context.js`
- [ ] Generated report includes all 5 required sections (Documentation Summary, Implementation Status, API Capabilities, Gap Analysis, Recommendations)
- [ ] Report accurately reflects research findings (75/100 score, missing fields noted)
- [ ] Report explicitly identifies what requires manual UI configuration per PM constraints
- [ ] Code follows project style guide (ES modules, proper imports)
- [ ] No debug code (console.log statements removed or replaced with proper logging)
- [ ] Coverage ≥ 85% for validation script
- [ ] Report is readable and actionable (ready for Steps 2-20 reference)

---

## Dependencies from Other Steps

**None** - This is Step 1, foundational analysis.

**Steps that depend on this step:**
- Step 2-20 (All subsequent steps reference this validation report)
- Specifically Step 2 (Scripts cleanup) and Step 15 (Documentation rewrite) will heavily reference findings

---

## Estimated Time

**2-3 hours**

- Documentation review and analysis: 1 hour
- Validation script implementation (TDD): 1 hour
- Report generation and refinement: 0.5-1 hour
- Testing and validation: 0.5 hour

---

## Implementation Notes

**Key Considerations:**

1. **PM Constraint Alignment:** Report must validate that single-stock MSI approach is feasible and identify what remains manual configuration
2. **Research Integration:** Incorporate findings from `.rptc/research/adobe-commerce-msi-api-validation.md` (75/100 score, 3/6 sources implemented)
3. **Scope Boundary:** Focus on analysis only - no implementation code beyond validation script
4. **Output Quality:** Report must be clear enough for non-technical stakeholders to understand gaps and constraints

**Reference SOPs:**
- `testing-guide.md` (SOP) - For TDD methodology and test structure
- `architecture-patterns.md` (SOP) - For validation script organization

---

_Step 1 ready for TDD implementation._
