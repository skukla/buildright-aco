/**
 * Source definitions for ACO Multi-Source Inventory (MSI)
 * Defines 6 inventory sources: 2 RDCs, 3 regional warehouses, 1 virtual drop shipper
 */

export const sourceDefinitions = [
  // Regional Distribution Centers (RDCs)
  {
    source_code: 'warehouse_west',
    name: 'Western RDC - Sacramento',
    country_id: 'US',
    postcode: '95814',
    enabled: true,
    region: 'US-West',
    city: 'Sacramento',
    region_id: 5, // California
    latitude: 38.5816,
    longitude: -121.4944,
    description: 'Western Regional Distribution Center serving Western US states',
    contact_name: 'West Coast Operations',
    email: 'warehouse.west@buildright.com',
    phone: '916-555-0100'
  },
  {
    source_code: 'warehouse_east',
    name: 'Eastern RDC - Charlotte',
    country_id: 'US',
    postcode: '28202',
    enabled: true,
    region: 'US-East',
    city: 'Charlotte',
    region_id: 33, // North Carolina
    latitude: 35.2271,
    longitude: -80.8431,
    description: 'Eastern Regional Distribution Center serving Eastern US states',
    contact_name: 'East Coast Operations',
    email: 'warehouse.east@buildright.com',
    phone: '704-555-0200'
  },

  // Regional Warehouses
  {
    source_code: 'warehouse_phoenix',
    name: 'Phoenix Metro Warehouse',
    country_id: 'US',
    postcode: '85001',
    enabled: true,
    region: 'US-Southwest',
    city: 'Phoenix',
    region_id: 3, // Arizona
    latitude: 33.4484,
    longitude: -112.0740,
    description: 'Regional warehouse serving Phoenix metro area and surrounding regions',
    contact_name: 'Phoenix Operations',
    email: 'warehouse.phoenix@buildright.com',
    phone: '602-555-0300'
  },
  {
    source_code: 'warehouse_denver',
    name: 'Denver Warehouse',
    country_id: 'US',
    postcode: '80202',
    enabled: true,
    region: 'US-Mountain',
    city: 'Denver',
    region_id: 6, // Colorado
    latitude: 39.7392,
    longitude: -104.9903,
    description: 'Regional warehouse serving Denver and Mountain states',
    contact_name: 'Denver Operations',
    email: 'warehouse.denver@buildright.com',
    phone: '303-555-0400'
  },
  {
    source_code: 'warehouse_atlanta',
    name: 'Atlanta Metro Warehouse',
    country_id: 'US',
    postcode: '30303',
    enabled: true,
    region: 'US-Southeast',
    city: 'Atlanta',
    region_id: 10, // Georgia
    latitude: 33.7490,
    longitude: -84.3880,
    description: 'Regional warehouse serving Atlanta metro and Southeast region',
    contact_name: 'Atlanta Operations',
    email: 'warehouse.atlanta@buildright.com',
    phone: '404-555-0500'
  },

  // Virtual Drop Shipper
  {
    source_code: 'dropship_premium_windows',
    name: 'Drop Shipper - Premium Window Systems',
    country_id: 'US',
    postcode: '00000',
    enabled: true,
    region: 'US-Virtual',
    city: null,
    region_id: null,
    latitude: null,
    longitude: null,
    description: 'Virtual drop shipper for premium window and door products',
    contact_name: 'Premium Windows Partnership',
    email: 'dropship@premiumwindows.com',
    phone: '800-555-0199'
  }
];

/**
 * Get source by source code
 * @param {string} sourceCode - The source code to lookup
 * @returns {Object|null} Source definition or null if not found
 */
export function getSourceByCode(sourceCode) {
  return sourceDefinitions.find(source => source.source_code === sourceCode) || null;
}

/**
 * Get all enabled sources
 * @returns {Array} Array of enabled source definitions
 */
export function getEnabledSources() {
  return sourceDefinitions.filter(source => source.enabled);
}

/**
 * Get physical warehouse sources (excludes virtual drop shippers)
 * @returns {Array} Array of physical warehouse sources
 */
export function getPhysicalWarehouses() {
  return sourceDefinitions.filter(source =>
    source.latitude !== null && source.longitude !== null
  );
}

/**
 * Get RDC sources (Regional Distribution Centers)
 * @returns {Array} Array of RDC sources
 */
export function getRDCs() {
  return sourceDefinitions.filter(source =>
    source.source_code === 'warehouse_west' || source.source_code === 'warehouse_east'
  );
}

/**
 * Get regional warehouse sources (excludes RDCs and drop shippers)
 * @returns {Array} Array of regional warehouse sources
 */
export function getRegionalWarehouses() {
  return sourceDefinitions.filter(source =>
    source.source_code.includes('warehouse_') &&
    !source.source_code.includes('_west') &&
    !source.source_code.includes('_east')
  );
}

/**
 * Get drop shipper sources
 * @returns {Array} Array of drop shipper sources
 */
export function getDropShippers() {
  return sourceDefinitions.filter(source => source.source_code.includes('dropship'));
}