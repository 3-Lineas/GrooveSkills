# Architecture Decision Records (ADR)

An append-only log of significant technical and architectural choices.

| Date | Title | Decision | Reason & Consequences |
| :--- | :--- | :--- | :--- |
| 2026-11-01 | Adopt GrooveSkills Harness | Initialized `.grooveskills/` control plane | Clean, encapsulated agent memory and 3-lane execution flow |
| 2026-11-01 | Multilingual Harness & Clean Code Skills (v1.2.0) | Added `es`, `en`, `pt`, `it`, `fr` language rules and 8 universal/language clean code skills (`ux-writing`, `typescript-clean`, `rust-clean`, `python-clean`, etc.) | Enforces zero nested `if`s, zero `any`, <200 lines per file, and empathetic UX copy across stacks |
| 2026-11-01 | Hybrid ODD Protocol (v1.3.0) | Added `odd-ai` skill and upgraded Harness to the 7-step Organic & Outcome-Driven Development flow | Requires Outcome Hypotheses before code changes and empirical verification receipts under `## Evidence` |
| 2026-11-01 | Lightweight Markdown Skill References (v1.4.0) | Replaced directory symlinks and `.grooveskills/cursor-rules/` with ~13-line reference files in `.agents/`, `.claude/`, `.gemini/`, and `.cursor/` | Keeps `.grooveskills/skills/` as the single source of truth without duplicating folder trees in IDEs |
| 2026-11-01 | Mandatory Core Harness, Auto-Onboarding & `init` (v1.5.0) | Marked `groove-harness` as `isCoreHarness: true` (hidden from checkbox prompt), added `scan-project-onboarding.ts`, and added `grooveskills init` | Installs harness & runs onboarding automatically on first run; updates only skills on subsequent runs; re-runs onboarding on `init` |
| 2026-11-03 | External Service Adapters & Wrappers Pattern | Added `external-service-adapters` skill standardizing third-party integrations (payments, email, SMS, storage) | Actions depend solely on domain ports; SDK quirks and credentials stay isolated in vendor wrappers; adapters enable zero-change provider swapping |
| 2026-11-03 | Architectural Wrapper & Adapter Skills Suite | Added 6 architectural skills (`storage-file-adapters`, `auth-rbac-policies`, `controller-orchestration-queues`, `webhook-idempotency`, `caching-rate-limiting`, `env-feature-flags`) | Standardizes object storage, auth/policies, single-purpose action orchestration + queue workers, HMAC webhook verifiers + idempotency, cache-aside + rate limiting, and fail-fast env validation across projects |

