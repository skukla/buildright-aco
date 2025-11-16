/**
 * Triggered Policy Definitions for BuildRight CCDM Demo
 * 
 * CRITICAL: ACO Triggered Policies must be created manually in the ACO Admin UI.
 * This file documents the required policy configurations for the BuildRight persona demo.
 * 
 * Policies enable dynamic catalog filtering based on:
 * - Customer context (persona-specific views)
 * - Project context (construction phase, quality tier)
 * - Progressive selection (deck wizard, package builder)
 * 
 * @see docs/POLICY-SETUP-GUIDE.md for ACO Admin UI instructions
 */

/**
 * Policy Definitions organized by persona and use case
 */
export const POLICY_DEFINITIONS = {
  
  // ==================================================================
  // MARCUS JOHNSON (General Contractor) - Project Wizard Policies
  // ==================================================================
  
  CONSTRUCTION_PHASE: {
    foundation_framing: {
      name: 'Foundation & Framing Phase',
      trigger: 'HTTP Header: AC-Policy-Phase',
      filter_type: 'attribute_match',
      attribute: 'construction_phase',
      value: 'foundation_framing',
      description: 'Shows structural materials for foundation and framing work',
      use_case: 'Marcus ordering Phase 1 materials for custom home',
      products_shown: 'Concrete, rebar, lumber, fasteners, structural hardware'
    },
    envelope: {
      name: 'Building Envelope Phase',
      trigger: 'HTTP Header: AC-Policy-Phase',
      filter_type: 'attribute_match',
      attribute: 'construction_phase',
      value: 'envelope',
      description: 'Shows materials for building envelope (weather barrier)',
      use_case: 'Marcus ordering Phase 2 materials (windows, doors, roofing)',
      products_shown: 'Windows, doors, roofing materials, weather barriers, flashing'
    },
    interior_finish: {
      name: 'Interior Finish Phase',
      trigger: 'HTTP Header: AC-Policy-Phase',
      filter_type: 'attribute_match',
      attribute: 'construction_phase',
      value: 'interior_finish',
      description: 'Shows finish materials for interior work',
      use_case: 'Marcus ordering Phase 3 materials (drywall, trim, flooring)',
      products_shown: 'Drywall, trim, paint, flooring, fixtures'
    }
  },

  QUALITY_TIER: {
    builder_grade: {
      name: 'Builder Grade Materials',
      trigger: 'HTTP Header: AC-Policy-Quality',
      filter_type: 'attribute_match',
      attribute: 'quality_tier',
      value: 'builder_grade',
      description: 'Shows budget-friendly builder grade products',
      use_case: 'Marcus building spec home with cost constraints',
      products_shown: 'Standard materials optimized for cost'
    },
    professional: {
      name: 'Professional Grade Materials',
      trigger: 'HTTP Header: AC-Policy-Quality',
      filter_type: 'attribute_match',
      attribute: 'quality_tier',
      value: 'professional',
      description: 'Shows mid-tier professional grade products',
      use_case: 'Marcus building custom home with quality expectations',
      products_shown: 'Professional-grade materials balancing quality and cost'
    },
    premium: {
      name: 'Premium Grade Materials',
      trigger: 'HTTP Header: AC-Policy-Quality',
      filter_type: 'attribute_match',
      attribute: 'quality_tier',
      value: 'premium',
      description: 'Shows high-end premium products',
      use_case: 'Marcus building luxury custom home',
      products_shown: 'Premium materials for high-end projects'
    }
  },

  // ==================================================================
  // LISA CHEN (Remodeling Contractor) - Package Builder Policies
  // ==================================================================
  
  PACKAGE_TIER: {
    good: {
      name: 'Good Tier Package',
      trigger: 'HTTP Header: AC-Policy-Package-Tier',
      filter_type: 'attribute_match',
      attribute: 'package_tier',
      value: 'good',
      description: 'Shows budget-friendly package components',
      use_case: 'Lisa building "Good" bathroom remodel package',
      products_shown: 'Builder-grade fixtures, standard materials',
      price_range: '$8,000-$12,000'
    },
    better: {
      name: 'Better Tier Package',
      trigger: 'HTTP Header: AC-Policy-Package-Tier',
      filter_type: 'attribute_match',
      attribute: 'package_tier',
      value: 'better',
      description: 'Shows mid-range package components',
      use_case: 'Lisa building "Better" bathroom remodel package',
      products_shown: 'Mid-range fixtures, quality materials',
      price_range: '$14,000-$18,000'
    },
    best: {
      name: 'Best Tier Package',
      trigger: 'HTTP Header: AC-Policy-Package-Tier',
      filter_type: 'attribute_match',
      attribute: 'package_tier',
      value: 'best',
      description: 'Shows premium package components',
      use_case: 'Lisa building "Best" bathroom remodel package',
      products_shown: 'Premium fixtures, designer materials',
      price_range: '$22,000-$28,000'
    }
  },

  ROOM_CATEGORY: {
    bathroom: {
      name: 'Bathroom Products',
      trigger: 'HTTP Header: AC-Policy-Room',
      filter_type: 'attribute_match',
      attribute: 'room_category',
      value: 'bathroom',
      description: 'Shows bathroom-specific products',
      use_case: 'Lisa selecting materials for bathroom remodel',
      products_shown: 'Tubs, toilets, vanities, tile, fixtures'
    },
    kitchen: {
      name: 'Kitchen Products',
      trigger: 'HTTP Header: AC-Policy-Room',
      filter_type: 'attribute_match',
      attribute: 'room_category',
      value: 'kitchen',
      description: 'Shows kitchen-specific products',
      use_case: 'Lisa selecting materials for kitchen remodel',
      products_shown: 'Cabinets, countertops, sinks, appliances'
    },
    any_room: {
      name: 'Universal Room Products',
      trigger: 'HTTP Header: AC-Policy-Room',
      filter_type: 'attribute_match',
      attribute: 'room_category',
      value: 'any',
      description: 'Shows products applicable to any room',
      use_case: 'Lisa browsing materials usable in multiple room types',
      products_shown: 'Flooring, paint, trim, lighting, drywall'
    }
  },

  // ==================================================================
  // DAVID THOMPSON (Pro Homeowner) - Deck Wizard Policies
  // ==================================================================
  
  DECK_SHAPE: {
    rectangular: {
      name: 'Rectangular Deck Products',
      trigger: 'HTTP Header: AC-Policy-Deck-Shape',
      filter_type: 'attribute_match',
      attribute: 'deck_shape',
      value: 'rectangular',
      description: 'Shows products compatible with rectangular deck layouts',
      use_case: 'David building 16x20 rectangular deck',
      products_shown: 'Standard decking, joists, railings for rectangular layout'
    },
    l_shaped: {
      name: 'L-Shaped Deck Products',
      trigger: 'HTTP Header: AC-Policy-Deck-Shape',
      filter_type: 'attribute_match',
      attribute: 'deck_shape',
      value: 'l_shaped',
      description: 'Shows products compatible with L-shaped deck layouts',
      use_case: 'David building L-shaped deck around corner of house',
      products_shown: 'Decking, corner joists, angled railings'
    },
    multi_level: {
      name: 'Multi-Level Deck Products',
      trigger: 'HTTP Header: AC-Policy-Deck-Shape',
      filter_type: 'attribute_match',
      attribute: 'deck_shape',
      value: 'multi_level',
      description: 'Shows products for multi-level deck construction',
      use_case: 'David building tiered deck with multiple levels',
      products_shown: 'Step systems, level transitions, cascading railings'
    }
  },

  DECK_MATERIAL: {
    wood: {
      name: 'Wood Decking Material',
      trigger: 'HTTP Header: AC-Policy-Deck-Material',
      filter_type: 'attribute_match',
      attribute: 'deck_material_type',
      value: 'wood',
      description: 'Shows wood decking products and compatible accessories',
      use_case: 'David selecting pressure-treated lumber decking',
      products_shown: 'PT lumber, wood stain, wood screws, wood railings',
      maintenance: 'Seal every 2 years',
      lifespan: '15-20 years'
    },
    composite: {
      name: 'Composite Decking Material',
      trigger: 'HTTP Header: AC-Policy-Deck-Material',
      filter_type: 'attribute_match',
      attribute: 'deck_material_type',
      value: 'composite',
      description: 'Shows composite decking products and compatible accessories',
      use_case: 'David selecting low-maintenance composite decking',
      products_shown: 'Composite boards, hidden fasteners, composite railings',
      maintenance: 'Wash annually',
      lifespan: '25-30 years'
    },
    pvc: {
      name: 'PVC Decking Material',
      trigger: 'HTTP Header: AC-Policy-Deck-Material',
      filter_type: 'attribute_match',
      attribute: 'deck_material_type',
      value: 'pvc',
      description: 'Shows PVC decking products and compatible accessories',
      use_case: 'David selecting premium PVC decking',
      products_shown: 'PVC boards, specialized fasteners, PVC railings',
      maintenance: 'Minimal maintenance',
      lifespan: '30+ years'
    }
  },

  DECK_COMPATIBLE: {
    true: {
      name: 'Deck-Compatible Products',
      trigger: 'HTTP Header: AC-Policy-Deck-Compatible',
      filter_type: 'attribute_match',
      attribute: 'deck_compatible',
      value: true,
      description: 'Shows only products usable in deck projects',
      use_case: 'David in deck wizard - sees only relevant products',
      products_shown: 'Decking, joists, railings, post caps, lighting, fasteners'
    }
  },

  // ==================================================================
  // KEVIN RODRIGUEZ (Store Manager) - Restock Dashboard Policies
  // ==================================================================
  
  STORE_VELOCITY: {
    high_velocity: {
      name: 'High Velocity Products',
      trigger: 'HTTP Header: AC-Policy-Velocity',
      filter_type: 'attribute_match',
      attribute: 'store_velocity_category',
      value: 'high',
      description: 'Shows fast-moving products needing frequent restock',
      use_case: 'Kevin viewing high-priority restock items',
      products_shown: 'Common lumber, popular fasteners, high-turnover items',
      restock_frequency: '2-3 times per week'
    },
    medium_velocity: {
      name: 'Medium Velocity Products',
      trigger: 'HTTP Header: AC-Policy-Velocity',
      filter_type: 'attribute_match',
      attribute: 'store_velocity_category',
      value: 'medium',
      description: 'Shows moderate-moving products',
      use_case: 'Kevin reviewing standard restock items',
      products_shown: 'Specialty lumber, seasonal items',
      restock_frequency: 'Weekly'
    },
    low_velocity: {
      name: 'Low Velocity Products',
      trigger: 'HTTP Header: AC-Policy-Velocity',
      filter_type: 'attribute_match',
      attribute: 'store_velocity_category',
      value: 'low',
      description: 'Shows slow-moving specialty products',
      use_case: 'Kevin checking specialty item stock levels',
      products_shown: 'Specialty items, rare materials',
      restock_frequency: 'As needed / monthly'
    }
  },

  RESTOCK_PRIORITY: {
    critical: {
      name: 'Critical Restock Priority',
      trigger: 'HTTP Header: AC-Policy-Restock-Priority',
      filter_type: 'attribute_match',
      attribute: 'restock_priority',
      value: 'critical',
      description: 'Shows items at critically low stock levels',
      use_case: 'Kevin viewing items needing immediate reorder',
      products_shown: 'Items below minimum stock threshold',
      action_required: 'Order today'
    },
    high: {
      name: 'High Restock Priority',
      trigger: 'HTTP Header: AC-Policy-Restock-Priority',
      filter_type: 'attribute_match',
      attribute: 'restock_priority',
      value: 'high',
      description: 'Shows items approaching restock threshold',
      use_case: 'Kevin planning next restock order',
      products_shown: 'Items at 20-40% of optimal stock',
      action_required: 'Order within 2-3 days'
    },
    medium: {
      name: 'Medium Restock Priority',
      trigger: 'HTTP Header: AC-Policy-Restock-Priority',
      filter_type: 'attribute_match',
      attribute: 'restock_priority',
      value: 'medium',
      description: 'Shows items with adequate but declining stock',
      use_case: 'Kevin monitoring upcoming needs',
      products_shown: 'Items at 40-60% of optimal stock',
      action_required: 'Order within 1 week'
    }
  },

  // ==================================================================
  // UNIVERSAL POLICIES (All Personas)
  // ==================================================================

  PROJECT_TYPE: {
    new_construction: {
      name: 'New Construction Project',
      trigger: 'HTTP Header: AC-Policy-Project-Type',
      filter_type: 'include_categories',
      categories: ['structural_materials', 'fasteners_hardware', 'roofing'],
      description: 'Shows products relevant to new construction projects',
      use_case: 'Any persona filtering for new construction materials',
      products_shown: 'Structural lumber, concrete, fasteners, roofing'
    },
    remodel: {
      name: 'Remodel Project',
      trigger: 'HTTP Header: AC-Policy-Project-Type',
      filter_type: 'include_categories',
      categories: ['windows_doors', 'flooring', 'drywall', 'fixtures'],
      description: 'Shows products for remodel projects',
      use_case: 'Any persona filtering for remodel materials',
      products_shown: 'Windows, doors, flooring, trim, fixtures'
    },
    repair: {
      name: 'Repair Project',
      trigger: 'HTTP Header: AC-Policy-Project-Type',
      filter_type: 'include_all',
      description: 'Shows all products for repair work',
      use_case: 'Any persona browsing for repair materials',
      products_shown: 'All product categories (repairs vary widely)'
    }
  }
};

