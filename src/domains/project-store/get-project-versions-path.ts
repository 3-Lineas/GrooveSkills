import { join } from "node:path";
import { getProjectStoreDir } from "@/domains/project-store/project-paths";

export function getProjectVersionsPath(targetPath: string): string {
  return join(getProjectStoreDir(targetPath), "VERSIONS.md");
}
