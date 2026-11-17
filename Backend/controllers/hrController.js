// Backend/controllers/hrController.js
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const Company = require('../models/Company');


const OnboardingTemplate = require('../models/OnboardingTemplate');
const OnboardingAssignment = require('../models/OnboardingAssignment');

const PDFDocument = require('pdfkit');

/* ----------------------- Helpers ----------------------- */
const getReqUserId = (req) => req?.user?._id?.toString?.() || req?.user?.id || null;

const isHrRole = (role) => ['Admin', 'CompanyAdmin', 'Company', 'HR', 'SuperAdmin'].includes(role);

const clampStr = (s, max = 1000) => {
  if (s == null) return '';
  const t = String(s);
  return t.length > max ? t.slice(0, max) : t;
};

const dateStrInTZ = (date, tz) =>
  new Date(date).toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD

// robust timezone time -> UTC Date (DST safe)
const zonedTimeToUtc = (dateStr, timeStr, tz) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);

  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = Object.fromEntries(
    dtf.formatToParts(guess)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  );

  const tzAsUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  const offsetMs = tzAsUTC - guess.getTime();
  return new Date(guess.getTime() - offsetMs);
};

// inclusive list of date strings in TZ
const getDateStringsBetweenInTZ = (startDate, endDate, tz) => {
  const startStr = dateStrInTZ(startDate, tz);
  const endStr = dateStrInTZ(endDate, tz);

  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);

  let cursor = new Date(Date.UTC(sy, sm - 1, sd, 12, 0, 0));
  const end = new Date(Date.UTC(ey, em - 1, ed, 12, 0, 0));

  const out = [];
  while (cursor.getTime() <= end.getTime()) {
    out.push(dateStrInTZ(cursor, tz));
    cursor = new Date(cursor.getTime() + 86400000);
  }
  return out;
};

const computeNetHours = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return 0;
  const ms = punchOut.getTime() - punchIn.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Number((ms / 36e5).toFixed(2));
};

const guardSameCompany = (req, targetCompanyId) => {
  if (req.user?.role === 'SuperAdmin') return true;
  if (!req.user?.companyId) return false;
  return String(req.user.companyId) === String(targetCompanyId);
};

/* ----------------------- 1) EMPLOYEE MANAGEMENT ----------------------- */

const getAllEmployees = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const q = { role: 'Employee', isDeleted: { $ne: true } };

    if (req.user.role !== 'SuperAdmin') {
      q.companyId = req.user.companyId;
    } else if (req.query.companyId) {
      q.companyId = req.query.companyId;
    }

    if (req.query.status) q.status = req.query.status;
    if (req.query.search) {
      const s = String(req.query.search).trim();
      q.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { mobile: { $regex: s, $options: 'i' } }
      ];
    }

    const employees = await User.find(q)
      .select('-password -faceDescriptor -faceDescriptorVec')
      .sort({ createdAt: -1 })
      .limit(500);

    res.status(200).json(employees);
  } catch (err) {
    console.error('getAllEmployees error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateEmployeeDetails = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const { userId } = req.params;
    const updates = { ...(req.body || {}) };

    delete updates.password;
    delete updates.role;
    delete updates.companyId;
    delete updates.isApproved;
    delete updates.status;
    delete updates.approvedBy;
    delete updates.approvedAt;
    delete updates.faceDescriptor;
    delete updates.faceDescriptorVec;
    delete updates.isDeleted;
    delete updates.deletedAt;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });

    if (!guardSameCompany(req, user.companyId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowed = ['name', 'email', 'mobile', 'designation', 'department', 'managerId', 'employeeCode', 'basicSalary', 'salary', 'joiningDate'];



    // 1. Generic updates
    for (const k of allowed) {
      if (k in updates && k !== 'basicSalary' && k !== 'salary' && k !== 'joiningDate') {
        user[k] = updates[k];
      }
    }

    // 2. Salary Sync (Update both basicSalary and salary)
    if (updates.basicSalary !== undefined || updates.salary !== undefined) {
      const val = updates.basicSalary !== undefined ? updates.basicSalary : updates.salary;
      const numVal = Number(val);

      if (numVal < 0 || isNaN(numVal)) {
        return res.status(400).json({ message: 'Invalid salary value' });
      }

      user.basicSalary = numVal;
      user.salary = numVal; // Keep legacy field in sync

    }

    // 3. Joining Date
    if (updates.joiningDate !== undefined) {
      const d = new Date(updates.joiningDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid joining date' });
      }
      user.joiningDate = d;
    }

    await user.save();

    const safe = user.toJSON();
    res.json({ message: 'Employee updated successfully', user: safe });
  } catch (err) {
    console.error('updateEmployeeDetails error:', err);
    res.status(500).json({ message: 'Update failed' });
  }
};

