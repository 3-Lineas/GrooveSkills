<!-- grooveskills:harness:start -->
# GrooveSkills Harness — Agent Rules & Memory

This project uses the **GrooveSkills Harness** located in `.grooveskills/`.

## 1. Three-Lane Rule
- **Answer**: Explanations, audits, or questions. Read-only; write zero code.
- **Task**: Direct implementation. Record intent, scope, and checklist in `.grooveskills/memory/tasks/<slug>.md`. Only check off tasks with observed evidence under `Evidence`.
- **Spec**: Ambiguous or high-impact architecture. Clarify and validate the spec in `.grooveskills/memory/tasks/<slug>.md` before writing code.

## 2. Memory Locations
- Architecture context: `.grooveskills/memory/context.md`
- Technical decisions (ADR): `.grooveskills/memory/decisions.md`
- Active tasks & evidence: `.grooveskills/memory/tasks/`
<!-- grooveskills:harness:end -->
