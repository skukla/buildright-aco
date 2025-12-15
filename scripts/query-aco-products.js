#!/usr/bin/env node

/**
 * Query ACO Products - Direct Access (No Mesh Required)
 * 
 * This replicates what the API Mesh does:
 * - Queries ACO GraphQL endpoint directly
 * - Uses AC-View-Id and AC-Price-Book-Id headers
 * - Can discover all products for validation
 */

import dotenv from 'dotenv';
dotenv.config();

const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox',
  catalogViewId: '6792f1d5-9e79-4813-8d8e-df5ed76e5692' // BuildRight-Default view
};

const IMS_TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';

function getACOEndpoint() {
  const envSuffix = config.environment === 'sandbox' ? '-sandbox' : '';
  return `https://${config.region}${envSuffix}.api.commerce.adobe.com/${config.tenantId}/graphql`;
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
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await response.json();
  return data.access_token;
}

async function queryACOProducts(phrase = '', limit = 500) {
  console.log('🔍 Querying ACO directly (no mesh required)...\n');
  console.log(`   Endpoint: ${getACOEndpoint()}`);
  console.log(`   Catalog View: ${config.catalogViewId}\n`);

  const query = `
    query ProductSearch($phrase: String!, $limit: Int) {
      productSearch(phrase: $phrase, page_size: $limit) {
        total_count
        items {
          productView {
            sku
            name
          }
        }
      }
    }
  `;

  try {
    const token = await getAccessToken();
    const endpoint = getACOEndpoint();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'AC-Environment-Id': config.tenantId,
        'AC-Source-Locale': 'en-US',
        'AC-View-Id': config.catalogViewId
      },
      body: JSON.stringify({ 
        query, 
        variables: { phrase, limit } 
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.log('   ❌ GraphQL Errors:');
      result.errors.forEach(err => console.log(`      ${err.message}`));
      return null;
    }

    const data = result.data?.productSearch;
    if (data) {
      console.log(`   ✅ Success!`);
      console.log(`   Total products: ${data.total_count}`);
      
      const products = data.items.map(item => item.productView);
      console.log(`\n   First ${Math.min(10, products.length)} products:`);
      products.slice(0, 10).forEach(p => {
        console.log(`     - ${p.sku}: ${p.name}`);
      });
      
      return products;
    } else {
      console.log('   ❌ No data returned');
      return null;
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Test with empty phrase (gets all products)
queryACOProducts('', 500);

