#!/usr/bin/env node

/**
 * Test ACO product queries via API Mesh (the correct way)
 * This is how buildright-eds queries ACO products
 */

// API Mesh endpoint (from buildright-eds/config/env.json)
const MESH_ENDPOINT = 'https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql';

// BuildRight-Default catalog view ID (from delete-orphans.js)
const CATALOG_VIEW_ID = '6792f1d5-9e79-4813-8d8e-df5ed76e5692';

async function testMeshQuery() {
  console.log('🔍 Testing ACO via API Mesh (correct method)...\n');
  console.log(`   Mesh Endpoint: ${MESH_ENDPOINT}`);
  console.log(`   Catalog View: ${CATALOG_VIEW_ID}\n`);

  const query = `
    query {
      BuildRight_productSearchFilter(phrase: "", limit: 10) {
        products {
          totalCount
          items {
            sku
            name
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(MESH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Catalog-View-Id': CATALOG_VIEW_ID
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();

    if (result.errors) {
      console.log('   ❌ GraphQL Errors:');
      result.errors.forEach(err => console.log(`      ${err.message}`));
      return;
    }

    const data = result.data?.BuildRight_productSearchFilter;
    if (data) {
      console.log(`   ✅ Success!`);
      console.log(`   Total products: ${data.products.totalCount}`);
      console.log(`\n   First ${Math.min(10, data.products.items.length)} products:`);
      data.products.items.forEach(p => {
        console.log(`     - ${p.sku}: ${p.name}`);
      });
    } else {
      console.log('   ❌ No data returned');
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

testMeshQuery();

