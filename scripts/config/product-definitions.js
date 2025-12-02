/**
 * Product definitions for BuildRight ACO product generation
 * Defines templates for 120 base products across 5 categories
 */

export const BRANDS = [
  'BuildRight Pro',
  'StructureMaster',
  'ProFrame',
  'SafeGuard',
  'FastenPro',
  'DuraBuilt',
  'ToughGrip',
  'MaxStrength',
  'PremiumBuild',
  'ReliaBuild'
];

export const UNITS_OF_MEASURE = [
  'EA',      // Each
  'LF',      // Linear Foot
  'SF',      // Square Foot
  'BOX',     // Box
  'BUNDLE',  // Bundle
  'PALLET',  // Pallet
  'BAG',     // Bag
  'ROLL',    // Roll
  'PAIR',    // Pair
  'SHEET',   // Sheet
  'GALLON',  // Gallon
  'CASE',    // Case
  'CY',      // Cubic Yard
  'SQ',      // Square (100 sqft)
  'SY',      // Square Yard
  'BUCKET',  // Bucket (5-gallon)
  'TON'      // Ton (HVAC capacity)
];

// Product categories with their products (12 simple + 4 configurable + 2 service per category)
export const PRODUCT_CATEGORIES = {
  structural: {
    name: 'Structural Materials',
    attributeValue: 'structural_materials',
    subcategories: {
      lumber: {
        simple: [
          { 
            name: '2x4 Stud - 8ft', 
            uom: 'EA', 
            priceRange: [8, 12],
            construction_phase: ['foundation_framing'],
            quality_tier: 'builder_grade',
            lumber_dimension: '2x4',
            lumber_length: '8ft',
            deck_compatible: true,
            deck_shape: ['rectangular', 'l_shaped'],
            deck_material_type: 'wood',
            store_velocity_category: 'high',
            recommended_restock_quantity: 100,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: '2x6 Stud - 8ft', 
            uom: 'EA', 
            priceRange: [12, 16],
            construction_phase: ['foundation_framing'],
            quality_tier: 'builder_grade',
            lumber_dimension: '2x6',
            lumber_length: '8ft',
            deck_compatible: true,
            deck_shape: ['rectangular', 'l_shaped'],
            deck_material_type: 'wood',
            store_velocity_category: 'high',
            recommended_restock_quantity: 75,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: '2x8 Joist - 10ft', 
            uom: 'EA', 
            priceRange: [18, 24],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            lumber_dimension: '2x8',
            lumber_length: '10ft',
            deck_compatible: true,
            deck_shape: ['rectangular', 'l_shaped'],
            deck_material_type: 'wood',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 50,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: '2x10 Joist - 12ft', 
            uom: 'EA', 
            priceRange: [24, 32],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            lumber_dimension: '2x10',
            lumber_length: '12ft',
            deck_compatible: true,
            deck_shape: ['rectangular', 'l_shaped'],
            deck_material_type: 'wood',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 40,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: '2x12 Beam - 16ft', 
            uom: 'EA', 
            priceRange: [36, 48],
            construction_phase: ['foundation_framing'],
            quality_tier: 'premium',
            deck_compatible: false,
            store_velocity_category: 'low',
            recommended_restock_quantity: 20,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: '4x4 Post - 8ft', 
            uom: 'EA', 
            priceRange: [28, 36],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            deck_compatible: true,
            deck_shape: ['rectangular', 'l_shaped'],
            deck_material_type: 'wood',
            deck_railing_compatible: ['wood'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 30,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: [
          {
            name: 'Dimensional Lumber',
            dimensions: {
              depth: ['1.75', '3.5', '5.5'],
              width: ['5.5', '7.25', '9.25', '11.25'],
              length: ['8', '10', '12', '16', '20']
            }
          },
          {
            name: 'LVL Beam',
            dimensions: {
              depth: ['1.75', '3.5'],
              width: ['9.25', '11.875', '14'],
              length: ['12', '16', '20', '24']
            }
          }
        ]
      },
      plywood: {
        simple: [
          { 
            name: 'OSB Sheathing 7/16" - 4x8', 
            uom: 'SHEET', 
            priceRange: [18, 24],
            construction_phase: ['foundation_framing'],
            quality_tier: 'builder_grade',
            lumber_dimension: '4x8',
            sheathing_location: 'roof',
            deck_compatible: false,
            store_velocity_category: 'high',
            recommended_restock_quantity: 50,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'CDX Plywood 1/2" - 4x8', 
            uom: 'SHEET', 
            priceRange: [28, 36],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            deck_compatible: false,
            store_velocity_category: 'high',
            recommended_restock_quantity: 40,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'T&G Subfloor 3/4" - 4x8', 
            uom: 'SHEET', 
            priceRange: [38, 48],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            lumber_dimension: '4x8',
            deck_compatible: false,
            store_velocity_category: 'medium',
            recommended_restock_quantity: 30,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Marine Plywood 3/4" - 4x8', 
            uom: 'SHEET', 
            priceRange: [68, 88],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            deck_compatible: true,
            deck_material_type: 'wood',
            store_velocity_category: 'low',
            recommended_restock_quantity: 10,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Hardwood Plywood 1/4" - 4x8', 
            uom: 'SHEET', 
            priceRange: [48, 62],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            flooring_material: 'hardwood',
            package_tier: ['best'],
            room_category: 'surfaces',
            store_velocity_category: 'low',
            recommended_restock_quantity: 15,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Siding Panel 3/8" - 4x8', 
            uom: 'SHEET', 
            priceRange: [32, 42],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            deck_compatible: false,
            store_velocity_category: 'medium',
            recommended_restock_quantity: 25,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: [
          {
            name: 'Plywood Sheet',
            dimensions: {
              thickness: ['0.25', '0.375', '0.5', '0.75', '1'],
              width: ['4'],
              length: ['8', '10']
            }
          },
          {
            name: 'OSB Panel',
            dimensions: {
              thickness: ['0.4375', '0.5', '0.625', '0.75'],
              width: ['4'],
              length: ['8', '9', '10']
            }
          }
        ]
      },
      services: [
        { name: 'Structural Material Delivery', priceRange: [75, 150] },
        { name: 'Lumber Cutting Service', priceRange: [50, 100] }
      ]
    }
  },
  framing: {
    name: 'Framing & Drywall',
    attributeValue: 'framing_drywall',
    subcategories: {
      studs: {
        simple: [
          { 
            name: 'Metal Stud 20ga - 3.5" x 10ft', 
            uom: 'EA', 
            priceRange: [8, 12],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 50,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Metal Stud 20ga - 6" x 10ft', 
            uom: 'EA', 
            priceRange: [12, 16],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 40,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Metal Track 20ga - 3.5" x 10ft', 
            uom: 'EA', 
            priceRange: [9, 13],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 45,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Metal Track 20ga - 6" x 10ft', 
            uom: 'EA', 
            priceRange: [13, 17],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 35,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Steel C-Channel - 8ft', 
            uom: 'EA', 
            priceRange: [18, 24],
            construction_phase: ['foundation_framing'],
            quality_tier: 'premium',
            store_velocity_category: 'low',
            recommended_restock_quantity: 20,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Hat Channel - 12ft', 
            uom: 'EA', 
            priceRange: [14, 18],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            store_velocity_category: 'low',
            recommended_restock_quantity: 25,
            typical_days_supply: 30,
            restock_priority: 'low'
          }
        ],
        configurable: [
          {
            name: 'Metal Stud System',
            dimensions: {
              gauge: ['20', '18', '16'],
              width: ['2.5', '3.5', '6'],
              length: ['8', '10', '12']
            }
          },
          {
            name: 'Steel Framing Track',
            dimensions: {
              gauge: ['20', '18'],
              width: ['3.5', '6', '8'],
              length: ['10', '12']
            }
          }
        ]
      },
      drywall: {
        simple: [
          { 
            name: 'Drywall 1/2" - 4x8', 
            uom: 'SHEET', 
            priceRange: [12, 16],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            drywall_thickness: '0.5',
            package_tier: ['good', 'better'],
            room_category: 'surfaces',
            store_velocity_category: 'high',
            recommended_restock_quantity: 60,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Drywall 5/8" - 4x8', 
            uom: 'SHEET', 
            priceRange: [14, 18],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better', 'best'],
            room_category: 'surfaces',
            store_velocity_category: 'high',
            recommended_restock_quantity: 50,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Moisture Resistant Drywall - 4x8', 
            uom: 'SHEET', 
            priceRange: [18, 24],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better', 'best'],
            room_category: 'surfaces',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 30,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Fire Rated Drywall - 4x8', 
            uom: 'SHEET', 
            priceRange: [22, 28],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'surfaces',
            store_velocity_category: 'low',
            recommended_restock_quantity: 20,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Cement Board 1/2" - 3x5', 
            uom: 'SHEET', 
            priceRange: [16, 20],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better', 'best'],
            room_category: 'surfaces',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 25,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Sound Dampening Drywall - 4x8', 
            uom: 'SHEET', 
            priceRange: [28, 36],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'surfaces',
            store_velocity_category: 'low',
            recommended_restock_quantity: 15,
            typical_days_supply: 30,
            restock_priority: 'low'
          }
        ],
        configurable: [
          {
            name: 'Gypsum Board',
            dimensions: {
              thickness: ['0.375', '0.5', '0.625'],
              width: ['4'],
              length: ['8', '10', '12']
            }
          },
          {
            name: 'Specialty Drywall',
            dimensions: {
              type: ['moisture', 'fire', 'sound'],
              thickness: ['0.5', '0.625'],
              size: ['4x8', '4x10', '4x12']
            }
          }
        ]
      },
      insulation: {
        simple: [
          { 
            name: 'Fiberglass Insulation - R-19 15" x 93"', 
            uom: 'ROLL', 
            priceRange: [42, 52],
            construction_phase: ['envelope'],
            quality_tier: 'builder_grade',
            insulation_type: 'fiberglass_batt',
            insulation_r_value: 'r19',
            package_tier: ['good']
          },
          { 
            name: 'Fiberglass Insulation - R-30 24" x 48"', 
            uom: 'ROLL', 
            priceRange: [60, 75],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            package_tier: ['better']
          },
          { 
            name: 'Spray Foam Insulation Kit - 600 Board Feet', 
            uom: 'KIT', 
            priceRange: [450, 550],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best']
          }
        ],
        configurable: []
      },
      services: [
        { name: 'Drywall Installation Service', priceRange: [200, 400] },
        { name: 'Framing Consultation', priceRange: [150, 250] }
      ]
    }
  },
  'windows-doors': {
    name: 'Windows & Doors',
    attributeValue: 'windows_doors',
    subcategories: {
      windows: {
        simple: [
          { 
            name: 'Single Hung Window - 36"x48"', 
            uom: 'EA', 
            priceRange: [180, 240],
            construction_phase: ['envelope'],
            quality_tier: 'builder_grade',
            window_operation_type: 'single_hung',
            window_material: 'vinyl',
            window_glazing_type: 'triple_pane',
            package_tier: ['good'],
            room_category: 'fixtures',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 15,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Double Hung Window - 36"x60"', 
            uom: 'EA', 
            priceRange: [280, 360],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            window_operation_type: 'double_hung',
            window_material: 'vinyl',
            window_glazing_type: 'double_pane',
            package_tier: ['better'],
            room_category: 'fixtures',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 12,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Sliding Window - 48"x36"', 
            uom: 'EA', 
            priceRange: [220, 280],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'fixtures',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 10,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Casement Window - 30"x48"', 
            uom: 'EA', 
            priceRange: [320, 420],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'fixtures',
            store_velocity_category: 'low',
            recommended_restock_quantity: 8,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Bay Window - 72"x48"', 
            uom: 'EA', 
            priceRange: [880, 1200],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'fixtures',
            store_velocity_category: 'low',
            recommended_restock_quantity: 5,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Awning Window - 36"x24"', 
            uom: 'EA', 
            priceRange: [180, 240],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'fixtures',
            store_velocity_category: 'low',
            recommended_restock_quantity: 10,
            typical_days_supply: 30,
            restock_priority: 'low'
          }
        ],
        configurable: [
          {
            name: 'Custom Window',
            dimensions: {
              style: ['single-hung', 'double-hung', 'sliding'],
              width: ['24', '30', '36', '48'],
              height: ['36', '48', '60', '72']
            }
          },
          {
            name: 'Energy Efficient Window',
            dimensions: {
              glazing: ['double', 'triple'],
              frame: ['vinyl', 'fiberglass', 'wood'],
              size: ['30x48', '36x48', '36x60']
            }
          }
        ]
      },
      doors: {
        simple: [
          { 
            name: 'Entry Door - Steel 36"x80"', 
            uom: 'EA', 
            priceRange: [280, 380],
            construction_phase: ['envelope'],
            quality_tier: 'builder_grade',
            door_type: 'entry',
            door_material: 'steel',
            package_tier: ['better'],
            room_category: 'fixtures',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 10,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Interior Door - Hollow Core 32"x80"', 
            uom: 'EA', 
            priceRange: [80, 120],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            door_type: 'interior',
            door_core_type: 'hollow_core',
            package_tier: ['good'],
            room_category: 'fixtures',
            store_velocity_category: 'high',
            recommended_restock_quantity: 25,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'French Door - 60"x80"', 
            uom: 'PAIR', 
            priceRange: [680, 880],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'fixtures',
            store_velocity_category: 'low',
            recommended_restock_quantity: 5,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Sliding Patio Door - 72"x80"', 
            uom: 'EA', 
            priceRange: [880, 1200],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'fixtures',
            deck_compatible: true,
            deck_shape: ['rectangular', 'l_shaped'],
            store_velocity_category: 'low',
            recommended_restock_quantity: 5,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Bi-fold Closet Door - 36"x80"', 
            uom: 'EA', 
            priceRange: [120, 180],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'fixtures',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 15,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Storm Door - 36"x80"', 
            uom: 'EA', 
            priceRange: [180, 280],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'fixtures',
            store_velocity_category: 'low',
            recommended_restock_quantity: 8,
            typical_days_supply: 30,
            restock_priority: 'low'
          }
        ],
        configurable: [
          {
            name: 'Custom Entry Door',
            dimensions: {
              material: ['steel', 'fiberglass', 'wood'],
              width: ['30', '32', '36'],
              height: ['80', '84', '96']
            }
          },
          {
            name: 'Interior Door System',
            dimensions: {
              style: ['panel', 'flush', 'french'],
              width: ['24', '28', '30', '32', '36'],
              height: ['80', '84']
            }
          }
        ]
      },
      services: [
        { name: 'Door & Window Installation', priceRange: [300, 500] },
        { name: 'Window Measurement Service', priceRange: [75, 125] }
      ]
    }
  },
  fasteners: {
    name: 'Fasteners & Hardware',
    attributeValue: 'fasteners_hardware',
    subcategories: {
      nails: {
        simple: [
          { 
            name: 'Framing Nails 16d - 50lb Box', 
            uom: 'BOX', 
            priceRange: [48, 62],
            construction_phase: ['foundation_framing'],
            quality_tier: 'builder_grade',
            fastener_type: 'nail',
            fastener_subtype: 'framing_nail',
            store_velocity_category: 'high',
            recommended_restock_quantity: 30,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Finish Nails 8d - 5lb Box', 
            uom: 'BOX', 
            priceRange: [18, 24],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            store_velocity_category: 'high',
            recommended_restock_quantity: 40,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Roofing Nails - 50lb Box', 
            uom: 'BOX', 
            priceRange: [42, 56],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            store_velocity_category: 'high',
            recommended_restock_quantity: 25,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Brad Nails 18ga - 5000ct', 
            uom: 'BOX', 
            priceRange: [24, 32],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 35,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Concrete Nails - 5lb Box', 
            uom: 'BOX', 
            priceRange: [22, 28],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 20,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Ring Shank Nails - 25lb Box', 
            uom: 'BOX', 
            priceRange: [38, 48],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            deck_compatible: true,
            deck_material_type: 'wood',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 20,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: [
          {
            name: 'Bulk Nail Pack',
            dimensions: {
              type: ['framing', 'finish', 'roofing'],
              size: ['8d', '10d', '16d'],
              quantity: ['25lb', '50lb']
            }
          },
          {
            name: 'Specialty Nails',
            dimensions: {
              coating: ['galvanized', 'stainless', 'plain'],
              length: ['2', '2.5', '3', '3.5'],
              gauge: ['11', '12', '13']
            }
          }
        ]
      },
      screws: {
        simple: [
          { 
            name: 'Deck Screws #8 - 5lb Box', 
            uom: 'BOX', 
            priceRange: [28, 36],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            deck_compatible: true,
            deck_material_type: 'wood',
            deck_shape: ['rectangular', 'l_shaped'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 35,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Drywall Screws - 5lb Box', 
            uom: 'BOX', 
            priceRange: [18, 24],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            store_velocity_category: 'high',
            recommended_restock_quantity: 50,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Wood Screws #10 - 1lb Box', 
            uom: 'BOX', 
            priceRange: [12, 16],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            store_velocity_category: 'high',
            recommended_restock_quantity: 40,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Self-Drilling Screws - 1lb', 
            uom: 'BOX', 
            priceRange: [16, 22],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 30,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Lag Screws 1/2" - 50ct', 
            uom: 'BOX', 
            priceRange: [38, 48],
            construction_phase: ['foundation_framing'],
            quality_tier: 'premium',
            deck_compatible: true,
            deck_material_type: 'wood',
            store_velocity_category: 'low',
            recommended_restock_quantity: 15,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Cabinet Screws - 100ct', 
            uom: 'BOX', 
            priceRange: [14, 18],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better', 'best'],
            room_category: 'fixtures',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 25,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: [
          {
            name: 'Construction Screws',
            dimensions: {
              type: ['deck', 'drywall', 'wood'],
              length: ['1.25', '1.5', '2', '2.5', '3'],
              quantity: ['1lb', '5lb', '25lb']
            }
          },
          {
            name: 'Heavy Duty Fasteners',
            dimensions: {
              diameter: ['0.25', '0.375', '0.5'],
              length: ['2', '3', '4', '5'],
              finish: ['zinc', 'galvanized', 'stainless']
            }
          }
        ]
      },
      services: [
        { name: 'Fastener Consultation', priceRange: [50, 100] },
        { name: 'Bulk Order Processing', priceRange: [75, 150] }
      ]
    }
  },
  roofing: {
    name: 'Roofing',
    attributeValue: 'roofing',
    subcategories: {
      shingles: {
        simple: [
          { 
            name: 'Asphalt Shingles 3-Tab - Bundle', 
            uom: 'BUNDLE', 
            priceRange: [28, 38],
            construction_phase: ['envelope'],
            quality_tier: 'builder_grade',
            roofing_material: 'asphalt',
            roofing_style: 'architectural',
            store_velocity_category: 'high',
            recommended_restock_quantity: 40,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Architectural Shingles - Bundle', 
            uom: 'BUNDLE', 
            priceRange: [38, 52],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            roofing_material: 'asphalt_shingle',
            roofing_style: 'architectural',
            store_velocity_category: 'high',
            recommended_restock_quantity: 35,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Premium Designer Shingles - Bundle', 
            uom: 'BUNDLE', 
            priceRange: [58, 78],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'finishes',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 20,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Impact Resistant Shingles - Bundle', 
            uom: 'BUNDLE', 
            priceRange: [48, 68],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'finishes',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 25,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Starter Strip Shingles - Roll', 
            uom: 'ROLL', 
            priceRange: [32, 44],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 30,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Ridge Cap Shingles - Bundle', 
            uom: 'BUNDLE', 
            priceRange: [42, 56],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 25,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: [
          {
            name: 'Architectural Shingle System',
            dimensions: {
              style: ['dimensional', 'laminated', 'designer'],
              color: ['charcoal', 'weathered-wood', 'slate', 'brown'],
              warranty: ['25yr', '30yr', 'lifetime']
            }
          },
          {
            name: 'Specialty Roofing Shingles',
            dimensions: {
              type: ['impact-resistant', 'cool-roof', 'solar-reflective'],
              profile: ['standard', 'high-profile', 'ultra-profile'],
              coverage: ['100sf', '133sf']
            }
          }
        ]
      },
      underlayment: {
        simple: [
          { 
            name: 'Roofing Felt 15lb - Roll', 
            uom: 'ROLL', 
            priceRange: [18, 26],
            construction_phase: ['envelope'],
            quality_tier: 'builder_grade',
            store_velocity_category: 'high',
            recommended_restock_quantity: 30,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          { 
            name: 'Roofing Felt 30lb - Roll', 
            uom: 'ROLL', 
            priceRange: [28, 38],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 25,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Synthetic Underlayment - Roll', 
            uom: 'ROLL', 
            priceRange: [68, 92],
            construction_phase: ['envelope'],
            quality_tier: 'builder_grade',
            underlayment_type: 'synthetic',
            package_tier: ['best'],
            room_category: 'finishes',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 15,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Ice & Water Shield - Roll', 
            uom: 'ROLL', 
            priceRange: [78, 108],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['better', 'best'],
            room_category: 'finishes',
            store_velocity_category: 'medium',
            recommended_restock_quantity: 20,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          { 
            name: 'Self-Adhering Underlayment - Roll', 
            uom: 'ROLL', 
            priceRange: [88, 118],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'finishes',
            store_velocity_category: 'low',
            recommended_restock_quantity: 10,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          { 
            name: 'Ventilated Underlayment - Roll', 
            uom: 'ROLL', 
            priceRange: [98, 132],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'finishes',
            store_velocity_category: 'low',
            recommended_restock_quantity: 10,
            typical_days_supply: 30,
            restock_priority: 'low'
          }
        ],
        configurable: [
          {
            name: 'Premium Underlayment System',
            dimensions: {
              type: ['felt', 'synthetic', 'self-adhering'],
              weight: ['15lb', '30lb', '50lb'],
              coverage: ['500sf', '1000sf']
            }
          },
          {
            name: 'Waterproofing Membrane',
            dimensions: {
              application: ['eaves', 'valleys', 'full-deck'],
              width: ['36in', '48in'],
              length: ['66ft', '75ft']
            }
          }
        ]
      },
      siding: {
        simple: [
          { 
            name: 'Vinyl Siding - Standard Profile', 
            uom: 'SF', 
            priceRange: [2.50, 3.50],
            construction_phase: ['envelope'],
            quality_tier: 'builder_grade',
            siding_material: 'vinyl',
            package_tier: ['good']
          },
          { 
            name: 'Fiber Cement Siding - Smooth Lap', 
            uom: 'SF', 
            priceRange: [3.50, 4.50],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            package_tier: ['better']
          },
          { 
            name: 'Fiber Cement Siding - Cedar Texture', 
            uom: 'SF', 
            priceRange: [4.00, 5.00],
            construction_phase: ['envelope'],
            quality_tier: 'professional',
            package_tier: ['better']
          },
          { 
            name: 'Stucco System - 3-Coat Traditional', 
            uom: 'SF', 
            priceRange: [6.00, 8.00],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best']
          },
          { 
            name: 'Natural Stone Veneer - Stacked Ledge', 
            uom: 'SF', 
            priceRange: [12.00, 16.00],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best']
          },
          { 
            name: 'Premium Stucco System - Acrylic Finish', 
            uom: 'SF', 
            priceRange: [8.00, 10.00],
            construction_phase: ['envelope'],
            quality_tier: 'premium',
            package_tier: ['best']
          }
        ],
        configurable: []
      },
      services: [
        { name: 'Roof Inspection Service', priceRange: [150, 300] },
        { name: 'Roofing Material Delivery', priceRange: [100, 200] }
      ]
    }
  },
  'interior-finishes': {
    name: 'Interior Finishes',
    attributeValue: 'interior_finishes',
    subcategories: {
      flooring: {
        simple: [
          { 
            name: 'Luxury Vinyl Plank - Oak Finish', 
            uom: 'SF', 
            priceRange: [2.50, 3.50],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'surfaces'
          },
          { 
            name: 'Standard Carpet - Beige Neutral', 
            uom: 'SF', 
            priceRange: [1.80, 2.40],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'surfaces'
          },
          { 
            name: 'Engineered Hardwood - Red Oak', 
            uom: 'SF', 
            priceRange: [4.50, 6.00],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            flooring_material: 'hardwood',
            package_tier: ['better'],
            room_category: 'surfaces'
          },
          { 
            name: 'Ceramic Floor Tile - 12x12 Neutral', 
            uom: 'SF', 
            priceRange: [3.00, 4.00],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'surfaces'
          },
          { 
            name: 'Premium Vinyl Plank - Gray Stone Look', 
            uom: 'SF', 
            priceRange: [3.50, 4.50],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'surfaces'
          },
          { 
            name: 'Solid Hardwood - Black Walnut', 
            uom: 'SF', 
            priceRange: [8.00, 10.00],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'surfaces'
          },
          { 
            name: 'Porcelain Tile - 24x24 Marble Look', 
            uom: 'SF', 
            priceRange: [5.50, 7.50],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'surfaces'
          },
          { 
            name: 'Premium Carpet - Neutral Luxury', 
            uom: 'SF', 
            priceRange: [3.50, 4.50],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'surfaces'
          }
        ],
        configurable: []
      },
      paint: {
        simple: [
          { 
            name: 'Interior Paint - Flat White 5 Gallon', 
            uom: 'GALLON', 
            priceRange: [120, 160],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'finishes'
          },
          { 
            name: 'Interior Paint - Eggshell Neutral Beige 5 Gallon', 
            uom: 'GALLON', 
            priceRange: [140, 180],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            paint_type: 'interior_latex',
            paint_finish: 'eggshell',
            package_tier: ['good'],
            room_category: 'finishes'
          },
          { 
            name: 'Sherwin Williams Interior Satin - 5 Gallon', 
            uom: 'GALLON', 
            priceRange: [200, 250],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'finishes'
          },
          { 
            name: 'Sherwin Williams Exterior Satin - 5 Gallon', 
            uom: 'GALLON', 
            priceRange: [220, 270],
            construction_phase: ['exterior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'finishes'
          },
          { 
            name: 'Benjamin Moore Aura Interior - 5 Gallon', 
            uom: 'GALLON', 
            priceRange: [280, 340],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'finishes'
          },
          { 
            name: 'Benjamin Moore Aura Exterior - 5 Gallon', 
            uom: 'GALLON', 
            priceRange: [300, 360],
            construction_phase: ['exterior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'finishes'
          }
        ],
        configurable: []
      },
      lighting: {
        simple: [
          { 
            name: 'Flush Mount Ceiling Light - Basic White', 
            uom: 'EA', 
            priceRange: [25, 35],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'fixtures'
          },
          { 
            name: 'Recessed Can Light - 4" Standard', 
            uom: 'EA', 
            priceRange: [15, 25],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'fixtures'
          },
          { 
            name: 'Semi-Flush Ceiling Light - Brushed Nickel', 
            uom: 'EA', 
            priceRange: [45, 65],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'fixtures'
          },
          { 
            name: 'LED Recessed Downlight - 6" Integrated', 
            uom: 'EA', 
            priceRange: [35, 50],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            light_type: 'recessed',
            light_technology: 'led',
            package_tier: ['better'],
            room_category: 'fixtures'
          },
          { 
            name: 'Dining Chandelier - Modern 5-Light', 
            uom: 'EA', 
            priceRange: [180, 250],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'fixtures'
          },
          { 
            name: 'Kitchen Island Pendant Set - 3 Glass Globes', 
            uom: 'EA', 
            priceRange: [150, 200],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'fixtures'
          }
        ],
        configurable: []
      },
      plumbing: {
        simple: [
          { 
            name: 'Kitchen Faucet - Chrome Single Handle', 
            uom: 'EA', 
            priceRange: [80, 120],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            fixture_type: 'faucet',
            fixture_location: 'kitchen',
            package_tier: ['good'],
            room_category: 'fixtures'
          },
          { 
            name: 'Bathroom Faucet - Chrome 4" Centerset', 
            uom: 'EA', 
            priceRange: [60, 90],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'fixtures'
          },
          { 
            name: 'Kitchen Faucet - Brushed Nickel Commercial Style', 
            uom: 'EA', 
            priceRange: [150, 200],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'fixtures'
          },
          { 
            name: 'Bathroom Faucet - Brushed Nickel Widespread', 
            uom: 'EA', 
            priceRange: [120, 180],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'fixtures'
          },
          { 
            name: 'Kitchen Faucet - Delta Touch2O Technology', 
            uom: 'EA', 
            priceRange: [280, 350],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'fixtures'
          },
          { 
            name: 'Bathroom Faucet - Kohler Artifacts Collection', 
            uom: 'EA', 
            priceRange: [250, 320],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            room_category: 'fixtures'
          }
        ],
        configurable: []
      },
      services: [
        { name: 'Flooring Installation Service', priceRange: [300, 600] },
        { name: 'Interior Painting Service', priceRange: [500, 1000] }
      ]
    }
  },

  // NEW CATEGORIES FOR HOUSE CONSTRUCTION BOMs

  concrete: {
    name: 'Concrete & Foundation',
    attributeValue: 'concrete',
    subcategories: {
      'ready-mix': {
        simple: [
          {
            name: 'Ready-Mix Concrete - 3000 PSI',
            uom: 'CY',
            priceRange: [140, 160],
            construction_phase: ['foundation_framing'],
            quality_tier: 'builder_grade',
            concrete_type: 'ready_mix',
            concrete_psi: '3000',
            package_tier: ['good'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 10,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'Ready-Mix Concrete - 4000 PSI',
            uom: 'CY',
            priceRange: [165, 185],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 8,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'Ready-Mix Concrete - 5000 PSI High-Strength',
            uom: 'CY',
            priceRange: [190, 210],
            construction_phase: ['foundation_framing'],
            quality_tier: 'premium',
            package_tier: ['best'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 5,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'Concrete Mix - 60lb Bag',
            uom: 'BAG',
            priceRange: [4, 6],
            construction_phase: ['foundation_framing'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 200,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'Concrete Mix - 80lb Bag High-Strength',
            uom: 'BAG',
            priceRange: [6, 8],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 150,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      }
    }
  },

  electrical: {
    name: 'Electrical Systems',
    attributeValue: 'electrical',
    subcategories: {
      wiring: {
        simple: [
          {
            name: 'Romex 14/2 NM-B Wire - 250ft Roll',
            uom: 'ROLL',
            priceRange: [45, 60],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 20,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'Romex 12/2 NM-B Wire - 250ft Roll',
            uom: 'ROLL',
            priceRange: [65, 85],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 15,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'Romex 10/2 NM-B Wire - 250ft Roll',
            uom: 'ROLL',
            priceRange: [95, 120],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 10,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      },
      devices: {
        simple: [
          {
            name: 'Electrical Outlet - 15A Duplex White',
            uom: 'EA',
            priceRange: [1, 2],
            construction_phase: ['rough_in'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 500,
            typical_days_supply: 14,
            restock_priority: 'high'
          },
          {
            name: 'GFCI Outlet - 20A Weather-Resistant',
            uom: 'EA',
            priceRange: [15, 22],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 100,
            typical_days_supply: 14,
            restock_priority: 'high'
          },
          {
            name: 'Light Switch - Single Pole White',
            uom: 'EA',
            priceRange: [1, 2],
            construction_phase: ['rough_in'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 500,
            typical_days_supply: 14,
            restock_priority: 'high'
          },
          {
            name: 'Dimmer Switch - LED Compatible',
            uom: 'EA',
            priceRange: [18, 28],
            construction_phase: ['rough_in'],
            quality_tier: 'premium',
            package_tier: ['best'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 100,
            typical_days_supply: 21,
            restock_priority: 'medium'
          },
          {
            name: '3-Way Light Switch - White',
            uom: 'EA',
            priceRange: [3, 5],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 200,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      },
      panels: {
        simple: [
          {
            name: 'Main Service Panel - 200 Amp',
            uom: 'EA',
            priceRange: [180, 250],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'low',
            recommended_restock_quantity: 5,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          {
            name: 'Circuit Breaker - 15 Amp Single Pole',
            uom: 'EA',
            priceRange: [5, 8],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 100,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'Circuit Breaker - 20 Amp Single Pole',
            uom: 'EA',
            priceRange: [6, 10],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 100,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      }
    }
  },

  'plumbing-pipes': {
    name: 'Plumbing Pipes & Fittings',
    attributeValue: 'plumbing_pipes',
    subcategories: {
      'water-supply': {
        simple: [
          {
            name: 'PEX Pipe 1/2" - Red (Hot) 100ft Coil',
            uom: 'ROLL',
            priceRange: [35, 50],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 20,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'PEX Pipe 1/2" - Blue (Cold) 100ft Coil',
            uom: 'ROLL',
            priceRange: [35, 50],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 20,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'PEX Pipe 3/4" - Red (Hot) 100ft Coil',
            uom: 'ROLL',
            priceRange: [50, 70],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 15,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'Copper Pipe Type L 1/2" - 10ft',
            uom: 'EA',
            priceRange: [18, 25],
            construction_phase: ['rough_in'],
            quality_tier: 'premium',
            package_tier: ['best'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 30,
            typical_days_supply: 21,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      },
      'drain-waste': {
        simple: [
          {
            name: 'PVC Drain Pipe 2" Schedule 40 - 10ft',
            uom: 'EA',
            priceRange: [8, 12],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 50,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'PVC Drain Pipe 3" Schedule 40 - 10ft',
            uom: 'EA',
            priceRange: [12, 18],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 40,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'PVC Drain Pipe 4" Schedule 40 - 10ft',
            uom: 'EA',
            priceRange: [18, 25],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 30,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      },
      fittings: {
        simple: [
          {
            name: 'PEX Fittings Assortment Kit - 50pc',
            uom: 'KIT',
            priceRange: [45, 65],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 20,
            typical_days_supply: 21,
            restock_priority: 'medium'
          },
          {
            name: 'PVC Fittings Assortment Kit - 40pc',
            uom: 'KIT',
            priceRange: [35, 50],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 15,
            typical_days_supply: 21,
            restock_priority: 'medium'
          },
          {
            name: 'Shut-Off Valve 1/2" Quarter Turn',
            uom: 'EA',
            priceRange: [8, 12],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 100,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      }
    }
  },

  hvac: {
    name: 'HVAC Systems',
    attributeValue: 'hvac',
    subcategories: {
      units: {
        simple: [
          {
            name: 'Central AC/Heat Pump - 3 Ton 14 SEER',
            uom: 'EA',
            priceRange: [2800, 3500],
            construction_phase: ['rough_in'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            store_velocity_category: 'low',
            recommended_restock_quantity: 2,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          {
            name: 'Central AC/Heat Pump - 4 Ton 16 SEER',
            uom: 'EA',
            priceRange: [3500, 4200],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'low',
            recommended_restock_quantity: 2,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          {
            name: 'Central AC/Heat Pump - 5 Ton 18 SEER High-Efficiency',
            uom: 'EA',
            priceRange: [4500, 5500],
            construction_phase: ['rough_in'],
            quality_tier: 'premium',
            package_tier: ['best'],
            store_velocity_category: 'low',
            recommended_restock_quantity: 1,
            typical_days_supply: 45,
            restock_priority: 'low'
          }
        ],
        configurable: []
      },
      ductwork: {
        simple: [
          {
            name: 'Flexible Duct 6" Insulated - 25ft',
            uom: 'ROLL',
            priceRange: [35, 50],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 20,
            typical_days_supply: 21,
            restock_priority: 'medium'
          },
          {
            name: 'Flexible Duct 8" Insulated - 25ft',
            uom: 'ROLL',
            priceRange: [45, 65],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 15,
            typical_days_supply: 21,
            restock_priority: 'medium'
          },
          {
            name: 'Round Duct 10" Galvanized - 10ft',
            uom: 'EA',
            priceRange: [25, 35],
            construction_phase: ['rough_in'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 20,
            typical_days_supply: 21,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      },
      vents: {
        simple: [
          {
            name: 'Supply Register 4"x10" White',
            uom: 'EA',
            priceRange: [8, 12],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 100,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'Return Grille 20"x20" White',
            uom: 'EA',
            priceRange: [25, 35],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 30,
            typical_days_supply: 21,
            restock_priority: 'medium'
          },
          {
            name: 'Programmable Thermostat - 7-Day',
            uom: 'EA',
            priceRange: [45, 65],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 20,
            typical_days_supply: 21,
            restock_priority: 'medium'
          },
          {
            name: 'Smart Thermostat - WiFi Enabled',
            uom: 'EA',
            priceRange: [180, 250],
            construction_phase: ['interior_finish'],
            quality_tier: 'premium',
            package_tier: ['best'],
            store_velocity_category: 'low',
            recommended_restock_quantity: 10,
            typical_days_supply: 30,
            restock_priority: 'low'
          }
        ],
        configurable: []
      }
    }
  },

  'drywall-supplies': {
    name: 'Drywall & Supplies',
    attributeValue: 'drywall_supplies',
    subcategories: {
      drywall: {
        simple: [
          {
            name: 'Drywall 1/2" - 4x8 Sheet',
            uom: 'SHEET',
            priceRange: [12, 16],
            construction_phase: ['foundation_framing'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 200,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'Drywall 1/2" - 4x12 Sheet',
            uom: 'SHEET',
            priceRange: [18, 24],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 150,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'Drywall 5/8" Moisture-Resistant - 4x8',
            uom: 'SHEET',
            priceRange: [22, 28],
            construction_phase: ['foundation_framing'],
            quality_tier: 'premium',
            package_tier: ['best'],
            store_velocity_category: 'medium',
            recommended_restock_quantity: 100,
            typical_days_supply: 14,
            restock_priority: 'medium'
          }
        ],
        configurable: []
      },
      supplies: {
        simple: [
          {
            name: 'Joint Compound - 5 Gallon Bucket',
            uom: 'BUCKET',
            priceRange: [25, 32],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 50,
            typical_days_supply: 7,
            restock_priority: 'high'
          },
          {
            name: 'Drywall Tape - Paper 250ft Roll',
            uom: 'ROLL',
            priceRange: [5, 8],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 100,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'Corner Bead Metal - 8ft',
            uom: 'EA',
            priceRange: [2, 4],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 200,
            typical_days_supply: 14,
            restock_priority: 'medium'
          },
          {
            name: 'Drywall Screws - 1lb Box',
            uom: 'BOX',
            priceRange: [7, 10],
            construction_phase: ['foundation_framing'],
            quality_tier: 'professional',
            package_tier: ['better'],
            store_velocity_category: 'high',
            recommended_restock_quantity: 200,
            typical_days_supply: 14,
            restock_priority: 'high'
          }
        ],
        configurable: []
      }
    }
  },

  appliances: {
    name: 'Kitchen Appliances',
    attributeValue: 'appliances',
    subcategories: {
      kitchen: {
        simple: [
          {
            name: 'Electric Range 30" - White',
            uom: 'EA',
            priceRange: [450, 600],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'kitchen',
            store_velocity_category: 'low',
            recommended_restock_quantity: 3,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          {
            name: 'Gas Range 30" - Stainless Steel',
            uom: 'EA',
            priceRange: [750, 950],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'kitchen',
            store_velocity_category: 'low',
            recommended_restock_quantity: 2,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          {
            name: 'Professional Range 36" - Dual Fuel',
            uom: 'EA',
            priceRange: [2200, 2800],
            construction_phase: ['interior_finish'],
            quality_tier: 'luxury',
            package_tier: ['best'],
            room_category: 'kitchen',
            store_velocity_category: 'low',
            recommended_restock_quantity: 1,
            typical_days_supply: 60,
            restock_priority: 'low'
          },
          {
            name: 'Dishwasher - White Standard',
            uom: 'EA',
            priceRange: [350, 450],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'kitchen',
            store_velocity_category: 'low',
            recommended_restock_quantity: 3,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          {
            name: 'Dishwasher - Stainless Quiet',
            uom: 'EA',
            priceRange: [600, 750],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'kitchen',
            store_velocity_category: 'low',
            recommended_restock_quantity: 2,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          {
            name: 'Dishwasher - Panel-Ready Ultra-Quiet',
            uom: 'EA',
            priceRange: [1200, 1500],
            construction_phase: ['interior_finish'],
            quality_tier: 'luxury',
            package_tier: ['best'],
            room_category: 'kitchen',
            store_velocity_category: 'low',
            recommended_restock_quantity: 1,
            typical_days_supply: 60,
            restock_priority: 'low'
          },
          {
            name: 'Microwave Over-Range - White',
            uom: 'EA',
            priceRange: [180, 250],
            construction_phase: ['interior_finish'],
            quality_tier: 'builder_grade',
            package_tier: ['good'],
            room_category: 'kitchen',
            store_velocity_category: 'low',
            recommended_restock_quantity: 3,
            typical_days_supply: 30,
            restock_priority: 'low'
          },
          {
            name: 'Microwave Built-In - Stainless',
            uom: 'EA',
            priceRange: [400, 550],
            construction_phase: ['interior_finish'],
            quality_tier: 'professional',
            package_tier: ['better'],
            room_category: 'kitchen',
            store_velocity_category: 'low',
            recommended_restock_quantity: 2,
            typical_days_supply: 30,
            restock_priority: 'low'
          }
        ],
        configurable: []
      }
    }
  }
};

// Configurable product variant generation helper
export function getVariantCombinations(dimensions) {
  const keys = Object.keys(dimensions);
  const values = keys.map(key => dimensions[key]);

  function* cartesian(head, ...tail) {
    const remainder = tail.length > 0 ? cartesian(...tail) : [[]];
    for (const r of remainder) {
      for (const h of head) {
        yield [h, ...r];
      }
    }
  }

  const combinations = [...cartesian(...values)];
  return combinations.map(combo => {
    const variant = {};
    keys.forEach((key, index) => {
      variant[key] = combo[index];
    });
    return variant;
  });
}

// Bundle definitions will be created in a separate file
export default {
  BRANDS,
  UNITS_OF_MEASURE,
  PRODUCT_CATEGORIES,
  getVariantCombinations
};