/**
 * Generate human-readable policy configuration guide
 * This generates markdown documentation for ACO Admin UI setup
 */
export function generatePolicyGuide() {
  let guide = '# ACO Triggered Policy Setup Guide\n\n';
  guide += '**Purpose**: Manual configuration guide for ACO Admin UI\n\n';
  guide += '**IMPORTANT**: Triggered policies cannot be created via API. Each policy below must be created manually in the ACO Admin interface.\n\n';
  guide += '---\n\n';
  guide += '## Overview\n\n';
  guide += `This guide documents **${Object.keys(POLICY_DEFINITIONS).length} policy categories** with **${getTotalPolicyCount()} individual policies** for the BuildRight persona demo.\n\n`;
  guide += '### Policy Categories\n\n';
  
  Object.keys(POLICY_DEFINITIONS).forEach((category, idx) => {
    const policyCount = Object.keys(POLICY_DEFINITIONS[category]).length;
    guide += `${idx + 1}. **${category}**: ${policyCount} policies\n`;
  });
  
  guide += '\n---\n\n';
  
  // Generate detailed sections for each category
  Object.entries(POLICY_DEFINITIONS).forEach(([category, policies]) => {
    guide += `## ${category.replace(/_/g, ' ')}\n\n`;
    
    Object.entries(policies).forEach(([key, policy]) => {
      guide += `### Policy: ${policy.name}\n\n`;
      guide += `**Policy ID**: \`${key}\`\n\n`;
      guide += `**Configuration in ACO Admin UI:**\n\n`;
      guide += `- **Name**: ${policy.name}\n`;
      guide += `- **Trigger**: ${policy.trigger}\n`;
      guide += `- **Filter Type**: ${policy.filter_type}\n`;
      
      if (policy.attribute) {
        guide += `- **Attribute**: \`${policy.attribute}\`\n`;
        guide += `- **Value**: \`${policy.value}\`\n`;
      }
      
      if (policy.categories) {
        guide += `- **Categories**: ${policy.categories.join(', ')}\n`;
      }
      
      guide += `\n**Description**: ${policy.description}\n\n`;
      guide += `**Use Case**: ${policy.use_case}\n\n`;
      guide += `**Products Shown**: ${policy.products_shown}\n\n`;
      
      if (policy.price_range) {
        guide += `**Price Range**: ${policy.price_range}\n\n`;
      }
      
      if (policy.maintenance) {
        guide += `**Maintenance**: ${policy.maintenance}\n\n`;
        guide += `**Lifespan**: ${policy.lifespan}\n\n`;
      }
      
      if (policy.restock_frequency) {
        guide += `**Restock Frequency**: ${policy.restock_frequency}\n\n`;
      }
      
      if (policy.action_required) {
        guide += `**Action Required**: ${policy.action_required}\n\n`;
      }
      
      guide += '---\n\n';
    });
  });
  
  // Add implementation notes
  guide += '## Implementation Notes\n\n';
  guide += '### HTTP Header Format\n\n';
  guide += 'When querying the ACO GraphQL API, policies are triggered via HTTP headers:\n\n';
  guide += '```http\n';
  guide += 'AC-Policy-Phase: foundation_framing\n';
  guide += 'AC-Policy-Quality: professional\n';
  guide += 'AC-Policy-Deck-Shape: rectangular\n';
  guide += '```\n\n';
  guide += '### Frontend Implementation\n\n';
  guide += '```javascript\n';
  guide += '// Example: Marcus selecting Phase 1 materials\n';
  guide += 'const response = await fetch(ACO_GRAPHQL_ENDPOINT, {\n';
  guide += '  method: \'POST\',\n';
  guide += '  headers: {\n';
  guide += '    \'AC-Policy-Phase\': \'foundation_framing\',\n';
  guide += '    \'AC-Policy-Quality\': \'professional\'\n';
  guide += '  },\n';
  guide += '  body: JSON.stringify({ query: PRODUCTS_QUERY })\n';
  guide += '});\n';
  guide += '```\n\n';
  guide += '### Testing Policies\n\n';
  guide += '1. Create policy in ACO Admin UI\n';
  guide += '2. Send GraphQL query with appropriate HTTP header\n';
  guide += '3. Verify product list is filtered correctly\n';
  guide += '4. Test with multiple policies (they combine with AND logic)\n\n';
  
  return guide;
}

