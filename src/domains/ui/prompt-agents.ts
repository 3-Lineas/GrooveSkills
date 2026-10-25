import * as p from "@clack/prompts";
import type { AgentId } from "@/types/agent.types";

export async function promptAgents(detectedAgents: AgentId[]): Promise<AgentId[] | symbol> {
  const options: Array<{ value: AgentId; label: string; hint: string }> = [
    { value: "antigravity", label: "Antigravity", hint: ".agents/skills (Google Agentic IDE)" },
    { value: "claude", label: "Claude Code", hint: ".claude/skills (Anthropic Claude Code)" },
    { value: "cursor", label: "Cursor", hint: ".cursor/rules/*.mdc (Cursor IDE Rules)" },
    { value: "gemini", label: "Gemini Code Assist", hint: ".gemini/skills (Google Gemini)" },
  ];

  const initialValues: AgentId[] = detectedAgents.length > 0 ? detectedAgents : ["antigravity"];

  const selected = await p.multiselect({
    message: "Which AI agents should be configured?",
    options,
    initialValues,
    required: true,
  });

  return selected as AgentId[] | symbol;
}
