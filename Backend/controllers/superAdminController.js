// Backend/controllers/superAdminController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Inquiry = require('../models/Inquiry');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const Task = require('../models/Task');
const sendEmail = require('../utils/sendEmail');

const isSuperAdmin = (req) => req?.user?.role === 'SuperAdmin';

const safeJsonParse = (val, fallback = null) => {
  if (val == null) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val !== 'string') return fallback;
  const t = val.trim();
  if (!t) return fallback;
  try { return JSON.parse(t); } catch { return fallback; }
};

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

const toNum = (v, fallback = null) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clampStr = (s, max = 300) => {
  if (s == null) return '';
  const t = String(s);
  return t.length > max ? t.slice(0, max) : t;
};

/* ================= 1) DASHBOARD: Inquiries + Companies ================= */
const getDashboardData = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: "SuperAdmin only" });

    // ✅ Default: hide inactive companies (soft-deleted)
    // Optional: /dashboard-data?includeInactive=true => show all
    const includeInactive = String(req.query.includeInactive || '').toLowerCase() === 'true';
    const companyFilter = includeInactive ? {} : { status: { $ne: 'Inactive' } };

    const [inquiries, companies] = await Promise.all([
      Inquiry.find().sort({ createdAt: -1 }).lean(),
      Company.find(companyFilter).sort({ createdAt: -1 }).lean()
    ]);

    res.status(200).json({ inquiries, companies });
  } catch (error) {
    console.error("getDashboardData error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= 2) GET ALL INQUIRIES (optional filter) ================= */
const getAllInquiries = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: "SuperAdmin only" });

    const q = {};
    if (req.query.status) q.status = req.query.status;

    const inquiries = await Inquiry.find(q).sort({ createdAt: -1 }).lean();
    res.json(inquiries);
  } catch (e) {
    console.error("getAllInquiries error:", e);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= 3) UPDATE INQUIRY (radius/timezone/officeTiming etc.) ================= */
const updateInquiry = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: "SuperAdmin only" });

    const updates = { ...(req.body || {}) };

    // sanitize lat/lng/radius if sent
    if (updates.lat != null) updates.lat = toNum(updates.lat, updates.lat);
    if (updates.lng != null) updates.lng = toNum(updates.lng, updates.lng);

    if (updates.radius != null) {
      const r = toNum(updates.radius, 3000);
      updates.radius = r >= 100 ? r : 3000;
    }

    // officeTiming can be stringified JSON
    if (typeof updates.officeTiming === 'string') {
      updates.officeTiming = safeJsonParse(updates.officeTiming, undefined);
    }

    // do not allow changing companyId from update API
    delete updates.companyId;

    await Inquiry.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: "Inquiry Updated ✅" });
  } catch (e) {
    console.error("updateInquiry error:", e);
    res.status(500).json({ message: "Update Failed" });
  }
};

