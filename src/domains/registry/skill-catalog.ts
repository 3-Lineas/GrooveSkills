import type { SkillMetadata } from "@/types/skill.types";

export const SKILL_CATALOG: SkillMetadata[] = [
  {
    id: "best-practices",
    name: "Universal Best Practices",
    description: "Multi-language clean code standards, early returns, no barrel files, strict typing, <200 lines",
    dependencies: [],
    directoryName: "best-practices",
  },
  {
    id: "hono",
    name: "Hono Architecture (Valibot)",
    description: "Enterprise Hono API standard with Valibot validation, isolated Actions layer, and RPC bindings",
    dependencies: ["hono", "@hono/valibot-validator", "@hono/standard-validator"],
    directoryName: "hono",
  },
];
