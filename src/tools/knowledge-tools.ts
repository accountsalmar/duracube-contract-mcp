import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { GetPrinciplesInput, GetLearnedCorrectionsInput, GetFinanceExtractionGuideInput, GetSectionPrincipleMappingInput } from '../schemas/tool-schemas.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JSON knowledge files
const principlesPath = join(__dirname, '..', 'knowledge', 'principles.json');
const learningsPath = join(__dirname, '..', 'knowledge', 'learnings.json');
const formatPath = join(__dirname, '..', 'knowledge', 'format.json');
const financeExtractionPath = join(__dirname, '..', 'knowledge', 'finance-extraction.json');
const sectionMappingPath = join(__dirname, '..', 'knowledge', 'section-mapping.json');

interface PrinciplesData {
  principles: Array<{
    id: number;
    name: string;
    standard: string;
    risk_level: string;
    search_terms: {
      primary: string[];
      alternative: string[];
      related: string[];
    };
    red_flags: string[];
    compliance_logic: {
      compliant_if: string;
      non_compliant_if: string;
      no_term_risk: string;
      special_note?: string;
      critical_alert?: string;
    };
    negotiation_positions: {
      preferred: string;
      fallback: string;
      deal_breaker: string;
    };
    departure_template: string;
  }>;
  critical_non_negotiables: Record<string, unknown>;
  methodology: Record<string, unknown>;
  interconnected_principles: Array<unknown>;
}

interface LearningsData {
  learnings: Array<{
    id: string;
    category: string;
    principle_id: number | null;
    date_logged?: string;
    issue: string;
    correction: string;
    rule: string;
    examples?: Record<string, string | string[]>;
    interconnected_principles?: number[];
    decision_tree?: Record<string, string>;
  }>;
  decision_trees: Record<string, unknown>;
  category_summaries: Record<string, unknown>;
}

interface FormatData {
  csv_structure: Record<string, unknown>;
  column_specifications: Record<string, unknown>;
  example_rows: string[];
  quality_checklist: string[];
  complete_csv_example: string;
}

interface FinanceExtractionData {
  tool_metadata: {
    name: string;
    version: string;
    purpose: string;
    design_principle: string;
  };
  business_context: {
    company: string;
    industry: string;
    typical_contracts: string[];
    contract_value_range: string;
    regulatory_context: string;
  };
  target_audience: {
    team: string;
    responsibilities: string[];
    use_case: string;
  };
  extraction_categories: Array<{
    id: number;
    name: string;
    description: string;
    alternative_names?: string[];
    search_terms: {
      primary: string[];
      secondary: string[];
      related: string[];
    };
    extraction_rules: string[];
    output_fields: Record<string, string>;
  }>;
  extraction_methodology: {
    document_scan_order: Array<{
      priority: number;
      section: string;
      rationale: string;
    }>;
    extraction_rules: string[];
  };
  edge_case_handling: Record<string, unknown>;
  output_format: {
    style_requirements: Record<string, string>;
    json_structure: Record<string, unknown>;
  };
  validation_checklist: string[];
  explicit_constraints: {
    do_not: string[];
  };
  domain_expertise: {
    regulatory_knowledge: string[];
    contract_standards: string[];
    terminology: Record<string, string>;
  };
}

interface SectionMappingData {
  metadata: {
    version: string;
    purpose: string;
    created: string;
    usage: string;
  };
  large_contract_guidance: {
    when_to_use: string;
    strategy: string;
    workflow: string[];
    token_estimates: {
      per_page_average_tokens: number;
      claude_context_limit: number;
      safe_chunk_size_pages: number;
      recommended_chunk_size_pages: number;
    };
  };
  section_groups: Array<{
    group_id: string;
    group_name: string;
    typical_sections: string[];
    page_range_hint: string;
    principles_to_check: number[];
    principle_details: Array<{
      id: number;
      name: string;
      search_for: string;
    }>;
    critical_alerts?: string[];
    analysis_prompt: string;
  }>;
  quick_reference: {
    non_negotiable_principles: {
      ids: number[];
      groups_containing: string[];
      note: string;
    };
    negotiable_principles: {
      ids: number[];
      groups_containing: string[];
      note: string;
    };
    principle_to_group_map: Record<string, string>;
  };
  combining_results_template: {
    instruction: string;
    format: string;
    ordering: string[];
    final_prompt: string;
  };
}

