#!/usr/bin/env node
/**
 * Ingest Variant Products to Adobe Commerce Optimizer
 *
 * Ingests configurable products and their variants to ACO.
 * Parents (configurable products) are ingested first, then variants (children).
 *
 * @module scripts/ingest-variants
 *
 * @example
 * # Ingest all variants
 * node scripts/ingest-variants.js
 *
 * # Ingest specific file
 * node scripts/ingest-variants.js data/buildright/variants.json
 */

import fs from 'fs/promises';
import { ingestProducts } from './ingest-products.js';
import logger from '../utils/logger.js';
import { validateIngestConfig } from './config/ingest-config.js';

/**
 * Ingest variant products (parents first, then children)
 *
 * @param {Array<Object>} variants - Variant products to ingest
 * @param {Object} options - Ingest options
 * @returns {Promise<Object>} Combined ingest results
 */
export async function ingestVariants(variants, options = {}) {
  logger.info('Variant Ingest Started', { totalVariants: variants.length });

  // Separate parents (configurable) from children (variants)
  // Parents typically have type: 'configurable' or SKU ending with '-CONFIG'
  const parents = variants.filter(v =>
    v.type === 'configurable' ||
    v.sku?.endsWith('-CONFIG') ||
    v.sku?.endsWith('-PARENT')
  );

  const children = variants.filter(v =>
    v.type !== 'configurable' &&
    !v.sku?.endsWith('-CONFIG') &&
    !v.sku?.endsWith('-PARENT')
  );

  logger.info('Ingest order: parents first, then variants', {
    parents: parents.length,
    children: children.length
  });

  // Ingest parents first
  logger.info('Ingesting configurable parent products...');
  const parentResults = await ingestProducts(parents, {
    ...options,
    onProgress: (progress) => {
      logger.info(`Parents: ${progress.completed}/${progress.total} (${progress.percent}%)`);
      if (options.onProgress) {
        options.onProgress({ ...progress, phase: 'parents' });
      }
    }
  });

  if (!parentResults.success && parentResults.failed > 0) {
    logger.error('Parent ingest had failures', {
      failed: parentResults.failed,
      ingested: parentResults.ingested
    });

    if (parentResults.failed > parentResults.ingested) {
      throw new Error(`Too many parent ingest failures: ${parentResults.failed} of ${parents.length} failed`);
    }
  }

  // Ingest children (variants)
  logger.info('Ingesting variant child products...');
  const childrenResults = await ingestProducts(children, {
    ...options,
    onProgress: (progress) => {
      logger.info(`Variants: ${progress.completed}/${progress.total} (${progress.percent}%)`);
      if (options.onProgress) {
        options.onProgress({ ...progress, phase: 'children' });
      }
    }
  });

  // Combine results
  const combinedResults = {
    success: parentResults.success && childrenResults.success,
    ingested: parentResults.ingested + childrenResults.ingested,
    failed: parentResults.failed + childrenResults.failed,
    errors: [...(parentResults.errors || []), ...(childrenResults.errors || [])],
    retries: (parentResults.retries || 0) + (childrenResults.retries || 0),
    parents: {
      ingested: parentResults.ingested,
      failed: parentResults.failed
    },
    children: {
      ingested: childrenResults.ingested,
      failed: childrenResults.failed
    }
  };

  logger.info('Variant Ingest Complete', {
    totalIngested: combinedResults.ingested,
    totalFailed: combinedResults.failed,
    parents: combinedResults.parents,
    children: combinedResults.children
  });

  return combinedResults;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const variantsPath = process.argv[2] || './data/buildright/variants.json';

  try {
    // Validate configuration
    validateIngestConfig();

    // Read variants file
    logger.info('Reading variants from file', { path: variantsPath });
    const variantsData = await fs.readFile(variantsPath, 'utf8');
    const variants = JSON.parse(variantsData);

    logger.info(`Loaded ${variants.length} variant products from ${variantsPath}`);

    // Ingest variants
    const result = await ingestVariants(variants);

    if (!result.success && result.failed > 0) {
      logger.error('Ingest completed with errors', {
        ingested: result.ingested,
        failed: result.failed
      });
      process.exit(1);
    }

    logger.info('Variant ingest successful', {
      ingested: result.ingested,
      parents: result.parents,
      children: result.children
    });
    process.exit(0);

  } catch (error) {
    logger.error('Variant ingest failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
