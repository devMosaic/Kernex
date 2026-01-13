# Plugin System

Kernex features a powerful, language-agnostic plugin architecture based on web standards.

## 1. Architecture

Plugins are essentially **Micro-Frontends**.
*   **Format:** Standard HTML/CSS/JS.
*   **Isolation:** Each plugin runs in an `<iframe>` within a Canvas Node.
*   **Communication:** Plugins talk to the main Kernex API using the user's session token.

### Directory Structure
Plugins live in `server/plugins/` (built-in) or `dist/plugins/` (production).

```
server/plugins/
└── my-tool/
    ├── index.html    # Entry point
    ├── main.js       # Logic
    └── style.css     # Styles
```

---

## 2. Developing a Plugin

### Step 1: Create the structure
Create a folder `server/plugins/hello-world/` and add an `index.html`.

### Step 2: The Boilerplate
Your plugin needs to know *who* it is and *where* it is running.

```html
<!-- index.html -->
<script>
  // Parse Query Params for Context
  const params = new URLSearchParams(window.location.search);
  const TOKEN = params.get('token');         // Auth Token
  const WORKSPACE_ID = params.get('workspaceId'); // Current Workspace ID

  // Helper for API calls
  async function apiCall(endpoint) {
    const res = await fetch(`/api/${endpoint}`, {
      headers: { 
        'x-auth-session': TOKEN,
        'x-workspace-id': WORKSPACE_ID 
      }
    });
    return res.json();
  }
</script>
```

### Step 3: Integration
1.  Restart the server (to detect the new folder, though hot-reload might work).
2.  Open the **Plugin Drawer** in a workspace.
3.  Your plugin should appear (or add it manually via the "Add Custom" button).

---

## 3. Inter-Plugin Communication
Plugins can listen for global events via `window.postMessage`.

**Example: Listening for Theme Changes**
```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'THEME_CHANGE') {
    document.body.setAttribute('data-theme', event.data.themeId);
  }
});
```

---

## 4. Built-in Plugins

### Terminal
A wrapper around `xterm.js` connected to a WebSocket (`/api/term/ws`).
*   **Features:** Full PTY support, resizing, copy/paste.

### File Manager
A React-based file explorer mimicking modern IDE experiences.
*   **UI:** Dark-themed, recursive tree view with file icons.
*   **Actions:** Inline creation/renaming, drag-and-drop moves, context menus.
*   **Uploads:** Drag files from OS to specific folders.
*   **Editor:** Monaco Editor integration for robust file editing.

### Photo Viewer
A simple, focused tool for viewing images from the workspace.
*   **Integration:** Automatically opens when dropping images on the canvas.
*   **API:** Uses `/api/files/raw` for secure image streaming.

### Developer Tools
*   **Base64 Converter:** Encode/Decode strings.
*   **JWT Debugger:** Parse tokens.
*   **HTTP Client:** Send REST requests.