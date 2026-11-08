import type { ProjectLanguage } from "@/types/harness.types";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
import type { ProjectOnboardingProfile } from "@/domains/harness/scan-project-onboarding";

export function buildContextTemplate(
  detectedDependencies: string[],
  language: ProjectLanguage = "es",
  profile?: ProjectOnboardingProfile
): string {
  const dependenciesFormatted =
    detectedDependencies.length > 0
      ? detectedDependencies.map((dependencyName) => `- \`${dependencyName}\``).join("\n")
      : "- (No external dependencies detected)";

  const languageConfig = SUPPORTED_LANGUAGES[language];
  const projectName = profile?.projectName ?? "Project";
  const packageManager = profile?.packageManager ?? "npm";

  const commandLines: string[] = [];
  if (profile?.commands) {
    for (const [commandKey, commandValue] of Object.entries(profile.commands)) {
      commandLines.push(`- **${commandKey}**: \`${commandValue}\``);
    }
  }
  const commandsSection =
    commandLines.length > 0
      ? commandLines.join("\n")
      : `- Build: Refer to \`package.json\` scripts.\n- Typecheck: Refer to TypeScript configuration.\n- Tests: Refer to test runner configuration.`;

  const aliasLines: string[] = [];
  if (profile?.pathAliases) {
    for (const [aliasPattern, aliasTarget] of Object.entries(profile.pathAliases)) {
      aliasLines.push(`- \`${aliasPattern}\` -> \`${aliasTarget}\``);
    }
  }
  const aliasesSection =
    aliasLines.length > 0 ? `\n### Path Aliases\n${aliasLines.join("\n")}\n` : "";

  const directoryLines: string[] = [];
  if (profile?.sourceDirectories && profile.sourceDirectories.length > 0) {
    for (const directoryName of profile.sourceDirectories) {
      directoryLines.push(`- \`${directoryName}/\``);
    }
  }
  const directoriesSection =
    directoryLines.length > 0 ? `\n### Source Modules\n${directoryLines.join("\n")}\n` : "";

  return `# Project Context & Architecture: ${projectName}

This file provides AI agents with instant architectural orientation for this project.

## 1. Stack & Dependencies
- **Package Manager**: \`${packageManager}\`
${dependenciesFormatted}

## 2. Directory Structure Conventions
- Follow single-responsibility per file (<200 lines).
- Maintain direct imports with path aliases; avoid barrel files.
- Keep domain boundaries explicit and clean.
${aliasesSection}${directoriesSection}
## 3. Communication & User Copy Language
- **Configured Language**: ${languageConfig.nativeName} (\`${language}\`).
- **Policy**: ${languageConfig.instruction}

## 4. Essential Commands
${commandsSection}
`;
}

export function buildDecisionsTemplate(language: ProjectLanguage = "es"): string {
  const currentDate = new Date().toISOString().split("T")[0];
  const languageConfig = SUPPORTED_LANGUAGES[language];

  return `# Architecture Decision Records (ADR)

An append-only log of significant technical and architectural choices.

| Date | Title | Decision | Reason & Consequences |
| :--- | :--- | :--- | :--- |
| ${currentDate} | Adopt GrooveSkills Harness | Initialized \`.grooveskills/\` control plane with ODD | Clean, encapsulated agent memory, 3-lane ODD flow, and ${languageConfig.nativeName} copy standard |
`;
}

export function buildOnboardingTaskTemplate(projectName: string = "Project"): string {
  const currentDate = new Date().toISOString().split("T")[0];

  return `---
status: pending
createdAt: ${currentDate}
---

# 00 — Initial Project Onboarding & Architecture Exploration: ${projectName}

## Outcome Hypothesis
By scanning dependencies, entry points, configuration manifests, and module layout, the AI agent will gain a verified architectural understanding of \`${projectName}\`, proven by filling out \`.grooveskills/memory/context.md\`, formulating interactive alignment questions with the user, and validating the essential build/typecheck commands.

## Scope
- In scope: Inspect project manifests, entry points, directory conventions, ask interactive alignment questions, and verify script execution.
- Out of scope: Refactoring business logic or modifying functional code before alignment.

## Checklist
- [ ] Verify package manager and essential scripts (\`build\`, \`test\`, \`typecheck\`).
- [ ] Map high-level module architecture and data flow in \`.grooveskills/memory/context.md\`.
- [ ] Ask the user step-by-step interactive questions to clarify goals, domain scope, and adapt project conventions.
- [ ] Document agreed technical decisions in \`.grooveskills/memory/decisions.md\`.
- [ ] Verify test runner or static checks pass cleanly.
- [ ] Switch status to \`completed\` once project context is fully verified.

## Evidence
- Observed command runs and outputs during the initial onboarding pass.
- User answers to alignment questions captured in memory.

## Next
- Once onboarding is marked completed, proceed with domain tasks following the 3-lane ODD protocol.
`;
}

