# Features & Plugins

Kernex comes with a suite of built-in tools (plugins) designed to replace the disparate utilities developers often keep open in browser tabs.

## Core System

### 🖥️ Terminal
A fully functional xterm.js-based terminal that connects directly to the host machine's shell.
*   **Persistent:** Sessions remain active even if you reload the page.
*   **Context Aware:** Opens in the root of the active workspace.
*   **Secure:** Websocket-based communication.

### 📂 File Manager (Enhanced)
A fully-featured, VS Code-inspired file explorer to browse and manage your server's filesystem.
*   **Explorer:** Tree view with inline creation, renaming, and deletion.
*   **Drag & Drop:** 
    *   Move files/folders within the tree to reorganize.
    *   Upload files from your computer by dropping them onto specific folders.
*   **Editor:** Integrated code editor (Monaco) with syntax highlighting for 30+ languages.
*   **Context Menu:** Right-click actions for quick management.

### 🖼️ Photo Viewer
A dedicated viewer for image files.
*   **Supported Formats:** PNG, JPG, GIF, WEBP, SVG.
*   **Drag & Drop:** Drag an image onto the canvas to instantly open it in the viewer.

### 📥 Universal Drag & Drop
*   **Drop to Upload:** Drag files anywhere on the canvas to upload them.
    *   **Images:** Automatically open in the Photo Viewer.
    *   **Others:** Upload silently to the `workspace/uploads/` directory.
*   **Progress Tracking:** Real-time floating progress bar for multiple uploads.

### 📝 Notes
A rich-text markdown note-taking tool.
*   **Auto-save:** Notes are persisted to the local database.
*   **Multiple Instances:** Open as many note nodes as you need.

## Developer Utilities

### 🧪 HTTP Tester
A lightweight API testing client (similar to Postman/Insomnia).
*   **Methods:** GET, POST, PUT, DELETE, PATCH.
*   **Features:** Custom headers, JSON body editor, response preview.

### ⚖️ Diff Viewer
Compare two blocks of text side-by-side.
*   **Highlighting:** Color-coded additions and removals.
*   **Live Update:** See changes as you type.

### 🔍 Regex Tester
Test regular expressions against sample text.
*   **Real-time:** Visual feedback on matches.
*   **Flags:** Support for global, case-insensitive, and multiline flags.

## Data & Formats

### 📄 Data Converters
Tools to format, validate, and convert structured data.
*   **JSON:** Prettify, minify, and validate JSON.
*   **YAML:** Convert between YAML and JSON.
*   **XML:** Parse and format XML.
*   **CSV:** View CSV files as interactive tables.

### 🆔 Generators
*   **UUID:** Generate UUID v4 strings.
*   **Password:** Create secure random passwords with custom complexity rules.

## Security & Crypto

### 🔐 Encryption & Hashing
*   **Hash:** Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes.
*   **HMAC:** Generate Keyed-Hash Message Authentication Codes.
*   **Base64:** Encode and decode text to Base64.
*   **Encryption:** Encrypt/Decrypt text using AES-GCM (client-side).

## System Management

*   **Process Manager:** View running system processes.
*   **Disk Usage:** Visualize disk space consumption.
*   **Logs:** View application logs in real-time.

## Gallery

### Interactive Workspace
![Workspace](../public/assets/workspace.png)

### Tools & Dashboard
![Home](../public/assets/home.png)

### Configuration
![Settings](../public/assets/settings.png)
