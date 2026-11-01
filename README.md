# GrooveSkills 🚀

> **Multi-Agent AI Skills & Architectural Standards Installer**  
> Empower your AI coding pairs (Antigravity, Claude Code, Cursor, Gemini) with your team's real-world architectural habits, clean code patterns, and an encapsulated project control plane.

---

## 🌟 Features

- **⚡ Zero Configuration (`npx @3lineas/grooveskills`)**: Run inside any project root to inspect the environment and synchronize AI skills instantly.
- **🎯 Smart Stack Detection**: Automatically inspects `package.json` dependencies and pre-selects matching skills (e.g. Hono, Valibot, React, Next.js).
- **🛡️ Encapsulated Project Harness (`.grooveskills/`)**:
  - **Context & Architecture (`memory/context.md`)**: Instant architectural orientation for your AI agent.
  - **Architecture Decision Records (`memory/decisions.md`)**: Clean, append-only log of technical choices and rationale.
  - **Task & Evidence Tracking (`memory/tasks/`)**: Feature tasks tracked with real observed proof (tests, typecheck, builds) before completion.
  - **3-Lane Execution Discipline**: Guides agents through *Answer* (read-only), *Task* (direct implementation), and *Spec* (complex architecture review).
- **🔗 Local Project Store & Relative Symlinks**:
  - All installed skills and generated Cursor `.mdc` rules are stored directly inside `<project>/.grooveskills/`.
  - Agent directories (`.agents`, `.claude`, `.cursor`, `.gemini`) use **relative symlinks** (`../../.grooveskills/...`), making the repository **100% portable across teams and git checkouts**.
- **🤖 Multi-Agent Compatibility**:
  - **Antigravity**: `.agents/skills/<skill-name>/`
  - **Claude Code**: `.claude/skills/<skill-name>/`
  - **Cursor IDE**: `.cursor/rules/<skill-name>.mdc` (auto-adapted from markdown to Cursor `.mdc`)
  - **Gemini Code Assist**: `.gemini/skills/<skill-name>/`
- **✨ Interactive & Friendly CLI**: Clean terminal wizard built with `@clack/prompts` offering interactive skill selection, agent targeting, and harness initialization.

---

## 📂 Project Architecture

When GrooveSkills is initialized in a repository, it keeps all state cleanly encapsulated inside `.grooveskills/` without cluttering the project root:

```text
my-project/
├── .grooveskills/
│   ├── config.json                  # Project skills & agents manifest
│   ├── skills/                      # Local copy of selected skills
│   │   ├── best-practices/
│   │   └── groove-harness/
│   ├── cursor-rules/                # Local .mdc rules for Cursor IDE
│   │   ├── best-practices.mdc
│   │   └── groove-harness.mdc
│   └── memory/                      # Active project memory
│       ├── context.md               # Stack, conventions & key commands
│       ├── decisions.md             # Architecture Decision Records (ADR)
│       └── tasks/
│           └── _template.md         # Template for feature intent & evidence
├── .agents/skills/*                 # Relative symlinks -> ../../.grooveskills/skills/*
├── .claude/skills/*                 # Relative symlinks -> ../../.grooveskills/skills/*
├── .gemini/skills/*                 # Relative symlinks -> ../../.grooveskills/skills/*
├── .cursor/rules/*.mdc              # Relative symlinks -> ../../.grooveskills/cursor-rules/*.mdc
└── AGENTS.md / CLAUDE.md            # Minimal harness pointer block <!-- grooveskills:harness -->
```

---

## 🚀 Usage

### 1. Interactive Mode (Recommended)

Run directly in the root of any project:

```bash
npx @3lineas/grooveskills
```

GrooveSkills will automatically:
1. Detect any active AI agent folders (`.agents`, `.claude`, `.cursor`, `.gemini`).
2. Scan your project dependencies (`package.json`) and pre-select recommended skills.
3. Prompt whether you want to initialize the **GrooveSkills Harness** in `.grooveskills/`.
4. Install skills, generate agent configurations, and link everything via portable relative symlinks.

---

### 2. Direct / Automated Mode (CI / Scripting)

Install specific skills or the harness directly without interactive prompts:

```bash
# Install skills and initialize the project harness for selected agents
npx @3lineas/grooveskills --skills best-practices hono --agents antigravity claude --harness -y

# Initialize only the harness across all supported agents
npx @3lineas/grooveskills --harness --agents antigravity claude cursor gemini -y

# Skip harness initialization when installing skills
npx @3lineas/grooveskills --skills react-core --agents cursor --no-harness -y
```

#### CLI Options

| Flag | Description | Example |
| :--- | :--- | :--- |
| `-s, --skills <skills...>` | Specific skill IDs to install | `--skills best-practices hono` |
| `-a, --agents <agents...>` | Target AI agents (`antigravity`, `claude`, `cursor`, `gemini`) | `--agents antigravity cursor` |
| `--harness` | Initialize or update GrooveSkills project harness in `.grooveskills/` | `--harness` |
| `--no-harness` | Explicitly skip harness initialization | `--no-harness` |
| `-y, --yes` | Automatically overwrite existing skills | `-y` |
| `-h, --help` | Display command help and options | `--help` |
| `-V, --version` | Display installed version | `--version` |

---

## 📦 Available Skills

| Skill ID | Name | Description | Suggested When |
| :--- | :--- | :--- | :--- |
| `groove-harness` | **GrooveSkills Harness** | Lightweight project control plane, context memory, and 3-lane task execution (Answer, Task, Spec). | Installed automatically with `--harness` or manually. |
| `best-practices` | **Universal Best Practices** | Multi-language clean code, early returns, no barrel files, strict typing, <200 lines. | **Always suggested by default** (Any language/file) |
| `hono` | **Hono Architecture (Valibot)** | Enterprise Hono standard: Valibot validation, Actions layer, RPC bindings, AppError. | Detected `hono`, `@hono/valibot-validator`, etc. |
| `react-core` | **React Core Fundamentals** | Opinionated React fundamentals: function components, JSX, immutable state, core hooks, lists, and controlled inputs. | Detected `react`, `react-dom` |
| `react-advanced` | **React 19 Advanced & Compiler Architecture** | React 19 platform features: React Compiler 1.0, concurrent rendering, `use()`, Actions, virtualization, and RSC boundaries. | Detected `react`, `react-dom` |
| `react-create-page` | **React Page & View Architecture** | Declarative page coordinators, domain hooks, isolated API actions, Valibot + Formisch forms, and atomic co-location. | Detected `react`, `react-dom` |

---

## 📄 License

MIT © [3-Lineas](https://github.com/3-Lineas)
