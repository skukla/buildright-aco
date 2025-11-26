/**
 * Add Products for Sarah's Template Configurator
 * Adds missing product categories: flooring, fixtures, siding, paint, insulation, drywall
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../data/buildright');
const PRODUCTS_FILE = path.join(DATA_PATH, 'products.json');

// Load existing products
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));

console.log(`📦 Current product count: ${products.length}`);
console.log('🚀 Adding new products for Sarah\'s use case...\n');

const newProducts = [];

// Helper function to create product
function createProduct(sku, name, description, category, phase, tier, brand = 'BuildRight Pro') {
  return {
    sku,
    source: { locale: 'en-US' },
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    status: 'ENABLED',
    visibleIn: ['CATALOG', 'SEARCH'],
    attributes: [
      { code: 'product_category', values: [category] },
      { code: 'construction_phase', values: [phase] },
      { code: 'quality_tier', values: [tier] },
      { code: 'brand', values: [brand] },
      { code: 'unit_of_measure', values: ['EA'] },
      { code: 'project_types', values: ['new_construction'] }
    ],
    metaTags: {
      title: `${name} | BuildRight`,
      description: `Shop ${name}. Quality construction materials from BuildRight.`,
      keywords: [category, brand, tier]
    }
  };
}

// ============================================================================
// FLOORING (8 products)
// ============================================================================
console.log('🏠 Adding Flooring Products...');

newProducts.push(
  createProduct(
    'FLOOR-VINYL-LUX-OAK',
    'Luxury Vinyl Plank - Oak Finish',
    'Durable luxury vinyl plank flooring with realistic oak wood grain. Water-resistant, scratch-resistant, and easy to install. Perfect for high-traffic areas. 36" x 6" planks, 20 sq ft per carton.',
    'flooring',
    'interior_finish',
    'builder_grade',
    'FloorMaster'
  ),
  createProduct(
    'FLOOR-CARPET-STAND',
    'Standard Carpet - Beige Neutral',
    'Soft, stain-resistant carpet ideal for bedrooms and living areas. Neutral beige color complements any decor. 12 ft wide, sold per linear foot.',
    'flooring',
    'interior_finish',
    'builder_grade',
    'ComfortStep'
  ),
  createProduct(
    'FLOOR-HARDWOOD-OAK',
    'Engineered Hardwood - Red Oak',
    'Premium engineered hardwood flooring with 3mm wear layer. Pre-finished red oak with satin finish. 5" wide planks, 20 sq ft per carton.',
    'flooring',
    'interior_finish',
    'premium',
    'NatureWood'
  ),
  createProduct(
    'FLOOR-TILE-CERAMIC-12',
    'Ceramic Floor Tile - 12x12 Neutral',
    'Glazed ceramic tile perfect for kitchens, bathrooms, and entryways. Neutral color palette, easy to clean. 12" x 12", 15 sq ft per carton.',
    'flooring',
    'interior_finish',
    'premium',
    'TilePro'
  ),
  createProduct(
    'FLOOR-VINYL-PREMIUM',
    'Premium Vinyl Plank - Gray Stone Look',
    'High-end vinyl plank with stone appearance. Enhanced wear layer for commercial-grade durability. 48" x 9" planks, 22 sq ft per carton.',
    'flooring',
    'interior_finish',
    'premium',
    'FloorMaster Elite'
  ),
  createProduct(
    'FLOOR-HARDWOOD-WALNUT',
    'Solid Hardwood - Black Walnut',
    'Exotic solid hardwood flooring in rich black walnut. Site-finished for custom color options. 3/4" thick, 5" wide, 20 sq ft per carton.',
    'flooring',
    'interior_finish',
    'luxury',
    'Exotic Woods Collection'
  ),
  createProduct(
    'FLOOR-TILE-PORCELAIN-24',
    'Porcelain Tile - 24x24 Marble Look',
    'Large format porcelain tile with realistic marble veining. Rectified edges for minimal grout lines. 24" x 24", 16 sq ft per carton.',
    'flooring',
    'interior_finish',
    'luxury',
    'TilePro Prestige'
  ),
  createProduct(
    'FLOOR-CARPET-PREMIUM',
    'Premium Carpet - Neutral Luxury',
    'Ultra-soft premium carpet with superior stain resistance. Neutral tone with subtle pattern. 12 ft wide, sold per linear foot.',
    'flooring',
    'interior_finish',
    'luxury',
    'ComfortStep Prestige'
  )
);

console.log(`✅ Added ${8} flooring products\n`);

// ============================================================================
// FIXTURES - PLUMBING (6 products)
// ============================================================================
console.log('🚰 Adding Plumbing Fixture Products...');

newProducts.push(
  createProduct(
    'PLUMB-FAUCET-KIT-CHROME',
    'Kitchen Faucet - Chrome Single Handle',
    'Standard kitchen faucet with pull-down spray. Chrome finish, ADA compliant. Includes deck plate and supply lines.',
    'plumbing_fixtures',
    'interior_finish',
    'builder_grade',
    'AquaFlow'
  ),
  createProduct(
    'PLUMB-FAUCET-BATH-CHROME',
    'Bathroom Faucet - Chrome 4" Centerset',
    'Basic bathroom faucet with pop-up drain assembly. Chrome finish, water-saving aerator. 4" centerset installation.',
    'plumbing_fixtures',
    'interior_finish',
    'builder_grade',
    'AquaFlow'
  ),
  createProduct(
    'PLUMB-FAUCET-KIT-BRUSH',
    'Kitchen Faucet - Brushed Nickel Commercial Style',
    'Premium commercial-style kitchen faucet with spring spout. Brushed nickel finish, magnetic docking. Lifetime warranty.',
    'plumbing_fixtures',
    'interior_finish',
    'premium',
    'Moen'
  ),
  createProduct(
    'PLUMB-FAUCET-BATH-BRUSH',
    'Bathroom Faucet - Brushed Nickel Widespread',
    'Elegant widespread bathroom faucet with lever handles. Brushed nickel finish, ceramic disc valves. 8" widespread.',
    'plumbing_fixtures',
    'interior_finish',
    'premium',
    'Moen'
  ),
  createProduct(
    'PLUMB-FAUCET-KIT-DELTA',
    'Kitchen Faucet - Delta Touch2O Technology',
    'Premium Delta kitchen faucet with Touch2O activation. Hands-free operation, MagnaTite docking. Available in multiple finishes.',
    'plumbing_fixtures',
    'interior_finish',
    'luxury',
    'Delta'
  ),
  createProduct(
    'PLUMB-FAUCET-BATH-KOHLER',
    'Bathroom Faucet - Kohler Artifacts Collection',
    'Designer bathroom faucet from Kohler Artifacts line. Victorian-inspired design, premium finishes. Widespread installation.',
    'plumbing_fixtures',
    'interior_finish',
    'luxury',
    'Kohler'
  )
);

console.log(`✅ Added ${6} plumbing fixture products\n`);

// ============================================================================
// FIXTURES - LIGHTING (6 products)
// ============================================================================
console.log('💡 Adding Lighting Fixture Products...');

newProducts.push(
  createProduct(
    'LIGHT-CEILING-FLUSH',
    'Flush Mount Ceiling Light - Basic White',
    'Standard flush mount ceiling fixture with frosted glass. White finish, uses one 60W bulb or LED equivalent. 13" diameter.',
    'lighting_fixtures',
    'interior_finish',
    'builder_grade',
    'BrightHome'
  ),
  createProduct(
    'LIGHT-RECESSED-4IN',
    'Recessed Can Light - 4" Standard',
    'New construction recessed housing for 4" trim. IC-rated for insulation contact. Compatible with LED retrofit kits.',
    'lighting_fixtures',
    'interior_finish',
    'builder_grade',
    'BrightHome'
  ),
  createProduct(
    'LIGHT-CEILING-SEMI',
    'Semi-Flush Ceiling Light - Brushed Nickel',
    'Semi-flush mount with fabric drum shade. Brushed nickel finish, uses two 100W bulbs. 15" diameter, modern transitional style.',
    'lighting_fixtures',
    'interior_finish',
    'premium',
    'Progress Lighting'
  ),
  createProduct(
    'LIGHT-RECESSED-6IN-LED',
    'LED Recessed Downlight - 6" Integrated',
    'Integrated LED recessed downlight, 90 CRI, dimmable. Energy Star rated, 15W/1100 lumens. 50,000 hour lifespan.',
    'lighting_fixtures',
    'interior_finish',
    'premium',
    'Halo'
  ),
  createProduct(
    'LIGHT-CHANDELIER-DINING',
    'Dining Chandelier - Modern 5-Light',
    'Contemporary 5-light chandelier with geometric design. Black and brass finish, adjustable height. 24" diameter.',
    'lighting_fixtures',
    'interior_finish',
    'luxury',
    'Kichler'
  ),
  createProduct(
    'LIGHT-PENDANT-ISLAND',
    'Kitchen Island Pendant Set - 3 Glass Globes',
    'Set of 3 coordinating glass globe pendants for kitchen island. Adjustable cord length, hardwired installation. Modern farmhouse style.',
    'lighting_fixtures',
    'interior_finish',
    'luxury',
    'Kichler'
  )
);

console.log(`✅ Added ${6} lighting fixture products\n`);

// ============================================================================
// SIDING (6 products)
// ============================================================================
console.log('🏘️  Adding Siding Products...');

newProducts.push(
  createProduct(
    'SIDING-VINYL-STANDARD',
    'Vinyl Siding - Standard Profile',
    'Standard vinyl siding with Dutch lap profile. 0.040" thickness, fade-resistant color. 12 ft length, 10" exposure, 1 square per carton.',
    'siding',
    'envelope',
    'builder_grade',
    'CertainTeed'
  ),
  createProduct(
    'SIDING-FIBER-SMOOTH',
    'Fiber Cement Siding - Smooth Lap',
    'Fiber cement lap siding with smooth finish. Primed for painting, non-combustible. 12 ft length, 8.25" exposure, 16 pieces per bundle.',
    'siding',
    'envelope',
    'builder_grade',
    'James Hardie'
  ),
  createProduct(
    'SIDING-FIBER-WOOD',
    'Fiber Cement Siding - Cedar Texture',
    'Fiber cement with realistic cedar wood grain texture. ColorPlus pre-finished available. 12 ft length, 7.25" exposure.',
    'siding',
    'envelope',
    'premium',
    'James Hardie'
  ),
  createProduct(
    'SIDING-STUCCO-STANDARD',
    'Stucco System - 3-Coat Traditional',
    'Traditional 3-coat stucco system with metal lath. Includes scratch coat, brown coat, and finish coat materials. Covers 100 sq ft.',
    'siding',
    'envelope',
    'premium',
    'LaHabra'
  ),
  createProduct(
    'SIDING-STONE-VENEER',
    'Natural Stone Veneer - Stacked Ledge',
    'Natural stone veneer in stacked ledgestone pattern. Irregular earth tones, thin-cut for easy installation. 10 sq ft per carton.',
    'siding',
    'envelope',
    'luxury',
    'Eldorado Stone'
  ),
  createProduct(
    'SIDING-STUCCO-PREMIUM',
    'Premium Stucco System - Acrylic Finish',
    'Premium synthetic stucco with acrylic finish coat. Superior crack resistance, wider color palette. Self-cleaning properties. Covers 100 sq ft.',
    'siding',
    'envelope',
    'luxury',
    'Parex USA'
  )
);

console.log(`✅ Added ${6} siding products\n`);

// ============================================================================
// PAINT (6 products)
// ============================================================================
console.log('🎨 Adding Paint Products...');

newProducts.push(
  createProduct(
    'PAINT-INT-FLAT-WHT',
    'Interior Paint - Flat White 5 Gallon',
    'Interior flat white ceiling and wall paint. Low VOC, good hide formula. Washable finish. 5 gallon pail covers ~2000 sq ft.',
    'paint',
    'interior_finish',
    'builder_grade',
    'Behr'
  ),
  createProduct(
    'PAINT-INT-EGGSHELL-BG',
    'Interior Paint - Eggshell Neutral Beige 5 Gallon',
    'Interior eggshell paint in neutral beige. Scrubbable finish, low odor. 5 gallon pail covers ~2000 sq ft.',
    'paint',
    'interior_finish',
    'builder_grade',
    'Behr'
  ),
  createProduct(
    'PAINT-INT-SATIN-SW',
    'Sherwin Williams Interior Satin - 5 Gallon',
    'Premium interior paint with satin sheen. Excellent durability and stain resistance. Custom tint to any SW color. 5 gallon pail.',
    'paint',
    'interior_finish',
    'premium',
    'Sherwin Williams'
  ),
  createProduct(
    'PAINT-EXT-SATIN-SW',
    'Sherwin Williams Exterior Satin - 5 Gallon',
    'Premium exterior paint with satin finish. Weather-resistant, mildew-resistant. Custom tint available. 5 gallon pail.',
    'paint',
    'envelope',
    'premium',
    'Sherwin Williams'
  ),
  createProduct(
    'PAINT-INT-BENJAMIN',
    'Benjamin Moore Aura Interior - 5 Gallon',
    'Luxury interior paint with Color Lock technology. Zero VOC, exceptional coverage and durability. Custom color matching. 5 gallon pail.',
    'paint',
    'interior_finish',
    'luxury',
    'Benjamin Moore'
  ),
  createProduct(
    'PAINT-EXT-BENJAMIN',
    'Benjamin Moore Aura Exterior - 5 Gallon',
    'Premium exterior paint with superior fade resistance. Self-priming, low temperature application. Custom colors available. 5 gallon pail.',
    'paint',
    'envelope',
    'luxury',
    'Benjamin Moore'
  )
);

console.log(`✅ Added ${6} paint products\n`);

// ============================================================================
// INSULATION & DRYWALL (6 products)
// ============================================================================
console.log('🧱 Adding Insulation & Drywall Products...');

newProducts.push(
  createProduct(
    'INSUL-FIBERGLASS-R15',
    'Fiberglass Insulation - R-15 15" x 93"',
    'Unfaced fiberglass batt insulation R-15 value. For 2x4 walls, 15" width, 93" length. 10 batts per bag, covers 116 sq ft.',
    'insulation',
    'envelope',
    'builder_grade',
    'Owens Corning'
  ),
  createProduct(
    'DRYWALL-HALF-4X8',
    'Drywall Sheet - 1/2" x 4\' x 8\'',
    'Standard 1/2" gypsum drywall panel. Tapered edges for seamless finishing. Fire-resistant, 4\' x 8\' sheet.',
    'framing_drywall',
    'interior_finish',
    'builder_grade',
    'USG'
  ),
  createProduct(
    'INSUL-FIBERGLASS-R30',
    'Fiberglass Insulation - R-30 24" x 48"',
    'Kraft-faced fiberglass batt insulation R-30 value. For attics and ceilings, 24" width, 48" length. 8 batts per bag, covers 64 sq ft.',
    'insulation',
    'envelope',
    'premium',
    'Owens Corning'
  ),
  createProduct(
    'DRYWALL-HALF-4X12',
    'Drywall Sheet - 1/2" x 4\' x 12\'',
    'Standard 1/2" gypsum drywall panel, 12 ft length. Reduces seams, tapered edges. Fire-resistant, 4\' x 12\' sheet.',
    'framing_drywall',
    'interior_finish',
    'premium',
    'USG'
  ),
  createProduct(
    'INSUL-SPRAY-FOAM',
    'Spray Foam Insulation Kit - 600 Board Feet',
    'Closed-cell spray foam insulation kit. R-6 per inch, air and moisture barrier. Professional-grade, 600 board feet coverage.',
    'insulation',
    'envelope',
    'luxury',
    'BASF'
  ),
  createProduct(
    'DRYWALL-MOISTURE',
    'Moisture-Resistant Drywall - 1/2" x 4\' x 8\'',
    'Green board moisture-resistant drywall for bathrooms and kitchens. Mold-resistant core, 1/2" x 4\' x 8\' panel.',
    'framing_drywall',
    'interior_finish',
    'luxury',
    'USG Sheetrock'
  )
);

console.log(`✅ Added ${6} insulation & drywall products\n`);

// ============================================================================
// SAVE TO FILE
// ============================================================================
const totalNew = newProducts.length;
const allProducts = [...products, ...newProducts];

console.log('='.repeat(80));
console.log(`📊 SUMMARY`);
console.log(`   Original products: ${products.length}`);
console.log(`   New products:      ${totalNew}`);
console.log(`   Total products:    ${allProducts.length}`);
console.log('='.repeat(80));

// Backup original file
const backupFile = PRODUCTS_FILE + '.backup-' + Date.now();
fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
console.log(`\n💾 Backup created: ${backupFile}`);

// Write updated products
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2));
console.log(`✅ Updated: ${PRODUCTS_FILE}`);
console.log(`\n🎉 Successfully added ${totalNew} products for Sarah's template configurator!`);

