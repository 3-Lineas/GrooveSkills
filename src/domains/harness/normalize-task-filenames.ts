import { existsSync, readdirSync, readFileSync, renameSync, statSync } from "node:fs";
import { join } from "node:path";
import type { InstallTransaction } from "@/domains/fs/install-transaction";

const CHRONO_TASK_REGEX = /^\d{2}-\d{2}-\d{2}-.+\.md$/;
const FRONTMATTER_DATE_REGEX = /^createdAt:\s*["']?(\d{4})-(\d{2})-(\d{2})["']?/m;
const SHORT_FRONTMATTER_DATE_REGEX = /^createdAt:\s*["']?(\d{2})-(\d{2})-(\d{2})["']?/m;

export interface NormalizedTaskResult {
  originalFileName: string;
  normalizedFileName: string;
  renamed: boolean;
}

function formatYear(fourDigitYear: string): string {
  if (fourDigitYear.length === 4) {
    return fourDigitYear.slice(2);
  }
  return fourDigitYear;
}

function formatDatePrefix(date: Date): string {
  const fullYear = String(date.getFullYear());
  const yearTwoDigits = fullYear.slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${yearTwoDigits}-${month}-${day}`;
}

function extractDatePrefixFromFile(filePath: string): string {
  try {
    const content = readFileSync(filePath, "utf-8");
    const fourDigitMatch = content.match(FRONTMATTER_DATE_REGEX);
    if (fourDigitMatch && fourDigitMatch[1] && fourDigitMatch[2] && fourDigitMatch[3]) {
      const year = formatYear(fourDigitMatch[1]);
      const month = fourDigitMatch[2];
      const day = fourDigitMatch[3];
      return `${year}-${month}-${day}`;
    }

    const shortMatch = content.match(SHORT_FRONTMATTER_DATE_REGEX);
    if (shortMatch && shortMatch[1] && shortMatch[2] && shortMatch[3]) {
      return `${shortMatch[1]}-${shortMatch[2]}-${shortMatch[3]}`;
    }
  } catch {
    // Fall back to file stat if content read fails
  }

  try {
    const stats = statSync(filePath);
    return formatDatePrefix(stats.mtime);
  } catch {
    return formatDatePrefix(new Date());
  }
}

export function normalizeTaskFileNames(
  tasksDir: string,
  transaction?: InstallTransaction
): NormalizedTaskResult[] {
  if (!existsSync(tasksDir)) {
    return [];
  }

  const entries = readdirSync(tasksDir);
  const results: NormalizedTaskResult[] = [];

  for (const fileName of entries) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    // Preserve special harness task files
    if (fileName === "00-onboarding.md" || fileName.startsWith("_")) {
      continue;
    }

    // Already follows YY-MM-DD-<slug>.md
    if (CHRONO_TASK_REGEX.test(fileName)) {
      results.push({
        originalFileName: fileName,
        normalizedFileName: fileName,
        renamed: false,
      });
      continue;
    }

    const fullOriginalPath = join(tasksDir, fileName);
    const datePrefix = extractDatePrefixFromFile(fullOriginalPath);
    const normalizedFileName = `${datePrefix}-${fileName}`;
    const fullNormalizedPath = join(tasksDir, normalizedFileName);

    if (transaction) {
      transaction.recordBeforeWrite(fullNormalizedPath);
    }

    renameSync(fullOriginalPath, fullNormalizedPath);

    results.push({
      originalFileName: fileName,
      normalizedFileName,
      renamed: true,
    });
  }

  return results;
}
