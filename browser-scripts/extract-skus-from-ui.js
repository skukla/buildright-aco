/**
 * Browser Console Script: Extract all SKUs from ACO Data Sync UI
 * 
 * USAGE:
 * 1. Open ACO UI Data Sync page showing your 101 products
 * 2. Open browser DevTools (F12 or Cmd+Option+I)
 * 3. Go to Console tab
 * 4. Paste this entire script and press Enter
 * 5. Script will auto-scroll and collect all SKUs
 * 6. Copy the JSON output at the end
 * 
 * The script will:
 * - Auto-scroll to load all paginated/lazy-loaded products
 * - Extract SKUs from table cells or list items
 * - Remove duplicates
 * - Output as JSON array
 */

(async function extractAllSKUs() {
  console.log('🔍 Starting SKU extraction from ACO UI...\n');
  
  const skus = new Set();
  let previousCount = 0;
  let stableCount = 0;
  
  // Function to extract SKUs from current page
  function extractCurrentSKUs() {
    // Try multiple selector patterns (ACO UI might use different structures)
    const selectors = [
      '[data-field="sku"]',                    // Data attribute
      'td[class*="sku"]',                      // Table cell with sku in class
      'div[class*="sku"]',                     // Div with sku in class
      '[role="cell"]:has-text("sku")',        // ARIA role cell
      'span[class*="sku"]',                    // Span with sku in class
    ];
    
    // Also look for SKU patterns in any text content
    const skuPattern = /\b[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+\b/g;
    
    // Try each selector
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 3 && text.length < 50) {
            skus.add(text);
          }
        });
      } catch (e) {
        // Selector might not be valid, skip
      }
    }
    
    // Also scan all table rows for SKU patterns
    const rows = document.querySelectorAll('tr, [role="row"]');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, [role="cell"]');
      cells.forEach(cell => {
        const text = cell.textContent.trim();
        // Look for patterns like "NAIL-88AF0A82-CONFIG" or "LBR-D0414F1E"
        const matches = text.match(skuPattern);
        if (matches) {
          matches.forEach(sku => skus.add(sku));
        }
      });
    });
    
    return skus.size;
  }
  
  // Function to scroll to bottom
  function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
    
    // Also try scrolling any scrollable containers
    const containers = document.querySelectorAll('[class*="scroll"], [class*="table"], [role="grid"]');
    containers.forEach(container => {
      if (container.scrollHeight > container.clientHeight) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }
  
  // Auto-scroll and extract
  console.log('📜 Auto-scrolling to load all products...');
  
  while (stableCount < 3) { // Wait for 3 stable iterations
    scrollToBottom();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for load
    
    const currentCount = extractCurrentSKUs();
    
    if (currentCount === previousCount) {
      stableCount++;
    } else {
      stableCount = 0;
      console.log(`   Found ${currentCount} SKUs so far...`);
    }
    
    previousCount = currentCount;
  }
  
  console.log(`\n✅ Extraction complete! Found ${skus.size} unique SKUs\n`);
  
  // Convert to sorted array
  const skuArray = Array.from(skus).sort();
  
  // Display results
  console.log('═'.repeat(80));
  console.log('Copy the JSON array below:\n');
  console.log(JSON.stringify(skuArray, null, 2));
  console.log('\n' + '═'.repeat(80));
  console.log(`\n📋 To save to file, run this in your terminal:`);
  console.log(`\ncat > /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco/temp-orphan-skus.json << 'EOF'`);
  console.log(JSON.stringify(skuArray, null, 2));
  console.log(`EOF\n`);
  
  // Also copy to clipboard if available
  try {
    await navigator.clipboard.writeText(JSON.stringify(skuArray, null, 2));
    console.log('✅ JSON array copied to clipboard!');
  } catch (e) {
    console.log('⚠️  Could not auto-copy to clipboard, please copy manually');
  }
  
  return skuArray;
})();

