# Architecture Overview

This document explains the internal design of Kernex for contributors and curious developers.

## Tech Stack

| Component | Technology | Reason |
| :--- | :--- | :--- |
| **Backend** | Fastify | Faster than Express, better schema validation. |
| **Database** | SQLite (`better-sqlite3`) | Synchronous, embedded, zero-latency queries. |
| **Frontend** | React 18 | Component-based UI. |
| **Build** | Vite | Instant HMR, fast builds. |

---

## Directory Structure

```
/
├── server/
│   ├── server.ts         # Entry point
│   ├── db.ts             # Database connection & schema
│   ├── iframeRoutes.ts   # Plugin static serving
│   └── api/              # REST Endpoints
│       ├── auth.ts
│       ├── system.ts
│       └── ...
├── src/
│   ├── app/              # React Contexts (Auth, Settings)
│   ├── canvas/           # The Node system logic
│   ├── components/       # UI Library
│   └── plugins/          # Built-in React plugins
└── workspace/            # User data storage
```

---

## Core Concepts

### 1. The "Dual-Mode" Plugin System
Kernex supports two types of "Apps":
1.  **React Components:** Tightly integrated, fast, share memory with the main app. (e.g., Settings Page).
2.  **Iframe Plugins:** Isolated, secure, can be written in any stack. (e.g., Terminal, 3rd party tools).

### 2. The File System Abstraction
The backend exposes `server/api/files.ts` which acts as a restricted gateway to the OS file system.
*   It ensures operations are confined to `workspace/`.
*   It handles path sanitization to prevent directory traversal (`../../`).

### 3. Real-time Communication
*   **WebSockets:** Used by the Terminal (`/api/term/ws`) and Logs Viewer (`/api/logs/ws`).
*   **Polling:** Used by the Canvas to auto-save every 60s.