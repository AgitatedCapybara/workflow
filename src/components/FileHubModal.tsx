import React, { useState } from 'react';
import {
  X,
  FileCode,
  Download,
  FolderArchive,
  Copy,
  Check,
  FileText,
  Terminal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { downloadTextFile, downloadProjectZip } from '../utils/fileDownloader';
import { PYTHON_STAGE_GATE_VALIDATOR } from '../data/validatorScript';
import { SCHEMAS_FIELD_MANIFEST } from '../data/schemasManifest';

interface FileHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  files: Record<string, string>;
}

export const FileHubModal: React.FC<FileHubModalProps> = ({
  isOpen,
  onClose,
  projectName,
  files
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string>('stage1_framing.json');

  if (!isOpen) return null;

  const fileList = [
    { key: 'stage1_framing', name: 'stage1_framing.json', stage: 'Stage 1', desc: 'Framing, weights, risk thresholds & discovery gate', ext: 'json' },
    { key: 'stage2_claims', name: 'stage2_claims.json', stage: 'Stage 2', desc: 'Deep research evidence grid & completeness manifest', ext: 'json' },
    { key: 'stage3_audit', name: 'stage3_audit.json', stage: 'Stage 3', desc: 'Audited claims (27 fields), tier audit & math consistency', ext: 'json' },
    { key: 'stage4_directive_log', name: 'stage4_directive_log.json', stage: 'Stage 4', desc: 'MCDA matrix, fragility ratings & red-team arguments', ext: 'json' },
    { key: 'stage5_report', name: 'stage5_report.md', stage: 'Stage 5', desc: 'Final executive decision report in markdown', ext: 'md' },
    { key: 'schemas_manifest_md', name: 'v36_schemas_field_manifest.md', stage: 'Specification', desc: 'Canonical 5-stage JSON field manifest and contract', ext: 'md' },
    { key: 'validator_py', name: 'v36_stage_gate_validator.py', stage: 'Tooling', desc: 'Automated Python stage-gate CLI validator', ext: 'py' }
  ];

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getFileContent = (key: string): string => {
    if (key === 'validator_py') return PYTHON_STAGE_GATE_VALIDATOR;
    if (key === 'schemas_manifest_md') return SCHEMAS_FIELD_MANIFEST;
    return files[key] || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl flex flex-col text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/20">
              <FolderArchive className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-100">Project File Hub & Artifact Exporter</h2>
              <p className="text-xs text-neutral-400">Download canonical pipeline files with preset filenames or export a complete zip bundle.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadProjectZip(projectName, files)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Download className="h-4 w-4" />
              Download Full Project (.ZIP)
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left File List, Right Preview */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* File Selector */}
          <div className="md:col-span-5 border-r border-neutral-800 p-5 overflow-y-auto space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Canonical Pipeline Artifacts
            </div>
            {fileList.map((file) => {
              const content = getFileContent(file.key);
              const exists = content.trim().length > 0;
              const isSelected = selectedPreview === file.name;

              return (
                <div
                  key={file.key}
                  onClick={() => setSelectedPreview(file.name)}
                  className={`cursor-pointer rounded-xl border p-3.5 text-xs transition-all ${
                    isSelected
                      ? 'border-indigo-500/40 bg-indigo-950/20 shadow-xs'
                      : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {file.ext === 'py' ? (
                        <Terminal className="h-4 w-4 text-emerald-400" />
                      ) : file.ext === 'md' ? (
                        <FileText className="h-4 w-4 text-amber-400" />
                      ) : (
                        <FileCode className="h-4 w-4 text-indigo-400" />
                      )}
                      <span className="font-mono font-bold text-neutral-100">{file.name}</span>
                    </div>
                    {exists ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-500">Empty</span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-400">{file.desc}</div>
                  
                  {exists && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-800/60">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {(new TextEncoder().encode(content).length / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTextFile(file.name, content, file.ext === 'md' ? 'text/markdown' : file.ext === 'py' ? 'text/x-python' : 'application/json');
                        }}
                        className="inline-flex items-center gap-1 rounded bg-neutral-800 px-2 py-1 text-[10px] font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* File Preview */}
          <div className="md:col-span-7 p-5 flex flex-col overflow-hidden bg-neutral-950/80">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="font-mono text-xs font-semibold text-neutral-300 flex items-center gap-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                {selectedPreview}
              </span>
              {selectedPreview && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const item = fileList.find(f => f.name === selectedPreview);
                      if (item) handleCopy(item.key, getFileContent(item.key));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-700 transition-colors"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => {
                      const item = fileList.find(f => f.name === selectedPreview);
                      if (item) {
                        const content = getFileContent(item.key);
                        downloadTextFile(item.name, content, item.ext === 'md' ? 'text/markdown' : item.ext === 'py' ? 'text/x-python' : 'application/json');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto mt-3 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 font-mono text-xs text-neutral-300 whitespace-pre">
              {(() => {
                const item = fileList.find(f => f.name === selectedPreview);
                const content = item ? getFileContent(item.key) : '';
                return content || '// No content populated yet for this stage file.';
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
