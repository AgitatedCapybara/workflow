export type DomainRisk = 'CONSUMER/CASUAL' | 'CONSEQUENTIAL' | 'SAFETY-CRITICAL';
export type ResearchMode = 'DISCOVERY' | 'COMPARISON' | 'HYBRID';
export type ResearchScale = 'STANDARD' | 'LARGE_SURFACE';
export type PipelinePath = 'DEFAULT' | 'EXPANDED';
export type AcquisitionChannel =
  | 'ANY_ALL_CHANNELS'
  | 'CERTIFIED_REFURBISHED'
  | 'NEW_RETAIL'
  | 'MANUFACTURER_DIRECT'
  | 'OPEN_MARKET_USED'
  | 'ANY'
  | 'RETAIL_NEW_ONLY'
  | 'SECONDARY_MARKET'
  | 'DIRECT_MANUFACTURER';

export interface AcquisitionChannelConfig {
  channel: AcquisitionChannel;
  preferred_marketplaces?: string[];
  custom_venues?: string;
  price_basis: 'MSRP' | 'REAL_TIME_STREET_PRICE' | 'COMPLETED_AUCTION_PRICE';
  enforce_as_hard_dealbreaker?: boolean; // Decoupled by default (false = soft guideline & claim tag)
}

export type StageId = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage4a' | 'stage4b' | 'stage5' | 'trackB' | 'trackC';

export interface ClarificationQuestion {
  question: string;
  severity: 'MODERATE' | 'HIGH';
  suggested_resolution: string | null;
}

export interface FocusAreaWeight {
  area: string;
  weight: number;
}

export interface HardDealbreaker {
  id: string;
  description: string;
  dealbreaker_shape: 'THRESHOLD' | 'BINARY';
}

export interface LowSeverityAssumption {
  item: string;
  default_used: string;
}

export interface ComparisonModeSidecar {
  enabled: boolean;
  max_sidecar_queries: number;
  max_candidates_injected: number;
}

export interface RiskScaledThresholds {
  freshness_threshold_months: number;
  diversity_target_min_domains: number;
  statistical_tie_threshold_points: number;
  confidence_caveat_bar: number;
  weight_shift_flagging_pct: number;
  discovery_breadth_floor: {
    min_queries: number;
    min_source_categories: number;
    min_category_first_queries: number;
    focus_guidance: string;
  };
  international_coverage_target: {
    min_non_domestic_sources: number;
  } | null;
  threshold_basis: 'HEURISTIC_DEFAULT' | 'DEVIATION' | 'USER_SPECIFIED';
  threshold_rationale?: string;
}

export interface Stage1Framing {
  stage1_manifest: {
    pipeline_version: string;
    stage_origin: string;
    gate_status: 'CLEAR' | 'CLARIFICATION_NEEDED';
    clarification_questions?: ClarificationQuestion[];
  };
  domain_risk: DomainRisk;
  research_mode: ResearchMode;
  seed_candidates: string[];
  comparison_mode_sidecar?: ComparisonModeSidecar;
  research_scale_flag: ResearchScale;
  discovery_volume_caps: {
    soft_cap_queries: number;
    hard_ceiling_queries: number;
  };
  risk_scaled_thresholds: RiskScaledThresholds;
  decision_focus: string;
  focus_area_weights: FocusAreaWeight[];
  hard_dealbreaker_registry: HardDealbreaker[];
  low_severity_assumptions: LowSeverityAssumption[];
  acquisition_channel_config?: AcquisitionChannelConfig;
}

export interface ClaimEntry {
  claim_id: string;
  candidate: string;
  focus_area: string;
  claim_text: string;
  source: string;
  source_domain: string;
  source_url: string | null;
  url_status: 'LIVE' | 'DEAD' | 'UNAVAILABLE_NO_URL';
  source_tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  source_category: 'INDEPENDENT_TESTING' | 'EDITORIAL_AGGREGATORS' | 'USER_FORUMS_COMMUNITY' | 'REGULATORY_PATENT_DATABASES' | 'MANUFACTURER_DIRECT';
  affiliate_status: string;
  source_type: 'manufacturer' | 'independent_press' | 'user_review' | 'regulatory_filing' | 'forum_anecdote' | 'other';
  publication_date: string;
  verbatim_snippet: string;
  importance_tier: 'CRITICAL' | 'HIGH' | 'MINOR';
  query_intent?: 'STANDARD' | 'CONTRARIAN';
  support_grade?: 'DIRECT' | 'AMBIGUOUS';
}

