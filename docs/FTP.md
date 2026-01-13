# FTP Server & Client

Kernex includes a built-in FTP server and a web-based FTP client, providing a versatile way to manage files.

## 1. Internal FTP Server

The internal FTP server allows you to upload files to your workspace using external tools (like FileZilla) or the built-in FTP Client plugin.

### Connection Details
*   **Protocol:** FTP (Passive Mode)
*   **Host:** `localhost` (if local) or your server's IP.
*   **Port:** `2121`
*   **Passive Ports:** `30000-30100` (Must be open in firewall for external access)

### Configuration
Go to **System > FTP Server** to:
1.  **Create Users:** Define usernames, passwords, and root directories.
2.  **Set External IP:** If hosting on a cloud server, you **must** set the Public IP in the configuration section for passive mode to work.

### Root Directories
When creating a user, you specify a **Root Directory** (e.g., `/uploads/client_a`).
*   This path is relative to the `workspace/` folder.
*   Users are "jailed" to this directory and cannot access files outside of it.
*   The directory is automatically created upon first login if it doesn't exist.

---

## 2. FTP Client Plugin

The **FTP Client** plugin (found in the Plugin Drawer) allows you to connect to FTP servers directly from the Kernex interface.

### Features
*   **Internal Access:** Connect to the built-in server (`localhost`, `2121`) to manage workspace files.
*   **External Access:** Connect to any remote FTP server.
*   **Drag & Drop Upload:** Drag files from your computer into the plugin window to upload.
*   **Navigation:** Browse folders and download files.

### Troubleshooting
*   **Connection Timed Out:** Usually a firewall issue. Ensure ports `2121` and `30000-30100` are open.
*   **Empty Directory Listing:** Check if the "External IP" is configured correctly in **System > FTP Server**.
