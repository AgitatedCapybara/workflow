import React from 'react';
import {
  Sparkles,
  BookOpen,
  FolderArchive,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  ChevronDown
} from 'lucide-react';
import { PipelineProjectState } from '../types';

interface HeaderProps {
  project: PipelineProjectState;
  onOpenGuide: () => void;
  onOpenFileHub: () => void;
  onLoadPreset: (presetId: string) => void;
  onNewProject: () => void;
  onUpdateProjectName?: (name: string) => void;
  validationPassedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onOpenGuide,
  onOpenFileHub,
  onLoadPreset,
  onNewProject,
  onUpdateProjectName,
  validationPassedCount
}) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(project.name);

  React.useEffect(() => {
    setTitleValue(project.name);
  }, [project.name]);

  const handleSaveTitle = () => {
    if (titleValue.trim() && onUpdateProjectName) {
      onUpdateProjectName(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  // Extract decision focus if available
  const activeFocus = React.useMemo(() => {
    if (project.files.stage1_framing) {
      try {
        const s1 = JSON.parse(project.files.stage1_framing);
        return s1.decision_focus || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  }, [project.files.stage1_framing]);

  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-neutral-100 tracking-tight">v36 Pipeline Studio</span>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-400">
                  v36.0-ENTERPRISE
                </span>
              </div>
              <div className="flex items-center gap-1.5 max-w-sm sm:max-w-md lg:max-w-lg">
                {isEditingTitle ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveTitle();
                    }}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="text"
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onBlur={handleSaveTitle}
                      autoFocus
                      className="rounded border border-indigo-500 bg-neutral-950 px-2 py-0.5 text-[11px] text-neutral-100 focus:outline-hidden"
                    />
                  </form>
                ) : (
                  <div
                    onClick={() => setIsEditingTitle(true)}
                    className="group flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                    title="Click to rename decision project"
                  >
                    <span className="truncate font-medium">{project.name}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-neutral-500 underline">edit</span>
                  </div>
                )}
                {activeFocus && activeFocus !== project.name && (
                  <span className="hidden xl:inline text-[10px] text-neutral-500 truncate border-l border-neutral-800 pl-2">
                    Focus: {activeFocus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sample Preset Dropdown */}
            <div className="relative group">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Presets</span>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>

              <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Demo Decisions
                </div>
                <button
                  onClick={() => onLoadPreset('samsung-phone-sub600')}
                  className="w-full rounded-lg px-2.5 py-2 text-left text-xs text-neutral-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors"
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>📱</span> Samsung Galaxy Phone (&lt;$600)
                  </div>
                  <div className="text-[10px] text-neutral-400">Discovery Mode • Refurb/Direct/Retail</div>
                </button>
                <button
                  onClick={() => onLoadPreset('power-station-cpap')}
                  className="w-full rounded-lg px-2.5 py-2 text-left text-xs text-neutral-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors mt-1"
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>⚡</span> CPAP Power Station ($700)
                  </div>
                  <div className="text-[10px] text-neutral-400">Comparison Mode • Sidecar & Math Audit</div>
                </button>
                <div className="my-1 border-t border-neutral-800" />
                <button
                  onClick={onNewProject}
                  className="w-full rounded-lg px-2.5 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Start Blank Pipeline</span>
                </button>
              </div>
            </div>

            {/* Runbook Modal Button */}
            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guide & Runbook</span>
            </button>

            {/* Files Hub Modal Button */}
            <button
              onClick={onOpenFileHub}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
            >
              <FolderArchive className="h-3.5 w-3.5" />
              <span>File Hub & ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
