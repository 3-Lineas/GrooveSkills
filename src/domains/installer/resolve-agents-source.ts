import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { existsSync } from "node:fs";

export function resolveAgentsSourceRoot(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFilePath);

  // 1. From dist/ in published npm package or local build: dist/../agents
  const candidateFromDist = resolve(currentDir, "../agents");
  if (existsSync(candidateFromDist)) {
    return candidateFromDist;
  }

  // 2. From src/domains/installer/ during development: ../../../agents
  const candidateFromSrc = resolve(currentDir, "../../../agents");
  if (existsSync(candidateFromSrc)) {
    return candidateFromSrc;
  }

  // 3. Search upward for the package root containing an agents directory
  let searchDir = currentDir;
  for (let depth = 0; depth < 5; depth++) {
    const candidate = join(searchDir, "agents");
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
    `GrooveSkills internal error: Unable to locate bundled agents directory from ${currentDir}`
  );
}
