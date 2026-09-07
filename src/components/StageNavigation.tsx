import React from 'react';
import { StageId, PipelineProjectState } from '../types';
import {
  CheckCircle2,
  CircleDot,
  FileCheck,
  ChevronRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface StageNavigationProps {
  activeStage: StageId;
  onSelectStage: (stage: StageId) => void;
  project: PipelineProjectState;
}

export const StageNavigation: React.FC<StageNavigationProps> = ({
  activeStage,
  onSelectStage,
  project
}) => {
  const stages: { id: StageId; label: string; fileKey: string; model: string }[] = [
    { id: 'stage1', label: '1. Framing & Gate', fileKey: 'stage1_framing', model: 'Gemini 3.6 Flash' },
    { id: 'stage2', label: '2. Deep Research', fileKey: 'stage2_claims', model: 'Gemini Deep Research' },
    { id: 'stage3', label: '3. Verification Audit', fileKey: 'stage3_audit', model: 'Claude Sonnet 5 (high)' },
    { id: 'stage4', label: '4. Scoring & Stress-Test', fileKey: 'stage4_directive_log', model: 'Claude Sonnet 5 (max)' },
    { id: 'stage5', label: '5. Executive Report', fileKey: 'stage5_report', model: 'Gemini 3.6 Flash' }
  ];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-2 shadow-lg">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {stages.map((stage, idx) => {
          const content = project.files[stage.fileKey as keyof typeof project.files] || '';
          const hasData = content.trim().length > 0;
          const isActive = activeStage === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`flex flex-col items-start rounded-xl p-3 text-left transition-all ${
                isActive
                  ? 'border border-indigo-500/50 bg-indigo-950/30 text-indigo-300 shadow-md shadow-indigo-500/5'
                  : 'border border-transparent hover:border-neutral-800 hover:bg-neutral-800/40 text-neutral-400'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  Step {idx + 1}
                </span>
                {hasData ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <CircleDot className="h-3 w-3 text-neutral-600" />
                )}
              </div>

              <div className="mt-1 text-xs font-semibold text-neutral-200 truncate w-full">
                {stage.label}
              </div>

              <div className="mt-0.5 text-[10px] text-neutral-500 truncate w-full">
                {stage.model}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
