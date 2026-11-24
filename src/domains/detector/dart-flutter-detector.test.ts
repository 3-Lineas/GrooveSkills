import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectProjectContext } from "@/domains/detector/project-detector";
import { scanProjectOnboarding } from "@/domains/harness/scan-project-onboarding";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

export function runDartAndFlutterDetectorTests(): void {
  console.log("▶ Starting verification suite: Dart & Flutter Stack Detection & Onboarding...");

  const expectedSkillIds = [
    "dart-clean",
    "dart-testing",
    "flutter-architecture",
    "flutter-ui-layout",
  ];

  for (const skillId of expectedSkillIds) {
    const entry = SKILL_CATALOG.find((skill) => skill.id === skillId);
    assert.ok(entry, `SKILL_CATALOG must include '${skillId}'`);
    const skillMarkdownPath = join(process.cwd(), "skills", entry.directoryName, "SKILL.md");
    assert.ok(
      existsSync(skillMarkdownPath),
      `Skill markdown must exist on disk at ${skillMarkdownPath}`,
    );
  }

  // 1. Pure Dart project (pubspec.yaml without Flutter)
  const dartDir = mkdtempSync(join(tmpdir(), "gs-dart-only-"));
  try {
    mkdirSync(join(dartDir, "lib", "actions"), { recursive: true });
    writeFileSync(
      join(dartDir, "pubspec.yaml"),
      `name: pure_dart_service\nenvironment:\n  sdk: ^3.5.0\ndependencies:\n  path: ^1.9.0\n`,
    );

    const dartContext = detectProjectContext(dartDir);
    assert.ok(dartContext.detectedDependencies.includes("dart"));
    assert.ok(!dartContext.detectedDependencies.includes("flutter"));
    assert.ok(dartContext.suggestedSkillIds.includes("dart-clean"));
    assert.ok(dartContext.suggestedSkillIds.includes("dart-testing"));
    assert.ok(!dartContext.suggestedSkillIds.includes("flutter-architecture"));
    assert.ok(!dartContext.suggestedSkillIds.includes("flutter-ui-layout"));

    const dartOnboarding = scanProjectOnboarding(dartDir);
    assert.equal(dartOnboarding.projectName, "pure_dart_service");
    assert.equal(dartOnboarding.packageManager, "dart");
    assert.equal(dartOnboarding.commands.test, "dart test");
    assert.equal(dartOnboarding.commands.lint, "dart analyze --fatal-infos");
    assert.ok(dartOnboarding.sourceDirectories.includes("actions"));
  } finally {
    rmSync(dartDir, { recursive: true, force: true });
  }

  // 2. Flutter project (pubspec.yaml with sdk: flutter)
  const flutterDir = mkdtempSync(join(tmpdir(), "gs-flutter-app-"));
  try {
    mkdirSync(join(flutterDir, "lib", "providers"), { recursive: true });
    writeFileSync(
      join(flutterDir, "pubspec.yaml"),
      `name: flutter_shop_app\nenvironment:\n  sdk: ^3.5.0\ndependencies:\n  flutter:\n    sdk: flutter\n  flutter_riverpod: ^2.6.1\n`,
    );

    const flutterContext = detectProjectContext(flutterDir);
    assert.ok(flutterContext.detectedDependencies.includes("dart"));
    assert.ok(flutterContext.detectedDependencies.includes("flutter"));
    assert.ok(flutterContext.suggestedSkillIds.includes("dart-clean"));
    assert.ok(flutterContext.suggestedSkillIds.includes("dart-testing"));
    assert.ok(flutterContext.suggestedSkillIds.includes("flutter-architecture"));
    assert.ok(flutterContext.suggestedSkillIds.includes("flutter-ui-layout"));

    const flutterOnboarding = scanProjectOnboarding(flutterDir);
    assert.equal(flutterOnboarding.projectName, "flutter_shop_app");
    assert.equal(flutterOnboarding.packageManager, "flutter");
    assert.equal(flutterOnboarding.commands.dev, "flutter run");
    assert.equal(flutterOnboarding.commands.test, "flutter test");
    assert.equal(flutterOnboarding.commands.lint, "flutter analyze");
    assert.ok(flutterOnboarding.sourceDirectories.includes("providers"));
  } finally {
    rmSync(flutterDir, { recursive: true, force: true });
  }

  console.log("  ✔ Dart & Flutter stack detection and onboarding tests passed.");
}
