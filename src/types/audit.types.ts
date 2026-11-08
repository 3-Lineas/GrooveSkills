export type AuditUnitCategory =
  | "web-api"
  | "client-ipc"
  | "data-cloud"
  | "ai-mcp-skills"
  | "memory-crypto-exec";

export type AuditUnitStatus = "clean" | "vulnerable" | "mitigated";

export type AuditSeverity = "critical" | "high" | "medium" | "low";

export type FindingStatus = "confirmed" | "invalidated" | "remediated";

export interface AuditCoverageUnit {
  id: string;
  name: string;
  category: AuditUnitCategory;
  files: string[];
  referenceUsed: string;
  status: AuditUnitStatus;
  notes: string;
}

export interface AuditFinding {
  id: string;
  unitId: string;
  title: string;
  severity: AuditSeverity;
  cwe: string;
  sourceFile: string;
  sourceLine: number;
  description: string;
  reproduction: string;
  disproofAttempt: string;
  remediationPlan: string;
  status: FindingStatus;
}

export interface AuditDetectionRule {
  id: string;
  category: AuditUnitCategory;
  title: string;
  severity: AuditSeverity;
  cwe: string;
  fileExtensions: string[];
  pattern: RegExp;
  disproofPattern?: RegExp;
  description: string;
  reproduction: string;
  remediationPlan: string;
  skipTestFiles?: boolean;
}

export interface AuditReconSummary {
  projectName: string;
  packageManager: string;
  detectedDependencies: string[];
  targetPath: string;
}

export interface AuditRunOptions {
  targetPath: string;
  outputDirectory?: string;
  language?: string;
}

export interface AuditRunResult {
  auditDate: string;
  scope: string;
  reconSummary: AuditReconSummary;
  units: AuditCoverageUnit[];
  findings: AuditFinding[];
  prompt: string;
  exportedArtifacts?: string[];
}
