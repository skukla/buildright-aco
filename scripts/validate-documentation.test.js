/**
 * Test Suite: Documentation Integration & Validation
 * Purpose: Validate comprehensive documentation integration for BuildRight ACO demo
 *
 * Test Coverage:
 * 1. Creative Brief Integration (Step 3)
 * 2. Documentation Cross-References (Step 6)
 * 3. README Accuracy (Step 6)
 * 4. Handoff Document Completeness (Step 6)
 * 5. Fact Consistency Across All Docs (Step 6)
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('Creative Brief Integration Validation', () => {
  const creativeBriefPath = path.join(projectRoot, 'instructions', '01-original-plan.md');

  describe('Creative brief includes B2B company structure section', () => {
    it('should have creative brief file', () => {
      // Given: Project with creative brief
      // When: Checking file existence
      // Then: Creative brief exists at instructions/01-original-plan.md
      expect(existsSync(creativeBriefPath)).toBe(true);
    });

    it('should include B2B company structure section', () => {
      // Given: Updated instructions/01-original-plan.md
      // When: Searching for "Company Overview" or "B2B Structure" section
      // Then: Section describes 8 demo companies with team structure
      const content = readFileSync(creativeBriefPath, 'utf-8');

      // Look for B2B structure section
      const hasB2BSection =
        content.includes('B2B Structure') ||
        content.includes('Company Overview') ||
        content.includes('B2B Company') ||
        content.includes('Demo Companies');

      expect(hasB2BSection).toBe(true);
    });

    it('should reference 8 demo companies', () => {
      // Given: Creative brief with B2B section
      // When: Analyzing company references
      // Then: Mentions or lists 8 companies
      const content = readFileSync(creativeBriefPath, 'utf-8');

      // Look for company count or listings
      const hasEightCompanies =
        content.includes('8 companies') ||
        content.includes('eight companies') ||
        content.match(/company\s+\d+/gi)?.length >= 8;

      expect(hasEightCompanies).toBe(true);
    });

    it('should describe team/location structure', () => {
      // Given: Creative brief B2B section
      // When: Checking for team structure information
      // Then: Describes teams, locations, or branches
      const content = readFileSync(creativeBriefPath, 'utf-8');

      // Should mention teams or locations in B2B context
      const hasTeamStructure =
        content.includes('team') ||
        content.includes('location') ||
        content.includes('branch') ||
        content.includes('warehouse');

      expect(hasTeamStructure).toBe(true);
    });

    it('should reference the three main divisions', () => {
      // Given: BuildRight has three divisions: Commercial, Residential, Pro
      // When: Checking creative brief
      // Then: Mentions all three divisions
      const content = readFileSync(creativeBriefPath, 'utf-8');

      expect(content).toMatch(/BuildRight Commercial|Commercial division/i);
      expect(content).toMatch(/BuildRight Residential|Residential division/i);
      expect(content).toMatch(/BuildRight Pro|Pro division/i);
    });
  });

  describe('B2B section integration quality', () => {
    it('should be integrated into existing narrative', () => {
      // Given: Creative brief with B2B section
      // When: Checking integration
      // Then: B2B section flows with existing company description
      const content = readFileSync(creativeBriefPath, 'utf-8');

      // Should be part of Company Overview section (which already exists)
      const companyOverviewSection = content.match(/## Company Overview[\s\S]*?(?=##|$)/i);
      expect(companyOverviewSection).toBeTruthy();

      if (companyOverviewSection) {
        const sectionText = companyOverviewSection[0];
        // B2B information should be in or near Company Overview
        expect(sectionText.toLowerCase()).toMatch(/company|division|b2b/);
      }
    });

    it('should maintain consistent formatting with existing document', () => {
      // Given: Creative brief follows markdown conventions
      // When: Checking B2B section formatting
      // Then: Uses same heading levels and structure
      const content = readFileSync(creativeBriefPath, 'utf-8');

      // Should use markdown headings consistently
      const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
      expect(headings.length).toBeGreaterThan(5); // Document has multiple sections

      // Should have proper structure (h2, h3, etc.)
      const h2Headings = content.match(/^##\s+[^#]/gm) || [];
      const h3Headings = content.match(/^###\s+[^#]/gm) || [];

      expect(h2Headings.length).toBeGreaterThan(0);
      expect(h3Headings.length).toBeGreaterThan(0);
    });

    it('should align with existing BuildRight narrative', () => {
      // Given: Creative brief describes BuildRight Solutions
      // When: Checking B2B companies
      // Then: Company names align with BuildRight branding
      const content = readFileSync(creativeBriefPath, 'utf-8');

      // Should reference BuildRight consistently
      const buildRightRefs = (content.match(/BuildRight/gi) || []).length;
      expect(buildRightRefs).toBeGreaterThan(3);
    });
  });
});

// ============================================================================
// STEP 6: DOCUMENTATION INTEGRATION & HANDOFF VALIDATION
// ============================================================================

/**
 * Helper: Get all markdown files recursively
 */
function getAllMarkdownFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Helper: Extract all markdown links from content
 */
function extractMarkdownLinks(content) {
  // Match both inline links [text](url) and reference links [text]: url
  const inlineLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  const referenceLinks = content.match(/\[([^\]]+)\]:\s*(.+)$/gm) || [];

  const links = [];

  inlineLinks.forEach((match) => {
    const urlMatch = match.match(/\]\(([^)]+)\)/);
    if (urlMatch) {
      links.push(urlMatch[1]);
    }
  });

  referenceLinks.forEach((match) => {
    const urlMatch = match.match(/:\s*(.+)$/);
    if (urlMatch) {
      links.push(urlMatch[1].trim());
    }
  });

  return links;
}

/**
 * Helper: Check if internal link is valid
 */
function isInternalLinkValid(link, sourceFile) {
  // Skip external links
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return true;
  }

  // Skip anchors within same document
  if (link.startsWith('#')) {
    return true;
  }

  // Resolve relative path
  const sourceDir = path.dirname(sourceFile);
  const targetPath = path.resolve(sourceDir, link.split('#')[0]);

  return existsSync(targetPath);
}

describe('Documentation Cross-Reference Validation (Step 6)', () => {
  const docsDir = path.join(projectRoot, 'docs');
  const instructionsDir = path.join(projectRoot, 'instructions');

  describe('All documentation files cross-referenced correctly', () => {
    it('should have no broken internal links in docs/', () => {
      // Given: All documentation files in docs/
      // When: Parsing for internal links
      // Then: All internal links point to existing files
      const markdownFiles = getAllMarkdownFiles(docsDir);
      const brokenLinks = [];

      markdownFiles.forEach((file) => {
        const content = readFileSync(file, 'utf-8');
        const links = extractMarkdownLinks(content);

        links.forEach((link) => {
          if (!isInternalLinkValid(link, file)) {
            brokenLinks.push({
              file: path.relative(projectRoot, file),
              link: link,
            });
          }
        });
      });

      if (brokenLinks.length > 0) {
        console.error('Broken links found:', JSON.stringify(brokenLinks, null, 2));
      }

      expect(brokenLinks).toHaveLength(0);
    });

    it('should have no broken internal links in instructions/', () => {
      // Given: All instruction files in instructions/
      // When: Parsing for internal links
      // Then: All internal links point to existing files
      const markdownFiles = getAllMarkdownFiles(instructionsDir);
      const brokenLinks = [];

      markdownFiles.forEach((file) => {
        const content = readFileSync(file, 'utf-8');
        const links = extractMarkdownLinks(content);

        links.forEach((link) => {
          if (!isInternalLinkValid(link, file)) {
            brokenLinks.push({
              file: path.relative(projectRoot, file),
              link: link,
            });
          }
        });
      });

      if (brokenLinks.length > 0) {
        console.error('Broken links found:', JSON.stringify(brokenLinks, null, 2));
      }

      expect(brokenLinks).toHaveLength(0);
    });

    it('should have cross-references between related guides', () => {
      // Given: Manual setup guides in docs/manual-setup/
      // When: Checking for cross-references
      // Then: Each guide references related guides
      const b2bGuide = path.join(docsDir, 'manual-setup', 'b2b-configuration-guide.md');
      const msiGuide = path.join(docsDir, 'manual-setup', 'msi-configuration-guide.md');
      const policyGuide = path.join(docsDir, 'manual-setup', 'trigger-policy-guide.md');

      const b2bContent = readFileSync(b2bGuide, 'utf-8');
      const msiContent = readFileSync(msiGuide, 'utf-8');
      const policyContent = readFileSync(policyGuide, 'utf-8');

      // B2B guide should reference MSI and policy guides
      expect(b2bContent).toMatch(/msi-configuration-guide\.md|MSI Configuration/i);

      // MSI guide should reference B2B guide
      expect(msiContent).toMatch(/b2b-configuration-guide\.md|B2B Configuration/i);

      // Policy guide should reference B2B and MSI guides
      expect(policyContent).toMatch(/b2b-configuration-guide\.md|B2B Configuration/i);
      expect(policyContent).toMatch(/msi-configuration-guide\.md|MSI Configuration/i);
    });
  });
});

