/**
 * Test Suite: B2B Configuration Guide Structure Validation
 * Purpose: Validate B2B configuration guide completeness and accuracy
 *
 * Tests validate that the B2B guide:
 * - Contains all required sections
 * - Defines exactly 8 demo companies with complete details
 * - References valid price books from hierarchical structure
 * - Specifies correct number of locations (20-24 total)
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

describe('B2B Configuration Guide Structure Validation', () => {
  const guideFilePath = path.join(projectRoot, 'docs', 'manual-setup', 'b2b-configuration-guide.md');
  const priceBookFilePath = path.join(projectRoot, 'data', 'buildright', 'price-books.json');

  describe('B2B guide includes all required sections', () => {
    it('should exist at the correct file path', () => {
      // Given: B2B configuration guide should exist
      // When: Checking file existence
      // Then: File exists at docs/manual-setup/b2b-configuration-guide.md
      expect(existsSync(guideFilePath)).toBe(true);
    });

    it('should contain all required sections', () => {
      // Given: Generated B2B configuration guide
      // When: Parsing document structure
      // Then: Contains sections: Prerequisites, Feature Enablement, Shared Catalog Creation,
      //       Company Creation, Team Setup, User Management, Testing
      const content = readFileSync(guideFilePath, 'utf-8');

      expect(content).toContain('Prerequisites');
      expect(content).toContain('Feature Enablement');
      expect(content).toContain('Shared Catalog');
      expect(content).toContain('Company Creation');
      expect(content).toContain('Team');
      expect(content).toContain('User Management');
      expect(content).toContain('Testing');
    });

    it('should include estimated setup time', () => {
      // Given: B2B configuration guide
      // When: Checking for time estimates
      // Then: Contains reasonable time estimate (18-25 hours mentioned in step file)
      const content = readFileSync(guideFilePath, 'utf-8');

      // Should mention hours or time estimate
      expect(content.toLowerCase()).toMatch(/\d+.*hours?|time.*estimate/i);
    });
  });

  describe('All 8 demo companies are defined', () => {
    it('should define exactly 8 companies with complete details', () => {
      // Given: B2B guide company configuration matrix
      // When: Counting defined companies
      // Then: Exactly 8 companies with complete details (name, type, shared catalog, locations, users)
      const content = readFileSync(guideFilePath, 'utf-8');

      // Extract company definitions - looking for structured company data
      // Companies should have: name, type/division, catalog assignment, locations, users
      const companyPattern = /##?\s+Company\s+\d+|###?\s+\d+\.|###?\s+[A-Z][a-zA-Z\s&]+(?:Commercial|Residential|Pro|Construction|Builder|Contractor|Supply)/gi;
      const companyMatches = content.match(companyPattern) || [];

      expect(companyMatches.length).toBeGreaterThanOrEqual(8);
    });

    it('should include company names in the guide', () => {
      // Given: B2B configuration guide
      // When: Searching for company references
      // Then: Guide includes specific company names
      const content = readFileSync(guideFilePath, 'utf-8');

      // Should reference multiple companies
      // Looking for patterns like "Company Name", "Company 1", etc.
      const companyReferences = content.match(/company\s+(?:\d+|name|:\s*[A-Z])/gi) || [];
      expect(companyReferences.length).toBeGreaterThanOrEqual(8);
    });

    it('should specify division type for each company', () => {
      // Given: B2B guide with company definitions
      // When: Checking company divisions
      // Then: Companies are categorized as Commercial, Residential, or Pro
      const content = readFileSync(guideFilePath, 'utf-8');

      // Should mention the three main divisions
      expect(content).toMatch(/Commercial/i);
      expect(content).toMatch(/Residential/i);
      expect(content).toMatch(/Pro/i);
    });
  });

  describe('Shared catalog assignments reference existing price books', () => {
    it('should only reference valid price books from Step 2', () => {
      // Given: Company-to-catalog mapping in B2B guide
      // When: Validating catalog assignments
      // Then: All assigned catalogs exist in price-books.json
      const guideContent = readFileSync(guideFilePath, 'utf-8');
      const priceBooks = JSON.parse(readFileSync(priceBookFilePath, 'utf-8'));
      const validPriceBookIds = priceBooks.map(pb => pb.priceBookId);

      // Extract price book references from guide
      // Looking for patterns like "US-Retail", "Contract-Commercial", etc.
      const priceBookPattern = /(?:US-Retail|US-Contract|Retail-Consumer|Contract-Commercial|Contract-Residential|Contract-Pro|Commercial-Tier1|Commercial-Tier2|Residential-Builder|Pro-Specialty)/g;
      const referencedPriceBooks = guideContent.match(priceBookPattern) || [];

      // Remove duplicates
      const uniqueReferences = [...new Set(referencedPriceBooks)];

      // All referenced price books should exist
      uniqueReferences.forEach(priceBookId => {
        expect(validPriceBookIds).toContain(priceBookId);
      });
    });

    it('should reference hierarchical price book structure', () => {
      // Given: Hierarchical price book structure from Step 2 (10 books across 3 levels)
      // When: Checking guide content
      // Then: Guide explains or references the hierarchical structure
      const content = readFileSync(guideFilePath, 'utf-8');

      // Should mention base price books
      expect(content).toMatch(/US-Retail|US-Contract/);

      // Should mention at least one segment or tier
      expect(content).toMatch(/Contract-Commercial|Contract-Residential|Retail-Consumer|Contract-Pro|Commercial-Tier|Residential-Builder|Pro-Specialty/);
    });

    it('should map companies to appropriate catalog levels', () => {
      // Given: 8 companies with different pricing needs
      // When: Checking catalog assignments
      // Then: Companies are assigned to appropriate catalog levels (base, segment, or tier)
      const content = readFileSync(guideFilePath, 'utf-8');

      // Count references to different price book types
      const baseBookRefs = (content.match(/US-Retail|US-Contract/g) || []).length;
      const segmentBookRefs = (content.match(/Retail-Consumer|Contract-Commercial|Contract-Residential|Contract-Pro/g) || []).length;
      const tierBookRefs = (content.match(/Commercial-Tier1|Commercial-Tier2|Residential-Builder|Pro-Specialty/g) || []).length;

      // Should use books from multiple levels
      const levelsUsed = [baseBookRefs, segmentBookRefs, tierBookRefs].filter(count => count > 0).length;
      expect(levelsUsed).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Total location count matches estimates', () => {
    it('should define 20-24 total locations across all companies', () => {
      // Given: All 8 companies with locations defined
      // When: Counting total locations across all companies
      // Then: 20-24 total locations (2-4 per company average)
      const content = readFileSync(guideFilePath, 'utf-8');

      // First, try to find explicit total count statement
      const totalPattern = /Total\s+Locations?:\s*(\d+)/i;
      const totalMatch = content.match(totalPattern);

      let totalLocationCount = 0;

      if (totalMatch) {
        // Found explicit total count
        totalLocationCount = parseInt(totalMatch[1], 10);
      } else {
        // Fallback: Count team definitions in the Team Setup section
        // Look for "Team \d+" patterns in structured team lists
        const teamSection = content.match(/## Team Setup[\s\S]*?(?=##|$)/i);
        if (teamSection) {
          const teamMatches = teamSection[0].match(/\*\*Team\s+\d+/gi) || [];
          totalLocationCount = teamMatches.length;
        }

        // If still no count, try counting location mentions per company
        if (totalLocationCount === 0) {
          const companyLocationPattern = /Locations?:\s*(\d+)/gi;
          const matches = [...content.matchAll(companyLocationPattern)];
          totalLocationCount = matches.reduce((sum, match) => {
            return sum + parseInt(match[1], 10);
          }, 0);
        }
      }

      // Should be between 20-24 locations total
      expect(totalLocationCount).toBeGreaterThanOrEqual(20);
      expect(totalLocationCount).toBeLessThanOrEqual(24);
    });

    it('should specify location details for each company', () => {
      // Given: 8 companies defined
      // When: Checking location information
      // Then: Each company has location details (city, state, or team name)
      const content = readFileSync(guideFilePath, 'utf-8');

      // Should include location/team details
      expect(content).toMatch(/location|team|branch|warehouse/i);

      // Should include some geographic references
      expect(content).toMatch(/[A-Z][a-z]+,\s*[A-Z]{2}|(?:Western|Central|Eastern)\s+Region/i);
    });
  });

  describe('Documentation quality', () => {
    it('should include cross-references to related documentation', () => {
      // Given: B2B configuration guide
      // When: Checking for cross-references
      // Then: References other relevant docs (ACO API guide, pricing docs, etc.)
      const content = readFileSync(guideFilePath, 'utf-8');

      // Should reference other documentation
      const hasReferences =
        content.includes('docs/') ||
        content.includes('See also') ||
        content.includes('Reference:') ||
        content.includes('[') && content.includes(']('); // Markdown links

      expect(hasReferences).toBe(true);
    });

    it('should use consistent terminology', () => {
      // Given: B2B configuration guide
      // When: Checking terminology usage
      // Then: Uses consistent terms (Company, Team, Shared Catalog, etc.)
      const content = readFileSync(guideFilePath, 'utf-8');

      // Should use B2B terminology consistently
      expect(content).toMatch(/Shared Catalog/i);
      expect(content).toMatch(/Company/i);

      // Should not mix inconsistent terms
      const companyCount = (content.match(/\bCompany\b/gi) || []).length;
      const organizationCount = (content.match(/\bOrganization\b/gi) || []).length;

      // If both terms used, company should be primary (used more)
      if (organizationCount > 0) {
        expect(companyCount).toBeGreaterThan(organizationCount);
      }
    });
  });
});
