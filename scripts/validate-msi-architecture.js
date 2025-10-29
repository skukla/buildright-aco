/**
 * MSI Architecture Research Validation Script
 *
 * Validates completeness of Step 2: MSI Architecture Research & Recommendation
 *
 * Checks:
 * - Research document exists and has all three models
 * - Recommendation document exists with evaluation matrix
 * - All required sections present
 * - Compliance with Adobe Commerce constraints documented
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Validation result object for tracking validation passes, failures, and warnings
 * @class
 */
class ValidationResult {
  /**
   * Create a new validation result
   */
  constructor() {
    this.passed = [];
    this.failed = [];
    this.warnings = [];
  }

  /**
   * Record a passed validation
   * @param {string} message - Description of what passed
   */
  pass(message) {
    this.passed.push(message);
  }

  /**
   * Record a failed validation
   * @param {string} message - Description of what failed
   */
  fail(message) {
    this.failed.push(message);
  }

  /**
   * Record a validation warning
   * @param {string} message - Description of the warning
   */
  warn(message) {
    this.warnings.push(message);
  }

  /**
   * Check if all validations passed (no failures)
   * @returns {boolean} True if no failures
   */
  get isValid() {
    return this.failed.length === 0;
  }

  /**
   * Get summary of validation results
   * @returns {Object} Summary with counts and validity status
   */
  get summary() {
    return {
      total: this.passed.length + this.failed.length,
      passed: this.passed.length,
      failed: this.failed.length,
      warnings: this.warnings.length,
      valid: this.isValid
    };
  }
}

/**
 * Validate research document exists and has required content
 * Checks for all three architecture models, diagrams, constraint compliance, and MSI features
 * @returns {ValidationResult} Validation result object with pass/fail status
 */