/* ================= 4) APPROVE INQUIRY -> PROVISION COMPANY + OWNER ================= */
const approveInquiry = async (req, res) => {
  const safeObjectIdOrNull = (v) => {
    try {
      if (!v) return null;
      const s = String(v);
      return mongoose.Types.ObjectId.isValid(s) ? new mongoose.Types.ObjectId(s) : null;
    } catch {
      return null;
    }
  };

  const isTxnNotSupported = (err) => {
    const msg = String(err?.message || "").toLowerCase();
    return (
      msg.includes("transaction") ||
      msg.includes("replica set") ||
      msg.includes("mongos") ||
      msg.includes("illegal operation") ||
      msg.includes("not supported") ||
      err?.code === 20 ||
      err?.codeName === "IllegalOperation"
    );
  };

  const isDupKey = (err) => err?.code === 11000;

  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: "SuperAdmin only" });

    const { inquiryId } = req.body || {};
    // Password is now in inquiry, not body
    if (!inquiryId) {
      return res.status(400).json({ message: "inquiryId required" });
    }

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    if (inquiry.status === "Approved" && inquiry.companyId) {
      return res.status(400).json({ message: "Inquiry already approved" });
    }

    const email = normalizeEmail(inquiry.email);

    // ✅ Prevent duplicates
    const [existingCompany, existingUser] = await Promise.all([
      Company.findOne({ email }),
      User.findOne({ email }),
    ]);
    if (existingCompany || existingUser) {
      return res.status(409).json({
        message: "Email already exists in system. Use updateCompanyDetails instead.",
        email,
      });
    }

    // ✅ Validate location
    const lat = toNum(inquiry.lat, null);
    const lng = toNum(inquiry.lng, null);
    const address = clampStr(inquiry.address, 300);

    if (lat === null || lng === null) {
      return res.status(400).json({
        message: "Office location (lat/lng) missing. Please update inquiry location before approving.",
      });
    }

    const radius = Number.isFinite(Number(inquiry.radius)) ? Number(inquiry.radius) : 3000;
    const officeTiming = inquiry.officeTiming ? inquiry.officeTiming : undefined;

    const companyPayload = {
      name: clampStr(inquiry.companyName, 120),
      email,
      location: {
        address: address || "N/A",
        lat,
        lng,
        radius: radius >= 100 ? radius : 3000,
      },
      officeTiming,
      status: "Active",
    };

    const ownerPayload = {
      name: clampStr(inquiry.contactPerson || inquiry.companyName, 120),
      email,
      mobile: String(inquiry.mobile || "0000000000").trim(),
      password: String(inquiry.password), // Use hashed password
      _isPasswordAlreadyHashed: true, // Flag for User model
      role: "CompanyAdmin",
      designation: "Owner",
      status: "Active",
      isApproved: true,
      approvedBy: safeObjectIdOrNull(req.user?._id),
      approvedAt: new Date(),
    };

    const provisionWithoutTxn = async () => {

      const companyDoc = await Company.create(companyPayload);
      ownerPayload.companyId = companyDoc._id;

      // Use constructor + save to ensure _isPasswordAlreadyHashed is preserved
      const owner = new User(ownerPayload);
      owner._isPasswordAlreadyHashed = true;
      await owner.save();


      inquiry.status = "Approved";
      inquiry.companyId = companyDoc._id;
      await inquiry.save();

      return companyDoc;
    };

    const provisionWithTxn = async () => {

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const companyDocArr = await Company.create([companyPayload], { session });
        const createdCompany = Array.isArray(companyDocArr) ? companyDocArr[0] : companyDocArr;

        ownerPayload.companyId = createdCompany._id;
        const owner = new User(ownerPayload);
        owner._isPasswordAlreadyHashed = true;
        await owner.save({ session });

        inquiry.status = "Approved";
        inquiry.companyId = createdCompany._id;
        await inquiry.save({ session });

        await session.commitTransaction();
        session.endSession();

        return createdCompany;
      } catch (err) {
        console.error("APPROVE_INQUIRY: Transaction failed, aborting...", err);
        try {
          await session.abortTransaction();
          session.endSession();
        } catch { }
        throw err;
      }
    };

    let companyDoc;

    try {
      companyDoc = await provisionWithTxn();
    } catch (err) {
      if (isTxnNotSupported(err)) {
        companyDoc = await provisionWithoutTxn();
      } else if (isDupKey(err)) {
        return res.status(409).json({ message: "Duplicate key. Company/User already exists." });
      } else {
        throw err;
      }
    }

    // Send Approval Email asynchronously
    try {
      const approvalMessage = `
            Dear ${ownerPayload.name},
            
            Congratulations! Your GMV Smart HRMS account has been APPROVED.
            
            You can now login to your dashboard:
            URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/company-login
            Email: ${email}
            
            Welcome aboard!
            
            Regards,
            GMV Smart HRMS Team
        `;
      // Don't await if you want to respond faster, but let's await for reliability in this debug phase
      await sendEmail({
        email: email,
        subject: 'Account Approved - GMV Smart HRMS',
        message: approvalMessage
      });

    } catch (err) {
      console.error("APPROVE_INQUIRY: Failed to send approval email", err);
    }

    return res.status(201).json({
      message: "Company Created Successfully ✅",
      companyId: companyDoc._id,
    });

  } catch (error) {
    console.error("approveInquiry error:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Duplicate key. Company/User already exists." });
    }
    return res.status(500).json({ message: "Provisioning Failed: " + (error?.message || "Unknown error") });
  }
};

