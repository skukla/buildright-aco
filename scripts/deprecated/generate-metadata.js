/**
 * ACO Metadata Attribute Generation Script
 * Generates industry-appropriate metadata attributes for BuildRight catalog
 *
 * Based on BMD catalog structure and construction industry standards including:
 * - ASTM standards (lumber, drywall, fasteners, safety equipment)
 * - ANSI/ISEA standards (PPE, safety equipment)
 * - NFRC standards (windows and doors energy ratings)
 * - Construction material industry best practices
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateSchema } from '../shared/schema-validator.js';
import logger from '../shared/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Industry-appropriate metadata attributes for BuildRight catalog
 * Uses semantic attribute IDs (lumber_species, drywall_thickness, etc.)
 * instead of generic codes (attr_001, attr_002)
 */
function getBuildRightMetadata() {
  return [
    // Core Attributes (apply to all products)
    {
      attributeId: 'br_product_category',
      label: 'Product Category',
      type: 'select',
      isRequired: true,
      defaultValue: null,
      sortOrder: 1,
      options: [
        { value: 'structural_materials', label: 'Structural Materials' },
        { value: 'framing_insulation', label: 'Framing & Insulation' },
        { value: 'windows_doors', label: 'Windows & Doors' },
        { value: 'fasteners_hardware', label: 'Fasteners & Hardware' },
        { value: 'safety_equipment', label: 'Safety Equipment' }
      ]
    },
    {
      attributeId: 'br_brand',
      label: 'Brand',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 2,
      options: [
        { value: 'buildright_pro', label: 'BuildRight Pro' },
        { value: 'structuremaster', label: 'StructureMaster' },
        { value: 'proframe', label: 'ProFrame' },
        { value: 'safeguard', label: 'SafeGuard' },
        { value: 'fastenpro', label: 'FastenPro' },
        { value: 'durabuilt', label: 'DuraBuilt' },
        { value: 'toughgrip', label: 'ToughGrip' },
        { value: 'maxstrength', label: 'MaxStrength' },
        { value: 'premiumbuild', label: 'PremiumBuild' },
        { value: 'reliabuild', label: 'ReliaBuild' }
      ]
    },
    {
      attributeId: 'br_unit_of_measure',
      label: 'Unit of Measure',
      type: 'select',
      isRequired: true,
      defaultValue: 'EA',
      sortOrder: 3,
      options: [
        { value: 'EA', label: 'Each' },
        { value: 'LF', label: 'Linear Foot' },
        { value: 'SF', label: 'Square Foot' },
        { value: 'BOX', label: 'Box' },
        { value: 'BUNDLE', label: 'Bundle' },
        { value: 'PALLET', label: 'Pallet' },
        { value: 'BAG', label: 'Bag' },
        { value: 'ROLL', label: 'Roll' },
        { value: 'PAIR', label: 'Pair' },
        { value: 'SHEET', label: 'Sheet' },
        { value: 'GALLON', label: 'Gallon' },
        { value: 'CASE', label: 'Case' }
      ]
    },
    {
      attributeId: 'br_project_types',
      label: 'Project Types',
      type: 'multiselect',
      isRequired: false,
      defaultValue: null,
      sortOrder: 4,
      options: [
        { value: 'new_construction', label: 'New Construction' },
        { value: 'remodel', label: 'Remodel/Renovation' },
        { value: 'repair', label: 'Repair/Maintenance' },
        { value: 'restoration', label: 'Restoration' }
      ]
    },

    // Lumber Attributes (sortOrder 10-19)
    {
      attributeId: 'br_lumber_species',
      label: 'Lumber Species',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 10,
      options: [
        { value: 'southern_yellow_pine', label: 'Southern Yellow Pine (SYP)' },
        { value: 'spruce_pine_fir', label: 'Spruce-Pine-Fir (SPF)' },
        { value: 'douglas_fir_larch', label: 'Douglas Fir-Larch (DF-L)' },
        { value: 'hem_fir', label: 'Hem-Fir' },
        { value: 'western_red_cedar', label: 'Western Red Cedar' },
        { value: 'redwood', label: 'Redwood' }
      ]
    },
    {
      attributeId: 'br_lumber_grade',
      label: 'Lumber Grade',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 11,
      options: [
        { value: 'select_structural', label: 'Select Structural' },
        { value: 'no_1', label: 'No. 1' },
        { value: 'no_2', label: 'No. 2' },
        { value: 'no_3', label: 'No. 3' },
        { value: 'stud', label: 'Stud' },
        { value: 'utility', label: 'Utility' },
        { value: 'construction', label: 'Construction' },
        { value: 'standard', label: 'Standard' }
      ]
    },
    {
      attributeId: 'br_lumber_treatment',
      label: 'Lumber Treatment',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 12,
      options: [
        { value: 'kiln_dried', label: 'Kiln-Dried (KD)' },
        { value: 'green', label: 'Green (Unseasoned)' },
        { value: 'pressure_treated_aca', label: 'Pressure-Treated (ACA)' },
        { value: 'pressure_treated_acq', label: 'Pressure-Treated (ACQ)' },
        { value: 'pressure_treated_ca', label: 'Pressure-Treated (CA-C)' },
        { value: 'fire_retardant', label: 'Fire-Retardant Treated' }
      ]
    },
    {
      attributeId: 'br_lumber_certification',
      label: 'Lumber Certification',
      type: 'multiselect',
      isRequired: false,
      defaultValue: null,
      sortOrder: 13,
      options: [
        { value: 'fsc_certified', label: 'FSC Certified' },
        { value: 'fsc_mix', label: 'FSC Mix' },
        { value: 'sfi_certified', label: 'SFI Certified' },
        { value: 'pefc_certified', label: 'PEFC Certified' },
        { value: 'none', label: 'No Certification' }
      ]
    },

    // Drywall Attributes (sortOrder 20-29)
    {
      attributeId: 'br_drywall_thickness',
      label: 'Drywall Thickness',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 20,
      options: [
        { value: '0.25', label: '1/4"' },
        { value: '0.375', label: '3/8"' },
        { value: '0.5', label: '1/2"' },
        { value: '0.625', label: '5/8"' },
        { value: '0.75', label: '3/4"' }
      ]
    },
    {
      attributeId: 'br_drywall_product_type',
      label: 'Drywall Product Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 21,
      options: [
        { value: 'regular', label: 'Regular Gypsum' },
        { value: 'moisture_resistant', label: 'Moisture-Resistant (MR)' },
        { value: 'mold_resistant', label: 'Mold-Resistant' },
        { value: 'fire_rated', label: 'Fire-Rated' },
        { value: 'sound_dampening', label: 'Sound-Dampening' },
        { value: 'impact_resistant', label: 'Impact/Abuse-Resistant' }
      ]
    },
    {
      attributeId: 'br_drywall_fire_rating',
      label: 'Drywall Fire Rating',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 22,
      options: [
        { value: 'non_rated', label: 'Non-Rated' },
        { value: 'type_x', label: 'Type X (1-hour)' },
        { value: 'type_c', label: 'Type C (Enhanced)' }
      ]
    },
    {
      attributeId: 'br_drywall_edge_type',
      label: 'Drywall Edge Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 23,
      options: [
        { value: 'tapered', label: 'Tapered' },
        { value: 'square', label: 'Square' },
        { value: 'beveled', label: 'Beveled' },
        { value: 'tongue_and_groove', label: 'Tongue & Groove' }
      ]
    },

    // Window Attributes (sortOrder 30-39)
    {
      attributeId: 'br_window_material',
      label: 'Window Frame Material',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 30,
      options: [
        { value: 'vinyl', label: 'Vinyl' },
        { value: 'wood', label: 'Wood' },
        { value: 'aluminum', label: 'Aluminum' },
        { value: 'fiberglass', label: 'Fiberglass' },
        { value: 'composite', label: 'Composite' },
        { value: 'clad_wood', label: 'Clad Wood' }
      ]
    },
    {
      attributeId: 'br_window_operation_type',
      label: 'Window Operation Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 31,
      options: [
        { value: 'single_hung', label: 'Single-Hung' },
        { value: 'double_hung', label: 'Double-Hung' },
        { value: 'casement', label: 'Casement' },
        { value: 'awning', label: 'Awning' },
        { value: 'sliding', label: 'Sliding' },
        { value: 'fixed', label: 'Fixed/Picture' },
        { value: 'bay', label: 'Bay' },
        { value: 'bow', label: 'Bow' }
      ]
    },
    {
      attributeId: 'br_window_glazing_type',
      label: 'Window Glazing',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 32,
      options: [
        { value: 'single_pane', label: 'Single Pane' },
        { value: 'double_pane', label: 'Double Pane' },
        { value: 'triple_pane', label: 'Triple Pane' }
      ]
    },
    {
      attributeId: 'br_window_energy_star',
      label: 'Energy Star Certified',
      type: 'boolean',
      isRequired: false,
      defaultValue: false,
      sortOrder: 33
    },

    // Door Attributes (sortOrder 40-49)
    {
      attributeId: 'br_door_type',
      label: 'Door Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 40,
      options: [
        { value: 'entry', label: 'Entry Door' },
        { value: 'interior', label: 'Interior Door' },
        { value: 'patio', label: 'Patio Door' },
        { value: 'french', label: 'French Door' },
        { value: 'storm', label: 'Storm Door' },
        { value: 'bifold', label: 'Bi-Fold Door' }
      ]
    },
    {
      attributeId: 'br_door_material',
      label: 'Door Material',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 41,
      options: [
        { value: 'wood', label: 'Wood' },
        { value: 'steel', label: 'Steel' },
        { value: 'fiberglass', label: 'Fiberglass' },
        { value: 'aluminum', label: 'Aluminum' },
        { value: 'vinyl', label: 'Vinyl' },
        { value: 'composite', label: 'Composite' }
      ]
    },
    {
      attributeId: 'br_door_core_type',
      label: 'Door Core Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 42,
      options: [
        { value: 'solid_wood', label: 'Solid Wood' },
        { value: 'solid_core', label: 'Solid Core' },
        { value: 'hollow_core', label: 'Hollow Core' },
        { value: 'foam_core', label: 'Foam Insulated' }
      ]
    },

    // Fastener Attributes (sortOrder 50-59)
    {
      attributeId: 'br_fastener_type',
      label: 'Fastener Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 50,
      options: [
        { value: 'nail', label: 'Nail' },
        { value: 'screw', label: 'Screw' },
        { value: 'bolt', label: 'Bolt' },
        { value: 'anchor', label: 'Anchor' },
        { value: 'staple', label: 'Staple' }
      ]
    },
    {
      attributeId: 'br_fastener_subtype',
      label: 'Fastener Subtype',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 51,
      options: [
        { value: 'common_nail', label: 'Common Nail' },
        { value: 'finish_nail', label: 'Finish Nail' },
        { value: 'brad_nail', label: 'Brad Nail' },
        { value: 'roofing_nail', label: 'Roofing Nail' },
        { value: 'framing_nail', label: 'Framing Nail' },
        { value: 'wood_screw', label: 'Wood Screw' },
        { value: 'drywall_screw', label: 'Drywall Screw' },
        { value: 'deck_screw', label: 'Deck Screw' },
        { value: 'self_drilling_screw', label: 'Self-Drilling Screw' },
        { value: 'lag_screw', label: 'Lag Screw' }
      ]
    },
    {
      attributeId: 'br_fastener_material',
      label: 'Fastener Material',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 52,
      options: [
        { value: 'steel', label: 'Carbon Steel' },
        { value: 'stainless_steel_304', label: 'Stainless Steel 304' },
        { value: 'stainless_steel_316', label: 'Stainless Steel 316 (Marine)' },
        { value: 'brass', label: 'Brass' },
        { value: 'aluminum', label: 'Aluminum' }
      ]
    },
    {
      attributeId: 'br_fastener_coating',
      label: 'Fastener Coating/Finish',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 53,
      options: [
        { value: 'bright', label: 'Bright (Uncoated)' },
        { value: 'zinc_plated', label: 'Zinc Plated' },
        { value: 'galvanized', label: 'Galvanized' },
        { value: 'hot_dip_galvanized', label: 'Hot-Dip Galvanized' },
        { value: 'ceramic_coated', label: 'Ceramic Coated' },
        { value: 'polymer_coated', label: 'Polymer Coated' }
      ]
    },
    {
      attributeId: 'br_fastener_head_type',
      label: 'Fastener Head Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 54,
      options: [
        { value: 'flat', label: 'Flat/Countersunk' },
        { value: 'pan', label: 'Pan' },
        { value: 'round', label: 'Round' },
        { value: 'hex', label: 'Hex' },
        { value: 'bugle', label: 'Bugle' },
        { value: 'truss', label: 'Truss' }
      ]
    },
    {
      attributeId: 'br_fastener_drive_type',
      label: 'Fastener Drive Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 55,
      options: [
        { value: 'phillips', label: 'Phillips' },
        { value: 'square', label: 'Square (Robertson)' },
        { value: 'torx', label: 'Torx (Star)' },
        { value: 'hex', label: 'Hex' },
        { value: 'slotted', label: 'Slotted' },
        { value: 'combination', label: 'Combination' }
      ]
    },

    // PPE / Safety Equipment Attributes (sortOrder 60-69)
    {
      attributeId: 'br_ppe_category',
      label: 'PPE Category',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 60,
      options: [
        { value: 'head_protection', label: 'Head Protection' },
        { value: 'eye_protection', label: 'Eye Protection' },
        { value: 'hearing_protection', label: 'Hearing Protection' },
        { value: 'hand_protection', label: 'Hand Protection' },
        { value: 'respiratory_protection', label: 'Respiratory Protection' },
        { value: 'fall_protection', label: 'Fall Protection' },
        { value: 'high_visibility', label: 'High-Visibility Apparel' },
        { value: 'foot_protection', label: 'Foot Protection' }
      ]
    },
    {
      attributeId: 'br_ppe_ansi_standard',
      label: 'ANSI Standard',
      type: 'multiselect',
      isRequired: false,
      defaultValue: null,
      sortOrder: 61,
      options: [
        { value: 'z89_1', label: 'ANSI Z89.1 (Head)' },
        { value: 'z87_1', label: 'ANSI Z87.1 (Eye)' },
        { value: 's3_19', label: 'ANSI S3.19 (Hearing)' },
        { value: 'isea_105', label: 'ANSI/ISEA 105 (Hand)' },
        { value: 'z359', label: 'ANSI Z359 (Fall)' },
        { value: 'isea_107', label: 'ANSI/ISEA 107 (Hi-Vis)' },
        { value: 'astm_f2413', label: 'ASTM F2413 (Foot)' }
      ]
    },
    {
      attributeId: 'br_ppe_hard_hat_type',
      label: 'Hard Hat Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 62,
      options: [
        { value: 'type_1', label: 'Type 1 (Top Impact)' },
        { value: 'type_2', label: 'Type 2 (Top & Lateral)' }
      ]
    },
    {
      attributeId: 'br_ppe_hard_hat_class',
      label: 'Hard Hat Electrical Class',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 63,
      options: [
        { value: 'class_e', label: 'Class E (Electrical - 20kV)' },
        { value: 'class_g', label: 'Class G (General - 2.2kV)' },
        { value: 'class_c', label: 'Class C (Conductive)' }
      ]
    },
    {
      attributeId: 'br_ppe_nrr_rating',
      label: 'NRR Rating (dB)',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 64,
      options: [
        { value: '20', label: '20 dB' },
        { value: '22', label: '22 dB' },
        { value: '25', label: '25 dB' },
        { value: '27', label: '27 dB' },
        { value: '29', label: '29 dB' },
        { value: '30', label: '30 dB' },
        { value: '31', label: '31 dB' },
        { value: '32', label: '32 dB' },
        { value: '33', label: '33 dB' }
      ]
    },
    {
      attributeId: 'br_ppe_cut_resistance',
      label: 'Cut Resistance Level',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 65,
      options: [
        { value: 'a1', label: 'A1 (200-499g)' },
        { value: 'a2', label: 'A2 (500-999g)' },
        { value: 'a3', label: 'A3 (1000-1499g)' },
        { value: 'a4', label: 'A4 (1500-2199g)' },
        { value: 'a5', label: 'A5 (2200-2999g)' },
        { value: 'a6', label: 'A6 (3000-3999g)' },
        { value: 'a7', label: 'A7 (4000-4999g)' },
        { value: 'a8', label: 'A8 (5000-5999g)' },
        { value: 'a9', label: 'A9 (6000+g)' }
      ]
    },
    {
      attributeId: 'br_ppe_niosh_rating',
      label: 'NIOSH Filter Rating',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 66,
      options: [
        { value: 'n95', label: 'N95 (95% filtration)' },
        { value: 'n99', label: 'N99 (99% filtration)' },
        { value: 'n100', label: 'N100 (99.97% filtration)' },
        { value: 'p95', label: 'P95 (Oil-proof, 95%)' },
        { value: 'p99', label: 'P99 (Oil-proof, 99%)' },
        { value: 'p100', label: 'P100 (Oil-proof, 99.97%)' }
      ]
    },
    {
      attributeId: 'br_ppe_hi_vis_class',
      label: 'High-Visibility Class',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 67,
      options: [
        { value: 'class_1', label: 'Class 1 (Minimal)' },
        { value: 'class_2', label: 'Class 2 (Medium)' },
        { value: 'class_3', label: 'Class 3 (High)' }
      ]
    },
    {
      attributeId: 'br_ppe_size',
      label: 'PPE Size',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 68,
      options: [
        { value: 'xs', label: 'XS' },
        { value: 's', label: 'S' },
        { value: 'm', label: 'M' },
        { value: 'l', label: 'L' },
        { value: 'xl', label: 'XL' },
        { value: 'xxl', label: 'XXL' },
        { value: 'xxxl', label: '3XL' },
        { value: 'universal', label: 'Universal' }
      ]
    },
    {
      attributeId: 'br_sheathing_location',
      label: 'Sheathing Location',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 70,
      options: [
        { value: 'wall', label: 'Wall' },
        { value: 'roof', label: 'Roof' },
        { value: 'subfloor', label: 'Subfloor' }
      ]
    },
    {
      attributeId: 'br_underlayment_type',
      label: 'Underlayment Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 71,
      options: [
        { value: 'felt_15lb', label: '15# Felt' },
        { value: 'felt_30lb', label: '30# Felt' },
        { value: 'synthetic', label: 'Synthetic Underlayment' },
        { value: 'ice_water_shield', label: 'Ice & Water Shield' }
      ]
    },
    {
      attributeId: 'br_insulation_type',
      label: 'Insulation Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 72,
      options: [
        { value: 'fiberglass_batt', label: 'Fiberglass Batt' },
        { value: 'mineral_wool', label: 'Mineral Wool' },
        { value: 'spray_foam', label: 'Spray Foam' },
        { value: 'cellulose', label: 'Cellulose' }
      ]
    },
    {
      attributeId: 'br_insulation_r_value',
      label: 'Insulation R-Value',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 73,
      options: [
        { value: 'r13', label: 'R-13' },
        { value: 'r15', label: 'R-15' },
        { value: 'r19', label: 'R-19' },
        { value: 'r21', label: 'R-21' },
        { value: 'r30', label: 'R-30' }
      ]
    },
    {
      attributeId: 'br_light_type',
      label: 'Light Fixture Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 74,
      options: [
        { value: 'recessed', label: 'Recessed' },
        { value: 'flush_mount', label: 'Flush Mount' },
        { value: 'pendant', label: 'Pendant' },
        { value: 'chandelier', label: 'Chandelier' }
      ]
    },
    {
      attributeId: 'br_light_technology',
      label: 'Light Technology',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 75,
      options: [
        { value: 'led', label: 'LED' },
        { value: 'cfl', label: 'CFL' },
        { value: 'incandescent', label: 'Incandescent' }
      ]
    },
    {
      attributeId: 'br_fixture_type',
      label: 'Plumbing Fixture Type',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 76,
      options: [
        { value: 'faucet', label: 'Faucet' },
        { value: 'sink', label: 'Sink' },
        { value: 'toilet', label: 'Toilet' },
        { value: 'shower', label: 'Shower' }
      ]
    },
    {
      attributeId: 'br_fixture_location',
      label: 'Fixture Location',
      type: 'select',
      isRequired: false,
      defaultValue: null,
      sortOrder: 77,
      options: [
        { value: 'kitchen', label: 'Kitchen' },
        { value: 'bathroom', label: 'Bathroom' },
        { value: 'utility', label: 'Utility' }
      ]
    }
  ];
}