export function validateResearchDocument() {
  const result = new ValidationResult();
  const researchPath = join(projectRoot, '.rptc/research/msi-architecture-options.md');

  // Check file exists
  if (!existsSync(researchPath)) {
    result.fail('Research document does not exist: msi-architecture-options.md');
    return result;
  }
  result.pass('Research document exists');

  // Read and validate content
  const content = readFileSync(researchPath, 'utf-8');

  // Check for three architecture models
  const hasDigitalCommerce = content.toLowerCase().includes('digital commerce');
  const hasUnifiedDistribution = content.toLowerCase().includes('unified distribution');
  const hasSourcePriority = content.toLowerCase().includes('source priority');

  if (hasDigitalCommerce) {
    result.pass('Digital Commerce Model documented');
  } else {
    result.fail('Digital Commerce Model not found in research');
  }

  if (hasUnifiedDistribution) {
    result.pass('Unified Distribution Model documented');
  } else {
    result.fail('Unified Distribution Model not found in research');
  }

  if (hasSourcePriority) {
    result.pass('Source Priority Model documented');
  } else {
    result.fail('Source Priority Model not found in research');
  }

  // Check for architecture diagrams
  const diagramCount = (content.match(/```/g) || []).length / 2;
  if (diagramCount >= 3) {
    result.pass(`Found ${diagramCount} architecture diagrams`);
  } else {
    result.warn(`Only ${diagramCount} diagrams found, expected at least 3`);
  }

  // Check for constraint compliance
  if (content.match(/1:1.*stock.*website|stock.*website.*constraint/i)) {
    result.pass('Adobe Commerce 1:1 constraint documented');
  } else {
    result.fail('1:1 stock-to-website constraint not clearly documented');
  }

  // Check for MSI features
  const msiFeatures = [
    'source priority',
    'distance algorithm',
    'inventory allocation'
  ];

  msiFeatures.forEach(feature => {
    if (content.toLowerCase().includes(feature)) {
      result.pass(`MSI feature documented: ${feature}`);
    } else {
      result.fail(`MSI feature missing: ${feature}`);
    }
  });

  return result;
}

/**
 * Validate recommendation document exists and has required content
 * Checks for evaluation matrix, scores, pros/cons, and recommendation rationale
 * @returns {ValidationResult} Validation result object with pass/fail status
 */
export function validateRecommendationDocument() {
  const result = new ValidationResult();
  const recommendationPath = join(projectRoot, '.rptc/research/msi-recommendation.md');

  // Check file exists
  if (!existsSync(recommendationPath)) {
    result.fail('Recommendation document does not exist: msi-recommendation.md');
    return result;
  }
  result.pass('Recommendation document exists');

  // Read and validate content
  const content = readFileSync(recommendationPath, 'utf-8');

  // Check for evaluation matrix
  if (content.match(/evaluation|matrix/i)) {
    result.pass('Evaluation matrix section found');
  } else {
    result.fail('Evaluation matrix not found');
  }

  // Check for scores (1-5 scale)
  if (content.match(/[1-5]\/5|\| [1-5] \|/)) {
    result.pass('Scored evaluation found (1-5 scale)');
  } else {
    result.fail('Scored evaluation not found');
  }

  // Check for pros and cons
  const prosCount = (content.match(/pros|advantages/gi) || []).length;
  const consCount = (content.match(/cons|disadvantages/gi) || []).length;

  if (prosCount >= 3) {
    result.pass(`Pros documented for ${prosCount} models`);
  } else {
    result.fail('Pros not documented for all models');
  }

  if (consCount >= 3) {
    result.pass(`Cons documented for ${consCount} models`);
  } else {
    result.fail('Cons not documented for all models');
  }

  // Check for final recommendation
  if (content.match(/recommend(ed|ation)|final.*choice|selected/i)) {
    result.pass('Final recommendation stated');
  } else {
    result.fail('Final recommendation not clearly stated');
  }

  // Check for BuildRight narrative alignment
  if (content.match(/buildright|narrative|business.*context/i)) {
    result.pass('BuildRight narrative alignment discussed');
  } else {
    result.fail('BuildRight narrative alignment not addressed');
  }

  // Check for rationale
  if (content.match(/rationale|reason|why|because|justification/i)) {
    result.pass('Recommendation rationale provided');
  } else {
    result.fail('Recommendation rationale missing');
  }

  return result;
}

/**
 * Validate architecture decisions document
 * Checks that MSI architecture decision is documented
 * @returns {ValidationResult} Validation result object with pass/fail status
 */
export function validateArchitectureDecisions() {
  const result = new ValidationResult();
  const adPath = join(projectRoot, '.context/architecture-decisions.md');

  // Check file exists
  if (!existsSync(adPath)) {
    result.fail('Architecture decisions document does not exist');
    return result;
  }
  result.pass('Architecture decisions document exists');

  // Read and validate content
  const content = readFileSync(adPath, 'utf-8');

  // Check for MSI reference
  if (content.match(/msi|multi.*source.*inventory/i)) {
    result.pass('MSI architecture decision documented');
  } else {
    result.fail('MSI architecture decision not documented');
  }

  return result;
}

/**
 * Run all validations and generate comprehensive report
 * Validates research document, recommendation document, and architecture decisions
 * @returns {Object} Comprehensive validation results with totals and component-level summaries
 */
export function validateAll() {
  console.log('='.repeat(60));
  console.log('MSI Architecture Research Validation');
  console.log('='.repeat(60));
  console.log();

  const researchResult = validateResearchDocument();
  console.log('Research Document Validation:');
  console.log('-'.repeat(60));
  researchResult.passed.forEach(msg => console.log(`  ✓ ${msg}`));
  researchResult.failed.forEach(msg => console.log(`  ✗ ${msg}`));
  researchResult.warnings.forEach(msg => console.log(`  ⚠ ${msg}`));
  console.log();

  const recommendationResult = validateRecommendationDocument();
  console.log('Recommendation Document Validation:');
  console.log('-'.repeat(60));
  recommendationResult.passed.forEach(msg => console.log(`  ✓ ${msg}`));
  recommendationResult.failed.forEach(msg => console.log(`  ✗ ${msg}`));
  recommendationResult.warnings.forEach(msg => console.log(`  ⚠ ${msg}`));
  console.log();

  const adResult = validateArchitectureDecisions();
  console.log('Architecture Decisions Validation:');
  console.log('-'.repeat(60));
  adResult.passed.forEach(msg => console.log(`  ✓ ${msg}`));
  adResult.failed.forEach(msg => console.log(`  ✗ ${msg}`));
  adResult.warnings.forEach(msg => console.log(`  ⚠ ${msg}`));
  console.log();

  // Overall summary
  const totalPassed = researchResult.passed.length + recommendationResult.passed.length + adResult.passed.length;
  const totalFailed = researchResult.failed.length + recommendationResult.failed.length + adResult.failed.length;
  const totalWarnings = researchResult.warnings.length + recommendationResult.warnings.length + adResult.warnings.length;

  console.log('='.repeat(60));
  console.log('Summary:');
  console.log(`  Passed: ${totalPassed}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log(`  Warnings: ${totalWarnings}`);
  console.log();

  const allValid = researchResult.isValid && recommendationResult.isValid && adResult.isValid;
  if (allValid) {
    console.log('  Status: ✓ ALL VALIDATIONS PASSED');
  } else {
    console.log('  Status: ✗ VALIDATION FAILED');
  }
  console.log('='.repeat(60));

  return {
    valid: allValid,
    research: researchResult.summary,
    recommendation: recommendationResult.summary,
    architectureDecisions: adResult.summary,
    totals: {
      passed: totalPassed,
      failed: totalFailed,
      warnings: totalWarnings
    }
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const results = validateAll();
  process.exit(results.valid ? 0 : 1);
}
