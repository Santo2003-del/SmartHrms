# Deployment Guide: Local to VPS via GitHub

Follow these exact steps to push your local updates to GitHub (`Santo2003-del/SmartHrms`) and pull them onto your live VPS server using your root SSH access.

---

## Part 1: Push Updates from Your Local Machine to GitHub

Open a terminal on your **local machine** (where your project folder is located) and run:

```bash
# 1. Add all modified and deleted files to staging
git add -A

# 2. Commit the changes locally
git commit -m "Security hardening, unused file cleanup, and console fixes"

# 3. Push the changes to your GitHub 'main' branch
git push origin main
```
*(Note: If Git asks for credentials or a PAT (Personal Access Token), provide them. If your branch is named `master` instead of `main`, use `git push origin master`)*

---

## Part 2: Pull and Deploy on the Live VPS Server

Connect to your VPS server via SSH:
```bash
ssh root@YOUR_VPS_IP_ADDRESS
```

Once logged into the server, run these commands in order:

```bash
# 1. Navigate to your project directory (adjust the path if it's different)
cd /var/www/SmartHrms   # OR cd /root/SmartHrms OR /var/www/html/SmartHrms

# 2. Pull the latest code from GitHub
git pull origin main

# 3. Install/Update Backend Dependencies
cd Backend
npm install

# 4. (Optional) Run Database Cleanup
# CAUTION: This will permanently delete all data except the SuperAdmin!
# If you want to keep existing users/companies intact, SKIP this command.
node cleanupDB.js

# 5. Restart the Backend Server using PM2
pm2 stop smarthrms 2>/dev/null || true
pm2 start server.js --name smarthrms
pm2 save

# 6. Install/Update Frontend Dependencies
cd ../frontend
npm install

# 7. Build the Frontend React App for Production
npm run build

# 8. Restart NGINX to ensure the frontend connects properly
# (Assuming your NGINX config points to the frontend/build folder and proxies /api to port 5001)
systemctl restart nginx
```

---

## Verification
Visit your domain (e.g., `https://smarthrms.cloud`).
1. The app should load quickly.
2. If you skipped step #4, your data should be intact.
3. Open the browser Developer Console (F12) — it should be completely empty (no `console.log` or errors).
4. Check an employee profile — the profile image should load correctly via the `/uploads` route.
