---
status: completed
createdAt: 2026-11-08T14:01:00-03:00
completedAt: 2026-11-08T14:05:00-03:00
---

# Agent Skills Symbolic Links & Auto-Migration

## Intent
Replace duplication / directory copies of skills in agent folders (`.agents/skills/`, `.claude/skills/`, `.gemini/skills/`) with relative symbolic links pointing directly to the canonical `.grooveskills/skills/<skill>` content. Keep the agent skills folder as a real directory so users can place custom skills alongside symlinks. Auto-migrate legacy reference folders and copies to symlinks upon running install/update/init.

## Scope
- In scope:
  - Add `recordCreatedSymlink` to `InstallTransaction` for atomic rollback.
  - Implement `linkAgentSkill` (using relative symlink with junction flag for cross-platform) in `skill-reference-builder.ts`.
  - Update `AntigravityAdapter`, `ClaudeAdapter`, `GeminiAdapter` to use `linkAgentSkill`.
  - Leave `CursorAdapter` generating `.cursor/rules/*.mdc` intact.
  - Implement migration of legacy reference folders/directories in `linkAgentSkill` and auto-migration of old projects.
  - Update unit and integration tests to verify symlink creation, content readability, and rollback.
  - Update documentation (`README.md`, ADR in `decisions.md`, bitacora).
  - Convert this repository's own `.agents/skills/` to symlinks.
- Out of scope:
  - Cursor `.cursor/rules/*.mdc` format changes (kept as `.mdc` rules).

## Checklist
- [x] 1. Extend `InstallTransaction` with `recordCreatedSymlink` and rollback logic.
- [x] 2. Implement `linkAgentSkill` in `skill-reference-builder.ts` with cross-platform junction symlink and legacy directory cleanup.
- [x] 3. Update agent adapters (`Antigravity`, `Claude`, `Gemini`) to call `linkAgentSkill`.
- [x] 4. Add comprehensive automated tests in `safe-fs.test.ts` verifying symlinks, target resolution, and transaction rollback.
- [x] 5. Run typecheck (`pnpm check-types`), test suite (`pnpm test`), and build (`pnpm build`).
- [x] 6. Update local repository's `.agents/skills` to symlinks.
- [x] 7. Update documentation (`README.md`, `.grooveskills/memory/decisions.md`, `.grooveskills/bitacora/2026-11.md`).

## Evidence
- `pnpm check-types`: PASSED (0 errors)
- `pnpm test`: PASSED (All 11 test suites passed including linkAgentSkill symlink verification, legacy migration, custom user skills preservation, and rollback)
- `pnpm build`: PASSED (tsup built dist/cli.js and dist/main.js cleanly)
- Self-update run (`node ./dist/cli.js update --yes`): Successfully migrated `.agents/skills/*` to relative symlinks `../../.grooveskills/skills/<skill>`.
- Verified `ls -la .agents/skills` shows valid symbolic links and target file reading works as intended.

## Post-Task Security Gate
- Verified: Trust boundaries for filesystem operations are respected. Relative paths are sanitized and point only within the project directory structure. No arbitrary code execution or unverified remote fetches. Transaction journal rolls back cleanly if any error occurs.

## Next
- None. Task complete.
