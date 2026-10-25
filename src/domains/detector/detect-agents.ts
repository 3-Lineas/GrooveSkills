import { readdirSync } from "node:fs";
import type { AgentId } from "@/types/agent.types";

export function detectAgents(targetPath: string): AgentId[] {
  const detected: AgentId[] = [];

  try {
    const entries = new Set(readdirSync(targetPath));

    if (entries.has(".agents")) {
      detected.push("antigravity");
    }
    if (entries.has(".claude")) {
      detected.push("claude");
    }
    if (entries.has(".cursor")) {
      detected.push("cursor");
    }
    if (entries.has(".gemini")) {
      detected.push("gemini");
    }
  } catch {
    // If directory cannot be read, return empty list gracefully
  }

  return detected;
}
