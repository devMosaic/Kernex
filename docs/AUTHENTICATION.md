# Authentication & Security

Kernex employs a robust, session-based authentication system designed for self-hosted environments.

## 1. The Authentication Flow

### Setup Phase
Kernex creates a `kernex.db` SQLite file on first run. If the `auth_user` table is empty, the system enters **Setup Mode**.
*   **Route:** `/setup` (Frontend), `/api/auth/setup` (Backend)
*   **Action:** The user defines the root credentials. The password is hashed (using Node's `crypto` scrypt or similar) and stored.

### Login Phase
*   **Route:** `/api/auth/login`
*   **Mechanism:**
    1.  User submits credentials.
    2.  Server verifies hash.
    3.  Server generates a random 32-byte Session ID.
    4.  Session is stored in `auth_session` table with an expiration (default: 7 days).
    5.  Server responds with `Set-Cookie: kernex_session=...; HttpOnly; SameSite=Strict`.

### Session Validation
Every protected API request passes through the `authenticate` middleware:
1.  Checks for `kernex_session` cookie.
2.  Alternatively checks `x-auth-session` header (for API clients).
3.  Validates existence and expiration in the DB.
4.  Updates `last_active` timestamp (Sliding Window session).

---

## 2. Password Protected Workspaces

Workspaces can be individually locked with a secondary password.

*   **Scenario:** You have a "Personal" workspace and a "Demo" workspace. You want to show the Demo one to a friend without risking them opening your Personal files.
*   **Implementation:**
    *   The workspace metadata (`metadata.json`) stores a SHA-256 hash of the workspace password.
    *   This password is **separate** from your login password.
    *   Access requires a verified `POST /api/workspaces/:id/verify` call.

---

## 3. Security Best Practices

### Production Deployment
*   **HTTPS is Mandatory:** The session cookie is secure; transmitting it over HTTP exposes your session.
*   **Encryption Key:** Set `KERNEX_ENCRYPTION_KEY` in production. If not set, a random key is generated on startup, rendering previously encrypted secrets (like API keys in the Settings) unreadable after a restart.

### Iframes & Plugins
*   Kernex runs plugins in `<iframe>` elements.
*   These iframes are **Same-Origin** by default to allow API access.
*   **Risk:** A malicious plugin could theoretically make API calls on your behalf.
*   **Mitigation:** Only install plugins from trusted sources. Review `index.html` and `main.js` of any manual plugins you add.

### Database
*   The `kernex.db` file contains your session tokens and hashed passwords.
*   Ensure file permissions on the server prevent read access by other system users.
