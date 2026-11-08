#!/usr/bin/env node
/**
 * @file scan-skill-integrity.mjs
 * Static security scanner for SKILL.md, AGENTS.md, and MCP configurations.
 * Implements NVIDIA SkillSpector detection patterns: prompt injection,
 * data exfiltration, dangerous calls, and memory poisoning.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, extname } from "node:path";

const targetPath = process.argv[2] || ".";
const resolvedTarget = resolve(process.cwd(), targetPath);

const DANGEROUS_CALL_PATTERNS = [
  /\beval\s*\(/i,
  /\bchild_process\b/i,
  /\bexecSync\s*\(/i,
  /\bexec\s*\(/i,
  /\bspawn\s*\(/i,
  /\bFunction\s*\([^)]*\)\s*\(/i,
];

const EXFILTRATION_PATTERNS = [
  /curl\s+[^|\n]+https?:\/\//i,
  /wget\s+[^|\n]+https?:\/\//i,
  /fetch\s*\(\s*['"`]https?:\/\//i,
  /!\[[^\]]*\]\((https?:\/\/[^)\s]+(\.env|\/etc\/passwd|token|id_rsa))/i,
];

const PROMPT_INJECTION_PATTERNS = [
  /<!--\s*(?:system|override|ignore rules|developer mode|you are now)/i,
  /ignore\s+(?:all\s+)?previous\s+instructions/i,
  /disregard\s+(?:all\s+)?prior\s+guidelines/i,
  /[\u200B-\u200D\uFEFF]/, // Zero-width spaces
  /[\u202A-\u202E]/,       // Bidirectional override characters
];

const findings = [];

function scanFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const fileName = filePath.replace(process.cwd() + "/", "");

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      findings.push({
        file: fileName,
        category: "P1-P5: Prompt Injection / Obfuscation",
        match: String(pattern),
      });
      break;
    }
  }

  for (const pattern of EXFILTRATION_PATTERNS) {
    if (pattern.test(content)) {
      findings.push({
        file: fileName,
        category: "E1-E4: Potential Data Exfiltration",
        match: String(pattern),
      });
      break;
    }
  }

  // Check script files (.js, .mjs, .ts) for dangerous execution calls
  const extension = extname(filePath).toLowerCase();
  if ([".js", ".mjs", ".cjs", ".ts"].includes(extension)) {
    for (const pattern of DANGEROUS_CALL_PATTERNS) {
      if (pattern.test(content)) {
        findings.push({
          file: fileName,
          category: "SC1-SC6: Dangerous AST Call",
          match: String(pattern),
        });
        break;
      }
    }
  }
}

function traverseDirectory(currentDirectory) {
  const entries = readdirSync(currentDirectory);
  for (const entry of entries) {
    if (["node_modules", ".git", "dist", "dist-test"].includes(entry)) {
      continue;
    }
    const fullPath = join(currentDirectory, entry);
    const fileStats = statSync(fullPath);

    if (fileStats.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fileStats.isFile()) {
      const lower = entry.toLowerCase();
      if (
        lower.endsWith(".md") ||
        lower.endsWith(".mjs") ||
        lower.endsWith(".js") ||
        lower.endsWith(".ts") ||
        lower.endsWith(".json")
      ) {
        scanFile(fullPath);
      }
    }
  }
}

const targetStats = statSync(resolvedTarget);
if (targetStats.isDirectory()) {
  traverseDirectory(resolvedTarget);
} else {
  scanFile(resolvedTarget);
}

if (findings.length > 0) {
  console.error(`Skill integrity check failed: ${findings.length} security alerts detected!`);
  for (const finding of findings) {
    console.error(` - [${finding.category}] in ${finding.file} (pattern: ${finding.match})`);
  }
  process.exit(1);
}

console.log("Skill integrity scan passed: Zero SkillSpector security violations found.");