let principlesData: PrinciplesData;
let learningsData: LearningsData;
let formatData: FormatData;
let financeExtractionData: FinanceExtractionData;
let sectionMappingData: SectionMappingData;

// Load data lazily to avoid issues during module initialization
function loadData() {
  if (!principlesData) {
    principlesData = JSON.parse(readFileSync(principlesPath, 'utf-8'));
  }
  if (!learningsData) {
    learningsData = JSON.parse(readFileSync(learningsPath, 'utf-8'));
  }
  if (!formatData) {
    formatData = JSON.parse(readFileSync(formatPath, 'utf-8'));
  }
  if (!financeExtractionData) {
    financeExtractionData = JSON.parse(readFileSync(financeExtractionPath, 'utf-8'));
  }
  if (!sectionMappingData) {
    sectionMappingData = JSON.parse(readFileSync(sectionMappingPath, 'utf-8'));
  }
}

/**
 * Get all 28 DuraCube commercial principles with standards, search terms,
 * red flags, and compliance logic for contract review
 */
export function getDuracubePrinciples(input: GetPrinciplesInput): string {
  loadData();

  const { include_examples } = input;

  // Build response with principles
  const response: {
    total_principles: number;
    principles: Array<{
      id: number;
      name: string;
      standard: string;
      risk_level: string;
      search_terms: {
        primary: string[];
        alternative: string[];
        related: string[];
      };
      red_flags: string[];
      compliance_logic: {
        compliant_if: string;
        non_compliant_if: string;
        no_term_risk: string;
        special_note?: string;
        critical_alert?: string;
      };
      negotiation_positions: {
        preferred: string;
        fallback: string;
        deal_breaker: string;
      };
      departure_template?: string;
    }>;
    critical_non_negotiables: Record<string, unknown>;
    methodology: Record<string, unknown>;
    interconnected_principles: Array<unknown>;
  } = {
    total_principles: principlesData.principles.length,
    principles: principlesData.principles.map(p => {
      const principle: {
        id: number;
        name: string;
        standard: string;
        risk_level: string;
        search_terms: {
          primary: string[];
          alternative: string[];
          related: string[];
        };
        red_flags: string[];
        compliance_logic: {
          compliant_if: string;
          non_compliant_if: string;
          no_term_risk: string;
          special_note?: string;
          critical_alert?: string;
        };
        negotiation_positions: {
          preferred: string;
          fallback: string;
          deal_breaker: string;
        };
        departure_template?: string;
      } = {
        id: p.id,
        name: p.name,
        standard: p.standard,
        risk_level: p.risk_level,
        search_terms: p.search_terms,
        red_flags: p.red_flags,
        compliance_logic: p.compliance_logic,
        negotiation_positions: p.negotiation_positions,
      };

      if (include_examples) {
        principle.departure_template = p.departure_template;
      }

      return principle;
    }),
    critical_non_negotiables: principlesData.critical_non_negotiables,
    methodology: principlesData.methodology,
    interconnected_principles: principlesData.interconnected_principles,
  };

  return JSON.stringify(response, null, 2);
}

/**
 * Get documented learnings from past contract review errors -
 * critical edge cases for accurate analysis
 */
export function getLearnedCorrections(input: GetLearnedCorrectionsInput): string {
  loadData();

  const { category } = input;

  // Filter learnings by category if specified
  const filteredLearnings = category === 'all'
    ? learningsData.learnings
    : learningsData.learnings.filter(l => l.category === category);

  const response = {
    total_learnings: filteredLearnings.length,
    filter_applied: category,
    learnings: filteredLearnings,
    decision_trees: learningsData.decision_trees,
    category_summaries: category === 'all'
      ? learningsData.category_summaries
      : { [category]: learningsData.category_summaries[category as keyof typeof learningsData.category_summaries] },
  };

  return JSON.stringify(response, null, 2);
}

/**
 * Get exact CSV format specification for departure schedules
 */
export function getOutputFormat(): string {
  loadData();

  return JSON.stringify(formatData, null, 2);
}

/**
 * Get finance extraction guide for extracting 9 key finance data points from contracts.
 * This is for DuraCube's finance team - EXTRACT ONLY, no assessment or judgment.
 */
