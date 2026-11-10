import {
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert";
import { safeWriteFileSync } from "./safe-file-writer";
import { InstallTransaction } from "./install-transaction";
import { FilePermissionError } from "@/errors/file-permission-error";
import { InstallTransactionError } from "@/errors/install-transaction-error";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { runSafeFsIntegrationTests } from "./safe-fs-integration.test";
import { runNormalizeTaskFilenamesTests } from "@/domains/harness/normalize-task-filenames.test";
import { runSecurityAuditTests } from "@/domains/audit/run-security-audit.test";
import { runProjectDetectorTests } from "@/domains/detector/project-detector.test";
import { runRemoveSkillsTests } from "@/domains/installer/remove-skills.test";

console.log("▶ Starting verification suite: Defensive Permissions, Atomic Replace & Transactional Rollback...");

const testBaseDir = join(tmpdir(), `grooveskills-test-${Date.now()}`);
mkdirSync(testBaseDir, { recursive: true });

try {
  // 1. Test auto-recovery on read-only file you own (chmod 0o444)
  console.log("1. Test auto-chmod on read-only file owned by current user...");
  const readOnlyFile = join(testBaseDir, "readonly.txt");
  writeFileSync(readOnlyFile, "initial content", "utf-8");
  chmodSync(readOnlyFile, 0o444);

  const chmodOutcome = safeWriteFileSync(readOnlyFile, "updated via chmod");
  assert.strictEqual(chmodOutcome.strategy, "chmod");
  assert.strictEqual(readFileSync(readOnlyFile, "utf-8"), "updated via chmod");
  console.log("  ✔ safeWriteFileSync recovered write permissions via chmod.");

  // 2. Test atomic replacement when chmod fails (simulating root-owned file in writable directory)
  console.log("2. Test atomic replace when chmod fails in a writable directory...");
  const rootSimulatedFile = join(testBaseDir, "root-owned-sim.txt");
  writeFileSync(rootSimulatedFile, "root initial content", "utf-8");
  chmodSync(rootSimulatedFile, 0o444);

  const replaceOutcome = safeWriteFileSync(rootSimulatedFile, "updated via atomic replace", {
    chmodImpl: () => {
      const permissionError = new Error(
        "EPERM: operation not permitted, chmod"
      ) as NodeJS.ErrnoException;
      permissionError.code = "EPERM";
      throw permissionError;
    },
  });

  assert.strictEqual(replaceOutcome.strategy, "replaced");
  assert.strictEqual(readFileSync(rootSimulatedFile, "utf-8"), "updated via atomic replace");
  const leftoverTemps = readdirSync(testBaseDir).filter((fileName) =>
    fileName.includes(".groove-tmp-")
  );
  assert.strictEqual(leftoverTemps.length, 0, "No temporary files should remain after atomic replace");
  console.log("  ✔ safeWriteFileSync fell back to atomic replace cleanly without temp leftovers.");

  // 3. Test FilePermissionError diagnosis & suggested fix commands
  console.log("3. Test FilePermissionError diagnosis and suggested fix derivation...");
  const nonOwnerDiagnosis = {
    filePath: "/path/to/AGENTS.md",
    exists: true,
    isSymlink: false,
    ownedByCurrentUser: false,
    ownerUid: 0,
    currentUid: 501,
    mode: 0o644,
    immutableFlag: false,
    dirWritable: false,
    parentDir: "/path/to",
  };
  const nonOwnerError = new FilePermissionError("/path/to/AGENTS.md", nonOwnerDiagnosis);
  assert.ok(nonOwnerError.message.includes("owned by root"));
  assert.strictEqual(nonOwnerError.suggestedFixCommand, 'sudo chown "$(id -un)" "/path/to/AGENTS.md"');

  const immutableDiagnosis = { ...nonOwnerDiagnosis, ownedByCurrentUser: true, immutableFlag: true };
  const immutableError = new FilePermissionError("/path/to/AGENTS.md", immutableDiagnosis);
  assert.strictEqual(immutableError.suggestedFixCommand, 'chflags nouchg "/path/to/AGENTS.md"');

  const directoryDiagnosis = {
    ...nonOwnerDiagnosis,
    exists: false,
    ownedByCurrentUser: true,
    dirWritable: false,
  };
  const directoryError = new FilePermissionError("/path/to/AGENTS.md", directoryDiagnosis);
  assert.strictEqual(directoryError.suggestedFixCommand, 'chmod u+w "/path/to"');
  console.log("  ✔ FilePermissionError derives targeted fix commands from diagnosis.");

  // 4. Test preflight check throws before any file is created when directory is unwritable
  console.log("4. Test preflight write check aborts before mutating unwritable project...");
  const unwritableProjectDir = join(testBaseDir, "unwritable-project");
  mkdirSync(unwritableProjectDir, { recursive: true });
  const existingReadme = join(unwritableProjectDir, "README.md");
  writeFileSync(existingReadme, "# Untouched Project\n", "utf-8");
  chmodSync(unwritableProjectDir, 0o555);

  let preflightAbortedEarly = false;
  try {
    await installSkills({
      targetPath: unwritableProjectDir,
      selectedSkillIds: ["best-practices"],
      selectedAgents: ["claude"],
      forceOverwrite: true,
    });
  } catch (caughtError: unknown) {
    if (caughtError instanceof InstallTransactionError) {
      preflightAbortedEarly = true;
      assert.strictEqual(caughtError.stage, "Preflight check");
      assert.strictEqual(caughtError.rollbackReport.restoredFiles.length, 0);
      assert.strictEqual(caughtError.rollbackReport.removedFiles.length, 0);
      assert.strictEqual(caughtError.rollbackReport.removedDirs.length, 0);
      assert.strictEqual(caughtError.rollbackReport.isClean, true);
    }
  } finally {
    chmodSync(unwritableProjectDir, 0o755);
  }
  assert.strictEqual(preflightAbortedEarly, true, "Preflight should have aborted before stage 1");
  assert.deepStrictEqual(
    readdirSync(unwritableProjectDir),
    ["README.md"],
    "Project tree must remain byte-identical after preflight abort"
  );
  console.log("  ✔ Preflight check failed early and left project tree untouched.");

  // 5. Test InstallTransaction Rollback skips unchanged files & reports failures honestly
  console.log("5. Test InstallTransaction rollback skips unchanged files and reports failures...");
  const transaction = new InstallTransaction();

  const modifiedFile = join(testBaseDir, "modified.txt");
  writeFileSync(modifiedFile, "ORIGINAL CONTENT", "utf-8");
  transaction.recordBeforeWrite(modifiedFile);
  writeFileSync(modifiedFile, "MUTATED CONTENT", "utf-8");

  const untouchedFile = join(testBaseDir, "untouched.txt");
  writeFileSync(untouchedFile, "SAME CONTENT", "utf-8");
  transaction.recordBeforeWrite(untouchedFile);

  const newSubdir = join(testBaseDir, "sub-dir");
  transaction.recordCreatedDir(newSubdir);
  mkdirSync(newSubdir, { recursive: true });
  const newFile = join(newSubdir, "new-file.txt");
  transaction.recordBeforeWrite(newFile);
  writeFileSync(newFile, "BRAND NEW CONTENT", "utf-8");

  const cleanReport = transaction.rollback();
  assert.strictEqual(existsSync(newFile), false, "New file should be removed");
  assert.strictEqual(existsSync(newSubdir), false, "Empty created directory should be removed");
  assert.strictEqual(readFileSync(modifiedFile, "utf-8"), "ORIGINAL CONTENT");
  assert.deepStrictEqual(cleanReport.restoredFiles, [modifiedFile]);
  assert.strictEqual(cleanReport.isClean, true);
  assert.strictEqual(cleanReport.failures.length, 0);

  const lockedDir = join(testBaseDir, "locked-rollback-dir");
  mkdirSync(lockedDir, { recursive: true });
  const lockedFile = join(lockedDir, "locked.txt");
  writeFileSync(lockedFile, "BEFORE", "utf-8");

  const failingTransaction = new InstallTransaction();
  failingTransaction.recordBeforeWrite(lockedFile);
  writeFileSync(lockedFile, "AFTER", "utf-8");
  chmodSync(lockedFile, 0o444);

  const lockedNewFile = join(lockedDir, "new-locked.txt");
  failingTransaction.recordBeforeWrite(lockedNewFile);
  writeFileSync(lockedNewFile, "NEW", "utf-8");
  chmodSync(lockedDir, 0o555);

  const failedReport = failingTransaction.rollback();
  chmodSync(lockedDir, 0o755);
  chmodSync(lockedFile, 0o644);

  assert.strictEqual(failedReport.isClean, false, "isClean must be false when rollback fails");
  assert.ok(failedReport.failures.length > 0, "Failures list must be populated");
  console.log("  ✔ InstallTransaction accurately tracks failures and skips unchanged files.");

  await runSafeFsIntegrationTests(testBaseDir);
  runNormalizeTaskFilenamesTests();

  // 11. Test linkAgentSkill relative symlinks, legacy migration, custom skills preservation, and rollback
  console.log("11. Test linkAgentSkill creates symlinks, migrates legacy directories, and preserves custom skills...");
  const symlinkProjectDir = join(testBaseDir, "symlink-project");
  mkdirSync(symlinkProjectDir, { recursive: true });

  // Pre-seed canonical skill in .grooveskills/skills/my-skill
  const canonicalSkillDir = join(symlinkProjectDir, ".grooveskills", "skills", "my-skill");
  mkdirSync(canonicalSkillDir, { recursive: true });
  writeFileSync(join(canonicalSkillDir, "SKILL.md"), "# Canonical My Skill Content\n", "utf-8");

  // Pre-seed legacy agent folder with old copy/reference style
  const agentSkillsDir = join(symlinkProjectDir, ".agents", "skills");
  const legacySkillFolder = join(agentSkillsDir, "my-skill");
  mkdirSync(legacySkillFolder, { recursive: true });
  writeFileSync(join(legacySkillFolder, "SKILL.md"), "# Legacy Reference Content\n", "utf-8");

  // Pre-seed a custom user-created skill in .agents/skills/custom-user-skill
  const customUserSkillDir = join(agentSkillsDir, "custom-user-skill");
  mkdirSync(customUserSkillDir, { recursive: true });
  writeFileSync(join(customUserSkillDir, "SKILL.md"), "# User Custom Skill\n", "utf-8");

  const symlinkTransaction = new InstallTransaction();
  const { linkAgentSkill } = await import("@/domains/adapters/skill-reference-builder");

  const skillMetadata = {
    id: "my-skill",
    name: "My Skill",
    description: "Test skill",
    dependencies: [],
    directoryName: "my-skill",
  };

  const createdLink = linkAgentSkill(
    symlinkProjectDir,
    ".agents/skills",
    skillMetadata,
    symlinkTransaction
  );

  const { lstatSync: lstatCheck, readlinkSync: readlinkCheck } = await import("node:fs");
  const linkStat = lstatCheck(createdLink);
  assert.strictEqual(linkStat.isSymbolicLink(), true, "Skill in .agents/skills must be a symbolic link");

  const linkTarget = readlinkCheck(createdLink);
  assert.strictEqual(
    linkTarget,
    "../../.grooveskills/skills/my-skill",
    "Symlink must be relative: ../../.grooveskills/skills/<skill>"
  );

  // Check content is readable through symlink
  const resolvedContent = readFileSync(join(createdLink, "SKILL.md"), "utf-8");
  assert.strictEqual(resolvedContent, "# Canonical My Skill Content\n");

  // Verify custom user skill was NOT deleted or disturbed
  assert.strictEqual(existsSync(customUserSkillDir), true, "Custom user skill directory must be preserved");
  assert.strictEqual(
    readFileSync(join(customUserSkillDir, "SKILL.md"), "utf-8"),
    "# User Custom Skill\n"
  );

  // Test rollback removes created symlink
  const symlinkRollbackReport = symlinkTransaction.rollback();
  assert.strictEqual(symlinkRollbackReport.removedSymlinks.includes(createdLink), true);
  assert.strictEqual(existsSync(createdLink), false, "Rollback should remove newly created symlink");
  assert.strictEqual(existsSync(customUserSkillDir), true, "Custom skill must remain after rollback");
  console.log("  ✔ linkAgentSkill creates relative symlinks, migrates legacy directories, and preserves custom skills.");

  // 12. Test standalone zero-footprint security audit
  await runSecurityAuditTests();

  // 13. Test project detector Next.js / pure React exclusivity
  runProjectDetectorTests();

  // 14. Test installSkills with skillsToRemove (complete uninstallation)
  await runRemoveSkillsTests(testBaseDir);

  console.log("\n✅ ALL RESILIENCE, ATOMIC REPLACE, AND ROLLBACK TESTS PASSED.");
} finally {
  rmSync(testBaseDir, { recursive: true, force: true });
}
