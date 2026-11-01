export function buildContextTemplate(detectedDependencies: string[]): string {
  const depsFormatted = detectedDependencies.length > 0
    ? detectedDependencies.map((d) => `- \`${d}\``).join("\n")
    : "- (No external dependencies detected)";

  return `# Project Context & Architecture

This file provides AI agents with instant architectural orientation for this project.

## 1. Stack & Dependencies
${depsFormatted}

## 2. Directory Structure Conventions
- Follow single-responsibility per file (<200 lines).
- Maintain direct imports with path aliases; avoid barrel files.
- Keep domain boundaries explicit and clean.

## 3. Essential Commands
- Build: Refer to \`package.json\` scripts.
- Typecheck: Refer to TypeScript configuration.
- Tests: Refer to test runner configuration.
`;
}

export function buildDecisionsTemplate(): string {
  const now = new Date().toISOString().split("T")[0];
  return `# Architecture Decision Records (ADR)

An append-only log of significant technical and architectural choices.

| Date | Title | Decision | Reason & Consequences |
| :--- | :--- | :--- | :--- |
| ${now} | Adopt GrooveSkills Harness | Initialized \`.grooveskills/\` control plane | Clean, encapsulated agent memory and 3-lane execution flow |
`;
}

export function buildTaskTemplate(): string {
  return `---
status: in-progress
createdAt: \${CURRENT_DATE}
---

# Feature / Task Title

## Intent
Describe what changes are being made and why they are necessary.

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

export function buildAgentHarnessBlock(): string {
  return `<!-- grooveskills:harness:start -->
# GrooveSkills Harness — Agent Rules & Memory

This project uses the **GrooveSkills Harness** located in \`.grooveskills/\`.

## 1. Three-Lane Rule
- **Answer**: Explanations, audits, or questions. Read-only; write zero code.
- **Task**: Direct implementation. Record intent, scope, and checklist in \`.grooveskills/memory/tasks/<slug>.md\`. Only check off tasks with observed evidence under \`Evidence\`.
- **Spec**: Ambiguous or high-impact architecture. Clarify and validate the spec in \`.grooveskills/memory/tasks/<slug>.md\` before writing code.

## 2. Memory Locations
- Architecture context: \`.grooveskills/memory/context.md\`
- Technical decisions (ADR): \`.grooveskills/memory/decisions.md\`
- Active tasks & evidence: \`.grooveskills/memory/tasks/\`
<!-- grooveskills:harness:end -->`;
}