export function getFinanceExtractionGuide(input: GetFinanceExtractionGuideInput): string {
  loadData();

  const { include_json_template, category } = input;

  // Category mapping for filtering
  const categoryMap: Record<string, number[]> = {
    all: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    contract_value: [1],
    parties: [2],
    payment: [3, 4],
    retention: [5],
    documentation: [6],
    submission: [7],
    project_manager: [8],
    dollar_values: [9],
  };

  const categoryIds = categoryMap[category] || categoryMap.all;

  // Filter categories based on selection
  const filteredCategories = financeExtractionData.extraction_categories.filter(
    (cat) => categoryIds.includes(cat.id)
  );

  // Build the response
  const response: {
    tool_purpose: string;
    design_principle: string;
    business_context: typeof financeExtractionData.business_context;
    target_audience: typeof financeExtractionData.target_audience;
    total_categories: number;
    filter_applied: string;
    extraction_categories: typeof filteredCategories;
    extraction_methodology: typeof financeExtractionData.extraction_methodology;
    edge_case_handling: typeof financeExtractionData.edge_case_handling;
    validation_checklist: typeof financeExtractionData.validation_checklist;
    explicit_constraints: typeof financeExtractionData.explicit_constraints;
    domain_expertise: typeof financeExtractionData.domain_expertise;
    output_format?: typeof financeExtractionData.output_format;
    json_output_template?: string;
  } = {
    tool_purpose: financeExtractionData.tool_metadata.purpose,
    design_principle: financeExtractionData.tool_metadata.design_principle,
    business_context: financeExtractionData.business_context,
    target_audience: financeExtractionData.target_audience,
    total_categories: filteredCategories.length,
    filter_applied: category,
    extraction_categories: filteredCategories,
    extraction_methodology: financeExtractionData.extraction_methodology,
    edge_case_handling: financeExtractionData.edge_case_handling,
    validation_checklist: financeExtractionData.validation_checklist,
    explicit_constraints: financeExtractionData.explicit_constraints,
    domain_expertise: financeExtractionData.domain_expertise,
  };

  // Include JSON template if requested
  if (include_json_template) {
    response.output_format = financeExtractionData.output_format;
    response.json_output_template = `{
  "extraction_metadata": {
    "document_name": "[PDF filename]",
    "extraction_date": "[DD/MM/YYYY]",
    "total_pages": "[Number]",
    "document_type": "[Subcontract/Supply Agreement/Other]"
  },

  "contract_value": {
    "amount": "$X,XXX,XXX",
    "gst_treatment": "[Exclusive/Inclusive/Not specified]",
    "source": "Page X, Clause X.X"
  },

  "contract_parties": [
    {
      "name": "[Full legal entity name]",
      "role": "[Principal/Head Contractor/Contractor/Subcontractor/Supplier]",
      "abn": "[11-digit ABN or null]",
      "acn": "[9-digit ACN or null]",
      "source": "Page X, Clause X.X"
    }
  ],

  "payment_terms": {
    "frequency": "[Monthly/Progress-based/Milestone/Upon completion]",
    "timing": "[e.g., 'Within 30 business days of valid claim']",
    "claim_due_date": "[e.g., '25th of each month']",
    "reference_period": "[e.g., 'Calendar month']",
    "source": "Page X, Clause X.X"
  },

  "payment_claim_conditions": {
    "required_documents": ["[Document 1]", "[Document 2]"],
    "conditions_precedent": ["[Condition 1]", "[Condition 2]"],
    "submission_email": "[Email address or null]",
    "tax_invoice_requirements": "[Requirements or null]",
    "source": "Page X, Clause X.X"
  },

  "retention_and_securities": {
    "retention_percentage": "[X%]",
    "retention_cap": "[Maximum amount or null]",
    "security_type": "[Bank Guarantee/Cash Retention/Insurance Bond/None required]",
    "security_amount": "[Amount or formula]",
    "release_conditions": "[Conditions for release]",
    "release_timing": "[When security is released]",
    "source": "Page X, Clause X.X"
  },

  "additional_claim_documentation": {
    "subcontractor_statement": "[Required/Not required/State-specific requirement]",
    "other_requirements": ["[Requirement 1]", "[Requirement 2]"],
    "source": "Page X, Clause X.X"
  },

  "claim_submission_method": {
    "method": "[Portal/Email/Hard copy/Multiple]",
    "portal_url": "[URL or null]",
    "email_address": "[Email or null]",
    "special_requirements": "[Any specific instructions or null]",
    "source": "Page X, Clause X.X"
  },

  "project_manager": {
    "name": "[Full name]",
    "company": "[Company they represent]",
    "email": "[Email or null]",
    "phone": "[Phone or null]",
    "source": "Page X, Clause X.X"
  },

  "dollar_values": [
    {
      "amount": "$X,XXX",
      "context": "[What this amount relates to]",
      "source": "Page X"
    }
  ],

  "edge_cases": {
    "conflicts_detected": [],
    "handwritten_amendments": [],
    "external_references": [],
    "conditional_values": []
  },

  "extraction_notes": "[Any factual observations about document quality or structure]"
}`;
  }

  return JSON.stringify(response, null, 2);
}

