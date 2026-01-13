# Deployment Guide

Kernex is designed to be self-hosted. This guide covers deploying to various environments.

## 1. Production with Node.js

This is the standard way to run Kernex on a VPS (DigitalOcean, AWS, Linode).

### Prerequisites
*   Node.js v18+
*   Nginx (Recommended for SSL/Reverse Proxy)
*   PM2 (Process Manager)

### Steps
1.  **Clone & Build:**
    ```bash
    git clone https://github.com/Arjun-M/Kernex.git /opt/kernex
    cd /opt/kernex
    npm install
    npm run build
    ```

2.  **Configure Environment:**
    Create `.env`:
    ```env
    NODE_ENV=production
    KERNEX_ENCRYPTION_KEY=super-secret-key-at-least-32-chars
    ```

3.  **Start with PM2:**
    ```bash
    npm install -g pm2
    pm2 start npm --name "kernex" -- start
    pm2 save
    ```

4.  **Nginx Reverse Proxy:**
    ```nginx
    server {
        listen 80;
        server_name kernex.yourdomain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
        }
    }
    ```

---

## 2. Docker Deployment

Kernex provides an official `Dockerfile`.

### Build Image
```bash
docker build -t kernex:latest .
```

### Run Container
```bash
docker run -d \
  --name kernex \
  -p 3000:3000 \
  -v kernex-data:/app/workspace \
  -e KERNEX_ENCRYPTION_KEY=change_me_to_random_string \
  kernex:latest
```

*   **Volume:** We mount `kernex-data` to `/app/workspace` so your files persist across container restarts.

---

## 3. SSL/HTTPS

For security, **always** run Kernex behind HTTPS in production.
*   Use **Certbot** with Nginx: `sudo certbot --nginx -d kernex.yourdomain.com`
*   Or use a managed load balancer (AWS ALB, Cloudflare).

*Note: Without HTTPS, the `Secure` flag on session cookies will prevent login if `NODE_ENV=production`.*