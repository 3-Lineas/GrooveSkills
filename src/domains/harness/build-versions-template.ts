export function buildVersionsTemplate(): string {
  return `# GrooveSkills Version History & Recent Release Notes

This document provides a concise, structured changelog of recent GrooveSkills releases so developers and AI agents can review architectural changes, newly enforced rules, and available capabilities.

---

## [v1.19.0]
- **Canonical Versions File & Dynamic Update Prompt**: Introduced \`.grooveskills/VERSIONS.md\` and dynamic, unambiguous copy-and-paste update prompt instructing AI agents to review recent changes and propose an alignment plan before modifying code.
- **Automated Update Notification**: Integrated update prompt emission into \`grooveskills update\`, direct options, and interactive CLI wizards when updating projects with an existing harness.

---

## [v1.18.1]
- **Strict Onboarding Scope & Stop Rule**: Added strict boundary in \`00-onboarding.md\` forbidding application code changes during onboarding, and mandating that the agent stop immediately once onboarding context is verified.
- **Clean Copyable Onboarding Prompt**: Redesigned onboarding prompt terminal display with a top cyan badge and raw copyable plain text without side border artifacts.

---

## [v1.18.0]
- **Semantic Version Traceability**: Persisted semantic version (e.g. \`"1.18.0"\`) in \`.grooveskills/config.json\` instead of static integer, updating it on every install or update run.
- **Project Status Command**: Added \`grooveskills status [path] [--json]\` for inspecting installation status, active agents, installed skills, and version drift.
- **Daily Bitacora Compaction Rule**: Enforced strict limit of at most 10 list items per day in \`.grooveskills/bitacora/YYYY-MM.md\` with mandatory bullet merging/compaction when exceeding.

---

## [v1.17.0]
- **Next.js & Vinext Architecture Skill**: Added canonical \`nextjs-architecture\` skill enforcing 100% Server Pages, server-side data loading via Server Actions, client components restricted to interactive logic, \`loading.tsx\` skeletons, URL state, and GroovePack pipeline.
- **Interactive Full Skill Uninstallation**: Added automatic preselection of installed skills in CLI wizard and clean removal of deselected skills across all agent references, canonical store, and config.

---

## [v1.16.0]
- **1 DB Query/Mutation per Action**: Enforced non-negotiable architectural rule where each database operation must live in an isolated atomic Action (max 1 DB call per action).
- **Mandatory Pipeline Chaining**: Prohibited monolithic use-case actions; multi-step flows and routes must sequence atomic actions via \`Pipeline.send(context).through([...actions])\`.

---

## [v1.15.0]
- **Strict Atomicity Standard**: Enforced 1 method/function per file (<200 lines) and strict type isolation in \`@/types/{domain}/{name}.type.ts\`.
- **Domain within Technical Layers**: Banned monolithic root \`src/domains/\` or \`src/controllers/\` folders in favor of domain subfolders within technical layers (\`src/actions/{domain}/\`, \`src/routes/{domain}/\`).
- **Hono Direct Domain Routes**: Standardized route endpoints delegating directly to atomic Actions or through Pipelines.

---

## [v1.14.0]
- **Standalone Zero-Footprint Security Audit**: Introduced \`npx @3lineas/grooveskills audit [path]\` (alias: \`security-audit\`) running 5 coverage units combining OWASP API Top 10 and NVIDIA SkillSpector rules without writing files to disk.
- **Auditing Artifact Export**: Added optional \`--output <dir>\` flag to export SARIF, Markdown, and actionable remediation prompts.

---

## [v1.13.0]
- **Relative Symlinks for Agent Skills**: Converted copied skill directories in \`.agents/skills/\`, \`.claude/skills/\`, and \`.gemini/skills/\` to relative symbolic links (\`../../.grooveskills/skills/<skill>\`), enabling IDE discovery while leaving folders open for custom user skills.
- **Automatic Legacy Migration**: Automatically migrated legacy skill directories to symbolic links with full transactional rollback safety.
`;
}
