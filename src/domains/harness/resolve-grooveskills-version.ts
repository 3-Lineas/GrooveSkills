import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

declare const __VERSION__: string | undefined;

function findPackageVersionFromUrl(moduleUrl: string): string {
  try {
    let currentDirectory = dirname(fileURLToPath(moduleUrl));
    for (let depth = 0; depth < 5; depth += 1) {
      const packageJsonPath = join(currentDirectory, "package.json");
      if (existsSync(packageJsonPath)) {
        const rawContent = readFileSync(packageJsonPath, "utf-8");
        const parsedContent = JSON.parse(rawContent) as { name?: string; version?: string };
        if (parsedContent.name === "@3lineas/grooveskills" && parsedContent.version) {
          return parsedContent.version;
        }
      }
      const parentDirectory = dirname(currentDirectory);
      if (parentDirectory === currentDirectory) {
        break;
      }
      currentDirectory = parentDirectory;
    }
  } catch {
    // Return fallback version if traversing filesystem encounters errors
  }
  return "1.18.0";
}

export function resolveGrooveSkillsVersion(): string {
  if (typeof __VERSION__ !== "undefined" && __VERSION__) {
    return __VERSION__;
  }
  return findPackageVersionFromUrl(import.meta.url);
}
