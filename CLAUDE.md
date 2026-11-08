<!-- grooveskills:harness:start -->
# GrooveSkills Harness — Agent Rules & Memory

This project uses the **GrooveSkills Harness** located in `.grooveskills/`.

## 1. Mandatory .grooveskills-First Read (Zero Project Re-Scanning)
- **First Step**: On EVERY turn or prompt, the agent MUST immediately read `.grooveskills/` FIRST:
  1. `.grooveskills/memory/context.md` (project architecture, conventions, and scripts).
  2. `.grooveskills/memory/decisions.md` (agreed architectural decisions & ADRs).
  3. Active tasks in `.grooveskills/memory/tasks/`.
- **Zero Full-Project Re-Scanning**: DO NOT re-scan the entire codebase, file tree, or directory structure on every interaction. The architecture and conventions are already indexed in `.grooveskills/`. Read only the specific target files needed for the active task.

## 2. Three-Lane ODD Protocol
- **Onboarding Check**: If `.grooveskills/memory/tasks/00-onboarding.md` has `status: pending`, complete its checklist to enrich `context.md` and set its status to `completed`.
- **Authorize & Explore**: Follow the 7-step ODD protocol (Authorize, Explore, Resolve, Classify, Track & Hypothesize, Execute, Verify).
- **Lane 1 (Answer)**: Explanations, audits, or questions. Read-only; write zero code.
- **Lane 2 (Task)**: Direct implementation. Declare Outcome Hypothesis and checklist in `.grooveskills/memory/tasks/<slug>.md`. Only check off tasks with observed evidence under `Evidence`.
- **Lane 3 (Spec)**: Ambiguous or high-impact architecture. Clarify and validate the spec in `.grooveskills/memory/tasks/<slug>.md` before writing code.

## 3. Daily Bitacora (`.grooveskills/bitacora/YYYY-MM.md`)
- **Purpose**: Maintain a daily summary of what was done so the developer can update external trackers (Jira, Trello, ClickUp, Linear).
- **Format**: Strictly format `YYYY-MM-DD` with concise bullet points (`- ...`), NO tables.
```markdown
YYYY-MM-DD
- Se agrego tal funcionalidad...
- Se corrigio tal problema...
```
- **Storage**: One file per month located at `.grooveskills/bitacora/YYYY-MM.md` (e.g. `.grooveskills/bitacora/2026-11.md`).
- **Order**: Reverse chronological (most recent day at the top of the file).
- **Update Frequency**: Update on every agent interaction that delivers progress (code changes, fixes, specs, or audits).
- **Rewrite Rule**: Rewrite and compress the day's bullets if they get too long; do NOT link or reference internal task files.

## 4. User Communication Language (Español)
- **Language**: `es` (Español).
- **Requirement**: Todos los mensajes, validaciones, errores, CTAs y comunicaciones con el usuario deben redactarse estrictamente en Español. El tono debe ser empático, amable, persuasivo y profesional.

## 5. Memory Locations
- Architecture context: `.grooveskills/memory/context.md`
- Technical decisions (ADR): `.grooveskills/memory/decisions.md`
- Active tasks & evidence: `.grooveskills/memory/tasks/`
- Daily bitacora: `.grooveskills/bitacora/`
<!-- grooveskills:harness:end -->