export function buildTaskTemplate(): string {
  return `---
status: in-progress
createdAt: \${CURRENT_DATE}
---

# Feature / Task Title

## Outcome Hypothesis
Describe the expected behavioral outcome:
By [Output / Technical Change], [Outcome / Verifiable Behavior] will occur, proven by [Evidence / Test / Build Command].

## Scope
- In scope:
- Out of scope:

## Checklist
- [ ] Task 1: (Define expected observed proof)
- [ ] Task 2: (Define expected observed proof)

## Evidence
- Observed test/typecheck/build commands or runtime outputs proving completion.

## Next
- Next concrete step if interrupted.
`;
}

export function buildAgentHarnessBlock(language: ProjectLanguage = "es"): string {
  const languageConfig = SUPPORTED_LANGUAGES[language];

  return `<!-- grooveskills:harness:start -->
# GrooveSkills Harness — Agent Rules & Memory

This project uses the **GrooveSkills Harness** located in \`.grooveskills/\`.

## 1. Mandatory .grooveskills-First Read (Zero Project Re-Scanning)
- **First Step**: On EVERY turn or prompt, the agent MUST immediately read \`.grooveskills/\` FIRST:
  1. \`.grooveskills/memory/context.md\` (project architecture, conventions, and scripts).
  2. \`.grooveskills/memory/decisions.md\` (agreed architectural decisions & ADRs).
  3. Active tasks in \`.grooveskills/memory/tasks/\`.
- **Zero Full-Project Re-Scanning**: DO NOT re-scan the entire codebase, file tree, or directory structure on every interaction. The architecture and conventions are already indexed in \`.grooveskills/\`. Read only the specific target files needed for the active task.

## 2. Three-Lane ODD Protocol
- **Onboarding Check**: If \`.grooveskills/memory/tasks/00-onboarding.md\` has \`status: pending\`, complete its checklist to enrich \`context.md\` and set its status to \`completed\`.
- **Authorize & Explore**: Follow the 7-step ODD protocol (Authorize, Explore, Resolve, Classify, Track & Hypothesize, Execute, Verify).
- **Lane 1 (Answer)**: Explanations, audits, or questions. Read-only; write zero code.
- **Lane 2 (Task)**: Direct implementation. Declare Outcome Hypothesis and checklist in \`.grooveskills/memory/tasks/<slug>.md\`. Only check off tasks with observed evidence under \`Evidence\`.
- **Lane 3 (Spec)**: Ambiguous or high-impact architecture. Clarify and validate the spec in \`.grooveskills/memory/tasks/<slug>.md\` before writing code.

## 3. Daily Bitacora (\`.grooveskills/bitacora/YYYY-MM.md\`)
- **Purpose**: Maintain a daily summary of what was done so the developer can update external trackers (Jira, Trello, ClickUp, Linear).
- **Format**: Strictly format \`YYYY-MM-DD\` with concise bullet points (\`- ...\`), NO tables.
\`\`\`markdown
YYYY-MM-DD
- Se agrego tal funcionalidad...
- Se corrigio tal problema...
\`\`\`
- **Storage**: One file per month located at \`.grooveskills/bitacora/YYYY-MM.md\` (e.g. \`.grooveskills/bitacora/2026-11.md\`).
- **Order**: Reverse chronological (most recent day at the top of the file).
- **Update Frequency**: Update on every agent interaction that delivers progress (code changes, fixes, specs, or audits).
- **Rewrite Rule**: Rewrite and compress the day's bullets if they get too long; do NOT link or reference internal task files.

## 4. User Communication Language (${languageConfig.nativeName})
- **Language**: \`${language}\` (${languageConfig.nativeName}).
- **Requirement**: ${languageConfig.instruction}

## 5. Memory Locations
- Architecture context: \`.grooveskills/memory/context.md\`
- Technical decisions (ADR): \`.grooveskills/memory/decisions.md\`
- Active tasks & evidence: \`.grooveskills/memory/tasks/\`
- Daily bitacora: \`.grooveskills/bitacora/\`
<!-- grooveskills:harness:end -->`;
}