describe('README.md Accuracy Validation (Step 6)', () => {
  const readmePath = path.join(projectRoot, 'README.md');

  describe('README reflects current implementation', () => {
    it('should mention 10 hierarchical price books (not 4 flat)', () => {
      // Given: Updated README.md
      // When: Checking price book description
      // Then: Mentions 10 hierarchical price books
      const content = readFileSync(readmePath, 'utf-8');

      // Should mention 10 price books
      const mentions10Books =
        content.includes('10 price books') ||
        content.includes('10 hierarchical price books');

      expect(mentions10Books).toBe(true);

      // Should NOT incorrectly state 4 price books
      const incorrectlyMentions4Books = content.match(/\b4 price books\b/i);
      expect(incorrectlyMentions4Books).toBeNull();
    });

    it('should describe hierarchical price book structure (3 levels)', () => {
      // Given: Price books implemented with 3-level hierarchy
      // When: Checking README price book description
      // Then: Describes hierarchical structure with levels
      const content = readFileSync(readmePath, 'utf-8');

      // Should mention hierarchical structure
      const mentionsHierarchy =
        content.includes('hierarchical') ||
        content.includes('3 levels') ||
        content.includes('three levels');

      expect(mentionsHierarchy).toBe(true);

      // Should mention parent relationships
      const mentionsParent = content.includes('parent');
      expect(mentionsParent).toBe(true);
    });

    it('should accurately state 184 total products', () => {
      // Given: Product catalog with 184 products
      // When: Checking product count in README
      // Then: States 184 products
      const content = readFileSync(readmePath, 'utf-8');

      const mentions184 = content.includes('184 products');
      expect(mentions184).toBe(true);
    });

    it('should reference semantic project attributes', () => {
      // Given: Step 1 implemented semantic attributes (project_types)
      // When: Checking README features
      // Then: Mentions project types or semantic attributes
      const content = readFileSync(readmePath, 'utf-8');

      const mentionsProjectAttributes =
        content.includes('project_types') ||
        content.includes('project attributes') ||
        content.includes('semantic attributes');

      expect(mentionsProjectAttributes).toBe(true);
    });

    it('should link to manual setup guides', () => {
      // Given: Manual setup guides created in Steps 3-5
      // When: Checking README links
      // Then: Links to B2B, MSI, and Policy guides
      const content = readFileSync(readmePath, 'utf-8');

      expect(content).toMatch(/b2b-configuration-guide\.md/);
      expect(content).toMatch(/msi-configuration-guide\.md/);
      expect(content).toMatch(/trigger-policy-guide\.md/);
    });
  });
});

