export const PYTHON_STAGE_GATE_VALIDATOR = `#!/usr/bin/env python3
"""
v36 Stage Gate Validator (v36_stage_gate_validator.py)
Automated schema, math consistency, and boundary validator for the
v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE Decision Research Pipeline.

Usage:
  python3 v36_stage_gate_validator.py stage1 stage1_framing.json
  python3 v36_stage_gate_validator.py stage1-2 stage1_framing.json stage2_claims.json
  python3 v36_stage_gate_validator.py stage2-3 stage1_framing.json stage2_claims.json stage3_audit.json
  python3 v36_stage_gate_validator.py stage3-4 stage1_framing.json stage3_audit.json stage4_directive_log.json
  python3 v36_stage_gate_validator.py stage4-5 stage4_directive_log.json stage5_report.md
  python3 v36_stage_gate_validator.py all stage1_framing.json stage2_claims.json stage3_audit.json stage4_directive_log.json stage5_report.md

Call 2 Patch 2:
  - validate_stage2() gained four checks for the Patch 2 fields
    (query_allocation_log, claim_registry[].query_intent,
    claim_registry[].support_grade, anomalous_content_log).
  - validate_stage3() gained one check: that anomalous_content_note
    (Call 3's pass-through of anomalous_content_log) isn't silently
    dropped when the upstream log was non-empty.
  - 'stage1-2' and 'stage2-3' dispatch modes were added to main() — the
    runbook already documented running the validator at these two gates,
    but no code path existed for either; only 'stage1' and 'all' were
    implemented. Added so the new checks are actually reachable at the
    gates they're meant to protect.
  - 'stage3-4', 'stage4-5', 'stage3-4a', and 'stage4a-4b' dispatch modes
    remain unimplemented. Pre-existing gap, unrelated to Call 2/3, not
    fixed as part of this patch.
"""

import sys
import json
import os
import re

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"[FAIL] File not found: {filepath}")
        sys.exit(1)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[FAIL] JSON decode error in {filepath}: {e}")
        sys.exit(1)

def validate_stage1(data):
    errors = []
    warnings = []
    
    # Check Manifest
    manifest = data.get('stage1_manifest', {})
    if manifest.get('pipeline_version') != 'v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE':
        warnings.append(f"Manifest version mismatch: {manifest.get('pipeline_version')}")
    if manifest.get('gate_status') not in ['CLEAR', 'CLARIFICATION_NEEDED']:
        errors.append("gate_status must be CLEAR or CLARIFICATION_NEEDED")

    # Focus area weights sum
    weights = data.get('focus_area_weights', [])
    total_w = sum(w.get('weight', 0) for w in weights)
    if abs(total_w - 1.0) > 0.015:
        errors.append(f"focus_area_weights sum to {total_w:.4f}, must be 1.00 +/- 0.01")
        
    # Dealbreaker shape
    for db in data.get('hard_dealbreaker_registry', []):
        if db.get('dealbreaker_shape') not in ['THRESHOLD', 'BINARY']:
            errors.append(f"Dealbreaker {db.get('id')} has invalid dealbreaker_shape: {db.get('dealbreaker_shape')}")

    # Sidecar check if comparison
    if data.get('research_mode') == 'COMPARISON':
        sidecar = data.get('comparison_mode_sidecar')
        if not sidecar or not isinstance(sidecar, dict):
            errors.append("comparison_mode_sidecar object is MANDATORY when research_mode is COMPARISON")
            
    return errors, warnings

def validate_stage2(stage1, data):
    errors = []
    warnings = []
    
    manifest = data.get('completeness_manifest', {})
    expected = manifest.get('expected_cells', 0)
    claimed = manifest.get('covered_by_claim', 0)
    empty = manifest.get('covered_by_unconfirmed_lead', 0)
    
    if expected != (claimed + empty):
        errors.append(f"Completeness cell math mismatch: expected ({expected}) != claimed ({claimed}) + empty ({empty})")
        
    missing_cells = [c for c in manifest.get('cells', []) if c.get('status') == 'MISSING']
    if missing_cells:
        errors.append(f"Found {len(missing_cells)} MISSING cells in completeness_manifest. All must be CLAIMED or LOGGED_EMPTY.")
        
    for c in data.get('claim_registry', []):
        if not c.get('source_url') and c.get('url_status') != 'UNAVAILABLE_NO_URL':
            errors.append(f"Claim {c.get('claim_id')} has null source_url but url_status is not UNAVAILABLE_NO_URL")

    # --- Call 2 Patch 2 additions below ---

    survey_log = data.get('market_survey_log', {})
    claim_registry = data.get('claim_registry', [])

    # Final roster: confirmed + newly found + any sidecar-injected candidate
    roster = set(survey_log.get('candidates_confirmed', [])) | set(survey_log.get('candidates_newly_found', []))
    for entry in survey_log.get('candidate_discovery_log', []):
        if entry.get('comparison_sidecar_addition'):
            roster.add(entry.get('candidate'))

    # (1) query_allocation_log completeness, unless the run was DISCOVERY-escape-valved
    exhaustion_note = survey_log.get('discovery_exhaustion_note')
    allocation_log = data.get('query_allocation_log', [])
    if not exhaustion_note:
        allocated_candidates = {a.get('candidate') for a in allocation_log}
        missing_allocation = roster - allocated_candidates
        if missing_allocation:
            errors.append(
                f"query_allocation_log missing entries for candidate(s) {sorted(missing_allocation)} "
                f"(run not escape-valved — discovery_exhaustion_note is null)"
            )
    for entry in allocation_log:
        if entry.get('target_share_pct') is None or entry.get('actual_share_pct') is None:
            errors.append(
                f"query_allocation_log entry for {entry.get('candidate')}/{entry.get('focus_area')} "
                f"is missing target_share_pct or actual_share_pct"
            )

    # (2) every CONTRARIAN-tagged claim traces to a real candidate on the final roster
    for c in claim_registry:
        if c.get('query_intent') == 'CONTRARIAN' and c.get('candidate') not in roster:
            errors.append(
                f"Claim {c.get('claim_id')} is tagged query_intent=CONTRARIAN but its candidate "
                f"'{c.get('candidate')}' is not on the final roster"
            )

    # (3) no CRITICAL claim carries support_grade AMBIGUOUS without a corroborating claim.
    # stage2_claims.json has no explicit corroboration-link field, so corroboration is
    # approximated as: another claim_registry entry, same candidate + focus_area, from a
    # distinct source_domain. Emitted as [WARN] pending confirmation this approximation
    # matches the pipeline's intended reading — same treatment as this pipeline's other
    # uncalibrated heuristics.
    for c in claim_registry:
        if c.get('importance_tier') == 'CRITICAL' and c.get('support_grade') == 'AMBIGUOUS':
            candidate = c.get('candidate')
            focus = c.get('focus_area')
            this_domain = c.get('source_domain')
            corroborated = any(
                o is not c
                and o.get('candidate') == candidate
                and o.get('focus_area') == focus
                and o.get('source_domain') != this_domain
                for o in claim_registry
            )
            if not corroborated:
                warnings.append(
                    f"Claim {c.get('claim_id')} is CRITICAL + support_grade=AMBIGUOUS with no "
                    f"corroborating claim from a distinct source_domain for {candidate}/{focus} "
                    f"(approximated check — see script docstring)"
                )

    # (4) anomalous_content_log must be present (possibly empty), never omitted
    if 'anomalous_content_log' not in data:
        errors.append("anomalous_content_log is missing — must be present (as an empty array if clean) on every run")

    return errors, warnings

def validate_stage3(stage1, stage2, data):
    errors = []
    warnings = []
    
    # Verify 27 fields on audited claims
    for claim in data.get('audited_claims', []):
        cid = claim.get('claim_id', 'unknown')
        if claim.get('importance_tier') in ['CRITICAL', 'HIGH']:
            for req in ['directness_classification', 'directness_note', 'tier_audit_status', 'arithmetic_consistency']:
                if req not in claim:
                    errors.append(f"Full-detail claim {cid} missing required v36 field: {req}")
                    
        if claim.get('arithmetic_consistency') == 'FLAGGED' and not claim.get('arithmetic_consistency_note'):
            errors.append(f"Claim {cid} is arithmetic FLAGGED but missing arithmetic_consistency_note")

    # --- Call 2 Patch 2 addition below ---
    # anomalous_content_note must carry every entry forward from stage2's
    # anomalous_content_log — a shorter list downstream is a dropped signal,
    # not something to infer meaning from.
    upstream_log = stage2.get('anomalous_content_log', [])
    carried = data.get('stage3_manifest', {}).get('anomalous_content_note', [])
    if len(upstream_log) > 0 and len(carried) < len(upstream_log):
        errors.append(
            f"stage2_claims.json's anomalous_content_log has {len(upstream_log)} entr(ies) but "
            f"stage3_audit.json's stage3_manifest.anomalous_content_note only carries {len(carried)} — "
            f"the signal was dropped between Call 2 and Call 3"
        )

    return errors, warnings

def validate_stage4(stage1, stage3, data):
    errors = []
    warnings = []
    
    manifest = data.get('stage4_manifest', {})
    if manifest.get('math_checksum_status') == 'MATH_CHECKSUM_FAILED':
        errors.append("stage4_manifest reports MATH_CHECKSUM_FAILED")
        
    # Check negative deductions
    for rank in data.get('final_rankings', []):
        c_name = rank.get('candidate', 'unknown')
        deductions = [d.get('points', 0) for d in rank.get('deduction_reasons', [])]
        if any(p < 0 for p in deductions):
            errors.append(f"Negative deduction detected for {c_name}")
            
    return errors, warnings

def validate_stage5(stage4, report_text):
    errors = []
    warnings = []
    
    red_team_count = len(stage4.get('red_team_analysis', []))
    if red_team_count > 0 and "red" not in report_text.lower() and "steelman" not in report_text.lower():
        warnings.append("Report may be missing mandatory Steelman/Red-Team full disclosure section")
        
    return errors, warnings

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 v36_stage_gate_validator.py <mode> <files...>")
        sys.exit(1)
        
    mode = sys.argv[1]
    files = sys.argv[2:]
    
    print(f"=== v36 Stage Gate Validator [Mode: {mode}] ===")
    
    all_clean = True
    if mode == 'stage1':
        s1 = load_json(files[0])
        e, w = validate_stage1(s1)
        for err in e: print(f"[FAIL] {err}"); all_clean = False
        for warn in w: print(f"[WARN] {warn}")
    elif mode == 'stage1-2':
        s1 = load_json(files[0])
        s2 = load_json(files[1])

        e1, w1 = validate_stage1(s1)
        e2, w2 = validate_stage2(s1, s2)

        all_errs = e1 + e2
        all_warns = w1 + w2

        for err in all_errs: print(f"[FAIL] {err}"); all_clean = False
        for warn in all_warns: print(f"[WARN] {warn}")
    elif mode == 'stage2-3':
        s1 = load_json(files[0])
        s2 = load_json(files[1])
        s3 = load_json(files[2])

        e1, w1 = validate_stage1(s1)
        e2, w2 = validate_stage2(s1, s2)
        e3, w3 = validate_stage3(s1, s2, s3)

        all_errs = e1 + e2 + e3
        all_warns = w1 + w2 + w3

        for err in all_errs: print(f"[FAIL] {err}"); all_clean = False
        for warn in all_warns: print(f"[WARN] {warn}")
    elif mode == 'all':
        s1 = load_json(files[0])
        s2 = load_json(files[1])
        s3 = load_json(files[2])
        s4 = load_json(files[3])
        with open(files[4], 'r', encoding='utf-8') as f:
            s5 = f.read()
            
        e1, w1 = validate_stage1(s1)
        e2, w2 = validate_stage2(s1, s2)
        e3, w3 = validate_stage3(s1, s2, s3)
        e4, w4 = validate_stage4(s1, s3, s4)
        e5, w5 = validate_stage5(s4, s5)
        
        all_errs = e1 + e2 + e3 + e4 + e5
        all_warns = w1 + w2 + w3 + w4 + w5
        
        for err in all_errs: print(f"[FAIL] {err}"); all_clean = False
        for warn in all_warns: print(f"[WARN] {warn}")
    else:
        print(f"[FAIL] Unrecognized or not-yet-implemented mode: {mode}")
        print("Implemented modes: stage1, stage1-2, stage2-3, all")
        print("Not yet implemented: stage3-4, stage4-5, stage3-4a, stage4a-4b (pre-existing gap, unrelated to Call 2 Patch 2)")
        sys.exit(1)
        
    if all_clean:
        print("[PASS] All stage validation checks passed cleanly (Exit 0)")
        sys.exit(0)
    else:
        print("[FAIL] Validation failed. Fix reported errors before proceeding.")
        sys.exit(1)

if __name__ == '__main__':
    main()
`;
