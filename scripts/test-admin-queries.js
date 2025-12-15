#!/usr/bin/env node

/**
 * Test ACO Admin API Queries
 * 
 * Tests various queries against the ACO Admin GraphQL API to discover
 * what's available for listing products, price books, metadata, etc.
 * 
 * @module scripts/test-admin-queries
 */

import dotenv from 'dotenv';
import logger from '../shared/logger.js';

dotenv.config();

const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox'
};

const IMS_TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';

function getAdminEndpoint() {
  const envSuffix = config.environment === 'sandbox' ? '-sandbox' : '';
  return `https://${config.region}${envSuffix}.api.commerce.adobe.com/${config.tenantId}/admin/graphql`;
}

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
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function testQuery(name, query) {
  console.log(`\n🧪 Testing: ${name}`);
  
  try {
    const token = await getAccessToken();
    const endpoint = getAdminEndpoint();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': config.clientId
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();

    if (result.errors) {
      console.log(`   ❌ Failed: ${result.errors[0].message}`);
      return false;
    }

    console.log(`   ✅ Success!`);
    console.log(`   Data keys:`, Object.keys(result.data || {}));
    if (result.data) {
      Object.entries(result.data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          console.log(`     ${key}: ${value.length} items`);
        } else if (value && typeof value === 'object') {
          console.log(`     ${key}:`, Object.keys(value));
          if (value.items) {
            console.log(`       items: ${Array.isArray(value.items) ? value.items.length : '?'} items`);
          }
        }
      });
    }
    return true;

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing ACO Admin API Queries...\n');
  console.log(`   Endpoint: ${getAdminEndpoint()}`);

  const queries = [
    {
      name: 'Catalog Views',
      query: `query { catalogViews { items { id name } } }`
    },
    {
      name: 'Products (list)',
      query: `query { products { items { sku name } } }`
    },
    {
      name: 'Products (with pagination)',
      query: `query { products(pageSize: 10, currentPage: 1) { items { sku name } totalCount } }`
    },
    {
      name: 'Price Books',
      query: `query { priceBooks { items { id name } } }`
    },
    {
      name: 'Price Books (alt)',
      query: `query { priceBooks { id name } }`
    },
    {
      name: 'Metadata',
      query: `query { metadata { items { id name } } }`
    },
    {
      name: 'Product Metadata',
      query: `query { productMetadata { items { id name } } }`
    },
    {
      name: 'Product Attributes',
      query: `query { productAttributes { items { id name } } }`
    },
    {
      name: 'Attributes',
      query: `query { attributes { items { id name } } }`
    },
    {
      name: 'Categories',
      query: `query { categories { items { id name } } }`
    }
  ];

  let successCount = 0;
  for (const q of queries) {
    const success = await testQuery(q.name, q.query);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
  }

  console.log('\n┌───────────────────────────────────────────────────────────────────────┐');
  console.log(`│ RESULTS: ${successCount}/${queries.length} queries succeeded`);
  console.log('└───────────────────────────────────────────────────────────────────────┘\n');

  if (successCount === 0) {
    console.log('⚠️  No queries succeeded. This could mean:');
    console.log('   • Admin API has a different schema than expected');
    console.log('   • Authentication issues');
    console.log('   • API endpoint is incorrect\n');
  }
}

main();

