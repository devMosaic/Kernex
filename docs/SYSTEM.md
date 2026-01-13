# System Management

Kernex includes a suite of tools to manage the host system, making it a powerful "Home Server OS."

## 1. System Monitor
Located at **System > Overview**.
*   **CPU:** Real-time usage graph (Updates every 2s).
*   **Memory:** RAM usage breakdown (Heap, System, Free).
*   **Uptime:** Server uptime.
*   **Platform:** OS details (Kernel, Distro).

*Data Source: `server/api/system.ts` using `os` module.*

---

## 2. Logs & Activity
Located at **System > Activity Logs**.

Kernex maintains a structured log database (`log_entries` table).
*   **Categories:**
    *   `AUTH`: Login successes/failures.
    *   `SYSTEM`: Server startup, errors.
    *   `ACCESS`: File access, workspace opening.
*   **Retention:** Logs are kept indefinitely by default. Use the **DB Manager** to prune old logs.

---

## 3. Settings Engine
Located at **Settings**.

Settings are stored in the database (`settings` table) as key-value pairs.

### Appearance
*   **Theme:** Switch between 'Neon Purple', 'Cyber Blue', 'Matrix', etc.
*   **Density:** Adjust the compactness of the UI (Compact vs Spacious).
*   **Font Size:** Global scaling.

### Behavior
*   **Auto-Save:** Configure the interval for canvas saving.
*   **Grid Snap:** Toggle magnetic snapping for nodes.

---

## 4. Updates
Kernex can self-update if running from a Git repository.
*   **Route:** `/settings/system-update`
*   **Mechanism:**
    1.  `git fetch origin`
    2.  `git reset --hard origin/main`
    3.  `npm install`
    4.  `npm run build`
    5.  Server restart trigger.

*Warning: This wipes local changes to core files. User data in `workspace/` is safe.*
