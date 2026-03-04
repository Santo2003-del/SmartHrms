const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { uploadImage } = require('../middleware/uploadMiddleware');

const {
  loginUser,
  superAdminLogin,
  submitInquiry,
  registerEmployee,
  getActiveCompanies
} = require('../controllers/authController');

// ═══════════════════════════════════════════════
//  RATE LIMITERS (Brute Force Protection)
// ═══════════════════════════════════════════════

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // 10 attempts per IP
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const superAdminLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,   // 30 minutes
  max: 5,                      // 5 attempts per IP
  message: { message: 'Too many attempts. Try again after 30 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 5,                      // 5 registrations per IP
  message: { message: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 3,                      // 3 inquiries per IP
  message: { message: 'Too many inquiries. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════

// Logins (rate-limited)
router.post('/login', loginLimiter, loginUser);
router.post('/super-admin-login', superAdminLimiter, superAdminLogin);

// Registration (rate-limited)
router.post('/register', registerLimiter, uploadImage.single('image'), registerEmployee);

// Inquiry (rate-limited)
router.post('/inquiry', inquiryLimiter, submitInquiry);

// Helper
router.get('/companies', getActiveCompanies);

module.exports = router;
