import {
  chmodSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import assert from "node:assert";
import { inspectFileAccess } from "./inspect-file-access";
import { InstallTransactionError } from "@/errors/install-transaction-error";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { formatReplacedFileNotes, getCurrentUsername } from "@/domains/ui/render-install-report";

export async function runSafeFsIntegrationTests(testBaseDir: string): Promise<void> {
  // 6. Test installSkills integration with read-only AGENTS.md
  console.log("6. Test installSkills integration with read-only AGENTS.md...");
  const mockProjectDir = join(testBaseDir, "mock-project");
  mkdirSync(mockProjectDir, { recursive: true });

  const agentsMdPath = join(mockProjectDir, "AGENTS.md");
  writeFileSync(agentsMdPath, "# Custom User Instructions\n", "utf-8");
  chmodSync(agentsMdPath, 0o444);

  const installResult = await installSkills({
    targetPath: mockProjectDir,
    selectedSkillIds: ["best-practices"],
    selectedAgents: ["claude"],
    forceOverwrite: true,
  });

  assert.ok(installResult.createdFiles.length > 0);
  const updatedAgentsMd = readFileSync(agentsMdPath, "utf-8");
  assert.ok(updatedAgentsMd.includes("# Custom User Instructions"));
  assert.ok(updatedAgentsMd.includes("<!-- grooveskills:harness:start -->"));
  const accessAfter = inspectFileAccess(agentsMdPath);
  assert.strictEqual(accessAfter.exists, true);
  console.log("  ✔ installSkills successfully updated read-only AGENTS.md.");

  // 7. Test mid-install rollback when agent directory is unwritable
  console.log("7. Test installSkills full rollback on mid-flight permission failure...");
  const failingProjectDir = join(testBaseDir, "failing-project");
  mkdirSync(failingProjectDir, { recursive: true });

  const existingAgentsPath = join(failingProjectDir, "AGENTS.md");
  writeFileSync(existingAgentsPath, "# Pre-existing untouched\n", "utf-8");

  const claudeSkillsDir = join(failingProjectDir, ".claude", "skills");
  mkdirSync(claudeSkillsDir, { recursive: true });
  chmodSync(claudeSkillsDir, 0o555);

  let transactionErrorCaught = false;
  try {
    await installSkills({
      targetPath: failingProjectDir,
      selectedSkillIds: ["best-practices"],
      selectedAgents: ["claude"],
      forceOverwrite: true,
    });
  } catch (caughtError: unknown) {
    if (caughtError instanceof InstallTransactionError) {
      transactionErrorCaught = true;
      assert.strictEqual(
        readFileSync(existingAgentsPath, "utf-8"),
        "# Pre-existing untouched\n",
        "AGENTS.md must remain untouched"
      );
      assert.strictEqual(caughtError.rollbackReport.isClean, true);
    }
  } finally {
    chmodSync(claudeSkillsDir, 0o777);
  }
  assert.strictEqual(transactionErrorCaught, true, "InstallTransactionError should have been caught");
  console.log("  ✔ installSkills successfully triggered rollback on mid-flight failure.");

  // 8. Verify no Spanish characters in CLI output files
  console.log("8. Verify CLI source files contain English-only strings...");
  const projectRoot = process.cwd();
  const cliFilesToCheck = [
    join(projectRoot, "bin/cli.ts"),
    join(projectRoot, "src/main.ts"),
    join(projectRoot, "src/domains/ui/ui-orchestrator.ts"),
    join(projectRoot, "src/domains/ui/ui-resolvers.ts"),
    join(projectRoot, "src/domains/ui/prompt-skills.ts"),
    join(projectRoot, "src/domains/ui/prompt-confirm-uninstall.ts"),
    join(projectRoot, "src/domains/ui/render-install-report.ts"),
    join(projectRoot, "src/domains/ui/render-onboarding-prompt.ts"),
    join(projectRoot, "src/domains/installer/install-orchestrator.ts"),
    join(projectRoot, "src/domains/installer/remove-skills.ts"),
    join(projectRoot, "src/domains/detector/detect-installed-skills.ts"),
    join(projectRoot, "src/domains/fs/inspect-file-access.ts"),
    join(projectRoot, "src/domains/fs/safe-file-writer.ts"),
    join(projectRoot, "src/domains/fs/preflight-write-check.ts"),
    join(projectRoot, "src/domains/fs/install-transaction.ts"),
    join(projectRoot, "src/domains/ui/render-project-status.ts"),
    join(projectRoot, "src/domains/harness/resolve-grooveskills-version.ts"),
    join(projectRoot, "src/errors/file-permission-error.ts"),
    join(projectRoot, "src/errors/install-transaction-error.ts"),
  ];
  const spanishAccentRegex = /[áéíóúñ¡¿ÁÉÍÓÚÑ]/;
  for (const filePath of cliFilesToCheck) {
    const content = readFileSync(filePath, "utf-8");
    assert.strictEqual(
      spanishAccentRegex.test(content),
      false,
      `File ${filePath} should not contain Spanish accented characters`
    );
  }
  assert.deepStrictEqual(formatReplacedFileNotes([]), []);
  const replacementNotes = formatReplacedFileNotes([
    { filePath: "/tmp/AGENTS.md", previousOwnerUid: 0 },
  ]);
  assert.strictEqual(replacementNotes.length, 1);
  assert.ok(replacementNotes[0]?.includes("Note: AGENTS.md was owned by root."));
  assert.ok(replacementNotes[0]?.includes(`now owned by ${getCurrentUsername()}.`));
  console.log("  ✔ All CLI, installer, fs, and error modules are strictly in English.");

  // 9. Test real macOS chflags uchg detection and preflight abort (on darwin)
  if (process.platform === "darwin") {
    console.log("9. Test real macOS 'chflags uchg' detection and preflight early abort...");
    const { execFileSync } = await import("node:child_process");
    const uchgProjectDir = join(testBaseDir, "uchg-project");
    mkdirSync(uchgProjectDir, { recursive: true });
    const uchgAgentsMdPath = join(uchgProjectDir, "AGENTS.md");
    writeFileSync(uchgAgentsMdPath, "# Locked with uchg\n", "utf-8");
    execFileSync("chflags", ["uchg", uchgAgentsMdPath]);

    let uchgPreflightCaught = false;
    try {
      const diagnosis = inspectFileAccess(uchgAgentsMdPath);
      assert.strictEqual(
        diagnosis.immutableFlag,
        true,
        "inspectFileAccess must detect real macOS uchg flag"
      );

      await installSkills({
        targetPath: uchgProjectDir,
        selectedSkillIds: ["best-practices"],
        selectedAgents: ["claude"],
        forceOverwrite: true,
      });
    } catch (caughtError: unknown) {
      if (caughtError instanceof InstallTransactionError) {
        uchgPreflightCaught = true;
        assert.strictEqual(caughtError.stage, "Preflight check");
        assert.strictEqual(caughtError.suggestedFix, `chflags nouchg "${uchgAgentsMdPath}"`);
        assert.strictEqual(caughtError.rollbackReport.restoredFiles.length, 0);
        assert.strictEqual(caughtError.rollbackReport.removedFiles.length, 0);
        assert.strictEqual(caughtError.rollbackReport.removedDirs.length, 0);
      }
    } finally {
      execFileSync("chflags", ["nouchg", uchgAgentsMdPath]);
    }
    assert.strictEqual(uchgPreflightCaught, true, "Preflight must abort on real uchg-locked AGENTS.md");
    assert.deepStrictEqual(
      readdirSync(uchgProjectDir),
      ["AGENTS.md"],
      "No extra files or directories may be created when uchg preflight aborts"
    );
    console.log("  ✔ Real macOS 'chflags uchg' detected and preflight aborted with 'chflags nouchg' fix.");
  }
}
