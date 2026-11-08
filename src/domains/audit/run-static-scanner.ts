import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { AUDIT_DETECTION_RULES } from "@/domains/audit/audit-detection-rules";
import type {
  AuditCoverageUnit,
  AuditDetectionRule,
  AuditFinding,
} from "@/types/audit.types";

function isTestFilePath(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return (
    lower.includes(".test.") ||
    lower.includes(".spec.") ||
    lower.includes("__tests__") ||
    lower.includes("fixtures") ||
    lower.includes("mocks")
  );
}

function evaluateRuleOnContent(
  rule: AuditDetectionRule,
  content: string,
  relativeFilePath: string,
  unitId: string,
  findingIndex: number
): AuditFinding | null {
  if (rule.skipTestFiles && isTestFilePath(relativeFilePath)) {
    return null;
  }

  const match = rule.pattern.exec(content);
  if (!match) {
    return null;
  }

  if (rule.disproofPattern && rule.disproofPattern.test(content)) {
    return null;
  }

  const matchIndex = match.index;
  const linesBeforeMatch = content.slice(0, matchIndex).split("\n");
  const sourceLine = linesBeforeMatch.length;

  const findingId = `SEC-${String(findingIndex).padStart(3, "0")}`;

  return {
    id: findingId,
    unitId,
    title: rule.title,
    severity: rule.severity,
    cwe: rule.cwe,
    sourceFile: relativeFilePath,
    sourceLine,
    description: rule.description,
    reproduction: rule.reproduction,
    disproofAttempt: rule.disproofPattern
      ? "Evaluated compensatory control pattern; no protective mechanism detected."
      : "Direct static pattern confirmed without mitigating context.",
    remediationPlan: rule.remediationPlan,
    status: "confirmed",
  };
}

export function runStaticScanner(
  targetPath: string,
  units: AuditCoverageUnit[]
): {
  updatedUnits: AuditCoverageUnit[];
  findings: AuditFinding[];
} {
  const findings: AuditFinding[] = [];
  const updatedUnits: AuditCoverageUnit[] = [];

  for (const unit of units) {
    let unitHasFindings = false;

    for (const relativeFile of unit.files) {
      const fullPath = join(targetPath, relativeFile);
      if (!existsSync(fullPath)) {
        continue;
      }

      let content = "";
      try {
        content = readFileSync(fullPath, "utf-8");
      } catch {
        continue;
      }

      const fileExtension = extname(relativeFile).toLowerCase();

      for (const rule of AUDIT_DETECTION_RULES) {
        if (!rule.fileExtensions.includes(fileExtension)) {
          continue;
        }

        const candidate = evaluateRuleOnContent(
          rule,
          content,
          relativeFile,
          unit.id,
          findings.length + 1
        );

        if (!candidate) {
          continue;
        }

        findings.push(candidate);
        unitHasFindings = true;
      }
    }

    updatedUnits.push({
      ...unit,
      status: unitHasFindings ? "vulnerable" : "clean",
      notes: unitHasFindings
        ? "Findings identified during multi-domain static scan"
        : "Clean: no static pattern violations detected",
    });
  }

  return { updatedUnits, findings };
}
