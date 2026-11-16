import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCamera,
  FaSync,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaClock,
  FaCog,
  FaSave,
  FaLocationArrow,
  FaBullseye,
  FaShieldAlt,
  FaWallet,
  FaPlus,
  FaMoneyBillWave,
  FaTimes, // Added for Modal Close
} from "react-icons/fa";

import { getAssetUrl } from "../../utils/assetUrl";
import "./CompanyDashboard.css"; // ✅ Import new CSS

const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Dubai",
  "Asia/Singapore",
];

const ATTENDANCE_METHODS = [
  { value: "GPS_FACE", label: "GPS + Face" },
  { value: "FACE_ONLY", label: "Face Only" },
  { value: "QR_FACE", label: "QR + Face" },
  { value: "WIFI_FACE", label: "WiFi + Face" },
  { value: "IP_FACE", label: "IP + Face" },
  { value: "MANUAL_HR", label: "Manual (HR)" },
];

const ROUTES = {
  HR_MANAGEMENT: "/company/hr-management",
  EMP_MANAGEMENT: "/company/employee-management",
  COMPANY_LOGIN: "/company-login",
};

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [data, setData] = useState({
    company: null,
    stats: {},
    employees: [],
    hrs: [],
    customExpenses: [],
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const [settings, setSettings] = useState({
    address: "",
    startTime: "09:30",
    endTime: "18:30",
    timeZone: "Asia/Kolkata",
    requireFace: true,
  });



  const safeLogout = useCallback(
    (msg) => {
      if (msg) toast.error(msg);
      logout('/');
    },
    [logout]
  );

  const normalizeDashboard = (payload) => {
    const root = payload?.data ?? payload ?? {};
    const company =
      root.company || root?.companyProfile || root?.profile || root;
    const stats = root.stats || root?.counts || {};
    const employees = root.employees || root?.recentEmployees || [];
    const hrs = root.hrs || root?.hrAdmins || root?.hrList || [];
    const customExpenses = root.customExpenses || [];
    return { company, stats, employees, hrs, customExpenses };
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await API.get("/company/dashboard");
      } catch {
        res = await API.get("/company/profile");
      }

      const normalized = normalizeDashboard(res?.data);

      setData({
        company: normalized.company,
        stats: normalized.stats || {},
        employees: Array.isArray(normalized.employees)
          ? normalized.employees
          : [],
        hrs: Array.isArray(normalized.hrs) ? normalized.hrs : [],
        customExpenses: Array.isArray(normalized.customExpenses)
          ? normalized.customExpenses
          : [],
      });

      const c = normalized.company || {};
      const loc = c.location || {};
      const office = c.officeTiming || {};
      const pol = c.attendancePolicy || {};
      const isFaceReq = pol.requireFace !== false && pol.method !== "MANUAL_PUNCH";

      setSettings((prev) => ({
        ...prev,
        address: loc.address || prev.address,
        startTime: office.startTime || prev.startTime,
        endTime: office.endTime || prev.endTime,
        timeZone: office.timeZone || prev.timeZone,
        requireFace: isFaceReq,
      }));
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401)
        return safeLogout("Session expired. Please login again.");
      toast.error(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [safeLogout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    company,
    employees = [],
    hrs = [],
    stats = {},
    customExpenses = [],
  } = data;

  const maxHrAdmins =
    Number(company?.maxHrAdmins ?? company?.hrLimit ?? 0) || 0;
  const usedSlots = hrs.length;
  const freeSlots = Math.max(0, maxHrAdmins - usedSlots);
  const hrRequestStatus = company?.hrLimitRequest;

  const getInitials = (name) => {
    if (!name) return "CO";
    return name
      .split(" ")
      .map((n) => n?.[0] || "")
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const validateSettings = () => {
    const start = settings.startTime;
    const end = settings.endTime;
    if (!start || !end) return "Office start/end time required.";
    if (end <= start) return "End time must be greater than start time.";
    return null;
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("logo", file);

    try {
      await API.put("/company/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Logo updated ✅");
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Logo upload failed");
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    if (savingSettings) return;

    const validationMsg = validateSettings();
    if (validationMsg) return toast.warning(validationMsg);

    setSavingSettings(true);

    const payloadObj = {
      location: {
        address: settings.address,
      },
      officeTiming: {
        startTime: settings.startTime,
        endTime: settings.endTime,
        timeZone: settings.timeZone,
      },
      attendancePolicy: {
        requireFace: settings.requireFace,
        method: settings.requireFace ? "FACE_ONLY" : "MANUAL_PUNCH",
        allowedMethods: settings.requireFace
          ? ["FACE_ONLY", "MANUAL_HR"]
          : ["MANUAL_PUNCH", "FACE_ONLY", "MANUAL_HR"],
      },
      // backward safety
      address: settings.address,
      timeZone: settings.timeZone,
      officeStartTime: settings.startTime,
      officeEndTime: settings.endTime,
    };

    try {
      await API.put("/company/update", payloadObj);
      toast.success("Company settings saved ✅");
      loadData();
    } catch (err) {
      // Fallback FormData logic if needed
      try {
        const fd = new FormData();
        fd.append("location", JSON.stringify(payloadObj.location));
        fd.append("officeTiming", JSON.stringify(payloadObj.officeTiming));
        fd.append("attendancePolicy", JSON.stringify(payloadObj.attendancePolicy));

        await API.put("/company/update", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Company settings saved ✅");
        loadData();
      } catch (err2) {
        toast.error(err2?.response?.data?.message || "Failed to save settings");
      }
    } finally {
      setSavingSettings(false);
    }
  };



  const confirmRequest = async () => {
    setShowConfirmModal(false);
    setRequesting(true);
    try {
      const res = await API.post("/company/request-limit");
      toast.success(res.data.message || "Request sent to Super Admin 📩");
      setData((prev) => ({
        ...prev,
        company: { ...(prev.company || {}), hrLimitRequest: "Pending" },
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Request failed");
    } finally {
      setRequesting(false);
    }
  };

  const quickCards = useMemo(
    () => [
      {
        title: "HR Management",
        desc: "Create & manage HR admins",
        icon: <FaUserTie />,
        onClick: () => navigate(ROUTES.HR_MANAGEMENT),
      },
      {
        title: "Employees",
        desc: "Directory & profile updates",
        icon: <FaUsers />,
        onClick: () => navigate(ROUTES.EMP_MANAGEMENT),
      },
    ],
    [navigate]
  );

  if (loading) {
    return (
      <div className="cd-loader">
        <div className="spinner" />
        <div className="muted">Loading dashboard...</div>
        {/* Inline loader style for critical path */}
        <style>{`
          .cd-loader{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#f8fafc;font-family:Inter,sans-serif}
          .spinner{width:32px;height:32px;border-radius:50%;border:3px solid #e2e8f0;border-top-color:#2563eb;animation:spin 1s linear infinite}
          .muted{color:#64748b;font-weight:600;font-size:0.9rem}
          @keyframes spin{to{transform:rotate(360deg)}}
        `}</style>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      {/* 1) NAV */}
      <main className="cd-wrap">
        {/* 2) HERO SECTION */}
        <section className="hero">
          <div className="hero-left">
            <div className="logoBox">
              <div className="logo">
                {logoPreview || company?.logo ? (
                  <img
                    src={logoPreview || getAssetUrl(company.logo)}
                    alt="Company logo"
                  />
                ) : (
                  <div className="initials">{getInitials(company?.name)}</div>
                )}
              </div>
              <label className="camBtn" title="Update logo">
                <FaCamera />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </label>
            </div>

            <div className="heroInfo">
              <span className="welcome-tag">Welcome back 👋</span>
              <h2>{company?.name || "Company Name"}</h2>

              <div className="hero-meta-grid">
                <div className="meta-item">
                  <div className="m-icon"><FaEnvelope /></div>
                  <div className="m-txt">
                    <label>Email Address</label>
                    <span>{company?.email || "—"}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <div className="m-icon"><FaMapMarkerAlt /></div>
                  <div className="m-txt">
                    <label>Office Location</label>
                    <span>{settings.address || company?.location?.address || "Not set"}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <div className="m-icon"><FaShieldAlt /></div>
                  <div className="m-txt">
                    <label>Attendance Policy</label>
                    <span style={{ fontWeight: '600', color: settings.requireFace ? '#93c5fd' : '#86efac' }}>
                      {settings.requireFace ? "Face Recognition Required" : "Manual Attendance Allowed"}
                    </span>
                  </div>
                </div>
                <div className="meta-item">
                  <div className="m-icon"><FaClock /></div>
                  <div className="m-txt">
                    <label>Office Timing</label>
                    <span>{settings.startTime} - {settings.endTime} ({settings.timeZone})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-actions-top" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button className="ghost-btn-sm" onClick={loadData} title="Refresh Dashboard" style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaSync /> Refresh
              </button>
            </div>
            <div className="limitTop">
              <div className="limitTitle">
                <FaUserTie />
                <span>HR Slot Usage</span>
              </div>
              <div className="limitNum">
                <strong>{usedSlots}</strong>
                <span> / {maxHrAdmins || "—"}</span>
              </div>
            </div>

            <div className="limitBar">
              <div
                className="limitFill"
                style={{
                  width: maxHrAdmins
                    ? `${Math.min(100, (usedSlots / maxHrAdmins) * 100)}%`
                    : "0%",
                }}
              />
            </div>

            <div className="limitHint">
              {freeSlots > 0 ? (
                <span>✅ <strong>{freeSlots}</strong> slots available</span>
              ) : (
                <span><FaExclamationTriangle /> Limit reached</span>
              )}
            </div>

            {hrRequestStatus === "Pending" ? (
              <div className="status pending" style={{ fontWeight: '600' }}>
                Request Pending...
              </div>
            ) : (
              <button
                className="primaryBtn"
                onClick={() => setShowConfirmModal(true)}
                disabled={requesting || freeSlots > 0}
              >
                {requesting ? "Sending..." : "Request HR Limit Increase"}
                <FaArrowRight />
              </button>
            )}
          </div>
        </section>

        {/* 3) QUICK ACCESS */}
        <section className="quick">
          <div className="secHead">
            <h3>Quick Access</h3>
            <p>Essential modules for daily management</p>
          </div>

          <div className="quickGrid">
            {quickCards.map((c) => (
              <button key={c.title} className="qCard" onClick={c.onClick}>
                <div className="qIcon">{c.icon}</div>
                <div className="qTxt">
                  <h4>{c.title}</h4>
                  <span>{c.desc}</span>
                </div>
                <div className="qGo">
                  <FaArrowRight />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 4) EXPENDITURE SECTION (NEW) */}
        <section className="expenditure" id="expenditure">
          <div className="secHead">
            <div className="sh-flex">
              <div>
                <h3>Company Expenditure Overview</h3>
                <p>Summary of salaries and expenses</p>
              </div>
              <button className="ghost-btn" onClick={() => navigate("/company/expenditure")}>
                View Details <FaArrowRight />
              </button>
            </div>
          </div>

          <div className="expGrid">
            {/* Employee Salaries */}
            <div className="expCard main">
              <div className="eIcon"><FaUsers /></div>
              <div className="eTxt">
                <span>Employee Salaries</span>
                <strong>₹{(stats.totalSalaryExpense || 0).toLocaleString()}</strong>
                <small>Auto-calculated monthly</small>
              </div>
            </div>

            {/* Other Expenses */}
            <div className="expCard">
              <div className="eIcon purple"><FaWallet /></div>
              <div className="eTxt">
                <span>Other Expenses</span>
                <strong>₹{(stats.totalCustomExpense || 0).toLocaleString()}</strong>
                <small>{customExpenses.length} entries recorded</small>
              </div>
            </div>

            {/* Total */}
            <div className="expCard highlight">
              <div className="eIcon green"><FaMoneyBillWave /></div>
              <div className="eTxt">
                <span>Total Expenditure</span>
                <strong>₹{(stats.overallExpenditure || 0).toLocaleString()}</strong>
                <small>Combined monthly total</small>
              </div>
            </div>
          </div>
        </section>

        {/* 5) STATS + SETTINGS */}
        <section className="grid2">
          <div className="statsCol">
            <div className="statCard">
              <div className="sIcon blue">
                <FaUsers />
              </div>
              <div className="sTxt">
                <h4>Total Employees</h4>
                <strong>{stats?.totalEmployees ?? employees.length ?? 0}</strong>
              </div>
              <button className="linkBtn" onClick={() => navigate(ROUTES.EMP_MANAGEMENT)}>
                Manage <FaArrowRight />
              </button>
            </div>

            <div className="statCard">
              <div className="sIcon purple">
                <FaUserTie />
              </div>
              <div className="sTxt">
                <h4>HR Managers</h4>
                <strong>{stats?.totalHRs ?? hrs.length ?? 0}</strong>
              </div>
              <button className="linkBtn" onClick={() => navigate(ROUTES.HR_MANAGEMENT)}>
                Manage <FaArrowRight />
              </button>
            </div>
          </div>

          <div className="settingsCard" id="settings">
            <div className="settingsHead">
              <div className="shLeft">
                <div className="shIcon">
                  <FaCog />
                </div>
                <div>
                  <h3>Company Settings</h3>
                  <p>Configuration for attendance & location</p>
                </div>
              </div>
              <button className="ghost-btn" onClick={loadData}>
                <FaSync />
              </button>
            </div>

            <form className="settingsForm" onSubmit={handleSettingsSave}>
              <div className="formGrid">
                <div className="fg full">
                  <label>
                    <FaMapMarkerAlt /> Office Address
                  </label>
                  <input
                    value={settings.address}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="e.g. Kiwalegoan Ravet, pcmc, pune"
                  />
                </div>

                <div className="fg">
                  <label><FaClock /> Start Time</label>
                  <input
                    type="time"
                    value={settings.startTime}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, startTime: e.target.value }))
                    }
                  />
                </div>

                <div className="fg">
                  <label><FaClock /> End Time</label>
                  <input
                    type="time"
                    value={settings.endTime}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, endTime: e.target.value }))
                    }
                  />
                </div>

                <div className="fg full">
                  <label>Time Zone</label>
                  <select
                    value={settings.timeZone}
                    onChange={(e) =>
                      setSettings((p) => ({ ...p, timeZone: e.target.value }))
                    }
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="fg full" style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaShieldAlt style={{ color: '#2563eb' }} /> Employee Attendance Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div
                      onClick={() => setSettings(p => ({ ...p, requireFace: true }))}
                      style={{
                        border: settings.requireFace ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: settings.requireFace ? '#eff6ff' : '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        boxShadow: settings.requireFace ? '0 4px 12px rgba(37,99,235,0.12)' : 'none'
                      }}
                    >
                      <input
                        type="radio"
                        name="attendanceMode"
                        checked={settings.requireFace}
                        onChange={() => setSettings(p => ({ ...p, requireFace: true }))}
                        style={{ marginTop: '4px', cursor: 'pointer', accentColor: '#2563eb', width: '18px', height: '18px' }}
                      />
                      <div>
                        <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>
                          Face Recognition Required
                        </strong>
                        <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                          Employees must scan face through live camera to punch in & out. High security.
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => setSettings(p => ({ ...p, requireFace: false }))}
                      style={{
                        border: !settings.requireFace ? '2px solid #10b981' : '1px solid #cbd5e1',
                        background: !settings.requireFace ? '#f0fdf4' : '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        boxShadow: !settings.requireFace ? '0 4px 12px rgba(16,185,129,0.12)' : 'none'
                      }}
                    >
                      <input
                        type="radio"
                        name="attendanceMode"
                        checked={!settings.requireFace}
                        onChange={() => setSettings(p => ({ ...p, requireFace: false }))}
                        style={{ marginTop: '4px', cursor: 'pointer', accentColor: '#10b981', width: '18px', height: '18px' }}
                      />
                      <div>
                        <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>
                          Allow Manual Attendance (Work Summary)
                        </strong>
                        <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                          Employees can punch without face scan by submitting today's work summary / morning tasks.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="saveBtn" disabled={savingSettings} style={{ marginTop: '10px' }}>
                  {savingSettings ? "Saving..." : "Save Changes"} <FaSave />
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>



      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-head">
              <h3>Confirm Request</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}><FaTimes /></button>
            </div>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Are you sure you want to request an increase in HR admin slots?
              This will send a ticket to the Super Admin.
            </p>
            <div className="modal-foot">
              <button className="modal-ghost" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="modal-primary" onClick={confirmRequest} disabled={requesting}>
                {requesting ? "Sending..." : "Yes, Request Upgrade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
