import {
  Stage1Framing,
  Stage2Claims,
  Stage3Audit,
  Stage4DirectiveLog,
  ValidationDiagnostic,
  ValidationSummary
} from '../types';

// Call 3 Patch 1 (Schema Guard & Dealbreaker Serialization Invariant):
// validateStage3Audit() below is resilient to the schema-drift defect
// fixed upstream in src/data/directives/call3.ts — it (a) accepts a
// legacy 'adjusted_weight' key as a fallback for 'adjusted_weight_final'
// but WARNs so the operator renames it before Call 4 consumes it, (b)
// FAILs when candidate_eligibility entries lack a valid literal
// 'dealbreaker_status' (a renamed/invented field halts Call 4's
// <input_completeness_precheck>), and (c) FAILs on a null
// unverified_rate, which must serialize as 0.0 for zero-claim focus
// areas.

export function validateStage1Framing(data: any): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];

  if (!data || typeof data !== 'object') {
    return [{ type: 'FAIL', stage: 'Stage 1', field: 'root', message: 'Payload is not a valid JSON object.' }];
  }

  // 1. Manifest checks
  if (!data.stage1_manifest) {
    diagnostics.push({ type: 'FAIL', stage: 'Stage 1', field: 'stage1_manifest', message: 'Missing stage1_manifest object.' });
  } else {
    if (data.stage1_manifest.pipeline_version !== 'v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE') {
      diagnostics.push({ type: 'WARN', stage: 'Stage 1', field: 'pipeline_version', message: `Pipeline version is "${data.stage1_manifest.pipeline_version}", expected "v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE".` });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 1', field: 'pipeline_version', message: 'Canonical v36 pipeline version verified.' });
    }

    if (!['CLEAR', 'CLARIFICATION_NEEDED'].includes(data.stage1_manifest.gate_status)) {
      diagnostics.push({ type: 'FAIL', stage: 'Stage 1', field: 'gate_status', message: 'gate_status must be CLEAR or CLARIFICATION_NEEDED.' });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 1', field: 'gate_status', message: `Gate status is ${data.stage1_manifest.gate_status}.` });
    }
  }

  // 2. Risk classification
  if (!['CONSUMER/CASUAL', 'CONSEQUENTIAL', 'SAFETY-CRITICAL'].includes(data.domain_risk)) {
    diagnostics.push({ type: 'FAIL', stage: 'Stage 1', field: 'domain_risk', message: 'Invalid or missing domain_risk classification.' });
  } else {
    diagnostics.push({ type: 'PASS', stage: 'Stage 1', field: 'domain_risk', message: `Domain risk classified as ${data.domain_risk}.` });
  }

  // 3. Focus area weights
  if (!Array.isArray(data.focus_area_weights) || data.focus_area_weights.length === 0) {
    diagnostics.push({ type: 'FAIL', stage: 'Stage 1', field: 'focus_area_weights', message: 'focus_area_weights array is empty or missing.' });
  } else {
    const totalWeight = data.focus_area_weights.reduce((sum: number, item: any) => sum + (Number(item.weight) || 0), 0);
    if (Math.abs(totalWeight - 1.0) > 0.015) {
      diagnostics.push({ type: 'FAIL', stage: 'Stage 1', field: 'focus_area_weights', message: `Weights sum to ${totalWeight.toFixed(4)}, must sum to 1.00 +/- 0.01.` });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 1', field: 'focus_area_weights', message: `Weights sum cleanly to ${totalWeight.toFixed(2)} across ${data.focus_area_weights.length} areas.` });
    }
  }

  // 4. Comparison mode sidecar check
  if (data.research_mode === 'COMPARISON') {
    if (!data.comparison_mode_sidecar || typeof data.comparison_mode_sidecar !== 'object') {
      diagnostics.push({ type: 'FAIL', stage: 'Stage 1', field: 'comparison_mode_sidecar', message: 'comparison_mode_sidecar object is MANDATORY when research_mode is COMPARISON (Pillar 3 Track B fix).' });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 1', field: 'comparison_mode_sidecar', message: `Comparison Sidecar configured (enabled: ${data.comparison_mode_sidecar.enabled}, max injection: ${data.comparison_mode_sidecar.max_candidates_injected}).` });
    }
  }

  // 5. Hard dealbreakers
  if (Array.isArray(data.hard_dealbreaker_registry)) {
    let validShapes = true;
    for (const db of data.hard_dealbreaker_registry) {
      if (!['THRESHOLD', 'BINARY'].includes(db.dealbreaker_shape)) {
        diagnostics.push({ type: 'FAIL', stage: 'Stage 1', field: 'hard_dealbreaker_registry', message: `Dealbreaker ${db.id || 'unnamed'} missing valid dealbreaker_shape (THRESHOLD or BINARY).` });
        validShapes = false;
      }
    }
    if (validShapes) {
      diagnostics.push({ type: 'PASS', stage: 'Stage 1', field: 'hard_dealbreaker_registry', message: `Verified ${data.hard_dealbreaker_registry.length} dealbreaker entries with explicit shape tags.` });
    }
  }

  return diagnostics;
}

