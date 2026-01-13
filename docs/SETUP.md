# Installation & Setup Guide

## System Requirements
*   **Node.js:** v18.0.0 or higher
*   **NPM:** v9.0.0 or higher
*   **Operating System:** Linux, macOS, or Windows 10/11
*   **RAM:** Minimum 512MB (2GB recommended)
*   **Disk Space:** 500MB (plus space for your workspace files)

---

## 1. Quick Start (Local)

The fastest way to get Kernex running on your local machine.

```bash
# 1. Clone the repository
git clone https://github.com/Arjun-M/Kernex.git
cd kernex

# 2. Install dependencies
npm install

# 3. Start development server
# This runs both the Vite frontend (port 5173) and Fastify backend (port 3000)
npm run dev
```

Visit `http://localhost:5173` to verify the installation.

---

## 2. Configuration (`.env`)

Kernex uses environment variables for configuration. Create a `.env` file in the project root.

### Core Settings
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode: `development` or `production` | `development` |
| `PORT` | The port the backend server listens on. | `3000` |
| `HOST` | The interface to bind to (use `0.0.0.0` for Docker). | `localhost` |

### Security
| Variable | Description | Required? |
| :--- | :--- | :--- |
| `KERNEX_ENCRYPTION_KEY` | 32-char string used to encrypt database secrets. | **YES (Prod)** |
| `APP_AUTH_USERNAME` | Pre-set root username (skips setup). | No |
| `APP_AUTH_PASSWORD` | Pre-set root password. | No |

### Networking
| Variable | Description | Example |
| :--- | :--- | :--- |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated). | `https://mydomain.com` |

---

## 3. Initial Setup Wizard
When you first launch Kernex, the database is empty. You will be redirected to the **Setup Page**.

1.  **Welcome Screen:** You will see the "Initialize Kernex" prompt.
2.  **Create Root Account:** Enter a username and a strong password.
    *   *Note:* This is the "God Mode" account with full system access.
3.  **Completion:** Upon success, you are automatically logged in and redirected to the Workspace Selector.

---

## 4. Updates
To update your Kernex instance:

```bash
git pull origin main
npm install
npm run build
# Restart your server process
```
