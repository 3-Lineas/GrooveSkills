import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface PackageJsonDetection {
  dependencies: string[];
  exists: boolean;
}

export function detectDependencies(targetPath: string): PackageJsonDetection {
  const detected = new Set<string>();
  let hasManifest = false;

  const packageJsonPath = join(targetPath, "package.json");
  if (existsSync(packageJsonPath)) {
    hasManifest = true;
    try {
      const raw = readFileSync(packageJsonPath, "utf-8");
      const parsed = JSON.parse(raw) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      for (const dep of Object.keys(parsed.dependencies ?? {})) {
        detected.add(dep);
      }
      for (const dep of Object.keys(parsed.devDependencies ?? {})) {
        detected.add(dep);
      }
    } catch {
      // Ignore JSON parse errors gracefully
    }
  }

  const cargoPath = join(targetPath, "Cargo.toml");
  if (existsSync(cargoPath)) {
    hasManifest = true;
    detected.add("rust");
  }

  const pyprojectPath = join(targetPath, "pyproject.toml");
  const requirementsPath = join(targetPath, "requirements.txt");
  if (existsSync(pyprojectPath) || existsSync(requirementsPath)) {
    hasManifest = true;
    detected.add("python");
  }

  return {
    dependencies: Array.from(detected),
    exists: hasManifest,
  };
}
