import assert from "node:assert";
import { formatUpdatePrompt } from "@/domains/ui/render-update-prompt";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
import { buildVersionsTemplate } from "@/domains/harness/build-versions-template";
import type { ProjectLanguage } from "@/types/harness.types";

function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export function runUpdatePromptRenderTests(): void {
  console.log("▶ Starting verification suite: Dynamic Update Prompt Clean Rendering & VERSIONS.md...");

  const languages: ProjectLanguage[] = ["es", "en", "pt", "it", "fr"];

  for (const lang of languages) {
    const languageConfig = SUPPORTED_LANGUAGES[lang];
    const rendered = formatUpdatePrompt(lang);

    assert.strictEqual(rendered.title, languageConfig.updatePromptTitle);
    assert.strictEqual(rendered.prompt, languageConfig.updatePrompt);

    // Verify prompt explicitly orders reading .grooveskills/VERSIONS.md
    assert.ok(
      rendered.prompt.includes(".grooveskills/VERSIONS.md"),
      `Prompt in ${lang} must instruct to read .grooveskills/VERSIONS.md`
    );

    // Verify prompt orders reading context and updated skills
    assert.ok(
      rendered.prompt.includes(".grooveskills/memory/context.md"),
      `Prompt in ${lang} must instruct to read context.md`
    );
    assert.ok(
      rendered.prompt.includes(".agents/skills/"),
      `Prompt in ${lang} must instruct to read .agents/skills/`
    );

    // Verify prompt forbids modifying code without approval
    assert.ok(
      rendered.prompt.toLowerCase().includes("sin modificar") ||
        rendered.prompt.toLowerCase().includes("without editing") ||
        rendered.prompt.toLowerCase().includes("sem modificar") ||
        rendered.prompt.toLowerCase().includes("senza modificare") ||
        rendered.prompt.toLowerCase().includes("sans modifier"),
      `Prompt in ${lang} must prohibit modifying files until plan approval`
    );

    const cleanOutput = stripAnsi(rendered.formattedOutput);
    const lines = cleanOutput.split("\n");

    // Must start and end with empty line
    assert.strictEqual(lines[0], "");
    assert.strictEqual(lines[lines.length - 1], "");

    // Title box checks
    const line1 = lines[1] ?? "";
    const line2 = lines[2] ?? "";
    const line3 = lines[3] ?? "";
    assert.ok(line1.startsWith("╭─") && line1.endsWith("╮"), "Line 1 should be top border of title box");
    assert.ok(line2.startsWith("│ ") && line2.endsWith(" │"), "Line 2 should be title badge row");
    assert.ok(line2.includes("COPY & PASTE UPDATE PROMPT FOR YOUR AI AGENT"));
    assert.ok(line3.startsWith("╰─") && line3.endsWith("╯"), "Line 3 should be bottom border of title box");

    // Empty line before prompt
    assert.strictEqual(lines[4], "");

    // Line 5 is the prompt text: must be clean without vertical bars
    const promptLine = lines[5] ?? "";
    assert.strictEqual(promptLine, languageConfig.updatePrompt, "Prompt line must match languageConfig.updatePrompt exactly");
    assert.strictEqual(promptLine.includes("│"), false, "Prompt line must not contain vertical borders");
    assert.strictEqual(promptLine.includes("├"), false, "Prompt line must not contain divider lines");

    // Empty line after prompt
    assert.strictEqual(lines[6], "");

    // Line 7 is closing horizontal rule
    const closingRule = lines[7] ?? "";
    assert.ok(/^─+$/.test(closingRule), "Closing rule must be a horizontal line of dashes");
    assert.strictEqual(closingRule.length, line1.length, "Closing rule length should match box width");
  }

  // Check buildVersionsTemplate contents
  const versionsContent = buildVersionsTemplate();
  assert.ok(versionsContent.includes("[v1.20.0]"), "VERSIONS.md must contain v1.20.0");
  assert.ok(versionsContent.includes("[v1.19.0]"), "VERSIONS.md must contain v1.19.0");
  assert.ok(versionsContent.includes("[v1.18.0]"), "VERSIONS.md must contain v1.18.0");
  assert.ok(versionsContent.includes("[v1.17.0]"), "VERSIONS.md must contain v1.17.0");
  assert.ok(versionsContent.includes("[v1.16.0]"), "VERSIONS.md must contain v1.16.0");
  assert.ok(versionsContent.includes("[v1.15.0]"), "VERSIONS.md must contain v1.15.0");
  assert.ok(versionsContent.includes("[v1.14.0]"), "VERSIONS.md must contain v1.14.0");
  assert.ok(versionsContent.includes("[v1.13.0]"), "VERSIONS.md must contain v1.13.0");

  console.log("  ✔ Update prompt cleanly rendered and VERSIONS.md verified across all 5 languages.");
  console.log("✅ ALL UPDATE PROMPT & VERSIONS TESTS PASSED.");
}
