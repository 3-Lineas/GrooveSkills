import assert from "node:assert";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectProjectContext } from "@/domains/detector/project-detector";
import { scanProjectOnboarding } from "@/domains/harness/scan-project-onboarding";
import { SKILL_CATALOG } from "@/domains/registry/skill-catalog";

export function runGoAndWailsDetectorTests(): void {
  console.log("▶ Starting verification suite: Go 1.27 & Wails v3 Stack Detection & Onboarding...");

  const expectedCatalogSkills: Array<{ id: string; category: string }> = [
    { id: "go-clean", category: "Languages & Testing" },
    { id: "go-concurrency-safety", category: "Languages & Testing" },
    { id: "go-testing", category: "Languages & Testing" },
    { id: "wails-architecture", category: "Frameworks & UI" },
  ];

  for (const expected of expectedCatalogSkills) {
    const entry = SKILL_CATALOG.find((skill) => skill.id === expected.id);
    assert.ok(entry, `SKILL_CATALOG must include ${expected.id}`);
    assert.strictEqual(entry.category, expected.category, `${expected.id} must belong to ${expected.category}`);
    const skillFilePath = join(process.cwd(), "skills", entry.directoryName, "SKILL.md");
    assert.strictEqual(existsSync(skillFilePath), true, `Skill file must exist at ${skillFilePath}`);
  }

  const testRoot = mkdtempSync(join(tmpdir(), "grooveskills-go-wails-test-"));
  try {
    // 1. Pure Go 1.27 project
    const pureGoDir = join(testRoot, "pure-go-app");
    mkdirSync(pureGoDir, { recursive: true });
    writeFileSync(
      join(pureGoDir, "go.mod"),
      "module github.com/acme/billing-service\n\ngo 1.27\n",
      "utf-8",
    );

    const pureGoContext = detectProjectContext(pureGoDir);
    assert.strictEqual(pureGoContext.packageJsonExists, true);
    assert.ok(pureGoContext.suggestedSkillIds.includes("go-clean"));
    assert.ok(pureGoContext.suggestedSkillIds.includes("go-concurrency-safety"));
    assert.ok(pureGoContext.suggestedSkillIds.includes("go-testing"));
    assert.strictEqual(
      pureGoContext.suggestedSkillIds.includes("wails-architecture"),
      false,
      "Pure Go project must not suggest wails-architecture",
    );

    const pureGoOnboarding = scanProjectOnboarding(pureGoDir);
    assert.strictEqual(pureGoOnboarding.projectName, "billing-service");
    assert.strictEqual(pureGoOnboarding.packageManager, "go");
    assert.strictEqual(pureGoOnboarding.commands.test, "go test -race -count=1 ./...");
    assert.strictEqual(pureGoOnboarding.commands.build, "go build ./...");
    assert.strictEqual(pureGoOnboarding.commands.lint, "golangci-lint run");

    // 2. Wails v3 desktop project (Go 1.27 + React/Vite/GroovePack frontend)
    const wailsDir = join(testRoot, "wails-desktop-app");
    mkdirSync(join(wailsDir, "build"), { recursive: true });
    mkdirSync(join(wailsDir, "frontend"), { recursive: true });

    writeFileSync(
      join(wailsDir, "go.mod"),
      [
        "module github.com/acme/desktop-pos",
        "",
        "go 1.27",
        "",
        "require github.com/wailsapp/wails/v3 v3.0.0",
        "",
      ].join("\n"),
      "utf-8",
    );
    writeFileSync(
      join(wailsDir, "build", "config.yml"),
      "info:\n  companyName: Acme\nname: DesktopPOS\n",
      "utf-8",
    );
    writeFileSync(
      join(wailsDir, "frontend", "package.json"),
      JSON.stringify({
        name: "frontend",
        dependencies: {
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          "@wailsio/runtime": "^3.0.0",
          "@3lineas/groovepack": "^1.6.0",
        },
        devDependencies: {
          typescript: "^5.9.0",
          vitest: "^3.0.0",
        },
      }),
      "utf-8",
    );
    writeFileSync(
      join(wailsDir, "frontend", "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          paths: {
            "@/*": ["./src/*"],
          },
        },
      }),
      "utf-8",
    );

    const wailsContext = detectProjectContext(wailsDir);
    assert.ok(wailsContext.suggestedSkillIds.includes("go-clean"));
    assert.ok(wailsContext.suggestedSkillIds.includes("go-concurrency-safety"));
    assert.ok(wailsContext.suggestedSkillIds.includes("go-testing"));
    assert.ok(wailsContext.suggestedSkillIds.includes("wails-architecture"));
    assert.ok(wailsContext.suggestedSkillIds.includes("react-core"));
    assert.ok(wailsContext.suggestedSkillIds.includes("react-advanced"));
    assert.ok(wailsContext.suggestedSkillIds.includes("typescript-clean"));
    assert.ok(wailsContext.suggestedSkillIds.includes("groovepack-api"));
    assert.strictEqual(
      wailsContext.suggestedSkillIds.includes("react-create-page"),
      false,
      "Wails v3 project must exclude react-create-page",
    );

    const wailsOnboarding = scanProjectOnboarding(wailsDir);
    assert.strictEqual(wailsOnboarding.projectName, "DesktopPOS");
    assert.strictEqual(wailsOnboarding.packageManager, "go");
    assert.strictEqual(wailsOnboarding.commands.dev, "wails3 dev");
    assert.strictEqual(wailsOnboarding.commands.build, "wails3 build");
    assert.strictEqual(wailsOnboarding.commands.bindings, "wails3 generate bindings");
    assert.strictEqual(wailsOnboarding.commands.test, "go test -race -count=1 ./...");
    assert.strictEqual(wailsOnboarding.pathAliases["@/*"], "./src/*");

    // 3. Edge cases: versioned go.mod (/v2) and Wails v3 config.yml with nested author.name + productName
    const versionedGoDir = join(testRoot, "versioned-go-app");
    mkdirSync(versionedGoDir, { recursive: true });
    writeFileSync(
      join(versionedGoDir, "go.mod"),
      "module github.com/acme/orders-api/v2\n\ngo 1.27\n",
      "utf-8",
    );
    assert.strictEqual(scanProjectOnboarding(versionedGoDir).projectName, "orders-api");

    const nestedConfigWailsDir = join(testRoot, "nested-config-wails-app");
    mkdirSync(join(nestedConfigWailsDir, "build"), { recursive: true });
    mkdirSync(join(nestedConfigWailsDir, "frontend"), { recursive: true });
    writeFileSync(
      join(nestedConfigWailsDir, "build", "config.yml"),
      "version: '3'\ninfo:\n  author:\n    name: John Doe\n  productName: \"Acme Studio\" # app title\n",
      "utf-8",
    );
    writeFileSync(
      join(nestedConfigWailsDir, "frontend", "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0", "@wailsio/runtime": "^3.0.0" } }),
      "utf-8",
    );
    const nestedWailsContext = detectProjectContext(nestedConfigWailsDir);
    assert.ok(nestedWailsContext.suggestedSkillIds.includes("wails-architecture"));
    assert.strictEqual(nestedWailsContext.suggestedSkillIds.includes("react-create-page"), false);
    assert.strictEqual(scanProjectOnboarding(nestedConfigWailsDir).projectName, "Acme Studio");

    console.log("  ✔ Go 1.27 & Wails v3 stack detection, exclusion, and onboarding tests passed.");
  } finally {
    rmSync(testRoot, { recursive: true, force: true });
  }
}
