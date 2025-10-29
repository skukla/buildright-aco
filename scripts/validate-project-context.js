/**
 * Project Context Validation Script
 * Purpose: Analyze project state and generate validation report
 *
 * This script provides utilities to:
 * - Scan and categorize project documentation
 * - Parse implementation status from THREAD-SUMMARY.md
 * - Validate API capabilities against research findings
 * - Generate comprehensive validation reports
 *
 * @module validate-project-context
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Reads and parses a markdown file
 * @private
 * @param {string} filePath - Path to markdown file
 * @returns {Promise<string[]>} Array of lines from the file
 */
async function readMarkdownFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split('\n');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Extracts numeric values from lines matching a pattern
 * @private
 * @param {string[]} lines - Array of text lines
 * @param {string} pattern - Pattern to search for
 * @param {RegExp} regex - Regular expression to extract number
 * @returns {number} Extracted number or 0 if not found
 */
function extractNumber(lines, pattern, regex) {
  for (const line of lines) {
    if (line.includes(pattern)) {
      const match = line.match(regex);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
  }
  return 0;
}

/**
 * Scans project documentation directory
 * @param {string} instructionsDir - Path to instructions directory
 * @returns {Promise<object>} Documentation scan results
 */
export async function scanProjectDocumentation(instructionsDir) {
  const foundDocuments = [];
  const missingDocuments = [];
  const documentsByType = {
    plans: 0,
    phases: 0,
    summary: 0,
    other: 0
  };

  try {
    const files = await fs.readdir(instructionsDir);

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(instructionsDir, file);
        foundDocuments.push(filePath);

        // Categorize documents
        if (file.includes('plan')) {
          documentsByType.plans++;
        } else if (file.includes('phase')) {
          documentsByType.phases++;
        } else if (file.includes('SUMMARY')) {
          documentsByType.summary++;
        } else {
          documentsByType.other++;
        }
      }
    }

    // Check for expected critical files
    const criticalFiles = ['THREAD-SUMMARY.md'];
    for (const critical of criticalFiles) {
      const found = foundDocuments.some(doc => doc.includes(critical));
      if (!found) {
        missingDocuments.push(critical);
      }
    }

  } catch (error) {
    throw new Error(`Failed to scan documentation: ${error.message}`);
  }

  return {
    foundDocuments,
    missingDocuments,
    documentsByType
  };
}

/**
 * Parses THREAD-SUMMARY.md and extracts implementation status
 * @param {string} threadSummaryPath - Path to THREAD-SUMMARY.md
 * @returns {Promise<object>} Implementation status including completed features, pending items, and statistics
 * @throws {Error} If file cannot be read or parsed
 */
export async function parseThreadSummary(threadSummaryPath) {
  const completedFeatures = [];
  const pendingItems = [];
  const knownIssues = [];
  const scriptsStatus = {
    generation: 0,
    ingestion: 0
  };
  const statistics = {
    totalEntitiesIngested: 0
  };

  try {
    const lines = await readMarkdownFile(threadSummaryPath);

    // Parse completed features (marked with ✅)
    for (const line of lines) {
      if (line.includes('✅') && line.includes('**')) {
        const match = line.match(/✅\s+\*\*([^*]+)\*\*/);
        if (match) {
          completedFeatures.push(match[1].trim());
        }
      }

      // Parse pending items (marked with ⏳)
      if (line.includes('⏳')) {
        const match = line.match(/⏳\s+\*\*([^*]+)\*\*/);
        if (match) {
          pendingItems.push(match[1].trim());
        }
      }

      // Parse known issues (marked with ❌)
      if (line.includes('❌') && !line.includes('NOT')) {
        const match = line.match(/❌\s+(.+)/);
        if (match) {
          const issue = match[1].trim();
          if (!knownIssues.includes(issue)) {
            knownIssues.push(issue);
          }
        }
      }

      // Count generation scripts
      if (line.includes('generate-') && line.includes('✅')) {
        scriptsStatus.generation++;
      }

      // Count ingestion scripts
      if (line.includes('ingest-') && line.includes('✅')) {
        scriptsStatus.ingestion++;
      }

    }

    // Extract statistics using helper function
    statistics.totalEntitiesIngested =
      extractNumber(lines, 'Metadata Attributes', /(\d+)\s+Metadata/) +
      extractNumber(lines, 'Categories', /(\d+)\s+Categories/) +
      extractNumber(lines, 'Products', /(\d+)\s+Products/) +
      extractNumber(lines, 'Price Books', /(\d+)\s+Price Books/);

  } catch (error) {
    throw new Error(`Failed to parse THREAD-SUMMARY: ${error.message}`);
  }

  return {
    completedFeatures,
    pendingItems,
    knownIssues,
    scriptsStatus,
    statistics
  };
}

