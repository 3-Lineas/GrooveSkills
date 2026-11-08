export interface DiscoveredFilePartition {
  webApiFiles: string[];
  clientIpcFiles: string[];
  dataCloudFiles: string[];
  aiMcpSkillsFiles: string[];
  memoryCryptoFiles: string[];
  genericSourceFiles: string[];
}

export function partitionFiles(relativeFiles: string[]): DiscoveredFilePartition {
  const partition: DiscoveredFilePartition = {
    webApiFiles: [],
    clientIpcFiles: [],
    dataCloudFiles: [],
    aiMcpSkillsFiles: [],
    memoryCryptoFiles: [],
    genericSourceFiles: [],
  };

  for (const filePath of relativeFiles) {
    const lower = filePath.toLowerCase();

    if (
      lower.includes("skill.md") ||
      lower.includes("agents.md") ||
      lower.includes("claude.md") ||
      lower.includes("mcp.json") ||
      lower.includes(".cursor/rules") ||
      lower.startsWith(".agents/") ||
      lower.startsWith(".claude/") ||
      lower.startsWith(".gemini/") ||
      lower.endsWith(".md") ||
      lower.includes("instruction") ||
      lower.includes("prompt")
    ) {
      partition.aiMcpSkillsFiles.push(filePath);
      continue;
    }

    if (
      lower.includes("route") ||
      lower.includes("router") ||
      lower.includes("controller") ||
      lower.includes("endpoint") ||
      lower.includes("auth") ||
      lower.includes("webhook") ||
      lower.includes("api")
    ) {
      partition.webApiFiles.push(filePath);
      continue;
    }

    if (
      lower.includes("tauri") ||
      lower.includes("electron") ||
      lower.includes("ipc") ||
      lower.endsWith(".tsx") ||
      lower.endsWith(".jsx") ||
      lower.includes("component") ||
      lower.includes("page") ||
      lower.includes("view")
    ) {
      partition.clientIpcFiles.push(filePath);
      continue;
    }

    if (
      lower.includes("db") ||
      lower.includes("database") ||
      lower.includes("sql") ||
      lower.includes("migration") ||
      lower.includes("schema") ||
      lower.includes("model") ||
      lower.includes("repository") ||
      lower.includes("payment") ||
      lower.includes("stripe") ||
      lower.includes("mercadopago") ||
      lower.includes("worker") ||
      lower.endsWith(".env") ||
      lower.endsWith(".env.example")
    ) {
      partition.dataCloudFiles.push(filePath);
      continue;
    }

    if (
      lower.endsWith(".rs") ||
      lower.includes("crypto") ||
      lower.includes("token") ||
      lower.includes("session") ||
      lower.includes("hash")
    ) {
      partition.memoryCryptoFiles.push(filePath);
      continue;
    }

    if (
      lower.endsWith(".ts") ||
      lower.endsWith(".js") ||
      lower.endsWith(".mjs") ||
      lower.endsWith(".py") ||
      lower.endsWith(".json")
    ) {
      partition.genericSourceFiles.push(filePath);
    }
  }

  return partition;
}
