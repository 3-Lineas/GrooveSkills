---
name: groove-harness
description: Lightweight project harness, context memory, and ODD 3-lane task execution (Answer, Task, Spec) for AI coding agents.
---

# GrooveSkills Harness — Project Control Plane

A lightweight, non-intrusive harness living entirely within `.grooveskills/`. It gives agents persistent project memory, clear architectural boundaries, and a disciplined Organic & Outcome-Driven (ODD) 3-lane execution flow.

---

## 1. The ODD 3-Lane Execution Flow

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

## 2. Project Memory Maintenance

- **`.grooveskills/memory/context.md`**: Stores project stack, architectural patterns, conventions, and key commands. Read this when starting work on a domain; update it when new dependencies or architectural standards are introduced.
- **`.grooveskills/memory/decisions.md`**: An append-only Architecture Decision Record (ADR). Log significant technical decisions (`Date`, `Context`, `Decision`, `Consequences`).
- **`.grooveskills/memory/tasks/`**: Individual feature records holding outcome hypotheses, checklists, and observed proof.

---

## 3. Core Principles

1. **Outcome-Driven Accountability**: Every non-trivial change requires an outcome hypothesis and an observed verification receipt.
2. **Strict Encapsulation**: Keep harness and state confined to `.grooveskills/`. Do not pollute the root repository.
3. **Respect Best Practices**: All code must follow strict typing, guard clauses, SRP, direct imports (no barrels), and file limits (<200 lines).