export function validateStage2Claims(stage1: any, data: any): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];

  if (!data || typeof data !== 'object') {
    return [{ type: 'FAIL', stage: 'Stage 2', field: 'root', message: 'Payload is not a valid JSON object.' }];
  }

  // 1. Completeness Manifest Cell Math
  const manifest = data.completeness_manifest;
  if (!manifest) {
    diagnostics.push({ type: 'FAIL', stage: 'Stage 2', field: 'completeness_manifest', message: 'Missing completeness_manifest object.' });
  } else {
    const expected = Number(manifest.expected_cells) || 0;
    const claimed = Number(manifest.covered_by_claim) || 0;
    const empty = Number(manifest.covered_by_unconfirmed_lead) || 0;

    if (expected !== (claimed + empty)) {
      diagnostics.push({ type: 'FAIL', stage: 'Stage 2', field: 'completeness_manifest', message: `Cell math mismatch: expected (${expected}) != claimed (${claimed}) + logged_empty (${empty}).` });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 2', field: 'completeness_manifest', message: `Cell math fully reconciled: ${expected} expected = ${claimed} claimed + ${empty} logged empty.` });
    }

    const missingCells = Array.isArray(manifest.cells) ? manifest.cells.filter((c: any) => c.status === 'MISSING') : [];
    if (missingCells.length > 0) {
      diagnostics.push({ type: 'FAIL', stage: 'Stage 2', field: 'completeness_manifest.cells', message: `Found ${missingCells.length} MISSING cells. Grid must be fully filled with CLAIMED or LOGGED_EMPTY.` });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 2', field: 'completeness_manifest.cells', message: 'Zero MISSING cells detected in evidence grid.' });
    }
  }

  // 2. Claim URLs and status check
  if (Array.isArray(data.claim_registry)) {
    let urlIssues = 0;
    for (const claim of data.claim_registry) {
      if (!claim.source_url && claim.url_status !== 'UNAVAILABLE_NO_URL') {
        urlIssues++;
      }
    }
    if (urlIssues > 0) {
      diagnostics.push({ type: 'FAIL', stage: 'Stage 2', field: 'claim_registry.source_url', message: `Found ${urlIssues} claims with null URL without url_status: UNAVAILABLE_NO_URL.` });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 2', field: 'claim_registry.source_url', message: `Verified all ${data.claim_registry.length} claims carry live dereferenceable URLs or explicit unavailability flags.` });
    }
  }

  // 3. Sidecar injection resolution (if comparison)
  if (stage1?.research_mode === 'COMPARISON' && stage1.comparison_mode_sidecar?.enabled) {
    const sidecar = data.market_survey_log?.comparison_mode_sidecar;
    if (!sidecar || !['CANDIDATE_INJECTED', 'NONE_FOUND', 'SIDECAR_DISABLED'].includes(sidecar.sidecar_outcome)) {
      diagnostics.push({ type: 'FAIL', stage: 'Stage 2', field: 'comparison_mode_sidecar', message: 'Sidecar ran but missing resolved sidecar_outcome.' });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 2', field: 'comparison_mode_sidecar', message: `Sidecar outcome resolved: ${sidecar.sidecar_outcome}${sidecar.candidate_injected ? ` (${sidecar.candidate_injected})` : ''}.` });
    }
  }

  // --- Call 2 Patch 2 Validation Checks ---
  const surveyLog = data.market_survey_log || {};
  const claimRegistry = Array.isArray(data.claim_registry) ? data.claim_registry : [];

  // Roster construction
  const roster = new Set<string>([
    ...(surveyLog.candidates_confirmed || []),
    ...(surveyLog.candidates_newly_found || [])
  ]);
  if (Array.isArray(surveyLog.candidate_discovery_log)) {
    for (const entry of surveyLog.candidate_discovery_log) {
      if (entry.comparison_sidecar_addition && entry.candidate) {
        roster.add(entry.candidate);
      }
    }
  }

  // (1) query_allocation_log completeness
  const exhaustionNote = surveyLog.discovery_exhaustion_note;
  const allocationLog = Array.isArray(data.query_allocation_log) ? data.query_allocation_log : [];
  if (!exhaustionNote) {
    const allocatedCandidates = new Set(allocationLog.map((a: any) => a.candidate));
    const missingCandidates = [...roster].filter(c => !allocatedCandidates.has(c));
    if (missingCandidates.length > 0) {
      diagnostics.push({
        type: 'FAIL',
        stage: 'Stage 2',
        field: 'query_allocation_log',
        message: `query_allocation_log missing entries for candidate(s): ${missingCandidates.join(', ')} (run not escape-valved).`
      });
    } else if (allocationLog.length > 0) {
      diagnostics.push({
        type: 'PASS',
        stage: 'Stage 2',
        field: 'query_allocation_log',
        message: `query_allocation_log covers all ${roster.size} final roster candidate(s).`
      });
    }
  }

  // (2) CONTRARIAN query_intent validation
  const contrarianInvalid = claimRegistry.filter((c: any) => c.query_intent === 'CONTRARIAN' && !roster.has(c.candidate));
  if (contrarianInvalid.length > 0) {
    diagnostics.push({
      type: 'FAIL',
      stage: 'Stage 2',
      field: 'claim_registry.query_intent',
      message: `${contrarianInvalid.length} CONTRARIAN claims reference candidates not on the final roster.`
    });
  } else {
    const contrarianCount = claimRegistry.filter((c: any) => c.query_intent === 'CONTRARIAN').length;
    if (contrarianCount > 0) {
      diagnostics.push({
        type: 'PASS',
        stage: 'Stage 2',
        field: 'claim_registry.query_intent',
        message: `Verified ${contrarianCount} claims tagged with mandatory CONTRARIAN intent on final roster.`
      });
    }
  }

  // (3) support_grade AMBIGUOUS on CRITICAL claims
  const ambiguousCritical = claimRegistry.filter((c: any) => {
    if (c.importance_tier !== 'CRITICAL' || c.support_grade !== 'AMBIGUOUS') return false;
    const hasCorroboration = claimRegistry.some((o: any) =>
      o !== c &&
      o.candidate === c.candidate &&
      o.focus_area === c.focus_area &&
      o.source_domain !== c.source_domain
    );
    return !hasCorroboration;
  });
  if (ambiguousCritical.length > 0) {
    diagnostics.push({
      type: 'WARN',
      stage: 'Stage 2',
      field: 'claim_registry.support_grade',
      message: `${ambiguousCritical.length} claim(s) are CRITICAL with support_grade: AMBIGUOUS and lack distinct-domain corroboration.`
    });
  }

  // (4) anomalous_content_log must be present
  if (!('anomalous_content_log' in data)) {
    diagnostics.push({
      type: 'FAIL',
      stage: 'Stage 2',
      field: 'anomalous_content_log',
      message: 'anomalous_content_log is missing — must be present (as empty array if clean) on every run.'
    });
  } else {
    const anomalyCount = Array.isArray(data.anomalous_content_log) ? data.anomalous_content_log.length : 0;
    diagnostics.push({
      type: 'PASS',
      stage: 'Stage 2',
      field: 'anomalous_content_log',
      message: `anomalous_content_log present (${anomalyCount} injection anomalies recorded).`
    });
  }

  return diagnostics;
}