export interface AuditedClaimEntry extends ClaimEntry {
  verification_status: 'VERIFIED' | 'UNVERIFIED' | 'CAVEATED' | 'CONTRADICTED' | 'UNVERIFIABLE_NO_GROUNDING';
  verification_note: string | null;
  corroborating_domains: string[];
  corroboration_search_logged: boolean;
  laundering_flag: 'NONE' | 'FLAG-CAT-A' | 'FLAG-CAT-B' | 'FLAG-CAT-C' | 'FLAG-CAT-D' | 'FLAG-CAT-E' | 'FLAG-CAT-F' | 'FLAG-CAT-G';
  laundering_flag_corroborated: boolean | null;
  synthetic_indicators?: string[];
  tier_audit_status?: 'CONFIRMED' | 'DOWNGRADED' | 'UPGRADED' | 'UNCHECKED' | 'SOURCE_TIER_UNRESOLVED';
  tier_audit_note?: string | null;
  directness_classification?: 'DIRECT' | 'ADJACENT' | 'INFERRED';
  directness_note?: string;
  arithmetic_consistency?: 'CONSISTENT' | 'FLAGGED' | 'NOT_APPLICABLE';
  arithmetic_consistency_note?: string | null;
}

export interface CandidateDiscoveryLog {
  candidate: string;
  discovery_method: 'BRAND_QUERY' | 'CATEGORY_QUERY' | 'CROSS_REFERENCE' | 'USER_SEED';
  comparison_sidecar_addition?: boolean;
}

export interface Stage2Claims {
  market_survey_log: {
    queries_run: string[];
    source_categories_searched: string[];
    discovery_exhaustion_note: string | null;
    candidates_confirmed: string[];
    candidates_newly_found: string[];
    candidates_ruled_out: { candidate: string; reason: string }[];
    candidate_discovery_log: CandidateDiscoveryLog[];
    concentration_check: {
      trigger_condition_met: boolean;
      corrective_queries_run: number;
      outcome: 'ADDITIONAL_CANDIDATES_FOUND' | 'MARKET_CONFIRMED_CONCENTRATED' | 'NOT_APPLICABLE';
    };
    comparison_mode_sidecar?: {
      ran: boolean;
      queries_run: string[];
      sidecar_outcome: 'CANDIDATE_INJECTED' | 'NONE_FOUND' | 'SIDECAR_DISABLED' | 'NOT_APPLICABLE';
      candidate_injected: string | null;
    };
    non_domestic_sources_found: number;
    international_coverage_exhaustion_note: string | null;
  };
  query_allocation_log?: {
    candidate: string;
    focus_area: string;
    target_share_pct: number;
    actual_share_pct: number;
  }[];
  anomalous_content_log?: {
    candidate: string;
    source_url: string | null;
    description: string;
  }[];
  claim_registry: ClaimEntry[];
  unconfirmed_leads: {
    candidate: string;
    focus_area: string;
    search_performed: string;
    result: 'NOTHING_FOUND' | 'FOUND_BUT_TOO_WEAK_TO_CITE';
    what_to_look_for: string;
  }[];
  dealbreaker_evidence_log: {
    candidate: string;
    dealbreaker_id: string;
    qualifying_condition: 'STANDARD' | 'PROMOTIONAL_DISCOUNT' | 'AT_CEILING';
    claim_id: string;
  }[];
  completeness_manifest: {
    expected_cells: number;
    covered_by_claim: number;
    covered_by_unconfirmed_lead: number;
    cells: { candidate: string; focus_area: string; status: 'CLAIMED' | 'LOGGED_EMPTY' | 'MISSING' }[];
  };
  call2_execution_stats: {
    wall_clock_minutes: number;
    total_queries_run: number;
    query_cap_extension?: { extension_justification: string; target_category: string } | null;
    partial_data_timeout: boolean;
  };
}

export interface Stage3Audit {
  stage3_manifest: {
    pipeline_version: string;
    stage_origin: string;
    gate_status: 'CLEAR' | 'CLARIFICATION_NEEDED';
    clarification_questions?: ClarificationQuestion[];
    overrides_applied: { field: string; old: string; new: string }[];
    reinstated_candidates: { candidate: string; original_ruled_out_reason: string; why_reinstated: string }[];
    market_survey_summary: string;
    discovery_completeness_check: {
      floor_met: boolean;
      categories_covered: number;
      queries_run: number;
      exhaustion_note_present: boolean;
      assessment: 'COMPLIANT' | 'JUSTIFIED_SHORTFALL' | 'UNEXPLAINED_SHORTFALL';
      category_first_floor_met: boolean;
      concentration_check_summary: {
        trigger_condition_met: boolean;
        corrective_queries_run: number;
        outcome: string;
      };
      international_coverage_met: boolean | null;
    };
    conflicting_specs_log: {
      claim_ids: string[];
      candidate: string;
      focus_area: string;
      values_found: string[];
      resolution: string;
    }[];
    anomalous_content_note?: {
      candidate: string;
      source_url: string | null;
      description: string;
    }[];
    math_checksum_status: 'MATH_CHECKSUM_PASSED' | 'MATH_CHECKSUM_FAILED';
  };
  audited_claims: AuditedClaimEntry[];
  coverage_gaps: {
    candidate: string;
    focus_area: string;
    gap_severity: 'CRITICAL_GAP' | 'IMPORTANT_GAP';
  }[];
  candidate_eligibility: {
    candidate: string;
    dealbreaker_status: 'NONE_TRIGGERED' | 'VERIFIED_VIOLATION' | 'PENDING_VERIFICATION';
    dealbreaker_detail: string | null;
  }[];
  preliminary_adjusted_focus_weights: {
    focus_area: string;
    initial_weight: number;
    unverified_rate: number;
    adjusted_weight_raw: number;
    adjusted_weight_final: number;
    was_top_weighted_initially: boolean;
  }[];
}

