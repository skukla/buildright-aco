#!/usr/bin/env node
/**
 * Test if products(skus: [...]) works WITHOUT catalog view ID
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

async function testQuery(testName, headers, skus) {
  const token = await getToken();
  
  const skuList = skus.map(sku => `"${sku}"`).join(', ');
  const query = `query { products(skus: [${skuList}]) { sku name } }`;

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
        ...headers
      },
      body: JSON.stringify({ query })
    }
  );

  const result = await response.json();
  return result;
}

async function main() {
  console.log('Testing products(skus: [...]) query with different configurations:\n');
  
  // Get a few real SKUs from local data
  const { default: products } = await import('./data/buildright/products.json', { assert: { type: 'json' } });
  const testSkus = products.slice(0, 5).map(p => p.sku);
  console.log('Test SKUs:', testSkus.join(', '), '\n');
  
  // Test 1: Without AC-View-Id
  console.log('1. WITHOUT AC-View-Id (no catalog view):');
  let result = await testQuery('No view', {}, testSkus);
  console.log('   Products found:', result.data?.products?.length || 0);
  console.log('   Errors:', result.errors ? result.errors[0].message : 'none');
  
  // Test 2: With BuildRight-Default view
  console.log('\n2. WITH AC-View-Id (BuildRight-Default):');
  result = await testQuery('Default view', { 'AC-View-Id': '6792f1d5-9e79-4813-8d8e-df5ed76e5692' }, testSkus);
  console.log('   Products found:', result.data?.products?.length || 0);
  console.log('   Errors:', result.errors ? result.errors[0].message : 'none');
  
  // Test 3: With Production-Builder view
  console.log('\n3. WITH AC-View-Id (Production-Builder):');
  result = await testQuery('Builder view', { 'AC-View-Id': '22c02790-7c5e-474d-a3b6-c72b22203be5' }, testSkus);
  console.log('   Products found:', result.data?.products?.length || 0);
  console.log('   Errors:', result.errors ? result.errors[0].message : 'none');
  
  console.log('\n' + '='.repeat(80));
  console.log('CONCLUSION:');
  console.log('If all three return the same count, catalog view does NOT filter products(skus)');
  console.log('If counts differ, catalog view DOES filter products(skus)');
}

main();

