"use strict";
const dns = require("dns");
// Force IPv4 first to avoid ECONNREFUSED on IPv6 addresses like 2404:6800:...
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Ignore in older node versions
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
// ✅ Security middleware
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const companyRoutes = require("./routes/companyRoutes");
const hrRoutes = require("./routes/hrRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const taskRoutes = require("./routes/taskRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");

const app = express();

// ═══════════════════════════════════════════════
//  SECURITY MIDDLEWARE LAYER
// ═══════════════════════════════════════════════

// 1. Helmet — secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    xContentTypeOptions: true,          // nosniff
    frameguard: { action: "deny" },     // clickjacking prevention
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// 2. CORS — dynamic origin whitelist
const ALLOWED_ORIGINS = [
  "https://smarthrms.cloud",
  "https://www.smarthrms.cloud",
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));

// 3. Body parsers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// 4. NoSQL Injection Prevention — custom sanitizer (express-mongo-sanitize is incompatible with Express 5)
const sanitizeNoSQL = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeNoSQL);

  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    // Prevent keys that start with $ (MongoDB operators)
    const cleanKey = k.startsWith("$") ? k.substring(1) : k;
    clean[cleanKey] = sanitizeNoSQL(v);
  }
  return clean;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeNoSQL(req.body);
  if (req.params) req.params = sanitizeNoSQL(req.params);
  // req.query in Express 5 is read-only and uses a getter, so we skip mutating it
  next();
});

// 5. XSS Prevention — custom sanitizer (xss-clean is incompatible with Express 5)
const stripXSS = (obj) => {
  if (typeof obj === "string") return obj.replace(/[<>]/g, "");
  if (Array.isArray(obj)) return obj.map(stripXSS);
  if (obj && typeof obj === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) clean[k] = stripXSS(v);
    return clean;
  }
  return obj;
};
app.use((req, res, next) => {
  if (req.body) req.body = stripXSS(req.body);
  if (req.params) req.params = stripXSS(req.params);
  next();
});

// 6. Global Rate Limiter — relaxed for SPA dashboards & multi-requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // relaxed from 100 to 5000 so dashboard auto-fetches and API calls never hit 429
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", globalLimiter);

// 7. Compression — gzip responses
app.use(compression());

// 8. Static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve React production build if available
const frontendBuild = path.join(__dirname, "../frontend/build");
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));
}

// ═══════════════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════════════
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/support", require("./routes/supportRoutes"));

// ═══════════════════════════════════════════════
//  SPA FRONTEND FALLBACK (Serve index.html for non-API routes)
// ═══════════════════════════════════════════════
app.use((req, res, next) => {
  if (req.method !== "GET" || req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/uploads")) {
    return next();
  }
  const indexPath = path.join(frontendBuild, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// ═══════════════════════════════════════════════
//  ERROR HANDLING
// ═══════════════════════════════════════════════
app.use(notFound);
app.use(errorHandler);

const startSubscriptionCron = require('./jobs/subscriptionCron');

const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  startSubscriptionCron();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};
start();