/**
 * Generate metadata attributes for ACO catalog
 *
 * @param {Object} config - Generation configuration
 * @param {string} config.outputPath - Output file path
 * @returns {Promise<Array>} Generated metadata attributes
 */
export async function generateMetadata(config = {}) {
  const {
    outputPath = './data/buildright/metadata.json'
  } = config;

  logger.info('Metadata Generation Started', { outputPath });

  // Get industry-appropriate metadata
  const attributes = getBuildRightMetadata();

  // Validate against schema
  const validationResult = validateSchema(attributes, 'aco-metadata');
  if (!validationResult.isValid) {
    logger.error('Schema Validation Failed', { errors: validationResult.errors });
    throw new Error(`Schema validation failed: ${validationResult.errors.join(', ')}`);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Write to file with proper formatting
  await fs.writeFile(outputPath, JSON.stringify(attributes, null, 2), 'utf8');

  // Get file size for logging
  const stats = await fs.stat(outputPath);

  logger.info('Metadata Generation Complete', {
    count: attributes.length,
    outputPath,
    fileSize: stats.size,
    requiredAttributes: attributes.filter(a => a.isRequired).length,
    typeCounts: {
      text: attributes.filter(a => a.type === 'text').length,
      select: attributes.filter(a => a.type === 'select').length,
      multiselect: attributes.filter(a => a.type === 'multiselect').length,
      boolean: attributes.filter(a => a.type === 'boolean').length
    }
  });

  return attributes;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = {
    outputPath: process.env.OUTPUT_PATH || './data/buildright/metadata.json'
  };

  try {
    await generateMetadata(config);
    process.exit(0);
  } catch (error) {
    logger.error('Metadata Generation Failed', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    process.exit(1);
  }
}
