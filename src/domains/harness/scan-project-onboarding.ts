import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

export interface ProjectOnboardingProfile {
  projectName: string;
  packageManager: string;
  commands: Record<string, string>;
  pathAliases: Record<string, string>;
  sourceDirectories: string[];
}

function detectProjectName(targetPath: string): string {
  const packageJsonPath = join(targetPath, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const raw = readFileSync(packageJsonPath, "utf-8");
      const parsed = JSON.parse(raw) as { name?: string };
      if (typeof parsed.name === "string" && parsed.name.trim().length > 0) {
        return parsed.name.trim();
      }
    } catch {
      // Fall through to other manifests
    }
  }

  const cargoPath = join(targetPath, "Cargo.toml");
  if (existsSync(cargoPath)) {
    try {
      const cargoRaw = readFileSync(cargoPath, "utf-8");
      const nameMatch = cargoRaw.match(/name\s*=\s*"([^"]+)"/);
      if (nameMatch?.[1]) {
        return nameMatch[1];
      }
    } catch {
      // Fall through
    }
  }

  const pyprojectPath = join(targetPath, "pyproject.toml");
  if (existsSync(pyprojectPath)) {
    try {
      const pyprojectRaw = readFileSync(pyprojectPath, "utf-8");
      const nameMatch = pyprojectRaw.match(/name\s*=\s*"([^"]+)"/);
      if (nameMatch?.[1]) {
        return nameMatch[1];
      }
    } catch {
      // Fall through
    }
  }

  return basename(targetPath) || "project";
}

function detectPackageManager(targetPath: string): string {
  if (existsSync(join(targetPath, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (existsSync(join(targetPath, "bun.lockb")) || existsSync(join(targetPath, "bun.lock"))) {
    return "bun";
  }
  if (existsSync(join(targetPath, "yarn.lock"))) {
    return "yarn";
  }
  if (existsSync(join(targetPath, "package-lock.json"))) {
    return "npm";
  }
  if (existsSync(join(targetPath, "Cargo.lock")) || existsSync(join(targetPath, "Cargo.toml"))) {
    return "cargo";
  }
  if (existsSync(join(targetPath, "uv.lock"))) {
    return "uv";
  }
  if (existsSync(join(targetPath, "poetry.lock"))) {
    return "poetry";
  }
  return "npm";
}

function detectCommands(targetPath: string, packageManager: string): Record<string, string> {
  const packageJsonPath = join(targetPath, "package.json");
  if (!existsSync(packageJsonPath)) {
    return {};
  }

  try {
    const raw = readFileSync(packageJsonPath, "utf-8");
    const parsed = JSON.parse(raw) as { scripts?: Record<string, string> };
    const scripts = parsed.scripts ?? {};
    const commands: Record<string, string> = {};

    const runner = packageManager === "npm" ? "npm run" : packageManager;

    if (scripts.build) {
      commands.build = `${runner} build`;
    }
    if (scripts["check-types"]) {
      commands.typecheck = `${runner} check-types`;
    } else if (scripts.typecheck) {
      commands.typecheck = `${runner} typecheck`;
    } else if (scripts.tsc) {
      commands.typecheck = `${runner} tsc`;
    }

    if (scripts.test) {
      commands.test = `${runner} test`;
    }
    if (scripts.lint) {
      commands.lint = `${runner} lint`;
    }
    if (scripts.dev) {
      commands.dev = `${runner} dev`;
    }

    return commands;
  } catch {
    return {};
  }
}

function detectPathAliases(targetPath: string): Record<string, string> {
  const tsconfigPath = join(targetPath, "tsconfig.json");
  if (!existsSync(tsconfigPath)) {
    return {};
  }

  try {
    const raw = readFileSync(tsconfigPath, "utf-8");
    const parsed = JSON.parse(raw) as {
      compilerOptions?: {
        paths?: Record<string, string[]>;
      };
    };
    const paths = parsed.compilerOptions?.paths ?? {};
    const aliases: Record<string, string> = {};

    for (const [aliasKey, aliasTargets] of Object.entries(paths)) {
      if (Array.isArray(aliasTargets) && typeof aliasTargets[0] === "string") {
        aliases[aliasKey] = aliasTargets[0];
      }
    }

    return aliases;
  } catch {
    return {};
  }
}

function detectSourceDirectories(targetPath: string): string[] {
  const srcPath = join(targetPath, "src");
  const scanTarget = existsSync(srcPath) ? srcPath : targetPath;

  try {
    const entries = readdirSync(scanTarget, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => !name.startsWith(".") && name !== "node_modules" && name !== "dist");
  } catch {
    return [];
  }
}

export function scanProjectOnboarding(targetPath: string): ProjectOnboardingProfile {
  const projectName = detectProjectName(targetPath);
  const packageManager = detectPackageManager(targetPath);
  const commands = detectCommands(targetPath, packageManager);
  const pathAliases = detectPathAliases(targetPath);
  const sourceDirectories = detectSourceDirectories(targetPath);

  return {
    projectName,
    packageManager,
    commands,
    pathAliases,
    sourceDirectories,
  };
}
