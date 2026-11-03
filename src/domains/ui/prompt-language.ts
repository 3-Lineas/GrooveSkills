import * as prompts from "@clack/prompts";
import type { ProjectLanguage } from "@/types/harness.types";

export async function promptLanguage(
  defaultLanguage: ProjectLanguage = "es"
): Promise<ProjectLanguage | symbol> {
  const options = [
    { value: "es", label: "Español (Spanish)", hint: "Recommended for Spanish-speaking projects" },
    { value: "en", label: "English", hint: "Standard international English" },
    { value: "pt", label: "Português (Portuguese)", hint: "Portuguese for Brazil and Portugal" },
    { value: "it", label: "Italiano (Italian)", hint: "Italian language communication" },
    { value: "fr", label: "Français (French)", hint: "French language communication" },
  ];

  const selected = await prompts.select({
    message: "Which language should AI agents use for user-facing copy and communication?",
    options,
    initialValue: defaultLanguage,
  });

  return selected as ProjectLanguage | symbol;
}
