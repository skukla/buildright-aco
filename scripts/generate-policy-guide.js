#!/usr/bin/env node

/**
 * Generate Policy Configuration Guide Script
 * Creates markdown documentation for ACO Admin UI policy setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePolicyGuide, getPolicySummary } from './config/policy-definitions.js';
import { createLogger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger('generate-policy-guide');

/**
 * Main execution function
 */
async function main() {
  logger.info('Starting policy guide generation...');

  try {
    // Get policy summary
    const summary = getPolicySummary();
    
    logger.info('Policy Summary:', {
      totalCategories: summary.totalCategories,
      totalPolicies: summary.totalPolicies
    });
    
    logger.info('Policy Categories:');
    summary.categories.forEach((category, idx) => {
      logger.info(`  ${idx + 1}. ${category}`);
    });
    
    logger.info('Persona Policy Mapping:');
    Object.entries(summary.personaMapping).forEach(([persona, policies]) => {
      logger.info(`  ${persona}:`);
      policies.forEach(policy => {
        logger.info(`    - ${policy}`);
      });
    });

    // Generate policy guide
    logger.info('Generating policy guide markdown...');
    const guide = generatePolicyGuide();

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'data/buildright');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logger.info(`Created output directory: ${outputDir}`);
    }

    // Write to file
    const outputPath = path.join(outputDir, 'POLICY-SETUP-GUIDE.md');
    fs.writeFileSync(outputPath, guide);
    logger.info(`Policy guide written to ${outputPath}`);

    // Log summary
    logger.info('');
    logger.info('Policy guide generation complete:');
    logger.info(`  Total policy categories: ${summary.totalCategories}`);
    logger.info(`  Total individual policies: ${summary.totalPolicies}`);
    logger.info(`  Output file: ${outputPath}`);
    logger.info('');
    logger.info('Next steps:');
    logger.info('  1. Review POLICY-SETUP-GUIDE.md for ACO Admin UI instructions');
    logger.info('  2. Create policies manually in ACO Admin interface');
    logger.info('  3. Test each policy with appropriate HTTP headers');
    logger.info('  4. Document policy IDs for frontend integration');

  } catch (error) {
    logger.error('Error generating policy guide:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

