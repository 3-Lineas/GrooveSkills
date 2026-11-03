import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert";
import { safeWriteFileSync } from "./safe-file-writer";
import { InstallTransaction } from "./install-transaction";
import { FilePermissionError } from "@/errors/file-permission-error";

console.log("▶ Iniciando suite de verificación: Permisos Defensivos y Rollback Transaccional...");

const testBaseDir = join(tmpdir(), `grooveskills-test-${Date.now()}`);
mkdirSync(testBaseDir, { recursive: true });

try {
  // 1. Test auto-recovery on read-only file (chmod 0o444)
  console.log("1. Test auto-chmod on read-only file...");
  const readOnlyFile = join(testBaseDir, "readonly.txt");
  writeFileSync(readOnlyFile, "contenido inicial", "utf-8");
  chmodSync(readOnlyFile, 0o444); // solo lectura

  // safeWriteFileSync debe auto-otorgar permiso y sobrescribir
  safeWriteFileSync(readOnlyFile, "contenido modificado con safeWriteFileSync");
  const readBack = readFileSync(readOnlyFile, "utf-8");
  assert.strictEqual(readBack, "contenido modificado con safeWriteFileSync");
  console.log("  ✔ safeWriteFileSync recuperó los permisos de escritura exitosamente.");

  // 2. Test FilePermissionError when target directory is read-only
  console.log("2. Test FilePermissionError under unrecoverable condition...");
  const restrictedDir = join(testBaseDir, "restricted-dir");
  mkdirSync(restrictedDir, { recursive: true });
  chmodSync(restrictedDir, 0o555); // no write in directory

  const impossibleFile = join(restrictedDir, "uncreatable.txt");
  let permissionErrorThrown = false;
  try {
    safeWriteFileSync(impossibleFile, "fallará");
  } catch (err) {
    if (err instanceof FilePermissionError) {
      permissionErrorThrown = true;
      assert.strictEqual(err.code, "EACCES");
      assert.strictEqual(err.filePath, impossibleFile);
    }
  } finally {
    // Restaurar permisos para poder limpiar
    chmodSync(restrictedDir, 0o777);
  }
  assert.strictEqual(permissionErrorThrown, true);
  console.log("  ✔ FilePermissionError estructurado arrojado adecuadamente.");

  // 3. Test InstallTransaction Rollback
  console.log("3. Test InstallTransaction rollback behavior...");
  const tx = new InstallTransaction();

  // Archivo preexistente
  const preExistingFile = join(testBaseDir, "pre-existing.txt");
  writeFileSync(preExistingFile, "ORIGINAL CONTENT", "utf-8");

  // Registrar antes de modificar
  tx.recordBeforeWrite(preExistingFile);
  writeFileSync(preExistingFile, "MUTATED CONTENT", "utf-8");

  // Archivo nuevo en subcarpeta nueva
  const newSubdir = join(testBaseDir, "sub-dir");
  tx.recordCreatedDir(newSubdir);
  mkdirSync(newSubdir, { recursive: true });

  const newFile = join(newSubdir, "new-file.txt");
  tx.recordBeforeWrite(newFile);
  writeFileSync(newFile, "BRAND NEW CONTENT", "utf-8");

  // Ejecutar Rollback
  const report = tx.rollback();

  // Verificaciones
  assert.strictEqual(existsSync(newFile), false, "El nuevo archivo debe haber sido eliminado");
  assert.strictEqual(existsSync(newSubdir), false, "El subdirectorio vacío debe haber sido eliminado");
  assert.strictEqual(existsSync(preExistingFile), true, "El archivo preexistente debe seguir existiendo");
  assert.strictEqual(
    readFileSync(preExistingFile, "utf-8"),
    "ORIGINAL CONTENT",
    "El archivo preexistente debe haber sido restaurado exactamente a su versión original"
  );
  assert.strictEqual(report.restoredFiles.length, 1);
  assert.strictEqual(report.removedFiles.length, 1);
  assert.strictEqual(report.removedDirs.length, 1);

  // 4. Test installSkills integration with read-only AGENTS.md
  console.log("4. Test installSkills integration with read-only AGENTS.md...");
  const mockProjectDir = join(testBaseDir, "mock-project");
  mkdirSync(mockProjectDir, { recursive: true });

  const agentsMd = join(mockProjectDir, "AGENTS.md");
  writeFileSync(agentsMd, "# Custom User Instructions\n", "utf-8");
  chmodSync(agentsMd, 0o444); // Make read-only

  const { installSkills } = await import("@/domains/installer/install-orchestrator");
  const installResult = await installSkills({
    targetPath: mockProjectDir,
    selectedSkillIds: ["best-practices"],
    selectedAgents: ["claude"],
    forceOverwrite: true,
  });

  assert.ok(installResult.createdFiles.length > 0);
  const updatedAgentsMd = readFileSync(agentsMd, "utf-8");
  assert.ok(updatedAgentsMd.includes("# Custom User Instructions"));
  assert.ok(updatedAgentsMd.includes("<!-- grooveskills:harness:start -->"));
  console.log("  ✔ installSkills successfully updated read-only AGENTS.md via auto-recovery.");

  // 5. Test installSkills rollback when failure occurs
  console.log("5. Test installSkills full rollback on permission failure...");
  const failingProjectDir = join(testBaseDir, "failing-project");
  mkdirSync(failingProjectDir, { recursive: true });

  const existingAgents = join(failingProjectDir, "AGENTS.md");
  writeFileSync(existingAgents, "# Pre-existing untouched\n", "utf-8");

  // Block creation inside .grooveskills by creating an unreadable file or blocking dir
  // Let's create .claude/skills and make it unwriteable
  const claudeSkillsDir = join(failingProjectDir, ".claude", "skills");
  mkdirSync(claudeSkillsDir, { recursive: true });
  chmodSync(claudeSkillsDir, 0o555); // Cannot write files inside

  let transactionErrorCaught = false;
  try {
    await installSkills({
      targetPath: failingProjectDir,
      selectedSkillIds: ["best-practices"],
      selectedAgents: ["claude"],
      forceOverwrite: true,
    });
  } catch (err: unknown) {
    const { InstallTransactionError } = await import("@/errors/install-transaction-error");
    if (err instanceof InstallTransactionError) {
      transactionErrorCaught = true;
      assert.strictEqual(
        readFileSync(existingAgents, "utf-8"),
        "# Pre-existing untouched\n",
        "AGENTS.md must be untouched or restored to original state"
      );
      assert.strictEqual(err.rollbackReport.restoredFiles.length >= 0, true);
    }
  } finally {
    chmodSync(claudeSkillsDir, 0o777);
  }
  assert.strictEqual(transactionErrorCaught, true, "InstallTransactionError should have been caught");
  console.log("  ✔ installSkills successfully triggered rollback on failure.");

  console.log("\n✅ TODAS LAS PRUEBAS DE RESILIENCIA Y ROLLBACK PASARON EXITOSAMENTE.");
} finally {
  rmSync(testBaseDir, { recursive: true, force: true });
}
