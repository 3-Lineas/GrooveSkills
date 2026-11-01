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
| **1. Curated Architectural Skills** | Battle-tested engineering standards covering Clean Code, TypeScript 5.5+, Valibot, Hono RPC, React 19, Vitest, and UX Writing. | Your AI assistant writes clean, modular, strictly typed code matching your conventions. |
| **2. Encapsulated Project Harness (`.grooveskills/`)** | Lightweight memory and an Organic & Outcome-Driven (ODD) 3-lane workflow stored inside your repository. | Every session starts oriented on your stack, ADR records, outcome hypotheses, and verified checklists. |

---

## 🎯 How It Works

### 1. Smart Stack Detection & Multi-Agent Adaptation
GrooveSkills inspects dependencies (`hono`, `react`, `valibot`, `typescript`, `vitest`, `rust`, `python`) and pre-selects recommended skills, linking them automatically:
- **Antigravity**: `.agents/skills/<skill>/SKILL.md`
- **Claude Code**: `.claude/skills/<skill>/SKILL.md`
- **Gemini Code Assist**: `.gemini/skills/<skill>/SKILL.md`
- **Cursor IDE**: `.cursor/rules/<skill>.mdc`

### 2. Persistent Project Memory (`.grooveskills/memory/`)
Enabling the harness creates an encapsulated knowledge plane and configures `AGENTS.md` and `CLAUDE.md`:
- **`context.md`**: Summarizes your stack, conventions, and essential commands.
- **`decisions.md`**: An append-only Architecture Decision Record (ADR) log.
- **`tasks/<slug>.md`**: Feature records tracking outcome hypotheses and verification receipts.

### 3. Organic & Outcome-Driven (ODD) 3-Lane Workflow
Through `groove-harness` and `odd-ai`, agents follow an organic 7-step lifecycle across 3 distinct execution lanes:

| Execution Lane | When It Activates | Agent Behavior |
| :--- | :--- | :--- |
| **Lane 1 — Answer** | Questions, code reviews, audits, or architectural inquiries. | **Read-only exploration.** Zero files modified. |
| **Lane 2 — Task** | Well-defined features, refactors, or bugfixes. | **Outcome-driven implementation.** Formulates Outcome Hypothesis and verifies observed proof under `## Evidence`. |
| **Lane 3 — Spec** | High-impact or multi-domain architectural changes. | **Collaborative design.** Drafts specification in `memory/tasks/<slug>.md` and aligns before writing code. |

### 4. Multilingual, Empathetic UX Communication
Select your preferred language (**Español, English, Português, Italiano, or Français**) during setup so every validation message, toast, and agent interaction remains warm, persuasive, and professional.

### 5. Clean & 100% Portable Repository Layout
All assets reside in `.grooveskills/` and connect to agent directories via **relative symlinks** (`../../.grooveskills/...`), making the environment instantly portable upon `git clone`.

---

## 🚀 Quick Start

### Interactive Wizard (Recommended)
```bash
npx @3lineas/grooveskills
```

### Non-Interactive Mode (CI & Scripting)
```bash
# Install skills and initialize harness in Spanish for Claude and Antigravity
npx @3lineas/grooveskills --skills odd-ai best-practices hono --agents antigravity claude --harness -l es -y

# Initialize harness across all supported AI assistants
npx @3lineas/grooveskills --harness --agents antigravity claude cursor gemini -l es -y
```

### CLI Options Reference

| Flag | Description | Example |
| :--- | :--- | :--- |
| `-s, --skills <skills...>` | Space-separated list of skill IDs to install | `--skills odd-ai best-practices` |
| `-a, --agents <agents...>` | Target AI assistants (`antigravity`, `claude`, `cursor`, `gemini`) | `--agents antigravity cursor` |
| `--harness` | Initialize or update the GrooveSkills Harness in `.grooveskills/` | `--harness` |
| `--no-harness` | Install selected skills without initializing the project harness | `--no-harness` |
| `-l, --language <lang>` | Set the language for user-facing copy (`es`, `en`, `pt`, `it`, `fr`) | `-l es` |
| `-y, --yes` | Automatically confirm updating existing skill links | `-y` |

---