/**
 * Get section-to-principle mapping for analyzing large contracts in chunks.
 * Use this when contracts exceed token limits - analyze sections in groups.
 */
export function getSectionPrincipleMapping(input: GetSectionPrincipleMappingInput): string {
  loadData();

  const { group_id, include_prompts } = input;

  // Filter section groups if specific group requested
  const filteredGroups = group_id === 'all'
    ? sectionMappingData.section_groups
    : sectionMappingData.section_groups.filter(g => g.group_id === group_id);

  // Build response
  const response: {
    purpose: string;
    when_to_use: string;
    workflow: string[];
    token_guidance: typeof sectionMappingData.large_contract_guidance.token_estimates;
    total_groups: number;
    filter_applied: string;
    section_groups: Array<{
      group_id: string;
      group_name: string;
      typical_sections: string[];
      page_range_hint: string;
      principles_to_check: number[];
      principle_details: Array<{
        id: number;
        name: string;
        search_for: string;
      }>;
      critical_alerts?: string[];
      analysis_prompt?: string;
    }>;
    quick_reference: typeof sectionMappingData.quick_reference;
    combining_results: typeof sectionMappingData.combining_results_template;
  } = {
    purpose: sectionMappingData.metadata.purpose,
    when_to_use: sectionMappingData.large_contract_guidance.when_to_use,
    workflow: sectionMappingData.large_contract_guidance.workflow,
    token_guidance: sectionMappingData.large_contract_guidance.token_estimates,
    total_groups: filteredGroups.length,
    filter_applied: group_id,
    section_groups: filteredGroups.map(g => {
      const group: {
        group_id: string;
        group_name: string;
        typical_sections: string[];
        page_range_hint: string;
        principles_to_check: number[];
        principle_details: Array<{
          id: number;
          name: string;
          search_for: string;
        }>;
        critical_alerts?: string[];
        analysis_prompt?: string;
      } = {
        group_id: g.group_id,
        group_name: g.group_name,
        typical_sections: g.typical_sections,
        page_range_hint: g.page_range_hint,
        principles_to_check: g.principles_to_check,
        principle_details: g.principle_details,
      };

      if (g.critical_alerts) {
        group.critical_alerts = g.critical_alerts;
      }

      if (include_prompts) {
        group.analysis_prompt = g.analysis_prompt;
      }

      return group;
    }),
    quick_reference: sectionMappingData.quick_reference,
    combining_results: sectionMappingData.combining_results_template,
  };

  return JSON.stringify(response, null, 2);
}

