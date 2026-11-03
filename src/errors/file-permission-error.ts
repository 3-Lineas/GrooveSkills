import {
  formatOwnerName,
  inspectFileAccess,
  type FileAccessDiagnosis,
} from "@/domains/fs/inspect-file-access";

function buildDiagnosisReason(diagnosis: FileAccessDiagnosis): string {
  if (diagnosis.immutableFlag) {
    return "immutable flag (uchg) is set";
  }
  if (diagnosis.exists && !diagnosis.ownedByCurrentUser) {
    return `owned by ${formatOwnerName(diagnosis.ownerUid)}`;
  }
  if (!diagnosis.dirWritable) {
    return `parent directory '${diagnosis.parentDir}' is not writable`;
  }
  return "permission denied";
}

function buildSuggestedFix(diagnosis: FileAccessDiagnosis): string {
  if (diagnosis.immutableFlag) {
    return `chflags nouchg "${diagnosis.filePath}"`;
  }
  if (diagnosis.exists && !diagnosis.ownedByCurrentUser) {
    return `sudo chown "$(id -un)" "${diagnosis.filePath}"`;
  }
  if (!diagnosis.dirWritable) {
    return `chmod u+w "${diagnosis.parentDir}"`;
  }
  return `chmod u+w "${diagnosis.filePath}"`;
}

export class FilePermissionError extends Error {
  readonly code = "EACCES";
  readonly filePath: string;
  readonly diagnosis: FileAccessDiagnosis;
  readonly suggestedFixCommand: string;

  constructor(filePath: string, diagnosis?: FileAccessDiagnosis) {
    const resolved = diagnosis ?? inspectFileAccess(filePath);
    const reason = buildDiagnosisReason(resolved);
    super(`Cannot write to ${filePath} (${reason})`);
    this.name = "FilePermissionError";
    this.filePath = filePath;
    this.diagnosis = resolved;
    this.suggestedFixCommand = buildSuggestedFix(resolved);
  }
}
