const express = require('express');
const router = express.Router();

const { protect, requireSubscription } = require('../middleware/authMiddleware');
const employeeController = require('../controllers/employeeController');

router.use(protect, requireSubscription);

// ✅ NEW: latest profile for employee dashboard
router.get('/me', employeeController.getMyProfile);

router.post('/wfh-request', employeeController.submitWfhRequest);

module.exports = router;
