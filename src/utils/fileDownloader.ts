import JSZip from 'jszip';
import { PYTHON_STAGE_GATE_VALIDATOR } from '../data/validatorScript';
import {
  CALL1_SYSTEM_DIRECTIVE,
  CALL3_SYSTEM_DIRECTIVE,
  CALL4_SYSTEM_DIRECTIVE,
  CALL5_SYSTEM_DIRECTIVE
} from '../data/pipelineDirectives';

export function downloadTextFile(filename: string, content: string, mimeType: string = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadProjectZip(projectName: string, files: Record<string, string>) {
  const zip = new JSZip();

  // Add all pipeline stage JSON and markdown files
  if (files.stage1_framing) zip.file('stage1_framing.json', files.stage1_framing);
  if (files.stage2_claims) zip.file('stage2_claims.json', files.stage2_claims);
  if (files.stage2_narrative) zip.file('stage2_narrative.md', files.stage2_narrative);
  if (files.stage3_audit) zip.file('stage3_audit.json', files.stage3_audit);
  if (files.stage4a_scores) zip.file('stage4a_scores.json', files.stage4a_scores);
  if (files.stage4_directive_log) zip.file('stage4_directive_log.json', files.stage4_directive_log);
  if (files.stage5_report) zip.file('stage5_report.md', files.stage5_report);

  // Add standard Python Validator script
  zip.file('v36_stage_gate_validator.py', PYTHON_STAGE_GATE_VALIDATOR);

  // Add complete prompt bundle markdown
  const promptBundle = `# v36.0-ADAPTIVE-GATED-HYBRID-ENTERPRISE Prompt Bundle\n\n## Stage 1 Framing\n\`\`\`\n${CALL1_SYSTEM_DIRECTIVE}\n\`\`\`\n\n## Stage 3 Audit\n\`\`\`\n${CALL3_SYSTEM_DIRECTIVE}\n\`\`\`\n\n## Stage 4 Scoring\n\`\`\`\n${CALL4_SYSTEM_DIRECTIVE}\n\`\`\`\n\n## Stage 5 Synthesis\n\`\`\`\n${CALL5_SYSTEM_DIRECTIVE}\n\`\`\`\n`;
  zip.file('v36_production_prompt_bundle.md', promptBundle);

  // Generate README
  const readme = `# v36 Research Pipeline Workspace
Project: ${projectName}
Generated on: ${new Date().toISOString()}

## File Inventory:
- stage1_framing.json (Stage 1 Framing & Brief)
- stage2_claims.json (Stage 2 Deep Research Evidence Grid)
- stage3_audit.json (Stage 3 Verification & Laundering Audit)
- stage4_directive_log.json (Stage 4 MCDA Scoring & Red Team)
- stage5_report.md (Stage 5 Decision-Ready Executive Report)
- v36_stage_gate_validator.py (Python Stage-Gate Schema Validator)
- v36_production_prompt_bundle.md (Full Directive Pasteable Prompts)

## Running the Automated Python Validator:
\`\`\`bash
python3 v36_stage_gate_validator.py all stage1_framing.json stage2_claims.json stage3_audit.json stage4_directive_log.json stage5_report.md
\`\`\`
`;
  zip.file('README.md', readme);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (projectName || 'v36_pipeline_project').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  a.download = `${safeName}_v36_bundle.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
