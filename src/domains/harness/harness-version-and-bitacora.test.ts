import { strictEqual, ok } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveGrooveSkillsVersion } from "@/domains/harness/resolve-grooveskills-version";
import { buildAgentHarnessBlock } from "@/domains/harness/build-agent-harness-block";
import { writeProjectConfig } from "@/domains/harness/write-project-config";
import { detectProjectContext } from "@/domains/detector/project-detector";
import {
  computeStatusKind,
  buildProjectStatusReport,
  renderProjectStatus,
} from "@/domains/ui/render-project-status";
import { installSkills } from "@/domains/installer/install-orchestrator";

export async function runHarnessVersionAndBitacoraTests(): Promise<void> {
  console.log("▶ Starting verification suite: Version Resolution, Bitacora Limit & Status CLI...");

  // 1. Version resolution
  const resolvedVersion = resolveGrooveSkillsVersion();
  strictEqual(typeof resolvedVersion, "string");
  ok(resolvedVersion.length > 0, "Resolved version should not be empty");
  strictEqual(resolvedVersion, "1.19.0", "Version should match bumped package.json");

  // 2. buildAgentHarnessBlock contains version and <= 10 compaction rule
  const harnessBlock = buildAgentHarnessBlock("es", "1.19.0");
  ok(
    harnessBlock.includes("(`v1.19.0`)"),
    "Harness block header must include current semantic version"
  );
  ok(
    harnessBlock.includes("Max 10 Items per Day (Compaction Rule)"),
    "Harness block must include the 10 items compaction rule"
  );
  ok(
    harnessBlock.includes("<= 10 items"),
    "Harness block must mandate staying at <= 10 items"
  );

  // 3. Status computation
  strictEqual(computeStatusKind(undefined, false, "1.19.0", false), "not-installed");
  strictEqual(computeStatusKind(undefined, true, "1.19.0", true), "unversioned");
  strictEqual(computeStatusKind("1.18.1", false, "1.19.0", true), "outdated");
  strictEqual(computeStatusKind("1.19.0", false, "1.19.0", true), "up-to-date");
  strictEqual(computeStatusKind("1.20.0", false, "1.19.0", true), "ahead");

  // 4. Persistence in config.json and legacy detection
  const testDirectory = mkdtempSync(join(tmpdir(), "grooveskills-version-test-"));
  try {
    // Write legacy config with numeric version: 1
    const dotGroove = join(testDirectory, ".grooveskills");
    const dotMemory = join(dotGroove, "memory");
    const { mkdirSync } = await import("node:fs");
    mkdirSync(dotMemory, { recursive: true });
    writeFileSync(join(dotMemory, "context.md"), "# Mock context\n");

    const legacyConfigPath = join(dotGroove, "config.json");
    writeFileSync(
      legacyConfigPath,
      JSON.stringify(
        {
          version: 1,
          harness: true,
          language: "es",
          agents: ["antigravity"],
          skills: ["odd-ai"],
        },
        null,
        2
      )
    );

    const legacyContext = detectProjectContext(testDirectory);
    strictEqual(legacyContext.hasLegacyConfigVersion, true);
    strictEqual(legacyContext.installedVersion, undefined);

    const legacyReport = buildProjectStatusReport(legacyContext, "1.19.0");
    strictEqual(legacyReport.status, "unversioned");
    strictEqual(legacyReport.updateAvailable, true);

    // Overwrite with writeProjectConfig (simulating update)
    writeProjectConfig(testDirectory, ["best-practices"], ["antigravity"], true, "es");

    const rawUpdatedConfig = readFileSync(legacyConfigPath, "utf-8");
    const parsedUpdatedConfig = JSON.parse(rawUpdatedConfig) as { version: string; skills: string[] };
    strictEqual(parsedUpdatedConfig.version, "1.19.0");
    ok(parsedUpdatedConfig.skills.includes("best-practices"));

    const updatedContext = detectProjectContext(testDirectory);
    strictEqual(updatedContext.installedVersion, "1.19.0");
    strictEqual(updatedContext.hasLegacyConfigVersion, false);

    const updatedReport = buildProjectStatusReport(updatedContext, "1.19.0");
    strictEqual(updatedReport.status, "up-to-date");
    strictEqual(updatedReport.updateAvailable, false);

    // 5. Test installSkills orchestrator output
    const installResult = await installSkills({
      targetPath: testDirectory,
      selectedSkillIds: ["odd-ai"],
      selectedAgents: ["antigravity"],
      forceOverwrite: true,
      enableHarness: true,
    });
    strictEqual(installResult.installedVersion, "1.19.0");

    // Verify .grooveskills/VERSIONS.md was created during installSkills
    const versionsFilePath = join(testDirectory, ".grooveskills", "VERSIONS.md");
    strictEqual(readFileSync(versionsFilePath, "utf-8").includes("[v1.19.0]"), true);

    // 6. Test renderProjectStatus output in memory/stdio (does not throw)
    renderProjectStatus(updatedContext, "1.19.0", true);
    renderProjectStatus(updatedContext, "1.19.0", false);
    renderProjectStatus(legacyContext, "1.19.0", false);

    console.log("  ✔ All version resolution, status, and bitacora rule tests passed.");
  } finally {
    rmSync(testDirectory, { recursive: true, force: true });
  }
}
