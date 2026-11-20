import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function isWailsProject(targetPath: string): boolean {
  if (existsSync(join(targetPath, "build", "config.yml"))) {
    return true;
  }

  const goModPath = join(targetPath, "go.mod");
  if (!existsSync(goModPath)) {
    return false;
  }

  try {
    return readFileSync(goModPath, "utf-8").includes("github.com/wailsapp/wails");
  } catch {
    return false;
  }
}

export function detectGoOrWailsProjectName(targetPath: string): string | undefined {
  const wailsConfigPath = join(targetPath, "build", "config.yml");
  if (existsSync(wailsConfigPath)) {
    try {
      const configRaw = readFileSync(wailsConfigPath, "utf-8");
      const topLevelNameMatch = configRaw.match(/^name:\s*["']?([^"'\r\n#]+)["']?/m);
      if (topLevelNameMatch?.[1]?.trim()) {
        return topLevelNameMatch[1].trim();
      }
      const productNameMatch = configRaw.match(/^\s+productName:\s*["']?([^"'\r\n#]+)["']?/m);
      if (productNameMatch?.[1]?.trim()) {
        return productNameMatch[1].trim();
      }
    } catch {
      // Fall through to go.mod
    }
  }

  const goModPath = join(targetPath, "go.mod");
  if (!existsSync(goModPath)) {
    return undefined;
  }

  try {
    const goModRaw = readFileSync(goModPath, "utf-8");
    const moduleMatch = goModRaw.match(/^module\s+["']?([^"'\s]+)["']?/m);
    if (!moduleMatch?.[1]) {
      return undefined;
    }
    const segments = moduleMatch[1].split("/").filter((segment) => segment.length > 0);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment && /^v\d+$/.test(lastSegment) && segments.length > 1) {
      return segments[segments.length - 2];
    }
    return lastSegment || moduleMatch[1];
  } catch {
    return undefined;
  }
}

export function detectGoOrWailsCommands(targetPath: string): Record<string, string> {
  const goModPath = join(targetPath, "go.mod");
  if (!existsSync(goModPath)) {
    return {};
  }

  const commands: Record<string, string> = {
    build: "go build ./...",
    test: "go test -race -count=1 ./...",
    lint: "golangci-lint run",
  };

  if (isWailsProject(targetPath)) {
    commands.dev = "wails3 dev";
    commands.build = "wails3 build";
    commands.bindings = "wails3 generate bindings";
  }

  return commands;
}
