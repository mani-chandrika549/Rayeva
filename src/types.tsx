export interface ProductResult {
  primary_category: string;
  sub_category: string;
  seo_tags: string[];
  sustainability_filters: string[];
}

export interface ProposalResult {
  product_mix: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
  budget_allocation: Record<string, number>;
  cost_breakdown: string;
  impact_summary: string;
}

export interface ImpactResult {
  plastic_saved: number;
  carbon_avoided: number;
  local_impact: string;
  impact_statement: string;
}

export interface AiLog {
  id: number;
  module: string;
  prompt: string;
  response: string;
  timestamp: string;
}
