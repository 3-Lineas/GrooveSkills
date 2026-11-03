import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { resolveSkillsSourceRoot } from "@/domains/installer/resolve-skills-source";
import { getProjectSkillsDir } from "@/domains/project-store/project-paths";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";
import type { InstallTransaction } from "@/domains/fs/install-transaction";
import type { AgentId } from "@/types/agent.types";

export function syncProjectStore(
  targetPath: string,
  selectedSkillIds: string[],
  _selectedAgents: AgentId[],
  transaction?: InstallTransaction
): void {
  const bundledSkillsDir = resolveSkillsSourceRoot();
  const projectSkillsDir = getProjectSkillsDir(targetPath);

  if (transaction) {
    transaction.recordCreatedDir(projectSkillsDir);
  }

  if (!existsSync(projectSkillsDir)) {
    mkdirSync(projectSkillsDir, { recursive: true });
  }

  // Clean legacy cursor-rules directory if it exists
  const legacyCursorRules = join(targetPath, ".grooveskills", "cursor-rules");
  if (existsSync(legacyCursorRules)) {
    try {
      rmSync(legacyCursorRules, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }

  for (const skillId of selectedSkillIds) {
    const skill = SKILL_CATALOG.find((item) => item.id === skillId);
    if (!skill) {
      continue;
    }

    const sourceSkillDir = join(bundledSkillsDir, skill.directoryName);
    const destSkillDir = join(projectSkillsDir, skill.directoryName);

    if (transaction) {
      transaction.recordCreatedDir(destSkillDir);
    }

    if (existsSync(sourceSkillDir)) {
      cpSync(sourceSkillDir, destSkillDir, { recursive: true });
    }
  }
}
