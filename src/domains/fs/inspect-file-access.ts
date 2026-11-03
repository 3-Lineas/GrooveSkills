import { execFileSync } from "node:child_process";
import { accessSync, constants, existsSync, lstatSync } from "node:fs";
import { dirname } from "node:path";

const UF_IMMUTABLE = 0x00000002;
const SF_IMMUTABLE = 0x00020000;

export interface FileAccessDiagnosis {
  filePath: string;
  exists: boolean;
  isSymlink: boolean;
  ownedByCurrentUser: boolean;
  ownerUid: number | null;
  currentUid: number | null;
  mode: number | null;
  immutableFlag: boolean;
  dirWritable: boolean;
  parentDir: string;
}

function resolveNearestExistingDir(startDir: string): string {
  let current = startDir;
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return current;
}

function detectMacOsImmutableFlag(filePath: string, lstat: ReturnType<typeof lstatSync>): boolean {
  const rawFlags = (lstat as unknown as { flags?: number }).flags;
  if (typeof rawFlags === "number") {
    return Boolean(rawFlags & (UF_IMMUTABLE | SF_IMMUTABLE));
  }

  if (process.platform !== "darwin") {
    return false;
  }

  try {
    const out = execFileSync("stat", ["-f", "%f", filePath], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const parsedFlags = Number.parseInt(out, 10);
    if (Number.isNaN(parsedFlags)) {
      return false;
    }
    return Boolean(parsedFlags & (UF_IMMUTABLE | SF_IMMUTABLE));
  } catch {
    return false;
  }
}

export function inspectFileAccess(filePath: string): FileAccessDiagnosis {
  const currentUid = typeof process.getuid === "function" ? process.getuid() : null;
  const parentDir = dirname(filePath);
  const checkDir = resolveNearestExistingDir(parentDir);

  let dirWritable = false;
  try {
    accessSync(checkDir, constants.W_OK);
    dirWritable = true;
  } catch {
    dirWritable = false;
  }

  let lstat: ReturnType<typeof lstatSync> | null = null;
  try {
    lstat = lstatSync(filePath);
  } catch {
    lstat = null;
  }

  if (!lstat) {
    return {
      filePath,
      exists: false,
      isSymlink: false,
      ownedByCurrentUser: true,
      ownerUid: null,
      currentUid,
      mode: null,
      immutableFlag: false,
      dirWritable,
      parentDir,
    };
  }

  const isSymlink = lstat.isSymbolicLink();
  const ownerUid = lstat.uid;
  const ownedByCurrentUser = currentUid === null || ownerUid === currentUid;
  const mode = lstat.mode & 0o777;
  const immutableFlag = detectMacOsImmutableFlag(filePath, lstat);

  return {
    filePath,
    exists: true,
    isSymlink,
    ownedByCurrentUser,
    ownerUid,
    currentUid,
    mode,
    immutableFlag,
    dirWritable,
    parentDir,
  };
}

export function formatOwnerName(uid: number | null): string {
  if (uid === 0) {
    return "root";
  }
  if (uid === null) {
    return "another user";
  }
  return `uid ${uid}`;
}
