import type { ProjectLanguage } from "@/types/harness.types";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
import type { ProjectOnboardingProfile } from "@/domains/harness/scan-project-onboarding";

export function buildContextTemplate(
  detectedDependencies: string[],
  language: ProjectLanguage = "es",
  profile?: ProjectOnboardingProfile
): string {
  const depsFormatted = detectedDependencies.length > 0
    ? detectedDependencies.map((d) => `- \`${d}\``).join("\n")
    : "- (No external dependencies detected)";

  const langConfig = SUPPORTED_LANGUAGES[language];
  const projectName = profile?.projectName ?? "Project";
  const pkgManager = profile?.packageManager ?? "npm";

  const commandLines: string[] = [];
  if (profile?.commands) {
    for (const [key, cmd] of Object.entries(profile.commands)) {
      commandLines.push(`- **${key}**: \`${cmd}\``);
    }
  }
  const commandsSection = commandLines.length > 0
    ? commandLines.join("\n")
    : `- Build: Refer to \`package.json\` scripts.\n- Typecheck: Refer to TypeScript configuration.\n- Tests: Refer to test runner configuration.`;

  const aliasLines: string[] = [];
  if (profile?.pathAliases) {
    for (const [alias, target] of Object.entries(profile.pathAliases)) {
      aliasLines.push(`- \`${alias}\` -> \`${target}\``);
    }
  }
  const aliasesSection = aliasLines.length > 0
    ? `\n### Path Aliases\n${aliasLines.join("\n")}\n`
    : "";

  const dirLines: string[] = [];
  if (profile?.sourceDirectories && profile.sourceDirectories.length > 0) {
    for (const dir of profile.sourceDirectories) {
      dirLines.push(`- \`${dir}/\``);
    }
  }
  const dirsSection = dirLines.length > 0
    ? `\n### Source Modules\n${dirLines.join("\n")}\n`
    : "";

  return `# Project Context & Architecture: ${projectName}

This file provides AI agents with instant architectural orientation for this project.

## 1. Stack & Dependencies
- **Package Manager**: \`${pkgManager}\`
${depsFormatted}

## 2. Directory Structure Conventions
- Follow single-responsibility per file (<200 lines).
- Maintain direct imports with path aliases; avoid barrel files.
- Keep domain boundaries explicit and clean.
${aliasesSection}${dirsSection}
## 3. Communication & User Copy Language
- **Configured Language**: ${langConfig.nativeName} (\`${language}\`).
- **Policy**: ${langConfig.instruction}

## 4. Essential Commands
${commandsSection}
`;
}

export function buildDecisionsTemplate(language: ProjectLanguage = "es"): string {
  const now = new Date().toISOString().split("T")[0];
  const langConfig = SUPPORTED_LANGUAGES[language];

  return `# Architecture Decision Records (ADR)

An append-only log of significant technical and architectural choices.

| Date | Title | Decision | Reason & Consequences |
| :--- | :--- | :--- | :--- |
| ${now} | Adopt GrooveSkills Harness | Initialized \`.grooveskills/\` control plane with ODD | Clean, encapsulated agent memory, 3-lane ODD flow, and ${langConfig.nativeName} copy standard |
`;
}

export function buildOnboardingTaskTemplate(projectName: string = "Project"): string {
  const now = new Date().toISOString().split("T")[0];

  return `---
status: pending
createdAt: ${now}
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
  const langConfig = SUPPORTED_LANGUAGES[language];

  return `<!-- grooveskills:harness:start -->
# GrooveSkills Harness — Agent Rules & Memory

This project uses the **GrooveSkills Harness** located in \`.grooveskills/\`.

## 1. Three-Lane ODD Protocol
- **Onboarding Check**: If \`.grooveskills/memory/tasks/00-onboarding.md\` has \`status: pending\`, complete its checklist to enrich \`context.md\` and set its status to \`completed\`.
- **Authorize & Explore**: Follow the 7-step ODD protocol (Authorize, Explore, Resolve, Classify, Track & Hypothesize, Execute, Verify).
- **Lane 1 (Answer)**: Explanations, audits, or questions. Read-only; write zero code.
- **Lane 2 (Task)**: Direct implementation. Declare Outcome Hypothesis and checklist in \`.grooveskills/memory/tasks/<slug>.md\`. Only check off tasks with observed evidence under \`Evidence\`.
- **Lane 3 (Spec)**: Ambiguous or high-impact architecture. Clarify and validate the spec in \`.grooveskills/memory/tasks/<slug>.md\` before writing code.

## 2. User Communication Language (${langConfig.nativeName})
- **Language**: \`${language}\` (${langConfig.nativeName}).
- **Requirement**: ${langConfig.instruction}

## 3. Memory Locations
- Architecture context: \`.grooveskills/memory/context.md\`
- Technical decisions (ADR): \`.grooveskills/memory/decisions.md\`
- Active tasks & evidence: \`.grooveskills/memory/tasks/\`
<!-- grooveskills:harness:end -->`;
}
