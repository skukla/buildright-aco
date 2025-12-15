#!/usr/bin/env node
/**
 * Test: Can we DELETE invisible variant SKUs even though we can't QUERY them?
 * 
 * This tests if the ACO deleteProducts API accepts invisible variants
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deleteProductsBySKUs } from './utils/aco-delete.js';
import { BuildRightDetector } from './utils/smart-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const detector = new BuildRightDetector({ silent: false });

async function testDeleteInvisibleVariant() {
  console.log('\n🧪 Testing DELETE on invisible variant products\n');
  console.log('═'.repeat(80));
  
  // Get a few variant SKUs from local file
  const variantsData = await fs.readFile(join(__dirname, 'data/buildright/variants.json'), 'utf-8');
  const variants = JSON.parse(variantsData);
  
  // Get variant SKUs (not configurables)
  const variantSkus = variants
    .filter(v => !v.sku.endsWith('-CONFIG'))
    .map(v => v.sku)
    .slice(0, 5); // Just test with 5
  
  console.log(`\n📋 Test SKUs (invisible variants):`);
  variantSkus.forEach(sku => console.log(`   - ${sku}`));
  
  // Step 1: Verify they're not queryable
  console.log(`\n\n1️⃣  QUERY Test - Can we find these variants?`);
  const queryResult = await detector.queryACOProductsBySKUs(variantSkus);
  console.log(`   Result: ${queryResult.length}/${variantSkus.length} found via products(skus: [...])`);
  if (queryResult.length === 0) {
    console.log(`   ❌ Not queryable (expected for invisible variants)`);
  } else {
    console.log(`   ✅ Found: ${queryResult.map(p => p.sku).join(', ')}`);
  }
  
  // Step 2: Try to delete them anyway
  console.log(`\n\n2️⃣  DELETE Test - Can we delete them by SKU?`);
  console.log(`   Submitting delete request for ${variantSkus.length} invisible variants...`);
  
  const deleteResult = await deleteProductsBySKUs(variantSkus, { 
    dryRun: false,
    silent: false 
  });
  
  console.log(`\n   📊 Delete API Response:`);
  console.log(`      Total requested: ${deleteResult.total}`);
  console.log(`      Accepted: ${deleteResult.deleted}`);
  console.log(`      Rejected: ${deleteResult.rejected || 0}`);
  console.log(`      Errors: ${deleteResult.errors?.length || 0}`);
  
  if (deleteResult.deleted === variantSkus.length) {
    console.log(`\n   ✅ SUCCESS: ACO accepted all ${variantSkus.length} invisible variants for deletion!`);
  } else if (deleteResult.deleted > 0) {
    console.log(`\n   ⚠️  PARTIAL: ACO accepted ${deleteResult.deleted}/${variantSkus.length} for deletion`);
  } else {
    console.log(`\n   ❌ FAILED: ACO rejected all invisible variants`);
  }
  
  // Step 3: Wait and verify they're gone
  console.log(`\n\n3️⃣  VERIFICATION - Are they actually deleted?`);
  console.log(`   Waiting 5 seconds for ACO to process...`);
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const verifyResult = await detector.queryACOProductsBySKUs(variantSkus);
  console.log(`   Query after delete: ${verifyResult.length}/${variantSkus.length} still exist`);
  
  if (verifyResult.length === 0) {
    console.log(`   ✅ All variants deleted successfully`);
  } else {
    console.log(`   ⚠️  ${verifyResult.length} variants still exist:`, verifyResult.map(p => p.sku));
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('\n🎯 CONCLUSION:');
  
  if (deleteResult.deleted === variantSkus.length) {
    console.log('   ✅ ACO DELETE API works on invisible variants!');
    console.log('   📝 The issue is in DETECTION (query), not DELETION');
    console.log('   💡 Solution: Use state tracker or local files for detection');
  } else {
    console.log('   ❌ ACO DELETE API does NOT work on invisible variants');
    console.log('   💡 Need to fix variant visibility or find alternative delete method');
  }
  console.log('');
}

testDeleteInvisibleVariant().catch(console.error);

