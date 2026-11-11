import assert from "node:assert";
import { formatOnboardingPrompt } from "./render-onboarding-prompt";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
import type { ProjectLanguage } from "@/types/harness.types";

function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export function runOnboardingPromptRenderTests(): void {
  console.log("▶ Starting verification suite: Onboarding Prompt Clean Rendering...");

  const languages: ProjectLanguage[] = ["es", "en", "pt", "it", "fr"];

  for (const lang of languages) {
    const languageConfig = SUPPORTED_LANGUAGES[lang];
    const rendered = formatOnboardingPrompt(lang);

    assert.strictEqual(rendered.title, languageConfig.onboardingPromptTitle);
    assert.strictEqual(rendered.prompt, languageConfig.onboardingPrompt);

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

  console.log("  ✔ Onboarding prompt renders as clean copyable text without side borders across all languages.");
  console.log("✅ ALL ONBOARDING PROMPT RENDER TESTS PASSED.");
}
