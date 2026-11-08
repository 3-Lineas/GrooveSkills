# Client, Desktop & IPC Security

Domain audit checklist covering React/Next.js client-side security, DOM XSS, and Tauri v2 / Electron desktop IPC.

---

## 1. Web Frontend & React / Next.js Security

### DOM XSS & Content Security Policy (CSP)
- Scan for dangerous sinks: `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval()`, `javascript:` protocol in `href` or `src`.
- Verify input sanitization using DOMPurify when rendering user-supplied rich text.
- Enforce strict Content Security Policy (CSP): disallow `'unsafe-eval'` and inline scripts without cryptographic nonces or hashes.

### Prototype Pollution
- Audit recursive object merges, query string parsers, and lodash-like utility functions.
- Ensure keys like `__proto__`, `constructor`, and `prototype` are stripped or rejected.

### Next.js & Modern React Boundaries (RSC & Server Actions)
- **RSC Secret Leakage**: Ensure backend database credentials, private API keys, or internal tokens are not imported into client components or leaked via serialized RSC props.
- **Server Action Authorization**: Verify every Server Action (`'use server'`) validates user authentication and authorization policies at its start; never assume client-side UI gates suffice.
- **CSRF on Server Actions**: Verify Origin header validation and SameSite cookies are properly enforced.

---

## 2. Desktop Security (Tauri v2 & Electron IPC)

### Tauri v2 IPC Command Isolation
- Audit all commands decorated with `#[tauri::command]`:
  - Verify every command validates arguments before performing filesystem, process, or network operations.
  - Never allow raw path concatenation; use strict path canonicalization and whitelist validation to prevent directory traversal.
- Audit Tauri capabilities and permissions in `src-tauri/capabilities/`:
  - Apply the principle of least privilege: disallow wildcard permissions (e.g., `fs:default` on entire disk).
  - Explicitly restrict scopes to app data directories (`$APPDATA`, `$RESOURCE`).

### Deep Linking & Protocol Handlers
- If custom URI schemes (`myapp://`) are registered, sanitize and validate all incoming query parameters and paths.
- Ensure deep link handlers cannot be coerced into opening arbitrary external URLs or executing shell commands.

### Native Process Execution & Shell Isolation
- Avoid spawning arbitrary shell commands (`std::process::Command` in Rust or `child_process.exec` in Node).
- If process execution is unavoidable:
  - Whitelist exact executable paths.
  - Pass arguments as arrays; never interpolate strings into shell interpreters (`/bin/sh -c`).
