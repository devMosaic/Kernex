# Plugins & Tools Guide

Kernex is designed to be extensible. Its "Apps" are either internal React components or isolated Plugins running in iframes. This guide details every built-in tool.

---

## 1. Core Utilities

### Terminal (`/system/terminal`)
A fully-featured web terminal providing direct shell access to the host server.
*   **Technology:** `xterm.js` over WebSockets.
*   **Security:** Runs with the same permissions as the Node.js process hosting Kernex.
*   **Key Features:**
    *   **Tab Completion:** Works like a native shell.
    *   **Colors:** Full ANSI 256-color support.
    *   **Resize:** Responsive layout.
*   **Use Cases:**
    *   Installing NPM packages (`npm install ...`).
    *   Managing git repositories.
    *   Monitoring system processes (`top`).

### File Manager (`/system/files`)
A graphical interface for the `workspace/` directory.
*   **Capabilities:**
    *   **Navigate:** Click folders to drill down.
    *   **Preview:** Images (`.png`, `.jpg`) and text files.
    *   **Edit:** Built-in Monaco Editor (VS Code-like) for code/text.
    *   **Management:** Create folders, delete files, rename items.
*   **Root Directory:** Confined to `workspace/<current-workspace-id>/` for safety.

### Notes (`/system/notes`)
A distraction-free Markdown editor.
*   **Storage:** Notes are stored in the SQLite database (`notes` table), not as files.
*   **Features:**
    *   Auto-saving.
    *   Rich text rendering (Headers, Lists, Code blocks).
*   **Sync:** Notes are global per workspace.

---

## 2. Developer Tools

### HTTP Tester
An API client for testing REST endpoints.
*   **Methods:** GET, POST, PUT, DELETE, PATCH.
*   **Features:**
    *   **Headers:** Add custom request headers (e.g., `Authorization`).
    *   **Body:** Send JSON or raw text.
    *   **Response:** View status code, timing, and JSON response with syntax highlighting.
    *   **History:** Saves recent requests to local storage.

### DB Viewer
A read-only interface for the internal SQLite database (`kernex.db`).
*   **Usage:** View system logs, user sessions, or plugin data.
*   **Security:** Only the root user can access this. Useful for debugging plugin state or auditing logs.

### Short URLs
A URL shortener and redirect manager.
*   **Internal Routing:** Map `http://localhost:3000/go/my-link` to long external URLs.
*   **Analytics:** Tracks click counts.

---

## 3. Utility Plugins
Small, single-purpose tools for common development tasks.

*   **Base64:** Encode/Decode text to Base64 strings.
*   **UUID:** Generate random UUIDs (v4).
*   **JWT Debugger:** Paste a JSON Web Token to decode its header and payload (without verifying signature).
*   **Diff:** Compare two blocks of text to see differences.
*   **JSON/YAML/XML:** Formatters and validators for data structures.
*   **Hasher:** Generate MD5, SHA-1, and SHA-256 hashes of text.

---

## 4. Developing Custom Plugins

You can add your own tools by placing HTML/JS files in `server/plugins/my-tool/`.

### The Security Model
*   Plugins run in `<iframe>` sandboxes.
*   They receive the **Session Token** and **Workspace ID** via URL query parameters:
    `index.html?token=...&workspaceId=...`
*   **Important:** If you are developing a plugin, **NEVER** log this token to the console or send it to a third-party server. It grants full API access to your Kernex instance.

### Example: Fetching a File
```javascript
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

fetch('/api/files/read', {
    method: 'POST',
    headers: { 'x-auth-session': token },
    body: JSON.stringify({ path: 'README.md' })
})
.then(res => res.json())
.then(data => console.log(data.content));
```
