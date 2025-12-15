#!/usr/bin/env node

/**
 * Test ACO Catalog Service GraphQL API for product queries
 */

import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox'
};

const IMS_TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';

function getCatalogEndpoint() {
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

async function testQuery(name, query) {
  console.log(`\n🧪 Testing: ${name}`);
  
  try {
    const token = await getAccessToken();
    const endpoint = getCatalogEndpoint();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Magento-Website-Code': process.env.WEBSITE_CODE || 'base',
        'Magento-Store-Code': process.env.STORE_CODE || 'default',
        'Magento-Store-View-Code': process.env.STORE_VIEW_CODE || 'default'
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();

    if (result.errors) {
      console.log(`   ❌ Failed: ${result.errors[0].message}`);
      return { success: false, error: result.errors[0].message };
    }

    console.log(`   ✅ Success!`);
    console.log(`   Data keys:`, Object.keys(result.data || {}));
    
    Object.entries(result.data || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`     ${key}: ${value.length} items`);
      } else if (value && typeof value === 'object') {
        console.log(`     ${key}:`, Object.keys(value));
        if (value.items) {
          console.log(`       items: ${Array.isArray(value.items) ? value.items.length : '?'}`);
        }
      }
    });
    
    return { success: true, data: result.data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Testing ACO Catalog Service GraphQL API...\n');
  console.log(`   Endpoint: ${getCatalogEndpoint()}`);

  const queries = [
    {
      name: 'productSearch with empty phrase (browsing mode)',
      query: `query { productSearch(phrase: "", page_size: 100) { items { productView { sku name } } total_count } }`
    },
    {
      name: 'productSearch with filter (urlKey contains)',
      query: `query { productSearch(phrase: "", filter: [{attribute: "urlKey", in: ["lbr"]}], page_size: 100) { items { productView { sku name } } total_count } }`
    },
    {
      name: 'productSearch with LBR search',
      query: `query { productSearch(phrase: "LBR", page_size: 100) { items { productView { sku name } } total_count } }`
    },
    {
      name: 'products by SKUs (validation query)',
      query: `query { products(skus: ["LBR-001", "FRM-001"]) { sku name } }`
    }
  ];

  const results = [];
  for (const q of queries) {
    const result = await testQuery(q.name, q.query);
    results.push({ name: q.name, ...result });
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n┌───────────────────────────────────────────────────────────────────────┐');
  console.log('│ RESULTS SUMMARY                                                       │');
  console.log('├───────────────────────────────────────────────────────────────────────┤');
  
  const successCount = results.filter(r => r.success).length;
  console.log(`│ ${successCount}/${results.length} queries succeeded`);
  
  if (successCount > 0) {
    console.log('│');
    console.log('│ ✅ Working queries:');
    results.filter(r => r.success).forEach(r => {
      console.log(`│    • ${r.name}`);
    });
  }
  
  console.log('└───────────────────────────────────────────────────────────────────────┘\n');

  if (results.some(r => r.success && r.name.includes('productSearch'))) {
    console.log('💡 productSearch works! We CAN use it to discover all products.');
    console.log('   This means we can validate deletion by querying ACO directly.\n');
  } else if (results.some(r => r.success && r.name.includes('products by SKUs'))) {
    console.log('💡 products(skus) works, but requires known SKUs.');
    console.log('   We can use it to validate that specific SKUs were deleted.\n');
  } else {
    console.log('💡 No discovery queries work. Must use local files + state tracker.\n');
  }
}

main();

