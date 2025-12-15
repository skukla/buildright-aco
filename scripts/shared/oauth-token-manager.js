/**
 * OAuth Token Manager for Adobe IMS Authentication
 *
 * Manages OAuth 2.0 access tokens for Adobe IMS (Identity Management System).
 * Handles token acquisition, caching, and automatic refresh.
 *
 * @module utils/oauth-token-manager
 *
 * @example
 * import { getAccessToken } from './utils/oauth-token-manager.js';
 *
 * // Get a valid access token (cached or fresh)
 * const token = await getAccessToken();
 *
 * // Use token in API calls
 * const response = await fetch(url, {
 *   headers: { 'Authorization': `Bearer ${token}` }
 * });
 */

import axios from 'axios';
import dotenv from 'dotenv';
import logger from './logger.js';

// Load environment variables
dotenv.config();

/**
 * Adobe IMS OAuth token endpoint
 * @const {string}
 */
const IMS_TOKEN_ENDPOINT = 'https://ims-na1.adobelogin.com/ims/token/v3';

/**
 * OAuth scopes required for ACO API access
 * @const {string}
 */
const REQUIRED_SCOPES = 'openid,AdobeID,read_organizations,additional_info.projectedProductContext,additional_info.roles';

/**
 * Token cache storage
 * @type {Object|null}
 * @private
 */
let tokenCache = null;

/**
 * Checks if a cached token is still valid
 *
 * @param {Object} token - Cached token object
 * @param {string} token.access_token - The access token
 * @param {number} token.expires_at - Expiration timestamp (ms)
 * @param {number} [bufferMs=60000] - Safety buffer before expiration (default 1 minute)
 * @returns {boolean} True if token is still valid
 * @private
 */
function isTokenValid(token, bufferMs = 60000) {
  if (!token || !token.access_token || !token.expires_at) {
    return false;
  }

  const now = Date.now();
  const expiresWithBuffer = token.expires_at - bufferMs;

  return now < expiresWithBuffer;
}

/**
 * Fetches a new OAuth access token from Adobe IMS
 *
 * Uses client credentials flow (OAuth 2.0).
 *
 * @returns {Promise<Object>} Token response
 * @returns {string} token.access_token - The access token
 * @returns {number} token.expires_in - Token lifetime in seconds
 * @returns {string} token.token_type - Token type (usually "Bearer")
 * @throws {Error} If token acquisition fails
 * @private
 *
 * @example
 * const token = await fetchNewToken();
 * console.log(token.access_token);
 */
async function fetchNewToken() {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing OAuth credentials: CLIENT_ID and CLIENT_SECRET must be set in .env file'
    );
  }

  logger.debug('Fetching new OAuth token from Adobe IMS');

  try {
    const response = await axios.post(
      IMS_TOKEN_ENDPOINT,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: REQUIRED_SCOPES
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in, token_type } = response.data;

    if (!access_token) {
      throw new Error('No access_token in IMS response');
    }

    logger.info('OAuth token acquired successfully', {
      token_type,
      expires_in,
      scopes: REQUIRED_SCOPES
    });

    // Calculate absolute expiration time
    const expires_at = Date.now() + (expires_in * 1000);

    return {
      access_token,
      expires_in,
      expires_at,
      token_type
    };

  } catch (error) {
    if (error.response) {
      logger.error('OAuth token request failed', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      throw new Error(
        `Failed to acquire OAuth token: ${error.response.status} - ` +
        `${error.response.data?.error_description || error.response.statusText}`
      );
    } else {
      logger.error('OAuth token request failed', { error: error.message });
      throw new Error(`Failed to acquire OAuth token: ${error.message}`);
    }
  }
}

/**
 * Gets a valid OAuth access token
 *
 * Returns a cached token if still valid, otherwise fetches a new one.
 * Thread-safe: concurrent calls will wait for a single token fetch.
 *
 * @param {boolean} [forceRefresh=false] - Force fetch a new token even if cached token is valid
 * @returns {Promise<string>} Valid access token
 * @throws {Error} If token acquisition fails
 *
 * @example
 * // Get token (uses cache if available)
 * const token = await getAccessToken();
 *
 * // Force refresh
 * const freshToken = await getAccessToken(true);
 */
export async function getAccessToken(forceRefresh = false) {
  // Return cached token if still valid
  if (!forceRefresh && isTokenValid(tokenCache)) {
    logger.debug('Using cached OAuth token');
    return tokenCache.access_token;
  }

  // Fetch new token
  logger.debug('Cached token invalid or refresh forced, fetching new token');
  tokenCache = await fetchNewToken();

  return tokenCache.access_token;
}

/**
 * Clears the token cache
 *
 * Useful for testing or forcing a fresh token on next request.
 *
 * @example
 * clearTokenCache();
 * const freshToken = await getAccessToken();
 */
export function clearTokenCache() {
  logger.debug('Clearing OAuth token cache');
  tokenCache = null;
}

/**
 * Gets token information without making API calls
 *
 * Returns the current cached token info, or null if no token cached.
 *
 * @returns {Object|null} Token info or null
 * @returns {number} info.expires_at - Expiration timestamp
 * @returns {number} info.time_remaining_ms - Milliseconds until expiration
 * @returns {boolean} info.is_valid - Whether token is still valid
 *
 * @example
 * const info = getTokenInfo();
 * if (info) {
 *   console.log(`Token expires in ${info.time_remaining_ms / 1000} seconds`);
 * }
 */
export function getTokenInfo() {
  if (!tokenCache) {
    return null;
  }

  const now = Date.now();
  const time_remaining_ms = tokenCache.expires_at - now;

  return {
    expires_at: tokenCache.expires_at,
    time_remaining_ms,
    is_valid: isTokenValid(tokenCache)
  };
}

/**
 * Validates OAuth configuration
 *
 * Checks that required environment variables are set.
 *
 * @throws {Error} If configuration is invalid
 *
 * @example
 * try {
 *   validateOAuthConfig();
 * } catch (error) {
 *   console.error('OAuth not configured:', error.message);
 * }
 */
export function validateOAuthConfig() {
  const missingVars = [];

  if (!process.env.CLIENT_ID) missingVars.push('CLIENT_ID');
  if (!process.env.CLIENT_SECRET) missingVars.push('CLIENT_SECRET');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required OAuth environment variables: ${missingVars.join(', ')}. ` +
      'Please configure these in your .env file.'
    );
  }
}

// Export all functions
export default {
  getAccessToken,
  clearTokenCache,
  getTokenInfo,
  validateOAuthConfig
};
