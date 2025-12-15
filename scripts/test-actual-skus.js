#!/usr/bin/env node

import dotenv from 'dotenv';
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
  // Use the correct Catalog Service endpoint (not ACO endpoint)
  return 'https://catalog-service-sandbox.adobe.io/graphql';
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
  console.log(`\n🧪 ${name}`);
  
  try {
    const token = await getAccessToken();
    const endpoint = getCatalogEndpoint();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Magento-Environment-Id': '22d69fd7-d43a-43a1-b660-7feeede16247',
        'Magento-Website-Code': 'base',
        'Magento-Store-Code': 'main_website_store',
        'Magento-Store-View-Code': 'default',
        'Magento-Customer-Group': ''
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();

    if (result.errors) {
      console.log(`   ❌ ${result.errors[0].message}`);
      return false;
    }

    console.log(`   ✅ Success!`);
    if (result.data?.products) {
      console.log(`   Found ${result.data.products.length} products`);
      result.data.products.forEach(p => {
        console.log(`     - ${p.sku}: ${p.name}`);
      });
    }
    return true;
  } catch (error) {
    console.log(`   ❌ ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing ACO Catalog Service with actual SKUs...\n');
  console.log(`   Endpoint: ${getCatalogEndpoint()}`);

  await testQuery(
    'Query products by actual SKUs',
    `query { products(skus: ["LBR-D0414F1E", "LBR-2EBB314A", "LBR-26852468"]) { sku name } }`
  );
}

main();

