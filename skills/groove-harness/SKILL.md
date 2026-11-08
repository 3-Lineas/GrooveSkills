---
name: groove-harness
description: Lightweight project harness, context memory, and ODD 3-lane task execution (Answer, Task, Spec) for AI coding agents.
---

# GrooveSkills Harness — Project Control Plane

A lightweight, non-intrusive harness living entirely within `.grooveskills/`. It gives agents persistent project memory, clear architectural boundaries, and a disciplined Organic & Outcome-Driven (ODD) 3-lane execution flow.

---

## 1. Mandatory .grooveskills-First Read (Zero Project Re-Scanning)
- **First Step**: On every turn, prompt, or interaction, the agent MUST immediately read `.grooveskills/` FIRST:
  1. `.grooveskills/memory/context.md` (project stack, architecture map, conventions, commands).
  2. `.grooveskills/memory/decisions.md` (ADRs & architectural decisions).
  3. Active task records in `.grooveskills/memory/tasks/`.
- **Zero Full-Project Re-Scanning**: DO NOT perform broad scans of the entire workspace, recursive directory walks, or full codebase inspections on every interaction. The architecture and conventions are already documented in `.grooveskills/`. Inspect only specific files needed for the task at hand.

---

## 2. The ODD 3-Lane Execution Flow

Every request is governed by the 7-step ODD protocol (*Authorize, Explore, Resolve, Classify, Track & Hypothesize, Execute, Verify*) mapped into three lanes:

### Lane 1: Answer (Read-Only)
- **Trigger**: Explanations, audits, code reviews, comparisons, or questions.
- **Rule**: Read-only. Write zero code, create zero artifacts, modify no files.

### Lane 2: Task (Outcome-Driven Implementation)
- **Trigger**: Concrete change, standard feature, refactor, or bugfix with clear requirements.
- **Protocol**:
  1. For non-trivial work, locate or create `.grooveskills/memory/tasks/<slug>.md`.
  2. Declare the **Outcome Hypothesis**, `Scope`, and an itemized `Checklist`.
  3. Execute code changes incrementally following clean code standards.
  4. Only check off tasks once **observed evidence** is verified (e.g. `check-types`, test runs, or command outputs under `Evidence`).
  5. Keep `Next` updated so any interruption costs nothing.

### Lane 3: Spec (Collaborative Design)
- **Trigger**: Multi-component restructuring, ambiguous requirements, or high-risk domain changes.
- **Protocol**:
  1. Draft the architectural proposal, interfaces, trade-offs, and open questions inside `.grooveskills/memory/tasks/<slug>.md`.
  2. Present the spec to the user and request explicit confirmation.
  3. Once approved, switch to Lane 2 (Task) for outcome-driven implementation.

---

## 3. Daily Bitacora (`.grooveskills/bitacora/YYYY-MM.md`)

- **Purpose**: Maintain a daily summary of what was completed so the developer can effortlessly update external management trackers (Jira, Trello, ClickUp, Linear).
- **Format**: Plain date `YYYY-MM-DD` followed by concise bullet points (`- ...`). Strictly NO tables.
```markdown
2026-10-25
- Se agrego tal funcionalidad...
- Se corrigio tal problema...
```
- **Storage**: One file per month located at `.grooveskills/bitacora/YYYY-MM.md` (e.g., `.grooveskills/bitacora/2026-11.md`).
- **Order**: Reverse chronological (most recent day at the top of the file).
- **Update Frequency**: Update on every agent interaction that delivers progress (code changes, fixes, specs, or audits).
- **Rewrite Rule**: Rewrite and compress the day's bullets if they get too long; do NOT link or reference internal task files.

---

## 4. Project Memory Maintenance

- **`.grooveskills/memory/context.md`**: Stores project stack, architectural patterns, conventions, and key commands. Read this when starting work on a domain; update it when new dependencies or architectural standards are introduced.
- **`.grooveskills/memory/decisions.md`**: An append-only Architecture Decision Record (ADR). Log significant technical decisions (`Date`, `Context`, `Decision`, `Consequences`).
- **`.grooveskills/memory/tasks/00-onboarding.md`**: Initial onboarding task. If `status: pending`, inspect project structure, commands, and verify `.grooveskills/memory/context.md`, then mark as `completed`.
- **`.grooveskills/memory/tasks/`**: Individual feature records holding outcome hypotheses, checklists, and observed proof.
- **`.grooveskills/bitacora/`**: Monthly markdown summaries for daily developer progress tracking.

---

## 5. Core Principles

1. **Mandatory .grooveskills-First Read**: Never re-scan the entire codebase; rely on persistent project memory.
2. **Outcome-Driven Accountability**: Every non-trivial change requires an outcome hypothesis and an observed verification receipt.
3. **Strict Encapsulation**: Keep harness and state confined to `.grooveskills/`. Do not pollute the root repository.
4. **Respect Best Practices**: All code must follow strict typing, guard clauses, SRP, direct imports (no barrels), and file limits (<200 lines).

