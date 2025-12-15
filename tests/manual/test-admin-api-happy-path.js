#!/usr/bin/env node
/**
 * Test ACO Admin API "Happy Path" with real data
 * 
 * Tests:
 * 1. Query channels (catalog views)
 * 2. Query price books
 * 3. Query product metadata (attributes)
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

async function testAdminQuery(testName, query) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${testName}`);
  console.log('='.repeat(80));
  
  const token = await getToken();
  
  const response = await fetch(
    `https://na1-sandbox.api.commerce.adobe.com/${process.env.TENANT_ID}/admin/graphql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Api-Key': process.env.CLIENT_ID,
        'AC-Environment-Id': process.env.TENANT_ID
      },
      body: JSON.stringify({ query })
    }
  );

  console.log('Response Status:', response.status, response.statusText);
  
  const result = await response.json();
  
  if (result.errors) {
    console.log('\n❌ Errors:');
    result.errors.forEach(err => {
      console.log(`  - ${err.message}`);
      if (err.extensions) {
        console.log(`    Extensions:`, JSON.stringify(err.extensions, null, 2));
      }
    });
  }
  
  if (result.data) {
    console.log('\n✅ Data:');
    console.log(JSON.stringify(result.data, null, 2));
  }
  
  return result;
}

async function main() {
  console.log('🔍 ACO Admin API Happy Path Tests');
  console.log('Testing with REAL data in system\n');
  console.log('Tenant ID:', process.env.TENANT_ID);
  
  // Test 1: Query channels (catalog views)
  await testAdminQuery(
    'Query Channels (Catalog Views)',
    `query {
      channels {
        channelId
        name
      }
    }`
  );
  
  // Test 2: Query price books
  await testAdminQuery(
    'Query Price Books',
    `query {
      priceBooks {
        priceBookId
        name
      }
    }`
  );
  
  // Test 3: Query product metadata (attributes)
  await testAdminQuery(
    'Query Product Metadata',
    `query {
      productMetadata {
        attributes {
          code
          type
        }
      }
    }`
  );
  
  // Test 4: Try with pagination
  await testAdminQuery(
    'Query Price Books with Pagination',
    `query {
      priceBooks(pageSize: 10, currentPage: 1) {
        priceBookId
        name
      }
    }`
  );
  
  console.log('\n' + '='.repeat(80));
  console.log('Tests Complete');
  console.log('='.repeat(80));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

