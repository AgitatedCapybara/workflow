import React, { useState, useEffect, useMemo } from 'react';
import {
  StageId,
  PipelineProjectState,
  ValidationDiagnostic,
  AcquisitionChannel
} from '../types';
import {
  STAGE_META_INFO,
  CALL1_SYSTEM_DIRECTIVE,
  CALL3_SYSTEM_DIRECTIVE,
  CALL4_SYSTEM_DIRECTIVE,
  CALL5_SYSTEM_DIRECTIVE,
  generateCall2Brief,
  generateCall2FollowupPrompt
} from '../data/pipelineDirectives';
import {
  Stage1Visualizer,
  Stage2Visualizer,
  Stage3Visualizer,
  Stage4Visualizer,
  Stage5Visualizer
} from './DataVisualizers';
import {
  validateStage1Framing,
  validateStage2Claims,
  validateStage3Audit,
  validateStage4Scoring,
  validateStage5Report
} from '../utils/schemaValidator';
import { downloadTextFile } from '../utils/fileDownloader';
import {
  Copy,
  Check,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  FileCode,
  FileText,
  Eye,
  Edit3,
  Cpu,
  Clock,
  Wrench,
  Paperclip,
  Sparkles,
  ExternalLink,
  ShoppingCart,
  DollarSign,
  Tag,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  Zap,
  Smartphone,
  Headphones,
  Store
} from 'lucide-react';

interface StageRunnerProps {
  activeStage: StageId;
  project: PipelineProjectState;
  onUpdateFile: (fileKey: string, content: string) => void;
  onAdvanceStage?: () => void;
  onUpdateProjectName?: (name: string) => void;
}

