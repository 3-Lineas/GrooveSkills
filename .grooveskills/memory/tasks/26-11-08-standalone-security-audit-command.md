# Task: Comando Autónomo de Auditoría de Seguridad Zero-Footprint (`audit` / `security-audit`)

## Status
- **Status**: completed
- **Lane**: Lane 2 (Task)
- **Date**: 2026-11-08

## Outcome Hypothesis
By delivering an autonomous `audit` command with zero-footprint behavior, multi-domain static scanning (OWASP + NVIDIA SkillSpector), adversarial disproof, console prompt generation, and optional artifact export, developers can execute full security audits on any codebase without installing GrooveSkills or creating artifacts unless requested, proven by passing automated tests, typecheck, build, and zero files generated during standard audit execution.

## Checklist
- [x] Create `src/types/audit.types.ts` with strict domain types and interfaces.
- [x] Implement `src/domains/audit/discover-audit-units.ts` for read-only stack and boundary discovery.
- [x] Implement `src/domains/audit/audit-detection-rules.ts` defining OWASP and SkillSpector rules with adversarial disproof patterns.
- [x] Implement `src/domains/audit/run-static-scanner.ts` with line detection and adversarial disproof verification.
- [x] Implement `src/domains/audit/build-standalone-audit-prompt.ts` resolving packaged skill references.
- [x] Implement `src/domains/audit/render-audit-report.ts` for console output and optional artifact export.
- [x] Implement `src/domains/audit/run-security-audit.ts` orchestrator.
- [x] Update `bin/cli.ts` to support `audit` and `security-audit` commands and `-o, --output <dir>` option.
- [x] Update `src/main.ts` with audit option routing and zero-footprint execution.
- [x] Update `README.md` keeping line count under 200 lines (167 lines).
- [x] Bump version to `1.14.0` in `package.json` and update test script.
- [x] Add comprehensive tests in `src/domains/audit/run-security-audit.test.ts`.
- [x] Verify with `pnpm check-types`, `pnpm test`, and `pnpm build`.
- [x] Complete Post-Task Security Gate verification and update daily bitacora.

## Evidence
- Automated test suite executed: `pnpm check-types && pnpm test && pnpm build` passed with zero errors.
- Zero-footprint verified: running `runSecurityAudit` on clean mock directory created zero files or directories in the target workspace.
- Detection & Disproof verified: prompt injection (CWE-94), secret tokens (CWE-798), and raw SQL interpolation (CWE-89) flagged; safe patterns with env / verify passed clean.
- Optional artifact export verified: `coverage-ledger.json`, `findings.json`, and `REPORT.md` written cleanly when `--output <dir>` was provided.
- Skill integrity verified: `node skills/security-audit/scripts/scan-skill-integrity.mjs skills/` passed with 0 violations.
