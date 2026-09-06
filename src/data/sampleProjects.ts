import { PipelineProjectState } from '../types';

export const SAMPLE_POWER_STATION: PipelineProjectState = {
  id: 'power-station-cpap',
  name: 'Portable Power Station for CPAP / Camping ($700 budget)',
  description: 'Consequential evaluation of portable power stations for overnight CPAP use under strict budget ($700) and pure sine wave dealbreakers.',
  path: 'DEFAULT',
  currentStage: 'stage5',
  files: {
    stage1_framing: JSON.stringify({
      "stage1_manifest": {
        "pipeline_version": "v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE",
        "stage_origin": "STAGE_1_FRAMING",
        "gate_status": "CLEAR",
        "clarification_questions": []
      },
      "domain_risk": "CONSEQUENTIAL",
      "research_mode": "COMPARISON",
      "seed_candidates": ["Jackery Explorer 1000 v2", "EcoFlow Delta 2", "Anker SOLIX C1000"],
      "comparison_mode_sidecar": {
        "enabled": true,
        "max_sidecar_queries": 3,
        "max_candidates_injected": 1
      },
      "research_scale_flag": "STANDARD",
      "discovery_volume_caps": {
        "soft_cap_queries": 15,
        "hard_ceiling_queries": 20
      },
      "risk_scaled_thresholds": {
        "freshness_threshold_months": 12,
        "diversity_target_min_domains": 4,
        "statistical_tie_threshold_points": 5,
        "confidence_caveat_bar": 6.0,
        "weight_shift_flagging_pct": 0.10,
        "discovery_breadth_floor": {
          "min_queries": 6,
          "min_source_categories": 3,
          "min_category_first_queries": 3,
          "focus_guidance": "Editorial reviews, independent battery lab tests, long-term user reports."
        },
        "international_coverage_target": {
          "min_non_domestic_sources": 1
        },
        "threshold_basis": "HEURISTIC_DEFAULT"
      },
      "decision_focus": "Best portable power station under $700 with pure sine wave inverter for overnight CPAP use (30W average draw, 8 hours minimum runtime).",
      "focus_area_weights": [
        { "area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "weight": 0.35 },
        { "area": "Cycle Life & Battery Chemistry (LiFePO4)", "weight": 0.25 },
        { "area": "Recharge Speed & Solar Input Versatility", "weight": 0.20 },
        { "area": "Portability & Noise Level (dB under load)", "weight": 0.20 }
      ],
      "hard_dealbreaker_registry": [
        { "id": "DB-01", "description": "True Pure Sine Wave Inverter (essential for medical/sensitive equipment)", "dealbreaker_shape": "BINARY" },
        { "id": "DB-02", "description": "Price strictly at or under $700 MSRP or regular sale price", "dealbreaker_shape": "THRESHOLD" }
      ],
      "low_severity_assumptions": [
        { "item": "Comparison-Mode Sidecar", "default_used": "Enabled by default (max 1 injected candidate)" },
        { "item": "Standard CPAP Draw", "default_used": "Assumed 30W average without heated humidifier" }
      ]
    }, null, 2),

    stage2_claims: JSON.stringify({
      "market_survey_log": {
        "queries_run": [
          "portable power station pure sine wave CPAP test lab",
          "Jackery Explorer 1000 v2 DC efficiency 12V test",
          "EcoFlow Delta 2 idle power draw test",
          "Anker Solix C1000 runtime 30W load",
          "best 1000Wh LiFePO4 battery under 700 camping CPAP",
          "Bluetti AC180 inverter efficiency CPAP runtime"
        ],
        "source_categories_searched": [
          "INDEPENDENT_TESTING", "EDITORIAL_AGGREGATORS", "USER_FORUMS_COMMUNITY", "MANUFACTURER_DIRECT"
        ],
        "discovery_exhaustion_note": null,
        "candidates_confirmed": ["Jackery Explorer 1000 v2", "EcoFlow Delta 2", "Anker SOLIX C1000"],
        "candidates_newly_found": [],
        "candidates_ruled_out": [
          { "candidate": "Goal Zero Yeti 1000X", "reason": "Uses NMC chemistry and priced at $899, violating DB-02." }
        ],
        "candidate_discovery_log": [
          { "candidate": "Jackery Explorer 1000 v2", "discovery_method": "USER_SEED" },
          { "candidate": "EcoFlow Delta 2", "discovery_method": "USER_SEED" },
          { "candidate": "Anker SOLIX C1000", "discovery_method": "USER_SEED" },
          { "candidate": "Bluetti AC180", "discovery_method": "CATEGORY_QUERY", "comparison_sidecar_addition": true }
        ],
        "concentration_check": {
          "trigger_condition_met": false,
          "corrective_queries_run": 0,
          "outcome": "NOT_APPLICABLE"
        },
        "comparison_mode_sidecar": {
          "ran": true,
          "queries_run": ["best 1000Wh LiFePO4 battery under 700 camping CPAP", "Bluetti AC180 inverter efficiency CPAP runtime"],
          "sidecar_outcome": "CANDIDATE_INJECTED",
          "candidate_injected": "Bluetti AC180"
        },
        "non_domestic_sources_found": 2,
        "international_coverage_exhaustion_note": null
      },
      "query_allocation_log": [
        { "candidate": "Anker SOLIX C1000", "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "target_share_pct": 35, "actual_share_pct": 35 },
        { "candidate": "Anker SOLIX C1000", "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "target_share_pct": 25, "actual_share_pct": 25 },
        { "candidate": "Anker SOLIX C1000", "focus_area": "Recharge Speed & Solar Input Versatility", "target_share_pct": 20, "actual_share_pct": 20 },
        { "candidate": "Anker SOLIX C1000", "focus_area": "Portability & Noise Level (dB under load)", "target_share_pct": 20, "actual_share_pct": 20 },
        { "candidate": "EcoFlow Delta 2", "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "target_share_pct": 35, "actual_share_pct": 35 },
        { "candidate": "EcoFlow Delta 2", "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "target_share_pct": 25, "actual_share_pct": 25 },
        { "candidate": "EcoFlow Delta 2", "focus_area": "Recharge Speed & Solar Input Versatility", "target_share_pct": 20, "actual_share_pct": 20 },
        { "candidate": "EcoFlow Delta 2", "focus_area": "Portability & Noise Level (dB under load)", "target_share_pct": 20, "actual_share_pct": 20 },
        { "candidate": "Jackery Explorer 1000 v2", "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "target_share_pct": 35, "actual_share_pct": 35 },
        { "candidate": "Jackery Explorer 1000 v2", "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "target_share_pct": 25, "actual_share_pct": 25 },
        { "candidate": "Jackery Explorer 1000 v2", "focus_area": "Recharge Speed & Solar Input Versatility", "target_share_pct": 20, "actual_share_pct": 20 },
        { "candidate": "Jackery Explorer 1000 v2", "focus_area": "Portability & Noise Level (dB under load)", "target_share_pct": 20, "actual_share_pct": 20 },
        { "candidate": "Bluetti AC180", "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "target_share_pct": 35, "actual_share_pct": 35 },
        { "candidate": "Bluetti AC180", "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "target_share_pct": 25, "actual_share_pct": 25 },
        { "candidate": "Bluetti AC180", "focus_area": "Recharge Speed & Solar Input Versatility", "target_share_pct": 20, "actual_share_pct": 20 },
        { "candidate": "Bluetti AC180", "focus_area": "Portability & Noise Level (dB under load)", "target_share_pct": 20, "actual_share_pct": 20 }
      ],
      "anomalous_content_log": [],
      "claim_registry": [
        {
          "claim_id": "CLM-001",
          "candidate": "Anker SOLIX C1000",
          "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)",
          "claim_text": "Anker SOLIX C1000 delivers 1056Wh capacity with 86% AC inverter efficiency at 30W load, running standard CPAP for 28.5 hours.",
          "source": "Tom's Guide Lab Bench Test",
          "source_domain": "tomsguide.com",
          "source_url": "https://www.tomsguide.com/reviews/anker-solix-c1000",
          "url_status": "LIVE",
          "source_tier": "TIER_1",
          "source_category": "INDEPENDENT_TESTING",
          "affiliate_status": "Editorial testing lab with standard disclosure",
          "source_type": "independent_press",
          "publication_date": "2025-04",
          "verbatim_snippet": "In our discharge tests at 30W load, the C1000 ran for 28.5 hours with 86.2% efficiency.",
          "importance_tier": "CRITICAL",
          "query_intent": "STANDARD",
          "support_grade": "DIRECT"
        },
        {
          "claim_id": "CLM-002",
          "candidate": "EcoFlow Delta 2",
          "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)",
          "claim_text": "EcoFlow Delta 2 has 1024Wh capacity but exhibits higher idle inverter draw (18W), yielding 21.2 hours at 30W load.",
          "source": "Hobotech Independent Power Station Lab",
          "source_domain": "youtube.com/hobotech",
          "source_url": "https://hobotech.tv/reviews/ecoflow-delta-2-efficiency",
          "url_status": "LIVE",
          "source_tier": "TIER_1",
          "source_category": "INDEPENDENT_TESTING",
          "affiliate_status": "Independent bench testing",
          "source_type": "independent_press",
          "publication_date": "2025-02",
          "verbatim_snippet": "The Delta 2 idle overhead reduces runtime on light 30W loads to 21 hours.",
          "importance_tier": "CRITICAL",
          "query_intent": "CONTRARIAN",
          "support_grade": "DIRECT"
        },
        {
          "claim_id": "CLM-003",
          "candidate": "Jackery Explorer 1000 v2",
          "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)",
          "claim_text": "Jackery Explorer 1000 v2 upgraded to LiFePO4 cells rated for 4,000 cycles to 70% capacity.",
          "source": "Jackery Official Technical Datasheet",
          "source_domain": "jackery.com",
          "source_url": "https://www.jackery.com/products/explorer-1000-v2",
          "url_status": "LIVE",
          "source_tier": "TIER_1",
          "source_category": "MANUFACTURER_DIRECT",
          "affiliate_status": "Manufacturer spec",
          "source_type": "manufacturer",
          "publication_date": "2025-01",
          "verbatim_snippet": "LiFePO4 battery rated for 4000 cycles to 70%+ capacity.",
          "importance_tier": "HIGH",
          "query_intent": "STANDARD",
          "support_grade": "DIRECT"
        },
        {
          "claim_id": "CLM-004",
          "candidate": "Bluetti AC180",
          "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)",
          "claim_text": "Bluetti AC180 provides 1152Wh capacity with ultra-low DC-to-DC loss for 12V CPAP adapter cords.",
          "source": "SolarPowerForum Verified Bench",
          "source_domain": "diysolarforum.com",
          "source_url": "https://diysolarforum.com/threads/bluetti-ac180-cpap-efficiency.62104/",
          "url_status": "LIVE",
          "source_tier": "TIER_1",
          "source_category": "USER_FORUMS_COMMUNITY",
          "affiliate_status": "Community instrumented test",
          "source_type": "user_review",
          "publication_date": "2025-03",
          "verbatim_snippet": "Direct 12V cigarette output yielded 92% efficiency on ResMed AirSense 10.",
          "importance_tier": "CRITICAL",
          "query_intent": "STANDARD",
          "support_grade": "DIRECT"
        }
      ],
      "unconfirmed_leads": [],
      "dealbreaker_evidence_log": [
        { "candidate": "Anker SOLIX C1000", "dealbreaker_id": "DB-01", "qualifying_condition": "STANDARD", "claim_id": "CLM-001" },
        { "candidate": "Anker SOLIX C1000", "dealbreaker_id": "DB-02", "qualifying_condition": "STANDARD", "claim_id": "CLM-001" },
        { "candidate": "EcoFlow Delta 2", "dealbreaker_id": "DB-01", "qualifying_condition": "STANDARD", "claim_id": "CLM-002" },
        { "candidate": "EcoFlow Delta 2", "dealbreaker_id": "DB-02", "qualifying_condition": "STANDARD", "claim_id": "CLM-002" },
        { "candidate": "Jackery Explorer 1000 v2", "dealbreaker_id": "DB-01", "qualifying_condition": "STANDARD", "claim_id": "CLM-003" },
        { "candidate": "Jackery Explorer 1000 v2", "dealbreaker_id": "DB-02", "qualifying_condition": "PROMOTIONAL_DISCOUNT", "claim_id": "CLM-003" },
        { "candidate": "Bluetti AC180", "dealbreaker_id": "DB-01", "qualifying_condition": "STANDARD", "claim_id": "CLM-004" },
        { "candidate": "Bluetti AC180", "dealbreaker_id": "DB-02", "qualifying_condition": "AT_CEILING", "claim_id": "CLM-004" }
      ],
      "completeness_manifest": {
        "expected_cells": 16,
        "covered_by_claim": 16,
        "covered_by_unconfirmed_lead": 0,
        "cells": [
          { "candidate": "Anker SOLIX C1000", "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "status": "CLAIMED" },
          { "candidate": "Anker SOLIX C1000", "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "status": "CLAIMED" },
          { "candidate": "Anker SOLIX C1000", "focus_area": "Recharge Speed & Solar Input Versatility", "status": "CLAIMED" },
          { "candidate": "Anker SOLIX C1000", "focus_area": "Portability & Noise Level (dB under load)", "status": "CLAIMED" },
          { "candidate": "EcoFlow Delta 2", "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "status": "CLAIMED" },
          { "candidate": "EcoFlow Delta 2", "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "status": "CLAIMED" },
          { "candidate": "EcoFlow Delta 2", "focus_area": "Recharge Speed & Solar Input Versatility", "status": "CLAIMED" },
          { "candidate": "EcoFlow Delta 2", "focus_area": "Portability & Noise Level (dB under load)", "status": "CLAIMED" },
          { "candidate": "Jackery Explorer 1000 v2", "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "status": "CLAIMED" },
          { "candidate": "Jackery Explorer 1000 v2", "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "status": "CLAIMED" },
          { "candidate": "Jackery Explorer 1000 v2", "focus_area": "Recharge Speed & Solar Input Versatility", "status": "CLAIMED" },
          { "candidate": "Jackery Explorer 1000 v2", "focus_area": "Portability & Noise Level (dB under load)", "status": "CLAIMED" },
          { "candidate": "Bluetti AC180", "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "status": "CLAIMED" },
          { "candidate": "Bluetti AC180", "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "status": "CLAIMED" },
          { "candidate": "Bluetti AC180", "focus_area": "Recharge Speed & Solar Input Versatility", "status": "CLAIMED" },
          { "candidate": "Bluetti AC180", "focus_area": "Portability & Noise Level (dB under load)", "status": "CLAIMED" }
        ]
      },
      "call2_execution_stats": {
        "wall_clock_minutes": 14.2,
        "total_queries_run": 8,
        "query_cap_extension": null,
        "partial_data_timeout": false
      }
    }, null, 2),

    stage3_audit: JSON.stringify({
      "stage3_manifest": {
        "pipeline_version": "v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE",
        "stage_origin": "STAGE_3_VERIFICATION_AUDIT",
        "gate_status": "CLEAR",
        "overrides_applied": [],
        "reinstated_candidates": [],
        "market_survey_summary": "3 candidates confirmed, 1 injected via Discovery Sidecar, 1 ruled out.",
        "discovery_completeness_check": {
          "floor_met": true,
          "categories_covered": 4,
          "queries_run": 8,
          "exhaustion_note_present": false,
          "assessment": "COMPLIANT",
          "category_first_floor_met": true,
          "concentration_check_summary": {
            "trigger_condition_met": false,
            "corrective_queries_run": 0,
            "outcome": "NOT_APPLICABLE"
          },
          "international_coverage_met": true
        },
        "conflicting_specs_log": [],
        "anomalous_content_note": [],
        "math_checksum_status": "MATH_CHECKSUM_PASSED"
      },
      "audited_claims": [
        {
          "claim_id": "CLM-001",
          "candidate": "Anker SOLIX C1000",
          "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)",
          "claim_text": "Anker SOLIX C1000 delivers 1056Wh capacity with 86% AC inverter efficiency at 30W load, running standard CPAP for 28.5 hours.",
          "source": "Tom's Guide Lab Bench Test",
          "source_domain": "tomsguide.com",
          "source_url": "https://www.tomsguide.com/reviews/anker-solix-c1000",
          "url_status": "LIVE",
          "source_tier": "TIER_1",
          "source_category": "INDEPENDENT_TESTING",
          "affiliate_status": "Editorial testing lab",
          "source_type": "independent_press",
          "publication_date": "2025-04",
          "verbatim_snippet": "In our discharge tests at 30W load, the C1000 ran for 28.5 hours with 86.2% efficiency.",
          "importance_tier": "CRITICAL",
          "verification_status": "VERIFIED",
          "verification_note": "Corroborated by independent bench test on CNET and Tom's Guide with matching discharge curve.",
          "corroborating_domains": ["tomsguide.com", "cnet.com"],
          "corroboration_search_logged": true,
          "laundering_flag": "NONE",
          "laundering_flag_corroborated": null,
          "tier_audit_status": "CONFIRMED",
          "tier_audit_note": null,
          "directness_classification": "DIRECT",
          "directness_note": "Direct measurement on 30W continuous resistive discharge load.",
          "arithmetic_consistency": "CONSISTENT",
          "arithmetic_consistency_note": null
        },
        {
          "claim_id": "CLM-002",
          "candidate": "EcoFlow Delta 2",
          "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)",
          "claim_text": "EcoFlow Delta 2 has 1024Wh capacity but exhibits higher idle inverter draw (18W), yielding 21.2 hours at 30W load.",
          "source": "Hobotech Independent Power Station Lab",
          "source_domain": "youtube.com/hobotech",
          "source_url": "https://hobotech.tv/reviews/ecoflow-delta-2-efficiency",
          "url_status": "LIVE",
          "source_tier": "TIER_1",
          "source_category": "INDEPENDENT_TESTING",
          "affiliate_status": "Independent bench testing",
          "source_type": "independent_press",
          "publication_date": "2025-02",
          "verbatim_snippet": "The Delta 2 idle overhead reduces runtime on light 30W loads to 21 hours.",
          "importance_tier": "CRITICAL",
          "verification_status": "VERIFIED",
          "verification_note": "Bench power meter confirmed 17.8W idle standby with AC inverter active.",
          "corroborating_domains": ["hobotech.tv", "diysolarforum.com"],
          "corroboration_search_logged": true,
          "laundering_flag": "NONE",
          "laundering_flag_corroborated": null,
          "tier_audit_status": "CONFIRMED",
          "tier_audit_note": null,
          "directness_classification": "DIRECT",
          "directness_note": "Direct watt-meter measurement.",
          "arithmetic_consistency": "CONSISTENT",
          "arithmetic_consistency_note": null
        }
      ],
      "coverage_gaps": [],
      "candidate_eligibility": [
        { "candidate": "Anker SOLIX C1000", "dealbreaker_status": "NONE_TRIGGERED", "dealbreaker_detail": null },
        { "candidate": "EcoFlow Delta 2", "dealbreaker_status": "NONE_TRIGGERED", "dealbreaker_detail": null },
        { "candidate": "Jackery Explorer 1000 v2", "dealbreaker_status": "NONE_TRIGGERED", "dealbreaker_detail": null },
        { "candidate": "Bluetti AC180", "dealbreaker_status": "NONE_TRIGGERED", "dealbreaker_detail": null }
      ],
      "preliminary_adjusted_focus_weights": [
        { "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "initial_weight": 0.35, "unverified_rate": 0.0, "adjusted_weight_raw": 0.35, "adjusted_weight_final": 0.35, "was_top_weighted_initially": true },
        { "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "initial_weight": 0.25, "unverified_rate": 0.0, "adjusted_weight_raw": 0.25, "adjusted_weight_final": 0.25, "was_top_weighted_initially": true },
        { "focus_area": "Recharge Speed & Solar Input Versatility", "initial_weight": 0.20, "unverified_rate": 0.0, "adjusted_weight_raw": 0.20, "adjusted_weight_final": 0.20, "was_top_weighted_initially": true },
        { "focus_area": "Portability & Noise Level (dB under load)", "initial_weight": 0.20, "unverified_rate": 0.0, "adjusted_weight_raw": 0.20, "adjusted_weight_final": 0.20, "was_top_weighted_initially": true }
      ]
    }, null, 2),

    stage4_directive_log: JSON.stringify({
      "stage4_manifest": {
        "pipeline_version": "v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE",
        "stage_origin": "STAGE_4_SCORING_REDTEAM",
        "precheck_status": "PASSED",
        "precheck_failure_detail": null,
        "gate_status": "CLEAR",
        "overrides_applied": [],
        "math_checksum_status": "MATH_CHECKSUM_PASSED",
        "market_survey_summary": "3 candidates confirmed, 1 injected via Discovery Sidecar, 1 ruled out.",
        "discovery_completeness_summary": "Discovery floor met (4 categories, 8 queries) — COMPLIANT. Sidecar injected Bluetti AC180.",
        "weight_finalization_stale": false,
        "fragility_margin_pct": 166.7,
        "fragility_classification": "BULLETPROOF",
        "tie_note": null,
        "tied_cluster": []
      },
      "adjusted_focus_weights": [
        { "focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "initial_weight": 0.35, "unverified_rate": 0.0, "adjusted_weight_raw": 0.35, "adjusted_weight_final": 0.35, "was_top_weighted_initially": true },
        { "focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "initial_weight": 0.25, "unverified_rate": 0.0, "adjusted_weight_raw": 0.25, "adjusted_weight_final": 0.25, "was_top_weighted_initially": true },
        { "focus_area": "Recharge Speed & Solar Input Versatility", "initial_weight": 0.20, "unverified_rate": 0.0, "adjusted_weight_raw": 0.20, "adjusted_weight_final": 0.20, "was_top_weighted_initially": true },
        { "focus_area": "Portability & Noise Level (dB under load)", "initial_weight": 0.20, "unverified_rate": 0.0, "adjusted_weight_raw": 0.20, "adjusted_weight_final": 0.20, "was_top_weighted_initially": true }
      ],
      "disqualified_candidates": [],
      "final_rankings": [
        {
          "candidate": "Anker SOLIX C1000",
          "confidence_score": 9.4,
          "top_weighted_area_confidence": 9.2,
          "final_candidate_score": 94.0,
          "deduction_reasons": [
            { "claim_id_or_gap": "MINOR noise on Turbo recharge", "points": 6.0 }
          ],
          "in_full_scope": true,
          "abbreviated_rationale": null
        },
        {
          "candidate": "Bluetti AC180",
          "confidence_score": 8.9,
          "top_weighted_area_confidence": 8.8,
          "final_candidate_score": 84.0,
          "deduction_reasons": [
            { "claim_id_or_gap": "Price at strict ceiling ($699)", "points": 6.0 },
            { "claim_id_or_gap": "Higher weight (35.3 lbs)", "points": 10.0 }
          ],
          "in_full_scope": true,
          "abbreviated_rationale": null
        },
        {
          "candidate": "Jackery Explorer 1000 v2",
          "confidence_score": 8.6,
          "top_weighted_area_confidence": 8.2,
          "final_candidate_score": 80.0,
          "deduction_reasons": [
            { "claim_id_or_gap": "Price only clears under promotional discount", "points": 8.0 },
            { "claim_id_or_gap": "Slower 200W max solar input", "points": 12.0 }
          ],
          "in_full_scope": false,
          "abbreviated_rationale": "Slower 200W solar input and promotional pricing risk."
        },
        {
          "candidate": "EcoFlow Delta 2",
          "confidence_score": 8.7,
          "top_weighted_area_confidence": 7.9,
          "final_candidate_score": 78.0,
          "deduction_reasons": [
            { "claim_id_or_gap": "Higher idle inverter draw reducing overnight CPAP runtime", "points": 22.0 }
          ],
          "in_full_scope": false,
          "abbreviated_rationale": "18W inverter idle drain penalizes light 30W overnight CPAP runtimes."
        }
      ],
      "pending_candidates": [],
      "notable_weight_shifts": [],
      "multi_path_consistency": {
        "robust": true,
        "path_results": [
          { "anchor_focus_area": "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)", "winner": "Anker SOLIX C1000", "winner_score": 94.0 },
          { "anchor_focus_area": "Cycle Life & Battery Chemistry (LiFePO4)", "winner": "Anker SOLIX C1000", "winner_score": 96.0 },
          { "anchor_focus_area": "Recharge Speed & Solar Input Versatility", "winner": "Anker SOLIX C1000", "winner_score": 94.0 },
          { "anchor_focus_area": "Portability & Noise Level (dB under load)", "winner": "Anker SOLIX C1000", "winner_score": 92.0 }
        ],
        "flip_summary": null,
        "skipped_reason": null
      },
      "uncorroborated_synthetic_flags": [],
      "red_team_analysis": [
        {
          "claim_id": "CLM-001",
          "steelman_argument": "1056Wh capacity with verified 86% inverter efficiency delivers over 28 hours continuous 30W runtime, the highest energy efficiency in class.",
          "redteam_argument": "Ultra-fast 58-minute AC charging engages high-speed cooling fans measuring 52dB, which may disrupt light sleepers in a camping tent."
        }
      ],
      "resolved_evidence_for_synthesis": {
        "CLM-001": "In our discharge tests at 30W load, the C1000 ran for 28.5 hours with 86.2% efficiency."
      },
      "mcda_matrix": {
        "focus_areas": [
          "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)",
          "Cycle Life & Battery Chemistry (LiFePO4)",
          "Recharge Speed & Solar Input Versatility",
          "Portability & Noise Level (dB under load)"
        ],
        "candidates": [
          {
            "candidate": "Anker SOLIX C1000",
            "confidence_scores_by_area": { "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)": 9.5, "Cycle Life & Battery Chemistry (LiFePO4)": 9.8, "Recharge Speed & Solar Input Versatility": 9.4, "Portability & Noise Level (dB under load)": 8.8 },
            "deductions_by_area": { "Portability & Noise Level (dB under load)": 6.0 }
          },
          {
            "candidate": "Bluetti AC180",
            "confidence_scores_by_area": { "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)": 9.2, "Cycle Life & Battery Chemistry (LiFePO4)": 9.5, "Recharge Speed & Solar Input Versatility": 8.9, "Portability & Noise Level (dB under load)": 7.8 },
            "deductions_by_area": { "Overnight Runtime & Inverter Efficiency (CPAP DC/AC)": 6.0, "Portability & Noise Level (dB under load)": 10.0 }
          }
        ]
      }
    }, null, 2),

    stage5_report: `# Executive Decision Report: Portable Power Station for CPAP & Camping

**Market Survey Completeness:** 3 seed candidates confirmed, 1 injected via Discovery Sidecar (*Bluetti AC180*), and 1 candidate ruled out (*Goal Zero Yeti 1000X* for exceeding budget). Discovery breadth met full consequential standards across 4 independent publisher categories.

---

### 1. Bottom Line Verdict
**Winner:** **Anker SOLIX C1000** (Final Score: **94.0 / 100**)  
**Fragility Rating:** **BULLETPROOF (166.7% Margin)** — The recommendation is robust and decisively outperforms competitors under every prioritized weighting scenario.

---

### 2. Why It Won
* **Exceptional Light-Load Inverter Efficiency:** Lab discharge tests confirmed an 86.2% inverter efficiency under 30W continuous load, delivering **28.5 hours of overnight CPAP runtime** (*"In our discharge tests at 30W load, the C1000 ran for 28.5 hours..."* — Tom's Guide Bench).
* **Next-Gen LiFePO4 Longevity:** 3,000 cycles to 80% capacity with 1056Wh capacity and seamless sub-20ms UPS switchover.
* **Rapid Multi-Source Recharging:** 600W solar input and 1300W AC ultra-fast recharge in 58 minutes.

---

### 3. Multi-Path Consistency & Stress-Testing
The winner remains invariant across all priority reclassifications:
- **Runtime-First Anchor:** Anker SOLIX C1000 (94.0 pts) vs Bluetti AC180 (84.0 pts)
- **Battery Life Anchor:** Anker SOLIX C1000 (96.0 pts)
- **Recharge/Solar Anchor:** Anker SOLIX C1000 (94.0 pts)
- **Portability Anchor:** Anker SOLIX C1000 (92.0 pts)

---

### 4. Runner-Up Comparison
* **Runner-Up: Bluetti AC180 (Score: 84.0 / 100)**  
  *Surfaced via v36 Discovery Sidecar.* Offers high 1152Wh capacity and outstanding DC efficiency, but sits at the exact ceiling of the budget cap ($699) and is 4.3 lbs heavier (35.3 lbs vs 31.0 lbs), deducting points in portability.
* **Jackery Explorer 1000 v2 (Score: 80.0 / 100):** Great ergonomics, but constrained by a 200W solar ceiling and only clears the $700 dealbreaker during promotional discounts.
* **EcoFlow Delta 2 (Score: 78.0 / 100):** Substantial 18W idle inverter drain penalizes low-draw 30W medical runtimes (21.2 hours vs 28.5 hours).

---

### 5. Steelman vs. Red-Team Analysis
* **Steelman Case (Anker C1000):** Highest verified usable capacity under 30W loads, fastest recharge times, and modern LiFePO4 cells make it the ideal reliable power station for sensitive medical devices.
* **Red-Team Caveat:** Turbo recharge mode cooling fans register up to 52 dB under high load; operators should use standard "Quiet Mode" charging when sleeping inside tents.
`
  },
  parsedData: {}
};

export const SAMPLE_SAMSUNG_PHONE: PipelineProjectState = {
  id: 'samsung-phone-sub600',
  name: 'Samsung Galaxy Phone (<$600, Refurbished / Direct / Retail)',
  description: 'Discovery evaluation of Samsung Galaxy smartphones under $600 prioritizing camera performance, battery endurance, and multi-channel value.',
  path: 'DEFAULT',
  currentStage: 'stage1',
  files: {
    stage1_framing: JSON.stringify({
      "stage1_manifest": {
        "pipeline_version": "v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE",
        "stage_origin": "STAGE_1_FRAMING",
        "gate_status": "CLEAR",
        "clarification_questions": []
      },
      "domain_risk": "CONSUMER/CASUAL",
      "research_mode": "DISCOVERY",
      "seed_candidates": [],
      "comparison_mode_sidecar": {
        "enabled": false,
        "max_sidecar_queries": 0,
        "max_candidates_injected": 0
      },
      "research_scale_flag": "STANDARD",
      "discovery_volume_caps": {
        "soft_cap_queries": 15,
        "hard_ceiling_queries": 20
      },
      "risk_scaled_thresholds": {
        "freshness_threshold_months": 12,
        "diversity_target_min_domains": 4,
        "statistical_tie_threshold_points": 5,
        "confidence_caveat_bar": 6.0,
        "weight_shift_flagging_pct": 0.10,
        "discovery_breadth_floor": {
          "min_queries": 6,
          "min_source_categories": 3,
          "min_category_first_queries": 3,
          "focus_guidance": "Camera sensor lab tests, battery life drain tests, verified owner reports."
        },
        "international_coverage_target": {
          "min_non_domestic_sources": 1
        },
        "threshold_basis": "HEURISTIC_DEFAULT"
      },
      "decision_focus": "Best Samsung Galaxy phone under $600 with top-tier camera and battery life. eBay refurbished (excellent quality and above), manufacturer direct (samsung.com), or new retail are all acceptable.",
      "focus_area_weights": [
        { "area": "Camera System & Low-Light Performance", "weight": 0.35 },
        { "area": "Real-World Battery Life & Efficiency", "weight": 0.30 },
        { "area": "Price to Performance & Acquisition Street Value", "weight": 0.20 },
        { "area": "Display Quality & Long-Term Software Support", "weight": 0.15 }
      ],
      "hard_dealbreaker_registry": [
        { "id": "DB-01", "description": "Actual clearing street price must be strictly at or under $600 across verified channels (Retail New, Certified Refurbished, or Manufacturer Direct)", "dealbreaker_shape": "THRESHOLD" },
        { "id": "DB-02", "description": "Device condition must be Brand New, Open-Box with warranty, or Certified Refurbished in Excellent condition (reject broken/damaged or fair/poor units)", "dealbreaker_shape": "BINARY" }
      ],
      "low_severity_assumptions": [
        { "item": "Condition Standard", "default_used": "Certified Refurbished (eBay Refurbished Excellent, Amazon Renewed Premium, or Samsung Certified Re-Newed) is treated as parity with new" },
        { "item": "Network Compatibility", "default_used": "Unlocked US models (U1 variants) assumed standard" }
      ]
    }, null, 2),
    stage2_claims: '',
    stage3_audit: '',
    stage4_directive_log: '',
    stage5_report: ''
  },
  parsedData: {}
};

