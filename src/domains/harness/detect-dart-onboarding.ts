import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function isFlutterProject(targetPath: string): boolean {
  const pubspecPath = join(targetPath, "pubspec.yaml");
  if (!existsSync(pubspecPath)) {
    return false;
  }

  try {
    const content = readFileSync(pubspecPath, "utf-8");
    return /sdk:\s*flutter\b/.test(content) || /^\s*flutter:\s*$/m.test(content);
  } catch {
    return false;
  }
}

export function detectDartOrFlutterProjectName(targetPath: string): string | null {
  const pubspecPath = join(targetPath, "pubspec.yaml");
  if (!existsSync(pubspecPath)) {
    return null;
  }

  try {
    const content = readFileSync(pubspecPath, "utf-8");
    const nameMatch = content.match(/^name:\s*["']?([a-zA-Z0-9_-]+)["']?/m);
    if (nameMatch?.[1]) {
      return nameMatch[1];
    }
  } catch {
    // Fall through cleanly
  }

  return null;
}

export function detectDartOrFlutterCommands(targetPath: string): Record<string, string> {
  const pubspecPath = join(targetPath, "pubspec.yaml");
  if (!existsSync(pubspecPath)) {
    return {};
  }

  if (isFlutterProject(targetPath)) {
    return {
      dev: "flutter run",
      build: "flutter build",
      test: "flutter test",
      lint: "flutter analyze",
      format: "dart format --output=none --set-exit-if-changed .",
    };
  }

  return {
    test: "dart test",
    lint: "dart analyze --fatal-infos",
    format: "dart format --output=none --set-exit-if-changed .",
    fix: "dart fix --apply",
  };
}
