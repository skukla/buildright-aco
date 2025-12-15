#!/usr/bin/env node
/**
 * Test: Can we query invisible variant SKUs using products(skus: [...])
 */

import { BuildRightDetector } from './utils/smart-detector.js';

const detector = new BuildRightDetector({ silent: false });

// Test SKUs
const configurableSku = 'LBR-28A6D33B-CONFIG'; // Configurable (visibleIn: ["CATALOG", "SEARCH"])
const variantSku = 'DRYWALL-E68755BC-VAR-802A42'; // Variant child (visibleIn: [])
const simpleSku = 'LBR-D0414F1E'; // Simple product (visibleIn: ["CATALOG", "SEARCH"])

async function testQuery() {
  console.log('\n🔍 Testing product query behavior:\n');
  
  // Test 1: Query configurable (visible)
  console.log('1️⃣  Configurable (visible):');
  const configurableResult = await detector.queryACOProductsBySKUs([configurableSku]);
  console.log(`   Query: products(skus: ["${configurableSku}"])`);
  console.log(`   Result: ${configurableResult.length} product(s) found`);
  if (configurableResult.length > 0) {
    console.log(`   ✅ SKU: ${configurableResult[0].sku}`);
  } else {
    console.log(`   ❌ Not found`);
  }
  console.log('');
  
  // Test 2: Query variant (invisible)
  console.log('2️⃣  Variant child (invisible):');
  const variantResult = await detector.queryACOProductsBySKUs([variantSku]);
  console.log(`   Query: products(skus: ["${variantSku}"])`);
  console.log(`   Result: ${variantResult.length} product(s) found`);
  if (variantResult.length > 0) {
    console.log(`   ✅ SKU: ${variantResult[0].sku}`);
  } else {
    console.log(`   ❌ Not found (invisible variants not queryable)`);
  }
  console.log('');
  
  // Test 3: Query simple (visible)
  console.log('3️⃣  Simple product (visible):');
  const simpleResult = await detector.queryACOProductsBySKUs([simpleSku]);
  console.log(`   Query: products(skus: ["${simpleSku}"])`);
  console.log(`   Result: ${simpleResult.length} product(s) found`);
  if (simpleResult.length > 0) {
    console.log(`   ✅ SKU: ${simpleResult[0].sku}`);
  } else {
    console.log(`   ❌ Not found`);
  }
  console.log('');
  
  // Test 4: Query all three together
  console.log('4️⃣  All three together:');
  const allResult = await detector.queryACOProductsBySKUs([configurableSku, variantSku, simpleSku]);
  console.log(`   Query: products(skus: ["${configurableSku}", "${variantSku}", "${simpleSku}"])`);
  console.log(`   Result: ${allResult.length} product(s) found`);
  if (allResult.length > 0) {
    allResult.forEach(p => console.log(`   ✅ ${p.sku}`));
  }
  console.log('');
  
  // Summary
  console.log('═'.repeat(80));
  console.log('📊 Summary:');
  console.log(`   Visible products queryable: ${configurableResult.length + simpleResult.length}/2`);
  console.log(`   Invisible variants queryable: ${variantResult.length}/1`);
  console.log('');
  
  if (variantResult.length === 0) {
    console.log('⚠️  ISSUE CONFIRMED:');
    console.log('   Variants with visibleIn:[] are NOT queryable via products(skus: [...])');
    console.log('   This causes the deletion script to miss 101 variant SKUs!');
    console.log('');
    console.log('💡 SOLUTION:');
    console.log('   Use state tracker or local files instead of querying ACO for detection');
  }
}

testQuery().catch(console.error);