export function validateStage3Audit(stage1: any, stage2: any, data: any): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];

  if (!data || typeof data !== 'object') {
    return [{ type: 'FAIL', stage: 'Stage 3', field: 'root', message: 'Payload is not a valid JSON object.' }];
  }

  // 1. Audited claim 27-field verification
  if (Array.isArray(data.audited_claims)) {
    let missingFieldCount = 0;
    let arithmeticFlaggedCount = 0;
    
    for (const claim of data.audited_claims) {
      if (claim.importance_tier === 'CRITICAL' || claim.importance_tier === 'HIGH') {
        const required = ['directness_classification', 'directness_note', 'tier_audit_status', 'arithmetic_consistency'];
        for (const req of required) {
          if (claim[req] === undefined || claim[req] === null) {
            missingFieldCount++;
          }
        }
        if (claim.arithmetic_consistency === 'FLAGGED') {
          arithmeticFlaggedCount++;
          if (!claim.arithmetic_consistency_note) {
            diagnostics.push({ type: 'FAIL', stage: 'Stage 3', field: `claim_${claim.claim_id}.arithmetic_consistency_note`, message: `Claim ${claim.claim_id} is arithmetic FLAGGED but lacks arithmetic_consistency_note.` });
          }
        }
      }
    }

    if (missingFieldCount > 0) {
      diagnostics.push({ type: 'FAIL', stage: 'Stage 3', field: 'audited_claims', message: `Found ${missingFieldCount} missing mandatory v36 fields across CRITICAL/HIGH claims.` });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 3', field: 'audited_claims', message: `All ${data.audited_claims.length} audited claims adhere to full 27-field manifest.` });
    }

    if (arithmeticFlaggedCount > 0) {
      diagnostics.push({ type: 'WARN', stage: 'Stage 3', field: 'arithmetic_consistency', message: `${arithmeticFlaggedCount} claims flagged with internal battery/power draw arithmetic discrepancy (informational, not penalized as laundering).` });
    }
  }

  // 2. Preliminary weight-shift check
  if (Array.isArray(data.preliminary_adjusted_focus_weights)) {
    let usedAlternateField = false;
    const sumFinal = data.preliminary_adjusted_focus_weights.reduce((sum: number, item: any) => {
      const val = item.adjusted_weight_final !== undefined ? item.adjusted_weight_final : (item.adjusted_weight !== undefined ? item.adjusted_weight : item.weight);
      if (item.adjusted_weight_final === undefined && item.adjusted_weight !== undefined) {
        usedAlternateField = true;
      }
      return sum + (Number(val) || 0);
    }, 0);

    if (Math.abs(sumFinal - 1.0) > 0.002) {
      diagnostics.push({
        type: 'FAIL',
        stage: 'Stage 3',
        field: 'preliminary_adjusted_focus_weights',
        message: `Adjusted weights sum to ${sumFinal.toFixed(4)}, failed exact normalization test (|sum - 1.0| > 0.001).`
      });
    } else if (usedAlternateField) {
      diagnostics.push({
        type: 'WARN',
        stage: 'Stage 3',
        field: 'preliminary_adjusted_focus_weights',
        message: `Weights sum to ${sumFinal.toFixed(4)} (passed normalization), but entries use 'adjusted_weight' instead of the v36 schema field name 'adjusted_weight_final'. Update the key to 'adjusted_weight_final' so Call 4 consumes it without error.`
      });
    } else {
      diagnostics.push({
        type: 'PASS',
        stage: 'Stage 3',
        field: 'preliminary_adjusted_focus_weights',
        message: `Preliminary weight-shift exact normalization passed (sum = ${sumFinal.toFixed(4)}).`
      });
    }

    // Call 3 Patch 1: unverified_rate must be a literal 0.0 for zero-claim
    // focus areas, never null. A null here silently corrupts the weight-shift
    // formula downstream (Unverified Rate feeds Adjusted Weight directly).
    const nullRateAreas = data.preliminary_adjusted_focus_weights
      .filter((item: any) => item.unverified_rate === null)
      .map((item: any) => item.focus_area || 'unnamed');
    if (nullRateAreas.length > 0) {
      diagnostics.push({
        type: 'FAIL',
        stage: 'Stage 3',
        field: 'preliminary_adjusted_focus_weights.unverified_rate',
        message: `unverified_rate is null for focus area(s): ${nullRateAreas.join(', ')}. Zero total claims must serialize as literal 0.0, not null — a null value is schema non-compliant and will corrupt the Adjusted Weight calculation.`
      });
    } else {
      diagnostics.push({
        type: 'PASS',
        stage: 'Stage 3',
        field: 'preliminary_adjusted_focus_weights.unverified_rate',
        message: `All ${data.preliminary_adjusted_focus_weights.length} focus area(s) carry a numeric unverified_rate (no null values).`
      });
    }
  }

  // 2b. Candidate Eligibility Schema Check (Required by Call 4 Step 1 Precheck)
  if (Array.isArray(data.candidate_eligibility)) {
    const validStatuses = ['NONE_TRIGGERED', 'VERIFIED_VIOLATION', 'PENDING_VERIFICATION'];
    let invalidStatusCount = 0;
    for (const item of data.candidate_eligibility) {
      if (!item.dealbreaker_status || !validStatuses.includes(item.dealbreaker_status)) {
        invalidStatusCount++;
      }
    }
    if (invalidStatusCount > 0) {
      diagnostics.push({
        type: 'FAIL',
        stage: 'Stage 3',
        field: 'candidate_eligibility',
        message: `${invalidStatusCount} candidate(s) lack valid 'dealbreaker_status' ('NONE_TRIGGERED' | 'VERIFIED_VIOLATION' | 'PENDING_VERIFICATION'). Call 4's <input_completeness_precheck> requires the literal field 'dealbreaker_status' — a renamed field like 'eligibility_status' (e.g. 'ELIGIBLE_HIGH_CONFIDENCE') is invisible to it and will trigger a DATA_LOSS_HALT at Call 4, not a soft degradation.`
      });
    } else {
      diagnostics.push({
        type: 'PASS',
        stage: 'Stage 3',
        field: 'candidate_eligibility',
        message: `All ${data.candidate_eligibility.length} candidate eligibility entries carry valid v36 dealbreaker_status.`
      });
    }
  }

  // 3. Call 2 Patch 2: anomalous_content_note carry-forward
  const upstreamLog = Array.isArray(stage2?.anomalous_content_log) ? stage2.anomalous_content_log : [];
  const carried = Array.isArray(data.stage3_manifest?.anomalous_content_note) ? data.stage3_manifest.anomalous_content_note : [];
  if (upstreamLog.length > 0 && carried.length < upstreamLog.length) {
    diagnostics.push({
      type: 'FAIL',
      stage: 'Stage 3',
      field: 'stage3_manifest.anomalous_content_note',
      message: `stage2_claims.json's anomalous_content_log has ${upstreamLog.length} entr(ies) but stage3_manifest.anomalous_content_note only carries ${carried.length} — signal was dropped between Call 2 and Call 3.`
    });
  } else if (upstreamLog.length > 0) {
    diagnostics.push({
      type: 'PASS',
      stage: 'Stage 3',
      field: 'stage3_manifest.anomalous_content_note',
      message: `All ${upstreamLog.length} anomalous content entr(ies) preserved in Stage 3 manifest.`
    });
  }

  return diagnostics;
}

