import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { existsSync } from "node:fs";

export function resolveSkillsSourceRoot(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFilePath);

  // 1. From dist/ in published npm package or local build: dist/../skills
  const candidateFromDist = resolve(currentDir, "../skills");
  if (existsSync(candidateFromDist)) {
    return candidateFromDist;
  }

  // 2. From src/domains/installer/ during development: ../../../skills
  const candidateFromSrc = resolve(currentDir, "../../../skills");
  if (existsSync(candidateFromSrc)) {
    return candidateFromSrc;
  }

  // 3. Search upward for the package root containing a skills directory
  let searchDir = currentDir;
  for (let i = 0; i < 5; i++) {
    const candidate = join(searchDir, "skills");
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(searchDir);
    if (parent === searchDir) {
      break;
    }
    searchDir = parent;
  }

  throw new Error(
    `GrooveSkills internal error: Unable to locate bundled skills directory from ${currentDir}`
  );
}
