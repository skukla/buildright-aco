#!/usr/bin/env node
/**
 * Test introspection on ACO Admin API
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

async function testQuery(query) {
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

  return await response.json();
}

async function main() {
  console.log('Testing Admin API Introspection\n');
  
  // Test 1: Full introspection
  console.log('1. Full Introspection Query:');
  let result = await testQuery(`
    query {
      __schema {
        queryType {
          fields {
            name
            description
          }
        }
      }
    }
  `);
  
  if (result.errors) {
    console.log('   ❌', result.errors[0].message);
  } else {
    console.log('   ✅ Available queries:');
    result.data.__schema.queryType.fields.forEach(f => {
      console.log(`      - ${f.name}`);
    });
  }
  
  // Test 2: PriceBooksResponse type
  console.log('\n2. PriceBooksResponse Type:');
  result = await testQuery(`
    query {
      __type(name: "PriceBooksResponse") {
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  `);
  
  if (result.errors) {
    console.log('   ❌', result.errors[0].message);
  } else if (result.data.__type) {
    console.log('   ✅ Fields:');
    result.data.__type.fields.forEach(f => {
      console.log(`      - ${f.name}: ${f.type.name || f.type.kind}`);
    });
  } else {
    console.log('   ⚠️  Type not found');
  }
  
  // Test 3: Try simple priceBooks query
  console.log('\n3. Simple priceBooks query:');
  result = await testQuery(`
    query {
      priceBooks {
        items {
          id
          name
        }
      }
    }
  `);
  
  if (result.errors) {
    console.log('   ❌', result.errors[0].message);
  } else {
    console.log('   ✅ Success!');
    console.log(JSON.stringify(result.data, null, 2));
  }
}

main().catch(console.error);