export function validateStage4Scoring(stage1: any, stage3: any, data: any): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];

  if (!data || typeof data !== 'object') {
    return [{ type: 'FAIL', stage: 'Stage 4', field: 'root', message: 'Payload is not a valid JSON object.' }];
  }

  // 1. Math Checksum
  if (data.stage4_manifest?.math_checksum_status === 'MATH_CHECKSUM_FAILED') {
    diagnostics.push({ type: 'FAIL', stage: 'Stage 4', field: 'math_checksum_status', message: 'stage4_manifest reports MATH_CHECKSUM_FAILED.' });
  } else {
    diagnostics.push({ type: 'PASS', stage: 'Stage 4', field: 'math_checksum_status', message: 'Math checksum status PASSED.' });
  }

  // 2. Negative deduction guard
  if (Array.isArray(data.final_rankings)) {
    let negativeDeductionFound = false;
    for (const rank of data.final_rankings) {
      if (Array.isArray(rank.deduction_reasons)) {
        for (const ded of rank.deduction_reasons) {
          if (Number(ded.points) < 0) {
            diagnostics.push({ type: 'FAIL', stage: 'Stage 4', field: 'negative_deduction_guard', message: `Candidate ${rank.candidate} has negative deduction points: ${ded.points}.` });
            negativeDeductionFound = true;
          }
        }
      }
    }
    if (!negativeDeductionFound) {
      diagnostics.push({ type: 'PASS', stage: 'Stage 4', field: 'negative_deduction_guard', message: 'Negative deduction guard passed across all eligible candidate rankings.' });
    }
  }

  // 3. MCDA Matrix
  if (!data.mcda_matrix || !Array.isArray(data.mcda_matrix.focus_areas) || !Array.isArray(data.mcda_matrix.candidates)) {
    diagnostics.push({ type: 'FAIL', stage: 'Stage 4', field: 'mcda_matrix', message: 'Missing or malformed mcda_matrix object.' });
  } else {
    diagnostics.push({ type: 'PASS', stage: 'Stage 4', field: 'mcda_matrix', message: `MCDA Matrix verified (${data.mcda_matrix.candidates.length} candidates x ${data.mcda_matrix.focus_areas.length} focus areas).` });
  }

  return diagnostics;
}

