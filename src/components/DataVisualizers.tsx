import React from 'react';
import {
  Stage1Framing,
  Stage2Claims,
  Stage3Audit,
  Stage4DirectiveLog
} from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Cpu,
  Layers,
  Scale
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const Stage1Visualizer: React.FC<{ data: Stage1Framing }> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Decision Focus</div>
            <h3 className="text-lg font-semibold text-neutral-100">{data.decision_focus}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              data.domain_risk === 'SAFETY-CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              data.domain_risk === 'CONSEQUENTIAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {data.domain_risk}
            </span>
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-300">
              {data.research_mode} Mode
            </span>
          </div>
        </div>

        {/* Focus Area Weights Breakdown */}
        <div className="mt-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Priority Weights Distribution ({data.focus_area_weights?.length || 0} Focus Areas)
          </div>
          <div className="space-y-3">
            {data.focus_area_weights?.map((w, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span className="font-medium text-neutral-200">{w.area}</span>
                  <span className="font-mono text-indigo-400">{(w.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                    style={{ width: `${w.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hard Dealbreakers */}
        {data.hard_dealbreaker_registry && data.hard_dealbreaker_registry.length > 0 && (
          <div className="mt-6 border-t border-neutral-800/80 pt-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Hard Dealbreakers ({data.hard_dealbreaker_registry.length})
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {data.hard_dealbreaker_registry.map((db, idx) => (
                <div key={idx} className="rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-xs text-neutral-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-red-400">{db.id}</span>
                    <span className="rounded bg-red-900/40 px-1.5 py-0.5 text-[10px] font-mono text-red-300">
                      {db.dealbreaker_shape}
                    </span>
                  </div>
                  <p className="text-neutral-300">{db.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sidecar Info */}
        {data.comparison_mode_sidecar && (
          <div className="mt-4 rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs text-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span>
                <strong>Comparison Sidecar Active:</strong> Auto-scanning up to {data.comparison_mode_sidecar.max_sidecar_queries} category-first queries for outside candidates.
              </span>
            </div>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
              Max 1 Injection
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const Stage2Visualizer: React.FC<{ data: Stage2Claims }> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">Total Claims Found</div>
          <div className="mt-1 text-2xl font-bold font-mono text-indigo-400">{data.claim_registry?.length || 0}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">Queries Executed</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-100">{data.call2_execution_stats?.total_queries_run || 0}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">Wall-Clock Time</div>
          <div className="mt-1 text-2xl font-bold font-mono text-neutral-100">{data.call2_execution_stats?.wall_clock_minutes?.toFixed(1) || 0}m</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">Grid Completeness</div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
            {data.completeness_manifest ? `${data.completeness_manifest.covered_by_claim}/${data.completeness_manifest.expected_cells}` : '100%'}
          </div>
        </div>
      </div>

      {/* Sidecar Result Banner */}
      {data.market_survey_log?.comparison_mode_sidecar && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <Zap className="h-4 w-4 text-indigo-400" />
              Sidecar Discovery Outcome: {data.market_survey_log.comparison_mode_sidecar.sidecar_outcome}
            </div>
            {data.market_survey_log.comparison_mode_sidecar.candidate_injected && (
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 text-xs font-semibold text-indigo-200">
                Injected: {data.market_survey_log.comparison_mode_sidecar.candidate_injected}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Candidate Discovery Methods */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Candidate Pool & Discovery Methods
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {data.market_survey_log?.candidate_discovery_log?.map((c, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/50 p-2.5 text-xs">
              <span className="font-medium text-neutral-200">{c.candidate}</span>
              <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                c.discovery_method === 'CATEGORY_QUERY' ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30' :
                c.discovery_method === 'USER_SEED' ? 'bg-neutral-800 text-neutral-300' :
                'bg-neutral-800 text-neutral-400'
              }`}>
                {c.discovery_method} {c.comparison_sidecar_addition ? '⚡' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Stage3Visualizer: React.FC<{ data: Stage3Audit }> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Stage 3 Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">Audited Claims</div>
          <div className="mt-1 text-2xl font-bold font-mono text-indigo-400">{data.audited_claims?.length || 0}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">Discovery Assessment</div>
          <div className="mt-1 text-lg font-bold text-emerald-400">{data.stage3_manifest?.discovery_completeness_check?.assessment || 'COMPLIANT'}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="text-xs text-neutral-400">Math Checksum</div>
          <div className="mt-1 text-lg font-bold text-emerald-400">{data.stage3_manifest?.math_checksum_status}</div>
        </div>
      </div>

      {/* Audited Claims Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Audited Claims & 3-Axis Disambiguation
          </div>
          <span className="text-[11px] text-neutral-500">Showing {data.audited_claims?.length || 0} claims</span>
        </div>
        <div className="space-y-3">
          {data.audited_claims?.map((claim, idx) => (
            <div key={idx} className="rounded-lg border border-neutral-800/80 bg-neutral-950/50 p-3 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">{claim.claim_id}</span>
                  <span className="font-medium text-neutral-200">{claim.candidate}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                    claim.verification_status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    claim.verification_status === 'CAVEATED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {claim.verification_status}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-mono ${
                    claim.arithmetic_consistency === 'FLAGGED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    Math: {claim.arithmetic_consistency || 'N/A'}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-[10px] ${
                    claim.laundering_flag === 'NONE' ? 'bg-neutral-800 text-neutral-400' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {claim.laundering_flag || 'NONE'}
                  </span>
                </div>
              </div>
              <p className="text-neutral-300 italic">"{claim.claim_text}"</p>
              {claim.verification_note && (
                <div className="text-[11px] text-neutral-400">
                  <strong className="text-neutral-300">Audit note:</strong> {claim.verification_note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Stage4Visualizer: React.FC<{ data: Stage4DirectiveLog }> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner: Winner & Fragility Rating */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-neutral-900/60 to-neutral-900/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Top Ranked Candidate</div>
            <h2 className="text-2xl font-bold text-neutral-100">{data.final_rankings?.[0]?.candidate || 'Winner'}</h2>
            <div className="mt-1 text-xs text-neutral-400">
              Final Candidate Score: <span className="font-mono font-bold text-indigo-400 text-sm">{data.final_rankings?.[0]?.final_candidate_score} / 100</span> (Confidence: {data.final_rankings?.[0]?.confidence_score}/10)
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400 mb-1">Fragility Classification</div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              data.stage4_manifest?.fragility_classification === 'BULLETPROOF' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
              data.stage4_manifest?.fragility_classification === 'SENSITIVE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
              'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              <ShieldCheck className="h-4 w-4" />
              {data.stage4_manifest?.fragility_classification} ({data.stage4_manifest?.fragility_margin_pct?.toFixed(0) || 'N/A'}% margin)
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Score Comparison Bars */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Scale className="h-4 w-4 text-indigo-400" />
          Final Candidate Rankings & Score Breakdown
        </div>
        <div className="space-y-4">
          {data.final_rankings?.map((rank, idx) => (
            <div key={idx} className="rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400">#{idx + 1}</span>
                  <span className="text-sm font-semibold text-neutral-200">{rank.candidate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400">Conf: <strong className="text-neutral-200">{rank.confidence_score}</strong></span>
                  <span className="font-mono text-sm font-bold text-neutral-100">{rank.final_candidate_score} pts</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' : 'bg-neutral-600'}`}
                  style={{ width: `${rank.final_candidate_score}%` }}
                />
              </div>
              {rank.deduction_reasons && rank.deduction_reasons.length > 0 && (
                <div className="text-[11px] text-neutral-400 pt-1">
                  <strong className="text-red-400/80">Deductions:</strong> {rank.deduction_reasons.map(d => `${d.claim_id_or_gap} (-${d.points}pt)`).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Path Consistency Stress Test */}
      {data.multi_path_consistency && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              Multi-Path Priority Consistency Stress-Tests
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              data.multi_path_consistency.robust ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {data.multi_path_consistency.robust ? 'ALL PATHS INVARIANT' : 'FLIP DETECTED'}
            </span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {data.multi_path_consistency.path_results?.map((path, idx) => (
              <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3 text-xs">
                <div className="text-[11px] text-neutral-400">Anchor: <span className="text-neutral-200 font-medium">{path.anchor_focus_area}</span></div>
                <div className="mt-1 flex items-center justify-between font-mono">
                  <span className="font-semibold text-indigo-300">{path.winner}</span>
                  <span className="text-neutral-400">{path.winner_score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steelman vs Stress-Test */}
      {((data.stress_test_analysis && data.stress_test_analysis.length > 0) || (data.red_team_analysis && data.red_team_analysis.length > 0)) && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            Mandatory Stress-Test & Steelman Arguments
          </div>
          <div className="space-y-3">
            {(data.stress_test_analysis || data.red_team_analysis || []).map((st, idx) => (
              <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3 text-xs space-y-2">
                <div className="font-mono font-bold text-indigo-400">{st.claim_id}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-emerald-500/20 bg-emerald-950/10 p-2 text-emerald-200">
                    <strong className="block text-emerald-400 text-[10px] uppercase tracking-wider">Steelman Argument</strong>
                    {st.steelman_argument}
                  </div>
                  <div className="rounded border border-amber-500/20 bg-amber-950/10 p-2 text-amber-200">
                    <strong className="block text-amber-400 text-[10px] uppercase tracking-wider">Stress-Test Caveat</strong>
                    {st.counter_argument || st.redteam_argument}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Stage5Visualizer: React.FC<{ reportText: string }> = ({ reportText }) => {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8">
      <div className="prose prose-invert prose-neutral max-w-none prose-headings:text-neutral-100 prose-headings:font-semibold prose-a:text-indigo-400 prose-strong:text-neutral-100 prose-code:text-indigo-300">
        <ReactMarkdown>{reportText}</ReactMarkdown>
      </div>
    </div>
  );
};
