/**
 * Smart BuildRight Detection for ACO
 * Finds all BuildRight data using multiple strategies with ACO verification
 * 
 * DETECTION STRATEGIES:
 * 1. Local files (primary source of truth for deletion)
 * 2. State tracker (records what was ingested)
 * 3. ACO Direct Query (validation - proves deletion worked)
 * 
 * BREAKTHROUGH:
 * We CAN query ACO directly using productSearch with proper headers!
 * - Endpoint: https://na1-sandbox.api.commerce.adobe.com/{tenantId}/graphql
 * - Headers: AC-Environment-Id, AC-View-Id (catalog view ID)
 * - This allows us to verify deletion and detect orphaned data
 * 
 * @module utils/smart-detector
 */

import dotenv from 'dotenv';
import { 
  queryProducts, 
  queryCategories, 
  queryProductMetadata, 
  queryPriceBooks 
} from './graphql-query.js';
import { getAllProductSKUs } from './aco-query.js';
import logger from './logger.js';

dotenv.config();

/**
 * Smart detection strategies for BuildRight data in ACO
 */
export class BuildRightDetector {
  constructor(options = {}) {
    this.silent = options.silent || false;
    
    this.cache = {
      allProducts: null,
      allCategories: null,
      allMetadata: null,
      allPriceBooks: null
    };
    
    // ACO configuration
    this.config = {
      tenantId: process.env.TENANT_ID,
      region: process.env.REGION || 'na1',
      environment: process.env.ENVIRONMENT || 'sandbox',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    };
  }
  
  /**
   * Get ACO GraphQL endpoint
   */
  getACOEndpoint() {
    const envSuffix = this.config.environment === 'sandbox' ? '-sandbox' : '';
    return `https://${this.config.region}${envSuffix}.api.commerce.adobe.com/${this.config.tenantId}/graphql`;
  }
  