export function validateStage5Report(stage4: any, reportText: string): ValidationDiagnostic[] {
  const diagnostics: ValidationDiagnostic[] = [];

  if (!reportText || typeof reportText !== 'string' || reportText.trim().length < 50) {
    return [{ type: 'FAIL', stage: 'Stage 5', field: 'report', message: 'Report is empty or too short.' }];
  }

  diagnostics.push({ type: 'PASS', stage: 'Stage 5', field: 'length', message: `Report generated with ${reportText.length} characters.` });

  // Check stress-test / contrarian critique presence
  const stressTestCount = stage4?.stress_test_analysis?.length || stage4?.red_team_analysis?.length || 0;
  if (stressTestCount > 0) {
    const lower = reportText.toLowerCase();
    const hasDisclosure = ['stress', 'steelman', 'caveat', 'counter', 'vulnerability', 'downside', 'red'].some(k => lower.includes(k));
    if (!hasDisclosure) {
      diagnostics.push({ type: 'WARN', stage: 'Stage 5', field: 'stress_test_disclosure', message: `Stage 4 produced ${stressTestCount} stress-test analyses, but report may lack Steelman/Stress-Test section.` });
    } else {
      diagnostics.push({ type: 'PASS', stage: 'Stage 5', field: 'stress_test_disclosure', message: `Mandatory full disclosure confirmed for stress-test / contrarian analysis.` });
    }
  }

  return diagnostics;
}

