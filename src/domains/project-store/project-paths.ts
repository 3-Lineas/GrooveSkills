import { join } from "node:path";

export function getProjectStoreDir(targetPath: string): string {
  return join(targetPath, ".grooveskills");
}

export function getProjectSkillsDir(targetPath: string): string {
  return join(getProjectStoreDir(targetPath), "skills");
}

export function getProjectCursorRulesDir(targetPath: string): string {
  return join(getProjectStoreDir(targetPath), "cursor-rules");
}

export function getProjectMemoryDir(targetPath: string): string {
  return join(getProjectStoreDir(targetPath), "memory");
}

export function getProjectTasksDir(targetPath: string): string {
  return join(getProjectMemoryDir(targetPath), "tasks");
}

export function getProjectConfigPath(targetPath: string): string {
  return join(getProjectStoreDir(targetPath), "config.json");
}
