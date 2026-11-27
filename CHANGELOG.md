# Changelog

All notable changes to `@3lineas/grooveskills` are documented in this file.

For project-level version notes installed in your repository, see `.grooveskills/VERSIONS.md`.

- **v1.28.4**:
  - **Optional Agent Skip (`None`) & Release Changelog**: Added explicit `None (skip specialized agent profiles)` option in `promptAgentProfiles`, moved full release history to `CHANGELOG.md`, and trimmed `README.md` `Recent Release Highlights` to the latest 5 releases.
- **v1.28.3**:
  - **Specialized Agent Profiles (`CF-Turbo-Hono-Next`, `CF-Turbo-Hono-React`, `CF-Nextjs`)**: Added installable agent profiles in `agents/` with native Antigravity, Claude Code, and Gemini CLI frontmatter (`mainAgent: true`, `subagent: true`, full `tools:` allowlist, `commandExecutionPolicy: auto`), mandatory `.grooveskills/`-first + Bitacora workflow, 10 Golden Rules, and stack-specific folder architecture.
  - **Canonical Agent Store, Symlinks & Pre-Selection**: Stored canonical profiles in `.grooveskills/agents/`, linked them via relative symlinks to `.agents/agents/`, `.claude/agents/`, and `.gemini/agents/`, added `--agent-profiles` CLI flag, and placed agent selection before `promptSkills` to auto-preselect recommended stack skills.
  - **Optional Agent Skip (`None`)**: Added explicit `None (skip specialized agent profiles)` option in `promptAgentProfiles`.
- **v1.27.0**:
  - **Modern Web Guidance (`modern-web-guidance`)**: Added Google Chrome's `modern-web-guidance` skill under `Frameworks & UI` combining the live `pnpx modern-web-guidance@latest` catalog (200+ Baseline-verified HTML, CSS, CWV, and client JS guides) with 2 offline local references (`modern-web-primitives-and-baseline.md`, `grooveskills-web-adaptation.md`) enforcing zero `as any`, SSR guards, and `useId()`.
  - **Web Auto-Detection & Cross-References**: Auto-suggests `modern-web-guidance` for web frontend dependencies (`react`, `next`, `vinext`, `vue`, `svelte`, `astro`, `tailwindcss`, `vite`) and adds concise cross-references in `frontend-design` and `react-core`.
- **v1.26.0**:
  - **Dart & Flutter Skills Suite (`dart-clean`, `dart-testing`, `flutter-architecture`, `flutter-ui-layout`)**: Added 4 cohesive skills with deep `references/` consolidating Google's official `dart-lang/skills` and `flutter/agent-plugins` patterns with GrooveSkills rules: strict `dart analyze`, `sealed` ADTs, `extension type const`, Primary Constructors, `package:checks`, Riverpod (`Notifier`/`AsyncNotifier`) with pure atomic Actions, `go_router`, `l10n`, adaptive layouts, and WCAG `Semantics`.
  - **Dart & Flutter Stack Detection & Onboarding**: Added auto-detection for `pubspec.yaml` (`dart` and `flutter`), `lib/` source directories, and `dart` / `flutter` CLI commands.
- **v1.25.0**:
  - **Go 1.27 Skills Suite (`go-clean`, `go-concurrency-safety`, `go-testing`)**: Added 3 Go 1.27 skills covering atomic actions (1 DB query/file), generic `Pipeline`, `encoding/json/v2`, `uuid.NewV7()`, `errors.AsType[*AppError]`, `log/slog`, `errgroup` + `SetLimit`, goroutine leak profiling, and 4-tier testing (`t.Context()`, `b.Loop()`, `-race` + `goleak`).
  - **Wails v3 Desktop Architecture (`wails-architecture`)**: Added unified `wails-architecture` skill (mutually exclusive with `react-create-page`) enforcing pure Wails v3 APIs, thin Go bound services, IPC error sanitization, `@wailsio/runtime` events, and the GroovePack frontend bridge.
  - **Go & Wails v3 Stack Detection & Onboarding**: Added auto-detection for `go.mod`, `build/config.yml`, `frontend/package.json`, `frontend/tsconfig.json`, `packageManager: "go"`, and `wails3` / `go test -race -count=1 ./...` commands.
