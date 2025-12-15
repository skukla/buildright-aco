#!/usr/bin/env node

/**
 * Introspect ACO Admin GraphQL API
 * 
 * Queries the ACO Admin GraphQL API schema to discover all available queries,
 * mutations, and types. This helps us understand what admin operations are available.
 * 
 * Usage:
 *   node scripts/introspect-admin-api.js
 *   node scripts/introspect-admin-api.js --full  # Show all types and fields
 * 
 * @module scripts/introspect-admin-api
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox'
};

// IMS Token endpoint
const IMS_TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';

// Admin API endpoint
function getAdminEndpoint() {
  const envSuffix = config.environment === 'sandbox' ? '-sandbox' : '';
  return `https://${config.region}${envSuffix}.api.commerce.adobe.com/${config.tenantId}/admin/graphql`;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Get IMS access token using client credentials
 */
async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'openid,AdobeID,additional_info.projectedProductContext'
  });

  const response = await fetch(IMS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// ============================================================================
// INTROSPECTION QUERY
// ============================================================================

/**
 * GraphQL introspection query
 */
const INTROSPECTION_QUERY = `
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
            }
          }
          type {
            name
            kind
          }
        }
      }
      mutationType {
        name
        fields {
          name
          description
        }
      }
      types {
        name
        kind
        description
        fields {
          name
          description
        }
      }
    }
  }
`;

/**
 * Query the ACO Admin GraphQL API
 */
async function adminQuery(query, variables = {}) {
  const token = await getAccessToken();
  const endpoint = getAdminEndpoint();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-api-key': config.clientId
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Admin API request failed: ${response.status} - ${error}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
    throw new Error(`GraphQL error: ${result.errors[0].message}`);
  }

  return result.data;
}

// ============================================================================
// OUTPUT FORMATTERS
// ============================================================================

function formatQueries(queries) {
  console.log('\n┌───────────────────────────────────────────────────────────────────────┐');
  console.log('│                     AVAILABLE ADMIN API QUERIES                       │');
  console.log('├───────────────────────────────────────────────────────────────────────┤');
  
  queries.forEach(query => {
    const args = query.args && query.args.length > 0
      ? `(${query.args.map(a => a.name).join(', ')})`
      : '()';
    
    console.log(`│ ${query.name}${args}`);
    if (query.description) {
      console.log(`│   → ${query.description}`);
    }
    console.log(`│   → Returns: ${query.type.name || query.type.kind}`);
    console.log('│');
  });
  
  console.log('└───────────────────────────────────────────────────────────────────────┘');
}

function formatMutations(mutations) {
  if (!mutations || mutations.length === 0) {
    console.log('\n📝 No mutations available in Admin API');
    return;
  }
  
  console.log('\n┌───────────────────────────────────────────────────────────────────────┐');
  console.log('│                    AVAILABLE ADMIN API MUTATIONS                      │');
  console.log('├───────────────────────────────────────────────────────────────────────┤');
  
  mutations.forEach(mutation => {
    console.log(`│ ${mutation.name}`);
    if (mutation.description) {
      console.log(`│   → ${mutation.description}`);
    }
    console.log('│');
  });
  
  console.log('└───────────────────────────────────────────────────────────────────────┘');
}

function formatTypes(types, showAll) {
  // Filter to show only relevant types (not internal GraphQL types)
  const relevantTypes = types.filter(t => 
    !t.name.startsWith('__') && 
    (showAll || ['OBJECT', 'INPUT_OBJECT'].includes(t.kind))
  );
  
  console.log(`\n📦 ${relevantTypes.length} Types Available`);
  
  if (showAll) {
    relevantTypes.forEach(type => {
      console.log(`\n  ${type.name} (${type.kind})`);
      if (type.description) {
        console.log(`    ${type.description}`);
      }
      if (type.fields && type.fields.length > 0) {
        console.log(`    Fields: ${type.fields.map(f => f.name).join(', ')}`);
      }
    });
  } else {
    console.log('    Use --full to see all types');
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const showFull = args.includes('--full');

  console.log('🔍 Introspecting ACO Admin GraphQL API...\n');
  console.log(`   Tenant: ${config.tenantId}`);
  console.log(`   Region: ${config.region}`);
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Endpoint: ${getAdminEndpoint()}\n`);

  try {
    // Validate config
    if (!config.clientId || !config.clientSecret || !config.tenantId) {
      throw new Error('Missing required environment variables: CLIENT_ID, CLIENT_SECRET, TENANT_ID');
    }

    const schema = await adminQuery(INTROSPECTION_QUERY);

    // Show queries
    if (schema.__schema.queryType && schema.__schema.queryType.fields) {
      formatQueries(schema.__schema.queryType.fields);
    }

    // Show mutations
    if (schema.__schema.mutationType && schema.__schema.mutationType.fields) {
      formatMutations(schema.__schema.mutationType.fields);
    }

    // Show types
    if (schema.__schema.types) {
      formatTypes(schema.__schema.types, showFull);
    }

    console.log('\n✅ Introspection complete!\n');
    console.log('💡 Tips:');
    console.log('   • Look for queries like "products", "priceBooks", "metadata"');
    console.log('   • Use --full to see all types and fields');
    console.log('   • Check if there are list/get queries for entities we manage\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n🔑 Authentication failed. Check your CLIENT_ID and CLIENT_SECRET.');
    } else if (error.message.includes('GRAPHQL_VALIDATION_FAILED')) {
      console.error('\n⚠️  Introspection might be disabled on this API endpoint.');
      console.error('   This is common for production APIs for security reasons.');
    }
    
    process.exit(1);
  }
}

main();

