# Workspaces & The Canvas

The **Workspace** is the fundamental unit of organization in Kernex. It represents a directory on your disk and a visual layout of your tools.

## 1. File Structure
Each workspace is a folder located in `workspace/<workspace-id>/`.

```
workspace/
└── my-project-123/
    ├── metadata.json   # Config (Name, Icon, Password Hash)
    ├── .kernex/        # (Optional) Hidden config
    ├── src/            # User files
    └── notes.md        # User files
```

Because workspaces are just folders, you can:
*   **Backup:** Zip the folder.
*   **Sync:** Use Syncthing or Dropbox to sync `workspace/` across machines.
*   **Version Control:** Initialize a `git` repo inside a workspace folder.

---

## 2. Password Protected Workspaces

Kernex allows you to secure individual workspaces with a secondary password. This is useful for separating "Public/Demo" environments from "Private/Personal" ones on the same server.

### How it Works
1.  **Creation:** When creating a workspace, toggle "Password Protection" and enter a password.
2.  **Storage:** The password is hashed (SHA-256) and stored in `workspace/<id>/metadata.json` as `passwordHash`.
3.  **Access:**
    *   Clicking a protected workspace prompts for the password.
    *   The frontend sends the input to `POST /api/workspaces/:id/verify`.
    *   If the hash matches, the server returns `success: true` and the frontend navigates to the workspace.

### Security Note
*   This protection is **Application Level**.
*   It prevents unauthorized access via the Kernex UI.
*   **It does NOT encrypt the files on disk.** An administrator with SSH access to the server can still browse `workspace/<id>/`.
*   For sensitive data, rely on the server's OS-level encryption or secure file permissions.

---

## 3. The Infinite Canvas

The interface is not a static dashboard but an infinite 2D plane.

### Navigation
*   **Pan:** Click and drag on the empty background (or hold Spacebar + Drag).
*   **Zoom:**
    *   `Ctrl` + `Scroll Wheel`
    *   `Ctrl` + `+` / `-` keys
    *   `Ctrl` + `0` to reset.

### Node Management
Apps and tools appear as **Nodes**.
*   **Add Node:** Use the Sidebar or the Plugin Drawer to drag/click apps onto the canvas.
*   **Move:** Drag the header of any node.
*   **Resize:** Drag the bottom-right corner.
*   **Maximize:** Double-click the header to fill the screen. Double-click again to restore.
*   **Minimize:** Click the `_` icon. The node shrinks to a small tab at the bottom of the screen.

---

## 4. State Persistence
Kernex automatically saves your layout.

*   **What is saved?**
    *   Node positions (X, Y)
    *   Dimensions (Width, Height)
    *   Z-Index (stacking order)
    *   Open files (for Editor plugins)
    *   Zoom level and Pan offset.
*   **When?**
    *   Every 60 seconds (Auto-save).
    *   On specific actions (Closing a node).
    *   **Manual Save:** Press `Ctrl + S`.

### Troubleshooting Saved State
If a workspace becomes "glitched" (e.g., a node is stuck off-screen), you can reset the view:
1.  Open the Browser Console (`F12`).
2.  Run `localStorage.clear()` (Note: This clears client preferences).
3.  Or, manually edit `workspace/<id>/canvas.json` (if implemented server-side) or the relevant DB entry.