/**
 * Get total count of all policies across categories
 */
function getTotalPolicyCount() {
  return Object.values(POLICY_DEFINITIONS).reduce((total, category) => {
    return total + Object.keys(category).length;
  }, 0);
}

/**
 * Get policies for a specific persona
 */
export function getPoliciesForPersona(persona) {
  const personaPolicies = {
    sarah: ['CONSTRUCTION_PHASE'], // Production builder uses templates, less policy-driven
    marcus: ['CONSTRUCTION_PHASE', 'QUALITY_TIER', 'PROJECT_TYPE'],
    lisa: ['PACKAGE_TIER', 'ROOM_CATEGORY', 'PROJECT_TYPE'],
    david: ['DECK_SHAPE', 'DECK_MATERIAL', 'DECK_COMPATIBLE'],
    kevin: ['STORE_VELOCITY', 'RESTOCK_PRIORITY']
  };
  
  return personaPolicies[persona] || [];
}

/**
 * Export summary statistics for documentation
 */
export function getPolicySummary() {
  return {
    totalCategories: Object.keys(POLICY_DEFINITIONS).length,
    totalPolicies: getTotalPolicyCount(),
    categories: Object.keys(POLICY_DEFINITIONS),
    personaMapping: {
      'Sarah Martinez (Production Builder)': getPoliciesForPersona('sarah'),
      'Marcus Johnson (General Contractor)': getPoliciesForPersona('marcus'),
      'Lisa Chen (Remodeling Contractor)': getPoliciesForPersona('lisa'),
      'David Thompson (Pro Homeowner)': getPoliciesForPersona('david'),
      'Kevin Rodriguez (Store Manager)': getPoliciesForPersona('kevin')
    }
  };
}

