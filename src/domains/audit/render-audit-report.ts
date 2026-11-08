import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import picocolors from "picocolors";
import type {
  AuditCoverageUnit,
  AuditFinding,
  AuditReconSummary,
} from "@/types/audit.types";

export function renderAuditReportToTerminal(
  reconSummary: AuditReconSummary,
  units: AuditCoverageUnit[],
  findings: AuditFinding[],
  prompt: string
): void {
  console.log(
    picocolors.bold(
      picocolors.cyan("\n═════════════════════════════════════════════════════════════════")
    )
  );
  console.log(
    picocolors.bold(
      picocolors.cyan("       GROOVESKILLS ZERO-FOOTPRINT ADVERSARIAL SECURITY AUDIT     ")
    )
  );
  console.log(
    picocolors.bold(
      picocolors.cyan("═════════════════════════════════════════════════════════════════\n")
    )
  );

  console.log(picocolors.dim(`Target: ${reconSummary.targetPath}`));
  console.log(picocolors.dim(`Project: ${reconSummary.projectName} (${reconSummary.packageManager})`));
  console.log(
    picocolors.dim(`Stack: ${reconSummary.detectedDependencies.join(", ") || "None detected"}\n`)
  );

  console.log(picocolors.bold("Coverage Units:"));
  for (const unit of units) {
    const statusColor =
      unit.status === "clean"
        ? picocolors.green("✔ CLEAN")
        : picocolors.red("✖ VULNERABLE");
    console.log(
      ` [${statusColor}] ${picocolors.bold(unit.id)}: ${unit.name} (${unit.files.length} files)`
    );
  }

  console.log(picocolors.bold("\nStatic Scan Findings:"));
  if (findings.length === 0) {
    console.log(
      picocolors.green(" ✔ Zero preliminary static vulnerabilities identified.")
    );
  } else {
    for (const finding of findings) {
      const severityColor =
        finding.severity === "critical"
          ? picocolors.bgRed(picocolors.white(` ${finding.severity.toUpperCase()} `))
          : finding.severity === "high"
            ? picocolors.red(`[${finding.severity.toUpperCase()}]`)
            : picocolors.yellow(`[${finding.severity.toUpperCase()}]`);

      console.log(
        `\n • ${severityColor} ${picocolors.bold(finding.title)} (${finding.cwe})`
      );
      console.log(`   Source: ${picocolors.cyan(`${finding.sourceFile}:${finding.sourceLine}`)}`);
      console.log(`   Fix: ${finding.remediationPlan}`);
    }
  }

  console.log(
    picocolors.bold(
      picocolors.magenta("\n─────────────────────────────────────────────────────────────────")
    )
  );
  console.log(
    picocolors.bold(
      picocolors.magenta("   COPY & PASTE AUDIT PROMPT FOR YOUR AI AGENT (6 PHASES)        ")
    )
  );
  console.log(
    picocolors.bold(
      picocolors.magenta("─────────────────────────────────────────────────────────────────\n")
    )
  );
  console.log(prompt);
  console.log(
    picocolors.bold(
      picocolors.magenta("─────────────────────────────────────────────────────────────────\n")
    )
  );
}

export function exportAuditArtifacts(
  outputDirectory: string,
  auditDate: string,
  scope: string,
  units: AuditCoverageUnit[],
  findings: AuditFinding[]
): string[] {
  mkdirSync(outputDirectory, { recursive: true });

  const ledgerPath = join(outputDirectory, "coverage-ledger.json");
  const findingsPath = join(outputDirectory, "findings.json");
  const reportPath = join(outputDirectory, "REPORT.md");

  const ledgerPayload = {
    auditDate,
    scope,
    auditor: "grooveskills-security-audit",
    units,
  };

  const findingsPayload = {
    auditDate,
    scope,
    findings,
  };

  const reportMarkdown = `# Security Audit Report
- **Date**: ${auditDate}
- **Scope**: ${scope}
- **Audited Units**: ${units.length}
- **Findings Count**: ${findings.length}

## Coverage Summary
${units.map((unit) => `- **[${unit.id}] ${unit.name}**: ${unit.status.toUpperCase()} (${unit.files.length} files)`).join("\n")}

## Findings Detail
${
  findings.length > 0
    ? findings
        .map(
          (finding) =>
            `### [${finding.id}] ${finding.title}\n- **Severity**: ${finding.severity.toUpperCase()}\n- **CWE**: ${finding.cwe}\n- **Location**: \`${finding.sourceFile}:${finding.sourceLine}\`\n- **Description**: ${finding.description}\n- **Reproduction**: ${finding.reproduction}\n- **Disproof Attempt**: ${finding.disproofAttempt}\n- **Remediation Plan**: ${finding.remediationPlan}\n`
        )
        .join("\n")
    : "Zero confirmed vulnerabilities detected."
}
`;

  writeFileSync(ledgerPath, JSON.stringify(ledgerPayload, null, 2), "utf-8");
  writeFileSync(findingsPath, JSON.stringify(findingsPayload, null, 2), "utf-8");
  writeFileSync(reportPath, reportMarkdown, "utf-8");

  return [ledgerPath, findingsPath, reportPath];
}
