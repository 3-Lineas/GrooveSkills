#!/usr/bin/env node
/**
 * @file validate-audit.mjs
 * Validates coverage-ledger.json and findings.json schemas, terminal states,
 * and cross-references for the 6-phase adversarial security audit.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const targetDirectory = process.argv[2];

if (!targetDirectory) {
  console.error("Usage: node validate-audit.mjs <path-to-audit-directory>");
  process.exit(1);
}

const resolvedAuditPath = resolve(process.cwd(), targetDirectory);
const coverageLedgerPath = resolve(resolvedAuditPath, "coverage-ledger.json");
const findingsPath = resolve(resolvedAuditPath, "findings.json");

if (!existsSync(coverageLedgerPath)) {
  console.error(`Error: Missing coverage ledger at ${coverageLedgerPath}`);
  process.exit(1);
}

let ledgerData;
try {
  ledgerData = JSON.parse(readFileSync(coverageLedgerPath, "utf8"));
} catch (error) {
  console.error(`Error: Failed to parse coverage ledger: ${error.message}`);
  process.exit(1);
}

const validationErrors = [];

if (!ledgerData.auditDate || typeof ledgerData.auditDate !== "string") {
  validationErrors.push("Coverage ledger must have a valid string 'auditDate'.");
}
if (!Array.isArray(ledgerData.units) || ledgerData.units.length === 0) {
  validationErrors.push("Coverage ledger 'units' must be a non-empty array.");
}

const validUnitStatuses = new Set(["clean", "vulnerable", "mitigated"]);
const ledgerUnitIds = new Set();

if (Array.isArray(ledgerData.units)) {
  for (const unit of ledgerData.units) {
    if (!unit.id || typeof unit.id !== "string") {
      validationErrors.push("Ledger unit is missing a valid string 'id'.");
      continue;
    }
    if (ledgerUnitIds.has(unit.id)) {
      validationErrors.push(`Duplicate unit id detected: ${unit.id}`);
    }
    ledgerUnitIds.add(unit.id);

    if (!validUnitStatuses.has(unit.status)) {
      validationErrors.push(
        `Unit '${unit.id}' has non-terminal status '${unit.status}'. Expected: clean, vulnerable, mitigated.`
      );
    }
    if (!Array.isArray(unit.files) || unit.files.length === 0) {
      validationErrors.push(`Unit '${unit.id}' must specify at least one file.`);
    }
  }
}

let findingsData = { findings: [] };
if (existsSync(findingsPath)) {
  try {
    findingsData = JSON.parse(readFileSync(findingsPath, "utf8"));
  } catch (error) {
    validationErrors.push(`Failed to parse findings.json: ${error.message}`);
  }
}

const validSeverities = new Set(["critical", "high", "medium", "low"]);
const validFindingStatuses = new Set(["confirmed", "invalidated", "remediated"]);

if (Array.isArray(findingsData.findings)) {
  for (const finding of findingsData.findings) {
    if (!finding.id || typeof finding.id !== "string") {
      validationErrors.push("Finding is missing a valid string 'id'.");
    }
    if (!finding.unitId || !ledgerUnitIds.has(finding.unitId)) {
      validationErrors.push(
        `Finding '${finding.id}' references unknown unitId '${finding.unitId}'.`
      );
    }
    if (!validSeverities.has(finding.severity)) {
      validationErrors.push(
        `Finding '${finding.id}' has invalid severity '${finding.severity}'.`
      );
    }
    if (!validFindingStatuses.has(finding.status)) {
      validationErrors.push(
        `Finding '${finding.id}' has invalid status '${finding.status}'.`
      );
    }
    if (finding.status === "confirmed" && !finding.remediationPlan) {
      validationErrors.push(
        `Confirmed finding '${finding.id}' must contain a 'remediationPlan'.`
      );
    }
  }
}

if (validationErrors.length > 0) {
  console.error("Security audit validation failed with the following errors:");
  for (const error of validationErrors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log(
  `Security audit validated successfully: ${ledgerData.units.length} units audited, ${findingsData.findings.length} findings verified.`
);
