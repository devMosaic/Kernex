# Kernex Official Documentation

**Version:** 1.0.0  
**Status:** Stable  
**Last Updated:** January 11, 2026

---

## 1. Project Overview

**Kernex** is a self-hosted, personal programmable runtime and workspace environment. It creates a unified interface where developers can manage multiple "workspaces," each serving as a digital canvas for applications, data, notes, and tools.

At its core, Kernex provides:
*   **Infinite Canvas UI:** A spatial operating system feel where applications (Nodes) can be dragged, resized, and organized freely.
*   **Plugin Architecture:** An extensible system where internal tools (File Manager, Terminal) and external plugins run in sandboxed iframes.
*   **System Management:** Built-in monitoring for logs, disk usage, and network activity.
*   **Security:** Robust session-based authentication and password-protected workspaces.

---

## 2. Architecture

Kernex follows a modern monolithic architecture, designed for ease of deployment and self-hosting.

### 2.1 Backend (`/server`)
*   **Framework:** [Fastify](https://www.fastify.io/) (Node.js) - Chosen for high performance and low overhead.
*   **Database:** [SQLite](https://www.sqlite.org/index.html) (via `better-sqlite3`) - Embedded, zero-configuration storage for settings, auth data, and logs.
*   **File System:** Workspaces are stored as physical directories on the disk, making backup and migration simple.
*   **API:** RESTful endpoints located in `server/api/`.

### 2.2 Frontend (`/src`)
*   **Framework:** React 18 + TypeScript.
*   **Build Tool:** Vite.
*   **Routing:** React Router v6.
*   **State Management:** React Context (`AuthContext`, `SettingsContext`).
*   **Styling:** Native CSS Variables for theming (e.g., `var(--bg-primary)`).

### 2.3 Plugin System
Kernex uses a unique **iframe-based plugin architecture**:
*   Plugins are static HTML/JS applications served from `server/plugins/` or `dist/plugins/`.
*   They are mounted on the Canvas as `iframe` nodes.
*   Communication happens via `postMessage` or standard HTTP requests to the backend API (passing the session token).
*   **Route:** `/i/<plugin-name>/index.html`.

---

## 3. Installation & Setup

### 3.1 Prerequisites
*   **Node.js:** v18 or higher.
*   **OS:** Linux, macOS, or Windows.

### 3.2 Local Development
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/kernex.git
    cd kernex
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    *   Frontend: `http://localhost:5173`
    *   Backend: `http://localhost:3000`

### 3.3 Production Deployment
1.  **Build the project:**
    ```bash
    npm run build
    ```
    This compiles the React frontend to `dist/` and the TypeScript backend to `dist/server/`.

2.  **Start Production Server:**
    ```bash
    npm start
    ```
    The server acts as both the API server and the static file host for the frontend.

### 3.4 Docker Deployment
A `Dockerfile` is provided for containerized deployment.
```bash
docker build -t kernex .
docker run -p 3000:3000 -v kernex-data:/app/workspace kernex
```

---

## 4. Configuration

Kernex is configured via **Environment Variables**. Create a `.env` file in the root directory.

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (`development` or `production`). | `development` | Yes (Prod) |
| `KERNEX_ENCRYPTION_KEY` | 32-char key for encrypting secrets in DB. | *Auto-generated* | **YES (Prod)** |
| `APP_AUTH_USERNAME` | Pre-provisioned root username (bypasses setup). | `null` | No |
| `APP_AUTH_PASSWORD` | Pre-provisioned root password. | `null` | No |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins. | `*` (Dev) | No |
| `LOG_LEVEL` | Logging verbosity (`info`, `debug`, `error`). | `info` | No |
| `SHELL` | Default shell for the Terminal plugin. | `bash` or `powershell` | No |

**Security Note:** In production, **ALWAYS** set `KERNEX_ENCRYPTION_KEY` to a random, long string to ensure your database secrets are secure.

---

## 5. Authentication Flow

Kernex uses a "Setup First" approach.

### 5.1 Initial Setup
1.  On the first launch, the database is empty.
2.  Users are redirected to `/setup`.
3.  The user creates a **Root Account** (username/password).
4.  Credentials are hashed and stored in SQLite.

### 5.2 Login Session
*   **Method:** Session ID.
*   **Storage:** 
    *   **Browser:** HTTP-only Cookie (`kernex_session`).
    *   **API:** `x-auth-session` header.
    *   **Iframes:** Passed via URL query parameter `?token=...`.
*   **Validation:** Middleware checks the session ID against the `auth_session` table on every protected request.

---

## 6. Features Breakdown

### 6.1 Workspace Selector (`/workspace`)
The landing page where users manage their environments.
*   **Create:** Generate new workspaces with custom icons and optional password protection.
*   **Security:** "Protected Workspaces" require a secondary password to open, distinct from the login password.

### 6.2 The Canvas
The primary interface for a Workspace.
*   **Navigation:** Pan (drag background) and Zoom (Ctrl + Scroll / +/- keys).
*   **Nodes:** Draggable windows containing apps.
*   **Persistence:** Canvas state (node positions, zoom) is auto-saved every 60 seconds and on exit.

### 6.3 Core Plugins
*   **Terminal:** A fully functional web terminal connected to the server's shell.
*   **File Manager:** Browse, edit, and manage server files rooted in the `workspace/` directory.
*   **Notes:** A Markdown-based note-taking app stored in the DB.
*   **HTTP Tester:** A tool for making API requests (like Postman).

### 6.4 System Settings (`/system`, `/settings`)
*   **Monitor:** View real-time CPU/Memory usage (via `server/api/system.ts`).
*   **Logs:** View server activity logs recorded in the SQLite DB.
*   **Updates:** Built-in mechanism to pull the latest git changes and rebuild (if running from source).

---

## 7. API Reference

All API routes are prefixed with `/api`.

### Authentication
*   `POST /api/auth/setup` - Initialize the root account.
*   `POST /api/auth/login` - Authenticate and receive a session cookie.
*   `POST /api/auth/logout` - Destroy the current session.

### Workspaces
*   `GET /api/workspaces` - List all workspaces.
*   `POST /api/workspaces` - Create a new workspace.
*   `DELETE /api/workspaces/:id` - Delete a workspace.
*   `POST /api/workspaces/:id/verify` - Verify password for protected workspace.

### Canvas
*   `GET /api/canvas?workspaceId=...` - Load saved state.
*   `POST /api/canvas` - Save current node layout.

### File System
*   `GET /api/files/list?path=...` - List directory contents.
*   `POST /api/files/read` - Read file content.
*   `POST /api/files/write` - Write content to file.

*(Full API documentation available in `docs/API.md`)*

---

## 8. Data Storage & Backups

### User Data
All user-created files are stored in the `workspace/` directory at the project root.
*   **Backup Strategy:** Simply copy or archive the `workspace/` folder.

### System Data
System configuration, users, and logs are stored in `kernex.db` (SQLite).
*   **Backup Strategy:** Copy `kernex.db`.

---

## 9. Security Considerations

1.  **Isolation:** Workspaces are logical groupings, but they share the same underlying file system permissions as the Node.js process.
2.  **Iframe Security:** Plugins run in iframes but have access to the API via the passed token. Only install trusted plugins.
3.  **Production:** Ensure HTTPS is used (via a reverse proxy like Nginx) to protect the session cookie.

---

## 10. Troubleshooting

**"Workspace not found"**
*   Check if the folder exists in `workspace/`.
*   Ensure `metadata.json` is present and valid JSON.

**"Authentication Failed" (Loop)**
*   Clear browser cookies.
*   Check if the server was restarted (sessions might be cleared if using in-memory store fallback, though SQLite is persistent).

**"Plugin Refused to Connect"**
*   Verify `server/plugins` contains the built plugin files.
*   Check `ALLOWED_ORIGINS` if accessing from a different domain.

---

## 11. Maintenance

*   **Database:** The SQLite database will grow with logs. Use the **System > DB Manager** tool or `sqlite3` CLI to vacuum or prune old logs periodically.
*   **Logs:** Application logs are emitted to stdout and `logs/` directory. Rotate these logs externally if using `pm2` or Docker.
