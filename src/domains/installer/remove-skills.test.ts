import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert";
import { installSkills } from "@/domains/installer/install-orchestrator";

export async function runRemoveSkillsTests(testBaseDir: string): Promise<void> {
  console.log("14. Test installSkills with skillsToRemove (complete uninstallation)...");
  const projectDir = join(testBaseDir, "removal-test-project");
  mkdirSync(projectDir, { recursive: true });

  // 1. Initial installation with 3 skills: best-practices, ux-writing, hono across 4 agents
  await installSkills({
    targetPath: projectDir,
    selectedSkillIds: ["best-practices", "ux-writing", "hono"],
    selectedAgents: ["antigravity", "claude", "cursor", "gemini"],
    forceOverwrite: true,
  });

  // Pre-seed a custom user skill in .agents/skills/custom-user-skill to verify preservation
  const customUserSkillDir = join(projectDir, ".agents", "skills", "custom-user-skill");
  mkdirSync(customUserSkillDir, { recursive: true });
  writeFileSync(join(customUserSkillDir, "SKILL.md"), "# Custom User Skill\n", "utf-8");

  // Verify ux-writing exists in canonical store and all agent locations
  const canonicalUxDir = join(projectDir, ".grooveskills", "skills", "ux-writing");
  const agentsUxLink = join(projectDir, ".agents", "skills", "ux-writing");
  const claudeUxLink = join(projectDir, ".claude", "skills", "ux-writing");
  const geminiUxLink = join(projectDir, ".gemini", "skills", "ux-writing");
  const cursorUxRule = join(projectDir, ".cursor", "rules", "ux-writing.mdc");
  const configPath = join(projectDir, ".grooveskills", "config.json");

  assert.strictEqual(existsSync(canonicalUxDir), true);
  assert.strictEqual(existsSync(agentsUxLink), true);
  assert.strictEqual(existsSync(claudeUxLink), true);
  assert.strictEqual(existsSync(geminiUxLink), true);
  assert.strictEqual(existsSync(cursorUxRule), true);

  const initialConfig = JSON.parse(readFileSync(configPath, "utf-8"));
  assert.ok(initialConfig.skills.includes("ux-writing"));
  assert.ok(initialConfig.skills.includes("best-practices"));
  assert.ok(initialConfig.skills.includes("hono"));

  // 2. Run installSkills removing ux-writing and odd-ai
  const removalResult = await installSkills({
    targetPath: projectDir,
    selectedSkillIds: ["best-practices", "hono"],
    selectedAgents: ["antigravity", "claude", "cursor", "gemini"],
    forceOverwrite: true,
    skillsToRemove: ["ux-writing", "odd-ai"],
  });

  assert.ok(removalResult.removedSkills?.includes("ux-writing"));
  assert.ok(removalResult.removedSkills?.includes("odd-ai"));

  // Verify ux-writing was removed from all locations
  assert.strictEqual(existsSync(canonicalUxDir), false, "Canonical ux-writing must be deleted");
  assert.strictEqual(existsSync(agentsUxLink), false, ".agents link must be deleted");
  assert.strictEqual(existsSync(claudeUxLink), false, ".claude link must be deleted");
  assert.strictEqual(existsSync(geminiUxLink), false, ".gemini link must be deleted");
  assert.strictEqual(existsSync(cursorUxRule), false, ".cursor rule must be deleted");

  // Verify odd-ai was removed
  const canonicalOddDir = join(projectDir, ".grooveskills", "skills", "odd-ai");
  assert.strictEqual(existsSync(canonicalOddDir), false, "odd-ai must be deleted when explicitly removed");

  // Verify preserved skills: best-practices, hono, groove-harness, and custom user skill
  const canonicalBpDir = join(projectDir, ".grooveskills", "skills", "best-practices");
  const canonicalHonoDir = join(projectDir, ".grooveskills", "skills", "hono");
  const canonicalHarnessDir = join(projectDir, ".grooveskills", "skills", "groove-harness");

  assert.strictEqual(existsSync(canonicalBpDir), true, "best-practices must remain");
  assert.strictEqual(existsSync(canonicalHonoDir), true, "hono must remain");
  assert.strictEqual(existsSync(canonicalHarnessDir), true, "groove-harness must remain");
  assert.strictEqual(existsSync(customUserSkillDir), true, "custom-user-skill must remain");

  // Verify config.json does not have ux-writing or odd-ai, but retains best-practices and hono
  const updatedConfig = JSON.parse(readFileSync(configPath, "utf-8"));
  assert.ok(!updatedConfig.skills.includes("ux-writing"), "config.json must not include ux-writing");
  assert.ok(!updatedConfig.skills.includes("odd-ai"), "config.json must not include odd-ai");
  assert.ok(updatedConfig.skills.includes("best-practices"), "config.json must retain best-practices");
  assert.ok(updatedConfig.skills.includes("hono"), "config.json must retain hono");

  // 3. Verify when skillsToRemove is empty ([]), existing skills are preserved
  await installSkills({
    targetPath: projectDir,
    selectedSkillIds: ["best-practices"],
    selectedAgents: ["claude"],
    forceOverwrite: true,
    skillsToRemove: [],
  });

  const finalConfig = JSON.parse(readFileSync(configPath, "utf-8"));
  assert.ok(finalConfig.skills.includes("best-practices"));
  assert.ok(finalConfig.skills.includes("hono"), "hono must be preserved when skillsToRemove is empty");

  // 4. Verify groove-harness can never be uninstalled even if passed in skillsToRemove
  await installSkills({
    targetPath: projectDir,
    selectedSkillIds: ["best-practices"],
    selectedAgents: ["claude"],
    forceOverwrite: true,
    skillsToRemove: ["groove-harness"],
  });
  assert.strictEqual(existsSync(canonicalHarnessDir), true, "groove-harness can never be uninstalled");

  console.log("  ✔ installSkills successfully removes deselected skills completely and preserves others.");
}
