import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { scanProjectOnboarding } from "@/domains/harness/scan-project-onboarding";
import { detectDependencies } from "@/domains/detector/detect-dependencies";
import { partitionFiles } from "@/domains/audit/partition-audit-files";
import type {
  AuditCoverageUnit,
  AuditReconSummary,
  AuditUnitCategory,
} from "@/types/audit.types";

const IGNORED_DIRECTORY_NAMES = new Set([
  "node_modules",
  ".git",
  "dist",
  "dist-test",
  "build",
  ".next",
  "target",
  ".venv",
  "venv",
  "coverage",
]);

function traverseDirectoryReadOnly(
  basePath: string,
  currentPath: string,
  accumulator: string[]
): void {
  if (!existsSync(currentPath)) {
    return;
  }
  const entries = readdirSync(currentPath);
  for (const entry of entries) {
    if (IGNORED_DIRECTORY_NAMES.has(entry)) {
      continue;
    }
    const fullPath = join(currentPath, entry);
    const itemStat = statSync(fullPath);
    if (itemStat.isDirectory()) {
      traverseDirectoryReadOnly(basePath, fullPath, accumulator);
      continue;
    }
    if (!itemStat.isFile()) {
      continue;
    }
    const relativePath = relative(basePath, fullPath);
    accumulator.push(relativePath);
  }
}

function createAuditUnit(
  id: string,
  name: string,
  category: AuditUnitCategory,
  files: string[],
  referenceUsed: string
): AuditCoverageUnit {
  return {
    id,
    name,
    category,
    files,
    referenceUsed,
    status: "clean",
    notes: files.length > 0 ? "" : "No direct files detected in target workspace",
  };
}

export function discoverAuditUnits(targetPath: string): {
  reconSummary: AuditReconSummary;
  units: AuditCoverageUnit[];
} {
  const onboardingProfile = scanProjectOnboarding(targetPath);
  const detectedDeps = detectDependencies(targetPath);

  const reconSummary: AuditReconSummary = {
    projectName: onboardingProfile.projectName,
    packageManager: onboardingProfile.packageManager,
    detectedDependencies: detectedDeps.dependencies,
    targetPath,
  };

  const allRelativeFiles: string[] = [];
  traverseDirectoryReadOnly(targetPath, targetPath, allRelativeFiles);

  const partition = partitionFiles(allRelativeFiles);

  const webApiFiles =
    partition.webApiFiles.length > 0
      ? partition.webApiFiles
      : partition.genericSourceFiles.slice(0, 5);

  const dataCloudFiles =
    partition.dataCloudFiles.length > 0
      ? partition.dataCloudFiles
      : partition.genericSourceFiles.slice(5, 10);

  const fallbackFiles: string[] =
    partition.genericSourceFiles.length > 0 && partition.genericSourceFiles[0]
      ? [partition.genericSourceFiles[0]]
      : ["package.json"];

  const units: AuditCoverageUnit[] = [
    createAuditUnit(
      "UNIT-001",
      "Web APIs, Auth & Protocols",
      "web-api",
      webApiFiles.length > 0 ? webApiFiles : fallbackFiles,
      "references/03-web-api-auth-and-protocols.md"
    ),
    createAuditUnit(
      "UNIT-002",
      "Client, Desktop & IPC Boundaries",
      "client-ipc",
      partition.clientIpcFiles.length > 0 ? partition.clientIpcFiles : fallbackFiles,
      "references/04-client-desktop-and-ipc.md"
    ),
    createAuditUnit(
      "UNIT-003",
      "Data Isolation, Cloud & Supply Chain",
      "data-cloud",
      dataCloudFiles.length > 0 ? dataCloudFiles : fallbackFiles,
      "references/05-data-isolation-cloud-and-supply-chain.md"
    ),
    createAuditUnit(
      "UNIT-004",
      "AI, Skills & MCP Integrity",
      "ai-mcp-skills",
      partition.aiMcpSkillsFiles.length > 0 ? partition.aiMcpSkillsFiles : fallbackFiles,
      "references/06-ai-llm-mcp-and-skillspector.md"
    ),
    createAuditUnit(
      "UNIT-005",
      "Memory Safety, Crypto & Execution",
      "memory-crypto-exec",
      partition.memoryCryptoFiles.length > 0 ? partition.memoryCryptoFiles : fallbackFiles,
      "references/07-memory-safety-crypto-and-availability.md"
    ),
  ];

  return { reconSummary, units };
}
