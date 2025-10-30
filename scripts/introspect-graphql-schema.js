#!/usr/bin/env node
/**
 * GraphQL Schema Introspection for ACO
 *
 * Queries the ACO GraphQL endpoint to discover the available schema,
 * including queries, types, and fields.
 */

import { executeGraphQLQuery } from '../utils/graphql-query.js';
import { getAccessToken } from '../utils/oauth-token-manager.js';
import logger from '../utils/logger.js';
import { promises as fs } from 'fs';

async function introspectSchema() {
  logger.info('Starting GraphQL schema introspection...');

  const accessToken = await getAccessToken();

  // Standard GraphQL introspection query
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        queryType {
          name
          fields {
            name
            description
            args {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
        types {
          name
          kind
          description
          fields {
            name
            description
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await executeGraphQLQuery(introspectionQuery, {}, accessToken);

    // Save full schema
    await fs.writeFile(
      './graphql-schema-introspection.json',
      JSON.stringify(data, null, 2)
    );
    logger.info('Full schema saved to: graphql-schema-introspection.json');

    // Extract and display query types
    if (data.__schema && data.__schema.queryType) {
      logger.info('\n=== Available Queries ===\n');

      const queries = data.__schema.queryType.fields || [];
      queries.forEach(query => {
        logger.info(`${query.name}:`);
        if (query.description) {
          logger.info(`  Description: ${query.description}`);
        }
        if (query.args && query.args.length > 0) {
          logger.info('  Arguments:');
          query.args.forEach(arg => {
            const typeName = arg.type.ofType?.name || arg.type.name;
            logger.info(`    - ${arg.name}: ${typeName}`);
          });
        }
        logger.info(`  Returns: ${query.type.ofType?.name || query.type.name}`);
        logger.info('');
      });

      // Find product-related queries
      const productQueries = queries.filter(q =>
        q.name.toLowerCase().includes('product')
      );

      if (productQueries.length > 0) {
        logger.info('\n=== Product-Related Queries ===\n');
        productQueries.forEach(query => {
          logger.info(`Query: ${query.name}`);
          logger.info(`  Args: ${query.args.map(a => a.name).join(', ')}`);
          logger.info(`  Returns: ${query.type.ofType?.name || query.type.name}`);
          logger.info('');
        });
      }

      // Find ProductSearchResponse type details
      const productSearchType = data.__schema.types.find(t =>
        t.name === 'ProductSearchResponse' ||
        t.name === 'ProductView' ||
        t.name === 'ProductSearchItem'
      );

      if (productSearchType) {
        logger.info(`\n=== ${productSearchType.name} Type Fields ===\n`);
        if (productSearchType.fields) {
          productSearchType.fields.forEach(field => {
            logger.info(`  ${field.name}: ${field.type.ofType?.name || field.type.name}`);
          });
        }
      }
    }

    return data;

  } catch (error) {
    logger.error('Introspection failed:', error.message);
    throw error;
  }
}

// Run introspection
introspectSchema()
  .then(() => {
    logger.info('\n✓ Introspection complete');
    process.exit(0);
  })
  .catch(error => {
    logger.error('Introspection failed:', error);
    process.exit(1);
  });
