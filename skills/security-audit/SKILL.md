---
name: security-audit
description: Adversarial security audit, threat modeling, and trust-boundary verification combining Cloudflare 6-phase audits, NVIDIA SkillSpector agent/MCP static security, and Strix OWASP API & root-cause remediation.
---

# Security Audit & Adversarial Verification

A unified security framework blending **Cloudflare's 6-Phase Adversarial Audit**, **NVIDIA SkillSpector Agent/MCP Static Analysis**, and **Strix Evidence-Based Pentesting & Root-Cause Remediation**.

---

## 1. The Three Operating Levels

```text
[Level 1: Post-Task Security Gate] -> Automatic check after every Lane 2 task
[Level 2: Pre-Write Threat Check]   -> Mandatory threat boundary in Lane 3 specs
[Level 3: Full 6-Phase Audit]       -> On-demand deep adversarial engagement
```

- **Level 1 (Post-Task Security Gate)**: Triggered in Step 7 (`Verify`) of ODD. If the task diff touches trust boundaries (auth, routes, schemas, DB/RLS, payments, webhooks, IPC, crypto, or `SKILL.md`/`AGENTS.md`), verify defenses before closing.
- **Level 2 (Pre-Write Threat Check)**: Triggered during Lane 3 (`Spec`). Map trust boundaries, data flows, and authorization invariants before implementation.
- **Level 3 (Full 6-Phase Audit)**: On-demand comprehensive audit producing `coverage-ledger.json`, `findings.json`, and remediation plans with regression PoCs.

---

## 2. On-Demand Audit Workflow (The 6 Phases)

```text
[1. Recon] -> [2. Hunting] -> [3. Verification] -> [4. Disproof] -> [5. Ledger Audit] -> [6. Remediation]
```

1. **Phase 1: Reconnaissance & Ledger Initialization**:
   Read `.grooveskills/memory/context.md` first. Map all ingress boundaries, data stores, external APIs, and agents. Initialize `.grooveskills/memory/audits/YYYY-MM-DD-<scope>/coverage-ledger.json`.
2. **Phase 2: Hunter-Agent Execution**:
   For each ledger unit, load relevant domain references and execute targeted checks. Log candidates.
3. **Phase 3: Adversarial Verification**:
   Switch context to an independent skeptic persona. Validate candidate reproduction steps.
4. **Phase 4: Adversarial Disproof**:
   Actively attempt to invalidate the finding: check existing framework protections, sanitizers, or authorization invariants. Only proven vulnerabilities survive.
5. **Phase 5: Coverage Critic & Ledger Audit**:
   Verify every ledger unit reached a terminal status (`clean`, `vulnerable`, `mitigated`). Run `validate-audit.mjs`.
6. **Phase 6: Root-Cause Remediation & Regression PoC**:
   Formulate root-cause architectural fixes (never regex or superficial patches) and design automated regression tests that fail before and pass after the fix.

---

## 3. Modular Reference Matrix

Load references on demand based on the subsystems under audit:

| Domain Subsystem | Reference File | Focus Areas |
| :--- | :--- | :--- |
| **Recon & Coverage** | `references/01-recon-and-coverage-ledger.md` | Ledger schema, audit scope, Hunter and Critic duties |
| **Disproof & Fixes** | `references/02-adversarial-validation-and-remediation.md` | Disproof protocol, findings schema, Strix root-cause fixes |
| **Web APIs & Auth** | `references/03-web-api-auth-and-protocols.md` | BOLA/IDOR, BOPLA/Mass Assignment, JWT, CORS, Webhooks |
| **Client & IPC** | `references/04-client-desktop-and-ipc.md` | DOM XSS, Next.js RSC leaks, Tauri v2 / IPC isolation |
| **Data & Cloud** | `references/05-data-isolation-cloud-and-supply-chain.md` | Supabase RLS, tenant leaks, Payments (Stripe/MP), CI/CD |
| **AI, Skills & MCP** | `references/06-ai-llm-mcp-and-skillspector.md` | 17 SkillSpector categories, Prompt Injection, MCP poisoning |
| **Memory & Crypto** | `references/07-memory-safety-crypto-and-availability.md` | Rust `unsafe`, SSRF, race conditions, ReDoS, spend DoS |

---

## 4. Verification Scripts

- **`scripts/validate-audit.mjs`**: Validates `coverage-ledger.json` and `findings.json` structure, terminal states, and cross-references.
- **`scripts/scan-skill-integrity.mjs`**: Evaluates `SKILL.md`, `AGENTS.md`, and MCP configs against NVIDIA SkillSpector rules (taint tracking, hidden prompt injection, unpinned deps, dangerous calls).
