# Skill Authoring Guide for AI Agents

This guide defines the standard recipe for any AI agent (Antigravity, Claude, Cursor, Gemini) writing or updating skills in **GrooveSkills**.

---

## 1. Golden Rules (Non-negotiable)

1. **Strict Typing Everywhere (Zero `any`, Zero `dynamic`)**:
   - Explicit types for every parameter, property, and return value.
   - Forbid `any` in TypeScript. Forbid `dynamic` in Dart. Require strict typing in PHP 8.2+ and Rust.
2. **Official Validation Library: Valibot**:
   - In TypeScript, always use **Valibot** (`* as v from "valibot"`).
   - Never use Zod.
3. **Mandatory Path Aliases (`@/...`)**:
   - Avoid deep relative paths (`../../..`). Always use absolute path aliases where supported.
4. **Zero Barrel Files**:
   - Never create `index.ts` files that re-export symbols. Import directly from the defining file.
5. **Hard File Size Limit: 200 Lines**:
   - Every file must stay under 200 lines. Split growing files into atomic domain modules.
6. **Early Return / Guard Clauses**:
   - Never nest `if` statements. Validate preconditions early and exit fast.
7. **Courteous, Persuasive, and Professional Communication**:
   - User-facing messages must be polite, encouraging, sales-oriented, and professional in English.

---

## 2. Mandatory `SKILL.md` File Anatomy

Every skill must be located at `skills/{skill-name}/SKILL.md` with:

### YAML Frontmatter
```yaml
---
name: {skill-name}
description: Concise description. TRIGGER when user mentions {keywords}, imports from '{package}', or modifies files matching '{patterns}'.
---
```

### Required Sections
1. **# {Skill Name}**: Title and scope.
2. **## Triggers & Activation**: Explicit activation conditions.
3. **## Golden Rules**: Architectural constraints specific to the framework.
4. **## Architecture & Taxonomy**: ASCII folder structure and responsibilities.
5. **## Canonical Implementation**: Real-world typed code without `any`, using Valibot and aliases.
6. **## Error Handling & Logging**: Integration with `AppError` and structured `Logger`.
7. **## Standard Response**: Unified `ActionResponse<T>` contract.

---

## 3. Reusable Templates (`templates/`)

Templates must reside in `skills/{skill-name}/templates/` and satisfy:
- Strictly under 200 lines per file.
- Single responsibility.
- Zero barrel files.
- Absolute path aliases (`@/...`).
- Valibot for schema validation.
