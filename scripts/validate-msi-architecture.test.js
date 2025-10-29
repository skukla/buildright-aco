/**
 * Test suite for MSI Architecture Validation Script
 *
 * Tests the validation script functions to ensure proper code coverage
 */

import { describe, test, expect } from '@jest/globals';
import {
  validateResearchDocument,
  validateRecommendationDocument,
  validateArchitectureDecisions,
  validateAll
} from './validate-msi-architecture.js';

describe('MSI Architecture Validation Script', () => {

  describe('validateResearchDocument', () => {
    test('should return validation result object', () => {
      const result = validateResearchDocument();
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test('should pass all research document validations', () => {
      const result = validateResearchDocument();
      expect(result.isValid).toBe(true);
      expect(result.summary.passed).toBeGreaterThan(0);
    });

    test('should validate Digital Commerce Model', () => {
      const result = validateResearchDocument();
      const hasDigitalCommerce = result.passed.some(msg =>
        msg.toLowerCase().includes('digital commerce')
      );
      expect(hasDigitalCommerce).toBe(true);
    });

    test('should validate Unified Distribution Model', () => {
      const result = validateResearchDocument();
      const hasUnifiedDistribution = result.passed.some(msg =>
        msg.toLowerCase().includes('unified distribution')
      );
      expect(hasUnifiedDistribution).toBe(true);
    });

    test('should validate Source Priority Model', () => {
      const result = validateResearchDocument();
      const hasSourcePriority = result.passed.some(msg =>
        msg.toLowerCase().includes('source priority')
      );
      expect(hasSourcePriority).toBe(true);
    });

    test('should validate MSI features', () => {
      const result = validateResearchDocument();
      const msiFeatureChecks = result.passed.filter(msg =>
        msg.toLowerCase().includes('msi feature')
      );
      expect(msiFeatureChecks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validateRecommendationDocument', () => {
    test('should return validation result object', () => {
      const result = validateRecommendationDocument();
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test('should pass all recommendation document validations', () => {
      const result = validateRecommendationDocument();
      expect(result.isValid).toBe(true);
      expect(result.summary.passed).toBeGreaterThan(0);
    });

    test('should validate evaluation matrix exists', () => {
      const result = validateRecommendationDocument();
      const hasMatrix = result.passed.some(msg =>
        msg.toLowerCase().includes('evaluation matrix')
      );
      expect(hasMatrix).toBe(true);
    });

    test('should validate scored evaluation', () => {
      const result = validateRecommendationDocument();
      const hasScores = result.passed.some(msg =>
        msg.toLowerCase().includes('scored evaluation')
      );
      expect(hasScores).toBe(true);
    });

    test('should validate pros and cons', () => {
      const result = validateRecommendationDocument();
      const hasPros = result.passed.some(msg => msg.toLowerCase().includes('pros'));
      const hasCons = result.passed.some(msg => msg.toLowerCase().includes('cons'));
      expect(hasPros).toBe(true);
      expect(hasCons).toBe(true);
    });

    test('should validate final recommendation', () => {
      const result = validateRecommendationDocument();
      const hasRecommendation = result.passed.some(msg =>
        msg.toLowerCase().includes('final recommendation')
      );
      expect(hasRecommendation).toBe(true);
    });

    test('should validate BuildRight narrative alignment', () => {
      const result = validateRecommendationDocument();
      const hasNarrative = result.passed.some(msg =>
        msg.toLowerCase().includes('buildright narrative')
      );
      expect(hasNarrative).toBe(true);
    });
  });

  describe('validateArchitectureDecisions', () => {
    test('should return validation result object', () => {
      const result = validateArchitectureDecisions();
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test('should pass all architecture decisions validations', () => {
      const result = validateArchitectureDecisions();
      expect(result.isValid).toBe(true);
      expect(result.summary.passed).toBeGreaterThan(0);
    });

    test('should validate MSI architecture decision documented', () => {
      const result = validateArchitectureDecisions();
      const hasMSI = result.passed.some(msg =>
        msg.toLowerCase().includes('msi architecture')
      );
      expect(hasMSI).toBe(true);
    });
  });

  describe('validateAll', () => {
    test('should return comprehensive validation results', () => {
      const results = validateAll();
      expect(results).toBeDefined();
      expect(results.valid).toBeDefined();
      expect(results.research).toBeDefined();
      expect(results.recommendation).toBeDefined();
      expect(results.architectureDecisions).toBeDefined();
      expect(results.totals).toBeDefined();
    });

    test('should pass all validations', () => {
      const results = validateAll();
      expect(results.valid).toBe(true);
    });

    test('should have comprehensive totals', () => {
      const results = validateAll();
      expect(results.totals.passed).toBeGreaterThan(15);
      expect(results.totals.failed).toBe(0);
    });

    test('should validate all three components', () => {
      const results = validateAll();
      expect(results.research.valid).toBe(true);
      expect(results.recommendation.valid).toBe(true);
      expect(results.architectureDecisions.valid).toBe(true);
    });

    test('should include warning counts in totals', () => {
      const results = validateAll();
      expect(results.totals.warnings).toBeDefined();
      expect(results.totals.warnings).toBeGreaterThanOrEqual(0);
    });

    test('should have individual component summaries', () => {
      const results = validateAll();
      expect(results.research.total).toBeGreaterThan(0);
      expect(results.recommendation.total).toBeGreaterThan(0);
      expect(results.architectureDecisions.total).toBeGreaterThan(0);
    });
  });

  describe('ValidationResult class', () => {
    test('should track passed validations', () => {
      const result = validateResearchDocument();
      expect(result.passed).toBeDefined();
      expect(Array.isArray(result.passed)).toBe(true);
    });

    test('should track failed validations', () => {
      const result = validateResearchDocument();
      expect(result.failed).toBeDefined();
      expect(Array.isArray(result.failed)).toBe(true);
    });

    test('should track warnings', () => {
      const result = validateResearchDocument();
      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    test('should calculate summary correctly', () => {
      const result = validateResearchDocument();
      const summary = result.summary;
      expect(summary.total).toBe(summary.passed + summary.failed);
      expect(summary.valid).toBe(summary.failed === 0);
    });
  });
});
