#!/usr/bin/env node
/**
 * Test productSearch to find all products
 */

import dotenv from 'dotenv';

dotenv.config();

const config = {
  tenantId: process.env.TENANT_ID,
  region: process.env.REGION || 'na1',
  environment: process.env.ENVIRONMENT || 'sandbox',
  catalogViewId: '6792f1d5-9e79-4813-8d8e-df5ed76e5692',
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

  const data = await response.json();
  return data.access_token;
}

async function testProductSearch() {
  console.log('Testing ACO productSearch...\n');

  try {
    const token = await getAccessToken();
    console.log('✓ Got access token\n');
    
    const envSuffix = config.environment === 'sandbox' ? '-sandbox' : '';
    const endpoint = `https://${config.region}${envSuffix}.api.commerce.adobe.com/${config.tenantId}/graphql`;
    
    const query = `
      query {
        productSearch(phrase: "", page_size: 500) {
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

    console.log('Querying all products with productSearch...\n');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Api-Key': config.clientId,
        'AC-Environment-Id': config.tenantId,
        'AC-Source-Locale': 'en-US',
        'AC-View-Id': config.catalogViewId
      },
      body: JSON.stringify({ query })
    });

    console.log('Response status:', response.status);
    console.log('');

    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ Errors:');
      console.log(JSON.stringify(result.errors, null, 2));
    } else if (result.data?.productSearch) {
      const { total_count, items } = result.data.productSearch;
      console.log(`✓ Found ${total_count} total products`);
      console.log(`✓ Returned ${items.length} items`);
      
      if (items.length > 0) {
        console.log('\nFirst 10 products:');
        items.slice(0, 10).forEach(item => {
          console.log(`  - ${item.productView.sku}: ${item.productView.name}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testProductSearch().catch(console.error);

