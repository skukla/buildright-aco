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
  'CASE'     // Case
];

// Product categories with their products (12 simple + 4 configurable + 2 service per category)
export const PRODUCT_CATEGORIES = {
  structural: {
    name: 'Structural Materials',
    attributeValue: 'structural_materials',
    subcategories: {
      lumber: {
        simple: [
          { name: '2x4 Stud - 8ft', uom: 'EA', priceRange: [8, 12] },
          { name: '2x6 Stud - 8ft', uom: 'EA', priceRange: [12, 16] },
          { name: '2x8 Joist - 10ft', uom: 'EA', priceRange: [18, 24] },
          { name: '2x10 Joist - 12ft', uom: 'EA', priceRange: [24, 32] },
          { name: '2x12 Beam - 16ft', uom: 'EA', priceRange: [36, 48] },
          { name: '4x4 Post - 8ft', uom: 'EA', priceRange: [28, 36] }
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
          { name: 'OSB Sheathing 7/16" - 4x8', uom: 'SHEET', priceRange: [18, 24] },
          { name: 'CDX Plywood 1/2" - 4x8', uom: 'SHEET', priceRange: [28, 36] },
          { name: 'T&G Subfloor 3/4" - 4x8', uom: 'SHEET', priceRange: [38, 48] },
          { name: 'Marine Plywood 3/4" - 4x8', uom: 'SHEET', priceRange: [68, 88] },
          { name: 'Hardwood Plywood 1/4" - 4x8', uom: 'SHEET', priceRange: [48, 62] },
          { name: 'Siding Panel 3/8" - 4x8', uom: 'SHEET', priceRange: [32, 42] }
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
    name: 'Framing & Insulation',
    attributeValue: 'framing_insulation',
    subcategories: {
      studs: {
        simple: [
          { name: 'Metal Stud 20ga - 3.5" x 10ft', uom: 'EA', priceRange: [8, 12] },
          { name: 'Metal Stud 20ga - 6" x 10ft', uom: 'EA', priceRange: [12, 16] },
          { name: 'Metal Track 20ga - 3.5" x 10ft', uom: 'EA', priceRange: [9, 13] },
          { name: 'Metal Track 20ga - 6" x 10ft', uom: 'EA', priceRange: [13, 17] },
          { name: 'Steel C-Channel - 8ft', uom: 'EA', priceRange: [18, 24] },
          { name: 'Hat Channel - 12ft', uom: 'EA', priceRange: [14, 18] }
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
          { name: 'Drywall 1/2" - 4x8', uom: 'SHEET', priceRange: [12, 16] },
          { name: 'Drywall 5/8" - 4x8', uom: 'SHEET', priceRange: [14, 18] },
          { name: 'Moisture Resistant Drywall - 4x8', uom: 'SHEET', priceRange: [18, 24] },
          { name: 'Fire Rated Drywall - 4x8', uom: 'SHEET', priceRange: [22, 28] },
          { name: 'Cement Board 1/2" - 3x5', uom: 'SHEET', priceRange: [16, 20] },
          { name: 'Sound Dampening Drywall - 4x8', uom: 'SHEET', priceRange: [28, 36] }
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
          { name: 'Single Hung Window - 36"x48"', uom: 'EA', priceRange: [180, 240] },
          { name: 'Double Hung Window - 36"x60"', uom: 'EA', priceRange: [280, 360] },
          { name: 'Sliding Window - 48"x36"', uom: 'EA', priceRange: [220, 280] },
          { name: 'Casement Window - 30"x48"', uom: 'EA', priceRange: [320, 420] },
          { name: 'Bay Window - 72"x48"', uom: 'EA', priceRange: [880, 1200] },
          { name: 'Awning Window - 36"x24"', uom: 'EA', priceRange: [180, 240] }
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
          { name: 'Entry Door - Steel 36"x80"', uom: 'EA', priceRange: [280, 380] },
          { name: 'Interior Door - Hollow Core 32"x80"', uom: 'EA', priceRange: [80, 120] },
          { name: 'French Door - 60"x80"', uom: 'PAIR', priceRange: [680, 880] },
          { name: 'Sliding Patio Door - 72"x80"', uom: 'EA', priceRange: [880, 1200] },
          { name: 'Bi-fold Closet Door - 36"x80"', uom: 'EA', priceRange: [120, 180] },
          { name: 'Storm Door - 36"x80"', uom: 'EA', priceRange: [180, 280] }
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
          { name: 'Framing Nails 16d - 50lb Box', uom: 'BOX', priceRange: [48, 62] },
          { name: 'Finish Nails 8d - 5lb Box', uom: 'BOX', priceRange: [18, 24] },
          { name: 'Roofing Nails - 50lb Box', uom: 'BOX', priceRange: [42, 56] },
          { name: 'Brad Nails 18ga - 5000ct', uom: 'BOX', priceRange: [24, 32] },
          { name: 'Concrete Nails - 5lb Box', uom: 'BOX', priceRange: [22, 28] },
          { name: 'Ring Shank Nails - 25lb Box', uom: 'BOX', priceRange: [38, 48] }
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
          { name: 'Deck Screws #8 - 5lb Box', uom: 'BOX', priceRange: [28, 36] },
          { name: 'Drywall Screws - 5lb Box', uom: 'BOX', priceRange: [18, 24] },
          { name: 'Wood Screws #10 - 1lb Box', uom: 'BOX', priceRange: [12, 16] },
          { name: 'Self-Drilling Screws - 1lb', uom: 'BOX', priceRange: [16, 22] },
          { name: 'Lag Screws 1/2" - 50ct', uom: 'BOX', priceRange: [38, 48] },
          { name: 'Cabinet Screws - 100ct', uom: 'BOX', priceRange: [14, 18] }
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
  safety: {
    name: 'Safety Equipment',
    attributeValue: 'safety_equipment',
    subcategories: {
      equipment: {
        simple: [
          { name: 'Hard Hat - Type 1 Class E', uom: 'EA', priceRange: [18, 28] },
          { name: 'Safety Glasses - ANSI Z87.1', uom: 'PAIR', priceRange: [8, 16] },
          { name: 'Work Gloves - Heavy Duty', uom: 'PAIR', priceRange: [12, 20] },
          { name: 'Safety Vest - High Vis Orange', uom: 'EA', priceRange: [14, 22] },
          { name: 'Ear Protection - 30dB NRR', uom: 'PAIR', priceRange: [6, 12] },
          { name: 'Fall Protection Harness', uom: 'EA', priceRange: [120, 180] },
          { name: 'Respirator Mask - N95', uom: 'BOX', priceRange: [28, 42] },
          { name: 'Safety Boots - Steel Toe', uom: 'PAIR', priceRange: [80, 140] },
          { name: 'First Aid Kit - 50 Person', uom: 'EA', priceRange: [68, 98] },
          { name: 'Fire Extinguisher - 10lb ABC', uom: 'EA', priceRange: [58, 88] },
          { name: 'Safety Goggles - Chemical', uom: 'PAIR', priceRange: [12, 18] },
          { name: 'Face Shield - Full Coverage', uom: 'EA', priceRange: [22, 32] }
        ],
        configurable: [
          {
            name: 'PPE Kit',
            dimensions: {
              size: ['S', 'M', 'L', 'XL', 'XXL'],
              type: ['basic', 'standard', 'premium'],
              color: ['orange', 'yellow', 'green']
            }
          },
          {
            name: 'Safety Harness System',
            dimensions: {
              size: ['universal', 'XL', 'XXL'],
              type: ['basic', 'positioning', 'retrieval'],
              weight_capacity: ['310', '400', '420']
            }
          },
          {
            name: 'Protective Eyewear',
            dimensions: {
              type: ['safety-glasses', 'goggles', 'face-shield'],
              lens: ['clear', 'tinted', 'anti-fog'],
              standard: ['Z87.1', 'Z87.1+']
            }
          },
          {
            name: 'Hand Protection',
            dimensions: {
              size: ['S', 'M', 'L', 'XL'],
              material: ['leather', 'nitrile', 'kevlar'],
              type: ['general', 'chemical', 'cut-resistant']
            }
          }
        ]
      },
      services: [
        { name: 'Safety Training Course', priceRange: [200, 400] },
        { name: 'PPE Fitting Service', priceRange: [50, 100] }
      ]
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