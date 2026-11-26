import type { AgentAdapter } from "@/domains/adapters/adapter.interface";
import { linkAgentProfile } from "@/domains/adapters/link-agent-profile";
import { linkAgentSkill } from "@/domains/adapters/skill-reference-builder";
import type { AgentProfileMetadata } from "@/types/agent-profile.types";
import type { SkillMetadata } from "@/types/skill.types";

export class GeminiAdapter implements AgentAdapter {
  readonly id = "gemini" as const;
  readonly name = "Gemini Code Assist";
  readonly targetRelativeDir = ".gemini/skills";

  async installSkill(
    targetPath: string,
    skill: SkillMetadata,
    _skillSourceDir: string,
    transaction?: import("@/domains/fs/install-transaction").InstallTransaction
  ): Promise<string[]> {
    const symlinkPath = linkAgentSkill(targetPath, this.targetRelativeDir, skill, transaction);
    return [symlinkPath];
  }

  async installAgentProfile(
    targetPath: string,
    profile: AgentProfileMetadata,
    transaction?: import("@/domains/fs/install-transaction").InstallTransaction
  ): Promise<string[]> {
    return linkAgentProfile(targetPath, ".gemini/agents", profile.fileName, transaction);
  }
}
