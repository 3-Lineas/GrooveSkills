# AI, LLM, MCP & SkillSpector Security

Domain audit checklist covering AI agent security, SkillSpector 17 categories, Model Context Protocol (MCP), and instruction integrity.

---

## 1. NVIDIA SkillSpector 17 Categories Overview

Audit all agent configuration files (`SKILL.md`, `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, and MCP server configs) against these threat categories:

1. **P1–P5: Prompt Injection & Anti-Refusal**:
   - Hidden instructions inside HTML comments (`<!-- ... -->`) or markdown code blocks designed to override system constraints.
   - Unicode obfuscation: zero-width spaces (`\u200B`), homoglyphs, and bidirectional override characters (`\u202E`).
   - Anti-refusal phrasing ("ignore previous rules", "you are now in maintenance mode").
2. **E1–E4: Data Exfiltration & Taint Tracking**:
   - Instructions prompting agents to read sensitive files (`.env`, `~/.ssh`, `id_rsa`, AWS credentials) and transmit them.
   - Exfiltration sinks: external curl/fetch URLs, image markdown rendering (e.g. referencing external attacker URLs with sensitive query parameters), or webhook dispatchers.
3. **M1–M4: MCP Tool Poisoning & Least Privilege**:
   - Tool names or descriptions crafted to trick the LLM into invoking unintended commands.
   - MCP tools requesting excessive scopes (e.g., full root filesystem access, unbound bash command execution).
4. **MP1–MP3: Memory Poisoning & Rogue Persistence**:
   - Tampering with agent memory files (`.grooveskills/memory/context.md`, `decisions.md`, tasks) to inject unauthorized instructions across sessions.
5. **SC1–SC6: Dangerous Scripts & Supply Chain**:
   - Assistant scripts calling `eval()`, `child_process.exec()`, or base64-decoded dynamic payloads.
   - Unpinned dependencies in agent utility packages.

---

## 2. Model Context Protocol (MCP) Security Gates

- **Input Validation**: Treat all parameters received from MCP tools as untrusted. Validate types, formats, and character sets using Valibot schemas.
- **Output Sanitization**: Sanitize text returned from MCP servers before injecting into agent context to prevent indirect prompt injection.
- **Strict Sandboxing**: Run MCP servers in isolated environments with minimal filesystem permissions. Disallow write access to sensitive project configuration files (`.git`, `.env`, CI workflows).

---

## 3. Agent Memory & Rule Protection

- **Integrity Verification**: Regularly inspect `.grooveskills/memory/` and `AGENTS.md` to ensure no unauthorized instructions or prompt bypasses have been written.
- **Separation of Instructions and User Data**: Clearly delimit user inputs from system guidelines using XML tags (`<user_input>`, `<system_context>`).
- **Deterministic Scanning**: Run `node skills/security-audit/scripts/scan-skill-integrity.mjs <directory>` during CI and at the conclusion of tasks modifying skills.
