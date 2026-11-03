import pc from "picocolors";
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
  const langConfig = SUPPORTED_LANGUAGES[language] ?? SUPPORTED_LANGUAGES.es;
  const title = langConfig.onboardingPromptTitle;
  const prompt = langConfig.onboardingPrompt;

  const separator = pc.cyan("─".repeat(60));
  const formattedOutput = [
    separator,
    pc.bold(pc.yellow(title)),
    "",
    pc.green(prompt),
    separator,
  ].join("\n");

  return {
    title,
    prompt,
    formattedOutput,
  };
}
