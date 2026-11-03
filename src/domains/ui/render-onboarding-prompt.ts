import picocolors from "picocolors";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
import { getTerminalWidth, wrapText } from "@/domains/ui/terminal-layout";
import type { ProjectLanguage } from "@/types/harness.types";

export interface OnboardingPromptRender {
  title: string;
  prompt: string;
  formattedOutput: string;
}

export function formatOnboardingPrompt(
  language: ProjectLanguage = "es"
): OnboardingPromptRender {
  const languageConfig = SUPPORTED_LANGUAGES[language] ?? SUPPORTED_LANGUAGES.es;
  const title = languageConfig.onboardingPromptTitle;
  const prompt = languageConfig.onboardingPrompt;

  const boxWidth = Math.max(getTerminalWidth(80) - 4, 50);
  const contentWidth = boxWidth - 4;
  const wrappedPromptLines = wrapText(prompt, contentWidth).split("\n");

  const borderHorizontal = "─".repeat(boxWidth - 2);
  const badgeText = " COPY & PASTE PROMPT FOR YOUR AI AGENT ";
  const badgePadded = badgeText.padEnd(contentWidth, " ");

  const topBorder = picocolors.cyan(`╭${borderHorizontal}╮`);
  const badgeLine = `${picocolors.cyan("│ ")}${picocolors.bold(picocolors.bgCyan(picocolors.black(badgePadded)))}${picocolors.cyan(" │")}`;
  const dividerLine = picocolors.cyan(`├${borderHorizontal}┤`);
  const promptLines = wrappedPromptLines.map((line) => {
    const paddedLine = line.padEnd(contentWidth, " ");
    return `${picocolors.cyan("│ ")}${picocolors.bold(picocolors.white(paddedLine))}${picocolors.cyan(" │")}`;
  });
  const bottomBorder = picocolors.cyan(`╰${borderHorizontal}╯`);

  const formattedOutput = [
    "",
    topBorder,
    badgeLine,
    dividerLine,
    ...promptLines,
    bottomBorder,
    "",
  ].join("\n");

  return {
    title,
    prompt,
    formattedOutput,
  };
}