export interface McdaMatrix {
  focus_areas: string[];
  candidates: {
    candidate: string;
    confidence_scores_by_area: Record<string, number>;
    deductions_by_area: Record<string, number>;
  }[];
}

export interface FinalRankingEntry {
  candidate: string;
  confidence_score: number;
  top_weighted_area_confidence: number;
  final_candidate_score: number;
  deduction_reasons: { claim_id_or_gap: string; points: number }[];
  in_full_scope?: boolean;
  abbreviated_rationale?: string | null;
}

export interface Stage4DirectiveLog {
  stage4_manifest: {
    pipeline_version: string;
    stage_origin: string;
    precheck_status: 'PASSED' | 'PRECHECK_FAILED' | 'DATA_LOSS_HALT';
    precheck_failure_detail: string | null;
    missing_file?: string | null;
    data_loss_reconstruction?: {
      occurred: boolean;
      source_file: string;
      validation_check: string;
      validation_result: 'PASSED' | 'FAILED';
    };
    gate_status: 'CLEAR' | 'CLARIFICATION_NEEDED';
    clarification_questions?: ClarificationQuestion[];
    overrides_applied: { field: string; old: string; new: string }[];
    math_checksum_status: 'MATH_CHECKSUM_PASSED' | 'MATH_CHECKSUM_FAILED' | 'COMPUTED_VIA_CODE_EXECUTION';
    market_survey_summary: string;
    discovery_completeness_summary: string;
    weight_finalization_stale: boolean;
    fragility_margin_pct: number | null;
    fragility_classification: 'BULLETPROOF' | 'SENSITIVE' | 'HIGH-RISK' | 'STATISTICAL TIE' | 'N-WAY STATISTICAL TIE' | 'N/A - SINGLE ELIGIBLE CANDIDATE';
    tie_note: string | null;
    tied_cluster: string[];
  };
  adjusted_focus_weights: {
    focus_area: string;
    initial_weight: number;
    unverified_rate: number;
    adjusted_weight_raw: number;
    adjusted_weight_final: number;
    was_top_weighted_initially: boolean;
  }[];
  disqualified_candidates: { candidate: string; reason: string; claim_id: string | null }[];
  final_rankings: FinalRankingEntry[];
  pending_candidates: { candidate: string; recommendation_status: string; what_would_resolve_it: string }[];
  notable_weight_shifts: { focus_area: string; initial_weight: number; adjusted_weight_final: number; direction: 'CUT' | 'GAIN'; reason: string }[];
  multi_path_consistency: {
    robust: boolean;
    path_results: { anchor_focus_area: string; winner: string; winner_score: number }[];
    flip_summary: string | null;
    skipped_reason: string | null;
  };
  uncorroborated_synthetic_flags: { candidate: string; claim_id: string }[];
  red_team_analysis: { claim_id: string; steelman_argument: string; redteam_argument: string }[];
  resolved_evidence_for_synthesis: Record<string, string>;
  mcda_matrix: McdaMatrix;
}

export interface ValidationDiagnostic {
  type: 'PASS' | 'WARN' | 'FAIL';
  stage: string;
  field: string;
  message: string;
}

export interface ValidationSummary {
  isValid: boolean;
  passCount: number;
  warnCount: number;
  failCount: number;
  diagnostics: ValidationDiagnostic[];
}

export interface StageMeta {
  stageId: StageId;
  title: string;
  model: string;
  effort: string;
  targetFile: string;
  inputRequired: string;
  tooling: string;
  estTime: string;
  description: string;
}

export interface PipelineProjectState {
  id: string;
  name: string;
  description: string;
  path: PipelinePath;
  currentStage: StageId;
  files: {
    stage1_framing?: string;
    stage2_claims?: string;
    stage2_narrative?: string;
    stage3_audit?: string;
    stage4a_scores?: string;
    stage4_directive_log?: string;
    stage5_report?: string;
  };
  parsedData: {
    stage1?: Stage1Framing;
    stage2?: Stage2Claims;
    stage3?: Stage3Audit;
    stage4?: Stage4DirectiveLog;
  };
}
