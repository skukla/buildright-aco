/**
 * Test Suite: Project Context Validation
 * Purpose: Validate that the validation script correctly analyzes project state
 */

import { jest } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Import the functions we'll be testing
import {
  scanProjectDocumentation,
  parseThreadSummary,
  validateAPICapabilities,
  generateValidationReport
} from './validate-project-context.js';

describe('Project Context Validation', () => {
  describe('scanProjectDocumentation', () => {
    test('should identify all required documentation files', async () => {
      // Given: Project directory structure with instructions/ folder
      const instructionsDir = path.join(projectRoot, 'instructions');

      // When: Validation script scans for required documents
      const result = await scanProjectDocumentation(instructionsDir);

      // Then: Script returns list of found documents and flags missing files
      expect(result).toBeDefined();
      expect(result).toHaveProperty('foundDocuments');
      expect(result).toHaveProperty('missingDocuments');
      expect(Array.isArray(result.foundDocuments)).toBe(true);
      expect(Array.isArray(result.missingDocuments)).toBe(true);

      // Should find at least some documentation files
      expect(result.foundDocuments.length).toBeGreaterThan(0);

      // Should include THREAD-SUMMARY.md
      const threadSummaryFound = result.foundDocuments.some(
        doc => doc.includes('THREAD-SUMMARY.md')
      );
      expect(threadSummaryFound).toBe(true);
    });

    test('should categorize documents by type', async () => {
      const instructionsDir = path.join(projectRoot, 'instructions');
      const result = await scanProjectDocumentation(instructionsDir);

      // Should categorize documents
      expect(result).toHaveProperty('documentsByType');
      expect(typeof result.documentsByType).toBe('object');
    });
  });

  describe('parseThreadSummary', () => {
    test('should extract implementation status from THREAD-SUMMARY.md', async () => {
      // Given: THREAD-SUMMARY.md file exists with implementation log entries
      const threadSummaryPath = path.join(projectRoot, 'instructions', 'THREAD-SUMMARY.md');

      // When: Parser extracts completed features, pending items, known issues
      const result = await parseThreadSummary(threadSummaryPath);

      // Then: Returns structured object with categorized implementation status
      expect(result).toBeDefined();
      expect(result).toHaveProperty('completedFeatures');
      expect(result).toHaveProperty('pendingItems');
      expect(result).toHaveProperty('knownIssues');
      expect(result).toHaveProperty('scriptsStatus');

      // Should parse arrays
      expect(Array.isArray(result.completedFeatures)).toBe(true);
      expect(Array.isArray(result.pendingItems)).toBe(true);
      expect(Array.isArray(result.knownIssues)).toBe(true);

      // Should find completed features (based on THREAD-SUMMARY content)
      expect(result.completedFeatures.length).toBeGreaterThan(0);

      // Should include script status information
      expect(typeof result.scriptsStatus).toBe('object');
    });

    test('should extract key statistics from implementation log', async () => {
      const threadSummaryPath = path.join(projectRoot, 'instructions', 'THREAD-SUMMARY.md');
      const result = await parseThreadSummary(threadSummaryPath);

      // Should include statistics
      expect(result).toHaveProperty('statistics');
      expect(result.statistics).toHaveProperty('totalEntitiesIngested');
      expect(typeof result.statistics.totalEntitiesIngested).toBe('number');
    });
  });

  describe('validateAPICapabilities', () => {
    test('should identify API capability gaps', async () => {
      // Given: Research findings (75/100 score, missing fields, 3/6 sources implemented)
      const researchPath = path.join(projectRoot, '.rptc', 'research', 'adobe-commerce-msi-api-validation.md');

      // When: Script compares required features vs available API endpoints
      const result = await validateAPICapabilities(researchPath);

      // Then: Returns gap analysis (what's possible via API, what requires manual config)
      expect(result).toBeDefined();
      expect(result).toHaveProperty('alignmentScore');
      expect(result).toHaveProperty('apiSupported');
      expect(result).toHaveProperty('manualConfigRequired');
      expect(result).toHaveProperty('missingFields');
      expect(result).toHaveProperty('implementationGaps');

      // Should parse alignment score
      expect(typeof result.alignmentScore).toBe('number');
      expect(result.alignmentScore).toBe(75);

      // Should identify what's supported via API
      expect(Array.isArray(result.apiSupported)).toBe(true);

      // Should identify what requires manual configuration
      expect(Array.isArray(result.manualConfigRequired)).toBe(true);

      // Should identify missing fields
      expect(Array.isArray(result.missingFields)).toBe(true);
    });

    test('should parse source implementation status', async () => {
      const researchPath = path.join(projectRoot, '.rptc', 'research', 'adobe-commerce-msi-api-validation.md');
      const result = await validateAPICapabilities(researchPath);

      // Should include source count information
      expect(result).toHaveProperty('sourceStatus');
      expect(result.sourceStatus).toHaveProperty('implemented');
      expect(result.sourceStatus).toHaveProperty('total');
      expect(result.sourceStatus.implemented).toBe(3);
      expect(result.sourceStatus.total).toBe(6);
    });
  });

  describe('generateValidationReport', () => {
    test('should produce comprehensive markdown report', async () => {
      // Given: Analysis data collected from previous validation steps
      const mockAnalysisData = {
        documentation: {
          foundDocuments: ['THREAD-SUMMARY.md', '01-original-plan.md'],
          missingDocuments: [],
          documentsByType: { plans: 2 }
        },
        implementation: {
          completedFeatures: ['Metadata ingestion', 'Categories ingestion'],
          pendingItems: ['Price ingestion'],
          knownIssues: [],
          scriptsStatus: { generation: 5, ingestion: 5 },
          statistics: { totalEntitiesIngested: 176 }
        },
        apiCapabilities: {
          alignmentScore: 75,
          apiSupported: ['Product creation', 'Category creation'],
          manualConfigRequired: ['Stock configuration', 'Source setup'],
          missingFields: ['country_id', 'postcode'],
          implementationGaps: ['3 of 6 sources'],
          sourceStatus: { implemented: 3, total: 6 }
        }
      };

      // When: Report generator runs
      const reportPath = path.join(projectRoot, '.rptc', 'validation', 'context-analysis-report.md');
      const result = await generateValidationReport(mockAnalysisData, reportPath);

      // Then: Produces markdown report with all required sections
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.reportPath).toBe(reportPath);

      // Verify report was written
      const reportContent = await fs.readFile(reportPath, 'utf-8');
      expect(reportContent).toContain('# BuildRight ACO Project Context Analysis Report');

      // Should include all 5 required sections
      expect(reportContent).toContain('## 1. Documentation Summary');
      expect(reportContent).toContain('## 2. Implementation Status');
      expect(reportContent).toContain('## 3. API Capabilities');
      expect(reportContent).toContain('## 4. Gap Analysis');
      expect(reportContent).toContain('## 5. Recommendations');

      // Should reflect research findings
      expect(reportContent).toContain('75/100');
      expect(reportContent).toContain('alignment score');
    });

    test('should include actionable recommendations', async () => {
      const mockAnalysisData = {
        documentation: {
          foundDocuments: ['THREAD-SUMMARY.md'],
          missingDocuments: ['README.md'],
          documentsByType: { plans: 1 }
        },
        implementation: {
          completedFeatures: ['Metadata'],
          pendingItems: ['Prices'],
          knownIssues: ['Schema validation'],
          scriptsStatus: { generation: 3, ingestion: 3 },
          statistics: { totalEntitiesIngested: 100 }
        },
        apiCapabilities: {
          alignmentScore: 75,
          apiSupported: ['Products'],
          manualConfigRequired: ['Stocks'],
          missingFields: ['country_id'],
          implementationGaps: ['Missing sources'],
          sourceStatus: { implemented: 3, total: 6 }
        }
      };

      const reportPath = path.join(projectRoot, '.rptc', 'validation', 'test-report.md');
      await generateValidationReport(mockAnalysisData, reportPath);

      const reportContent = await fs.readFile(reportPath, 'utf-8');

      // Should include recommendations section with actionable items
      expect(reportContent).toContain('## 5. Recommendations');
      expect(reportContent).toContain('Priority');

      // Cleanup test file
      await fs.unlink(reportPath);
    });
  });

  describe('Error handling', () => {
    test('should handle non-existent documentation directory', async () => {
      const badPath = path.join(projectRoot, 'non-existent-directory');
      await expect(scanProjectDocumentation(badPath)).rejects.toThrow();
    });

    test('should handle non-existent THREAD-SUMMARY file', async () => {
      const badPath = path.join(projectRoot, 'non-existent-file.md');
      await expect(parseThreadSummary(badPath)).rejects.toThrow();
    });

    test('should handle non-existent research file', async () => {
      const badPath = path.join(projectRoot, 'non-existent-research.md');
      await expect(validateAPICapabilities(badPath)).rejects.toThrow();
    });

    test('should handle report generation errors', async () => {
      const badAnalysisData = null;
      const reportPath = path.join(projectRoot, '.rptc', 'validation', 'error-test.md');
      await expect(generateValidationReport(badAnalysisData, reportPath)).rejects.toThrow();
    });
  });

  describe('Edge cases', () => {
    test('should handle empty documentation directory', async () => {
      // Create a temporary empty directory
      const tempDir = path.join(projectRoot, '.rptc', 'validation', 'temp-empty-dir');
      await fs.mkdir(tempDir, { recursive: true });

      const result = await scanProjectDocumentation(tempDir);
      expect(result.foundDocuments.length).toBe(0);
      expect(result.missingDocuments).toContain('THREAD-SUMMARY.md');

      // Cleanup
      await fs.rmdir(tempDir);
    });

    test('should handle missing data sections in reports', async () => {
      const minimalData = {
        documentation: {
          foundDocuments: [],
          missingDocuments: ['test.md'],
          documentsByType: {}
        },
        implementation: {
          completedFeatures: [],
          pendingItems: [],
          knownIssues: [],
          scriptsStatus: {},
          statistics: {}
        },
        apiCapabilities: {
          alignmentScore: 100,
          apiSupported: [],
          manualConfigRequired: [],
          missingFields: [],
          implementationGaps: [],
          sourceStatus: { implemented: 6, total: 6 }
        }
      };

      const reportPath = path.join(projectRoot, '.rptc', 'validation', 'edge-case-report.md');
      const result = await generateValidationReport(minimalData, reportPath);

      expect(result.success).toBe(true);

      const reportContent = await fs.readFile(reportPath, 'utf-8');
      expect(reportContent).toContain('## 5. Recommendations');
      expect(reportContent).toContain('No critical recommendations');

      // Cleanup
      await fs.unlink(reportPath);
    });
  });

  describe('Integration test', () => {
    test('should run complete validation workflow', async () => {
      // This test verifies the entire validation workflow
      const instructionsDir = path.join(projectRoot, 'instructions');
      const threadSummaryPath = path.join(projectRoot, 'instructions', 'THREAD-SUMMARY.md');
      const researchPath = path.join(projectRoot, '.rptc', 'research', 'adobe-commerce-msi-api-validation.md');

      // Step 1: Scan documentation
      const docResults = await scanProjectDocumentation(instructionsDir);
      expect(docResults.foundDocuments.length).toBeGreaterThan(0);

      // Step 2: Parse implementation status
      const implResults = await parseThreadSummary(threadSummaryPath);
      expect(implResults.completedFeatures.length).toBeGreaterThan(0);

      // Step 3: Validate API capabilities
      const apiResults = await validateAPICapabilities(researchPath);
      expect(apiResults.alignmentScore).toBe(75);

      // Step 4: Generate report
      const analysisData = {
        documentation: docResults,
        implementation: implResults,
        apiCapabilities: apiResults
      };

      const reportPath = path.join(projectRoot, '.rptc', 'validation', 'context-analysis-report.md');
      const reportResult = await generateValidationReport(analysisData, reportPath);

      expect(reportResult.success).toBe(true);

      // Verify report exists
      const reportExists = await fs.access(reportPath).then(() => true).catch(() => false);
      expect(reportExists).toBe(true);
    });
  });
});