/**
 * ✅ UPDATED: approveEmployee
 * - Default: onboarding auto-assign OFF
 * - Optional: send { autoAssignOnboarding: true } to enable old behavior
 * - No auto employee/user creation anywhere
 */
const approveEmployee = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const { userId, basicSalary, joiningDate, autoAssignOnboarding } = req.body || {};
    if (!userId || !basicSalary || !joiningDate) {
      return res.status(400).json({ message: 'userId, joiningDate and basicSalary are required.' });
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });

    if (!guardSameCompany(req, user.companyId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const salaryNum = Number(basicSalary);
    const jDate = new Date(joiningDate);
    if (!Number.isFinite(salaryNum) || salaryNum <= 0) {
      return res.status(400).json({ message: 'Invalid salary' });
    }
    if (Number.isNaN(jDate.getTime())) {
      return res.status(400).json({ message: 'Invalid joiningDate' });
    }

    user.isApproved = true;
    user.status = 'Active';
    user.basicSalary = salaryNum;
    user.salary = salaryNum;
    user.joiningDate = jDate;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();

    if (!user.employeeCode) {
      user.employeeCode = `EMP-${String(user._id).slice(-6).toUpperCase()}`;
    }

    await user.save();

    // ✅ IMPORTANT: Default = NO onboarding auto-assign (old employees bhi same registration flow)
    // If you want old behavior sometimes, pass: autoAssignOnboarding: true
    if (autoAssignOnboarding === true) {
      try {
        const template = await OnboardingTemplate.findOne({
          companyId: user.companyId,
          isActive: true
        }).sort({ createdAt: -1 }).lean();

        if (template) {
          const items = (template.items || []).map((it) => {
            const dueAt = it?.dueDays
              ? new Date(jDate.getTime() + Number(it.dueDays) * 86400000)
              : null;

            let desc = it.description || '';
            if (Array.isArray(it.attachments) && it.attachments.length) {
              const attachText = it.attachments
                .map((a) => `• ${a.type === 'link' ? 'Link' : 'File'}: ${a.name || ''} ${a.url || ''}`.trim())
                .join('\n');
              desc = `${desc}\n\nAttachments:\n${attachText}`;
            }

            return {
              templateItemId: it._id,
              title: it.title || '',
              description: desc,
              ownerRole: it.ownerRole || 'Employee',
              dueAt: dueAt || null,
              status: 'Pending',
              doneAt: null,
              comment: ''
            };
          });

          await OnboardingAssignment.findOneAndUpdate(
            { companyId: user.companyId, userId: user._id },
            { $set: { templateId: template._id, status: 'Active', items } },
            { upsert: true, new: true }
          );
        }
      } catch (e) {
        console.error('Onboarding auto-assign failed (non-blocking):', e?.message);
      }
    }

    res.json({
      message: 'Employee Approved & Active 🚀',
      onboardingAutoAssigned: autoAssignOnboarding === true
    });
  } catch (err) {
    console.error('approveEmployee error:', err);
    res.status(500).json({ message: 'Approval failed' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const user = await User.findById(req.params.userId);
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });

    if (!guardSameCompany(req, user.companyId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [attendanceCount, leaveCount] = await Promise.all([
      Attendance.countDocuments({ userId: user._id }),
      Leave.countDocuments({ userId: user._id })
    ]);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Exit_Report_${String(user.name || 'Employee').replace(/\s+/g, '_')}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text('EMPLOYEE EXIT REPORT', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Designation: ${user.designation}`);
    doc.text(`Status: Terminated/Left`);
    doc.moveDown();

    doc.text(`Total Working Days Logged: ${attendanceCount}`);
    doc.text(`Total Leaves Taken: ${leaveCount}`);
    doc.moveDown();

    doc.fontSize(10).text('Generated by HRMS System', { align: 'center' });
    doc.end();

    res.on('finish', async () => {
      try {
        await Promise.all([
          Attendance.deleteMany({ userId: user._id }),
          Leave.deleteMany({ userId: user._id }),
          OnboardingAssignment.deleteMany({ userId: user._id }),
          User.deleteOne({ _id: user._id })
        ]);
      } catch (e) {
        console.error('deleteEmployee cleanup failed:', e?.message);
      }
    });
  } catch (err) {
    console.error('deleteEmployee error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'Delete failed' });
  }
};

/* ----------------------- 2) MANUAL ATTENDANCE (HR) ----------------------- */

const addManualAttendance = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const { userId, date, status, remarks, inTime, outTime } = req.body || {};
    if (!userId || !date) return res.status(400).json({ message: 'userId & date required' });

    const user = await User.findById(userId).populate('companyId');
    if (!user || user.isDeleted) return res.status(404).json({ message: 'Employee not found' });

    if (!guardSameCompany(req, user.companyId?._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const company = user.companyId;
    const tz = company?.officeTiming?.timeZone || 'Asia/Kolkata';
    const startTime = company?.officeTiming?.startTime || '09:30';
    const endTime = company?.officeTiming?.endTime || '18:30';

    const safeDate = String(date).trim();

    const punchIn = (status === 'Holiday' || status === 'Absent' || status === 'On Leave')
      ? null
      : zonedTimeToUtc(safeDate, inTime || startTime, tz);

    const punchOut = (status === 'Holiday' || status === 'Absent' || status === 'On Leave')
      ? null
      : zonedTimeToUtc(safeDate, outTime || endTime, tz);

    let netWorkHours = 0;
    if (['Present', 'HalfDay', 'Completed'].includes(status) && punchIn && punchOut) {
      netWorkHours = computeNetHours(punchIn, punchOut);
    }

    // ✅ Only Paid/Unpaid/WFH meaning for payroll:
    const mode =
      status === 'Holiday' ? 'Holiday'
        : status === 'On Leave' ? 'Paid Leave'
          : status === 'Absent' ? 'Unpaid Leave'
            : 'Manual';

    const updateData = {
      userId: user._id,
      companyId: company._id,
      date: safeDate,
      status: status || 'Present',
      mode,
      source: 'MANUAL_HR',
      remarks: clampStr(remarks || 'Manual entry by HR', 800),
      isManualEntry: true,
      addedBy: getReqUserId(req),
      netWorkHours,
      punchInTime: punchIn,
      punchOutTime: punchOut,
      isEdited: true,
      editedBy: req.user._id
    };

    const record = await Attendance.findOneAndUpdate(
      { userId: user._id, date: safeDate, companyId: company._id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Attendance Updated Successfully', data: record });
  } catch (err) {
    console.error('addManualAttendance error:', err);
    res.status(500).json({ message: 'Attendance update failed' });
  }
};

/* ----------------------- 3) HOLIDAY MANAGEMENT ----------------------- */

const markHoliday = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const { date, reason } = req.body || {};
    if (!date || !reason) return res.status(400).json({ message: 'date & reason required' });

    const companyId = req.user.role === 'SuperAdmin' ? (req.body.companyId || req.query.companyId) : req.user.companyId;
    if (!companyId) return res.status(400).json({ message: 'Company missing' });

    const exists = await Holiday.findOne({ date, companyId }).lean();
    if (exists) return res.status(400).json({ message: 'Holiday already exists for this date' });

    const holiday = await Holiday.create({
      date: String(date),
      reason: clampStr(reason, 300),
      year: new Date(date).getFullYear(),
      companyId
    });

    const employees = await User.find({
      companyId,
      role: 'Employee',
      status: 'Active',
      isDeleted: { $ne: true }
    }).select('_id').lean();

    const existing = await Attendance.find({ companyId, date: String(date) })
      .select('userId punchInTime punchOutTime')
      .lean();

    const locked = new Set(
      existing
        .filter((a) => a.punchInTime || a.punchOutTime)
        .map((a) => String(a.userId))
    );

    const ops = [];
    for (const emp of employees) {
      if (locked.has(String(emp._id))) continue;

      ops.push({
        updateOne: {
          filter: {
            userId: emp._id,
            date: String(date),
            companyId
          },
          update: {
            $set: {
              status: 'Holiday',
              mode: 'Holiday',
              remarks: clampStr(reason, 300),
              netWorkHours: 0,
              source: 'SYSTEM',
              punchInTime: null,
              punchOutTime: null
            }
          },
          upsert: true
        }
      });
    }

    if (ops.length) {
      await Attendance.bulkWrite(ops, { ordered: false });
    }

    res.status(201).json({
      message: 'Holiday marked & Attendance updated',
      holiday,
      updatedEmployees: ops.length,
      skippedEmployeesWithPunch: locked.size
    });
  } catch (err) {
    console.error('markHoliday error:', err);
    res.status(500).json({ message: 'Failed to mark holiday' });
  }
};

/* ----------------------- 4) EMPLOYEE HISTORY ----------------------- */

const getEmployeeHistory = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const user = await User.findById(req.params.userId).select('-password -faceDescriptor -faceDescriptorVec');
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });

    if (!guardSameCompany(req, user.companyId)) return res.status(403).json({ message: 'Access denied' });

    // ✅ Legacy compatible company scope
    const history = await Attendance.find({
      userId: user._id,
      $or: [{ companyId: user.companyId }, { companyId: { $exists: false } }]
    })
      .sort({ date: -1 })
      .limit(366);

    res.json({ user, history });
  } catch (err) {
    console.error('getEmployeeHistory error:', err);
    res.status(500).json({ message: 'Fetch failed' });
  }
};


/* ----------------------- 5) PAYROLL STATS (Attendance-driven) ----------------------- */

const getPayrollStats = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const { userId } = req.params;

    const user = await User.findById(userId).lean();
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });

    if (!guardSameCompany(req, user.companyId)) return res.status(403).json({ message: 'Access denied' });

    const company = await Company.findById(user.companyId).lean();
    const tz = company?.officeTiming?.timeZone || 'Asia/Kolkata';

    const now = new Date();
    let start = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12, 0, 0));
    let end = req.query.endDate ? new Date(req.query.endDate) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 12, 0, 0));

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    if (start.getTime() > end.getTime()) {
      const tmp = start;
      start = end;
      end = tmp;
    }

    let dayStrings = getDateStringsBetweenInTZ(start, end, tz);
    if (!dayStrings || !dayStrings.length) {
      dayStrings = [dateStrInTZ(start, tz)];
    }
    const startStr = dayStrings[0];
    const endStr = dayStrings[dayStrings.length - 1];

    const [attendance, holidays] = await Promise.all([
      Attendance.find({
        userId: user._id,
        date: { $gte: startStr, $lte: endStr },
        $or: [{ companyId: user.companyId }, { companyId: { $exists: false } }]
      }).lean(),
      Holiday.find({ companyId: user.companyId, date: { $gte: startStr, $lte: endStr } }).lean()
    ]);

    const attMap = new Map(attendance.map((a) => [a.date, a]));
    const holidaySet = new Set(holidays.map((h) => h.date));

    let presentDays = 0;
    let halfDays = 0;
    let wfhDays = 0;
    let holidayCount = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;
    let absentDays = 0;

    for (const d of dayStrings) {
      const a = attMap.get(d);

      if (a) {
        const st = String(a.status || '');
        const mode = String(a.mode || '');

        if (mode === 'Holiday' || st === 'Holiday') { holidayCount++; continue; }
        if (st === 'HalfDay') { halfDays++; continue; }
        if (mode === 'WFH') { wfhDays++; continue; }

        if (mode === 'Paid Leave' || st === 'On Leave') { paidLeaveDays++; continue; }
        if (mode === 'Unpaid Leave' || st === 'Absent') { unpaidLeaveDays++; absentDays++; continue; }

        if (['Present', 'Completed'].includes(st)) { presentDays++; continue; }
      } else {
        if (holidaySet.has(d)) holidayCount++;
        else absentDays++;
      }
    }

    const totalPayableDays = presentDays + wfhDays + paidLeaveDays + holidayCount + (halfDays * 0.5);

    // Fixed 30-day calculation (as per policy)
    const FIXED_MONTH_DAYS = 30;
    const baseSalary = Number(user.basicSalary || user.salary || 0);
    const extraDays = Math.min(10, Math.max(0, parseInt(req.query.extraDays) || 0)); // 0-10 cap

    // unpaidDays = absent + unpaid leave (counted in absentDays)
    const unpaidDays = absentDays;

    let estimatedSalary;
    if (unpaidDays === 0 && extraDays === 0) {
      // Full salary if no unpaid days and no extra adjustment
      estimatedSalary = Math.round(baseSalary);
    } else {
      // Prorate using fixed 30 days
      const perDaySalary = baseSalary > 0 ? baseSalary / FIXED_MONTH_DAYS : 0;
      let paidDays = FIXED_MONTH_DAYS - unpaidDays + extraDays;
      // Cap: paid_days cannot exceed 30 (no exceed monthly)
      paidDays = Math.min(FIXED_MONTH_DAYS, Math.max(0, paidDays));
      estimatedSalary = Math.round(perDaySalary * paidDays);
    }

    res.json({
      userId: user._id,
      employeeName: user.name,
      designation: user.designation,
      basicSalary: baseSalary,
      range: { startDate: startStr, endDate: endStr, timeZone: tz },
      totalPayableDays,
      presentDays,
      wfhDays,
      paidLeaveDays,
      unpaidLeaveDays,
      halfDays,
      holidayCount,
      absentDays,
      extraDays,
      estimatedSalary,
      breakdown: `Present(${presentDays}) + WFH(${wfhDays}) + PaidLeave(${paidLeaveDays}) + Holidays(${holidayCount}) + HalfDays(${halfDays * 0.5}) - Absent(${absentDays})${extraDays > 0 ? ` + Extra(${extraDays})` : ''}`
    });
  } catch (err) {
    console.error('getPayrollStats error:', err);
    res.status(500).json({ message: 'Payroll calculation error' });
  }
};

/* ----------------------- 6) SALARY SLIP PDF (HR) ----------------------- */

function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num <= 0) return 'Zero';

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = Math.floor(rem / 100);
  rem = rem % 100;

  if (crore > 0) words += inWords(crore) + ' Crore ';
  if (lakh > 0) words += inWords(lakh) + ' Lakh ';
  if (thousand > 0) words += inWords(thousand) + ' Thousand ';
  if (hundred > 0) words += inWords(hundred) + ' Hundred ';
  if (rem > 0) words += (words ? 'and ' : '') + inWords(rem) + ' ';

  return words.trim();
}

const generateSalarySlip = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const { userId } = req.params;

    const user = await User.findById(userId).populate('companyId');
    if (!user || user.isDeleted) return res.status(404).json({ message: 'Employee not found' });

    if (!guardSameCompany(req, user.companyId?._id)) return res.status(403).json({ message: 'Access denied' });

    const company = user.companyId || {};
    const settings = company?.salarySlipSettings || {};
    const tz = company?.officeTiming?.timeZone || 'Asia/Kolkata';

    const now = new Date();
    let start = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12, 0, 0));
    let end = req.query.endDate ? new Date(req.query.endDate) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 12, 0, 0));

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    if (start.getTime() > end.getTime()) {
      const tmp = start;
      start = end;
      end = tmp;
    }

    let dayStrings = getDateStringsBetweenInTZ(start, end, tz);
    if (!dayStrings || !dayStrings.length) {
      dayStrings = [dateStrInTZ(start, tz)];
    }
    const startStr = dayStrings[0];
    const endStr = dayStrings[dayStrings.length - 1];

    const [attendance, holidays] = await Promise.all([
      Attendance.find({
        userId: user._id,
        date: { $gte: startStr, $lte: endStr },
        $or: [{ companyId: company._id }, { companyId: { $exists: false } }]
      }).lean(),
      Holiday.find({ companyId: company._id, date: { $gte: startStr, $lte: endStr } }).lean()
    ]);

    const attMap = new Map(attendance.map((a) => [a.date, a]));
    const holidaySet = new Set(holidays.map((h) => h.date));

    let presentDays = 0, halfDays = 0, wfhDays = 0, holidayCount = 0, paidLeaveDays = 0, unpaidLeaveDays = 0;

    for (const d of dayStrings) {
      const a = attMap.get(d);
      if (a) {
        const st = String(a.status || '');
        const mode = String(a.mode || '');

        if (mode === 'Holiday' || st === 'Holiday') holidayCount++;
        else if (st === 'HalfDay') halfDays++;
        else if (mode === 'WFH') wfhDays++;
        else if (mode === 'Paid Leave' || st === 'On Leave') paidLeaveDays++;
        else if (mode === 'Unpaid Leave' || st === 'Absent') unpaidLeaveDays++;
        else if (['Present', 'Completed'].includes(st)) presentDays++;
      } else {
        if (holidaySet.has(d)) holidayCount++;
      }
    }

    const FIXED_MONTH_DAYS = 30;
    const baseSalary = Number(user.basicSalary || user.salary || 30000);
    const extraDays = Math.min(10, Math.max(0, parseInt(req.query.extraDays) || 0));

    // Per day calculation
    const perDaySalary = baseSalary > 0 ? baseSalary / FIXED_MONTH_DAYS : 0;
    let paidDays = FIXED_MONTH_DAYS - unpaidLeaveDays + extraDays;
    paidDays = Math.min(FIXED_MONTH_DAYS, Math.max(0, paidDays));

    // Corporate Salary Structure Calculations
    const grossTotal = baseSalary;
    const basicComponent = Math.round(grossTotal * 0.50);
    const hraComponent = Math.round(grossTotal * 0.25);
    const specialComponent = Math.round(grossTotal * 0.16);
    const transportComponent = Math.min(1600, Math.round(grossTotal * 0.05));
    const otherAllowance = Math.max(0, grossTotal - (basicComponent + hraComponent + specialComponent + transportComponent));
    const totalEarnings = grossTotal;

    // Deductions
    const pfDeduction = settings.includePf !== false ? 1800 : 0;
    const ptDeduction = settings.includePt !== false ? 200 : 0;
    const tdsDeduction = settings.includeTds ? Math.round(grossTotal * 0.05) : 0;
    const lopDeduction = unpaidLeaveDays > 0 ? Math.round(perDaySalary * unpaidLeaveDays) : 0;
    const totalDeductions = pfDeduction + ptDeduction + tdsDeduction + lopDeduction;

    const netSalary = Math.max(0, totalEarnings - totalDeductions);
    const amountInWords = numberToWordsINR(netSalary);

    // Labels & formatting
    const companyDisplayName = settings.companyName || company?.name || 'Triblock Technology Pvt. Ltd.';
    const companyAddress = settings.address || company?.location?.address || 'Pune, Maharashtra, India';
    const cinText = settings.cin ? `CIN: ${settings.cin}` : 'CIN: U72900PN2024PTC215678';
    const gstinText = settings.gstin ? `GSTIN: ${settings.gstin}` : 'GSTIN: 27AABCT1234F1Z5';
    const cinGstin = [cinText, gstinText].filter(Boolean).join(' | ');

    const monthName = start.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: tz });

    const formatDatePretty = (d) => {
      if (!d) return '--';
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return '--';
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: tz });
    };

    const payPeriodStr = `${formatDatePretty(start)} – ${formatDatePretty(end)}`;
    const paidOnStr = formatDatePretty(end);
    const joiningDateStr = user.joiningDate ? formatDatePretty(user.joiningDate) : formatDatePretty(user.createdAt);
    const employeeIdStr = user.employeeCode || user.customId || ('TTPL' + String(user._id).slice(-4).toUpperCase());
    const designationStr = user.designation || 'Software Engineer';
    const departmentStr = user.department || 'Engineering (Development)';
    const locationStr = companyAddress.split(',').slice(-2).join(',').trim() || 'Pune, Maharashtra';

    // Start Landscape A4 Document safely buffered
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=SalarySlip_${String(user.name || 'Employee').replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}.pdf`
      );
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    });
    doc.on('error', (pdfErr) => {
      console.error('PDFDocument internal error:', pdfErr);
      if (!res.headersSent) res.status(500).json({ message: 'PDF Generation Failed' });
    });

    /* ================= 1. HEADER ================= */
    let logoDrawn = false;
    const logoRel = settings.logo || company?.logo;
    if (logoRel) {
      const absLogo = path.isAbsolute(logoRel) ? logoRel : path.join(process.cwd(), logoRel);
      if (fs.existsSync(absLogo)) {
        try {
          doc.image(absLogo, 36, 32, { fit: [55, 55] });
          logoDrawn = true;
        } catch (e) {}
      }
    }

    if (!logoDrawn) {
      // Sleek geometric corporate icon matching Triblock style
      doc.save();
      doc.rect(36, 34, 50, 50).fillAndStroke('#1e3a5f', '#0f2942');
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text(companyDisplayName.charAt(0).toUpperCase(), 36, 48, { width: 50, align: 'center' });
      doc.restore();
    }

    // Company Title & Address
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f2942').text(companyDisplayName, 98, 36);
    doc.font('Helvetica').fontSize(9).fillColor('#475569').text(companyAddress, 98, 56, { width: 375 });
    doc.font('Helvetica').fontSize(8).fillColor('#64748b').text(cinGstin, 98, 72, { width: 375 });

    // Vertical Divider
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(485, 34).lineTo(485, 95).stroke();

    // Right Header: Salary Slip + Month Badge
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#0f2942').text('Salary Slip', 505, 36, { width: 300, align: 'center' });

    // Rounded Pill
    doc.roundedRect(535, 66, 240, 24, 12).fill('#e2e8f0');
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f2942').text(`For the Month of ${monthName}`, 535, 73, { width: 240, align: 'center' });

    /* ================= 2. EMPLOYEE DETAILS BOX ================= */
    const infoY = 104;
    doc.roundedRect(36, infoY, 770, 80, 6).fillAndStroke('#f8fafc', '#cbd5e1');

    // Left Column
    const leftLabels = [
      ['Employee Name', `:  ${user.name || 'Employee'}`],
      ['Employee ID', `:  ${employeeIdStr}`],
      ['Designation', `:  ${designationStr}`],
      ['Department', `:  ${departmentStr}`],
    ];

    leftLabels.forEach(([lbl, val], idx) => {
      const curY = infoY + 8 + (idx * 17);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569').text(lbl, 48, curY, { width: 105 });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f2942').text(val, 155, curY, { width: 240 });
    });

    // Divider
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(405, infoY + 6).lineTo(405, infoY + 74).stroke();

    // Right Column
    const rightLabels = [
      ['Date of Joining', `:  ${joiningDateStr}`],
      ['Pay Period', `:  ${payPeriodStr}`],
      ['Paid On', `:  ${paidOnStr}`],
      ['Location', `:  ${locationStr}`],
    ];

    rightLabels.forEach(([lbl, val], idx) => {
      const curY = infoY + 8 + (idx * 17);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569').text(lbl, 420, curY, { width: 105 });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f2942').text(val, 530, curY, { width: 260 });
    });

    /* ================= 3. EARNINGS & DEDUCTIONS TABLE ================= */
    const tableY = 192;
    const tableW = 380;
    const leftX = 36;
    const rightX = 426;

    // Headers
    doc.rect(leftX, tableY, tableW, 22).fill('#1e3a5f');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff').text('Earnings', leftX + 12, tableY + 6);
    doc.text('Amount (Rs)', leftX + 270, tableY + 6, { width: 98, align: 'right' });

    doc.rect(rightX, tableY, tableW, 22).fill('#1e3a5f');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff').text('Deductions', rightX + 12, tableY + 6);
    doc.text('Amount (Rs)', rightX + 270, tableY + 6, { width: 98, align: 'right' });

    // Rows Data
    const earningsRows = [
      ['Basic Salary', basicComponent],
      ['House Rent Allowance (HRA)', hraComponent],
      ['Special Allowance', specialComponent],
      ['Transport Allowance', transportComponent],
      ['Other Allowance', otherAllowance],
    ];

    const deductionsRows = [
      ['Provident Fund (PF) – Employee', pfDeduction],
      ['Professional Tax (PT)', ptDeduction],
      ['Income Tax (TDS)', tdsDeduction],
      ['Other Deductions', lopDeduction],
      ['', null],
    ];

    const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const rowH = 19;
    for (let i = 0; i < 5; i++) {
      const curY = tableY + 22 + (i * rowH);
      const bg = i % 2 === 1 ? '#f8fafc' : '#ffffff';

      // Left Table Row
      doc.rect(leftX, curY, tableW, rowH).fillAndStroke(bg, '#cbd5e1');
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(leftX + 265, curY).lineTo(leftX + 265, curY + rowH).stroke();

      const [eName, eVal] = earningsRows[i];
      doc.font('Helvetica').fontSize(9).fillColor('#1e293b').text(eName, leftX + 12, curY + 5);
      doc.font('Helvetica').fontSize(9).fillColor('#1e293b').text(fmt(eVal), leftX + 270, curY + 5, { width: 98, align: 'right' });

      // Right Table Row
      doc.rect(rightX, curY, tableW, rowH).fillAndStroke(bg, '#cbd5e1');
      doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(rightX + 265, curY).lineTo(rightX + 265, curY + rowH).stroke();

      const [dName, dVal] = deductionsRows[i];
      if (dName) {
        doc.font('Helvetica').fontSize(9).fillColor('#1e293b').text(dName, rightX + 12, curY + 5);
        doc.font('Helvetica').fontSize(9).fillColor('#1e293b').text(fmt(dVal), rightX + 270, curY + 5, { width: 98, align: 'right' });
      }
    }

    // Totals Row
    const totalY = tableY + 22 + (5 * rowH);
    doc.rect(leftX, totalY, tableW, 23).fillAndStroke('#dbeafe', '#93c5fd');
    doc.strokeColor('#93c5fd').lineWidth(0.5).moveTo(leftX + 265, totalY).lineTo(leftX + 265, totalY + 23).stroke();
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1e3a5f').text('Total Earnings (A)', leftX + 12, totalY + 6);
    doc.text(fmt(totalEarnings), leftX + 270, totalY + 6, { width: 98, align: 'right' });

    doc.rect(rightX, totalY, tableW, 23).fillAndStroke('#dbeafe', '#93c5fd');
    doc.strokeColor('#93c5fd').lineWidth(0.5).moveTo(rightX + 265, totalY).lineTo(rightX + 265, totalY + 23).stroke();
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1e3a5f').text('Total Deductions (B)', rightX + 12, totalY + 6);
    doc.text(fmt(totalDeductions), rightX + 270, totalY + 6, { width: 98, align: 'right' });

    /* ================= 4. NET PAY HIGHLIGHT BANNER ================= */
    const netY = totalY + 31;
    doc.rect(leftX, netY, 230, 32).fill('#1e3a5f');
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff').text('Net Pay (A – B)', leftX + 14, netY + 9);

    doc.rect(leftX + 230, netY, 540, 32).fill('#bfdbfe');
    doc.font('Helvetica-Bold').fontSize(17).fillColor('#0f2942').text(`Rs. ${fmt(netSalary)}`, leftX + 240, netY + 7, { width: 516, align: 'right' });

    /* ================= 5. AMOUNT IN WORDS BAR ================= */
    const wordsY = netY + 39;
    doc.rect(leftX, wordsY, 770, 24).fillAndStroke('#f1f5f9', '#cbd5e1');
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#334155').text('Amount in Words', leftX + 12, wordsY + 7, { width: 110 });
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f2942').text(`:   Rupees ${amountInWords} Only`, leftX + 128, wordsY + 7, { width: 630 });

    /* ================= 6. FOOTER (NOTES & SIGNATURE) ================= */
    const footerY = wordsY + 34;

    // Notes
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f2942').text('Note:', leftX, footerY);
    const notes = [
      '1. This is a computer-generated salary slip and does not require a physical signature.',
      '2. All amounts are in Indian Rupees (INR).',
      '3. PF is deducted as per the Employees\' Provident Funds & Miscellaneous Provisions Act, 1952.',
      '4. TDS (if applicable) is deducted as per the Income Tax Act, 1961.'
    ];

    notes.forEach((nt, idx) => {
      doc.font('Helvetica').fontSize(7.5).fillColor('#475569').text(nt, leftX, footerY + 12 + (idx * 11), { width: 450 });
    });

    // Divider
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(495, footerY).lineTo(495, footerY + 68).stroke();

    // Signatory
    let sigDrawn = false;
    const sigRel = settings.signature;
    if (sigRel) {
      const absSig = path.isAbsolute(sigRel) ? sigRel : path.join(process.cwd(), sigRel);
      if (fs.existsSync(absSig)) {
        try {
          doc.image(absSig, 600, footerY + 2, { fit: [140, 36] });
          sigDrawn = true;
        } catch (e) {}
      }
    }

    if (!sigDrawn) {
      // Elegant digital signature line
      doc.save();
      doc.font('Helvetica-Oblique').fontSize(14).fillColor('#1e3a5f').text('Authorized Signatory', 540, footerY + 16, { width: 240, align: 'center' });
      doc.restore();
    }

    // Signature underline
    doc.strokeColor('#0f2942').lineWidth(0.75).moveTo(570, footerY + 45).lineTo(750, footerY + 45).stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f2942').text(settings.signatoryName || 'Authorized Signatory', 540, footerY + 49, { width: 240, align: 'center' });
    doc.font('Helvetica').fontSize(8).fillColor('#475569').text(companyDisplayName, 540, footerY + 60, { width: 240, align: 'center' });

    doc.end();
  } catch (err) {
    console.error('generateSalarySlip error:', err);
    if (!res.headersSent) res.status(500).json({ message: 'PDF Generation Failed' });
  }
};

