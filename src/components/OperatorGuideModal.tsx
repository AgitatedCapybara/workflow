import React from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Download
} from 'lucide-react';
import { PYTHON_STAGE_GATE_VALIDATOR } from '../data/validatorScript';
import { SCHEMAS_FIELD_MANIFEST } from '../data/schemasManifest';
import { downloadTextFile } from '../utils/fileDownloader';

export const OperatorGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 sm:p-8 text-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-neutral-800 pb-5">
          <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-100">v36 Operator Runbook & Execution Guide</h2>
            <p className="text-xs text-neutral-400">Step-by-step instructions for running high-stakes decision research flawlessly.</p>
          </div>
        </div>

        <div className="mt-6 space-y-8 text-sm">
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">1</span>
              The 5-Step Operating Sequence
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The pipeline executes across 5 stateless sessions. You copy the prompt from this app, paste it into the designated model, copy the JSON output back here, and download canonical stage files.
            </p>

            <div className="grid gap-3 sm:grid-cols-5 text-xs">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-bold text-indigo-400 mb-1">Stage 1</div>
                <div className="text-neutral-200 font-medium">Gemini 3.6 Flash</div>
                <div className="text-[11px] text-neutral-500 mt-1">Framing & Gates</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2">stage1_framing.json</div>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-bold text-indigo-400 mb-1">Stage 2</div>
                <div className="text-neutral-200 font-medium">Deep Research</div>
                <div className="text-[11px] text-neutral-500 mt-1">Evidence Grid</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2">stage2_claims.json</div>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-bold text-indigo-400 mb-1">Stage 3</div>
                <div className="text-neutral-200 font-medium">Claude Sonnet 5</div>
                <div className="text-[11px] text-neutral-500 mt-1">Web Search ON (high)</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2">stage3_audit.json</div>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-bold text-indigo-400 mb-1">Stage 4</div>
                <div className="text-neutral-200 font-medium">Claude Sonnet 5</div>
                <div className="text-[11px] text-neutral-500 mt-1">MCDA Math (max)</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2">stage4_directive_log.json</div>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="font-bold text-indigo-400 mb-1">Stage 5</div>
                <div className="text-neutral-200 font-medium">Gemini 3.6 Flash</div>
                <div className="text-[11px] text-neutral-500 mt-1">Synthesis Report</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2">stage5_report.md</div>
              </div>
            </div>
          </section>

          {/* Section 2: Model Configuration Rules */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">2</span>
              Model Settings & API Parameters
            </h3>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Claude Sonnet 5 Parameters:</strong> Stage 3 uses <code className="text-indigo-300">effort: high</code> with live web search. Stage 4 uses <code className="text-indigo-300">effort: max</code> (budget-critical reasoning pass).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Gemini Deep Research (Call 2):</strong> Uses dynamic single-branch injection. The brief generator automatically resolves DISCOVERY/COMPARISON/HYBRID branches and strips all <code>{'{{...}}'}</code> tags, preventing model planning loops on empty seed lists.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Context Isolation at Stage 5:</strong> Stage 5 MUST receive <code className="text-indigo-300">stage4_directive_log.json</code> ONLY. Do not attach earlier raw files, preserving zero-hallucination synthesis.</span>
              </div>
            </div>
          </section>

          {/* Section 3: The Seven Pillars of v36 */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">3</span>
              Key Upgrades in v36
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                <strong className="text-indigo-300 font-semibold">1. Hermetic Data Boundaries</strong>
                <p className="text-neutral-400 text-[11px]">Enforces strict isolation on scraped web text in Calls 3, 4, and 5 to stop prompt injection attacks.</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                <strong className="text-indigo-300 font-semibold">2. 3-Axis Disambiguation</strong>
                <p className="text-neutral-400 text-[11px]">Separates arithmetic errors from synthetic review flags so human math typos aren't penalized as AI-laundered content.</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                <strong className="text-indigo-300 font-semibold">3. Comparison-Mode Sidecar</strong>
                <p className="text-neutral-400 text-[11px]">Auto-scans category-first queries during head-to-head comparisons to ensure superior unknown alternatives aren't missed.</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                <strong className="text-indigo-300 font-semibold">4. Mandatory Full Disclosure</strong>
                <p className="text-neutral-400 text-[11px]">Guarantees all Red-Team counterarguments and Multi-Path consistency stress-tests reach the final executive report.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Specifications & Python Validator Tool */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-400" />
                Pipeline Specification & Python Validator
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadTextFile('v36_schemas_field_manifest.md', SCHEMAS_FIELD_MANIFEST, 'text/markdown')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-400" />
                  Field Manifest (.md)
                </button>
                <button
                  onClick={() => downloadTextFile('v36_stage_gate_validator.py', PYTHON_STAGE_GATE_VALIDATOR, 'text/x-python')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-white" />
                  Validator Script (.py)
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-300">
              <div className="text-neutral-500 mb-2"># Run the full pipeline validator in one command:</div>
              <div className="text-indigo-300 overflow-x-auto whitespace-nowrap">
                python3 v36_stage_gate_validator.py all stage1_framing.json stage2_claims.json stage3_audit.json stage4_directive_log.json stage5_report.md
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
