import { homedir } from "node:os";
import { join } from "node:path";

export function getGlobalStoreDir(): string {
  return join(homedir(), ".grooveskills");
}

export function getGlobalSkillsDir(): string {
  return join(getGlobalStoreDir(), "skills");
}

export function getGlobalCursorRulesDir(): string {
  return join(getGlobalStoreDir(), "cursor-rules");
}