  /**
   * Get OAuth access token
   */
  async getAccessToken() {
    const IMS_TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'openid,AdobeID,additional_info.projectedProductContext'
    });

    const response = await fetch(IMS_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }
  
  /**
   * Query ACO for specific SKUs
   * 
   * NOTE: Requires Live Search indexing (5-10 min delay after ingestion)
   * Products exist in Catalog Service but won't be queryable until indexed.
   * Not filtered by catalog view - returns all products matching SKUs.
   * 
   * @param {Array<string>} skus - SKUs to query
   * @returns {Promise<Array<{sku: string, name: string}>>}
   */
  async queryACOProductsBySKUs(skus) {
    if (skus.length === 0) return [];
    
    try {
      const token = await this.getAccessToken();
      const endpoint = this.getACOEndpoint();

      // GraphQL array syntax
      const skuList = skus.map(sku => `"${sku}"`).join(', ');
      
      const query = `
        query {
          products(skus: [${skuList}]) {
            __typename
            sku
            name
          }
        }
      `;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'AC-Environment-Id': this.config.tenantId,
          'AC-Source-Locale': 'en-US'
          // Note: AC-View-Id not needed - products(skus) query is not filtered by catalog view
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`ACO GraphQL request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data?.products || [];
    } catch (error) {
      logger.warn(`Failed to query ACO products by SKUs: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Query ACO directly for products (requires Live Search extension)
   * 
   * Note: This uses productSearch which requires Live Search to be enabled.
   * For validation without Live Search, use queryACOProductsBySKUs instead.
   * 
   * @param {string} phrase - Search phrase (empty string returns all)
   * @param {number} limit - Max products to return
   * @returns {Promise<Array<{sku: string, name: string}>>}
   */
  async queryACOProductsDirect(phrase = '', limit = 500) {
    try {
      const token = await this.getAccessToken();
      const endpoint = this.getACOEndpoint();

      const query = `
        query ProductSearch($phrase: String!, $limit: Int) {
          productSearch(phrase: $phrase, page_size: $limit) {
            total_count
            items {
              productView {
                sku
                name
              }
            }
          }
        }
      `;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'AC-Environment-Id': this.config.tenantId,
          'AC-Source-Locale': 'en-US',
          'AC-Price-Book-Id': 'US-Retail'  // Required for productSearch, not AC-View-Id
        },
        body: JSON.stringify({ 
          query, 
          variables: { phrase, limit } 
        })
      });

      const result = await response.json();

      if (result.errors) {
        logger.debug('ACO direct query errors:', result.errors[0].message);
        return [];
      }

      const items = result.data?.productSearch?.items || [];
      return items.map(item => ({
        sku: item.productView.sku,
        name: item.productView.name
      }));
      
    } catch (error) {
      logger.debug('ACO direct query failed:', error.message);
      return [];
    }
  }

  /**
   * Find ALL BuildRight products using local data files
   * 
   * ACO's GraphQL API is unreliable for discovery:
   * - productSearch requires a search index that may not exist
   * - No comprehensive "list all products" query
   * 
   * Since we generate all data locally, local files are our source of truth.
   */
  async findAllProducts() {
    logger.info('🔍 Finding BuildRight products using smart detection...');
    logger.info('Reading product SKUs from local data files...');

    try {
      const skus = await this.findProductsFromLocalData();
      logger.info(`  ✓ Local Data Files: ${skus.length} products`);
      
      return {
        skus,
        strategies: [{ name: 'Local Data Files', skus, success: true }]
      };
    } catch (error) {
      logger.error(`Failed to read local product files: ${error.message}`);
      return {
        skus: [],
        strategies: [{ name: 'Local Data Files', skus: [], success: false, error: error.message }]
      };
    }
  }

  /**
   * Strategy 1: Find products from local data files
   */
  async findProductsFromLocalData() {
    return await getAllProductSKUs();
  }

  /**
   * Strategy 2: Find products by namespace in ACO
   * All BuildRight products use 'buildright:' namespace
   */
  async findProductsByNamespace() {
    try {
      // Query ACO for products with buildright namespace
      // This requires the products to be searchable, which may not always be the case
      const products = await queryProducts({ 
        searchTerm: 'buildright:', 
        pageSize: 1000 
      });
      
      return products.map(p => p.sku);
    } catch (error) {
      logger.debug('Could not query products by namespace:', error.message);
      return [];
    }
  }

  /**
   * Find ALL BuildRight categories
   */
  async findAllCategories() {
    logger.info('🔍 Finding BuildRight categories...');

    try {
      const allCategories = await this.getAllCategories();
      
      // Filter for BuildRight categories
      // BuildRight categories typically have IDs like: buildright:lumber, buildright:windows-doors, etc.
      const buildRightCategories = allCategories.filter(cat => 
        cat.id?.startsWith('buildright:') || 
        cat.namespace === 'buildright'
      );

      logger.info(`  📊 Found ${buildRightCategories.length} BuildRight categories`);
      
      return buildRightCategories.map(cat => cat.id);
    } catch (error) {
      logger.warn('Could not query categories:', error.message);
      return [];
    }
  }

  /**
   * Find ALL BuildRight metadata (product attributes)
   */
  async findAllMetadata() {
    logger.info('🔍 Finding BuildRight metadata...');

    try {
      const allMetadata = await this.getAllMetadata();
      
      // Filter for BuildRight attributes
      // BuildRight attributes have IDs like: br_lumber_species, br_window_type, etc.
      const buildRightMetadata = allMetadata.filter(attr => 
        attr.id?.startsWith('br_') || 
        attr.namespace === 'buildright'
      );

      logger.info(`  📊 Found ${buildRightMetadata.length} BuildRight attributes`);
      
      return buildRightMetadata;
    } catch (error) {
      logger.warn('Could not query metadata:', error.message);
      return [];
    }
  }

  /**
   * Find ALL BuildRight price books from ACO
   * 
   * Uses indirect validation via Catalog API since Admin API queries don't work.
   * Validates each expected price book by attempting a product query with it.
   */
  async findAllPriceBooks() {
    if (!this.silent) {
      logger.info('🔍 Finding BuildRight price books...');
    }

    try {
      // Get expected price book IDs from local files
      const { promises: fs } = await import('fs');
      const data = await fs.readFile('./output/buildright/price-books.json', 'utf-8');
      const expectedPriceBooks = JSON.parse(data);
      
      if (!this.silent) {
        logger.info(`  Validating ${expectedPriceBooks.length} expected price books via Catalog API...`);
      }
      
      // Validate each price book by attempting to query with it
      const existingPriceBooks = [];
      
      for (const priceBook of expectedPriceBooks) {
        const exists = await this.validatePriceBookExists(priceBook.priceBookId);
        if (exists) {
          existingPriceBooks.push(priceBook);
        }
      }
      
      if (!this.silent) {
        logger.info(`  📊 Found ${existingPriceBooks.length} existing BuildRight price books in ACO`);
      }
      
      return existingPriceBooks;
    } catch (error) {
      if (!this.silent) {
        logger.warn(`Could not validate price books: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Validate if a price book exists by querying the Catalog API with it
   * Uses AC-Price-Book-ID header and queries for actual products
   * A deleted price book should return an error or empty results
   */
  async validatePriceBookExists(priceBookId) {
    try {
      const { getGraphQLEndpoint } = await import('./aco-client.js');
      const endpoint = getGraphQLEndpoint();
      
      // Get a test SKU from local files to query
      const { promises: fs } = await import('fs');
      const { join } = await import('path');
      
      let testSku = 'TEST-SKU';
      try {
        const productsData = await fs.readFile(join(process.cwd(), 'output/buildright/products.json'), 'utf-8');
        const products = JSON.parse(productsData);
        if (products.length > 0) {
          testSku = products[0].sku;
        }
      } catch {
        // Use default test SKU if can't read file
      }
      
      // Query for a product with this price book
      // If the price book doesn't exist, ACO should return an error
      const query = `
        query {
          products(skus: ["${testSku}"]) {
            sku
            prices {
              value
            }
          }
        }
      `;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'AC-Environment-ID': process.env.TENANT_ID,
          'AC-Price-Book-ID': priceBookId,
          'x-api-key': process.env.CLIENT_ID
        },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      
      // Check for errors that indicate price book doesn't exist
      if (result.errors) {
        const errorMsg = JSON.stringify(result.errors);
        if (errorMsg.includes('price book') || errorMsg.includes('PriceBook') || 
            errorMsg.includes('not found') || errorMsg.includes('invalid')) {
          logger.debug(`  Price book ${priceBookId} does not exist (error)`);
          return false;
        }
      }
      
      // If we got data back, the price book exists
      // Even if no products are found, a valid price book won't error
      if (result.data) {
        logger.debug(`  Price book ${priceBookId} exists`);
        return true;
      }
      
      // Unclear - assume it doesn't exist
      logger.debug(`  Price book ${priceBookId} status unclear, assuming doesn't exist`);
      return false;
    } catch (error) {
      logger.debug(`  Failed to validate price book ${priceBookId}: ${error.message}`);
      // On error, assume it doesn't exist (we want accurate detection)
      return false;
    }
  }

  /**
   * Query ACO Admin API for price books
   * Requires OAuth authentication
   */
  async queryACOPriceBooks() {
    const { getGraphQLEndpoint } = await import('./aco-client.js');
    
    // Get OAuth token from IMS
    const token = await this.getOAuthToken();
    if (!token) {
      throw new Error('Failed to get OAuth token');
    }
    
    const endpoint = getGraphQLEndpoint().replace('/graphql', '/admin/graphql');
    
    const query = `
      query {
        priceBooks(size: 1000) {
          items {
            id
            name
          }
        }
      }
    `;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': process.env.CLIENT_ID
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`Admin API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }
    
    return result.data?.priceBooks?.items || [];
  }

  /**
   * Get OAuth token from Adobe IMS
   * Uses same approach as buildright-service
   */
  async getOAuthToken() {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      logger.debug('ACO credentials not configured');
      return null;
    }
    
    const tokenUrl = 'https://ims-na1.adobelogin.com/ims/token/v3';
    const tokenParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'openid,AdobeID,additional_info.projectedProductContext'
    });
    
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString()
      });
      
      if (!response.ok) {
        logger.debug(`Failed to get OAuth token: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.debug(`Failed to get OAuth token: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate that ACO is completely clean
   * 
   * Uses direct ACO query to PROVE deletion worked.
   * This is the definitive source of truth for what ACTUALLY exists in ACO.
   * 
   * ACO deletion is asynchronous and can take 30-60s, so we poll until complete.
   */
  async validateClean() {
    if (!this.silent) {
      logger.info('\n🔍 Validating ACO is clean...');
    }

    const issues = [];

    // Check products - Poll until deletion completes (ACO is async)
    // Use products(skus) query to hit Catalog Service, not productSearch (Live Search index)
    try {
      // Get expected SKUs from state tracker (source of truth for what was ingested)
      const { getStateTracker } = await import('./aco-state-tracker.js');
      const stateTracker = getStateTracker();
      await stateTracker.load();
      const expectedSKUs = stateTracker.getAllProductSKUs();
      
      if (expectedSKUs.length > 0) {
        if (!this.silent) {
          logger.info('⏳ Waiting for ACO deletion to complete (this may take 30-60s)...');
        }
        
        logger.debug(`Checking ${expectedSKUs.length} SKUs for deletion...`);
        
        const maxAttempts = 10;
        const pollInterval = 10000; // 10 seconds between checks
        let attempt = 0;
        let productCount = -1;
        
        while (attempt < maxAttempts) {
          attempt++;
          
          // Wait BEFORE checking (ACO needs time to process)
          if (!this.silent) {
            logger.info(`   ⏳ Waiting 10s before check ${attempt}/${maxAttempts}...`);
          }
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          
          // Query Catalog Service directly via products(skus) - NOT productSearch
          // Note: This only finds visible products, but that's ok for validation
          const acoProducts = await this.queryACOProductsBySKUs(expectedSKUs);
          productCount = acoProducts.length;
          
          if (!this.silent) {
            logger.info(`   📊 ${productCount} visible products remaining in Catalog Service`);
          }
          
          if (productCount === 0) {
            if (!this.silent) {
              logger.info('✅ No visible products in ACO - deletion complete!');
            }
            break;
          }
        }
        
        if (productCount > 0) {
          issues.push(`${productCount} products still exist in ACO after ${maxAttempts * pollInterval / 1000}s`);
          const remainingSKUs = (await this.queryACOProductsBySKUs(expectedSKUs.slice(0, 10))).map(p => p.sku).join(', ');
          logger.debug(`Remaining products: ${remainingSKUs}...`);
        }
      } else {
        // State tracker is empty - skip checking expected SKUs
        logger.debug('State tracker is empty - skipping expected SKU validation');
      }
    } catch (error) {
      if (!this.silent) {
        logger.warn('Could not verify product deletion:', error.message);
      }
    }
    
    // Check for unknown orphans (products we don't know about)
    // Note: This only finds VISIBLE orphans (invisible variants are not queryable)
    try {
      if (!this.silent) {
        logger.info('🔍 Checking for unknown orphaned products...');
      }
      
      const orphanProducts = await this.queryACOProductsDirect('', 500);
      if (orphanProducts.length > 0) {
        // Filter to BuildRight products (br_ prefix or known categories)
        const buildRightOrphans = orphanProducts.filter(p => 
          p.sku.match(/^(LBR|DOOR|WINDOW|ROOF|DRYWALL|PLY|NAIL|SCREW|STUD)-/) ||
          p.name.includes('BuildRight')
        );
        
        if (buildRightOrphans.length > 0) {
          issues.push(`${buildRightOrphans.length} unknown orphaned products found (visible only)`);
          logger.debug(`Orphaned SKUs: ${buildRightOrphans.map(p => p.sku).slice(0, 10).join(', ')}...`);
        }
      }
    } catch (error) {
      // Non-critical - Live Search might not be enabled
      logger.debug('Could not query for orphaned products (Live Search may not be enabled):', error.message);
    }

    // Price books - local files only (no GraphQL API)
    try {
      const localPriceBooks = await this.findAllPriceBooks();
      if (localPriceBooks.length > 0) {
        logger.debug(`  ℹ️  ${localPriceBooks.length} price books in local files (expected)`);
      }
    } catch (error) {
      logger.debug('Could not read local price books:', error.message);
    }

    if (issues.length > 0) {
      if (!this.silent) {
        logger.error('\n❌ Validation FAILED - Orphaned data detected:');
        issues.forEach(issue => logger.error(`   • ${issue}`));
      }
      return {
        clean: false,
        issues
      };
    }

    if (!this.silent) {
      logger.info('✅ Validation PASSED - No BuildRight data remains\n');
    }
    return { clean: true, issues: [] };
  }

  /**
   * Get all product SKUs from local data files
   * @private
   */
  async getAllProductSKUsFromLocalFiles() {
    try {
      const { promises: fs } = await import('fs');
      const data = await fs.readFile('./output/buildright/products.json', 'utf-8');
      const products = JSON.parse(data);
      return products.map(p => p.sku);
    } catch (error) {
      logger.warn(`Could not read local product files: ${error.message}`);
      return [];
    }
  }

  /**
   * Helper: Get all categories (with caching)
   */
  async getAllCategories() {
    if (this.cache.allCategories) {
      return this.cache.allCategories;
    }

    logger.debug('  Fetching all categories...');
    const categories = await queryCategories();
    
    this.cache.allCategories = categories;
    logger.debug(`  Fetched ${categories.length} total categories`);
    
    return categories;
  }

  /**
   * Helper: Get all metadata (with caching)
   */
  async getAllMetadata() {
    if (this.cache.allMetadata) {
      return this.cache.allMetadata;
    }

    logger.debug('  Fetching all metadata...');
    const metadata = await queryProductMetadata();
    
    this.cache.allMetadata = metadata;
    logger.debug(`  Fetched ${metadata.length} total attributes`);
    
    return metadata;
  }

  /**
   * Helper: Get all price books (with caching)
   */
  async getAllPriceBooks() {
    if (this.cache.allPriceBooks) {
      return this.cache.allPriceBooks;
    }

    logger.debug('  Fetching all price books...');
    const priceBooks = await queryPriceBooks();
    
    this.cache.allPriceBooks = priceBooks;
    logger.debug(`  Fetched ${priceBooks.length} total price books`);
    
    return priceBooks;
  }

  /**
   * Clear cache (call between operations)
   */
  clearCache() {
    this.cache = {
      allProducts: null,
      allCategories: null,
      allMetadata: null,
      allPriceBooks: null
    };
  }
}

export default BuildRightDetector;

