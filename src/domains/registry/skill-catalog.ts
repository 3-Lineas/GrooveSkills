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
  {
    id: "react-core",
    name: "React Core Fundamentals",
    description: "Opinionated React fundamentals: function components, JSX, immutable state, core hooks, lists, and controlled inputs",
    dependencies: ["react", "react-dom"],
    directoryName: "react-core",
  },
  {
    id: "react-advanced",
    name: "React 19 Advanced & Compiler Architecture",
    description: "Modern React 19 platform features: React Compiler auto-memoization, concurrent rendering, use(), Actions, virtualization, and RSC boundaries",
    dependencies: ["react", "react-dom"],
    directoryName: "react-advanced",
  },
  {
    id: "react-create-page",
    name: "React Page & View Architecture",
    description: "Clean architecture for React pages: declarative page coordinators, domain hooks, isolated API actions, Valibot + Formisch forms, and atomic co-location",
    dependencies: ["react", "react-dom"],
    directoryName: "react-create-page",
  },
];
