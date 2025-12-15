#!/usr/bin/env node
/**
 * Test querying products WITHOUT catalog view filter
 */

import dotenv from 'dotenv';
dotenv.config();

async function getToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: 'openid,AdobeID,additional_info.projectedProductContext'
  });

  const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await response.json();
  return data.access_token;
}

async function testAllProducts() {
  const token = await getToken();
  
  console.log('Testing WITHOUT catalog view filter:\n');
  console.log('Headers:');
  console.log('  AC-Environment-Id:', process.env.TENANT_ID);
  console.log('  AC-Source-Locale: en-US');
  console.log('  AC-View-Id: (none - querying all products)');
  console.log('');

  const response = await fetch(
    `https://na1-sandbox.api.commerce.adobe.com/${process.env.TENANT_ID}/graphql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Api-Key': process.env.CLIENT_ID,
        'AC-Environment-Id': process.env.TENANT_ID,
        'AC-Source-Locale': 'en-US'
        // NO AC-View-Id header
      },
      body: JSON.stringify({
        query: `{
          productSearch(phrase: "", page_size: 10) {
            total_count
            items {
              productView {
                sku
                name
              }
            }
          }
        }`
      })
    }
  );

  console.log('Response status:', response.status);
  const result = await response.json();
  
  if (result.errors) {
    console.log('\nErrors:');
    result.errors.forEach(err => console.log('  -', err.message));
  }
  
  if (result.data?.productSearch) {
    console.log('\n✓ Found', result.data.productSearch.total_count, 'products');
    if (result.data.productSearch.items.length > 0) {
      console.log('\nFirst few products:');
      result.data.productSearch.items.slice(0, 5).forEach(item => {
        console.log(`  - ${item.productView.sku}: ${item.productView.name}`);
      });
    }
  }
}

testAllProducts().catch(console.error);

