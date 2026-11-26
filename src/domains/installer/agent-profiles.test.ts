import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdtempSync, readFileSync, readlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installSkills } from "@/domains/installer/install-orchestrator";
import { mergeProfileSkills } from "@/domains/registry/merge-profile-skills";
import { detectProjectContext } from "@/domains/detector/project-detector";

async function runAgentProfileTests(): Promise<void> {
  console.log("▶ Starting verification suite: Specialized Agent Profiles...");

  const tempRoot = mkdtempSync(join(tmpdir(), "grooveskills-agent-profiles-"));

  try {
    // 1. Test mergeProfileSkills mutual exclusion and skill merging
    const mergedNext = mergeProfileSkills(["cf-turbo-hono-next"], ["react-create-page", "odd-ai"]);
    assert.ok(mergedNext.includes("nextjs-architecture"), "Should include nextjs-architecture");
    assert.ok(!mergedNext.includes("react-create-page"), "Should exclude react-create-page");
    assert.ok(mergedNext.includes("hono"), "Should include hono");

    // 2. Test installSkills with selectedAgentProfileIds
    const result = await installSkills({
      targetPath: tempRoot,
      selectedSkillIds: ["best-practices", "odd-ai"],
      selectedAgents: ["antigravity", "claude", "gemini"],
      forceOverwrite: true,
      language: "es",
      selectedAgentProfileIds: ["cf-turbo-hono-next", "cf-nextjs"],
    });

    assert.deepEqual(
      result.installedAgentProfiles,
      ["cf-turbo-hono-next", "cf-nextjs"],
      "Should report installed agent profiles"
    );

    const canonicalNext = join(tempRoot, ".grooveskills", "agents", "cf-turbo-hono-next.md");
    assert.ok(existsSync(canonicalNext), "Canonical agent profile should exist");
    const content = readFileSync(canonicalNext, "utf-8");
    assert.ok(content.includes("name: cf-turbo-hono-next"), "Frontmatter name should be kebab-case");
    assert.ok(content.includes("mainAgent: true"), "Frontmatter should include mainAgent: true");
    assert.ok(content.includes("subagent: true"), "Frontmatter should include subagent: true");
    assert.ok(content.includes("commandExecutionPolicy: auto"), "Frontmatter should include commandExecutionPolicy: auto");
    assert.ok(content.includes("write_to_file"), "Frontmatter should include write_to_file tool");
    assert.ok(content.includes("replace_file_content"), "Frontmatter should include replace_file_content tool");
    assert.ok(content.includes("run_command"), "Frontmatter should include run_command tool");
    assert.ok(!content.includes("{{LANGUAGE_BLOCK}}"), "Language placeholder should be replaced");

    // 3. Verify relative symlinks in .agents/agents, .claude/agents, .gemini/agents
    for (const dir of [".agents/agents", ".claude/agents", ".gemini/agents"]) {
      const linkPath = join(tempRoot, dir, "cf-turbo-hono-next.md");
      assert.ok(existsSync(linkPath), `Symlink should exist at ${linkPath}`);
      assert.ok(lstatSync(linkPath).isSymbolicLink(), `${linkPath} should be a symlink`);
      assert.equal(
        readlinkSync(linkPath),
        "../../.grooveskills/agents/cf-turbo-hono-next.md",
        "Symlink should be relative"
      );
    }

    // 4. Verify config.json persistence and detectProjectContext
    const config = JSON.parse(
      readFileSync(join(tempRoot, ".grooveskills", "config.json"), "utf-8")
    ) as { agentProfiles?: string[] };
    assert.deepEqual(config.agentProfiles, ["cf-turbo-hono-next", "cf-nextjs"]);

    const detected = detectProjectContext(tempRoot);
    assert.deepEqual(detected.installedAgentProfileIds, ["cf-turbo-hono-next", "cf-nextjs"]);

    // 5. Verify removal of deselected agent profile
    const removalResult = await installSkills({
      targetPath: tempRoot,
      selectedSkillIds: ["best-practices", "odd-ai"],
      selectedAgents: ["antigravity", "claude", "gemini"],
      forceOverwrite: true,
      language: "es",
      selectedAgentProfileIds: ["cf-turbo-hono-next"],
      agentProfilesToRemove: ["cf-nextjs"],
    });

    assert.deepEqual(removalResult.removedAgentProfiles, ["cf-nextjs"]);
    assert.ok(
      !existsSync(join(tempRoot, ".grooveskills", "agents", "cf-nextjs.md")),
      "Removed profile should not exist in canonical store"
    );
    assert.ok(
      !existsSync(join(tempRoot, ".agents", "agents", "cf-nextjs.md")),
      "Removed profile symlink should not exist in .agents/agents"
    );
    assert.ok(
      existsSync(join(tempRoot, ".agents", "agents", "cf-turbo-hono-next.md")),
      "Remaining profile symlink should still exist"
    );

    console.log("✅ ALL SPECIALIZED AGENT PROFILE TESTS PASSED.");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

runAgentProfileTests().catch((error) => {
  console.error(error);
  process.exit(1);
});
