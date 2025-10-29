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
import logger from './logger.js';

// Load environment variables
dotenv.config();

/**
 * Gets the default GraphQL headers
 *
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Object} HTTP headers for GraphQL requests
 * @private
 */
function getGraphQLHeaders(accessToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    'AC-View-ID': process.env.VIEW_ID || 'default',
    'AC-Source-Locale': process.env.SOURCE_LOCALE || 'en-US'
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

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
  const headers = getGraphQLHeaders(accessToken);

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
      status: error.response?.status
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
 * @param {Object} searchCriteria - Search parameters
 * @param {string} [searchCriteria.searchTerm] - Text search term
 * @param {Array<string>} [searchCriteria.categories] - Category filters
 * @param {number} [searchCriteria.pageSize=20] - Results per page
 * @param {number} [searchCriteria.page=1] - Page number
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Object>} Search results with products array and pagination info
 *
 * @example
 * const results = await queryProducts({
 *   searchTerm: 'lumber',
 *   categories: ['structural-materials'],
 *   pageSize: 10
 * });
 */
export async function queryProducts(searchCriteria = {}, accessToken = null) {
  const {
    searchTerm = '',
    categories = [],
    pageSize = 20,
    page = 1
  } = searchCriteria;

  const query = `
    query SearchProducts(
      $searchTerm: String
      $categories: [String]
      $pageSize: Int
      $page: Int
    ) {
      productSearch(
        searchTerm: $searchTerm
        categories: $categories
        pageSize: $pageSize
        page: $page
      ) {
        total
        page
        pageSize
        products {
          sku
          name
          slug
          status
          price {
            regular {
              amount
              currency
            }
          }
        }
      }
    }
  `;

  const variables = {
    searchTerm,
    categories: categories.length > 0 ? categories : undefined,
    pageSize,
    page
  };

  const data = await executeGraphQLQuery(query, variables, accessToken);
  return data.productSearch || { products: [], total: 0 };
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
 * Useful for testing after bulk uploads to verify all products were ingested.
 *
 * @param {string} [accessToken] - Optional OAuth access token
 * @returns {Promise<Object>} Statistics about ingested data
 *
 * @example
 * const stats = await verifyDataIngestion();
 * console.log(`Found ${stats.productCount} products`);
 */
export async function verifyDataIngestion(accessToken = null) {
  const query = `
    query VerifyIngestion {
      productSearch {
        total
      }
      categories {
        slug
      }
      priceBooks {
        id
      }
    }
  `;

  const data = await executeGraphQLQuery(query, {}, accessToken);

  return {
    productCount: data.productSearch?.total || 0,
    categoryCount: data.categories?.length || 0,
    priceBookCount: data.priceBooks?.length || 0
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
