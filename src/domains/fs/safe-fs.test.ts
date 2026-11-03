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

  console.log("\n✅ ALL RESILIENCE, ATOMIC REPLACE, AND ROLLBACK TESTS PASSED.");
} finally {
  rmSync(testBaseDir, { recursive: true, force: true });
}
