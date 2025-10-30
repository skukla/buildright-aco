#!/usr/bin/env node
/**
 * Test OAuth Token Manager and GraphQL Authentication
 *
 * Validates that OAuth token acquisition works and can be used for GraphQL queries.
 */

import { getAccessToken, getTokenInfo, validateOAuthConfig } from '../utils/oauth-token-manager.js';
import { queryProductsBySKU } from '../utils/graphql-query.js';
import logger from '../utils/logger.js';

async function testOAuthAndGraphQL() {
  try {
    logger.info('='.repeat(50));
    logger.info('Testing OAuth Token Manager');
    logger.info('='.repeat(50));

    // Step 1: Validate configuration
    logger.info('Step 1: Validating OAuth configuration...');
    validateOAuthConfig();
    logger.info('✓ OAuth configuration valid');

    // Step 2: Get access token
    logger.info('\nStep 2: Acquiring OAuth access token...');
    const token = await getAccessToken();
    logger.info('✓ Access token acquired successfully');
    // Security: Don't log even partial tokens
    logger.debug('Token length:', { length: token.length });

    // Step 3: Check token info
    logger.info('\nStep 3: Checking token information...');
    const tokenInfo = getTokenInfo();
    if (tokenInfo) {
      const expiresInMinutes = Math.floor(tokenInfo.time_remaining_ms / 60000);
      logger.info('✓ Token info:', {
        expires_in_minutes: expiresInMinutes,
        is_valid: tokenInfo.is_valid
      });
    }

    // Step 4: Test GraphQL query with OAuth
    logger.info('\nStep 4: Testing GraphQL query with OAuth authentication...');
    logger.info('Querying first 3 ingested product SKUs...');

    // Query a few SKUs we know exist from the ingestion
    const testSkus = ['LBR-D0414F1E', 'LBR-2EBB314A'];

    const products = await queryProductsBySKU(testSkus);

    logger.info(`✓ GraphQL query successful! Found ${products.length} products:`);
    products.forEach(p => {
      logger.info(`  - ${p.sku}: ${p.name}`);
    });

    // Step 5: Test token caching
    logger.info('\nStep 5: Testing token caching...');
    const cachedToken = await getAccessToken();
    if (cachedToken === token) {
      logger.info('✓ Token cache working - same token returned');
    } else {
      logger.warn('⚠ Token cache may not be working - different token returned');
    }

    logger.info('\n' + '='.repeat(50));
    logger.info('✅ All OAuth and GraphQL tests passed!');
    logger.info('='.repeat(50));

    process.exit(0);

  } catch (error) {
    logger.error('\n' + '='.repeat(50));
    logger.error('❌ OAuth/GraphQL test failed');
    logger.error('='.repeat(50));
    logger.error('Error:', error.message);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
}

testOAuthAndGraphQL();
