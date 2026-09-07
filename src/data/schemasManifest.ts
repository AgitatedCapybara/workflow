export const SCHEMAS_FIELD_MANIFEST = `# v36 Pipeline Schemas & Field Manifest (v36_schemas_field_manifest.md)
**Pipeline Release:** v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE  
**Authority:** Canonical Field-Level Dictionary and Stage Gate Contract for all 5 Stages.

> **Editorial note (Call 2 Patch 2):** the Stage 2 table below previously
> labeled three fields \`"Patch 1 Additive"\` — colliding with
> \`v36_operator_runbook.md\`'s Post-Release Patch Log, where **Patch 1**
> already denotes the Call 2 template branch-selection fix (an unrelated
> change). Relabeled \`"Patch 2 Additive"\` here so the two documents share one
> patch-numbering scheme. \`query_allocation_log\` was missing from this table
> entirely in the prior revision — added as its own row, also Patch 2. The
> Stage 3 table below also gains one Patch 2 row, \`anomalous_content_note\` —
> Call 3's pass-through of Call 2's \`anomalous_content_log\`, one hop further
> downstream.

---

## 1. Stage 1: Framing & Stage Gates (\`stage1_framing.json\`)

| Field Path | Type | Status | Description / Allowed Values |
| :--- | :--- | :--- | :--- |
| \`stage1_manifest.pipeline_version\` | \`string\` | Mandatory | Must be \`"v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE"\`. |
| \`stage1_manifest.stage_origin\` | \`string\` | Mandatory | Origin marker: \`"STAGE_1_FRAMING"\`. |
| \`stage1_manifest.gate_status\` | \`enum\` | Mandatory | \`"CLEAR"\` or \`"CLARIFICATION_NEEDED"\`. |
| \`stage1_manifest.clarification_questions\` | \`array\` | Optional | Array of \`{ question, severity, suggested_resolution }\`. |
| \`domain_risk\` | \`enum\` | Mandatory | \`"CONSUMER/CASUAL"\`, \`"CONSEQUENTIAL"\`, or \`"SAFETY-CRITICAL"\`. |
| \`research_mode\` | \`enum\` | Mandatory | \`"DISCOVERY"\`, \`"COMPARISON"\`, or \`"HYBRID"\`. |
| \`seed_candidates\` | \`string[]\` | Mandatory | Array of candidate names provided by user. Empty in DISCOVERY. |
| \`comparison_mode_sidecar\` | \`object\` | Conditional | Mandatory when \`research_mode == "COMPARISON"\`. |
| \`comparison_mode_sidecar.enabled\` | \`boolean\` | Mandatory | Enable automatic category-first alternative scan. |
| \`comparison_mode_sidecar.max_sidecar_queries\` | \`number\` | Mandatory | Bounded scan cap (default: 3). |
| \`comparison_mode_sidecar.max_candidates_injected\` | \`number\` | Mandatory | Hard ceiling on injection (strictly: 1). |
| \`research_scale_flag\` | \`enum\` | Mandatory | \`"STANDARD"\` (<=5 candidates) or \`"LARGE_SURFACE"\` (>5 candidates). |
| \`discovery_volume_caps.soft_cap_queries\` | \`number\` | Mandatory | Query threshold requiring extension justification. |
| \`discovery_volume_caps.hard_ceiling_queries\` | \`number\` | Mandatory | Absolute stop ceiling for queries. |
| \`risk_scaled_thresholds.freshness_threshold_months\` | \`number\` | Mandatory | Max age in months before citation must be flagged dated. |
| \`risk_scaled_thresholds.diversity_target_min_domains\` | \`number\` | Mandatory | Minimum unique root domains required in claim pool. |
| \`risk_scaled_thresholds.discovery_breadth_floor\` | \`object\` | Mandatory | Contains \`min_queries\`, \`min_source_categories\`, \`min_category_first_queries\`, and \`focus_guidance\`. |
| \`risk_scaled_thresholds.international_coverage_target\`| \`object \| null\` | Mandatory | \`{ min_non_domestic_sources }\` or \`null\` if untracked. |
| \`decision_focus\` | \`string\` | Mandatory | Normalized decision statement. |
| \`focus_area_weights[]\` | \`array\` | Mandatory | Array of \`{ area: string, weight: number }\`. Sum must equal 1.00 +/- 0.01. |
| \`hard_dealbreaker_registry[]\` | \`array\` | Mandatory | Array of \`{ id, description, dealbreaker_shape: "THRESHOLD" \| "BINARY" }\`. |
| \`low_severity_assumptions[]\` | \`array\` | Mandatory | Explicit defaults chosen to bypass non-blocking ambiguities. |

---

## 2. Stage 2: Evidence Gathering & Claims (\`stage2_claims.json\`)

| Field Path | Type | Status | Description / Allowed Values |
| :--- | :--- | :--- | :--- |
| \`market_survey_log.queries_run\` | \`string[]\` | Mandatory | List of all queries executed during session. |
| \`market_survey_log.source_categories_searched\` | \`enum[]\` | Mandatory | Categories hit: \`INDEPENDENT_TESTING\`, \`EDITORIAL_AGGREGATORS\`, \`USER_FORUMS_COMMUNITY\`, \`REGULATORY_PATENT_DATABASES\`, \`MANUFACTURER_DIRECT\`. |
| \`market_survey_log.discovery_exhaustion_note\` | \`string \| null\`| Mandatory | Reason if query/source floor was not reached. |
| \`market_survey_log.candidates_confirmed\` | \`string[]\` | Mandatory | Pre-supplied seeds confirmed available. |
| \`market_survey_log.candidates_newly_found\` | \`string[]\` | Mandatory | New candidates surfaced via open search. |
| \`market_survey_log.candidates_ruled_out[]\` | \`array\` | Mandatory | \`{ candidate, reason }\` for candidates eliminated in Phase 1. |
| \`market_survey_log.candidate_discovery_log[]\` | \`array\` | Mandatory | \`{ candidate, discovery_method: "BRAND_QUERY" \| "CATEGORY_QUERY" \| "CROSS_REFERENCE" \| "USER_SEED", comparison_sidecar_addition?: boolean }\`. |
| \`market_survey_log.concentration_check\` | \`object\` | Mandatory | \`{ trigger_condition_met, corrective_queries_run, outcome }\`. |
| \`market_survey_log.comparison_mode_sidecar\` | \`object\` | Conditional | Present if and only if \`research_mode == "COMPARISON"\`. |
| \`query_allocation_log[]\` | \`array\` | **Patch 2 Additive** | \`{ candidate, focus_area, target_share_pct, actual_share_pct }\` — diet-weighted query-effort logging per candidate per focus area. Expected to cover every candidate on the final roster unless the run was DISCOVERY-escape-valved (see \`discovery_exhaustion_note\`). |
| \`claim_registry[]\` | \`array\` | Mandatory | Array of verified factual claims. |
| \`claim_registry[].claim_id\` | \`string\` | Mandatory | Unique ID (e.g. \`"CLM-001"\`). |
| \`claim_registry[].candidate\` | \`string\` | Mandatory | Candidate name matching roster. |
| \`claim_registry[].focus_area\` | \`string\` | Mandatory | Must match Stage 1 focus area name exactly. |
| \`claim_registry[].claim_text\` | \`string\` | Mandatory | Neutral factual statement (no superlatives). |
| \`claim_registry[].source_url\` | \`string \| null\`| Mandatory | Dereferenceable URL, or null if unavailable. |
| \`claim_registry[].url_status\` | \`enum\` | Mandatory | \`"LIVE"\`, \`"DEAD"\`, or \`"UNAVAILABLE_NO_URL"\`. |
| \`claim_registry[].source_tier\` | \`enum\` | Mandatory | \`"TIER_1"\` (Primary/Lab), \`"TIER_2"\` (Editorial), \`"TIER_3"\` (Anecdotal). |
| \`claim_registry[].source_category\` | \`enum\` | Mandatory | One of the 5 canonical source categories. |
| \`claim_registry[].verbatim_snippet\` | \`string\` | Mandatory | Exact quotation under 25 words. |
| \`claim_registry[].importance_tier\` | \`enum\` | Mandatory | \`"CRITICAL"\`, \`"HIGH"\`, or \`"MINOR"\`. |
| \`claim_registry[].query_intent\` | \`enum\` | **Patch 2 Additive** | \`"STANDARD"\` or \`"CONTRARIAN"\`. Every \`CONTRARIAN\`-tagged claim must trace to a candidate on the final roster. |
| \`claim_registry[].support_grade\` | \`enum\` | **Patch 2 Additive** | \`"DIRECT"\` or \`"AMBIGUOUS"\`. An \`AMBIGUOUS\` grade must not co-occur with \`importance_tier: CRITICAL\` unless corroborated by a second, independent claim — otherwise it belongs in \`unconfirmed_leads\` instead. |
| \`unconfirmed_leads[]\` | \`array\` | Mandatory | \`{ candidate, focus_area, search_performed, result, what_to_look_for }\`. |
| \`dealbreaker_evidence_log[]\` | \`array\` | Mandatory | \`{ candidate, dealbreaker_id, qualifying_condition, claim_id }\`. |
| \`completeness_manifest\` | \`object\` | Mandatory | Grid matrix: \`expected_cells == covered_by_claim + covered_by_unconfirmed_lead\`. |
| \`completeness_manifest.cells[]\` | \`array\` | Mandatory | Cell status: \`"CLAIMED"\` or \`"LOGGED_EMPTY"\` (\`"MISSING"\` is a defect). |
| \`anomalous_content_log[]\` | \`array\` | **Patch 2 Additive** | Array of \`{ candidate, source_url, description }\` — logged instructional-injection strings encountered on fetched web pages. Present (empty array) on every run, never omitted. |

---

## 3. Stage 3: Adversarial Audit & Laundering Analysis (\`stage3_audit.json\`)

| Field Path | Type | Status | Description / Allowed Values |
| :--- | :--- | :--- | :--- |
| \`stage3_manifest.gate_status\` | \`enum\` | Mandatory | \`"CLEAR"\` or \`"CLARIFICATION_NEEDED"\`. |
| \`audited_claims[]\` | \`array\` | Mandatory | All 27 audited fields per claim. |
| \`audited_claims[].verification_status\` | \`enum\` | Mandatory | \`"VERIFIED"\`, \`"UNVERIFIED"\`, \`"CAVEATED"\`, \`"CONTRADICTED"\`, \`"UNVERIFIABLE_NO_GROUNDING"\`. |
| \`audited_claims[].corroborating_domains\` | \`string[]\` | Mandatory | Unique domains independently confirming claim. |
| \`audited_claims[].laundering_flag\` | \`enum\` | Mandatory | \`"NONE"\`, or \`"FLAG-CAT-A"\` through \`"FLAG-CAT-G"\`. |
| \`audited_claims[].tier_audit_status\` | \`enum\` | Mandatory | \`"CONFIRMED"\`, \`"DOWNGRADED"\`, \`"UPGRADED"\`, \`"UNCHECKED"\`. |
| \`audited_claims[].directness_classification\`| \`enum\` | Mandatory | \`"DIRECT"\`, \`"ADJACENT"\`, \`"INFERRED"\`. |
| \`audited_claims[].arithmetic_consistency\` | \`enum\` | Mandatory | \`"CONSISTENT"\`, \`"FLAGGED"\`, \`"NOT_APPLICABLE"\`. |
| \`audited_claims[].arithmetic_consistency_note\`| \`string \| null\`| Conditional | Mandatory if arithmetic is \`FLAGGED\`. |
| \`stage3_manifest.anomalous_content_note[]\` | \`array\` | **Patch 2 Additive** | \`{ candidate, source_url, description }\` — copied verbatim from \`stage2_claims.json\`'s \`anomalous_content_log\`. Present (empty array) whenever the upstream log was empty; must contain every upstream entry otherwise — a shorter list than the source log is a defect, not an omission to infer meaning from. |
| \`candidate_status_registry[]\` | \`array\` | Mandatory | Status per candidate: \`"RETAINED"\`, \`"DISQUALIFIED_DEALBREAKER"\`, or \`"DISQUALIFIED_UNVERIFIABLE"\`. |

---

## 4. Stage 4: MCDA Scoring & Fragility Analysis (\`stage4_directive_log.json\`)

| Field Path | Type | Status | Description / Allowed Values |
| :--- | :--- | :--- | :--- |
| \`stage4_manifest.gate_status\` | \`enum\` | Mandatory | \`"CLEAR"\` or \`"CLARIFICATION_NEEDED"\`. |
| \`scoring_framework.normalization_method\` | \`string\` | Mandatory | Min-Max or z-score utility mapping formula. |
| \`candidate_scores[]\` | \`array\` | Mandatory | \`{ candidate, composite_score, rank, status }\`. |
| \`mcda_matrix[]\` | \`array\` | Mandatory | Normalized scores (0.00-1.00) per candidate x focus area. |
| \`sensitivity_analysis\` | \`object\` | Mandatory | Sensitivity tests: weight swings, rank flip thresholds. |
| \`stress_test_critiques[]\` | \`array\` | Mandatory | Strongest steelmanned counterargument and vulnerability analysis against the top-ranked candidate. |
| \`fragility_index\` | \`object\` | Mandatory | Fragility classification: \`"ROBUST"\`, \`"MODERATE"\`, or \`"FRAGILE"\`. |
| \`multi_path_consistency\` | \`object\` | Mandatory | Variance between primary MCDA and Borda/TOPSIS cross-checks. |

---

## 5. Stage 5: Executive Synthesis Report (\`stage5_report.md\`)

| Section Header | Format | Status | Description / Requirements |
| :--- | :--- | :--- | :--- |
| \`# Executive Decision Report\` | Markdown H1 | Mandatory | Decision focus and date. |
| \`## Decision Summary & Recommendation\` | Markdown H2 | Mandatory | Clear winning recommendation with primary rationale. |
| \`## Head-to-Head Scoring Matrix\` | Table | Mandatory | Markdown table showing normalized score per candidate and rank. |
| \`## Dealbreaker Compliance Status\` | Table / List | Mandatory | Verification proof for each registered hard requirement. |
| \`## Contrarian Findings & Stress-Test Counterargument\`| Markdown H2 | Mandatory | Explicit disclosure of strongest risks and flaws. |
| \`## Fragility & Sensitivity Analysis\` | Markdown H2 | Mandatory | Conditions under which the recommendation flips. |
| \`## Audit & Evidence Lineage\` | Markdown H2 | Mandatory | Total claims, verification rate, laundering flags detected. |
`;
