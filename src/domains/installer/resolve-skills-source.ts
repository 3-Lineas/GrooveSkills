import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { existsSync } from "node:fs";

export function resolveSkillsSourceRoot(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFilePath);

  const candidate1 = resolve(currentDir, "../../../skills");
  if (existsSync(candidate1)) {
    return candidate1;
  }

  const candidate2 = resolve(currentDir, "../../skills");
  if (existsSync(candidate2)) {
    return candidate2;
  }

  const candidate3 = resolve(process.cwd(), "skills");
  if (existsSync(candidate3)) {
    return candidate3;
  }

  return join(process.cwd(), "skills");
}
