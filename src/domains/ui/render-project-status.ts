import picocolors from "picocolors";
import type { ProjectContext } from "@/types/context.types";

export type ProjectStatusKind =
  | "up-to-date"
  | "outdated"
  | "ahead"
  | "unversioned"
  | "not-installed";

export interface ProjectStatusReport {
  installed: boolean;
  version: string | null;
  cliVersion: string;
  status: ProjectStatusKind;
  updateAvailable: boolean;
  harness: boolean;
  language?: string;
  agents: string[];
  skills: string[];
  updatedAt?: string;
  targetPath: string;
}

function parseSemverParts(versionString: string): [number, number, number] | null {
  const cleanVersion = versionString.replace(/^v/i, "").trim();
  const segments = cleanVersion.split(".").map((part) => Number.parseInt(part, 10));
  const major = segments[0];
  const minor = segments[1];
  const patch = segments[2];
  if (
    typeof major !== "number" ||
    typeof minor !== "number" ||
    typeof patch !== "number" ||
    Number.isNaN(major) ||
    Number.isNaN(minor) ||
    Number.isNaN(patch)
  ) {
    return null;
  }
  return [major, minor, patch];
}

export function computeStatusKind(
  installedVersion: string | undefined,
  hasLegacyConfigVersion: boolean | undefined,
  cliVersion: string,
  harnessExists: boolean
): ProjectStatusKind {
  if (!harnessExists && !installedVersion && !hasLegacyConfigVersion) {
    return "not-installed";
  }

  if (hasLegacyConfigVersion && !installedVersion) {
    return "unversioned";
  }

  if (!installedVersion) {
    return "unversioned";
  }

  const installedParts = parseSemverParts(installedVersion);
  const cliParts = parseSemverParts(cliVersion);

  if (!installedParts || !cliParts) {
    if (installedVersion === cliVersion) {
      return "up-to-date";
    }
    return "outdated";
  }

  const [installedMajor, installedMinor, installedPatch] = installedParts;
  const [cliMajor, cliMinor, cliPatch] = cliParts;

  if (installedMajor < cliMajor) {
    return "outdated";
  }
  if (installedMajor > cliMajor) {
    return "ahead";
  }
  if (installedMinor < cliMinor) {
    return "outdated";
  }
  if (installedMinor > cliMinor) {
    return "ahead";
  }
  if (installedPatch < cliPatch) {
    return "outdated";
  }
  if (installedPatch > cliPatch) {
    return "ahead";
  }

  return "up-to-date";
}

export function buildProjectStatusReport(
  context: ProjectContext,
  cliVersion: string
): ProjectStatusReport {
  const status = computeStatusKind(
    context.installedVersion,
    context.hasLegacyConfigVersion,
    cliVersion,
    context.harnessExists
  );

  const isInstalled = status !== "not-installed";
  const updateAvailable = status === "outdated" || status === "unversioned";

  return {
    installed: isInstalled,
    version: context.installedVersion ?? null,
    cliVersion,
    status,
    updateAvailable,
    harness: context.harnessExists,
    language: context.configuredLanguage,
    agents: context.configuredAgents ?? context.detectedAgents,
    skills: context.configuredSkills ?? context.installedSkillIds,
    updatedAt: context.configuredUpdatedAt,
    targetPath: context.targetPath,
  };
}

export function renderProjectStatus(
  context: ProjectContext,
  cliVersion: string,
  asJson: boolean = false
): void {
  const report = buildProjectStatusReport(context, cliVersion);

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(picocolors.bold(picocolors.magenta("GrooveSkills Project Status")));
  console.log(picocolors.gray(`Target path: ${report.targetPath}`));

  if (!report.installed) {
    console.log(picocolors.yellow("\nGrooveSkills is not installed in this project."));
    console.log(picocolors.cyan("Run 'npx @3lineas/grooveskills' to initialize the harness and skills."));
    return;
  }

  const installedVersionLabel = report.version
    ? picocolors.bold(`v${report.version}`)
    : picocolors.yellow("Unversioned (legacy v1 schema)");

  console.log(`\nInstalled version: ${installedVersionLabel}`);
  console.log(`CLI version:       ${picocolors.bold(`v${report.cliVersion}`)}`);

  if (report.status === "up-to-date") {
    console.log(picocolors.green("Status:            ✔ Up-to-date"));
  } else if (report.status === "outdated" || report.status === "unversioned") {
    console.log(picocolors.yellow("Status:            ⚠ Update recommended"));
    console.log(
      picocolors.cyan("                   Run 'npx @3lineas/grooveskills update' to upgrade in-place.")
    );
  } else if (report.status === "ahead") {
    console.log(picocolors.blue("Status:            ✦ Project version is ahead of CLI"));
  }

  console.log(`\nHarness:           ${report.harness ? picocolors.green("Active (.grooveskills/)") : "Inactive"}`);
  console.log(`Language:          ${report.language ?? "default (es)"}`);
  console.log(`Agents:            ${report.agents.join(", ") || "None"}`);
  console.log(`Installed skills:  ${report.skills.length} configured`);
  if (report.updatedAt) {
    console.log(`Last updated:      ${report.updatedAt}`);
  }
}
