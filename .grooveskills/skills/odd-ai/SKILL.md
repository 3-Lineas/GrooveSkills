---
name: odd-ai
description: Organic & Outcome-Driven Development (ODD) protocol for AI agents: 7-step organic lifecycle, outcome hypotheses, and verifiable receipts.
---

# Organic & Outcome-Driven Development (ODD) for AI Agents

A hybrid software engineering methodology tailored for AI coding assistants. It combines the lean adaptability of **Organic Driven Development** with the empirical rigor of **Outcome-Driven Development**, eliminating both aimless vibe coding and burdensome waterfall overhead.

---

## 1. The Core Philosophy

| Dimension | The Output Trap (Anti-Pattern) | The Outcome Contract (ODD) |
| :--- | :--- | :--- |
| **Objective** | Produce diffs and close prompts quickly. | Satisfy a verifiable behavioral hypothesis. |
| **Planning** | Either zero planning or bureaucratic waterfall. | Proportionate exploration before first write. |
| **Verification** | Assumes green because the agent says so. | Empirical receipt: tests, typecheck, or runtime proof. |
| **Memory** | Ephemeral chat context lost on restart. | Persistent records in `.grooveskills/memory/`. |

---

## 2. The 7-Step ODD Lifecycle

```text
[1. Authorize] -> [2. Explore] -> [3. Resolve] -> [4. Classify] -> [5. Track & Hypothesize] -> [6. Execute] -> [7. Verify Receipt]
```

### Step 1: Authorize (Permission Gate)
- Evaluate whether the user's prompt explicitly authorizes code modification.
- Inquiries, reviews, audits, or questions trigger **Lane 1 (Answer)**: remain strictly **read-only**.

### Step 2: Explore Proportionately
- Consult `.grooveskills/memory/context.md` for project architecture, conventions, and key commands.
- Read only files relevant to the active scope; avoid full codebase traversals that waste tokens.

### Step 3: Resolve Uncertainty Early
- Disambiguate technical choices directly from codebase inspection.
- Ask the user focused questions only when facing genuine product or architectural crossroads.

### Step 4: Classify Semantic Scope
- Classify tasks by semantic complexity and reversibility, never by superficial line counts:
  - **Micro-Fix**: Focused 1-line or localized tweak; execute directly and verify.
  - **Feature / Refactor (Lane 2 - Task)**: Requires state tracking in `.grooveskills/memory/tasks/<slug>.md`.
  - **Architecture (Lane 3 - Spec)**: High ambiguity or cross-domain risk; draft spec and align before writing code.

### Step 5: Track Before First Write & Outcome Hypothesis
Before modifying source files for substantial tasks, record the **Outcome Hypothesis** in `.grooveskills/memory/tasks/<slug>.md`:
> *"By [Output / Technical Change], [Outcome / Verifiable Behavior] will occur, proven by [Evidence / Test / Build Command]."*

### Step 6: Execute Proportionate Clean Code
- Apply strict typing (zero `any`), guard clauses (no nested `if`s), SRP, and file limit (<200 lines).
- Avoid premature optimizations; implement exactly what the outcome demands.

### Step 7: Verify Against Outcomes (Receipt of Evidence)
- Run automated verification: typecheck, tests, linter, or build.
- Record exact outputs under `## Evidence` in the task document.
- Update `## Next` so work can be resumed seamlessly across agent turns.

---

## 3. Communication Standard
- Maintain an empathetic, professional, and solution-driven tone.
- When working in Spanish (`es`), use clear, courteous explanations and actionable guidance.
