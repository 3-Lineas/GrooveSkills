import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getProjectAgentsDir } from "@/domains/project-store/project-paths";
import { resolveAgentsSourceRoot } from "@/domains/installer/resolve-agents-source";
import { AGENT_PROFILE_CATALOG } from "@/domains/registry/agent-profile-catalog";
import { SUPPORTED_LANGUAGES } from "@/domains/harness/harness-languages";
import { safeWriteFileSync } from "@/domains/fs/safe-file-writer";
import type { InstallTransaction } from "@/domains/fs/install-transaction";
import type { ProjectLanguage } from "@/types/harness.types";

export function syncAgentProfilesStore(
  targetPath: string,
  profileIds: string[],
  language: ProjectLanguage = "es",
  transaction?: InstallTransaction
): string[] {
  if (profileIds.length === 0) {
    return [];
  }

  const sourceRoot = resolveAgentsSourceRoot();
  const projectAgentsDir = getProjectAgentsDir(targetPath);
  if (!existsSync(projectAgentsDir)) {
    mkdirSync(projectAgentsDir, { recursive: true });
    transaction?.recordCreatedDir(projectAgentsDir);
  }

  const languageConfig =
    SUPPORTED_LANGUAGES[language] ?? SUPPORTED_LANGUAGES.es;

  const languageBlock = [
    `## Idioma de Comunicación (${languageConfig.nativeName})`,
    `- **Idioma configurado**: \`${languageConfig.code}\` (${languageConfig.nativeName})`,
    `- **Regla**: ${languageConfig.instruction}`,
  ].join("\n");

  const writtenFiles: string[] = [];

  for (const profileId of profileIds) {
    const profileMeta = AGENT_PROFILE_CATALOG.find(
      (entry) => entry.id === profileId
    );
    if (!profileMeta) {
      continue;
    }

    const sourcePath = join(sourceRoot, profileMeta.fileName);
    if (!existsSync(sourcePath)) {
      continue;
    }

    const rawTemplate = readFileSync(sourcePath, "utf-8");
    const renderedContent = rawTemplate.replace(
      "{{LANGUAGE_BLOCK}}",
      languageBlock
    );

    const destinationPath = join(projectAgentsDir, profileMeta.fileName);
    transaction?.recordBeforeWrite(destinationPath);
    safeWriteFileSync(destinationPath, renderedContent);
    writtenFiles.push(destinationPath);
  }

  return writtenFiles;
}
