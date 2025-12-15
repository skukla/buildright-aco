#!/usr/bin/env node
/**
 * Test with CORRECT ACO headers (matching mesh config)
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

async function testWithCorrectHeaders() {
  const token = await getToken();
  
  console.log('Testing with CORRECT ACO headers (matching mesh config):\n');
  console.log('Headers:');
  console.log('  AC-Environment-Id:', process.env.TENANT_ID);
  console.log('  AC-Source-Locale: en-US');
  console.log('  AC-View-Id: 22c02790-7c5e-474d-a3b6-c72b22203be5 (Sarah/Production Builder)');
  console.log('  X-Api-Key:', process.env.CLIENT_ID);
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
        'AC-Source-Locale': 'en-US',
        'AC-View-Id': '22c02790-7c5e-474d-a3b6-c72b22203be5'
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
  console.log('\nResult:');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.data?.productSearch) {
    console.log('\n✓ Found', result.data.productSearch.total_count, 'products');
  }
}

testWithCorrectHeaders().catch(console.error);