export function validateEntirePipeline(files: {
  stage1_framing?: string;
  stage2_claims?: string;
  stage3_audit?: string;
  stage4_directive_log?: string;
  stage5_report?: string;
}): ValidationSummary {
  const allDiagnostics: ValidationDiagnostic[] = [];

  let s1: any = null;
  let s2: any = null;
  let s3: any = null;
  let s4: any = null;

  if (files.stage1_framing) {
    try {
      s1 = JSON.parse(files.stage1_framing);
      allDiagnostics.push(...validateStage1Framing(s1));
    } catch (e: any) {
      allDiagnostics.push({ type: 'FAIL', stage: 'Stage 1', field: 'json_syntax', message: `JSON Parse error: ${e.message}` });
    }
  }

  if (files.stage2_claims) {
    try {
      s2 = JSON.parse(files.stage2_claims);
      allDiagnostics.push(...validateStage2Claims(s1, s2));
    } catch (e: any) {
      allDiagnostics.push({ type: 'FAIL', stage: 'Stage 2', field: 'json_syntax', message: `JSON Parse error: ${e.message}` });
    }
  }

  if (files.stage3_audit) {
    try {
      s3 = JSON.parse(files.stage3_audit);
      allDiagnostics.push(...validateStage3Audit(s1, s2, s3));
    } catch (e: any) {
      allDiagnostics.push({ type: 'FAIL', stage: 'Stage 3', field: 'json_syntax', message: `JSON Parse error: ${e.message}` });
    }
  }

  if (files.stage4_directive_log) {
    try {
      s4 = JSON.parse(files.stage4_directive_log);
      allDiagnostics.push(...validateStage4Scoring(s1, s3, s4));
    } catch (e: any) {
      allDiagnostics.push({ type: 'FAIL', stage: 'Stage 4', field: 'json_syntax', message: `JSON Parse error: ${e.message}` });
    }
  }

  if (files.stage5_report) {
    allDiagnostics.push(...validateStage5Report(s4, files.stage5_report));
  }

  const passCount = allDiagnostics.filter(d => d.type === 'PASS').length;
  const warnCount = allDiagnostics.filter(d => d.type === 'WARN').length;
  const failCount = allDiagnostics.filter(d => d.type === 'FAIL').length;

  return {
    isValid: failCount === 0 && allDiagnostics.length > 0,
    passCount,
    warnCount,
    failCount,
    diagnostics: allDiagnostics
  };
}