/* ================= 5) MANAGE HR LIMIT REQUEST ================= */
const manageHrLimit = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: "SuperAdmin only" });

    const { companyId } = req.params;
    const { action, incrementBy } = req.body || {};

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (action === 'approve') {
      const inc = Number.isFinite(Number(incrementBy)) ? Number(incrementBy) : 1;
      company.maxHrAdmins = (company.maxHrAdmins || 1) + Math.max(1, inc);
      company.hrLimitRequest = 'None';
    } else {
      company.hrLimitRequest = 'None';
    }

    await company.save();
    res.json({ message: `Request ${action}d ✅`, company });
  } catch (error) {
    console.error("manageHrLimit error:", error);
    res.status(500).json({ message: "Action Failed" });
  }
};

/* ================= 6) UPDATE COMPANY DETAILS + OWNER SYNC ================= */
const updateCompanyDetails = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: "SuperAdmin only" });

    const { companyId } = req.params;
    const updates = { ...(req.body || {}) };

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    // Basic fields
    if (updates.companyName) company.name = clampStr(updates.companyName, 120);
    if (updates.email) company.email = normalizeEmail(updates.email);

    // Location updates
    if (!company.location) company.location = {};
    if (updates.address) company.location.address = clampStr(updates.address, 300);
    if (updates.lat !== undefined) company.location.lat = toNum(updates.lat, company.location.lat);
    if (updates.lng !== undefined) company.location.lng = toNum(updates.lng, company.location.lng);

    // radius
    if (updates.radius !== undefined) {
      const r = toNum(updates.radius, company.location.radius || 3000);
      company.location.radius = r >= 100 ? r : (company.location.radius || 3000);
    }

    // officeTiming object or json
    if (updates.officeTiming !== undefined) {
      const ot = typeof updates.officeTiming === 'string'
        ? safeJsonParse(updates.officeTiming, undefined)
        : updates.officeTiming;

      if (ot && typeof ot === 'object') {
        company.officeTiming = {
          ...(company.officeTiming || {}),
          ...ot
        };
      }
    }

    await company.save();

    // Sync owner
    const owner = await User.findOne({ companyId: companyId, role: 'CompanyAdmin', isDeleted: { $ne: true } });
    if (owner) {
      if (updates.companyName) owner.name = clampStr(updates.companyName, 120);
      if (updates.email) owner.email = normalizeEmail(updates.email);
      if (updates.mobile) owner.mobile = String(updates.mobile).trim();

      if (updates.password && String(updates.password).trim().length >= 6) {
        owner.password = String(updates.password);
      }
      await owner.save();
    }

    res.json({ message: "Company & Owner Details Updated ✅", company });
  } catch (error) {
    console.error("updateCompanyDetails error:", error);
    res.status(500).json({ message: "Update Failed" });
  }
};

/* ================= 7) DELETE / ARCHIVE COMPANY ================= */
const deleteCompany = async (req, res) => {
  try {
    if (!isSuperAdmin(req)) return res.status(403).json({ message: "SuperAdmin only" });

    const { companyId } = req.params;
    const hard = String(req.query.hard || '').toLowerCase() === 'true';

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (!hard) {
      // ✅ Soft delete (Recommended): keeps all data (attendance/leaves/tasks) for audit
      company.status = 'Inactive';
      await company.save();

      await User.updateMany(
        { companyId },
        { $set: { isDeleted: true, deletedAt: new Date(), status: 'Inactive' } }
      );

      await Inquiry.updateMany({ companyId }, { $set: { status: 'Rejected' } });

      return res.json({ message: "Company Archived (Soft Delete) ✅", companyId, status: "Inactive" });
    }

    // ❌ Hard delete: removes everything
    await Promise.all([
      User.deleteMany({ companyId }),
      Attendance.deleteMany({ companyId }),
      Leave.deleteMany({ companyId }),
      Holiday.deleteMany({ companyId }),
      Task.deleteMany({ companyId }),
      Company.findByIdAndDelete(companyId),
      Inquiry.updateMany({ companyId }, { $set: { status: 'Rejected' } })
    ]);

    res.json({ message: "Company Deleted (Hard) ✅", companyId, status: "Deleted" });
  } catch (error) {
    console.error("deleteCompany error:", error);
    res.status(500).json({ message: "Delete Failed" });
  }
};

module.exports = {
  getDashboardData,
  getAllInquiries,
  updateInquiry,
  approveInquiry,
  manageHrLimit,
  updateCompanyDetails,
  deleteCompany
};
