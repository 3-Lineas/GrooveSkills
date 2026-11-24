import assert from "node:assert";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectProjectContext } from "@/domains/detector/project-detector";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

export async function runModernWebGuidanceDetectorTests(): Promise<void> {
  console.log("▶ Starting verification suite: Modern Web Guidance Detection & Assets...");

  const catalogEntry = SKILL_CATALOG.find((skill) => skill.id === "modern-web-guidance");
  assert.ok(catalogEntry, "modern-web-guidance should exist in SKILL_CATALOG");
  assert.strictEqual(catalogEntry.category, "Frameworks & UI");

  const testRootDir = join(tmpdir(), `grooveskills-web-guidance-test-${Date.now()}`);
  mkdirSync(testRootDir, { recursive: true });

  try {
    // 1. Web frontend project (React + Vite + Tailwind) auto-suggests modern-web-guidance
    const webProjectDir = join(testRootDir, "web-app");
    mkdirSync(webProjectDir, { recursive: true });
    writeFileSync(
      join(webProjectDir, "package.json"),
      JSON.stringify({
        name: "web-app",
        dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
        devDependencies: { vite: "^6.0.0", tailwindcss: "^4.0.0" },
      }),
      "utf-8",
    );

    const webContext = await detectProjectContext(webProjectDir);
    assert.ok(
      webContext.suggestedSkillIds.includes("modern-web-guidance"),
      "Web project should auto-suggest modern-web-guidance",
    );

    // 2. Pure backend project (Go / Rust / Dart without web frontend) does NOT suggest modern-web-guidance
    const backendProjectDir = join(testRootDir, "backend-api");
    mkdirSync(backendProjectDir, { recursive: true });
    writeFileSync(
      join(backendProjectDir, "go.mod"),
      "module example.com/backend-api\n\ngo 1.27\n",
      "utf-8",
    );

    const backendContext = await detectProjectContext(backendProjectDir);
    assert.ok(
      !backendContext.suggestedSkillIds.includes("modern-web-guidance"),
      "Pure backend project should NOT suggest modern-web-guidance",
    );

    // 3. Validate SKILL.md and local references exist on disk
    const skillRootDir = join(process.cwd(), "skills", "modern-web-guidance");
    const skillFilePath = join(skillRootDir, "SKILL.md");
    const primitivesRefPath = join(skillRootDir, "references", "modern-web-primitives-and-baseline.md");
    const adaptationRefPath = join(skillRootDir, "references", "grooveskills-web-adaptation.md");

    assert.ok(existsSync(skillFilePath), "skills/modern-web-guidance/SKILL.md must exist");
    assert.ok(existsSync(primitivesRefPath), "modern-web-primitives-and-baseline.md must exist");
    assert.ok(existsSync(adaptationRefPath), "grooveskills-web-adaptation.md must exist");

    const skillContent = readFileSync(skillFilePath, "utf-8");
    assert.ok(skillContent.includes("pnpx modern-web-guidance@latest"), "SKILL.md must document live CLI");
    assert.ok(skillContent.includes("Baseline"), "SKILL.md must document Baseline policy");

    console.log("  ✔ Modern Web Guidance detection, exclusion, and disk asset tests passed.");
  } finally {
    rmSync(testRootDir, { recursive: true, force: true });
  }
}
