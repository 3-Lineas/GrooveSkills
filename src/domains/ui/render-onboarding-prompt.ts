import picocolors from "picocolors";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
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

  const separator = picocolors.cyan("─".repeat(60));
  const formattedOutput = [
    separator,
    picocolors.bold(picocolors.yellow(title)),
    "",
    picocolors.green(prompt),
    separator,
  ].join("\n");

  return {
    title,
    prompt,
    formattedOutput,
  };
}
