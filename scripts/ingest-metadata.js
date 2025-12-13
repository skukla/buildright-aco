#!/usr/bin/env node
/**
 * Ingest Product Attribute Metadata to Adobe Commerce Optimizer
 *
 * Ingests attribute metadata (labels, types, visibility, searchability, etc.)
 * from generated metadata.json to ACO. This MUST be run before ingesting products
 * so that ACO knows how to handle product attributes.
 *
 * @module scripts/ingest-metadata
 *
 * @example
 * # Ingest all metadata
 * npm run ingest:metadata
 *
 * # Dry-run mode (validation only)
 * npm run ingest:metadata:dry-run
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getACOClient } from '../utils/aco-client.js';
import { executeWithRetry } from '../utils/retry-handler.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

/**
 * Maps BuildRight metadata types to ACO metadata dataTypes
 */
const DATA_TYPE_MAP = {
  text: 'TEXT',
  select: 'TEXT',
  multiselect: 'TEXT',
  number: 'DECIMAL',
  boolean: 'BOOLEAN',
  date: 'DATE',
};

/**
 * Determines which attributes should be visible in which contexts
 */
function getVisibilitySettings(attr) {
  const visibility = ['PRODUCT_DETAIL', 'PRODUCT_LISTING'];
  
  // Core attributes also visible in search results
  if (attr.sortOrder <= 5 || attr.attributeId.includes('category') || attr.attributeId.includes('br_brand')) {
    visibility.push('SEARCH_RESULTS');
  }
  
  return visibility;
}

/**
 * Determines search weight based on attribute importance
 */
function getSearchWeight(attr) {
  // Core identification attributes get highest weight
  if (['sku', 'name', 'br_product_category'].includes(attr.attributeId)) {
    return 5;
  }
  
  // Important discovery attributes get high weight
  if (['br_brand', 'br_project_types'].includes(attr.attributeId)) {
    return 3;
  }
  
  // Standard attributes
  if (attr.sortOrder <= 10) {
    return 2;
  }
  
  // Less important attributes
  return 1;
}

/**
 * Transform BuildRight metadata to ACO Metadata API format
 */
function transformToACOMetadata(metadata) {
  return metadata.map(attr => ({
    code: attr.attributeId,
    source: { locale: 'en-US' },
    label: attr.label,
    dataType: DATA_TYPE_MAP[attr.type] || 'TEXT',
    visibleIn: getVisibilitySettings(attr),
    filterable: attr.type === 'select' || attr.type === 'multiselect' || attr.type === 'boolean',
    sortable: attr.type === 'select' || attr.type === 'number' || attr.type === 'date',
    searchable: true,
    searchWeight: getSearchWeight(attr),
    searchTypes: ['AUTOCOMPLETE'],
  }));
}

/**
 * Validate metadata structure
 */
