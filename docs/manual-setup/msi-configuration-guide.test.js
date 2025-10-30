/**
 * Test Suite: MSI Configuration Guide Validation
 * Purpose: Validate MSI configuration guide completeness and ACO limitation documentation
 *
 * Tests validate that the MSI guide:
 * - Documents ACO API limitations clearly
 * - Provides workaround strategies (manual UI and REST API)
 * - References actual inventory sources from sources.json
 * - Frames MSI positively as Adobe Commerce backend feature
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

describe('MSI Configuration Guide', () => {
  const guideFilePath = path.join(projectRoot, 'docs', 'manual-setup', 'msi-configuration-guide.md');
  const sourcesFilePath = path.join(projectRoot, 'data', 'buildright', 'sources.json');

  describe('documents ACO API limitations clearly', () => {
    it('should exist at the correct file path', () => {
      // Given: MSI configuration guide should exist
      // When: Checking file existence
      // Then: File exists at docs/manual-setup/msi-configuration-guide.md
      expect(existsSync(guideFilePath)).toBe(true);
    });

    it('should explicitly state ACO Data Ingestion API does not support inventory', () => {
      // Given: Generated MSI configuration guide
      // When: Parsing limitations section
      // Then: Explicitly states "ACO Data Ingestion API does not support inventory operations"
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/ACO Data Ingestion API does not support inventory/i);
    });

    it('should explain that Multi-Source Inventory must be configured manually', () => {
      // Given: MSI guide with ACO limitations section
      // When: Checking for manual configuration requirement
      // Then: States that MSI must be configured manually or via Adobe Commerce API
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/Multi-Source Inventory.*must be configured manually/i);
    });
  });

  describe('includes workaround strategy', () => {
    it('should provide at least one workaround approach', () => {
      // Given: MSI guide
      // When: Searching for workaround or alternative sections
      // Then: Document describes manual UI setup OR Adobe Commerce Inventory REST API alternative
      const content = readFileSync(guideFilePath, 'utf-8');

      const hasManualUIWorkaround = content.match(/Admin.*UI.*setup/i);
      const hasAPIAlternative = content.match(/Adobe Commerce.*Inventory.*REST API/i);

      // Should have at least one workaround strategy
      expect(hasManualUIWorkaround || hasAPIAlternative).toBeTruthy();
    });

    it('should include both manual and API approaches', () => {
      // Given: MSI guide with workaround strategies
      // When: Searching for option sections
      // Then: Contains "## Option 1:" and "## Option 2:"
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/## Option 1:/i);
      expect(content).toMatch(/## Option 2:/i);
    });

    it('should describe manual Admin UI configuration process', () => {
      // Given: MSI guide Option 1 section
      // When: Checking manual configuration details
      // Then: Includes step-by-step Admin UI instructions
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/Admin.*→.*Stores.*→.*Inventory/i);
      expect(content).toMatch(/Create.*Source|Add New Source/i);
    });

    it('should describe REST API configuration approach', () => {
      // Given: MSI guide Option 2 section
      // When: Checking API configuration details
      // Then: Includes REST API endpoints and example code
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/\/rest\/V1\/inventory\/sources/i);
      expect(content).toMatch(/POST|GET|PUT/);
    });
  });

  describe('references actual inventory sources from sources.json', () => {
    it('should reference at least 50% of actual inventory sources', () => {
      // Given: MSI guide with source examples
      // When: Parsing source names/codes
      // Then: References match sources.json source codes (at least 50%)
      const guideContent = readFileSync(guideFilePath, 'utf-8');
      const sourcesData = JSON.parse(readFileSync(sourcesFilePath, 'utf-8'));

      // Extract source codes from sources.json
      const sourceCodes = sourcesData.map(s => s.source_code);

      // Check that guide references at least 50% of actual sources
      let matchCount = 0;
      for (const sourceCode of sourceCodes) {
        if (guideContent.includes(sourceCode)) {
          matchCount++;
        }
      }

      expect(matchCount).toBeGreaterThanOrEqual(sourceCodes.length * 0.5);
    });

    it('should reference warehouse_west as primary example', () => {
      // Given: MSI guide using real source examples
      // When: Checking for specific source references
      // Then: warehouse_west appears as a concrete example
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/warehouse_west/);
    });

    it('should include source details matching actual data structure', () => {
      // Given: MSI guide with source configuration examples
      // When: Checking source attribute references
      // Then: Mentions source_code, name, region, latitude, longitude, etc.
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/source_code|sourceCode/i);
      expect(content).toMatch(/latitude|longitude/i);
      expect(content).toMatch(/region/i);
    });
  });

  describe('frames MSI positively as Adobe Commerce feature', () => {
    it('should position MSI as Adobe Commerce backend feature', () => {
      // Given: MSI guide with system architecture explanation
      // When: Checking framing and tone
      // Then: Positions MSI as "Adobe Commerce backend feature" not ACO limitation
      const content = readFileSync(guideFilePath, 'utf-8');

      // Should mention "Adobe Commerce" managing inventory
      expect(content).toMatch(/Adobe Commerce.*(?:manages|handles|provides).*inventory/i);
    });

    it('should explain separation of concerns between ACO and Adobe Commerce', () => {
      // Given: MSI guide architecture section
      // When: Checking system responsibilities
      // Then: Clearly distinguishes ACO responsibilities (catalog, pricing) from Commerce (MSI, B2B)
      const content = readFileSync(guideFilePath, 'utf-8');

      // ACO manages catalog and pricing
      expect(content).toMatch(/ACO.*(?:manages|handles).*(?:catalog|pricing)/i);

      // Adobe Commerce manages inventory
      expect(content).toMatch(/Adobe Commerce.*(?:manages|handles).*inventory/i);
    });

    it('should use positive language, not apologetic tone', () => {
      // Given: MSI guide content
      // When: Checking language and tone
      // Then: Does not use words like "unfortunately", "limitation", "workaround" excessively
      const content = readFileSync(guideFilePath, 'utf-8');

      // Count negative/apologetic words
      const negativeWords = (content.match(/unfortunately|sorry|workaround|limitation/gi) || []).length;
      const totalWords = content.split(/\s+/).length;
      const negativeRatio = negativeWords / totalWords;

      // Less than 0.5% negative words
      expect(negativeRatio).toBeLessThan(0.005);
    });
  });

  describe('provides practical implementation guidance', () => {
    it('should include estimated setup time', () => {
      // Given: MSI configuration guide
      // When: Checking for time estimates
      // Then: Contains reasonable time estimate (3-5 hours for manual UI)
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/\d+[-–]\d+\s+hours?/i);
    });

    it('should include stock configuration instructions', () => {
      // Given: MSI guide with complete setup workflow
      // When: Checking for stock management
      // Then: Explains creating stocks and linking sources to stocks
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/stock/i);
      expect(content).toMatch(/link.*source.*to.*stock|assign.*source/i);
    });

    it('should include product-source assignment instructions', () => {
      // Given: MSI guide with product configuration
      // When: Checking product-source relationship setup
      // Then: Explains how to assign products to sources with quantities
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/assign.*product.*to.*source|product.*source.*assignment/i);
      expect(content).toMatch(/quantit(?:y|ies)/i);
    });

    it('should include validation and testing checklist', () => {
      // Given: MSI guide with quality assurance section
      // When: Checking for validation instructions
      // Then: Includes testing checklist or validation steps
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toMatch(/validat|test|verify|check/i);
    });
  });
});
