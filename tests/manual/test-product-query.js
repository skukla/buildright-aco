#!/usr/bin/env node
/**
 * Test product query to debug detection issue
 */

import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';

dotenv.config();

const config = {
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox',
  catalogViewId: '6792f1d5-9e79-4813-8d8e-df5ed76e5692', // BuildRight-Default
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
};

async function getAccessToken() {
  const IMS_TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';
  
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

async function testProductQuery() {
  console.log('Testing ACO product query...\n');
  console.log('Config:', {
    tenantId: config.tenantId,
    region: config.region,
    environment: config.environment,
    catalogViewId: config.catalogViewId
  });
  console.log('');

  // Get first 10 SKUs from local files
  const productsData = await fs.readFile(join(process.cwd(), 'data/buildright/products.json'), 'utf-8');
  const products = JSON.parse(productsData);
  const testSkus = products.slice(0, 10).map(p => p.sku);

  console.log('Testing with SKUs:', testSkus);
  console.log('');

  try {
    const token = await getAccessToken();
    console.log('✓ Got access token');
    
    const envSuffix = config.environment === 'sandbox' ? '-sandbox' : '';
    const endpoint = `https://${config.region}${envSuffix}.api.commerce.adobe.com/${config.tenantId}/graphql`;
    
    console.log('Endpoint:', endpoint);
    console.log('');

    const skuList = testSkus.map(sku => `"${sku}"`).join(', ');
    
    const query = `
      query {
        products(skus: [${skuList}]) {
          __typename
          sku
          name
        }
      }
    `;

    console.log('Query:', query);
    console.log('');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'AC-Environment-Id': config.tenantId,
        'AC-Source-Locale': 'en-US',
        'AC-View-Id': config.catalogViewId
      },
      body: JSON.stringify({ query })
    });

    console.log('Response status:', response.status);
    console.log('');

    const result = await response.json();
    
    console.log('Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data?.products) {
      console.log('');
      console.log(`✓ Found ${result.data.products.length} products`);
    } else if (result.errors) {
      console.log('');
      console.log('❌ GraphQL errors found!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.stack);
  }
}

testProductQuery().catch(console.error);

