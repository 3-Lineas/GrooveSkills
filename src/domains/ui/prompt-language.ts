import * as p from "@clack/prompts";
import type { ProjectLanguage } from "@/types/harness.types";

export async function promptLanguage(defaultLanguage: ProjectLanguage = "es"): Promise<ProjectLanguage | symbol> {
  const options = [
    { value: "es", label: "Español (Spanish)", hint: "Recomendado para proyectos en español" },
    { value: "en", label: "English", hint: "Standard international English" },
    { value: "pt", label: "Português (Portuguese)", hint: "Português para o Brasil e Portugal" },
    { value: "it", label: "Italiano (Italian)", hint: "Comunicazione in lingua italiana" },
    { value: "fr", label: "Français (French)", hint: "Communication en langue française" },
  ];

  const selected = await p.select({
    message: "Which language should AI agents use for user-facing copy and communication?",
    options,
    initialValue: defaultLanguage,
  });

  return selected as ProjectLanguage | symbol;
}
