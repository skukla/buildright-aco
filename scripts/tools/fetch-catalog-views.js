#!/usr/bin/env node

/**
 * Fetch Catalog Views from ACO Admin API
 * 
 * Queries the ACO Admin GraphQL API to get all catalog views and their IDs.
 * This is useful for:
 * - Documenting catalog view UUIDs
 * - Generating persona-to-catalog-view mappings
 * - Validating catalog view setup
 * 
 * Usage:
 *   npm run fetch:catalog-views
 *   node scripts/fetch-catalog-views.js
 *   node scripts/fetch-catalog-views.js --json  # Output as JSON
 * 
 * @module scripts/fetch-catalog-views
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

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
// ADMIN API QUERIES
// ============================================================================

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

/**
 * Fetch all catalog views
 */
async function fetchCatalogViews() {
  // Note: The exact query structure depends on ACO Admin API schema
  // This is based on typical ACO Admin API patterns
  const query = `
    query GetCatalogViews {
      catalogViews {
        items {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    }
  `;

  try {
    const data = await adminQuery(query);
    return data.catalogViews?.items || [];
  } catch (error) {
    // Try alternative query structure if first fails
    console.warn('Primary query failed, trying alternative structure...');
    
    const altQuery = `
      query {
        catalogViews {
          id
          name
          description
        }
      }
    `;
    
    try {
      const altData = await adminQuery(altQuery);
      // Handle different response structures
      if (Array.isArray(altData.catalogViews)) {
        return altData.catalogViews;
      }
      return altData.catalogViews?.items || [];
    } catch (altError) {
      throw new Error(`Failed to fetch catalog views: ${error.message}`);
    }
  }
}

// ============================================================================
// OUTPUT FORMATTERS
// ============================================================================

function formatTable(views) {
  console.log('\n┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│                         ACO CATALOG VIEWS                                   │');
  console.log('├─────────────────────────────────────────────────────────────────────────────┤');
  
  views.forEach(view => {
    const name = view.name.padEnd(35);
    const id = view.id;
    console.log(`│ ${name} │ ${id} │`);
  });
  
  console.log('└─────────────────────────────────────────────────────────────────────────────┘');
}

function formatJson(views) {
  const output = {
    fetchedAt: new Date().toISOString(),
    endpoint: getAdminEndpoint(),
    catalogViews: views.reduce((acc, view) => {
      acc[view.name] = {
        id: view.id,
        description: view.description || null
      };
      return acc;
    }, {})
  };
  
  console.log(JSON.stringify(output, null, 2));
}

function formatMapping(views) {
  console.log('\n// Persona Mapping (paste into persona-mappings.json)');
  console.log('const catalogViewMapping = {');
  views.forEach(view => {
    console.log(`  "${view.name}": "${view.id}",`);
  });
  console.log('};');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const outputMapping = args.includes('--mapping');

  console.log('🔍 Fetching catalog views from ACO Admin API...\n');
  console.log(`   Tenant: ${config.tenantId}`);
  console.log(`   Region: ${config.region}`);
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Endpoint: ${getAdminEndpoint()}\n`);

  try {
    // Validate config
    if (!config.clientId || !config.clientSecret || !config.tenantId) {
      throw new Error('Missing required environment variables: CLIENT_ID, CLIENT_SECRET, TENANT_ID');
    }

    const views = await fetchCatalogViews();

    if (views.length === 0) {
      console.log('⚠️  No catalog views found.');
      return;
    }

    console.log(`✅ Found ${views.length} catalog view(s)\n`);

    if (outputJson) {
      formatJson(views);
    } else if (outputMapping) {
      formatMapping(views);
    } else {
      formatTable(views);
      console.log('\n💡 Tip: Use --json for JSON output or --mapping for code snippet');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n🔑 Authentication failed. Check your CLIENT_ID and CLIENT_SECRET.');
    }
    
    process.exit(1);
  }
}

main();

