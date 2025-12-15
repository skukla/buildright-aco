/**
 * Browser Console Script: Diagnose ACO UI Structure
 * 
 * USAGE:
 * 1. Open ACO UI Data Sync page showing your 101 products
 * 2. Open browser DevTools Console
 * 3. Paste this script and press Enter
 * 4. Review the diagnostic output to understand the UI structure
 * 
 * This will help us build the correct SKU extractor
 */

(function diagnoseUI() {
  console.log('🔍 ACO UI Structure Diagnosis\n');
  console.log('═'.repeat(80));
  
  // 1. Look for tables
  console.log('\n📊 TABLES:');
  const tables = document.querySelectorAll('table');
  console.log(`   Found ${tables.length} table(s)`);
  if (tables.length > 0) {
    tables.forEach((table, i) => {
      const rows = table.querySelectorAll('tr');
      const headers = table.querySelectorAll('th');
      console.log(`   Table ${i + 1}:`);
      console.log(`      - ${rows.length} rows`);
      console.log(`      - ${headers.length} headers`);
      if (headers.length > 0) {
        const headerTexts = Array.from(headers).map(h => h.textContent.trim());
        console.log(`      - Headers: ${headerTexts.join(', ')}`);
      }
      // Show first row
      const firstRow = table.querySelector('tr:nth-child(2)'); // Skip header
      if (firstRow) {
        const cells = firstRow.querySelectorAll('td');
        if (cells.length > 0) {
          console.log(`      - First row cells (${cells.length}):`);
          Array.from(cells).slice(0, 5).forEach((cell, j) => {
            const text = cell.textContent.trim().substring(0, 50);
            console.log(`         ${j}: "${text}"`);
          });
        }
      }
    });
  }
  
  // 2. Look for ARIA grid/table structures
  console.log('\n🎭 ARIA STRUCTURES:');
  const grids = document.querySelectorAll('[role="grid"], [role="table"]');
  console.log(`   Found ${grids.length} ARIA grid/table(s)`);
  if (grids.length > 0) {
    grids.forEach((grid, i) => {
      const rows = grid.querySelectorAll('[role="row"]');
      console.log(`   Grid ${i + 1}:`);
      console.log(`      - ${rows.length} rows`);
      // Show first data row
      const firstRow = rows[1] || rows[0]; // Skip header if exists
      if (firstRow) {
        const cells = firstRow.querySelectorAll('[role="gridcell"], [role="cell"]');
        if (cells.length > 0) {
          console.log(`      - First row cells (${cells.length}):`);
          Array.from(cells).slice(0, 5).forEach((cell, j) => {
            const text = cell.textContent.trim().substring(0, 50);
            console.log(`         ${j}: "${text}"`);
          });
        }
      }
    });
  }
  
  // 3. Look for common data list patterns
  console.log('\n📋 DATA LISTS:');
  const lists = document.querySelectorAll('ul, ol, [class*="list"]');
  console.log(`   Found ${lists.length} list element(s)`);
  
  // 4. Look for React/Spectrum component patterns
  console.log('\n⚛️  REACT/SPECTRUM COMPONENTS:');
  const spectrumElements = document.querySelectorAll('[class*="spectrum"]');
  console.log(`   Found ${spectrumElements.length} Spectrum component(s)`);
  
  // 5. Look for any text that matches SKU patterns
  console.log('\n🔎 SKU PATTERN SEARCH:');
  const allText = document.body.innerText;
  const skuPattern = /\b[A-Z][A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+\b/g;
  const foundSkus = allText.match(skuPattern);
  if (foundSkus) {
    const uniqueSkus = [...new Set(foundSkus)];
    console.log(`   Found ${uniqueSkus.length} unique SKU-like patterns in page text`);
    console.log(`   Sample SKUs: ${uniqueSkus.slice(0, 5).join(', ')}`);
  } else {
    console.log('   ❌ No SKU patterns found in visible text');
  }
  
  // 6. Look for specific data attributes
  console.log('\n🏷️  DATA ATTRIBUTES:');
  const dataElements = document.querySelectorAll('[data-sku], [data-product-sku], [data-field="sku"]');
  console.log(`   Found ${dataElements.length} element(s) with SKU data attributes`);
  
  // 7. Check if this is a React app (might need to access React state)
  console.log('\n⚛️  REACT DETECTION:');
  const reactRoot = document.querySelector('[id*="root"], [class*="react"]');
  if (reactRoot) {
    console.log('   ✅ React root element detected');
    // Try to access React internals
    const reactKey = Object.keys(reactRoot).find(key => key.startsWith('__react'));
    if (reactKey) {
      console.log('   ✅ React internals accessible via:', reactKey);
    }
  } else {
    console.log('   ⚠️  No obvious React root found');
  }
  
  // 8. Show all visible text in smaller chunks
  console.log('\n📄 VISIBLE TEXT SAMPLE (first 500 chars):');
  console.log(document.body.innerText.substring(0, 500).trim());
  
  console.log('\n' + '═'.repeat(80));
  console.log('\n💡 Next steps:');
  console.log('   1. Review the output above');
  console.log('   2. Look for where the SKUs appear');
  console.log('   3. Try right-clicking a SKU in the UI and select "Inspect"');
  console.log('   4. Share the HTML structure of that element with me');
  
  return {
    tables: tables.length,
    grids: grids.length,
    skuPatternsFound: foundSkus ? [...new Set(foundSkus)].length : 0
  };
})();