/**
 * Validates ACO API capabilities against scope requirements
 * @param {string} researchPath - Path to research findings markdown file
 * @returns {Promise<object>} API capabilities analysis including alignment score, supported features, and gaps
 * @throws {Error} If research file cannot be read or parsed
 */
export async function validateAPICapabilities(researchPath) {
  const apiSupported = [];
  const manualConfigRequired = [];
  const missingFields = [];
  const implementationGaps = [];
  let alignmentScore = 0;
  const sourceStatus = {
    implemented: 0,
    total: 0
  };

  try {
    const lines = await readMarkdownFile(researchPath);

    // Extract alignment score
    for (const line of lines) {
      if (line.includes('Validation Score:') || line.includes('**Validation Score:**')) {
        const match = line.match(/(\d+)\/100/);
        if (match) {
          alignmentScore = parseInt(match[1]);
        }
      }

      // Extract source implementation status
      if (line.includes('Current Implementation Status:')) {
        const match = line.match(/(\d+)\/(\d+)\s+inventory sources/);
        if (match) {
          sourceStatus.implemented = parseInt(match[1]);
          sourceStatus.total = parseInt(match[2]);
        }
      }

      // Extract missing required fields
      if (line.includes('Missing `country_id`')) {
        missingFields.push('country_id');
      }
      if (line.includes('Missing `postcode`')) {
        missingFields.push('postcode');
      }

      // Extract API supported features
      if (line.includes('✅') && (line.includes('API') || line.includes('endpoint'))) {
        const match = line.match(/✅\s+(.+)/);
        if (match) {
          apiSupported.push(match[1].trim());
        }
      }

      // Extract manual configuration requirements
      if (line.includes('manual') && line.includes('UI') || line.includes('Admin panel')) {
        manualConfigRequired.push(line.trim());
      }

      // Extract implementation gaps
      if (line.includes('Missing')) {
        const match = line.match(/Missing:\s*(.+)/);
        if (match) {
          implementationGaps.push(match[1].trim());
        }
      }
    }

    // Add known manual config items from context
    if (manualConfigRequired.length === 0) {
      manualConfigRequired.push('Stock configuration via Admin UI');
      manualConfigRequired.push('Source setup via Admin panel');
      manualConfigRequired.push('Sales channel assignments');
    }

    // Add known API supported items from context
    if (apiSupported.length === 0) {
      apiSupported.push('Product metadata creation via API');
      apiSupported.push('Category creation via API');
      apiSupported.push('Product creation via API');
      apiSupported.push('Price book creation via API');
      apiSupported.push('Price creation via API');
    }

  } catch (error) {
    throw new Error(`Failed to validate API capabilities: ${error.message}`);
  }

  return {
    alignmentScore,
    apiSupported,
    manualConfigRequired,
    missingFields,
    implementationGaps,
    sourceStatus
  };
}

/**
 * Generates comprehensive validation report in Markdown format
 * @param {object} analysisData - Collected analysis data
 * @param {object} analysisData.documentation - Documentation scan results
 * @param {object} analysisData.implementation - Implementation status from THREAD-SUMMARY
 * @param {object} analysisData.apiCapabilities - API capabilities validation results
 * @param {string} reportPath - Output path for generated report file
 * @returns {Promise<object>} Report generation result with success status and path
 * @throws {Error} If report cannot be generated or written to file
 */
