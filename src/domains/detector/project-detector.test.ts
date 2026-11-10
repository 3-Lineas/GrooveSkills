import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert";
import { detectProjectContext } from "@/domains/detector/project-detector";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

export function runProjectDetectorTests(): void {
  console.log("▶ Starting verification suite: Project Detector & Next.js Architecture Exclusivity...");

  // 1. Verify SKILL_CATALOG contains nextjs-architecture
  const nextSkill = SKILL_CATALOG.find((item) => item.id === "nextjs-architecture");
  assert.ok(nextSkill, "SKILL_CATALOG must include 'nextjs-architecture'");
  assert.strictEqual(nextSkill.directoryName, "nextjs-architecture");
  assert.ok(nextSkill.dependencies.includes("next"));
  assert.ok(nextSkill.dependencies.includes("vinext"));
  assert.ok(nextSkill.dependencies.includes("@vinext/cloudflare"));
  console.log("  ✔ SKILL_CATALOG contains valid 'nextjs-architecture' definition.");

  const tempProjectDir = join(tmpdir(), `detector-test-${Date.now()}`);
  mkdirSync(tempProjectDir, { recursive: true });

  try {
    // 2. Pure React project: suggests react-create-page, excludes nextjs-architecture
    const reactPkgJson = {
      name: "pure-react-app",
      dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
    };
    writeFileSync(join(tempProjectDir, "package.json"), JSON.stringify(reactPkgJson), "utf-8");

    const reactContext = detectProjectContext(tempProjectDir);
    assert.ok(
      reactContext.suggestedSkillIds.includes("react-create-page"),
      "Pure React project must suggest 'react-create-page'"
    );
    assert.ok(
      reactContext.suggestedSkillIds.includes("react-core"),
      "Pure React project must suggest 'react-core'"
    );
    assert.ok(
      !reactContext.suggestedSkillIds.includes("nextjs-architecture"),
      "Pure React project must NOT suggest 'nextjs-architecture'"
    );
    console.log("  ✔ Pure React project suggests react-create-page and excludes nextjs-architecture.");

    // 3. Next.js project: suggests nextjs-architecture, excludes react-create-page
    const nextPkgJson = {
      name: "nextjs-app",
      dependencies: { next: "^15.0.0", react: "^19.0.0", "react-dom": "^19.0.0" },
    };
    writeFileSync(join(tempProjectDir, "package.json"), JSON.stringify(nextPkgJson), "utf-8");

    const nextContext = detectProjectContext(tempProjectDir);
    assert.ok(
      nextContext.suggestedSkillIds.includes("nextjs-architecture"),
      "Next.js project must suggest 'nextjs-architecture'"
    );
    assert.ok(
      nextContext.suggestedSkillIds.includes("react-core"),
      "Next.js project must still suggest 'react-core'"
    );
    assert.ok(
      nextContext.suggestedSkillIds.includes("react-advanced"),
      "Next.js project must still suggest 'react-advanced'"
    );
    assert.ok(
      !nextContext.suggestedSkillIds.includes("react-create-page"),
      "Next.js project must NOT suggest 'react-create-page'"
    );
    console.log("  ✔ Next.js project suggests nextjs-architecture and excludes react-create-page.");

    // 4. Vinext project: suggests nextjs-architecture, excludes react-create-page
    const vinextPkgJson = {
      name: "vinext-cloudflare-app",
      dependencies: { vinext: "^0.1.0", "@vinext/cloudflare": "^0.1.0", react: "^19.0.0" },
    };
    writeFileSync(join(tempProjectDir, "package.json"), JSON.stringify(vinextPkgJson), "utf-8");

    const vinextContext = detectProjectContext(tempProjectDir);
    assert.ok(
      vinextContext.suggestedSkillIds.includes("nextjs-architecture"),
      "Vinext project must suggest 'nextjs-architecture'"
    );
    assert.ok(
      !vinextContext.suggestedSkillIds.includes("react-create-page"),
      "Vinext project must NOT suggest 'react-create-page'"
    );
    console.log("  ✔ Vinext project suggests nextjs-architecture and excludes react-create-page.");

    // 5. Installed skills detection from config.json and filesystem
    const installedProjectDir = join(tempProjectDir, "installed-check");
    mkdirSync(installedProjectDir, { recursive: true });

    // New project initially has empty installedSkillIds
    const emptyContext = detectProjectContext(installedProjectDir);
    assert.strictEqual(
      emptyContext.installedSkillIds.length,
      0,
      "New project without skills must have 0 installedSkillIds"
    );

    // Pre-seed config with 'best-practices' and physical file in .claude/skills for 'hono'
    const grooveskillsDir = join(installedProjectDir, ".grooveskills");
    mkdirSync(grooveskillsDir, { recursive: true });
    writeFileSync(
      join(grooveskillsDir, "config.json"),
      JSON.stringify({ skills: ["best-practices", "groove-harness"] }),
      "utf-8"
    );

    const claudeSkillDir = join(installedProjectDir, ".claude", "skills", "hono");
    mkdirSync(claudeSkillDir, { recursive: true });
    writeFileSync(join(claudeSkillDir, "SKILL.md"), "# Hono Skill\n", "utf-8");

    const detectedContext = detectProjectContext(installedProjectDir);
    assert.ok(
      detectedContext.installedSkillIds.includes("best-practices"),
      "installedSkillIds must include 'best-practices' from config.json"
    );
    assert.ok(
      detectedContext.installedSkillIds.includes("hono"),
      "installedSkillIds must include 'hono' found in .claude/skills"
    );
    assert.ok(
      !detectedContext.installedSkillIds.includes("groove-harness"),
      "installedSkillIds must NOT include core harness 'groove-harness'"
    );
    console.log("  ✔ detectProjectContext detects installedSkillIds from config.json and filesystem.");
  } finally {
    rmSync(tempProjectDir, { recursive: true, force: true });
  }

  console.log("✅ ALL PROJECT DETECTOR TESTS PASSED.");
}
