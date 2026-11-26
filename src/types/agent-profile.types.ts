export type AgentProfileId =
  | "cf-turbo-hono-next"
  | "cf-turbo-hono-react"
  | "cf-nextjs";

export interface AgentProfileMetadata {
  id: AgentProfileId;
  name: string;
  fileName: string;
  description: string;
  recommendedSkills: string[];
  dependencies: string[];
}
