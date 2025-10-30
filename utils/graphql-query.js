/**
 * GraphQL Query Utilities for Adobe Commerce Optimizer
 *
 * Provides convenient functions for querying the ACO GraphQL API.
 * Used for testing, validation, and data retrieval operations.
 *
 * @module utils/graphql-query
 *
 * @example
 * import { queryProducts, queryProductsBySKU } from './utils/graphql-query.js';
 *
 * // Query specific products
 * const products = await queryProductsBySKU(['SKU-001', 'SKU-002']);
 *
 * // Search products
 * const results = await queryProducts({ searchTerm: 'lumber' });
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { getGraphQLEndpoint } from './aco-client.js';
import { getAccessToken } from './oauth-token-manager.js';
import logger from './logger.js';

// Load environment variables
dotenv.config();

/**
 * Gets the default GraphQL headers with OAuth authentication
 *
 * @param {string} [accessToken] - Optional OAuth access token (fetched automatically if not provided)
 * @returns {Promise<Object>} HTTP headers for GraphQL requests
 * @private
 */
async function getGraphQLHeaders(accessToken = null) {
  // Get access token if not provided
  if (!accessToken) {
    accessToken = await getAccessToken();
  }

  const headers = {
    'Content-Type': 'application/json',
    'Magento-Website-Code': process.env.WEBSITE_CODE || 'base',
    'Magento-Store-Code': process.env.STORE_CODE || 'default',
    'Magento-Store-View-Code': process.env.STORE_VIEW_CODE || 'default',
    'Authorization': `Bearer ${accessToken}`
  };

  return headers;
}

/**
 * Executes a GraphQL query against the ACO endpoint
 *
 * @param {string} query - GraphQL query string
 * @param {Object} [variables={}] - Query variables
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Object>} Query response data
 * @throws {Error} If query fails
 *
 * @example
 * const query = `
 *   query GetProducts($skus: [String!]!) {
 *     products(skus: $skus) {
 *       sku
 *       name
 *     }
 *   }
 * `;
 * const data = await executeGraphQLQuery(query, { skus: ['SKU-001'] });
 */
export async function executeGraphQLQuery(query, variables = {}, accessToken = null) {
  const endpoint = getGraphQLEndpoint();
  const headers = await getGraphQLHeaders(accessToken);

  logger.debug('Executing GraphQL query:', {
    endpoint,
    queryLength: query.length,
    variables: Object.keys(variables)
  });

  try {
    const response = await axios.post(
      endpoint,
      {
        query,
        variables
      },
      { headers }
    );

    if (response.data.errors) {
      const errorMessages = response.data.errors.map(e => e.message).join(', ');
      throw new Error(`GraphQL query returned errors: ${errorMessages}`);
    }

    logger.debug('GraphQL query successful');
    return response.data.data;
  } catch (error) {
    logger.error('GraphQL query failed:', {
      message: error.message,
      endpoint,
      status: error.response?.status,
      responseData: error.response?.data
    });
    throw new Error(`GraphQL query failed: ${error.message}`);
  }
}

/**
 * Queries products by SKU
 *
 * @param {Array<string>} skus - Array of SKUs to retrieve
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Array>} Array of product objects
 *
 * @example
 * const products = await queryProductsBySKU(['SKU-001', 'SKU-002']);
 * console.log(products[0].name);
 */
export async function queryProductsBySKU(skus, accessToken = null) {
  const query = `
    query GetProducts($skus: [String!]!) {
      products(skus: $skus) {
        sku
        name
        slug
        status
        attributes {
          code
          value
        }
        price {
          regular {
            amount
            currency
          }
          discount {
            percentage
            amount
          }
        }
      }
    }
  `;

  const data = await executeGraphQLQuery(query, { skus }, accessToken);
  return data.products || [];
}

/**
 * Searches products by various criteria
 *
 * ⚠️ WARNING: This function uses an experimental GraphQL schema that may not match
 * the actual ACO Merchandising API. The actual schema requires proper configuration
 * and may have different field names/structures. Use queryProductsBySKU() for
 * reliable product retrieval.
 *
 * Known issues:
 * - Requires search index to be configured in ACO (fails on empty catalog)
 * - Exact parameter names and response structure may differ from actual API
 * - pagination, filtering parameters need verification against live API
 *
 * @param {Object} searchCriteria - Search parameters
 * @param {string} [searchCriteria.searchTerm] - Text search term (defaults to '*')
 * @param {string} [searchCriteria.phrase] - Search phrase (ACO parameter name)
 * @param {number} [searchCriteria.pageSize=20] - Results per page
 * @param {number} [searchCriteria.currentPage=1] - Page number
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Object>} Search results with products array and pagination info
 *
 * @example
 * const results = await queryProducts({
 *   searchTerm: 'lumber',
 *   pageSize: 10
 * });
 */
