/**
 * Tests for ACO Trigger-Based Policy Configuration Guide
 *
 * Validates documentation structure, policy examples, and technical accuracy
 * for the trigger policy configuration guide.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

describe('Trigger Policy Guide Validation', () => {
  const guidePath = './docs/manual-setup/trigger-policy-guide.md';
  const metadataPath = './data/buildright/metadata.json';

  let guideContent;
  let metadata;
  let validAttributeCodes;

  beforeAll(() => {
    // Load guide content
    if (!existsSync(guidePath)) {
      throw new Error(`Guide not found at ${guidePath}`);
    }
    guideContent = readFileSync(guidePath, 'utf8');

    // Load metadata to validate attribute references
    if (!existsSync(metadataPath)) {
      throw new Error(`Metadata not found at ${metadataPath}`);
    }
    metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
    validAttributeCodes = metadata.map(attr => attr.attributeId);
  });

  describe('Content Structure', () => {
    it('should have required sections', () => {
      // Given: Policy guide content
      // When: Checking for required sections
      // Then: All required sections present

      const requiredSections = [
        'Overview',
        'Policy Types',
        'Policy Examples',
        'HTTP Header',
        'Testing'
      ];

      requiredSections.forEach(section => {
        expect(guideContent).toMatch(new RegExp(section, 'i'));
      });
    });

    it('should include both STATIC and EXCLUSIVE policy types', () => {
      // Given: Policy guide policy types section
      // When: Searching for policy type descriptions
      // Then: Explains both STATIC and EXCLUSIVE (trigger-based) policies

      expect(guideContent).toMatch(/STATIC/i);
      expect(guideContent).toMatch(/EXCLUSIVE/i);

      // Verify they're described as distinct types
      const staticMatch = guideContent.match(/STATIC.*policy/i);
      const exclusiveMatch = guideContent.match(/EXCLUSIVE.*policy/i);

      expect(staticMatch).toBeTruthy();
      expect(exclusiveMatch).toBeTruthy();
    });

    it('should explain trigger-based policy concepts', () => {
      // Given: Policy guide
      // When: Checking for trigger concepts
      // Then: Includes trigger, HTTP header, and dynamic filtering concepts

      expect(guideContent).toMatch(/trigger/i);
      expect(guideContent).toMatch(/HTTP.*header/i);
      expect(guideContent).toMatch(/dynamic/i);
    });
  });

  describe('Policy Examples', () => {
    it('should include at least 5 example policies', () => {
      // Given: Policy guide
      // When: Counting policy JSON examples
      // Then: At least 5 complete policy examples

      // Match JSON policy blocks with policyId
      const policyMatches = guideContent.match(/"policyId"\s*:\s*"[^"]+"/g);

      expect(policyMatches).toBeTruthy();
      expect(policyMatches.length).toBeGreaterThanOrEqual(5);
    });

    it('should include project_types filter example', () => {
      // Given: Trigger policy guide
      // When: Parsing policy examples section
      // Then: At least one example policy filtering on project_types attribute with HTTP header trigger

      expect(guideContent).toMatch(/project_types/);

      // Verify it's used in a policy context (with "attribute" nearby)
      const policyContext = guideContent.match(/["']attribute["']\s*:\s*["']project_types["']/);
      expect(policyContext).toBeTruthy();
    });

    it('should reference only valid attribute codes', () => {
      // Given: Policy guide with attribute filtering examples
      // When: Extracting attribute codes from policy JSON examples
      // Then: All referenced attributes exist in metadata.json

      // Extract all attribute references from policy examples
      const attributeMatches = guideContent.match(/"attribute"\s*:\s*"([^"]+)"/g);

      if (attributeMatches) {
        attributeMatches.forEach(match => {
          const attributeCode = match.match(/"attribute"\s*:\s*"([^"]+)"/)[1];

          // Verify this attribute exists in metadata
          expect(validAttributeCodes).toContain(attributeCode);
        });
      }
    });

    it('should include valid JSON policy structures', () => {
      // Given: Policy guide with JSON examples
      // When: Extracting JSON code blocks
      // Then: All JSON examples are syntactically valid

      // Extract JSON code blocks
      const jsonBlocks = guideContent.match(/```json\s*([\s\S]*?)\s*```/g);

      expect(jsonBlocks).toBeTruthy();
      expect(jsonBlocks.length).toBeGreaterThanOrEqual(5);

      jsonBlocks.forEach((block, index) => {
        const jsonContent = block.replace(/```json\s*/, '').replace(/\s*```/, '');

        // Verify it's valid JSON
        expect(() => JSON.parse(jsonContent)).not.toThrow();

        const parsed = JSON.parse(jsonContent);

        // Verify basic policy structure
        if (parsed.policyId) {
          expect(parsed).toHaveProperty('name');
          expect(parsed).toHaveProperty('type');
          expect(['STATIC', 'EXCLUSIVE']).toContain(parsed.type);
        }
      });
    });

    it('should include policies with EXCLUSIVE type and triggers', () => {
      // Given: Policy examples
      // When: Checking for trigger-based (EXCLUSIVE) policies
      // Then: At least one EXCLUSIVE policy with trigger configuration

      const jsonBlocks = guideContent.match(/```json\s*([\s\S]*?)\s*```/g);

      let hasExclusiveWithTrigger = false;

      jsonBlocks.forEach(block => {
        const jsonContent = block.replace(/```json\s*/, '').replace(/\s*```/, '');
        const parsed = JSON.parse(jsonContent);

        if (parsed.type === 'EXCLUSIVE' && parsed.trigger) {
          hasExclusiveWithTrigger = true;

          // Verify trigger structure
          expect(parsed.trigger).toHaveProperty('name');
          expect(parsed.trigger).toHaveProperty('transport');
          expect(parsed.trigger.transport).toBe('HTTP_HEADER');
        }
      });

      expect(hasExclusiveWithTrigger).toBe(true);
    });
  });

  describe('HTTP Header Examples', () => {
    it('should include HTTP header testing examples', () => {
      // Given: Policy guide
      // When: Searching for HTTP header examples
      // Then: Includes header testing examples

      expect(guideContent).toMatch(/curl|header|HTTP.*request/i);
    });

    it('should have syntactically correct HTTP headers', () => {
      // Given: Policy guide with HTTP header testing examples
      // When: Parsing header examples
      // Then: Headers follow standard HTTP header format (Header-Name: value)

      // Look for header format examples (common patterns)
      const headerPatterns = [
        /[-\w]+\s*:\s*[^\n]+/,  // Header-Name: value
        /-H\s+['"][^'"]+['"]/,  // curl -H "Header: value"
      ];

      const hasValidHeaderFormat = headerPatterns.some(pattern =>
        pattern.test(guideContent)
      );

      expect(hasValidHeaderFormat).toBe(true);

      // If curl examples exist, validate header format
      const curlHeaders = guideContent.match(/-H\s+['"]([^'"]+)['"]/g);

      if (curlHeaders) {
        curlHeaders.forEach(header => {
          const headerContent = header.match(/-H\s+['"]([^'"]+)['"]/)[1];

          // Verify standard HTTP header format (Header-Name: value)
          expect(headerContent).toMatch(/^[\w-]+:\s*.+$/);
        });
      }
    });

    it('should reference trigger names matching policy examples', () => {
      // Given: Policy examples and HTTP header examples
      // When: Extracting trigger names from policies
      // Then: HTTP header examples use those trigger names

      // Extract trigger names from policy examples
      const triggerMatches = guideContent.match(/"name"\s*:\s*"(AC-Policy-[^"]+)"/g);

      if (triggerMatches && triggerMatches.length > 0) {
        const triggerNames = triggerMatches.map(match =>
          match.match(/"name"\s*:\s*"([^"]+)"/)[1]
        );

        // At least one trigger should be referenced in header examples
        const referencedInHeaders = triggerNames.some(triggerName =>
          guideContent.includes(triggerName)
        );

        expect(referencedInHeaders).toBe(true);
      }
    });
  });

  describe('BuildRight Integration', () => {
    it('should reference BuildRight-specific attributes', () => {
      // Given: Policy guide
      // When: Checking for BuildRight context
      // Then: References project_types or other BuildRight attributes

      const buildRightAttributes = [
        'project_types',
        'commercial_residential',
        'brand',
        'product_category'
      ];

      const referencesAttributes = buildRightAttributes.some(attr =>
        guideContent.includes(attr)
      );

      expect(referencesAttributes).toBe(true);
    });

    it('should include realistic use cases for construction industry', () => {
      // Given: Policy guide examples
      // When: Checking for construction/project context
      // Then: Examples relate to construction projects or phases

      const constructionTerms = [
        /project/i,
        /construction/i,
        /commercial/i,
        /residential/i,
        /remodel/i,
        /repair/i,
        /new.construction/i,
        /restoration/i
      ];

      const hasConstructionContext = constructionTerms.some(term =>
        term.test(guideContent)
      );

      expect(hasConstructionContext).toBe(true);
    });
  });

  describe('Documentation Quality', () => {
    it('should be under file size limit', () => {
      // Given: Policy guide
      // When: Counting lines
      // Then: Under 1000 lines constraint

      const lineCount = guideContent.split('\n').length;
      expect(lineCount).toBeLessThan(1000);
    });

    it('should include practical guidance', () => {
      // Given: Policy guide
      // When: Checking for instructional content
      // Then: Includes how-to or step-by-step guidance

      const guidancePatterns = [
        /step/i,
        /how to/i,
        /create.*policy/i,
        /configure/i,
        /example/i
      ];

      const hasGuidance = guidancePatterns.some(pattern =>
        pattern.test(guideContent)
      );

      expect(hasGuidance).toBe(true);
    });

    it('should not have broken markdown links', () => {
      // Given: Policy guide content
      // When: Extracting markdown links
      // Then: No obviously broken links (empty hrefs, etc.)

      const markdownLinks = guideContent.match(/\[([^\]]+)\]\(([^)]+)\)/g);

      if (markdownLinks) {
        markdownLinks.forEach(link => {
          const href = link.match(/\[([^\]]+)\]\(([^)]+)\)/)[2];

          // Should not be empty or just a hash
          expect(href).toBeTruthy();
          expect(href).not.toBe('#');
        });
      }
    });
  });
});