function validateMetadata(metadata) {
  const errors = [];
  
  if (!Array.isArray(metadata)) {
    errors.push('Metadata must be an array');
    return { valid: false, errors };
  }
  
  metadata.forEach((attr, index) => {
    if (!attr.attributeId) {
      errors.push(`Attribute ${index}: missing attributeId`);
    }
    if (!attr.label) {
      errors.push(`Attribute ${index} (${attr.attributeId}): missing label`);
    }
    if (!attr.type) {
      errors.push(`Attribute ${index} (${attr.attributeId}): missing type`);
    }
    if (!DATA_TYPE_MAP[attr.type]) {
      errors.push(`Attribute ${index} (${attr.attributeId}): invalid type "${attr.type}"`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Main ingestion function
 */
async function ingestMetadata() {
  const startTime = Date.now();
  
  try {
    logger.info('========================================');
    logger.info('Product Attribute Metadata Ingestion');
    logger.info('========================================');
    
    if (DRY_RUN) {
      logger.info('DRY RUN MODE: No data will be ingested to ACO');
    }
    
    // Load metadata JSON
    const metadataPath = path.join(__dirname, '../data/buildright/metadata.json');
    logger.info(`Loading metadata from: ${metadataPath}`);
    
    const metadataRaw = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataRaw);
    
    logger.info(`Loaded ${metadata.length} attribute definitions`);
    
    // Validate metadata
    logger.info('Validating metadata structure...');
    const validation = validateMetadata(metadata);
    
    if (!validation.valid) {
      logger.error('Metadata validation failed:', validation.errors);
      throw new Error(`Validation failed: ${validation.errors.length} errors`);
    }
    
    logger.info('✅ Validation passed');
    
    // Transform to ACO format
    logger.info('Transforming to ACO Metadata API format...');
    const acoMetadata = transformToACOMetadata(metadata);
    
    // Log sample for verification
    logger.info('Sample transformed metadata (first 3):');
    acoMetadata.slice(0, 3).forEach(meta => {
      logger.info(`  - ${meta.code} (${meta.label}): ${meta.dataType}, searchWeight: ${meta.searchWeight}, filterable: ${meta.filterable}`);
    });
    
    if (DRY_RUN) {
      logger.info('========================================');
      logger.info('Dry-run Summary');
      logger.info('========================================');
      logger.info(`Would ingest: ${acoMetadata.length} metadata definitions`);
      logger.info('Validation: PASSED ✅');
      logger.info('No data was sent to ACO (dry-run mode)');
      return;
    }
    
    // Get ACO client
    logger.info('Initializing ACO client...');
    const client = getACOClient();
    
    // Ingest in batches of 10 (ACO recommendation)
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < acoMetadata.length; i += batchSize) {
      batches.push(acoMetadata.slice(i, i + batchSize));
    }
    
    logger.info(`Ingesting ${acoMetadata.length} metadata definitions in ${batches.length} batches...`);
    
    let totalIngested = 0;
    let totalFailed = 0;
    const failedBatches = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNum = i + 1;
      
      logger.info(`Processing batch ${batchNum}/${batches.length} (${batch.length} attributes)`);
      
      try {
        const response = await executeWithRetry(
          async () => await client.createProductMetadata(batch),
          {
            maxRetries: 3,
            retryDelay: 2000,
            operationName: `metadata-batch-${batchNum}`
          }
        );
        
        if (response.data && response.data.status === 'ACCEPTED') {
          const acceptedCount = response.data.acceptedCount || batch.length;
          totalIngested += acceptedCount;
          logger.info(`✅ Batch ${batchNum} accepted: ${acceptedCount} attributes`);
        } else {
          logger.warn(`⚠️  Batch ${batchNum} response unexpected:`, response.data);
          failedBatches.push({ batchNum, batch, response: response.data });
          totalFailed += batch.length;
        }
      } catch (error) {
        logger.error(`❌ Batch ${batchNum} failed:`, error.message);
        failedBatches.push({ batchNum, batch, error: error.message });
        totalFailed += batch.length;
      }
    }
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logger.info('========================================');
    logger.info('Metadata Ingestion Summary');
    logger.info('========================================');
    logger.info(`Total Metadata Definitions: ${metadata.length}`);
    logger.info(`Successfully Ingested: ${totalIngested}`);
    logger.info(`Failed: ${totalFailed}`);
    logger.info(`Success Rate: ${((totalIngested / metadata.length) * 100).toFixed(1)}%`);
    logger.info(`Duration: ${duration}s`);
    logger.info('========================================');
    
    if (failedBatches.length > 0) {
      logger.error('Failed batches:');
      failedBatches.forEach(fb => {
        logger.error(`  Batch ${fb.batchNum}: ${fb.error || JSON.stringify(fb.response)}`);
      });
      throw new Error(`${failedBatches.length} batches failed`);
    }
    
    logger.info('✅ Metadata ingestion complete!');
    logger.info('');
    logger.info('Next steps:');
    logger.info('  1. Ingest products: npm run ingest:products');
    logger.info('  2. Query products via GraphQL to verify labels are no longer "null"');
    
  } catch (error) {
    logger.error('Metadata ingestion failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ingestMetadata();
}

export { ingestMetadata, transformToACOMetadata, validateMetadata };

