<!-- grooveskills:harness:start -->
# GrooveSkills Harness — Agent Rules & Memory

This project uses the **GrooveSkills Harness** located in `.grooveskills/`.

## 1. Three-Lane ODD Protocol
- **Authorize & Explore**: Follow the 7-step ODD protocol (Authorize, Explore, Resolve, Classify, Track & Hypothesize, Execute, Verify).
- **Lane 1 (Answer)**: Explanations, audits, or questions. Read-only; write zero code.
- **Lane 2 (Task)**: Direct implementation. Declare Outcome Hypothesis and checklist in `.grooveskills/memory/tasks/<slug>.md`. Only check off tasks with observed evidence under `Evidence`.
- **Lane 3 (Spec)**: Ambiguous or high-impact architecture. Clarify and validate the spec in `.grooveskills/memory/tasks/<slug>.md` before writing code.

## 2. User Communication Language (Español)
- **Language**: `es` (Español).
- **Requirement**: Todos los mensajes, validaciones, errores, CTAs y comunicaciones con el usuario deben redactarse estrictamente en Español. El tono debe ser empático, amable, persuasivo y profesional.

## 3. Memory Locations
- Architecture context: `.grooveskills/memory/context.md`
- Technical decisions (ADR): `.grooveskills/memory/decisions.md`
- Active tasks & evidence: `.grooveskills/memory/tasks/`
<!-- grooveskills:harness:end -->
