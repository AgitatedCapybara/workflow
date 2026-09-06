import React, { useState } from 'react';
import {
  StageId,
  PipelineProjectState
} from './types';
import { SAMPLE_POWER_STATION, SAMPLE_SAMSUNG_PHONE } from './data/sampleProjects';
import { Header } from './components/Header';
import { StageNavigation } from './components/StageNavigation';
import { StageRunner } from './components/StageRunner';
import { OperatorGuideModal } from './components/OperatorGuideModal';
import { FileHubModal } from './components/FileHubModal';
import { validateEntirePipeline } from './utils/schemaValidator';
import { downloadProjectZip } from './utils/fileDownloader';
import {
  FolderArchive,
  BookOpen,
  Sparkles,
  Download,
  Terminal,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<PipelineProjectState>(SAMPLE_POWER_STATION);
  const [activeStage, setActiveStage] = useState<StageId>('stage1');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isFileHubOpen, setIsFileHubOpen] = useState<boolean>(false);

  // Compute live validation metrics across entire pipeline
  const validationSummary = validateEntirePipeline(project.files);

  const handleUpdateFile = (fileKey: string, content: string) => {
    setProject(prev => {
      let updatedName = prev.name;
      // If updating stage1_framing and project still has default/old name, sync title with decision_focus if present
      if (fileKey === 'stage1_framing') {
        try {
          const parsed = JSON.parse(content);
          if (parsed.decision_focus) {
            // Keep it concise if needed or use full focus
            const focus = parsed.decision_focus.trim();
            if (prev.name === 'Untitled Decision Research' || prev.name.includes('CPAP')) {
              updatedName = focus.length > 55 ? focus.slice(0, 52) + '...' : focus;
            }
          }
        } catch (e) {
          // ignore
        }
      }
      return {
        ...prev,
        name: updatedName,
        files: {
          ...prev.files,
          [fileKey]: content
        }
      };
    });
  };

  const handleUpdateProjectName = (name: string) => {
    setProject(prev => ({
      ...prev,
      name
    }));
  };

  const handleLoadPreset = (presetId: string) => {
    if (presetId === 'power-station-cpap') {
      setProject(SAMPLE_POWER_STATION);
      setActiveStage('stage1');
    } else if (presetId === 'samsung-phone-sub600') {
      setProject(SAMPLE_SAMSUNG_PHONE);
      setActiveStage('stage1');
    }
  };

  const handleNewProject = () => {
    setProject({
      id: `project-${Date.now()}`,
      name: 'Untitled Decision Research',
      description: 'Custom decision pipeline workspace.',
      path: 'DEFAULT',
      currentStage: 'stage1',
      files: {
        stage1_framing: '',
        stage2_claims: '',
        stage3_audit: '',
        stage4_directive_log: '',
        stage5_report: ''
      },
      parsedData: {}
    });
    setActiveStage('stage1');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Application Header */}
      <Header
        project={project}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenFileHub={() => setIsFileHubOpen(true)}
        onLoadPreset={handleLoadPreset}
        onNewProject={handleNewProject}
        onUpdateProjectName={handleUpdateProjectName}
        validationPassedCount={validationSummary.passCount}
      />

      {/* Main Workspace */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Pipeline Stage Tracker */}
        <StageNavigation
          activeStage={activeStage}
          onSelectStage={setActiveStage}
          project={project}
        />

        {/* Stage Active Runner Workspace */}
        <StageRunner
          activeStage={activeStage}
          project={project}
          onUpdateFile={handleUpdateFile}
          onUpdateProjectName={handleUpdateProjectName}
        />
      </main>

      {/* Footer & Quick Export Banner */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>v36 Pipeline Orchestrator • Gemini 3.6 Flash / Deep Research / Claude Sonnet 5</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Operator Playbook
            </button>
            <span>•</span>
            <button
              onClick={() => setIsFileHubOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Export Project (.ZIP)
            </button>
          </div>
        </div>
      </footer>

      {/* Operator Guide Modal */}
      <OperatorGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* File Hub & Downloader Modal */}
      <FileHubModal
        isOpen={isFileHubOpen}
        onClose={() => setIsFileHubOpen(false)}
        projectName={project.name}
        files={project.files as Record<string, string>}
      />
    </div>
  );
}
