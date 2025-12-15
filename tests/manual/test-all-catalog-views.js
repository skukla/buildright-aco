#!/usr/bin/env node
/**
 * Test productSearch with ALL BuildRight catalog views
 */

import dotenv from 'dotenv';
dotenv.config();

const CATALOG_VIEWS = {
  'BuildRight-Default': '6792f1d5-9e79-4813-8d8e-df5ed76e5692',
  'BuildRight-Production-Builder': '22c02790-7c5e-474d-a3b6-c72b22203be5',
  'BuildRight-Trade-Professional': '7cba9c31-307b-4f9f-a7a7-4a4b1b49c2a4',
  'BuildRight-Retail-Registered': '0a4dbd61-64ae-47f6-9ea8-2d91877dff71',
  'BuildRight-Wholesale-Reseller': '9cd9753d-baaf-4af1-b825-d9524d8e32ef'
};

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

async function queryView(token, viewName, viewId) {
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
        'AC-View-Id': viewId
      },
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

async function testAllViews() {
  console.log('Testing productSearch with all BuildRight catalog views:\n');
  console.log('═'.repeat(80));
  
  const token = await getToken();
  
  for (const [viewName, viewId] of Object.entries(CATALOG_VIEWS)) {
    console.log(`\n📂 ${viewName}`);
    console.log(`   UUID: ${viewId}`);
    
    const result = await queryView(token, viewName, viewId);
    
    if (result.errors) {
      console.log('   ❌ Error:', result.errors[0].message);
    } else if (result.data?.productSearch) {
      const count = result.data.productSearch.total_count;
      if (count > 0) {
        console.log(`   ✅ ${count} products found`);
        console.log('   Sample products:');
        result.data.productSearch.items.forEach(item => {
          console.log(`      - ${item.productView.sku}: ${item.productView.name}`);
        });
      } else {
        console.log('   ⚠️  0 products');
      }
    }
  }
  
  console.log('\n' + '═'.repeat(80));
}

testAllViews().catch(console.error);

