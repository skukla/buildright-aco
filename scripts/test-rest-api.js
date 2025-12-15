#!/usr/bin/env node

/**
 * Test ACO REST API for GET operations
 * Tests if we can query products, metadata, or price books via REST
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

function getRestEndpoint(resource) {
  const envSuffix = config.environment === 'sandbox' ? '-sandbox' : '';
  return `https://${config.region}${envSuffix}.api.commerce.adobe.com/${config.tenantId}/rest/${resource}`;
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

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function testRestEndpoint(resource) {
  console.log(`\n🧪 Testing: GET ${resource}`);
  
  try {
    const token = await getAccessToken();
    const endpoint = getRestEndpoint(resource);
    console.log(`   URL: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': config.clientId,
        'Content-Type': 'application/json'
      }
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success!`);
      console.log(`   Response keys:`, Object.keys(data));
      if (Array.isArray(data)) {
        console.log(`   Array length: ${data.length}`);
      } else if (data.items) {
        console.log(`   Items count: ${Array.isArray(data.items) ? data.items.length : '?'}`);
      }
      return { success: true, data };
    } else {
      const text = await response.text();
      console.log(`   ❌ Failed`);
      if (text.length < 200) {
        console.log(`   Error: ${text}`);
      }
      return { success: false, error: text };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Testing ACO REST API GET Operations...\n');
  console.log(`   Tenant: ${config.tenantId}`);
  console.log(`   Region: ${config.region}`);
  console.log(`   Environment: ${config.environment}`);

  const endpoints = [
    'products',
    'products?limit=10',
    'metadata',
    'price-books',
    'pricebooks',
    'prices',
    'catalog-views',
    'catalogViews'
  ];

  const results = [];
  for (const endpoint of endpoints) {
    const result = await testRestEndpoint(endpoint);
    results.push({ endpoint, ...result });
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n┌───────────────────────────────────────────────────────────────────────┐');
  console.log('│ RESULTS SUMMARY                                                       │');
  console.log('├───────────────────────────────────────────────────────────────────────┤');
  
  const successCount = results.filter(r => r.success).length;
  console.log(`│ ${successCount}/${results.length} endpoints responded successfully`);
  
  if (successCount > 0) {
    console.log('│');
    console.log('│ ✅ Working endpoints:');
    results.filter(r => r.success).forEach(r => {
      console.log(`│    • ${r.endpoint}`);
    });
  }
  
  console.log('└───────────────────────────────────────────────────────────────────────┘\n');

  if (successCount === 0) {
    console.log('💡 ACO REST API does not support GET queries for these resources.');
    console.log('   This confirms our approach: use local files + state tracker.\n');
  } else {
    console.log('💡 Some REST endpoints work! We can use these for additional validation.\n');
  }
}

main();

