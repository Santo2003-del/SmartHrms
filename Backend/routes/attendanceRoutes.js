const express = require('express');
const router = express.Router();

const { protect, hrOnly, requireSubscription } = require('../middleware/authMiddleware');
const controller = require('../controllers/attendanceController');

// Apply subscription check to all routes
router.use(protect, requireSubscription);

// EMPLOYEE
router.post('/punch-in', controller.punchIn);
router.post('/punch-out', controller.punchOut);
router.post('/break-start', controller.startBreak);
router.post('/break-end', controller.endBreak);

router.get('/history', controller.getMyHistory);
router.get('/stats', controller.getAttendanceStats);

// HR / ADMIN
router.get('/all', hrOnly, controller.getAllAttendance);
router.get('/history/:userId', hrOnly, controller.getUserHistory);
router.post('/manual', hrOnly, controller.markManualAttendance);

module.exports = router;