/* ----------------------- 7) WFH MANAGEMENT (Backward Compatible) ----------------------- */
const manageWfhRequest = async (req, res) => {
  try {
    if (!isHrRole(req.user?.role)) return res.status(403).json({ message: 'HR Access Required' });

    const { userId, action, wfhType, date } = req.body || {};
    if (!userId || !action) return res.status(400).json({ message: 'userId and action required' });

    const user = await User.findById(userId).populate('companyId');
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });

    if (!guardSameCompany(req, user.companyId?._id)) return res.status(403).json({ message: 'Access denied' });

    const company = user.companyId;
    const tz = company?.officeTiming?.timeZone || 'Asia/Kolkata';
    const dayStr = date ? String(date) : dateStrInTZ(new Date(), tz);

    if (action !== 'Approve') {
      return res.json({ message: 'WFH Request Updated' });
    }

    const startTime = company?.officeTiming?.startTime || '09:30';
    const endTime = company?.officeTiming?.endTime || '18:30';

    const punchIn = zonedTimeToUtc(dayStr, startTime, tz);
    const punchOut = zonedTimeToUtc(dayStr, endTime, tz);

    const half = wfhType === 'HalfDay';
    const net = half ? 4 : Number(company?.officeTiming?.workingHours || 8);

    await Attendance.findOneAndUpdate(
      { userId: user._id, date: dayStr, companyId: company._id },
      {
        $set: {
          userId: user._id,
          companyId: company._id,
          date: dayStr,
          status: half ? 'HalfDay' : 'Present',
          mode: 'WFH',
          source: 'MANUAL_HR',
          punchInTime: punchIn,
          punchOutTime: punchOut,
          netWorkHours: net,
          remarks: 'WFH Approved by HR',
          isManualEntry: true,
          addedBy: getReqUserId(req)
        }
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'WFH Approved & Marked ✅' });
  } catch (err) {
    console.error('manageWfhRequest error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAllEmployees,
  updateEmployeeDetails,
  approveEmployee,
  deleteEmployee,
  addManualAttendance,
  markHoliday,
  getEmployeeHistory,
  getPayrollStats,
  generateSalarySlip,
  manageWfhRequest
};