export const StageRunner: React.FC<StageRunnerProps> = ({
  activeStage,
  project,
  onUpdateFile,
  onAdvanceStage,
  onUpdateProjectName
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'input' | 'visualize'>('prompt');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [queryConfirmed, setQueryConfirmed] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const [userQueryInput, setUserQueryInput] = useState(
    'Best portable power station under $700 with pure sine wave for overnight CPAP use'
  );
  const [acquisitionChannel, setAcquisitionChannel] = useState<AcquisitionChannel>('CERTIFIED_REFURBISHED');
  const [priceBasis, setPriceBasis] = useState<'MSRP' | 'REAL_TIME_STREET_PRICE' | 'COMPLETED_AUCTION_PRICE'>('REAL_TIME_STREET_PRICE');
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([
    'Manufacturer Direct (e.g. Samsung.com, Brand Store)',
    'Certified Refurbished (e.g. eBay Refurbished, Back Market)',
    'Authorized Retailers (e.g. Amazon, Best Buy)'
  ]);
  const [customVenues, setCustomVenues] = useState<string>('samsung.com, ebay.com');
  const [enforceAsDealbreaker, setEnforceAsDealbreaker] = useState<boolean>(false);
  const [showAcquisitionSettings, setShowAcquisitionSettings] = useState(true);
  const [stage2PromptMode, setStage2PromptMode] = useState<'initial' | 'followup'>('initial');

  // When switching stages, always start at the first tab (Tab 1: Prompt Generator)
  useEffect(() => {
    setActiveTab('prompt');
  }, [activeStage]);

  // Sync decision focus to userQueryInput when project changes
  useEffect(() => {
    if (project.files.stage1_framing) {
      try {
        const s1 = JSON.parse(project.files.stage1_framing);
        if (s1.decision_focus) {
          setUserQueryInput(s1.decision_focus);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [project.id]);

  const stageMeta = STAGE_META_INFO[activeStage];

  // Helper to determine active stage file key and current content
  const getStageFileKey = (stage: StageId): string => {
    switch (stage) {
      case 'stage1': return 'stage1_framing';
      case 'stage2': return 'stage2_claims';
      case 'stage3': return 'stage3_audit';
      case 'stage4': return 'stage4_directive_log';
      case 'stage5': return 'stage5_report';
      default: return 'stage1_framing';
    }
  };

  const currentFileKey = getStageFileKey(activeStage);
  const currentContent = project.files[currentFileKey as keyof typeof project.files] || '';

  // Get current prompt based on stage and project state
  const getPromptText = (): string => {
    if (activeStage === 'stage1') {
      let prompt = `${CALL1_SYSTEM_DIRECTIVE}\n\nUser Request: ${userQueryInput}`;
      const venues = [...selectedMarketplaces];
      if (customVenues.trim()) {
        venues.push(customVenues.trim());
      }
      prompt += `\n\n<sourcing_and_pricing_guidelines>
Target Acquisition Channel Scope: ${acquisitionChannel}
Preferred Marketplaces / Venues: ${venues.join(', ') || 'Any verified market source'}
Price Evaluation Basis: ${priceBasis}
Dealbreaker Enforcement: ${enforceAsDealbreaker ? 'STRICT_DEALBREAKER_DISQUALIFICATION' : 'DECOUPLED_EXPLORATORY_GUIDELINE (NO AUTOMATIC DEALBREAKER)'}

CRITICAL STAGE 1 FRAMING DIRECTIVES:
1. RESEARCH MODE: Verify and output \`research_mode\` as "DISCOVERY" unless the user query explicitly provided a fixed, closed list of specific model candidates to compare.
2. SOURCING DECOUPLING (AVOID UNINTENDED DEALBREAKER DISQUALIFICATION):
${enforceAsDealbreaker ?
`- The user explicitly requested strict channel disqualification: Add a hard dealbreaker in \`hard_dealbreaker_registry\` requiring candidates to be available through the specified channel.` :
`- Sourcing channels and venue preferences are exploratory search boundaries and claim-tagging guidelines, NOT automatic hard dealbreakers.
- DO NOT convert channel preferences into a hard dealbreaker (DB-01 or DB-02). Sourcing and channel preferences are exploratory search guidance and claim-tagging criteria, NOT automatic disqualifiers.
- For example: if the user allows refurbished items (e.g. "eBay refurbished excellent quality and above is fine"), ensure DB-01 DOES NOT disqualify refurbished or manufacturer direct units.
- Instead, evaluate price under weighted focus areas (e.g. "Value / Real-World Street Acquisition Cost") and record condition/channel assumptions under \`low_severity_assumptions\`.`}
3. REAL-TIME CLEARING PRICES:
- Direct Call 2 (Deep Research) to retrieve real-time actual street transaction and clearing prices (including live promo codes, active verified listings, and completed clearing rates) from ${venues.join(' / ') || 'live market platforms'}, rather than nominal MSRP alone.
</sourcing_and_pricing_guidelines>`;
      return prompt;
    }
    if (activeStage === 'stage2') {
      if (project.files.stage1_framing) {
        try {
          const s1 = JSON.parse(project.files.stage1_framing);
          if (stage2PromptMode === 'followup') {
            return generateCall2FollowupPrompt(s1);
          }
          return generateCall2Brief(s1);
        } catch (e) {
          return '// Invalid stage1_framing.json data. Fix Stage 1 output first.';
        }
      }
      return '// Stage 1 output missing. Run and populate Stage 1 to generate this dynamic Deep Research brief.';
    }
    if (activeStage === 'stage3') {
      return `${CALL3_SYSTEM_DIRECTIVE}\n\n[Attach stage1_framing.json and stage2_claims.json to this session]`;
    }
    if (activeStage === 'stage4') {
      return `${CALL4_SYSTEM_DIRECTIVE}\n\n[Attach stage1_framing.json and stage3_audit.json to this session]`;
    }
    if (activeStage === 'stage5') {
      return `${CALL5_SYSTEM_DIRECTIVE}\n\n[Attach stage4_directive_log.json ONLY to this session]`;
    }
    return '';
  };

  // Keep localInput in sync with active stage content
  useEffect(() => {
    setLocalInput(currentContent);
  }, [activeStage, currentContent]);

  // Run live stage validator
  const getDiagnostics = (): ValidationDiagnostic[] => {
    const textToValidate = localInput.trim() || currentContent.trim();
    if (!textToValidate) return [];
    try {
      if (activeStage === 'stage1') {
        const parsed = JSON.parse(textToValidate);
        return validateStage1Framing(parsed);
      }
      if (activeStage === 'stage2') {
        const s1 = project.files.stage1_framing ? JSON.parse(project.files.stage1_framing) : null;
        const parsed = JSON.parse(textToValidate);
        return validateStage2Claims(s1, parsed);
      }
      if (activeStage === 'stage3') {
        const s1 = project.files.stage1_framing ? JSON.parse(project.files.stage1_framing) : null;
        const s2 = project.files.stage2_claims ? JSON.parse(project.files.stage2_claims) : null;
        const parsed = JSON.parse(textToValidate);
        return validateStage3Audit(s1, s2, parsed);
      }
      if (activeStage === 'stage4') {
        const s1 = project.files.stage1_framing ? JSON.parse(project.files.stage1_framing) : null;
        const s3 = project.files.stage3_audit ? JSON.parse(project.files.stage3_audit) : null;
        const parsed = JSON.parse(textToValidate);
        return validateStage4Scoring(s1, s3, parsed);
      }
      if (activeStage === 'stage5') {
        const s4 = project.files.stage4_directive_log ? JSON.parse(project.files.stage4_directive_log) : null;
        return validateStage5Report(s4, textToValidate);
      }
    } catch (e: any) {
      return [{ type: 'FAIL', stage: activeStage, field: 'syntax', message: `Invalid syntax: ${e.message}` }];
    }
    return [];
  };

  const diagnostics = getDiagnostics();
  const passCount = diagnostics.filter(d => d.type === 'PASS').length;
  const warnCount = diagnostics.filter(d => d.type === 'WARN').length;
  const failCount = diagnostics.filter(d => d.type === 'FAIL').length;
  const isValid = failCount === 0 && diagnostics.length > 0;

  // Pre-flight sanity checks for Stage 1 (Claude's 4 checks)
  const stage1Advisories = useMemo(() => {
    if (activeStage !== 'stage1') return null;
    const textToTest = localInput.trim() || currentContent.trim();
    if (!textToTest) return null;
    try {
      const s1 = JSON.parse(textToTest);
      const advisories: { id: string; type: 'PASS' | 'WARN'; title: string; message: string; actionText?: string; onAction?: () => void }[] = [];

      // Check 1: Research mode (DISCOVERY vs COMPARISON)
      if (s1.research_mode === 'DISCOVERY') {
        advisories.push({
          id: 'MODE_DISCOVERY',
          type: 'PASS',
          title: 'Mode: DISCOVERY (Open Search)',
          message: 'Correctly configured for broad candidate discovery across market channels without artificial seed locks.'
        });
      } else if (s1.research_mode === 'COMPARISON') {
        const seeds = Array.isArray(s1.seed_candidates) ? s1.seed_candidates : [];
        advisories.push({
          id: 'MODE_COMPARISON',
          type: 'WARN',
          title: 'Mode: COMPARISON (Seed Lock)',
          message: `Stage 1 output specifies research_mode="COMPARISON" (${seeds.length} seed model(s)). If you did not intend to restrict the search to a closed list of phones, switch to DISCOVERY mode.`,
          actionText: 'Switch to DISCOVERY Mode',
          onAction: () => {
            const updated = { ...s1, research_mode: 'DISCOVERY', seed_candidates: [] };
            const formatted = JSON.stringify(updated, null, 2);
            setLocalInput(formatted);
            onUpdateFile('stage1_framing', formatted);
          }
        });
      }

      // Check 2: Dealbreaker DB-01 / DB-02 Sourcing Rigidity
      const dealbreakers = Array.isArray(s1.hard_dealbreaker_registry) ? s1.hard_dealbreaker_registry : [];
      const hasRigidVendorDb = dealbreakers.some((db: any) => {
        const desc = (db.description || '').toLowerCase();
        return (
          (desc.includes('retail new only') || desc.includes('amazon only') || desc.includes('brand new only')) &&
          (userQueryInput.toLowerCase().includes('refurb') || userQueryInput.toLowerCase().includes('direct') || userQueryInput.toLowerCase().includes('used'))
        );
      });

      if (hasRigidVendorDb) {
        advisories.push({
          id: 'RIGID_DEALBREAKER',
          type: 'WARN',
          title: 'DB Over-Disqualification Risk',
          message: 'A dealbreaker explicitly enforces strict brand-new retail or single-store limitations, which conflicts with query permissions for refurbished/direct models.',
          actionText: 'Widen DB Sourcing Scope',
          onAction: () => {
            const updatedDbs = dealbreakers.map((db: any) => {
              const desc = (db.description || '').toLowerCase();
              if (desc.includes('retail new only') || desc.includes('amazon only')) {
                return {
                  ...db,
                  description: 'Price must be within target budget across verified channels (Retail New, Certified Refurbished, or Manufacturer Direct)'
                };
              }
              return db;
            });
            const updated = { ...s1, hard_dealbreaker_registry: updatedDbs };
            const formatted = JSON.stringify(updated, null, 2);
            setLocalInput(formatted);
            onUpdateFile('stage1_framing', formatted);
          }
        });
      } else {
        advisories.push({
          id: 'SAFE_DEALBREAKER',
          type: 'PASS',
          title: 'Decoupled Dealbreaker Scope (DB-01)',
          message: 'Dealbreakers enforce hard ceilings without locking out valid channels (certified refurbished & direct are supported).'
        });
      }

      // Check 3: Focus area weights sum
      const weights = Array.isArray(s1.focus_area_weights) ? s1.focus_area_weights : [];
      const sum = weights.reduce((acc: number, w: any) => acc + (Number(w.weight) || 0), 0);
      if (Math.abs(sum - 1.0) < 0.005) {
        advisories.push({
          id: 'WEIGHTS_SUM_OK',
          type: 'PASS',
          title: 'Weights Sum: Exactly 1.00',
          message: `All ${weights.length} focus areas sum to exactly 1.00.`
        });
      } else {
        advisories.push({
          id: 'WEIGHTS_SUM_ERR',
          type: 'WARN',
          title: `Weights Sum Mismatch (${sum.toFixed(2)})`,
          message: `The weights must sum to exactly 1.00. Currently ${sum.toFixed(2)}.`,
          actionText: 'Normalize Weights to 1.00',
          onAction: () => {
            if (sum === 0) return;
            const normalizedWeights = weights.map((w: any) => ({
              ...w,
              weight: Math.round((Number(w.weight) / sum) * 100) / 100
            }));
            const updated = { ...s1, focus_area_weights: normalizedWeights };
            const formatted = JSON.stringify(updated, null, 2);
            setLocalInput(formatted);
            onUpdateFile('stage1_framing', formatted);
          }
        });
      }

      return advisories;
    } catch (e) {
      return null;
    }
  }, [activeStage, localInput, currentContent, userQueryInput]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getPromptText());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleApplyInput = () => {
    onUpdateFile(currentFileKey, localInput);
    setActiveTab('visualize');
  };

  return (
    <div className="space-y-6">
      {/* Stage Header Info Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                {activeStage}
              </span>
              <span className="font-mono text-xs text-neutral-400">Target File: <strong className="text-emerald-400">{stageMeta.targetFile}</strong></span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-100">{stageMeta.title}</h1>
            <p className="mt-1 text-xs text-neutral-400 max-w-2xl leading-relaxed">{stageMeta.description}</p>
          </div>

          <div className="flex items-center gap-3">
            {currentContent && (
              <button
                onClick={() => downloadTextFile(stageMeta.targetFile, currentContent, stageMeta.targetFile.endsWith('.md') ? 'text/markdown' : 'application/json')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white shadow-xs transition-all"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                Download {stageMeta.targetFile}
              </button>
            )}
          </div>
        </div>

        {/* Execution Metadata Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" /> Target Model
            </div>
            <div className="font-semibold text-neutral-200">{stageMeta.model}</div>
            <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{stageMeta.effort}</div>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> Est. Run Time
            </div>
            <div className="font-semibold text-neutral-200">{stageMeta.estTime}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Stateless Session</div>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
              <Wrench className="h-3.5 w-3.5 text-emerald-400" /> Tooling Required
            </div>
            <div className="font-semibold text-neutral-200">{stageMeta.tooling}</div>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
              <Paperclip className="h-3.5 w-3.5 text-indigo-400" /> Required Files
            </div>
            <div className="font-semibold text-neutral-200 truncate">{stageMeta.inputRequired}</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-6 flex items-center gap-2 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'prompt'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            1. Prompt Generator & Brief
          </button>
          <button
            onClick={() => {
              setLocalInput(currentContent);
              setActiveTab('input');
            }}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'input'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            2. Ingest Output & Live Validator
            {currentContent && (
              <span className={`ml-1.5 rounded-full px-2 py-0.2 text-[10px] ${
                isValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {isValid ? 'Valid' : `${failCount} Errors`}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('visualize')}
            disabled={!currentContent}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'visualize'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : !currentContent
                ? 'border-transparent text-neutral-600 cursor-not-allowed'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            3. Interactive Data Visualizer
          </button>
        </div>
      </div>

      {/* Tab 1: Prompt Generator */}
      {activeTab === 'prompt' && (
        <div className="space-y-4">
          {activeStage === 'stage1' && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
              {/* Quick Query Templates */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-neutral-400">Quick Query Templates:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUserQueryInput('Best Samsung Galaxy phone under $600 with top-tier camera and battery life. eBay refurbished (excellent quality and above), manufacturer direct (samsung.com), or new retail are all acceptable.');
                      setAcquisitionChannel('CERTIFIED_REFURBISHED');
                      setSelectedMarketplaces([
                        'Manufacturer Direct (e.g. Samsung.com, Brand Store)',
                        'Certified Refurbished (e.g. eBay Refurbished, Back Market)',
                        'Authorized Retailers (e.g. Amazon, Best Buy)'
                      ]);
                      setCustomVenues('samsung.com, ebay.com');
                      setPriceBasis('REAL_TIME_STREET_PRICE');
                      setEnforceAsDealbreaker(false);
                      if (onUpdateProjectName) {
                        onUpdateProjectName('Samsung Galaxy Phone (<$600, Refurbished / Direct / Retail)');
                      }
                      setQueryConfirmed(true);
                      setTimeout(() => setQueryConfirmed(false), 3000);
                    }}
                    className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-xs text-neutral-200 hover:border-indigo-500 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                  >
                    <Smartphone className="h-3 w-3 text-indigo-400" />
                    <span>Samsung Phone (&lt;$600, Refurb/Direct)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserQueryInput('Best portable power station under $700 with pure sine wave for overnight CPAP use');
                      setAcquisitionChannel('NEW_RETAIL');
                      setSelectedMarketplaces([
                        'Authorized Retailers (e.g. Amazon, Best Buy)',
                        'Specialized Retailers (e.g. B&H, Micro Center)'
                      ]);
                      setCustomVenues('');
                      setPriceBasis('REAL_TIME_STREET_PRICE');
                      setEnforceAsDealbreaker(false);
                      if (onUpdateProjectName) {
                        onUpdateProjectName('Portable Power Station for CPAP / Camping ($700 budget)');
                      }
                      setQueryConfirmed(true);
                      setTimeout(() => setQueryConfirmed(false), 3000);
                    }}
                    className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-xs text-neutral-200 hover:border-indigo-500 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span>CPAP Power Station ($700)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserQueryInput('Best wireless noise-canceling over-ear headphones under $350 for frequent flight travel and long calls');
                      setAcquisitionChannel('ANY_ALL_CHANNELS');
                      setSelectedMarketplaces([
                        'Manufacturer Direct (e.g. Samsung.com, Brand Store)',
                        'Authorized Retailers (e.g. Amazon, Best Buy)',
                        'Certified Refurbished (e.g. eBay Refurbished, Back Market)'
                      ]);
                      setCustomVenues('');
                      setPriceBasis('REAL_TIME_STREET_PRICE');
                      setEnforceAsDealbreaker(false);
                      if (onUpdateProjectName) {
                        onUpdateProjectName('Wireless Noise-Canceling Headphones (<$350)');
                      }
                      setQueryConfirmed(true);
                      setTimeout(() => setQueryConfirmed(false), 3000);
                    }}
                    className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-xs text-neutral-200 hover:border-indigo-500 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                  >
                    <Headphones className="h-3 w-3 text-emerald-400" />
                    <span>ANC Headphones (&lt;$350)</span>
                  </button>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Decision Focus &amp; User Query
                  </label>
                  {queryConfirmed && (
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 animate-pulse">
                      <CheckCircle2 className="h-3 w-3" />
                      Confirmed &amp; Directive Updated
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={userQueryInput}
                    onChange={(e) => {
                      setUserQueryInput(e.target.value);
                      setQueryConfirmed(false);
                      if (onUpdateProjectName && (project.name === 'Untitled Decision Research' || project.name.includes('CPAP') || project.name.includes('Samsung'))) {
                        const trimmed = e.target.value.trim();
                        if (trimmed) {
                          onUpdateProjectName(trimmed.length > 55 ? trimmed.slice(0, 52) + '...' : trimmed);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = userQueryInput.trim();
                        if (trimmed) {
                          if (onUpdateProjectName) {
                            onUpdateProjectName(trimmed.length > 55 ? trimmed.slice(0, 52) + '...' : trimmed);
                          }
                          setQueryConfirmed(true);
                          setTimeout(() => setQueryConfirmed(false), 3000);
                        }
                      }
                    }}
                    placeholder="e.g. Best noise canceling headphones under $300..."
                    className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = userQueryInput.trim();
                      if (trimmed) {
                        if (onUpdateProjectName) {
                          onUpdateProjectName(trimmed.length > 55 ? trimmed.slice(0, 52) + '...' : trimmed);
                        }
                        setQueryConfirmed(true);
                        setTimeout(() => setQueryConfirmed(false), 3000);
                      }
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                      queryConfirmed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {queryConfirmed ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirmed!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Confirm Query</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Type your real-world product or architectural choice, then click <strong>Confirm Query</strong> (or press Enter). The Stage 1 directive below will instantly update.
                </p>
              </div>

              {/* Acquisition Channel & Marketplace Pricing Settings */}
              <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/70 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-neutral-200">
                      Marketplace Sourcing & Price Intelligence
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                      Generic Channels &amp; Decoupled
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAcquisitionSettings(!showAcquisitionSettings)}
                    className="text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1"
                  >
                    {showAcquisitionSettings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {showAcquisitionSettings ? 'Collapse' : 'Configure'}
                  </button>
                </div>

                {showAcquisitionSettings && (
                  <div className="space-y-3.5 pt-2 border-t border-neutral-800/60 text-xs">
                    {/* Channel Mode */}
                    <div>
                      <div className="text-[11px] font-medium text-neutral-400 mb-1.5 flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-indigo-400" />
                        Target Acquisition Scope (Generic Categories):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {[
                          { id: 'ANY_ALL_CHANNELS', label: 'Any / All Channels', desc: 'New, refurbished, open secondary' },
                          { id: 'CERTIFIED_REFURBISHED', label: 'Certified Refurbished', desc: 'eBay Refurbished, Renewed, warranty' },
                          { id: 'NEW_RETAIL', label: 'Authorized New Retail', desc: 'Brand stores, major authorized retail' },
                          { id: 'MANUFACTURER_DIRECT', label: 'Manufacturer Direct', desc: 'Official brand webstore (e.g. Samsung.com)' },
                          { id: 'OPEN_MARKET_USED', label: 'Open Secondary Market', desc: 'Auctions, peer-to-peer pre-owned' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setAcquisitionChannel(item.id as any)}
                            className={`rounded-lg p-2.5 text-left border transition-all ${
                              acquisitionChannel === item.id
                                ? 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300'
                                : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            <div className="font-semibold text-xs text-neutral-200">{item.label}</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Sourcing Venues & Custom Outlets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                          Target Sourcing Venues &amp; Marketplaces:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'Manufacturer Direct (e.g. Samsung.com, Brand Store)',
                            'Certified Refurbished (e.g. eBay Refurbished, Back Market)',
                            'Authorized Retailers (e.g. Amazon, Best Buy)',
                            'Specialized Retailers (e.g. B&H, Micro Center)'
                          ].map((m) => {
                            const isChecked = selectedMarketplaces.includes(m);
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedMarketplaces(selectedMarketplaces.filter(x => x !== m));
                                  } else {
                                    setSelectedMarketplaces([...selectedMarketplaces, m]);
                                  }
                                }}
                                className={`rounded-md px-2.5 py-1 text-xs border transition-all ${
                                  isChecked
                                    ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300 font-medium'
                                    : 'border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700'
                                }`}
                              >
                                {isChecked ? '✓ ' : '+ '}{m}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-2.5">
                          <label className="block text-[10px] text-neutral-400 mb-1">
                            Specific Outlets / Domains to Check (optional):
                          </label>
                          <input
                            type="text"
                            value={customVenues}
                            onChange={(e) => setCustomVenues(e.target.value)}
                            placeholder="e.g. samsung.com, swappa.com, ebay.com"
                            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-400 mb-1.5 flex items-center gap-1.5">
                            <DollarSign className="h-3 w-3 text-amber-400" />
                            Price Evaluation Basis:
                          </label>
                          <select
                            value={priceBasis}
                            onChange={(e) => setPriceBasis(e.target.value as any)}
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-hidden"
                          >
                            <option value="REAL_TIME_STREET_PRICE">Real-Time Street Price (Live Listings, Current Promos)</option>
                            <option value="COMPLETED_AUCTION_PRICE">Completed / Sold Price (Real Historical Clearing Rates)</option>
                            <option value="MSRP">Nominal List MSRP Only</option>
                          </select>
                        </div>

                        {/* Dealbreaker Decoupling Control */}
                        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-200">
                              Dealbreaker Decoupling
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={enforceAsDealbreaker}
                                onChange={(e) => setEnforceAsDealbreaker(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 bg-neutral-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                          </div>
                          {!enforceAsDealbreaker ? (
                            <p className="text-[11px] text-emerald-400">
                              ✓ <strong>Decoupled (Safe):</strong> Channel preferences will guide Deep Research price queries without turning into a hard disqualifier in DB-01.
                            </p>
                          ) : (
                            <p className="text-[11px] text-amber-400">
                              ⚠️ <strong>Strict Disqualification:</strong> Stage 1 will forge a hard dealbreaker rejecting any candidate not sold via this exact channel.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-3">
            {activeStage === 'stage2' && (
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 flex flex-col sm:flex-row gap-1.5">
                <button
                  type="button"
                  onClick={() => setStage2PromptMode('initial')}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    stage2PromptMode === 'initial'
                      ? 'bg-neutral-800 text-neutral-100 shadow-xs border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-700 text-[10px]">1</span>
                  <span>Step 1: Deep Research Brief (Market Exploration)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage2PromptMode('followup')}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    stage2PromptMode === 'followup'
                      ? 'bg-indigo-900/60 text-indigo-200 shadow-xs border border-indigo-500/50'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">2</span>
                  <span>Step 2: Follow-Up JSON Extractor (Paste in Same Chat)</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                {activeStage === 'stage2'
                  ? stage2PromptMode === 'followup'
                    ? 'Step 2: Follow-Up stage2_claims.json Extractor Directive'
                    : 'Step 1: Gemini Deep Research Agent Brief'
                  : `Assembled Prompt Directive for ${stageMeta.model}`}
              </div>
              <button
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
              >
                {copiedPrompt ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedPrompt ? 'Copied to Clipboard!' : activeStage === 'stage2' && stage2PromptMode === 'followup' ? 'Copy Follow-Up Prompt' : 'Copy Directive + Prompt'}
              </button>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-300 max-h-96 overflow-y-auto whitespace-pre">
              {getPromptText()}
            </div>

            <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3.5 text-xs text-indigo-200 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                {activeStage === 'stage2' && stage2PromptMode === 'followup' ? (
                  <>
                    <strong>How to use Step 2:</strong> Paste this follow-up prompt into the <strong>SAME Gemini chat session</strong> right after the Deep Research report finishes. Because Deep Research has already gathered all specs, benchmark data, and URLs, standard Gemini will immediately extract and serialize the clean <code className="text-indigo-300">stage2_claims.json</code> without truncation or schema refusal.
                  </>
                ) : (
                  <>
                    <strong>Next Step:</strong> Open a fresh chat session in <strong>{stageMeta.model}</strong>. Paste the text above {stageMeta.inputRequired !== 'User Raw Request' ? `and attach ${stageMeta.inputRequired}` : ''}. When complete, copy the JSON back into Tab 2 (Ingest Output).
                    {activeStage === 'stage2' && (
                      <p className="mt-1 text-[11px] text-emerald-300">
                        💡 <strong>2-Step Pipeline Strategy:</strong> Let Deep Research do what it does best (autonomous web research &amp; narrative reporting in Step 1). Once finished, switch to <strong>Step 2: Follow-Up JSON Extractor</strong> and paste it in the same chat to get your machine-readable JSON!
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Output Ingest & Live Validator */}
      {activeTab === 'input' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">Paste {stageMeta.targetFile} Output</h3>
                <p className="text-xs text-neutral-400">Paste the raw response from {stageMeta.model}. The system will instantly validate formatting, math, and schema.</p>
              </div>
              <button
                onClick={handleApplyInput}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Save & Inspect Visuals
              </button>
            </div>

            <textarea
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder={`Paste the raw JSON or Markdown output for ${stageMeta.targetFile} here...`}
              rows={14}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:border-indigo-500 focus:outline-hidden"
            />

            {/* Pre-Flight Quality & Scope Audit for Stage 1 */}
            {stage1Advisories && stage1Advisories.length > 0 && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                    <ShieldAlert className="h-4 w-4 text-indigo-400" />
                    Stage 1 Pre-Flight Quality &amp; Scope Audit
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Deep Research Safeguards
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {stage1Advisories.map((adv) => (
                    <div
                      key={adv.id}
                      className={`rounded-lg p-3 border text-xs flex flex-col justify-between ${
                        adv.type === 'PASS'
                          ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300'
                          : 'border-amber-500/30 bg-amber-950/25 text-amber-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-100 mb-1">
                          {adv.type === 'PASS' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          )}
                          <span>{adv.title}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-neutral-300 opacity-90">
                          {adv.message}
                        </p>
                      </div>
                      {adv.actionText && adv.onAction && (
                        <button
                          type="button"
                          onClick={adv.onAction}
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 transition-colors w-fit"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {adv.actionText}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Validation Diagnostics Box */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  Live Stage Gate Schema & Math Validation
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {passCount} Passed
                  </span>
                  {warnCount > 0 && (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                      {warnCount} Warnings
                    </span>
                  )}
                  {failCount > 0 && (
                    <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                      {failCount} Errors
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto text-xs">
                {diagnostics.length === 0 ? (
                  <div className="text-neutral-500 italic py-2">Paste content above to run live validation checks.</div>
                ) : (
                  diagnostics.map((d, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 rounded-lg p-2 ${
                        d.type === 'PASS' ? 'bg-emerald-950/20 text-emerald-300' :
                        d.type === 'WARN' ? 'bg-amber-950/20 text-amber-300' :
                        'bg-red-950/20 text-red-300'
                      }`}
                    >
                      {d.type === 'PASS' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : d.type === 'WARN' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-mono font-bold text-[10px] uppercase opacity-75 mr-1.5">[{d.field}]</span>
                        {d.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Data Visualizer */}
      {activeTab === 'visualize' && (
        <div>
          {(() => {
            if (!currentContent.trim()) {
              return (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8 text-center text-xs text-neutral-400">
                  No data loaded yet for {activeStage}. Paste output in Tab 2 or load a sample project.
                </div>
              );
            }

            try {
              if (activeStage === 'stage1') {
                const parsed = JSON.parse(currentContent);
                return <Stage1Visualizer data={parsed} />;
              }
              if (activeStage === 'stage2') {
                const parsed = JSON.parse(currentContent);
                return <Stage2Visualizer data={parsed} />;
              }
              if (activeStage === 'stage3') {
                const parsed = JSON.parse(currentContent);
                return <Stage3Visualizer data={parsed} />;
              }
              if (activeStage === 'stage4') {
                const parsed = JSON.parse(currentContent);
                return <Stage4Visualizer data={parsed} />;
              }
              if (activeStage === 'stage5') {
                return <Stage5Visualizer reportText={currentContent} />;
              }
            } catch (e: any) {
              return (
                <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-6 text-xs text-red-300">
                  JSON Syntax Error: {e.message}. Switch to Tab 2 to repair formatting.
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};
