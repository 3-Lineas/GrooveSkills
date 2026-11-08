# Reconnaissance & Coverage Ledger Protocol

Guides Phase 1 (Reconnaissance) and Phase 2 (Hunting) of the adversarial security audit.

---

## 1. Zero Project Re-Scanning Reconnaissance

1. **Step 1**: Read `.grooveskills/memory/context.md` and `decisions.md` first. Identify project framework, language, entrypoints, and third-party services.
2. **Step 2**: Inspect manifest files (`package.json`, `Cargo.toml`, `pyproject.toml`) to determine trust boundaries.
3. **Step 3**: Identify ingress points:
   - HTTP/REST/RPC routes and endpoints.
   - Background queue consumers, cron triggers, webhook handlers.
   - Desktop IPC commands (Tauri `#[tauri::command]`, Electron handlers).
   - Agent hooks, `SKILL.md` files, and MCP tool definitions.

---

## 2. Coverage Ledger Schema (`coverage-ledger.json`)

Store the ledger in `.grooveskills/memory/audits/YYYY-MM-DD-<scope>/coverage-ledger.json`:

```json
{
  "auditDate": "YYYY-MM-DD",
  "scope": "entire-repository | path/to/module",
  "auditor": "security-audit-agent",
  "units": [
    {
      "id": "UNIT-001",
      "name": "Auth Router Endpoints",
      "category": "web-api",
      "files": ["src/modules/auth/auth-router.ts"],
      "referenceUsed": "references/03-web-api-auth-and-protocols.md",
      "status": "pending",
      "notes": ""
    }
  ]
}
```

### Ledger Unit Status Lifecycle
- `pending`: Unit identified but not yet audited.
- `in-progress`: Hunter agent currently auditing the unit.
- `clean`: Audited across relevant domains; zero verifiable findings.
- `vulnerable`: Audited with one or more findings validated in `findings.json`.
- `mitigated`: Vulnerability acknowledged with existing compensatory controls.

---

## 3. Hunter-Agent Execution Rules

- **Dedicated Focus**: Audit one unit at a time against its matching domain reference.
- **Trace Taint Flows**: Track untrusted input from the entrypoint to sinks (database query, filesystem, shell execution, HTML render, external HTTP call).
- **Surface Candidate Findings**: For each suspected vulnerability, document:
  1. Entrypoint and affected parameter.
  2. Complete code trace from source to sink.
  3. Plausible attack vector and business impact.
- **Do Not Self-Validate**: Hunters identify candidate issues; verification and disproof must occur under an independent adversarial mindset in Phases 3 and 4.

---

## 4. Coverage Critic Responsibilities (Phase 5)

Before concluding the audit, the Coverage Critic role verifies:
1. Every source file touching trust boundaries is mapped to at least one unit.
2. No unit remains in `pending` or `in-progress` status.
3. Every finding references a valid unit ID in `coverage-ledger.json`.
4. Run `node skills/security-audit/scripts/validate-audit.mjs <audit-dir>` to assert zero validation errors.