export async function queryProducts(searchCriteria = {}, accessToken = null) {
  const {
    searchTerm = '*',  // Default to wildcard to get all products
    phrase = searchTerm,  // ACO uses 'phrase' parameter
    pageSize = 20,
    currentPage = 1
  } = searchCriteria;

  const query = `
    query SearchProducts(
      $phrase: String!
      $pageSize: Int
      $currentPage: Int
    ) {
      productSearch(
        phrase: $phrase
        pageSize: $pageSize
        currentPage: $currentPage
      ) {
        total_count
        items {
          product {
            sku
            name
          }
        }
      }
    }
  `;

  const variables = {
    phrase,
    pageSize,
    currentPage
  };

  const data = await executeGraphQLQuery(query, variables, accessToken);

  // Transform response to match expected format
  const items = data.productSearch?.items || [];
  const products = items.map(item => item.product);

  return {
    products,
    total: data.productSearch?.total_count || 0,
    page: currentPage,
    pageSize
  };
}

/**
 * Queries all categories
 *
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Array>} Array of category objects
 *
 * @example
 * const categories = await queryCategories();
 * console.log(categories.map(c => c.name));
 */
export async function queryCategories(accessToken = null) {
  const query = `
    query GetCategories {
      categories {
        slug
        name
        description
        isActive
        parentSlug
        productCount
      }
    }
  `;

  const data = await executeGraphQLQuery(query, {}, accessToken);
  return data.categories || [];
}

/**
 * Queries product metadata (attributes)
 *
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Array>} Array of attribute definitions
 *
 * @example
 * const attributes = await queryProductMetadata();
 * console.log(attributes.map(a => a.code));
 */
export async function queryProductMetadata(accessToken = null) {
  const query = `
    query GetProductMetadata {
      productMetadata {
        code
        label
        dataType
        isFilterable
        isSearchable
        isSortable
        validValues
      }
    }
  `;

  const data = await executeGraphQLQuery(query, {}, accessToken);
  return data.productMetadata || [];
}

/**
 * Queries price books
 *
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Array>} Array of price book objects
 *
 * @example
 * const priceBooks = await queryPriceBooks();
 * console.log(priceBooks.map(pb => pb.id));
 */
export async function queryPriceBooks(accessToken = null) {
  const query = `
    query GetPriceBooks {
      priceBooks {
        id
        name
        businessType
        discountPercentage
        region
        currency
        effectiveDate
        status
      }
    }
  `;

  const data = await executeGraphQLQuery(query, {}, accessToken);
  return data.priceBooks || [];
}

/**
 * Queries prices for specific SKUs and price book
 *
 * @param {Array<string>} skus - Array of SKUs
 * @param {string} priceBookId - Price book identifier
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Array>} Array of price objects
 *
 * @example
 * const prices = await queryPrices(['SKU-001', 'SKU-002'], 'US_RETAIL');
 * console.log(prices[0].amount);
 */
export async function queryPrices(skus, priceBookId, accessToken = null) {
  const query = `
    query GetPrices($skus: [String!]!, $priceBookId: String!) {
      prices(skus: $skus, priceBookId: $priceBookId) {
        sku
        priceBookId
        amount
        currency
        tierPrices {
          qty
          amount
          percentage
        }
      }
    }
  `;

  const data = await executeGraphQLQuery(
    query,
    { skus, priceBookId },
    accessToken
  );
  return data.prices || [];
}

/**
 * Verifies data ingestion by checking product count
 *
 * ⚠️ WARNING: Requires ACO search index to be configured. Will fail on empty
 * catalogs or if search index is not set up. Wrap in try-catch for production use.
 *
 * Useful for testing after bulk uploads to verify all products were ingested.
 *
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Object>} Statistics about ingested data
 * @throws {Error} If catalog is empty or search index not configured
 *
 * @example
 * try {
 *   const stats = await verifyDataIngestion();
 *   console.log(`Found ${stats.productCount} products`);
 * } catch (error) {
 *   console.log('Catalog may be empty or index not configured');
 * }
 */
export async function verifyDataIngestion(accessToken = null) {
  const query = `
    query VerifyIngestion($phrase: String!) {
      productSearch(phrase: $phrase) {
        total_count
      }
    }
  `;

  const data = await executeGraphQLQuery(query, { phrase: '*' }, accessToken);

  return {
    productCount: data.productSearch?.total_count || 0,
    categoryCount: 0,  // Category count not available in simple query
    priceBookCount: 0  // Price books require separate query
  };
}

// Export all functions for convenience
export default {
  executeGraphQLQuery,
  queryProductsBySKU,
  queryProducts,
  queryCategories,
  queryProductMetadata,
  queryPriceBooks,
  queryPrices,
  verifyDataIngestion
};
