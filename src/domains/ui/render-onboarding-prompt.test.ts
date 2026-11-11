import assert from "node:assert";
import { formatOnboardingPrompt } from "./render-onboarding-prompt";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
import { buildOnboardingTaskTemplate } from "@/domains/harness/harness-templates";
import type { ProjectLanguage } from "@/types/harness.types";

function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export function runOnboardingPromptRenderTests(): void {
  console.log("▶ Starting verification suite: Onboarding Prompt Clean Rendering & Boundaries...");

  const languages: ProjectLanguage[] = ["es", "en", "pt", "it", "fr"];

  for (const lang of languages) {
    const languageConfig = SUPPORTED_LANGUAGES[lang];
    const rendered = formatOnboardingPrompt(lang);

    assert.strictEqual(rendered.title, languageConfig.onboardingPromptTitle);
    assert.strictEqual(rendered.prompt, languageConfig.onboardingPrompt);

    // Verify prompt does NOT contain ambiguous phrase that triggered eager implementation
    assert.strictEqual(
      rendered.prompt.toLowerCase().includes("adapt the project to my needs"),
      false,
      "Prompt must not contain old ambiguous phrase 'adapt the project to my needs'"
    );
    assert.strictEqual(
      rendered.prompt.toLowerCase().includes("adaptar el proyecto a mis necesidades"),
      false,
      "Prompt must not contain old ambiguous phrase 'adaptar el proyecto a mis necesidades'"
    );

    // Verify prompt finishes by mentioning onboarding completion in friendly language
    assert.ok(
      rendered.prompt.toLowerCase().includes("onboarding"),
      "Prompt must mention onboarding in its closing goal"
    );

    const cleanOutput = stripAnsi(rendered.formattedOutput);
    const lines = cleanOutput.split("\n");

    // Must start and end with empty line for breathing room
    assert.strictEqual(lines[0], "");
    assert.strictEqual(lines[lines.length - 1], "");

    // Title box checks
    const line1 = lines[1] ?? "";
    const line2 = lines[2] ?? "";
    const line3 = lines[3] ?? "";
    assert.ok(line1.startsWith("╭─") && line1.endsWith("╮"), "Line 1 should be top border of title box");
    assert.ok(line2.startsWith("│ ") && line2.endsWith(" │"), "Line 2 should be title badge row");
    assert.ok(line2.includes("COPY & PASTE PROMPT FOR YOUR AI AGENT"));
    assert.ok(line3.startsWith("╰─") && line3.endsWith("╯"), "Line 3 should be bottom border of title box");

    // Empty line before prompt
    assert.strictEqual(lines[4], "");

    // Line 5 is the prompt text: must be clean without vertical bars
    const promptLine = lines[5] ?? "";
    assert.strictEqual(promptLine, languageConfig.onboardingPrompt, "Prompt line must match languageConfig.onboardingPrompt exactly");
    assert.strictEqual(promptLine.includes("│"), false, "Prompt line must not contain vertical borders");
    assert.strictEqual(promptLine.includes("├"), false, "Prompt line must not contain divider lines");
    assert.strictEqual(promptLine, promptLine.trimEnd(), "Prompt line must have no trailing padding");

    // Empty line after prompt
    assert.strictEqual(lines[6], "");

    // Line 7 is closing horizontal rule
    const closingRule = lines[7] ?? "";
    assert.ok(/^─+$/.test(closingRule), "Closing rule must be a horizontal line of dashes");
    assert.strictEqual(closingRule.length, line1.length, "Closing rule length should match box width");

    // Empty line before end
    assert.strictEqual(lines[8], "");
  }

  // Verify onboarding task template contains strict boundaries and completion stop rule
  const taskTemplate = buildOnboardingTaskTemplate("TestApp");
  assert.ok(
    taskTemplate.includes("Out of scope (STRICT BOUNDARY)"),
    "00-onboarding template must contain strict boundary heading"
  );
  assert.ok(
    taskTemplate.includes("Completion Stop Rule"),
    "00-onboarding template must contain Completion Stop Rule"
  );
  assert.ok(
    taskTemplate.includes("STOP and wait for the user's next instruction"),
    "00-onboarding template checklist must contain explicit stop instruction"
  );

  console.log("  ✔ Onboarding prompt renders as clean copyable text without side borders across all languages.");
  console.log("  ✔ Onboarding task template strictly defines out-of-scope boundaries and stop rule.");
  console.log("✅ ALL ONBOARDING PROMPT RENDER TESTS PASSED.");
}
