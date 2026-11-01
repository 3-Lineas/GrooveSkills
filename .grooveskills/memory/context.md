# Project Context & Architecture

This file provides AI agents with instant architectural orientation for this project.

## 1. Stack & Dependencies
- `@clack/prompts`
- `commander`
- `picocolors`
- `valibot`
- `@types/node`
- `tsup`
- `typescript`

## 2. Directory Structure Conventions
- Follow single-responsibility per file (<200 lines).
- Maintain direct imports with path aliases; avoid barrel files.
- Keep domain boundaries explicit and clean.

## 3. Essential Commands
- Build: Refer to `package.json` scripts.
- Typecheck: Refer to TypeScript configuration.
- Tests: Refer to test runner configuration.
