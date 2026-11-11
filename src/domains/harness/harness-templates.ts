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
      : `- Build: Refer to \`package.json\` scripts.\n- Tests & Typecheck: Refer to repository configuration.`;

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
- Follow strict atomic file rule: at most 1 function, method, action, route handler, component, hook, schema, or type per file (<200 lines).
- 1 DB Call per Action & Pipeline Chaining: Every database query or mutation lives in an isolated atomic Action (max 1 DB query per Action). Monolithic use-case actions are forbidden; routes chain actions using \`Pipeline.send(context).through([...actions])\`.
- Type Isolation: Never declare data interfaces inline. Only a UI component's own \`Props\` interface can be inline in its \`.tsx\` file; all other domain/data types live in \`@/types/{domain}/{name}.type.ts\`.
- Domain within Technical Layers: Organize code by \`{domain}\` subfolders inside each technical layer (\`src/actions/{domain}/\`, \`src/routes/{domain}/\`, \`src/dtos/{domain}/\`, \`src/types/{domain}/\`, \`src/errors/{domain}/\`). Never create root \`src/domains/\` or \`src/controllers/\` folders.
- Direct imports with path aliases; zero barrel files; explicit domain boundaries.
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

## Scope & Strict Boundaries
- **In scope**: Inspect project manifests, entry points, and directory conventions; ask step-by-step interactive alignment questions; document project architecture and decisions inside \`.grooveskills/memory/context.md\` and \`.grooveskills/memory/decisions.md\`; and verify script execution.
- **Out of scope (STRICT BOUNDARY)**: Do NOT create, modify, scaffold, or implement any application code, business logic, UI components, routes, schemas, or project features. During this task, you may ONLY edit files inside \`.grooveskills/\` (\`context.md\`, \`decisions.md\`, \`tasks/00-onboarding.md\`, and \`bitacora/\`).
- **Completion Stop Rule**: This task's sole purpose is completing project onboarding. Once the user answers your alignment questions and \`.grooveskills/memory/\` is updated, set \`status: completed\`, present a concise summary of the documented context, and **STOP**. Wait for the user to request their first feature or task in a new prompt.

## Checklist
- [ ] Verify package manager and essential scripts (\`build\`, \`test\`, \`typecheck\`).
- [ ] Map high-level module architecture and data flow in \`.grooveskills/memory/context.md\`.
- [ ] Ask the user step-by-step interactive questions to clarify goals, domain scope, and architectural conventions.
- [ ] Document agreed technical decisions in \`.grooveskills/memory/decisions.md\`.
- [ ] Verify test runner or static checks pass cleanly.
- [ ] Switch status to \`completed\` once project context is fully documented, then STOP and wait for the user's next instruction.

## Evidence
- Observed command runs and outputs during the initial onboarding pass.
- User answers to alignment questions captured in \`.grooveskills/memory/\`.

## Next
- Stop immediately after marking onboarding as \`completed\` and wait for the user to request a specific feature or task. Never start implementing project features as part of onboarding.
`;
}

export function buildTaskTemplate(): string {
  return `---
status: in-progress
createdAt: \${CURRENT_DATE}
---

# Feature / Task Title

## Outcome Hypothesis
By [Output / Technical Change], [Outcome / Verifiable Behavior] will occur, proven by [Evidence / Test / Build Command].

## Scope
- In scope:
- Out of scope:

## Checklist
- [ ] Task 1: (Define expected observed proof)
- [ ] Task 2: (Define expected observed proof)
- [ ] Post-Task Security Gate: If trust boundaries or agent rules were modified, verify defenses and integrity.

## Evidence
- Observed test/typecheck/build commands, runtime outputs, or security gate receipts.

## Next
- Next concrete step if interrupted.
`;
}
