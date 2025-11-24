/**
 * Browser Console Script: Extract All SKUs from ACO Products Table
 *
 * ⚠️  USE AS LAST RESORT ONLY ⚠️
 *
 * This script should only be used when:
 * - You need to delete ALL products from the catalog
 * - The GraphQL productSearch API is not available (requires Live Search)
 * - You don't have access to the original data files used for ingestion
 * - The catalog contains products from an unknown/old ingestion
 *
 * WHY THIS EXISTS:
 * The ACO Data Ingestion API is write-only with no GET/LIST operations.
 * The ACO admin UI uses lazy-loading, so copying HTML only captures visible rows (~10 products).
 * This script automates scrolling through the entire table to extract all SKUs.
 *
 * INSTRUCTIONS:
 * 1. Open the ACO Products page in your browser (Data Sync > Catalog Service)
 * 2. Open Developer Tools (F12 or Cmd+Option+I)
 * 3. Go to the Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run it
 * 6. Wait for it to complete (it will scroll through the entire table)
 * 7. Copy the output SKU list
 *
 * The script will:
 * - Find the iframe containing the product table
 * - Scroll through the entire table to trigger lazy loading
 * - Extract all SKUs as they become visible
 * - Output a complete list of unique SKUs
 * - Automatically copy SKUs to clipboard
 */

(async function extractAllSKUs() {
  console.log('🔍 Starting SKU extraction from ACO Products table...\n');

  // Find the iframe
  const iframe = document.getElementById('exc-app-sandbox-0.3853657531485506')
    || document.querySelector('iframe[id*="exc-app-sandbox"]');

  if (!iframe) {
    console.error('❌ Could not find the product table iframe');
    return;
  }

  console.log('✅ Found iframe');

  // Access iframe content
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  // Find the scrollable container (the table body or virtual scroller)
  const scrollContainer = iframeDoc.querySelector('[role="grid"]')
    || iframeDoc.querySelector('.spectrum-Table-body')
    || iframeDoc.querySelector('[data-testid*="table"]');

  if (!scrollContainer) {
    console.error('❌ Could not find the scrollable table container');
    return;
  }

  console.log('✅ Found table container');

  // Set to store unique SKUs
  const skus = new Set();

  // Function to extract SKUs from currently visible rows
  function extractVisibleSKUs() {
    const rows = iframeDoc.querySelectorAll('[data-testid*="products-inventory-tabel-row"]');
    let newCount = 0;

    rows.forEach(row => {
      const sku = row.getAttribute('data-key');
      if (sku && !skus.has(sku)) {
        skus.add(sku);
        newCount++;
      }
    });

    return newCount;
  }

  // Initial extraction
  extractVisibleSKUs();
  console.log(`📝 Initial extraction: ${skus.size} SKUs found`);

  // Scroll through the table to load all rows
  console.log('🔄 Scrolling through table to load all products...');

  let previousCount = skus.size;
  let stableCount = 0;
  let scrollPosition = 0;
  const scrollStep = 500; // Scroll 500px at a time
  const maxScrollAttempts = 1000; // Safety limit
  let attempts = 0;

  while (stableCount < 3 && attempts < maxScrollAttempts) {
    attempts++;

    // Scroll down
    scrollContainer.scrollTop = scrollPosition;
    scrollPosition += scrollStep;

    // Wait for lazy loading to render new rows
    await new Promise(resolve => setTimeout(resolve, 200));

    // Extract SKUs from newly visible rows
    const newCount = extractVisibleSKUs();

    if (newCount > 0) {
      console.log(`  → Found ${newCount} new SKUs (total: ${skus.size})`);
      stableCount = 0;
    } else {
      stableCount++;
    }

    // Check if we've reached the bottom
    if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight) {
      console.log('✅ Reached bottom of table');
      break;
    }
  }

  // Final extraction to ensure we got everything
  await new Promise(resolve => setTimeout(resolve, 500));
  extractVisibleSKUs();

  console.log('\n✅ Extraction complete!\n');
  console.log(`📊 Total SKUs found: ${skus.size}\n`);
  console.log('📋 SKU List (copy this):');
  console.log('─'.repeat(50));

  // Convert to sorted array and output
  const skuArray = Array.from(skus).sort();
  skuArray.forEach(sku => console.log(sku));

  console.log('─'.repeat(50));
  console.log(`\n✅ ${skus.size} SKUs extracted successfully!`);
  console.log('\n💾 To save to file:');
  console.log('1. Copy all the SKUs above (between the lines)');
  console.log('2. Save to: temp/skus-to-delete.txt');
  console.log('3. Run: npm run delete:skus:dry-run');
  console.log('4. Run: npm run delete:skus');

  // Also copy to clipboard if available
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(skuArray.join('\n'));
      console.log('\n📋 SKUs copied to clipboard!');
    } catch (e) {
      console.log('\n⚠️  Could not copy to clipboard automatically. Please copy manually.');
    }
  }

  return skuArray;
})();

