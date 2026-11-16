const express = require('express');
const router = express.Router();

const { protect, superAdminOnly } = require('../middleware/authMiddleware');
const controller = require('../controllers/superAdminController');
const Inquiry = require('../models/Inquiry');

router.use(protect, superAdminOnly);

// Dashboard
router.get('/dashboard-data', controller.getDashboardData);

// Inquiry and Subscription provisioning
router.get('/inquiries', controller.getInquiries);
router.post('/inquiry/:id/action', controller.inquiryAction);
router.post('/inquiry/:id/provision', controller.provisionCompany);
router.post('/approve-inquiry', controller.approveInquiry); // Keep for legacy if needed
router.put('/inquiry/:id', controller.updateInquiry);

// Create company directly
router.post('/company', controller.createCompanyDirectly);

// Delete inquiry
router.delete('/inquiry/:id', async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Inquiry Deleted Successfully" });
  } catch (e) {
    res.status(500).json({ message: "Delete Failed" });
  }
});

// Company limit / delete / update
router.put('/company-limit/:companyId', controller.manageHrLimit);
router.delete('/company/:companyId', controller.deleteCompany);
router.put('/company/:companyId', controller.updateCompanyDetails);

module.exports = router;
