/**
 * Bundle definitions for BuildRight ACO bundle product generation
 * Defines 12 bundle products (3 per category) with item groups
 */

export const BUNDLE_DEFINITIONS = {
  structural: [
    {
      name: 'Deck Building Bundle',
      description: 'Complete materials for a 12x16 deck',
      priceRange: [1800, 2400],
      groups: [
        {
          name: 'Lumber Selection',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'lumber', namePattern: '2x8', defaultQty: 12 },
            { productType: 'lumber', namePattern: '2x10', defaultQty: 12 }
          ]
        },
        {
          name: 'Decking Material',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'lumber', namePattern: '2x6', defaultQty: 20 },
            { productType: 'plywood', namePattern: 'OSB', defaultQty: 8 }
          ]
        },
        {
          name: 'Support Posts',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'lumber', namePattern: '4x4', defaultQty: 6 },
            { productType: 'lumber', namePattern: '2x4', defaultQty: 8 }
          ]
        },
        {
          name: 'Fasteners',
          required: false,
          multiSelect: true,
          items: [
            { productType: 'screws', namePattern: 'Deck Screws', defaultQty: 2 },
            { productType: 'nails', namePattern: 'Framing Nails', defaultQty: 1 }
          ]
        }
      ]
    },
    {
      name: 'Framing Package - 10x12 Shed',
      description: 'All structural materials for shed framing',
      priceRange: [1200, 1600],
      groups: [
        {
          name: 'Wall Framing',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'lumber', namePattern: '2x4', defaultQty: 24 },
            { productType: 'lumber', namePattern: '2x6', defaultQty: 18 }
          ]
        },
        {
          name: 'Roof Structure',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'lumber', namePattern: '2x8', defaultQty: 10 },
            { productType: 'plywood', namePattern: 'OSB', defaultQty: 6 }
          ]
        },
        {
          name: 'Sheathing',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'plywood', namePattern: 'CDX', defaultQty: 8 },
            { productType: 'plywood', namePattern: 'T&G', defaultQty: 6 }
          ]
        }
      ]
    },
    {
      name: 'Foundation Materials Bundle',
      description: 'Materials for concrete foundation work',
      priceRange: [800, 1200],
      groups: [
        {
          name: 'Form Boards',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'lumber', namePattern: '2x10', defaultQty: 10 },
            { productType: 'lumber', namePattern: '2x12', defaultQty: 8 }
          ]
        },
        {
          name: 'Plywood Forms',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'plywood', namePattern: 'CDX', defaultQty: 4 },
            { productType: 'plywood', namePattern: 'Marine', defaultQty: 2 }
          ]
        },
        {
          name: 'Stakes & Bracing',
          required: false,
          multiSelect: true,
          items: [
            { productType: 'lumber', namePattern: '2x4', defaultQty: 12 },
            { productType: 'nails', namePattern: 'Concrete', defaultQty: 1 }
          ]
        }
      ]
    }
  ],
  framing: [
    {
      name: 'Complete Wall System',
      description: 'Everything needed for 100 linear feet of walls',
      priceRange: [2200, 2800],
      groups: [
        {
          name: 'Metal Studs',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'studs', namePattern: 'Metal Stud 20ga - 3.5', defaultQty: 30 },
            { productType: 'studs', namePattern: 'Metal Stud 20ga - 6', defaultQty: 25 }
          ]
        },
        {
          name: 'Track System',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'studs', namePattern: 'Metal Track', defaultQty: 10 },
            { productType: 'studs', namePattern: 'Hat Channel', defaultQty: 8 }
          ]
        },
        {
          name: 'Drywall',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'drywall', namePattern: 'Drywall 1/2', defaultQty: 20 },
            { productType: 'drywall', namePattern: 'Drywall 5/8', defaultQty: 20 }
          ]
        },
        {
          name: 'Fasteners',
          required: false,
          multiSelect: true,
          items: [
            { productType: 'screws', namePattern: 'Drywall Screws', defaultQty: 3 },
            { productType: 'screws', namePattern: 'Self-Drilling', defaultQty: 2 }
          ]
        }
      ]
    },
    {
      name: 'Bathroom Renovation Kit',
      description: 'Moisture-resistant materials for bathroom',
      priceRange: [1400, 1800],
      groups: [
        {
          name: 'Moisture Resistant Walls',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'drywall', namePattern: 'Moisture Resistant', defaultQty: 8 },
            { productType: 'drywall', namePattern: 'Cement Board', defaultQty: 6 }
          ]
        },
        {
          name: 'Framing',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'studs', namePattern: 'Metal Stud', defaultQty: 12 },
            { productType: 'studs', namePattern: 'Metal Track', defaultQty: 4 }
          ]
        },
        {
          name: 'Accessories',
          required: false,
          multiSelect: true,
          items: [
            { productType: 'screws', namePattern: 'Drywall Screws', defaultQty: 2 },
            { productType: 'safety', namePattern: 'Respirator', defaultQty: 1 }
          ]
        }
      ]
    },
    {
      name: 'Soundproofing Package',
      description: 'Materials for sound-dampening wall construction',
      priceRange: [1800, 2400],
      groups: [
        {
          name: 'Sound Drywall',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'drywall', namePattern: 'Sound Dampening', defaultQty: 12 },
            { productType: 'drywall', namePattern: 'Fire Rated', defaultQty: 8 }
          ]
        },
        {
          name: 'Double Stud Wall',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'studs', namePattern: 'Metal Stud 20ga - 3.5', defaultQty: 24 },
            { productType: 'studs', namePattern: 'Metal Stud 20ga - 6', defaultQty: 20 }
          ]
        },
        {
          name: 'Track & Channel',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'studs', namePattern: 'Metal Track', defaultQty: 8 },
            { productType: 'studs', namePattern: 'Hat Channel', defaultQty: 6 }
          ]
        }
      ]
    }
  ],
  'windows-doors': [
    {
      name: 'Whole House Window Package',
      description: 'Windows for a typical 3-bedroom home',
      priceRange: [4800, 6200],
      groups: [
        {
          name: 'Living Area Windows',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'windows', namePattern: 'Double Hung', defaultQty: 4 },
            { productType: 'windows', namePattern: 'Bay Window', defaultQty: 1 }
          ]
        },
        {
          name: 'Bedroom Windows',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'windows', namePattern: 'Single Hung', defaultQty: 6 },
            { productType: 'windows', namePattern: 'Double Hung', defaultQty: 4 }
          ]
        },
        {
          name: 'Specialty Windows',
          required: false,
          multiSelect: true,
          items: [
            { productType: 'windows', namePattern: 'Awning', defaultQty: 2 },
            { productType: 'windows', namePattern: 'Casement', defaultQty: 2 }
          ]
        }
      ]
    },
    {
      name: 'Complete Door Package',
      description: 'All doors for new construction home',
      priceRange: [2800, 3600],
      groups: [
        {
          name: 'Entry Doors',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'doors', namePattern: 'Entry Door', defaultQty: 1 },
            { productType: 'doors', namePattern: 'Storm Door', defaultQty: 1 }
          ]
        },
        {
          name: 'Interior Doors',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'doors', namePattern: 'Interior Door', defaultQty: 8 },
            { productType: 'doors', namePattern: 'Bi-fold', defaultQty: 2 }
          ]
        },
        {
          name: 'Patio Access',
          required: false,
          multiSelect: false,
          items: [
            { productType: 'doors', namePattern: 'Sliding Patio', defaultQty: 1 },
            { productType: 'doors', namePattern: 'French Door', defaultQty: 1 }
          ]
        }
      ]
    },
    {
      name: 'Energy Efficiency Upgrade',
      description: 'High-efficiency windows and doors',
      priceRange: [3600, 4800],
      groups: [
        {
          name: 'Energy Windows',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'windows', namePattern: 'Double Hung', defaultQty: 3 },
            { productType: 'windows', namePattern: 'Casement', defaultQty: 2 }
          ]
        },
        {
          name: 'Insulated Doors',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'doors', namePattern: 'Entry Door', defaultQty: 1 },
            { productType: 'doors', namePattern: 'Storm Door', defaultQty: 1 }
          ]
        },
        {
          name: 'Weatherization',
          required: false,
          multiSelect: true,
          items: [
            { productType: 'safety', namePattern: 'Work Gloves', defaultQty: 2 },
            { productType: 'screws', namePattern: 'Wood Screws', defaultQty: 1 }
          ]
        }
      ]
    }
  ],
  fasteners: [
    {
      name: 'Professional Framer Kit',
      description: 'Complete fastener set for framing work',
      priceRange: [480, 620],
      groups: [
        {
          name: 'Framing Nails',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'nails', namePattern: 'Framing Nails', defaultQty: 4 },
            { productType: 'nails', namePattern: 'Ring Shank', defaultQty: 2 }
          ]
        },
        {
          name: 'Specialty Fasteners',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'screws', namePattern: 'Lag Screws', defaultQty: 2 },
            { productType: 'screws', namePattern: 'Deck Screws', defaultQty: 3 }
          ]
        },
        {
          name: 'Finish Work',
          required: false,
          multiSelect: true,
          items: [
            { productType: 'nails', namePattern: 'Finish Nails', defaultQty: 2 },
            { productType: 'nails', namePattern: 'Brad Nails', defaultQty: 1 }
          ]
        }
      ]
    },
    {
      name: 'Roofing Fastener Bundle',
      description: 'All fasteners needed for roof installation',
      priceRange: [380, 480],
      groups: [
        {
          name: 'Roofing Nails',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'nails', namePattern: 'Roofing Nails', defaultQty: 3 },
            { productType: 'nails', namePattern: 'Ring Shank', defaultQty: 2 }
          ]
        },
        {
          name: 'Sheathing Fasteners',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'nails', namePattern: 'Framing Nails', defaultQty: 2 },
            { productType: 'screws', namePattern: 'Deck Screws', defaultQty: 1 }
          ]
        },
        {
          name: 'Safety Equipment',
          required: false,
          multiSelect: true,
          items: [
            { productType: 'safety', namePattern: 'Safety Glasses', defaultQty: 2 },
            { productType: 'safety', namePattern: 'Work Gloves', defaultQty: 2 }
          ]
        }
      ]
    },
    {
      name: 'Cabinet Installation Kit',
      description: 'Specialized fasteners for cabinet work',
      priceRange: [280, 380],
      groups: [
        {
          name: 'Cabinet Screws',
          required: true,
          multiSelect: false,
          items: [
            { productType: 'screws', namePattern: 'Cabinet Screws', defaultQty: 4 },
            { productType: 'screws', namePattern: 'Wood Screws', defaultQty: 3 }
          ]
        },
        {
          name: 'Wall Mounting',
          required: true,
          multiSelect: true,
          items: [
            { productType: 'screws', namePattern: 'Lag Screws', defaultQty: 1 },
            { productType: 'screws', namePattern: 'Drywall Screws', defaultQty: 2 }
          ]
        },
        {
          name: 'Finish Hardware',
          required: false,
          multiSelect: false,
          items: [
            { productType: 'nails', namePattern: 'Finish Nails', defaultQty: 1 },
            { productType: 'nails', namePattern: 'Brad Nails', defaultQty: 1 }
          ]
        }
      ]
    }
  ]
};

export default BUNDLE_DEFINITIONS;