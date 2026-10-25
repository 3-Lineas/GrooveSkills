# GrooveSkills 🚀

> **Multi-Agent AI Skills & Architectural Standards Installer**  
> Empower your AI coding pairs (Antigravity, Claude Code, Cursor, Gemini) with your team's real-world architectural habits, clean code patterns, and non-negotiables.

---

## 🌟 Features

- **⚡ Zero Configuration (`npx @3lineas/grooveskills`)**: Run inside any project root to inspect the environment and synchronize AI skills instantly.
- **🎯 Smart Stack Detection**: Automatically inspects `package.json` dependencies and pre-selects matching skills (e.g. Hono, Valibot, React, Next.js).
- **🤖 Multi-Agent Compatibility**:
  - **Antigravity**: `.agents/skills/<skill-name>/`
  - **Claude Code**: `.claude/skills/<skill-name>/`
  - **Cursor IDE**: `.cursor/rules/<skill-name>.mdc` (auto-adapted to Cursor rules format)
  - **Gemini Code Assist**: `.gemini/skills/<skill-name>/`
- **✨ Interactive & Friendly CLI**: Clean terminal experience built with `@clack/prompts` and courteous, persuasive feedback.
- **🔗 Centralized Global Store & Symlinks**: Skills are synced globally to `~/.grooveskills/` and linked into local projects via symlinks. Updates to global skills instantly reflect across all your projects with zero file duplication.
- **🛡️ Battle-tested Architectural Standards**:
  - **Universal Best Practices**: Multi-language clean code (TypeScript, PHP, Dart, Rust, etc.), early returns, zero barrel files, strict typing, <200 lines per file.
  - **Hono API Architecture**: Independent routes by domain, isolated Actions layer, database queries exclusively inside Actions, strict Valibot validation, and Cloudflare/Hono RPC.

---

## 🚀 Usage

### 1. Interactive Mode (Recommended)

Run directly in the root of any project:

```bash
npx @3lineas/grooveskills
```

GrooveSkills will automatically:
1. Detect any active AI agent folders (`.agents`, `.claude`, `.cursor`, `.gemini`).
2. Scan your project dependencies (`package.json`) and pre-select the recommended skills.
3. Guide you through an interactive multi-select menu.
4. Install and configure the skills for all chosen AI agents.

---

### 2. Direct / Automated Mode (CI / Scripting)

Install specific skills for targeted agents without interactive prompts:

```bash
# Install specific skills for selected agents
npx @3lineas/grooveskills --skills best-practices hono --agents antigravity claude

# Automatically confirm overwrite of existing skills
npx @3lineas/grooveskills --skills best-practices hono --agents antigravity claude cursor gemini --yes
```

#### CLI Options

| Flag | Description | Example |
| :--- | :--- | :--- |
| `-s, --skills` | Space-separated list of skill IDs to install | `--skills best-practices hono` |
| `-a, --agents` | Target AI agents (`antigravity`, `claude`, `cursor`, `gemini`) | `--agents antigravity cursor` |
| `-y, --yes` | Automatically overwrite existing skills | `--yes` |
| `-h, --help` | Display command help and options | `--help` |
| `-V, --version` | Display the installed version of GrooveSkills | `--version` |

---

## 📦 Available Skills

| Skill ID | Name | Description | Suggested When |
| :--- | :--- | :--- | :--- |
| `best-practices` | **Universal Best Practices** | Multi-language clean code, early returns, no barrel files, strict typing, <200 lines. | **Always suggested by default** (Any language/file) |
| `hono` | **Hono Architecture (Valibot)** | Enterprise Hono standard: Valibot validation, Actions layer, RPC bindings, AppError. | Detected `hono`, `@hono/valibot-validator`, etc. |
| `react-core` | **React Core Fundamentals** | Opinionated React fundamentals: function components, JSX, immutable state, core hooks, lists, and controlled inputs. | Detected `react`, `react-dom` |
| `react-advanced` | **React 19 Advanced & Compiler Architecture** | React 19 platform features: React Compiler 1.0, concurrent rendering, `use()`, Actions, virtualization, and RSC boundaries. | Detected `react`, `react-dom` |
| `react-create-page` | **React Page & View Architecture** | Declarative page coordinators, domain hooks, isolated API actions, Valibot + Formisch forms, and atomic co-location. | Detected `react`, `react-dom` |

---

## 📄 License

MIT © [3-Lineas](https://github.com/3-Lineas)
