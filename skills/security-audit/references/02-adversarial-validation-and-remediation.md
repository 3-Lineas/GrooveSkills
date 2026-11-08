# Adversarial Validation, Findings Schema & Root-Cause Remediation

Guides Phase 3 (Verification), Phase 4 (Disproof), and Phase 6 (Remediation) of the security audit.

---

## 1. Adversarial Disproof Protocol (Phases 3 & 4)

Candidate vulnerabilities found by Hunters must survive rigorous disproof before being confirmed. Assume the codebase is secure until proven broken:

1. **Check Outer Middleware & Guards**: Does an upstream auth guard, CORS policy, rate limiter, or reverse proxy prevent reaching the sink?
2. **Check Type Narrowing & Schemas**: Does a Valibot/Zod/Pydantic schema strip or reject the malicious payload before domain processing?
3. **Check Database Layer Invariants**: Does an ORM parameterization, prepared statement, or Supabase RLS policy neutralize the injection or unauthorized tenant access?
4. **Reproduce via Minimal Harness**: Formulate a concrete reproduction step or test harness demonstrating real exploitability without hypothetical leaps.
5. **Disposition**: If a candidate is disproven, mark it as `invalidated` with the exact rationale in audit logs; do NOT include it as an active finding.

---

## 2. Findings Schema (`findings.json`)

Record confirmed findings in `.grooveskills/memory/audits/YYYY-MM-DD-<scope>/findings.json`:

```json
{
  "auditDate": "YYYY-MM-DD",
  "scope": "entire-repository",
  "findings": [
    {
      "id": "SEC-001",
      "unitId": "UNIT-001",
      "title": "BOLA / IDOR in Invoice Retrieval",
      "severity": "high",
      "cwe": "CWE-639",
      "sourceFile": "src/modules/invoices/get-invoice.ts",
      "sourceLine": 42,
      "description": "Invoice retrieved solely by route parameter id without asserting tenant_id ownership.",
      "reproduction": "GET /api/invoices/inv_999 with User A session returns User B invoice.",
      "disproofAttempt": "Checked auth middleware; only validates token presence, does not verify tenant scope.",
      "remediationPlan": "Enforce tenant_id filter in DB query and verify via pure domain policy.",
      "status": "confirmed"
    }
  ]
}
```

### Severity Tiers
- `critical`: Remote code execution, arbitrary auth bypass, unauthenticated tenant data dump, unconstrained balance drain.
- `high`: BOLA/IDOR with unauthorized data mutation, privilege escalation, unauthenticated SSRF to cloud metadata.
- `medium`: BOPLA / Mass Assignment on non-critical fields, missing rate limits on sensitive endpoints, reflected XSS with strict CSP.
- `low`: Information disclosure via error banners, missing defense-in-depth headers, minor timing discrepancy.

---

## 3. Strix Root-Cause Remediation Protocol (Phase 6)

When remediating confirmed findings, adhere to strict principles:

1. **No Band-Aid Patches**: Never sanitize with fragile regex or add ad-hoc `if` checks in controllers. Fix the issue at the architecture boundary (e.g., schema validation, domain policy, RLS, parameterized query).
2. **Enforce Tenant Isolation in Queries**: Always append tenant scoping (`WHERE id = ? AND tenant_id = ?`) in persistence queries, never in-memory after fetching all records.
3. **Mandatory Regression PoC Test**:
   - Write an automated unit or integration test simulating the attack vector.
   - Run the test: assert it **FAILS** against the vulnerable code.
   - Apply the root-cause fix.
   - Run the test: assert it **PASSES** cleanly.
4. **Final Verification**: Run `validate-audit.mjs` and project test suites before marking the issue resolved.