// Export tool definitions for MCP registration
export const toolDefinitions = {
  get_duracube_principles: {
    name: 'get_duracube_principles',
    description: `Get all 28 DuraCube commercial principles with standards, search terms, red flags, and compliance logic for contract review.

This tool provides:
- All 28 commercial principles with DuraCube's standards
- Search terms to find relevant contract clauses
- Red flags indicating non-compliant terms
- Compliance logic for classification decisions
- Critical non-negotiables (PI Insurance, unconditional guarantees, parent company guarantees)
- Analysis methodology (3-pass extraction, 3-step comparison)

Use this tool FIRST when reviewing any customer contract against DuraCube standards.`,
    inputSchema: {
      type: 'object',
      properties: {
        include_examples: {
          type: 'boolean',
          default: false,
          description: 'Include departure templates showing example language changes',
        },
      },
    },
  },
  get_learned_corrections: {
    name: 'get_learned_corrections',
    description: `Get documented learnings from past contract review errors - critical edge cases for accurate analysis.

This tool provides:
- Documented errors and their corrections
- Decision trees for complex assessments
- Category-specific rules (security, insurance, DLP, design, methodology)
- Interconnected principle dependencies

Categories:
- security: Bank guarantees, retention, parent company guarantees
- insurance: PI Insurance, coverage limits, favorable absence
- dlp: Defects Liability Period vs Warranty distinction
- design: Design scope limitations, shop drawings
- methodology: Page references, template analysis, favorability assessment

Use this tool to avoid repeating known errors and handle edge cases correctly.`,
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['all', 'security', 'insurance', 'dlp', 'design', 'methodology'],
          default: 'all',
          description: 'Filter learnings by category',
        },
      },
    },
  },
  get_output_format: {
    name: 'get_output_format',
    description: `Get exact CSV format specification for departure schedules.

This tool provides:
- CSV structure with row formats
- Column specifications with validation rules
- Multiple example rows showing correct formatting
- Quality checklist for output validation
- Complete CSV example for reference

CRITICAL RULES:
- Page references MUST include clause numbers: "Page 5, Clause 8.1"
- Status must be: Compliant | Non-Compliant | No Term
- Departures use action verbs: Insert: | Replace: | Amend: | Delete:
- Comments column always empty

Use this tool BEFORE generating the final departure schedule to ensure correct format.`,
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  get_finance_extraction_guide: {
    name: 'get_finance_extraction_guide',
    description: `Get the finance extraction guide for extracting 9 key finance data points from contracts.

PURPOSE: Extract data for DuraCube's accounts receivable and project accounting team.
DESIGN PRINCIPLE: EXTRACT ONLY - no assessment, no comparison, no judgment.

This tool provides:
- 9 extraction categories with search terms and rules
- Document scan methodology (priority section order)
- Edge case handling (conflicts, amendments, external references)
- JSON output template for structured extraction
- Validation checklist
- Domain expertise (SOP Act, AS2124, AS4000 terminology)

EXTRACTION CATEGORIES:
1. Contract Value (Excluding GST)
2. Contract Parties (with ABN/ACN)
3. Payment Terms
4. Payment Claim Conditions
5. Retention and Securities
6. Additional Claim Documentation
7. Claim Submission Method
8. Project Manager
9. Dollar Value Mentions

CRITICAL RULES:
- EXTRACT ONLY - never assess or judge terms
- Do NOT calculate (GST, security amounts, dates)
- Include source reference for every value: "Page X, Clause X.X"
- Use NOT_FOUND with search summary for missing data
- Flag conflicts when values differ across sections

Use this tool when performing FINANCE REVIEW (separate from commercial 28-principle review).`,
    inputSchema: {
      type: 'object',
      properties: {
        include_json_template: {
          type: 'boolean',
          default: true,
          description: 'Include the complete JSON output template in the response',
        },
        category: {
          type: 'string',
          enum: ['all', 'contract_value', 'parties', 'payment', 'retention', 'documentation', 'submission', 'project_manager', 'dollar_values'],
          default: 'all',
          description: 'Filter to specific extraction category',
        },
      },
    },
  },
  get_section_principle_mapping: {
    name: 'get_section_principle_mapping',
    description: `Get section-to-principle mapping for analyzing LARGE contracts that exceed token limits.

PURPOSE: When a contract is too large to analyze in one pass, this tool provides:
- 7 logical section groups (A through G) that map to specific principles
- Ready-to-use analysis prompts for each section
- Guidance on combining results into final departure schedule

SECTION GROUPS:
- Group A: General & Administrative (Principles 1-6)
- Group B: Payment & Security (Principles 14, 15, 16, 24) - contains critical non-negotiables
- Group C: Liability & Indemnity (Principles 7-11)
- Group D: Insurance (Principle 25) - PI Insurance = NON-COMPLIANT
- Group E: Disputes & Legal (Principles 13, 19)
- Group F: Variations, Extensions & Claims (Principles 17, 18, 20-23)
- Group G: Design, Defects & Completion (Principles 12, 26-28)

WORKFLOW:
1. Use this tool to get section-principle mapping
2. Ask user to identify page ranges for each section group
3. Analyze each section group with its mapped principles
4. Combine all results using the provided template

Use this tool when:
- Contract exceeds ~150 pages
- You receive token limit errors
- Contract structure is complex with many schedules

This enables systematic analysis of contracts of ANY size.`,
    inputSchema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          enum: ['all', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
          default: 'all',
          description: 'Filter to specific section group (A=General, B=Payment/Security, C=Liability, D=Insurance, E=Disputes, F=Variations, G=Design/Completion)',
        },
        include_prompts: {
          type: 'boolean',
          default: true,
          description: 'Include ready-to-use analysis prompts for each section group',
        },
      },
    },
  },
};