describe('Handoff Document Completeness (Step 6)', () => {
  const handoffPath = path.join(projectRoot, 'docs', 'HANDOFF-COMPLETE.md');

  describe('Handoff document exists and is comprehensive', () => {
    it('should have handoff document at docs/HANDOFF-COMPLETE.md', () => {
      // Given: Final step complete
      // When: Checking for handoff document
      // Then: HANDOFF-COMPLETE.md exists in docs/
      expect(existsSync(handoffPath)).toBe(true);
    });

    it('should include Prerequisites section', () => {
      // Given: Handoff document created
      // When: Parsing for required sections
      // Then: Includes Prerequisites section
      const content = readFileSync(handoffPath, 'utf-8');

      expect(content).toMatch(/##\s+Prerequisites/i);
    });

    it('should include ACO Data Ingestion section', () => {
      // Given: Handoff document
      // When: Checking for ACO ingestion instructions
      // Then: Includes ACO Data Ingestion section
      const content = readFileSync(handoffPath, 'utf-8');

      expect(content).toMatch(/##\s+(ACO\s+)?Data\s+Ingestion|Ingesting\s+Data/i);
    });

    it('should include B2B Setup section', () => {
      // Given: Step 3 created B2B guide
      // When: Checking handoff document
      // Then: Includes B2B Setup section
      const content = readFileSync(handoffPath, 'utf-8');

      expect(content).toMatch(/##\s+B2B\s+(Setup|Configuration)/i);
    });

    it('should include MSI Setup section', () => {
      // Given: Step 4 created MSI guide
      // When: Checking handoff document
      // Then: Includes MSI Setup section
      const content = readFileSync(handoffPath, 'utf-8');

      expect(content).toMatch(/##\s+MSI\s+(Setup|Configuration)|Multi-Source\s+Inventory/i);
    });

    it('should include Policy Setup section', () => {
      // Given: Step 5 created policy guide
      // When: Checking handoff document
      // Then: Includes Policy Setup section
      const content = readFileSync(handoffPath, 'utf-8');

      expect(content).toMatch(/##\s+Policy\s+(Setup|Configuration)|Trigger.*Policy/i);
    });

    it('should include Testing section', () => {
      // Given: Complete implementation
      // When: Checking handoff
      // Then: Includes testing instructions
      const content = readFileSync(handoffPath, 'utf-8');

      expect(content).toMatch(/##\s+Testing|Verification/i);
    });

    it('should include Known Limitations section', () => {
      // Given: ACO has documented limitations
      // When: Checking handoff
      // Then: Includes Known Limitations section
      const content = readFileSync(handoffPath, 'utf-8');

      expect(content).toMatch(/##\s+Known\s+Limitations|Limitations/i);
    });

    it('should include Future Enhancements section', () => {
      // Given: Complete handoff document
      // When: Checking for roadmap
      // Then: Includes Future Enhancements section
      const content = readFileSync(handoffPath, 'utf-8');

      expect(content).toMatch(/##\s+Future\s+(Enhancements|Improvements)|Next\s+Steps/i);
    });

    it('should be comprehensive (>500 lines)', () => {
      // Given: Final handoff document
      // When: Checking length
      // Then: Substantial content (>500 lines for complete guide)
      const content = readFileSync(handoffPath, 'utf-8');
      const lineCount = content.split('\n').length;

      expect(lineCount).toBeGreaterThan(500);
    });
  });
});

describe('Documentation Fact Consistency (Step 6)', () => {
  describe('Price book count consistency', () => {
    it('should consistently reference 10 hierarchical price books across all docs', () => {
      // Given: All documentation files
      // When: Checking price book references
      // Then: No document incorrectly states 4 flat price books
      const allDocs = [
        ...getAllMarkdownFiles(path.join(projectRoot, 'docs')),
        ...getAllMarkdownFiles(path.join(projectRoot, 'instructions')),
        path.join(projectRoot, 'README.md'),
      ];

      const inconsistencies = [];

      allDocs.forEach((file) => {
        const content = readFileSync(file, 'utf-8');

        // Check for incorrect "4 price books" reference
        if (content.match(/\b4 price books\b/i)) {
          inconsistencies.push({
            file: path.relative(projectRoot, file),
            issue: 'Incorrectly states "4 price books" (should be 10 hierarchical)',
          });
        }
      });

      if (inconsistencies.length > 0) {
        console.error('Price book inconsistencies:', JSON.stringify(inconsistencies, null, 2));
      }

      expect(inconsistencies).toHaveLength(0);
    });

    it('should describe hierarchical structure consistently', () => {
      // Given: Documentation mentioning price books
      // When: Checking structure description
      // Then: Consistently describes 3-level hierarchy
      const b2bGuide = path.join(projectRoot, 'docs', 'manual-setup', 'b2b-configuration-guide.md');
      const handoffPath = path.join(projectRoot, 'docs', 'HANDOFF-COMPLETE.md');

      const b2bContent = readFileSync(b2bGuide, 'utf-8');
      const handoffContent = readFileSync(handoffPath, 'utf-8');

      // Both should mention hierarchical structure
      expect(b2bContent).toMatch(/hierarchical|parent/i);
      expect(handoffContent).toMatch(/hierarchical|parent/i);
    });
  });

  describe('Product count consistency', () => {
    it('should consistently state 184 products', () => {
      // Given: All documentation
      // When: Checking product count references
      // Then: Consistently states 184 products
      const readme = readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
      const handoff = readFileSync(path.join(projectRoot, 'docs', 'HANDOFF-COMPLETE.md'), 'utf-8');

      expect(readme).toMatch(/184 products/);
      expect(handoff).toMatch(/184 products/);
    });
  });

  describe('Architecture consistency', () => {
    it('should consistently reference 8 B2B companies', () => {
      // Given: B2B documentation
      // When: Checking company count
      // Then: All docs state 8 companies
      const b2bGuide = path.join(projectRoot, 'docs', 'manual-setup', 'b2b-configuration-guide.md');
      const handoff = path.join(projectRoot, 'docs', 'HANDOFF-COMPLETE.md');

      const b2bContent = readFileSync(b2bGuide, 'utf-8');
      const handoffContent = readFileSync(handoff, 'utf-8');

      expect(b2bContent).toMatch(/8\s+(demo\s+)?companies/i);
      expect(handoffContent).toMatch(/8\s+(demo\s+)?companies/i);
    });

    it('should consistently reference 6 inventory sources', () => {
      // Given: MSI documentation
      // When: Checking source count
      // Then: All docs state 6 sources
      const msiGuide = path.join(projectRoot, 'docs', 'manual-setup', 'msi-configuration-guide.md');
      const readme = path.join(projectRoot, 'README.md');

      const msiContent = readFileSync(msiGuide, 'utf-8');
      const readmeContent = readFileSync(readme, 'utf-8');

      expect(msiContent).toMatch(/6\s+(inventory\s+)?sources/i);
      expect(readmeContent).toMatch(/6\s+(inventory\s+)?sources/i);
    });
  });
});
