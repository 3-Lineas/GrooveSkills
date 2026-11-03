export class FilePermissionError extends Error {
  readonly code = "EACCES";
  readonly filePath: string;
  readonly suggestedFixCommand: string;

  constructor(filePath: string) {
    super(`No tienes permisos de escritura para modificar '${filePath}'.`);
    this.name = "FilePermissionError";
    this.filePath = filePath;
    this.suggestedFixCommand = `chmod u+w "${filePath}"`;
  }
}
