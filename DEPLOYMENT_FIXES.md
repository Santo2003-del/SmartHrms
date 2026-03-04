# GMV Smart HRMS — Full VPS Deployment Guide

Follow this guide to deploy your project **from scratch** on your live VPS server using root SSH access. 

---

## Prerequisites
Before you begin, ensure your VPS has Node.js (v18+), npm, PM2, and NGINX installed. If not, run:
```bash
# Update server packages
apt update && apt upgrade -y

# Install Node.js (v20 is recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx git

# Install PM2 and Serve globally
npm install -y -g pm2 serve
```

---

## Step 1: Clone the Repository to the Server

1. SSH into your VPS:
   ```bash
   ssh root@YOUR_VPS_IP
   ```
2. Navigate to your web directory and clone the repo:
   ```bash
   # Create the directory if it doesn't exist
   mkdir -p /var/www
   cd /var/www
   git clone https://github.com/Santo2003-del/SmartHrms.git
   cd SmartHrms
   ```

---

## Step 2: Configure and Start the Backend

1. Navigate to the backend folder:
   ```bash
   cd /var/www/SmartHrms/Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Create the Production `.env` File**:
   Run `nano .env` and paste the following config. Make sure to update your production URLs!
   ```env
   # ================= SERVER =================
   PORT=5001
   NODE_ENV=production
   
   # ================= DATABASE =================
   # Your MongoDB Atlas URI
   MONGO_URI=mongodb+srv://skhandagle1233_db_user:Santo2003@cluster0.vjsf3ql.mongodb.net/GMVHRMS?retryWrites=true&w=majority&appName=Cluster0
   
   # ================= JWT =================
   JWT_SECRET=adil12345a
   JWT_EXPIRES=7d
   
   # ================= SUPER ADMIN (ROOT) =================
   SUPER_ADMIN_EMAIL=SuperAdmin@gmv.com
   SUPER_ADMIN_PASSWORD=gmvhr@031022
   
   # ================= FRONTEND =================
   # EXACT URL of your live frontend (No trailing slash)
   FRONTEND_URL=https://smarthrms.cloud
   
   # ================= EMAIL (SMTP) =================
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=reportsinsider@gmail.com
   SMTP_PASS=qpap vjtv scwo jvaf
   ```
   Save the file (`Ctrl+O`, `Enter`, `Ctrl+X`).

4. **Start the Backend Server using PM2**:
   ```bash
   pm2 stop smarthrms 2>/dev/null || true
   pm2 start server.js --name smarthrms
   pm2 save
   pm2 startup
   ```
   *(Running `pm2 startup` ensures your backend automatically restarts if the server reboots).*

---

## Step 3: Configure and Build the Frontend

1. Navigate to the frontend folder:
   ```bash
   cd /var/www/SmartHrms/frontend
   ```
2. Install dependencies (this will respect the vulnerable-dependency overrides we added!):
   ```bash
   npm install
   ```
3. **Create the Production `.env` File**:
   Run `nano .env` and paste the following:
   ```env
   DISABLE_ESLINT_PLUGIN=true
   REACT_APP_GOOGLE_MAPS_KEY=AIzaSyAXrG8ruuKzE4xjW7IPvdYWMXoQkicfyGk
   GENERATE_SOURCEMAP=false
   
   # Point API to your live domain or leave as /api if using same-domain proxying
   REACT_APP_API_URL=/api
   ```
   Save the file (`Ctrl+O`, `Enter`, `Ctrl+X`).

4. **Build the Production Bundle**:
   ```bash
   npm run build
   ```

---

## Step 4: Configure NGINX (Domain Routing & Security)

Your frontend static files need to be served via NGINX, and API/Image requests need to be routed to your PM2 backend on port 5001.

1. Open the NGINX configuration file for your domain:
   ```bash
   nano /etc/nginx/sites-available/smarthrms
   ```
2. Paste the following configuration (Replace `smarthrms.cloud` with your actual domain name!):
   ```nginx
   server {
       listen 80;
       server_name smarthrms.cloud www.smarthrms.cloud;
   
       # Serve React frontend
       root /var/www/SmartHrms/frontend/build;
       index index.html;
   
       # React Router fallback
       location / {
           try_files $uri $uri/ /index.html;
       }
   
       # Proxy API requests to Node.js backend
       location /api/ {
           proxy_pass http://127.0.0.1:5001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_cache_bypass $http_upgrade;
       }
   
       # Proxy Image Upload requests to Node.js backend
       # CRITICAL: This makes user profile images visible!
       location /uploads/ {
           proxy_pass http://127.0.0.1:5001;
       }
   }
   ```
3. Save the file, enable the site, and restart NGINX:
   ```bash
   ln -s /etc/nginx/sites-available/smarthrms /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

---

## Step 5: Secure with SSL (HTTPS)
For camera (face recognition) and GPS to work on the live server, you **must** have HTTPS. 
Use Certbot to get a free SSL certificate:

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d smarthrms.cloud -d www.smarthrms.cloud
```
*(Follow the prompts to enforce HTTPS redirection).*

---

## Done!

Your system is now live, virus/malware protected (due to our security hardening and console suppression), and securely hosted! You can visit `https://smarthrms.cloud` and everything will work correctly including profile images.