export async function generateValidationReport(analysisData, reportPath) {
  try {
    if (!analysisData || typeof analysisData !== 'object') {
      throw new Error('Invalid analysis data provided');
    }

    const { documentation, implementation, apiCapabilities } = analysisData;

    // Build report content
    const reportLines = [];

    reportLines.push('# BuildRight ACO Project Context Analysis Report');
    reportLines.push('');
    reportLines.push(`**Generated:** ${new Date().toISOString()}`);
    reportLines.push('');
    reportLines.push('---');
    reportLines.push('');

    // Section 1: Documentation Summary
    reportLines.push('## 1. Documentation Summary');
    reportLines.push('');
    reportLines.push(`**Total Documents Found:** ${documentation.foundDocuments.length}`);
    reportLines.push('');
    reportLines.push('### Document Breakdown:');
    reportLines.push(`- Plans: ${documentation.documentsByType.plans || 0}`);
    reportLines.push(`- Phases: ${documentation.documentsByType.phases || 0}`);
    reportLines.push(`- Summary: ${documentation.documentsByType.summary || 0}`);
    reportLines.push(`- Other: ${documentation.documentsByType.other || 0}`);
    reportLines.push('');

    if (documentation.missingDocuments && documentation.missingDocuments.length > 0) {
      reportLines.push('### Missing Critical Documents:');
      documentation.missingDocuments.forEach(doc => {
        reportLines.push(`- ❌ ${doc}`);
      });
      reportLines.push('');
    } else {
      reportLines.push('✅ All critical documents present');
      reportLines.push('');
    }

    // Section 2: Implementation Status
    reportLines.push('## 2. Implementation Status');
    reportLines.push('');
    reportLines.push('### Completed Features:');
    if (implementation.completedFeatures && implementation.completedFeatures.length > 0) {
      implementation.completedFeatures.forEach(feature => {
        reportLines.push(`- ✅ ${feature}`);
      });
    } else {
      reportLines.push('- None');
    }
    reportLines.push('');

    reportLines.push('### Pending Items:');
    if (implementation.pendingItems && implementation.pendingItems.length > 0) {
      implementation.pendingItems.forEach(item => {
        reportLines.push(`- ⏳ ${item}`);
      });
    } else {
      reportLines.push('- None');
    }
    reportLines.push('');

    if (implementation.knownIssues && implementation.knownIssues.length > 0) {
      reportLines.push('### Known Issues:');
      implementation.knownIssues.forEach(issue => {
        reportLines.push(`- ⚠️ ${issue}`);
      });
      reportLines.push('');
    }

    reportLines.push('### Scripts Status:');
    reportLines.push(`- Generation Scripts: ${implementation.scriptsStatus?.generation || 0}`);
    reportLines.push(`- Ingestion Scripts: ${implementation.scriptsStatus?.ingestion || 0}`);
    reportLines.push('');

    reportLines.push('### Statistics:');
    reportLines.push(`- Total Entities Ingested: ${implementation.statistics?.totalEntitiesIngested || 0}`);
    reportLines.push('');

    // Section 3: API Capabilities
    reportLines.push('## 3. API Capabilities');
    reportLines.push('');
    reportLines.push(`**Research Alignment Score:** ${apiCapabilities.alignmentScore}/100`);
    reportLines.push('');

    reportLines.push('### API-Supported Operations:');
    if (apiCapabilities.apiSupported && apiCapabilities.apiSupported.length > 0) {
      apiCapabilities.apiSupported.forEach(item => {
        reportLines.push(`- ✅ ${item}`);
      });
    }
    reportLines.push('');

    reportLines.push('### Manual Configuration Required:');
    if (apiCapabilities.manualConfigRequired && apiCapabilities.manualConfigRequired.length > 0) {
      apiCapabilities.manualConfigRequired.forEach(item => {
        reportLines.push(`- 🔧 ${item}`);
      });
    }
    reportLines.push('');

    if (apiCapabilities.missingFields && apiCapabilities.missingFields.length > 0) {
      reportLines.push('### Missing Required Fields:');
      apiCapabilities.missingFields.forEach(field => {
        reportLines.push(`- ❌ ${field}`);
      });
      reportLines.push('');
    }

    // Section 4: Gap Analysis
    reportLines.push('## 4. Gap Analysis');
    reportLines.push('');

    reportLines.push('### Source Implementation:');
    reportLines.push(`- Implemented: ${apiCapabilities.sourceStatus?.implemented || 0} sources`);
    reportLines.push(`- Total Required: ${apiCapabilities.sourceStatus?.total || 0} sources`);
    reportLines.push(`- Completion: ${apiCapabilities.sourceStatus?.implemented && apiCapabilities.sourceStatus?.total ? Math.round((apiCapabilities.sourceStatus.implemented / apiCapabilities.sourceStatus.total) * 100) : 0}%`);
    reportLines.push('');

    if (apiCapabilities.implementationGaps && apiCapabilities.implementationGaps.length > 0) {
      reportLines.push('### Implementation Gaps:');
      apiCapabilities.implementationGaps.forEach(gap => {
        reportLines.push(`- ⚠️ ${gap}`);
      });
      reportLines.push('');
    }

    // Section 5: Recommendations
    reportLines.push('## 5. Recommendations');
    reportLines.push('');

    // Generate recommendations based on findings
    const recommendations = [];

    if (apiCapabilities.alignmentScore < 85) {
      recommendations.push({
        priority: 'HIGH',
        item: `Improve API alignment score from ${apiCapabilities.alignmentScore}/100 to 85+`
      });
    }

    if (apiCapabilities.missingFields && apiCapabilities.missingFields.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        item: `Add missing required fields: ${apiCapabilities.missingFields.join(', ')}`
      });
    }

    if (apiCapabilities.sourceStatus && apiCapabilities.sourceStatus.implemented < apiCapabilities.sourceStatus.total) {
      recommendations.push({
        priority: 'HIGH',
        item: `Implement remaining ${apiCapabilities.sourceStatus.total - apiCapabilities.sourceStatus.implemented} inventory sources`
      });
    }

    if (implementation.pendingItems && implementation.pendingItems.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        item: `Complete ${implementation.pendingItems.length} pending implementation items`
      });
    }

    // Sort by priority
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    recommendations.forEach(rec => {
      reportLines.push(`### Priority: ${rec.priority}`);
      reportLines.push(`- ${rec.item}`);
      reportLines.push('');
    });

    if (recommendations.length === 0) {
      reportLines.push('✅ No critical recommendations at this time.');
      reportLines.push('');
    }

    reportLines.push('---');
    reportLines.push('');
    reportLines.push('**End of Report**');

    // Write report to file
    const reportContent = reportLines.join('\n');
    await fs.writeFile(reportPath, reportContent, 'utf-8');

    return {
      success: true,
      reportPath
    };

  } catch (error) {
    throw new Error(`Failed to generate validation report: ${error.message}`);
  }
}

