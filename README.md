<div align="center">

# GrooveSkills

**Architectural Standards & Persistent Project Memory for AI Coding Assistants**

[![npm version](https://img.shields.io/npm/v/@3lineas/grooveskills.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/@3lineas/grooveskills) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](https://opensource.org/licenses/MIT)

Empower **Antigravity**, **Claude Code**, **Cursor**, and **Gemini** to collaborate like seasoned members of your engineering team—aligned with your clean code standards, aware of your architectural decisions, and ready to deliver verified code from the very first prompt.

[Overview](#-overview) • [How It Works](#-how-it-works) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [Skills Catalog](#-skills-catalog)

</div>

---

## ✨ Overview

AI coding assistants are extraordinary productivity partners, and they perform at their best when they share your team's context, architectural habits, and quality standards across every session.

**GrooveSkills** (`@3lineas/grooveskills`) is a zero-configuration CLI that equips any repository with a unified AI engineering environment in seconds through two complementary layers:

| Layer | Purpose | Key Benefit |
| :--- | :--- | :--- |
| **1. Curated Architectural Skills** | Battle-tested engineering standards covering Clean Code, TypeScript 5.5+, Valibot, Hono RPC, React 19, Vitest, and Persuasive UX Writing. | Your AI assistant writes clean, modular, strictly typed code that matches your team's conventions naturally. |
| **2. Encapsulated Project Harness (`.grooveskills/`)** | A lightweight, file-based memory and 3-lane workflow stored directly inside your repository. | Every session starts with full awareness of your stack, past technical decisions (ADR), and active task checklists. |

---

## 🎯 How It Works

When you initialize GrooveSkills in a project, it orchestrates five capabilities out of the box:

### 1. Smart Stack Detection & Multi-Agent Adaptation
GrooveSkills inspects your `package.json` to recognize your stack (`hono`, `react`, `valibot`, `typescript`, `vitest`) and pre-selects the most relevant skills for your project. It then formats and links them automatically for the AI editors your team uses:
- **Antigravity**: `.agents/skills/<skill>/SKILL.md`
- **Claude Code**: `.claude/skills/<skill>/SKILL.md`
- **Gemini Code Assist**: `.gemini/skills/<skill>/SKILL.md`
- **Cursor IDE**: Native `.cursor/rules/<skill>.mdc` rule files with frontmatter.

### 2. Persistent Project Memory (`.grooveskills/memory/`)
Enabling the **GrooveSkills Harness** creates a structured knowledge base inside `.grooveskills/memory/` and adds a concise, idempotent pointer block to `AGENTS.md` and `CLAUDE.md`:
- **`context.md`**: Summarizes your stack, directory conventions, and essential commands so your assistant is oriented on turn one.
- **`decisions.md`**: An append-only Architecture Decision Record (ADR) table that preserves the rationale behind your technical choices.
- **`tasks/<slug>.md`**: Focused feature documents where the assistant outlines intent, scope, and verification steps before modifying code.

### 3. Predictable 3-Lane Execution Workflow
Through the built-in `groove-harness` skill, your AI assistant adapts its workflow to match the scope of each request:

| Execution Lane | When It Activates | Agent Behavior |
| :--- | :--- | :--- |
| **Lane 1 — Answer** | Questions, code reviews, audits, or architectural explanations. | **Read-only exploration.** Inspects the codebase and provides clear answers without modifying files. |
| **Lane 2 — Task** | Well-defined features, refactors, or bugfixes. | **Evidence-backed implementation.** Tracks progress in `memory/tasks/<slug>.md` and checks off items only after verifying real outputs (typechecks, tests, or builds). |
| **Lane 3 — Spec** | High-impact or multi-domain architectural changes. | **Collaborative design.** Drafts a concise specification in `memory/tasks/<slug>.md` and aligns with you before writing implementation code. |

### 4. Multilingual, Empathetic UX Communication
During setup, you can select your preferred language for user-facing copy and agent communication (**Español, English, Português, Italiano, or Français**). GrooveSkills records this preference in your harness rules so every validation message, toast notification, empty state, and CTA crafted by the AI is warm, persuasive, solution-oriented, and professional.

### 5. Clean & 100% Portable Repository Layout
All skills, Cursor rules, and memory files are stored locally inside `<project>/.grooveskills/` and connected to agent folders via **relative symlinks** (`../../.grooveskills/...`). The moment a teammate clones the repository, every skill, rule, and memory file works immediately without additional setup.

---

## 🚀 Quick Start

### Interactive Wizard (Recommended)

Run the guided setup from the root of your project:

```bash
npx @3lineas/grooveskills
```

The interactive wizard will:
1. Detect your project dependencies and active AI assistant folders.
2. Pre-select recommended **Architectural Skills** tailored to your stack.
3. Let you choose which **AI Assistants** to configure (`antigravity`, `claude`, `cursor`, `gemini`).
4. Offer to initialize the **GrooveSkills Harness** in `.grooveskills/` and configure your preferred language.

### Non-Interactive Mode (CI & Scripting)

Use CLI flags to configure skills and the project harness in a single command:

```bash
# Install skills and initialize the harness in Spanish for Claude and Antigravity
npx @3lineas/grooveskills --skills best-practices hono --agents antigravity claude --harness -l es -y

# Initialize the GrooveSkills Harness across all supported AI assistants
npx @3lineas/grooveskills --harness --agents antigravity claude cursor gemini -l es -y

# Install specific stack skills without initializing the harness
npx @3lineas/grooveskills --skills react-core react-advanced --agents cursor --no-harness -y
```

### CLI Options Reference

| Flag | Description | Example |
| :--- | :--- | :--- |
| `-s, --skills <skills...>` | Space-separated list of skill IDs to install | `--skills best-practices hono` |
| `-a, --agents <agents...>` | Target AI assistants (`antigravity`, `claude`, `cursor`, `gemini`) | `--agents antigravity cursor` |
| `--harness` | Initialize or update the GrooveSkills Harness in `.grooveskills/` | `--harness` |
| `--no-harness` | Install selected skills without initializing the project harness | `--no-harness` |
| `-l, --language <lang>` | Set the language for user-facing copy (`es`, `en`, `pt`, `it`, `fr`) | `-l es` |
| `-y, --yes` | Automatically confirm updating existing skill links | `-y` |
| `-h, --help` | Display command help and available options | `--help` |
| `-V, --version` | Display the installed version of GrooveSkills | `--version` |

---

## 📂 Project Structure

Everything generated by GrooveSkills is encapsulated inside `.grooveskills/` and linked via portable relative symlinks:

```text
my-project/
├── .grooveskills/
│   ├── config.json                  # Manifest of active skills, agents, language & harness state
│   ├── skills/                      # Self-contained copy of installed skills
│   │   ├── best-practices/
│   │   └── groove-harness/
│   ├── cursor-rules/                # Generated .mdc rules (when Cursor IDE is selected)
│   │   ├── best-practices.mdc
│   │   └── groove-harness.mdc
│   └── memory/                      # Persistent project memory (when Harness is enabled)
│       ├── context.md               # Stack overview, conventions & essential commands
│       ├── decisions.md             # Architecture Decision Records (ADR)
│       └── tasks/
│           └── _template.md         # Template for feature tasks & verification evidence
├── .agents/skills/*                 # Relative symlinks -> ../../.grooveskills/skills/*
├── .claude/skills/*                 # Relative symlinks -> ../../.grooveskills/skills/*
├── .gemini/skills/*                 # Relative symlinks -> ../../.grooveskills/skills/*
├── .cursor/rules/*.mdc              # Relative symlinks -> ../../.grooveskills/cursor-rules/*.mdc
└── AGENTS.md / CLAUDE.md            # Concise, idempotent harness block <!-- grooveskills:harness -->
```

---

## 📦 Skills Catalog

| Skill ID | Name | Architectural Focus | Auto-Selection Rule |
| :--- | :--- | :--- | :--- |
| `groove-harness` | **GrooveSkills Harness** | 3-lane workflow (Answer, Task, Spec), ADR logging, and evidence-backed task checklists in `.grooveskills/memory/`. | Included with `--harness` |
| `best-practices` | **Universal Best Practices** | Multi-language clean code, strict typing (zero `any`), guard clauses, direct imports, single responsibility, and `<200` lines per file. | **Default (Universal)** |
| `ux-writing` | **UX Writing & Microcopy** | Warm, empathetic, conversion-oriented microcopy for validations, CTAs, toasts, and empty states. | **Default (Universal)** |
| `error-handling-logging` | **Error Handling & Logging** | Predictable error flows with typed `AppError`, `ActionResponse` contracts, and structured context logging (`Logger`). | **Default (Universal)** |
| `clean-architecture-ddd` | **Clean Architecture & DDD** | Domain-driven module boundaries, single-purpose Actions, pure functions, and immutable data models. | **Default (Universal)** |
| `typescript-clean` | **TypeScript Clean Code (5.5+)** | Modern TypeScript (`satisfies`, discriminated unions, `const` generics, `unknown` narrowing) for complete type safety. | `typescript` in `package.json` |
| `rust-clean` | **Rust Clean Code (Rust 2024)** | Idiomatic Rust standards: `let-else` guard clauses, zero `.unwrap()`, `thiserror` typed errors, Newtypes, and <200 lines. | `Cargo.toml` in project root |
| `python-clean` | **Python Clean Code (Python 3.12+)** | Modern Python: guard clauses (no nested ifs), strict typing (zero `Any`), uv, Ruff, Pyright, and Pydantic v2 boundaries. | `pyproject.toml` or `requirements.txt` |
| `valibot-validation` | **Valibot Schema Validation** | Boundary validation with modular Valibot schemas (`* as v from "valibot"`), inferred types, and courteous error messages. | `valibot` in `package.json` |
| `testing-vitest` | **Vitest Testing Standards** | Fast, deterministic test suites using Arrange-Act-Assert (AAA), behavioral testing, and lightweight in-memory fakes. | `vitest` in `package.json` |
| `hono` | **Hono Architecture (Valibot)** | Scalable Hono APIs with domain-split routes, isolated Actions, Valibot validators, and end-to-end Hono RPC types. | `hono` in `package.json` |
| `react-core` | **React Core Fundamentals** | Pure function components, immutable state updates, clean hook composition, stable list keys, and controlled inputs. | `react` in `package.json` |
| `react-advanced` | **React 19 Advanced & Compiler** | React Compiler auto-memoization, concurrent rendering (`useTransition`, `useDeferredValue`), `use()`, Actions, and RSC boundaries. | `react` in `package.json` |
| `react-create-page` | **React Page & View Architecture** | Declarative page coordinators (`<50` lines), custom domain hooks, isolated API actions, and Valibot + Formisch forms. | `react` in `package.json` |

---

## 📄 License

Released under the [MIT License](https://opensource.org/licenses/MIT) © [3-Lineas](https://3lineas.com/)
