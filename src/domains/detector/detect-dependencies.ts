import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface PackageJsonDetection {
  dependencies: string[];
  exists: boolean;
}

export function detectDependencies(targetPath: string): PackageJsonDetection {
  const packageJsonPath = join(targetPath, "package.json");

  if (!existsSync(packageJsonPath)) {
    return { dependencies: [], exists: false };
  }

  try {
    const raw = readFileSync(packageJsonPath, "utf-8");
    const parsed = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const direct = Object.keys(parsed.dependencies ?? {});
    const dev = Object.keys(parsed.devDependencies ?? {});
    const all = Array.from(new Set([...direct, ...dev]));

    return { dependencies: all, exists: true };
  } catch {
    return { dependencies: [], exists: true };
  }
}