- **v1.24.0**:
  - **GroovePack `v1.6.0` Support (`serviceBinding`, `fallbackBaseUrl`, `getHeaders` & `ApiCallInput<T>`)**: Updated `groovepack-api`, `nextjs-architecture`, `groovepack-actions-and-auth.md`, and `vinext-cloudflare.md` to document `createHonoClient<AppType>(config)`, native Cloudflare Service Binding support (`serviceBinding` + `fallbackBaseUrl`), per-request `getHeaders`, and direct `Promise` support in `apiAction`.
- **v1.23.0**:
  - **Dedicated `GroovePack` Category & 4 Modular Skills**: Added `category` to `SkillMetadata`, grouped `prompts.groupMultiselect` in the CLI wizard, and introduced `groovepack-errors`, `groovepack-pipeline`, `groovepack-api`, and `groovepack-logger` (auto-suggested when `@3lineas/groovepack` is in `package.json`).
  - **GroovePack `v1.5.0` Support**: Replaced manual `AppError` templates with `@3lineas/groovepack/errors` (`createAppError` / `AppError`), documented all 3 `apiAction` modes (`ActionResponse<T>`, `fallback`, `throwOnError: true`), and fixed 3-arg `logger.*` calls and `RestApiClient` generics.
- **v1.22.0**:
  - **GroovePack `v1.3.0` Package Alignment**: Updated Next.js, React, Hono, Controller/D1, Error Handling, Testing, and Clean Architecture skills to use `@3lineas/groovepack` (`pnpm add @3lineas/groovepack`) with subpath exports and `@3lineas/groovepack/vite`.
  - **Complete `sonner` Removal & Direct Primitives**: Standardized on `@3lineas/groovepack/api-toast`, replaced manual `Logger` and `withD1Transaction` templates with direct package imports, and enforced single-runtime env vars (`NEXT_PUBLIC_GROOVEPACK_*` or `GROOVEPACK_*`).
- **v1.20.0**:
  - **Dedicated `world-class-engineering` Skill**: Added universal skill (auto-selected by default) enforcing World-Business-Grade root-cause solutions, clean ripple updates, and an explicit scope-down gate.
  - **Zero Tech-Debt Patches Rule**: Integrated mandatory **World-Business-Grade by Default (Zero Tech-Debt Patches)** directive into `AGENTS.md`/`CLAUDE.md`, `groove-harness`, `best-practices`, and `odd-ai`.
- **v1.18.1**:
  - **Strict Onboarding Scope & Stop Rule**: Added strict boundaries in `00-onboarding.md` forbidding feature/application code changes during onboarding, and mandating that the agent stop immediately once context is verified.
  - **Clean Copyable Onboarding & Update Prompts**: Redesigned CLI terminal prompts with an isolated top badge and raw copyable plain text without side border artifacts.
- **v1.18.0**:
  - **Semantic Version Traceability**: Persisted semantic version strings (e.g. `"1.18.0"`) in `.grooveskills/config.json`, keeping them updated on every run.
  - **Project Status CLI**: Added `grooveskills status [path] [--json]` to inspect installation health and detect version drift.
  - **Bitacora Daily Limit**: Enforced strict `<= 10 items per day` in `.grooveskills/bitacora/YYYY-MM.md` with mandatory bullet compaction.
- **v1.17.0**:
  - **Next.js & Vinext Server Architecture**: Added `nextjs-architecture` skill (100% Server Pages, initial data fetching via Server Actions, loading skeletons, and GroovePack pipeline).
  - **Interactive Skill Uninstallation**: Added automatic preselection of installed skills and clean removal of deselected skills across all agent directories.
- **v1.16.0**:
  - **1 DB Query/Mutation per Action**: Enforced isolated atomic Actions for all database queries.
  - **Mandatory Pipeline Chaining**: Replaced monolithic use-case actions with `Pipeline.send(context).through([...actions])` in routes.
- **v1.15.0**:
  - **Strict Atomicity Standard**: Enforced 1 method/function per file (<200 lines) and isolated domain types in `@/types/{domain}/`.
  - **Technical Layers with Domain Subfolders**: Banned monolithic root `src/domains/` or `src/controllers/` folders.
- **v1.14.0**:
  - **Standalone Zero-Footprint Security Audit**: Introduced `npx @3lineas/grooveskills audit` with 5 coverage units combining OWASP API and 17 NVIDIA SkillSpector categories without writing files to disk.
- **v1.13.0**:
  - **Relative Symlinks for Agent Skills**: Converted copied skill directories in `.agents/`, `.claude/`, and `.gemini/` to relative symbolic links (`../../.grooveskills/skills/<skill>`), preserving custom user skills.
