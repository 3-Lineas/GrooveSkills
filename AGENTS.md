<!-- grooveskills:harness:start -->
# GrooveSkills Harness — Agent Rules & Memory

This project uses the **GrooveSkills Harness** (`v1.18.1`) located in `.grooveskills/`.

## 1. Mandatory .grooveskills-First Read (Zero Project Re-Scanning)
- **First Step**: On EVERY turn or prompt, the agent MUST immediately read `.grooveskills/` FIRST:
  1. `.grooveskills/memory/context.md` (project architecture, conventions, and scripts).
  2. `.grooveskills/memory/decisions.md` (agreed architectural decisions & ADRs).
  3. Active tasks in `.grooveskills/memory/tasks/`.
- **Zero Full-Project Re-Scanning**: DO NOT re-scan the entire codebase, file tree, or directory structure on every interaction. The architecture and conventions are already indexed in `.grooveskills/`. Read only the specific target files needed for the active task.

## 2. Three-Lane ODD Protocol
- **Onboarding Check**: If `.grooveskills/memory/tasks/00-onboarding.md` has `status: pending`, complete its checklist to enrich `context.md` and `decisions.md`, set its status to `completed`, and STOP to wait for the user's next prompt (never implement project code or features during onboarding).
- **Authorize & Explore**: Follow the 7-step ODD protocol (Authorize, Explore, Resolve, Classify, Track & Hypothesize, Execute, Verify).
- **Lane 1 (Answer)**: Explanations, audits, or questions. Read-only; write zero code.
- **Lane 2 (Task)**: Direct implementation. Declare Outcome Hypothesis and checklist in `.grooveskills/memory/tasks/YY-MM-DD-<slug>.md` (e.g. `26-11-08-auth-flow.md`). Maintain chronological order; if any task files do not follow this pattern, correct them. Only check off tasks with observed evidence under `Evidence` (including Post-Task Security Gate on trust boundary changes).
- **Lane 3 (Spec)**: Ambiguous or high-impact architecture. Clarify and validate the spec in `.grooveskills/memory/tasks/YY-MM-DD-<slug>.md` before writing code.

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
- **Max 10 Items per Day (Compaction Rule)**: Each date section (`YYYY-MM-DD`) MUST NOT exceed **10 list items** (flat `- ...` bullets only, zero nested sub-bullets). If adding progress would exceed 10 items for a day, rewrite and compact/merge related bullets into concise high-level summaries so the day stays at **<= 10 items** without losing key outcomes. Do NOT link or reference internal task files.

## 4. User Communication Language (Español)
- **Language**: `es` (Español).
- **Requirement**: Todos los mensajes, validaciones, errores, CTAs y comunicaciones con el usuario deben redactarse estrictamente en Español. El tono debe ser empático, amable, persuasivo y profesional.

## 5. Memory Locations
- Architecture context: `.grooveskills/memory/context.md`
- Technical decisions (ADR): `.grooveskills/memory/decisions.md`
- Active tasks & evidence: `.grooveskills/memory/tasks/`
- Daily bitacora: `.grooveskills/bitacora/`

## 6. Strict Architectural Non-Negotiables
- **1 Function/Method per File (100% Atomic)**: Every code file must export at most ONE function, method, action, route handler, component, hook, schema, or type. Never group multiple helpers or methods in one file.
- **1 DB Call per Action & Pipeline Chaining**: Every database query or mutation lives in an isolated atomic Action (max 1 DB query per Action). Monolithic use-case actions are forbidden; routes chain atomic actions via `Pipeline.send(context).through([...actions])`.
- **Type Isolation**: Never declare data interfaces or types inline. Only a UI component's own `Props` interface can be inline in its `.tsx` file; all other domain/data types live in `@/types/{domain}/{name}.type.ts`.
- **Domain within Technical Layers**: Organize by `{domain}` subfolders inside each technical layer (`src/actions/{domain}/`, `src/routes/{domain}/`, `src/dtos/{domain}/`, `src/types/{domain}/`, `src/errors/{domain}/`). Never create root `src/domains/` or `src/controllers/` folders.
- **Hono Route Architecture**: Endpoints live in `src/routes/{domain}/{action}.route.ts` and delegate to atomic Actions (direct call for 1 single-read action, or via `Pipeline` for multi-step flows). Subfolders like `src/routes/{surface}/{domain}/` are only allowed if serving 2+ distinct surfaces (e.g. `web` and `mobile`).
<!-- grooveskills:harness:end -->
