import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert";
import { normalizeTaskFileNames } from "./normalize-task-filenames";
import { InstallTransaction } from "@/domains/fs/install-transaction";

export function runNormalizeTaskFilenamesTests(): void {
  console.log("10. Test normalizeTaskFileNames renaming and frontmatter extraction...");

  const testDir = join(tmpdir(), `grooveskills-task-rename-test-${Date.now()}`);
  mkdirSync(testDir, { recursive: true });

  try {
    // 1. 00-onboarding.md and _template.md must NOT be renamed
    writeFileSync(join(testDir, "00-onboarding.md"), "---\ncreatedAt: 2026-11-01\n---\n# Onboarding");
    writeFileSync(join(testDir, "_template.md"), "---\ncreatedAt: ${CURRENT_DATE}\n---\n# Template");

    // 2. Already normalized task should NOT be touched
    writeFileSync(
      join(testDir, "26-11-05-my-task.md"),
      "---\ncreatedAt: 2026-11-05\n---\n# Existing chrono task"
    );

    // 3. Task with YYYY-MM-DD frontmatter
    writeFileSync(
      join(testDir, "auth-flow.md"),
      "---\nstatus: in-progress\ncreatedAt: 2026-11-02\n---\n# Auth Flow"
    );

    // 4. Task with YY-MM-DD frontmatter
    writeFileSync(
      join(testDir, "billing-system.md"),
      "---\nstatus: pending\ncreatedAt: 26-10-15\n---\n# Billing System"
    );

    // 5. Task without createdAt (fallback to mtime / current date)
    writeFileSync(
      join(testDir, "no-date-task.md"),
      "# No date header\nJust markdown content"
    );

    const transaction = new InstallTransaction();
    const results = normalizeTaskFileNames(testDir, transaction);

    const renamedResults = results.filter((r) => r.renamed);
    assert.strictEqual(renamedResults.length, 3, "Expected 3 files to be renamed");

    const authRenamed = results.find((r) => r.originalFileName === "auth-flow.md");
    assert.ok(authRenamed);
    assert.strictEqual(authRenamed.normalizedFileName, "26-11-02-auth-flow.md");

    const billingRenamed = results.find((r) => r.originalFileName === "billing-system.md");
    assert.ok(billingRenamed);
    assert.strictEqual(billingRenamed.normalizedFileName, "26-10-15-billing-system.md");

    const noDateRenamed = results.find((r) => r.originalFileName === "no-date-task.md");
    assert.ok(noDateRenamed);
    assert.match(noDateRenamed.normalizedFileName, /^\d{2}-\d{2}-\d{2}-no-date-task\.md$/);

    const filesAfter = readdirSync(testDir).sort();
    assert.ok(filesAfter.includes("00-onboarding.md"), "00-onboarding.md must remain untouched");
    assert.ok(filesAfter.includes("_template.md"), "_template.md must remain untouched");
    assert.ok(filesAfter.includes("26-11-05-my-task.md"), "26-11-05-my-task.md must remain untouched");
    assert.ok(filesAfter.includes("26-11-02-auth-flow.md"), "auth-flow.md must be renamed to 26-11-02-auth-flow.md");
    assert.ok(filesAfter.includes("26-10-15-billing-system.md"), "billing-system.md must be renamed");

    // Content verification
    const authContent = readFileSync(join(testDir, "26-11-02-auth-flow.md"), "utf-8");
    assert.ok(authContent.includes("# Auth Flow"));

    console.log("  ✔ normalizeTaskFileNames successfully normalized task filenames preserving special files.");
  } finally {
    rmSync(testDir, { recursive: true, force: true });
  }
}
