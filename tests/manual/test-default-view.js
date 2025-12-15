#!/usr/bin/env node
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

async function testQuery(viewId, viewName, extraHeaders = {}) {
  const token = await getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Api-Key': process.env.CLIENT_ID,
    'AC-Environment-Id': process.env.TENANT_ID,
    'AC-Source-Locale': 'en-US',
    ...extraHeaders
  };
  
  if (viewId) {
    headers['AC-View-Id'] = viewId;
  }

  const response = await fetch(
    `https://na1-sandbox.api.commerce.adobe.com/${process.env.TENANT_ID}/graphql`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `{
          productSearch(phrase: "", page_size: 5) {
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

  const result = await response.json();
  return result;
}

async function main() {
  console.log('Testing BuildRight-Default with different configurations:\n');
  
  // Test 1: With AC-View-Id
  console.log('1. With AC-View-Id header:');
  let result = await testQuery('6792f1d5-9e79-4813-8d8e-df5ed76e5692', 'BuildRight-Default');
  console.log('   Total:', result.data?.productSearch?.total_count || 0);
  console.log('   Errors:', result.errors ? result.errors[0].message : 'none');
  
  // Test 2: Without AC-View-Id (should use default)
  console.log('\n2. WITHOUT AC-View-Id header (default view):');
  result = await testQuery(null, 'Default');
  console.log('   Total:', result.data?.productSearch?.total_count || 0);
  console.log('   Errors:', result.errors ? result.errors[0].message : 'none');
  
  // Test 3: With AC-Price-Book-ID
  console.log('\n3. With AC-View-Id + AC-Price-Book-Id:');
  result = await testQuery('6792f1d5-9e79-4813-8d8e-df5ed76e5692', 'BuildRight-Default', {
    'AC-Price-Book-Id': 'US-Retail'
  });
  console.log('   Total:', result.data?.productSearch?.total_count || 0);
  console.log('   Errors:', result.errors ? result.errors[0].message : 'none');
  
  // Test 4: Compare with working view
  console.log('\n4. Production-Builder (for comparison):');
  result = await testQuery('22c02790-7c5e-474d-a3b6-c72b22203be5', 'Production-Builder');
  console.log('   Total:', result.data?.productSearch?.total_count || 0);
  console.log('   Errors:', result.errors ? result.errors[0].message : 'none');
}

main();

