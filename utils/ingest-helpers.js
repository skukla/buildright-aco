/**
 * Ingest Helper Utilities
 *
 * Shared utilities for ingest operations including progress reporting,
 * validation, and result categorization.
 *
 * @module utils/ingest-helpers
 */

import logger from './logger.js';
import { SchemaValidator } from './schema-validator.js';

/**
 * Create progress reporter function
 *
 * @param {Function} onProgress - Callback invoked on progress updates
 * @param {number} totalItems - Total number of items to process
 * @returns {Function} Progress reporting function
 *
 * @example
 * const reportProgress = createProgressReporter(
 *   (progress) => console.log(`${progress.percent}%`),
 *   300
 * );
 * reportProgress(100); // Reports 33% complete
 */
export function createProgressReporter(onProgress, totalItems) {
  let completed = 0;
  const startTime = Date.now();

  return (batchSize) => {
    completed += batchSize;
    const percent = Math.round((completed / totalItems) * 100);
    const elapsedMs = Date.now() - startTime;
    const avgItemTimeMs = elapsedMs / completed;
    const estimatedRemainingMs = Math.round((totalItems - completed) * avgItemTimeMs);

    const progress = {
      completed,
      total: totalItems,
      percent,
      elapsedMs,
      estimatedRemainingMs,
      avgBatchTimeMs: Math.round(elapsedMs / Math.ceil(completed / batchSize))
    };

    if (onProgress) {
      onProgress(progress);
    }

    logger.info(`Ingest progress: ${completed}/${totalItems} (${percent}%)`, {
      estimatedRemaining: `${Math.round(estimatedRemainingMs / 1000)}s`
    });

    return progress;
  };
}

/**
 * Validate products before ingest
 *
 * @param {Array<Object>} products - Products to validate
 * @returns {Object} Validation result with errors array
 * @returns {boolean} result.valid - True if all products valid
 * @returns {Array} result.errors - Array of validation errors
 *
 * @example
 * const validation = validateProducts(products);
 * if (!validation.valid) {
 *   console.error('Validation failed:', validation.errors);
 * }
 */
export function validateProducts(products) {
  const errors = [];

  products.forEach((product, index) => {
    // Basic required field validation
    if (!product.sku) {
      errors.push({
        index,
        sku: product.sku || 'UNKNOWN',
        field: 'sku',
        message: 'SKU is required'
      });
    }

    if (!product.name) {
      errors.push({
        index,
        sku: product.sku,
        field: 'name',
        message: 'Name is required'
      });
    }

    // Use schema validator if available
    try {
      const validator = new SchemaValidator();
      if (validator.validateProduct) {
        validator.validateProduct(product);
      }
    } catch (error) {
      errors.push({
        index,
        sku: product.sku,
        field: error.field || 'unknown',
        message: error.message
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Categorize batch ingest results
 *
 * @param {Object} batchResponse - Response from ACO batch operation
 * @returns {Object} Categorized results
 * @returns {number} result.ingested - Count of successful ingests
 * @returns {number} result.failed - Count of failed ingests
 * @returns {Array} result.errors - Array of error details
 *
 * @example
 * const results = categorizeBatchResults(batchResponse);
 * console.log(`${results.ingested} ingested, ${results.failed} failed`);
 */
export function categorizeBatchResults(batchResponse) {
  const results = {
    ingested: 0,
    failed: 0,
    errors: []
  };

  if (batchResponse.results) {
    // Detailed results available
    batchResponse.results.forEach(item => {
      if (item.status === 'created' || item.status === 'success') {
        results.ingested++;
      } else {
        results.failed++;
        results.errors.push({
          sku: item.sku,
          error: item.error || 'Unknown error'
        });
      }
    });
  } else if (batchResponse.count !== undefined) {
    // Simple success response
    results.ingested = batchResponse.count;
  } else if (batchResponse.success) {
    // Generic success - assume all ingested
    results.ingested = batchResponse.items?.length || 0;
  }

  return results;
}

/**
 * Format ingest summary for logging
 *
 * @param {Object} results - Ingest results
 * @returns {string} Formatted summary
 */
export function formatIngestSummary(results) {
  const lines = [
    '========================================',
    'Ingest Summary',
    '========================================',
    `Total Ingested: ${results.ingested}`,
    `Total Failed: ${results.failed}`,
    `Total Retries: ${results.retries || 0}`,
    `Success Rate: ${Math.round((results.ingested / (results.ingested + results.failed)) * 100)}%`
  ];

  if (results.errors && results.errors.length > 0) {
    lines.push('', 'Failed Items:');
    results.errors.slice(0, 10).forEach(error => {
      lines.push(`  - ${error.sku}: ${error.error}`);
    });
    if (results.errors.length > 10) {
      lines.push(`  ... and ${results.errors.length - 10} more`);
    }
  }

  lines.push('========================================');

  return lines.join('\n');
}

export default {
  createProgressReporter,
  validateProducts,
  categorizeBatchResults,
  formatIngestSummary
};
