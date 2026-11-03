---
name: docs-standards
description: Comprehensive documentation standards: English documentation rule, strict relative POSIX links, Mermaid diagram syntax rules, ADR lifecycle, clean Markdown formatting, and intent-focused code docstrings. TRIGGER when writing, structuring, or updating technical docs, README files, architectural guides, ADRs, Mermaid diagrams, or in-code docstrings.
---

# Technical Documentation Standards

Authoritative standard for technical documentation, architectural specifications, markdown files, and in-code docstrings across projects.

---

## 1. Core Principles

1. **All Technical Documentation in English**:
   - Internal technical guides, README files, ADRs, architecture specs, code comments, and docstrings must be written exclusively in English.
   - User-facing application microcopy remains governed by project localization rules (e.g. `ux-writing`), but technical documentation is English-only.

2. **Strict Relative POSIX Paths**:
   - When referencing other files, specs, schemas, or tests within documentation, ALWAYS use relative POSIX paths (`./path/to/file.md` or `../other/file.md`).
   - Never use absolute filesystem paths (`/Users/...`, `C:\...`) or IDE-specific virtual URI protocols.
   - Always verify that relative links resolve correctly from the containing document's directory.

3. **Document the "Why", Not the "What"**:
   - Never describe literal syntax (e.g., `// loop through items` or `// sets age to 20`).
   - Document business constraints, invariant assumptions, edge case rationale, architectural trade-offs, and failure expectations.
   - Delete dead code, commented-out blocks, and speculative notes immediately.

4. **Hard Limit of <200 Lines Per File**:
   - Split broad specifications or long documents into concise primary manifests (`SKILL.md`, `README.md`) and focused modular topic files under `./references/` or `./docs/`.

---

## 2. Documentation Architecture & Directory Layout

Organize complex documentation sets into modular topic documents:

```text
docs/
├── architecture/
│   ├── overview.md                  # High-level system diagram and component boundaries (<150 lines)
│   └── adr/
│       ├── 0001-init-stack.md       # Individual decision record (<100 lines)
│       └── 0002-event-bus.md        # Modular decision record (<100 lines)
├── guides/
│   ├── local-setup.md               # Prerequisites and bootstrap guide (<120 lines)
│   └── testing-strategy.md          # Test matrices, fixtures, and CI workflows (<140 lines)
└── references/
    └── api-contracts.md             # Data transfer payloads and external specs (<180 lines)
```

Link files using explicit relative paths:
- From `docs/architecture/overview.md` to an ADR: `[ADR 0001](./adr/0001-init-stack.md)`
- From `docs/architecture/adr/0002-event-bus.md` to architecture overview: `[Overview](../overview.md)`

---

## 3. Mermaid Diagrams Best Practices

Diagrams clarify systems only when syntactically resilient. Always enforce:

1. **Direction**: Use explicit layout directions (`flowchart TD` or `flowchart LR`).
2. **Safe Quoting**: Always wrap node text and edge labels containing punctuation, brackets, parentheses, or spaces inside double quotes:
   - `id1["Service A (v2.1)"] -->|"POST /events"| id2["Worker Engine"]`
3. **Escaping**: Never leave unescaped curly braces `{}` or square brackets `[]` raw inside node bodies.
4. **Subgraphs**: Assign explicit identifier tokens to subgraphs:
   ```mermaid
   flowchart LR
     subgraph CoreDomain["Domain Layer"]
       Action["ProcessPaymentAction"]
     end
   ```

*Deep reference*: See [./references/relative-paths-and-diagrams.md](./references/relative-paths-and-diagrams.md) for full syntax and escaping guidelines.

---

## 4. Architecture Decision Records (ADR)

Document critical architectural forks before or during implementation:

- **State Lifecycle**: `Proposed` -> `Accepted` -> `Superseded by ADR-XXXX` or `Deprecated`.
- **Structure**: Title, Status, Context, Decision, Consequences (Positive, Negative, Neutral).
- **Append-only log**: Maintain an index table or individual timestamped files in `./docs/architecture/adr/`.

*Deep reference*: See [./references/adr-template-and-lifecycle.md](./references/adr-template-and-lifecycle.md) for templates and lifecycle rules.

---

## 5. In-Code Comments and Docstrings

Apply standard formatters and focus on architectural context:

- **TypeScript / JavaScript**: Use JSDoc / TSDoc (`/** ... */`) above exported symbols.
- **Python**: Use PEP 257 docstrings (`"""..."""`) on functions, modules, and classes.
- **Rust**: Use `///` outer doc comments for items and `//!` for module-level docs.
- **No obvious commentary**: If the function signature `getUserById(id: string)` already communicates the mechanics, only document non-obvious errors, side-effects, or performance implications.

*Deep reference*: See [./references/code-comments-and-docstrings.md](./references/code-comments-and-docstrings.md) for concrete language examples and anti-patterns.

---

## 6. Clean Markdown Formatting & Alerts

- Use standard GitHub markdown alert callouts:
  ```markdown
  > [!NOTE]
  > Informational notes highlighting context.

  > [!WARNING]
  > Critical operational caveats, breaking changes, or deprecations.
  ```
- Use consistent heading hierarchies (`#` -> `##` -> `###`). Never skip heading levels.
- Format tables with clear header alignment (`| :--- | :--- | :---: |`).
