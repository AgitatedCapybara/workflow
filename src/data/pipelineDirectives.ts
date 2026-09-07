import { StageMeta } from '../types';
import { CALL1_SYSTEM_DIRECTIVE } from './directives/call1';
import { CALL2_RAW_TEMPLATE, generateCall2Brief, generateCall2FollowupPrompt } from './directives/call2';
import { CALL3_SYSTEM_DIRECTIVE } from './directives/call3';
import { CALL4_SYSTEM_DIRECTIVE } from './directives/call4';
import { CALL5_SYSTEM_DIRECTIVE } from './directives/call5';

export {
  CALL1_SYSTEM_DIRECTIVE,
  CALL2_RAW_TEMPLATE,
  generateCall2Brief,
  generateCall2FollowupPrompt,
  CALL3_SYSTEM_DIRECTIVE,
  CALL4_SYSTEM_DIRECTIVE,
  CALL5_SYSTEM_DIRECTIVE
};

export const STAGE_META_INFO: Record<string, StageMeta> = {
  stage1: {
    stageId: 'stage1',
    title: 'Framing, Risk Classification & Gate',
    model: 'Gemini 3.6 Flash',
    effort: 'default',
    targetFile: 'stage1_framing.json',
    inputRequired: 'User Raw Request',
    tooling: 'None (Pure Reasoning)',
    estTime: '< 15 seconds',
    description: 'Converts unstructured user request into a locked decision brief with risk classification, focus weights, and dealbreaker boundaries.'
  },
  stage2: {
    stageId: 'stage2',
    title: 'Evidence Gathering & Market Survey',
    model: 'Gemini Deep Research',
    effort: 'deep_research_mode',
    targetFile: 'stage2_claims.json',
    inputRequired: 'stage1_framing.json (as prompt brief)',
    tooling: 'Deep Research Agent + Search Engine',
    estTime: '5 - 15 minutes',
    description: 'Conducts open-market retrieval, runs category-first queries, applies the 5-source category taxonomy, and compiles a comprehensive candidate-by-criteria evidence grid.'
  },
  stage3: {
    stageId: 'stage3',
    title: '3-Axis Verification & Laundering Audit',
    model: 'Claude Sonnet 5',
    effort: 'effort: high (thinking budget: high)',
    targetFile: 'stage3_audit.json',
    inputRequired: 'stage1_framing.json + stage2_claims.json',
    tooling: 'Live Web Search Tool',
    estTime: '2 - 4 minutes',
    description: 'Audits every claim across 3 independent axes: Grounding verification, Evidence laundering detection (Flags A–G), and Runtime arithmetic consistency.'
  },
  stage4: {
    stageId: 'stage4',
    title: 'MCDA Scoring & Stress-Test Analysis',
    model: 'Claude Sonnet 5',
    effort: 'effort: max (thinking budget: max)',
    targetFile: 'stage4_directive_log.json',
    inputRequired: 'stage1_framing.json + stage3_audit.json',
    tooling: 'Pure Complex Reasoning',
    estTime: '2 - 4 minutes',
    description: 'Applies dealbreaker gates, computes confidence-weighted MCDA scores, runs multi-path consistency tests, and generates steelman and stress-test critiques.'
  },
  stage5: {
    stageId: 'stage5',
    title: 'Executive Synthesis Report',
    model: 'Gemini 3.6 Flash',
    effort: 'default',
    targetFile: 'stage5_report.md',
    inputRequired: 'stage4_directive_log.json ONLY',
    tooling: 'Context-Isolated Synthesis',
    estTime: '< 30 seconds',
    description: 'Synthesizes locked scores and stress-test disclosures into an executive-ready decision report in markdown.'
  }
};
