import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface PackageJsonDetection {
  dependencies: string[];
  exists: boolean;
}

function readPackageJsonDependencies(manifestPath: string): string[] {
  if (!existsSync(manifestPath)) {
    return [];
  }

  try {
    const raw = readFileSync(manifestPath, "utf-8");
    const parsed = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    return [
      ...Object.keys(parsed.dependencies ?? {}),
      ...Object.keys(parsed.devDependencies ?? {}),
    ];
  } catch {
    return [];
  }
}

export function detectDependencies(targetPath: string): PackageJsonDetection {
  const detected = new Set<string>();
  let hasManifest = false;

  const packageJsonPath = join(targetPath, "package.json");
  if (existsSync(packageJsonPath)) {
    hasManifest = true;
    for (const dependencyName of readPackageJsonDependencies(packageJsonPath)) {
      detected.add(dependencyName);
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

  const goModPath = join(targetPath, "go.mod");
  const hasGoMod = existsSync(goModPath);
  if (hasGoMod) {
    hasManifest = true;
    detected.add("go");
    try {
      const goModContent = readFileSync(goModPath, "utf-8");
      if (goModContent.includes("github.com/wailsapp/wails")) {
        detected.add("wails");
      }
    } catch {
      // Ignore read errors gracefully
    }
  }

  const pubspecPath = join(targetPath, "pubspec.yaml");
  if (existsSync(pubspecPath)) {
    hasManifest = true;
    detected.add("dart");
    try {
      const pubspecContent = readFileSync(pubspecPath, "utf-8");
      if (/sdk:\s*flutter\b/.test(pubspecContent) || /^\s*flutter:\s*$/m.test(pubspecContent)) {
        detected.add("flutter");
      }
    } catch {
      // Ignore read errors gracefully
    }
  }

  const hasWailsConfig = existsSync(join(targetPath, "build", "config.yml"));
  const frontendPackageJsonPath = join(targetPath, "frontend", "package.json");
  if ((hasGoMod || hasWailsConfig) && existsSync(frontendPackageJsonPath)) {
    const frontendDeps = readPackageJsonDependencies(frontendPackageJsonPath);
    if (frontendDeps.includes("@wailsio/runtime")) {
      hasManifest = true;
      detected.add("wails");
    }
    if (detected.has("wails")) {
      hasManifest = true;
      for (const dependencyName of frontendDeps) {
        detected.add(dependencyName);
      }
    }
  }

  return {
    dependencies: Array.from(detected),
    exists: hasManifest,
  };
}
