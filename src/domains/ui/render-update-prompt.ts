import picocolors from "picocolors";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
import { getTerminalWidth } from "@/domains/ui/terminal-layout";
import type { ProjectLanguage } from "@/types/harness.types";

export interface UpdatePromptRender {
  title: string;
  prompt: string;
  formattedOutput: string;
}

export function formatUpdatePrompt(
  language: ProjectLanguage = "es"
): UpdatePromptRender {
  const languageConfig = SUPPORTED_LANGUAGES[language] ?? SUPPORTED_LANGUAGES.es;
  const title = languageConfig.updatePromptTitle;
  const prompt = languageConfig.updatePrompt;

  const boxWidth = Math.max(getTerminalWidth(80) - 4, 50);
  const contentWidth = boxWidth - 4;
  const borderHorizontal = "─".repeat(boxWidth - 2);
  const badgeText = " COPY & PASTE UPDATE PROMPT FOR YOUR AI AGENT ";
  const badgePadded = badgeText.padEnd(contentWidth, " ");

  const topBorder = picocolors.cyan(`╭${borderHorizontal}╮`);
  const badgeLine = `${picocolors.cyan("│ ")}${picocolors.bold(picocolors.bgCyan(picocolors.black(badgePadded)))}${picocolors.cyan(" │")}`;
  const titleBottomBorder = picocolors.cyan(`╰${borderHorizontal}╯`);
  const promptBlock = picocolors.bold(picocolors.white(prompt));
  const closingRule = picocolors.cyan("─".repeat(boxWidth));

  const formattedOutput = [
    "",
    topBorder,
    badgeLine,
    titleBottomBorder,
    "",
    promptBlock,
    "",
    closingRule,
    "",
  ].join("\n");

  return {
    title,
    prompt,
    formattedOutput,
  };
}
