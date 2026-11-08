import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveSkillsSourceRoot } from "@/domains/installer/resolve-skills-source";
import type {
  AuditCoverageUnit,
  AuditFinding,
  AuditReconSummary,
} from "@/types/audit.types";

const PROMPT_HEADERS: Record<string, { title: string; intro: string }> = {
  es: {
    title: "Auditoría de Seguridad Adversaria (6 Fases)",
    intro: "Ejecuta una auditoría de seguridad adversaria profunda de 6 fases sobre este proyecto.",
  },
  en: {
    title: "Adversarial Security Audit (6 Phases)",
    intro: "Execute a thorough 6-phase adversarial security audit on this project.",
  },
  pt: {
    title: "Auditoria de Segurança Adversária (6 Fases)",
    intro: "Execute uma auditoria de segurança adversária profunda de 6 fases neste projeto.",
  },
  it: {
    title: "Audit di Sicurezza Avversaria (6 Fasi)",
    intro: "Esegui un audit di sicurezza avversaria approfondito in 6 fasi su questo progetto.",
  },
  fr: {
    title: "Audit de Sécurité Adversariale (6 Phases)",
    intro: "Exécutez un audit de sécurité adversarial approfondi en 6 phases sur ce projet.",
  },
};

function readSkillReference(referenceRelativePath: string): string {
  try {
    const skillsRoot = resolveSkillsSourceRoot();
    const fullPath = join(skillsRoot, "security-audit", referenceRelativePath);
    if (!existsSync(fullPath)) {
      return "";
    }
    return readFileSync(fullPath, "utf-8");
  } catch {
    return "";
  }
}

export function buildStandaloneAuditPrompt(
  reconSummary: AuditReconSummary,
  units: AuditCoverageUnit[],
  findings: AuditFinding[],
  language = "es"
): string {
  const languageConfig =
    PROMPT_HEADERS[language] ?? PROMPT_HEADERS.es!;
  const referencesText = [
    "01-recon-and-coverage-ledger.md",
    "02-adversarial-validation-and-remediation.md",
    "03-web-api-auth-and-protocols.md",
    "04-client-desktop-and-ipc.md",
    "05-data-isolation-cloud-and-supply-chain.md",
    "06-ai-llm-mcp-and-skillspector.md",
    "07-memory-safety-crypto-and-availability.md",
  ]
    .map((fileName) => {
      const content = readSkillReference(join("references", fileName));
      if (!content) {
        return "";
      }
      return `### Reference: ${fileName}\n\`\`\`markdown\n${content.trim()}\n\`\`\``;
    })
    .filter(Boolean)
    .join("\n\n");

  const unitsText = units
    .map((unit) => {
      const displayFiles =
        unit.files.length > 15
          ? `${unit.files.slice(0, 15).join(", ")} ... (+${unit.files.length - 15} more files)`
          : unit.files.join(", ") || "No files";
      return `- **[${unit.id}] ${unit.name}** (${unit.category}) -> ${displayFiles}`;
    })
    .join("\n");

  const findingsText =
    findings.length > 0
      ? findings
          .map(
            (finding) =>
              `- **[${finding.id}] ${finding.title}** (${finding.severity.toUpperCase()}, ${finding.cwe}) in \`${finding.sourceFile}:${finding.sourceLine}\`\n  *Description*: ${finding.description}\n  *Suggested Fix*: ${finding.remediationPlan}`
          )
          .join("\n")
      : "- Zero preliminary static vulnerabilities detected.";

  return `# ${languageConfig.title}
${languageConfig.intro}

## 1. Project Context & Ingress Surface
- **Project Name**: ${reconSummary.projectName}
- **Package Manager**: ${reconSummary.packageManager}
- **Detected Stack**: ${reconSummary.detectedDependencies.join(", ") || "None"}

## 2. Ingress & Coverage Units
${unitsText}

## 3. Preliminary Static Scanner Findings
${findingsText}

## 4. The 6 Adversarial Audit Phases
1. **Phase 1 (Reconnaissance & Ledger)**: Validate trust boundaries, routes, IPC endpoints, and agent hooks.
2. **Phase 2 (Hunting)**: Hunt for BOLA/IDOR, BOPLA, RLS tenant isolation, prototype pollution, prompt injection, and race conditions.
3. **Phase 3 (Adversarial Verification)**: Switch to an independent skeptic persona and construct minimal reproduction proofs for candidate findings.
4. **Phase 4 (Adversarial Disproof)**: Actively attempt to disprove candidates using compensatory controls (outer middleware, Valibot schemas, database RLS).
5. **Phase 5 (Coverage Critic)**: Confirm all ledger units have terminal statuses (clean, vulnerable, mitigated) without unverified candidates.
6. **Phase 6 (Root-Cause Remediation & PoC)**: Provide architectural fixes and automated regression tests that fail on vulnerable code and pass after the fix.

## 5. Domain Audit Knowledge Base
${referencesText}
`;
}
