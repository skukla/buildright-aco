#!/usr/bin/env node
/**
 * Ingest Price Books to Adobe Commerce Optimizer
 *
 * Ingests price books in hierarchical order (parents before children).
 * Supports 4-level hierarchy: Base → Regional → Tier → Promotional
 *
 * @module scripts/ingest-price-books
 *
 * @example
 * # Ingest all price books
 * node scripts/ingest-price-books.js
 *
 * # Ingest specific file
 * node scripts/ingest-price-books.js data/buildright/price-books.json
 */

import fs from 'fs/promises';
import { getACOClient } from '../utils/aco-client.js';
import { executeWithRetry } from '../utils/retry-handler.js';
import logger from '../utils/logger.js';
import { ingestConfig, validateIngestConfig } from './config/ingest-config.js';

/**
 * Sort price books by hierarchy level (parents before children)
 *
 * @param {Array<Object>} priceBooks - Price books to sort
 * @returns {Array<Object>} Sorted price books
 */
function sortByHierarchy(priceBooks) {
  // Determine levels
  const levelMap = new Map();

  function calculateLevel(priceBook) {
    if (levelMap.has(priceBook.priceBookId)) {
      return levelMap.get(priceBook.priceBookId);
    }

    // Base level (no parent)
    if (!priceBook.parentId) {
      levelMap.set(priceBook.priceBookId, 1);
      return 1;
    }

    // Find parent
    const parent = priceBooks.find(pb => pb.priceBookId === priceBook.parentId);
    if (!parent) {
      logger.warn(`Parent not found for price book ${priceBook.priceBookId}: ${priceBook.parentId}`);
      levelMap.set(priceBook.priceBookId, 1);
      return 1;
    }

    // Level = parent level + 1
    const level = calculateLevel(parent) + 1;
    levelMap.set(priceBook.priceBookId, level);
    return level;
  }

  // Calculate levels for all price books
  priceBooks.forEach(pb => calculateLevel(pb));

  // Sort by level, then by ID
  return priceBooks.slice().sort((a, b) => {
    const levelA = levelMap.get(a.priceBookId) || 1;
    const levelB = levelMap.get(b.priceBookId) || 1;

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    return a.priceBookId.localeCompare(b.priceBookId);
  });
}

/**
 * Ingest price books in hierarchical order
 *
 * @param {Array<Object>} priceBooks - Price books to ingest
 * @param {Object} options - Ingest options
 * @returns {Promise<Object>} Ingest results
 */
export async function ingestPriceBooks(priceBooks, options = {}) {
  const config = { ...ingestConfig, ...options };

  logger.info('Price Book Ingest Started', {
    totalPriceBooks: priceBooks.length,
    dryRun: config.dryRun
  });

  // Sort by hierarchy
  const sorted = sortByHierarchy(priceBooks);

  logger.info('Price books sorted by hierarchy', {
    order: sorted.map(pb => ({ id: pb.priceBookId, parent: pb.parentId || 'none' }))
  });

  if (config.dryRun) {
    logger.info('Dry-run mode: validation passed, no ingest performed');
    return {
      dryRun: true,
      validationPassed: true,
      wouldIngest: sorted.length
    };
  }

  // Get ACO SDK client
  const client = getACOClient();

  const results = {
    success: true,
    ingested: 0,
    failed: 0,
    errors: []
  };

  // Ingest sequentially in hierarchy order
  for (const priceBook of sorted) {
    try {
      logger.info(`Ingesting price book: ${priceBook.priceBookId}`, {
        name: priceBook.name,
        parent: priceBook.parentId || 'none'
      });

      await executeWithRetry(
        () => client.createPriceBooks([priceBook]),
        {
          maxRetries: config.maxRetries,
          initialDelayMs: config.initialRetryDelayMs,
          backoffMultiplier: config.retryBackoffMultiplier
        }
      );

      results.ingested++;
      logger.info(`Price book ingested: ${priceBook.priceBookId}`);

    } catch (error) {
      results.failed++;
      results.errors.push({
        id: priceBook.priceBookId,
        error: error.message
      });

      logger.error(`Failed to ingest price book: ${priceBook.priceBookId}`, {
        error: error.message
      });

      if (!config.continueOnError) {
        throw error;
      }
    }
  }

  results.success = results.failed === 0;

  logger.info('Price Book Ingest Complete', {
    ingested: results.ingested,
    failed: results.failed
  });

  return results;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const priceBooksPath = process.argv[2] || './data/buildright/price-books.json';

  try {
    // Validate configuration
    validateIngestConfig();

    // Read price books file
    logger.info('Reading price books from file', { path: priceBooksPath });
    const priceBooksData = await fs.readFile(priceBooksPath, 'utf8');
    const priceBooks = JSON.parse(priceBooksData);

    logger.info(`Loaded ${priceBooks.length} price books from ${priceBooksPath}`);

    // Ingest price books
    const result = await ingestPriceBooks(priceBooks);

    if (!result.success && result.failed > 0) {
      logger.error('Ingest completed with errors', {
        ingested: result.ingested,
        failed: result.failed
      });
      process.exit(1);
    }

    logger.info('Price book ingest successful', {
      ingested: result.ingested
    });
    process.exit(0);

  } catch (error) {
    logger.error('Price book ingest failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
