/**
 * Ingest Configuration
 *
 * Centralized configuration for all ingest operations.
 * Values can be overridden via environment variables.
 *
 * @module scripts/config/ingest-config
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const ingestConfig = {
  // Batch processing
  batchSize: parseInt(process.env.BATCH_SIZE, 10) || 100,
  maxConcurrentBatches: 1, // Process batches sequentially to avoid rate limits

  // Retry configuration
  maxRetries: parseInt(process.env.MAX_RETRIES, 10) || 3,
  initialRetryDelayMs: 2000,
  retryBackoffMultiplier: 2,

  // Timeouts
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000, // 30 seconds

  // Dry-run mode
  dryRun: process.env.DRY_RUN === 'true',

  // Progress reporting
  enableProgressReporting: true,
  logProgressInterval: 10, // Log every 10 items in batch

  // Error handling
  continueOnError: process.env.CONTINUE_ON_ERROR !== 'false', // Continue by default
  logFailedItems: true,

  // ACO-specific (from SDK client config)
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox'
};

/**
 * Validate ingest configuration
 *
 * @throws {Error} If required configuration is missing
 */
export function validateIngestConfig() {
  const required = ['clientId', 'clientSecret', 'tenantId'];
  const missing = required.filter(key => !ingestConfig[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required ingest configuration: ${missing.join(', ')}. ` +
      'Check your .env file for CLIENT_ID, CLIENT_SECRET, and TENANT_ID.'
    );
  }
}

export default ingestConfig;