## 📂 Project Structure

```text
my-project/
├── .grooveskills/
│   ├── config.json                  # Manifest of active skills, agents, language & harness state
│   ├── skills/                      # Self-contained copy of installed skills
│   ├── cursor-rules/                # Generated .mdc rules (when Cursor IDE is selected)
│   └── memory/                      # Persistent project memory (when Harness is enabled)
│       ├── context.md               # Stack overview, conventions & essential commands
│       ├── decisions.md             # Architecture Decision Records (ADR)
│       └── tasks/                   # Tasks with Outcome Hypotheses & Evidence receipts
├── .agents/skills/*                 # Relative symlinks -> ../../.grooveskills/skills/*
├── .claude/skills/*                 # Relative symlinks -> ../../.grooveskills/skills/*
├── .cursor/rules/*.mdc              # Relative symlinks -> ../../.grooveskills/cursor-rules/*.mdc
└── AGENTS.md / CLAUDE.md            # Concise harness pointer <!-- grooveskills:harness -->
```

---

## 📦 Skills Catalog

| Skill ID | Name | Architectural Focus | Auto-Selection Rule |
| :--- | :--- | :--- | :--- |
| `groove-harness` | **GrooveSkills Harness** | ODD 3-lane workflow (Answer, Task, Spec), ADR logging, and task checklists in `.grooveskills/memory/`. | Included with `--harness` |
| `odd-ai` | **Organic & Outcome-Driven (ODD)** | 7-step ODD protocol for AI agents: authorize, explore, classify, outcome hypotheses, and evidence receipts. | Included with `--harness` |
| `best-practices` | **Universal Best Practices** | Multi-language clean code, strict typing (zero `any`), guard clauses, and `<200` lines per file. | **Default (Universal)** |
| `ux-writing` | **UX Writing & Microcopy** | Warm, empathetic, conversion-oriented microcopy for validations, CTAs, toasts, and empty states. | **Default (Universal)** |
| `error-handling-logging` | **Error Handling & Logging** | Predictable error flows with typed `AppError`, `ActionResponse` contracts, and structured logging. | **Default (Universal)** |
| `clean-architecture-ddd` | **Clean Architecture & DDD** | Domain-driven module boundaries, single-purpose Actions, pure functions, and immutable data models. | **Default (Universal)** |
| `typescript-clean` | **TypeScript Clean Code (5.5+)** | Modern TypeScript (`satisfies`, discriminated unions, `const` generics, `unknown` narrowing). | `typescript` in `package.json` |
| `rust-clean` | **Rust Clean Code (Rust 2024)** | Idiomatic Rust: `let-else` guard clauses, zero `.unwrap()`, `thiserror` typed errors, and Newtypes. | `Cargo.toml` in project root |
| `python-clean` | **Python Clean Code (Python 3.12+)** | Modern Python: guard clauses (no nested ifs), strict typing (zero `Any`), uv, Ruff, and Pyright. | `pyproject.toml` / `requirements.txt` |
| `valibot-validation` | **Valibot Schema Validation** | Boundary validation with modular Valibot schemas (`* as v from "valibot"`) and courteous errors. | `valibot` in `package.json` |
| `testing-vitest` | **Vitest Testing Standards** | Fast, deterministic test suites using Arrange-Act-Assert (AAA) and in-memory fakes. | `vitest` in `package.json` |
| `hono` | **Hono Architecture (Valibot)** | Scalable Hono APIs with domain-split routes, isolated Actions, and end-to-end Hono RPC types. | `hono` in `package.json` |
| `react-core` | **React Core Fundamentals** | Pure components, immutable state, clean hook composition, and controlled inputs. | `react` in `package.json` |
| `react-advanced` | **React 19 Advanced & Compiler** | React Compiler auto-memoization, concurrent rendering, `use()`, Actions, and RSC boundaries. | `react` in `package.json` |
| `react-create-page` | **React Page & View Architecture** | Declarative page coordinators (`<50` lines), custom domain hooks, and Valibot + Formisch forms. | `react` in `package.json` |

---

## 📄 License

Released under the [MIT License](https://opensource.org/licenses/MIT) © [3-Lineas](https://3lineas.com/)
