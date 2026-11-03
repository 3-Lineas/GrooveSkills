<div align="center">

# GrooveSkills

**Architectural Standards & Persistent Project Memory for AI Coding Assistants**

[![npm version](https://img.shields.io/npm/v/@3lineas/grooveskills.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@3lineas/grooveskills) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](https://opensource.org/licenses/MIT)

Empower **Antigravity**, **Claude Code**, **Cursor**, and **Gemini** to collaborate like seasoned members of your engineering team—aligned with your clean code standards, aware of your architectural decisions, and ready to deliver verified code from the very first prompt.

[Overview](#-overview) • [How It Works](#-how-it-works) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [Skills Catalog](#-skills-catalog)

</div>

---

## ✨ Overview

AI coding assistants perform at their highest potential when they share your team's context, architectural habits, and empirical quality standards across every session.

**GrooveSkills** (`@3lineas/grooveskills`) equips any repository with a unified AI engineering control plane through two complementary layers:

| Layer | Purpose | Key Benefit |
| :--- | :--- | :--- |
| **1. Core Project Harness (`.grooveskills/`)** | Built-in project onboarding, persistent memory, and an Organic & Outcome-Driven (ODD) 3-lane workflow installed automatically. | Every session starts oriented on your stack, real scripts, ADR records, outcome hypotheses, and verified checklists. |
| **2. Curated Architectural Skills** | Battle-tested engineering standards covering Clean Code, TypeScript 5.5+, Rust, Python, Valibot, Hono RPC, React 19, Vitest, and UX Writing. | Your AI assistant writes clean, modular, strictly typed code matching your team's conventions. |

---

## 🎯 How It Works

### 1. Automatic Project Onboarding & Persistent Memory (`.grooveskills/memory/`)
The **GrooveSkills Harness** is installed automatically as the foundation of your project—never an optional checkbox:
- **First-Time Setup (Automatic Onboarding)**: Scans your repository (package manager, real `package.json` scripts, `tsconfig.json` path aliases, and `src/` modules), asks for your preferred communication language, and populates `.grooveskills/memory/context.md`, `decisions.md`, `tasks/00-onboarding.md`, `AGENTS.md`, and `CLAUDE.md`.
- **Subsequent Runs (Smart Skill Updates)**: Detects your existing harness, preserves your memory and language settings untouched, and **only updates the skills you select**.
- **Re-Onboarding on Demand (`init`)**: Run `npx @3lineas/grooveskills init` anytime to re-scan your project stack and refresh the onboarding context.

### 2. Smart Stack Detection & Lightweight Agent References
GrooveSkills inspects your project manifests (`package.json`, `Cargo.toml`, `pyproject.toml`) to pre-select recommended skills. All canonical skill files live in `.grooveskills/skills/<skill>/`, while agent folders receive **lightweight reference files** (~13 lines) that preserve trigger metadata without duplicating trees in your IDE:
- **Antigravity**: `.agents/skills/<skill>/SKILL.md`
- **Claude Code**: `.claude/skills/<skill>/SKILL.md`
- **Gemini Code Assist**: `.gemini/skills/<skill>/SKILL.md`
- **Cursor IDE**: `.cursor/rules/<skill>.mdc`

### 3. Organic & Outcome-Driven Development (ODD) & 3-Lane Workflow
Through the built-in `odd-ai` and `groove-harness` skills, GrooveSkills guides your AI assistant with a hybrid **Organic & Outcome-Driven Development (ODD)** methodology:
- **Organic Adaptability**: Exploration, documentation, and planning scale proportionally to the complexity of each request—keeping minor tweaks nimble while giving major features solid structure.
- **Outcome Accountability**: Instead of stopping as soon as code is generated (*Output-Driven*), the assistant defines a testable **Outcome Hypothesis** and verifies it with empirical proof (*Outcome-Driven*).

#### The 7-Step ODD Lifecycle
1. **Authorize (Permission Gate)**: Evaluates whether your prompt authorizes code modifications. Questions, audits, and reviews remain strictly **read-only**.
2. **Explore Proportionately**: Consults `.grooveskills/memory/context.md` and inspects only the files relevant to the active domain, preserving your token budget and context window.
3. **Resolve Uncertainty Early**: Answers technical unknowns by reading the codebase and asks concise, thoughtful questions only when product or design decisions are open.
4. **Classify Semantic Scope**: Routes the request into one of three execution lanes based on architectural impact and reversibility rather than line counts.
5. **Track Before First Write & Outcome Hypothesis**: Before editing source files on non-trivial tasks, records the plan and a formal hypothesis in `.grooveskills/memory/tasks/<slug>.md`:
   > *"By delivering `[Output / Technical Change]`, `[Outcome / Verifiable Behavior]` will occur, proven by `[Evidence / Test / Build Command]`."*
6. **Execute Proportionate Clean Code**: Writes clean, modular code following strict typing (zero `any`), guard clauses (zero nested `if`s), direct imports, and `<200` lines per file.
7. **Verify Against Outcomes (Empirical Receipt)**: Runs deterministic checks (typecheck, test suite, linter, or build), logs the real output under `## Evidence`, and updates `## Next` for effortless session continuity.

| Execution Lane | When It Activates | Agent Behavior |
| :--- | :--- | :--- |
| **Lane 1 — Answer** | Questions, code reviews, audits, or architectural inquiries. | **Read-only exploration.** Inspects context and answers clearly with zero files modified. |
| **Lane 2 — Task** | Well-defined features, refactors, or bugfixes. | **Outcome-driven implementation.** Declares an Outcome Hypothesis in `memory/tasks/<slug>.md` and checks off items only after verifying empirical proof under `## Evidence`. |
| **Lane 3 — Spec** | High-impact or multi-domain architectural changes. | **Collaborative design.** Drafts a specification and Outcome Hypothesis in `memory/tasks/<slug>.md` and aligns with you before writing implementation code. |

### 4. Multilingual, Empathetic UX Communication
Select your preferred language (**Español, English, Português, Italiano, or Français**) during onboarding so every validation message, toast, and agent interaction remains warm, persuasive, and professional.

---

## 🚀 Quick Start

### Interactive Wizard (Install or Update Skills)
```bash
npx @3lineas/grooveskills
```

### Force Full Project Re-Onboarding (`init`)
```bash
npx @3lineas/grooveskills init
```

### Non-Interactive Mode (CI & Scripting)
```bash
# Install skills and initialize harness in Spanish for Claude and Antigravity
npx @3lineas/grooveskills --skills odd-ai best-practices hono --agents antigravity claude -l es -y

# Re-run full project onboarding non-interactively across all AI assistants
npx @3lineas/grooveskills init --agents antigravity claude cursor gemini -l es -y
```

### CLI Options Reference

| Command / Flag | Description | Example |
| :--- | :--- | :--- |
| `init` | Force re-run of project onboarding, stack scan & memory context | `npx @3lineas/grooveskills init` |
| `-s, --skills <skills...>` | Space-separated list of skill IDs to install | `--skills odd-ai best-practices` |
| `-a, --agents <agents...>` | Target AI assistants (`antigravity`, `claude`, `cursor`, `gemini`) | `--agents antigravity cursor` |
| `-l, --language <lang>` | Set the language for user-facing copy (`es`, `en`, `pt`, `it`, `fr`) | `-l es` |
| `-y, --yes` | Automatically confirm updating existing skills | `-y` |

---

## 📂 Project Structure

```text
my-project/
├── .grooveskills/
│   ├── config.json                  # Manifest of active skills, agents, language & harness state
│   ├── skills/                      # Canonical single source of truth for installed skills
│   └── memory/                      # Persistent project memory (Core Harness control plane)
│       ├── context.md               # Auto-scanned stack, scripts, aliases & architecture map
│       ├── decisions.md             # Architecture Decision Records (ADR)
│       └── tasks/                   # 00-onboarding.md & tasks with Outcome Hypotheses
├── .agents/skills/<skill>/SKILL.md  # Lightweight reference pointer -> .grooveskills/skills/<skill>/SKILL.md
├── .claude/skills/<skill>/SKILL.md  # Lightweight reference pointer -> .grooveskills/skills/<skill>/SKILL.md
├── .gemini/skills/<skill>/SKILL.md  # Lightweight reference pointer -> .grooveskills/skills/<skill>/SKILL.md
├── .cursor/rules/<skill>.mdc        # Lightweight reference rule -> .grooveskills/skills/<skill>/SKILL.md
└── AGENTS.md / CLAUDE.md            # Concise harness pointer <!-- grooveskills:harness -->
```

---

## 📦 Skills Catalog

| Skill ID | Name | Architectural Focus | Auto-Selection Rule |
| :--- | :--- | :--- | :--- |
| `groove-harness` | **GrooveSkills Harness** | ODD 3-lane workflow (Answer, Task, Spec), onboarding protocol, ADR logging, and `.grooveskills/memory/`. | **Core Harness (Always Installed)** |
| `odd-ai` | **Organic & Outcome-Driven (ODD)** | 7-step ODD protocol for AI agents: authorize, explore, classify, outcome hypotheses, and evidence receipts. | **Default (Universal)** |
| `best-practices` | **Universal Best Practices** | Multi-language clean code, strict typing (zero `any`), guard clauses, and `<200` lines per file. | **Default (Universal)** |
| `ux-writing` | **UX Writing & Microcopy** | Warm, empathetic, conversion-oriented microcopy for validations, CTAs, toasts, and empty states. | **Default (Universal)** |
| `docs-standards` | **Documentation & ADR Standards** | English documentation rule, relative POSIX links, resilient Mermaid diagrams, ADR lifecycle, and intent docstrings. | **Default (Universal)** |
| `error-handling-logging` | **Error Handling & Logging** | Predictable error flows with typed `AppError`, `ActionResponse` contracts, and structured logging. | **Default (Universal)** |
| `clean-architecture-ddd` | **Clean Architecture & DDD** | Domain-driven module boundaries, single-purpose Actions, pure functions, and immutable data models. | **Default (Universal)** |
| `external-service-adapters` | **External Service Adapters & Wrappers** | Decoupled domain ports, vendor SDK wrappers, and swappable adapters for payment gateways, emails, and APIs. | **Default (Universal)** |
| `storage-file-adapters` | **Storage & File Adapters (S3, R2, Supabase)** | Object storage ports, uploads, presigned URLs, and streaming without repository abstractions. | **Default (Universal)** |
| `auth-rbac-policies` | **Auth Adapters & RBAC/ABAC Policies** | Authentication adapter ports with `AuthenticatedActor` and side-effect-free pure authorization policies. | **Default (Universal)** |
| `controller-orchestration-queues` | **Controller Orchestration & Queues** | Atomic Actions, Controller sequence/transactions, and swappable background Queue adapters. | **Default (Universal)** |
| `webhook-idempotency` | **Webhook Verifiers & Idempotency** | Cryptographic HMAC webhook verifiers (Stripe, Svix, MercadoPago) and atomic idempotency guards. | **Default (Universal)** |
| `caching-rate-limiting` | **Cache-Aside & Rate Limiting** | Declarative `cache.remember` wrappers and sliding-window rate limiting adapters (Redis, KV, Memory). | **Default (Universal)** |
| `env-feature-flags` | **Fail-Fast Env & Feature Flags** | Boot-time fail-fast Valibot environment validation and decoupled feature flag adapters (PostHog, LD). | **Default (Universal)** |
| `typescript-clean` | **TypeScript Clean Code (5.5+)** | Modern TypeScript (`satisfies`, discriminated unions, `const` generics, `unknown` narrowing). | `typescript` in `package.json` |
| `rust-clean` | **Rust Clean Code (Rust 2024)** | Idiomatic Rust: `let-else` guard clauses, zero `.unwrap()`, `thiserror` typed errors, and Newtypes. | `Cargo.toml` in project root |
| `python-clean` | **Python Clean Code (Python 3.12+)** | Modern Python: guard clauses (no nested ifs), strict typing (zero `Any`), uv, Ruff, and Pyright. | `pyproject.toml` / `requirements.txt` |
| `valibot-validation` | **Valibot Schema Validation** | Boundary validation with modular Valibot schemas (`* as v from "valibot"`) and courteous errors. | `valibot` in `package.json` |
| `testing-vitest` | **Vitest Testing Standards** | Fast, deterministic test suites using Arrange-Act-Assert (AAA) and in-memory fakes. | `vitest` in `package.json` |
| `hono` | **Hono Architecture (Valibot)** | Scalable Hono APIs with thin route handlers (`createRouteHandler`), Valibot validation, and isolated Actions. | `hono` in `package.json` |
| `workers-rpc-precision` | **Workers RPC & Precision Calculations** | Cloudflare Workers native RPC (`WorkerEntrypoint` / `Service<T>`) and decimal arithmetic (`Decimal` + `ROUND_HALF_UP`). | `wrangler` / `@cloudflare/workers-types` |
| `react-core` | **React Core Fundamentals** | Modern React fundamentals: strictly no `React.FC`, pure components, immutable state, core hooks, and form domain hooks. | `react` in `package.json` |
| `react-advanced` | **React 19 Advanced & Compiler** | React Compiler auto-memoization, concurrent rendering, `use()`, Actions, and RSC boundaries. | `react` in `package.json` |
| `react-create-page` | **React Page & View Architecture** | Declarative page coordinators (`<50` lines), custom domain hooks, and Valibot + Formisch forms. | `react` in `package.json` |

---

## 📄 License

Released under the [MIT License](https://opensource.org/licenses/MIT) © [3-Lineas](https://3lineas.com/)
