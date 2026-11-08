import { existsSync } from "node:fs";
import { resolve } from "node:path";
import picocolors from "picocolors";
import { discoverAuditUnits } from "@/domains/audit/discover-audit-units";
import { runStaticScanner } from "@/domains/audit/run-static-scanner";
import { buildStandaloneAuditPrompt } from "@/domains/audit/build-standalone-audit-prompt";
import {
  exportAuditArtifacts,
  renderAuditReportToTerminal,
} from "@/domains/audit/render-audit-report";
import type { AuditRunOptions, AuditRunResult } from "@/types/audit.types";

function formatCurrentAuditDate(): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function runSecurityAudit(
  options: AuditRunOptions
): Promise<AuditRunResult> {
  const targetPath = resolve(process.cwd(), options.targetPath);
  if (!existsSync(targetPath)) {
    throw new Error(`Target path does not exist or is not accessible: ${targetPath}`);
  }
  const auditDate = formatCurrentAuditDate();

  const { reconSummary, units: initialUnits } = discoverAuditUnits(targetPath);
  const { updatedUnits, findings } = runStaticScanner(targetPath, initialUnits);

  const prompt = buildStandaloneAuditPrompt(
    reconSummary,
    updatedUnits,
    findings,
    options.language ?? "es"
  );

  renderAuditReportToTerminal(reconSummary, updatedUnits, findings, prompt);

  let exportedArtifacts: string[] | undefined;
  if (options.outputDirectory) {
    const resolvedOutputDir = resolve(process.cwd(), options.outputDirectory);
    exportedArtifacts = exportAuditArtifacts(
      resolvedOutputDir,
      auditDate,
      reconSummary.projectName,
      updatedUnits,
      findings
    );
    console.log(
      picocolors.green(`\n✔ Exported audit artifacts to: ${resolvedOutputDir}`)
    );
  }

  return {
    auditDate,
    scope: reconSummary.projectName,
    reconSummary,
    units: updatedUnits,
    findings,
    prompt,
    exportedArtifacts,
  };
}
