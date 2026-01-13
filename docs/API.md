# API Reference

This document outlines the core REST API endpoints available in Kernex.

**Base URL:** `/api`
**Auth Header:** `x-auth-session: <session_id>`

---

## Authentication

### `POST /auth/login`
Authenticates a user and starts a session.
*   **Body:** `{ "password": "..." }`
*   **Response:** `{ "success": true, "sessionId": "..." }`

### `POST /auth/logout`
Destroys the current session.

---

## Workspaces

### `GET /workspaces`
Returns a list of all available workspaces.
*   **Response:** `[{ "id": "demo", "name": "Demo", "isProtected": false, ... }]`

### `POST /workspaces`
Create a new workspace.
*   **Body:** `{ "name": "Project X", "icon": "Code", "password": "optional-pass" }`

### `DELETE /workspaces/:id`
Permanently deletes a workspace and its files.

---

## File System
*Note: All paths are relative to the workspace root.*

### `GET /files/list`
List files in a directory.
*   **Query:** `?path=src/components`
*   **Response:** `[{ "name": "Button.tsx", "type": "file" }, ...]`

### `POST /files/read`
Read a file's content.
*   **Body:** `{ "path": "README.md" }`
*   **Response:** `{ "content": "# Hello World" }`

### `POST /files/write`
Write content to a file.
*   **Body:** `{ "path": "notes.txt", "content": "Buy milk" }`

---

## System

### `GET /system/stats`
Get real-time server metrics.
*   **Response:**
    ```json
    {
      "cpu": 12.5,
      "memory": { "total": 16000, "free": 8000 },
      "uptime": 3600
    }
    ```

### `GET /logs`
Fetch recent system logs.
*   **Query:** `?limit=50&level=error`

---

## Canvas State

### `GET /canvas`
Load the node layout for a workspace.
*   **Query:** `?workspaceId=...`

### `POST /canvas`
Save the node layout.
*   **Body:**
    ```json
    {
      "workspaceId": "...",
      "nodes": [ ... ],
      "viewport": { "x": 0, "y": 0, "zoom": 1 }
    }
    ```