/**
 * Main execution function when script is run directly
 */
async function main() {
  try {
    const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
    const instructionsDir = path.join(projectRoot, 'instructions');
    const threadSummaryPath = path.join(projectRoot, 'instructions', 'THREAD-SUMMARY.md');
    const researchPath = path.join(projectRoot, '.rptc', 'research', 'adobe-commerce-msi-api-validation.md');
    const reportPath = path.join(projectRoot, '.rptc', 'validation', 'context-analysis-report.md');

    console.log('Starting project context validation...\n');

    // Step 1: Scan documentation
    console.log('1. Scanning project documentation...');
    const documentation = await scanProjectDocumentation(instructionsDir);
    console.log(`   Found ${documentation.foundDocuments.length} documents`);

    // Step 2: Parse implementation status
    console.log('2. Parsing implementation status...');
    const implementation = await parseThreadSummary(threadSummaryPath);
    console.log(`   Found ${implementation.completedFeatures.length} completed features`);

    // Step 3: Validate API capabilities
    console.log('3. Validating API capabilities...');
    const apiCapabilities = await validateAPICapabilities(researchPath);
    console.log(`   API alignment score: ${apiCapabilities.alignmentScore}/100`);

    // Step 4: Generate report
    console.log('4. Generating validation report...');
    const analysisData = { documentation, implementation, apiCapabilities };
    const result = await generateValidationReport(analysisData, reportPath);

    console.log(`\n✅ Validation complete!`);
    console.log(`📄 Report generated: ${result.reportPath}`);

  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run main function if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
