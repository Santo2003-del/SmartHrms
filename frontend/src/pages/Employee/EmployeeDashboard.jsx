import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import FaceCapture from "../../components/FaceCapture/FaceCapture";
import { toast } from "react-toastify";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaEnvelope,
  FaPlay,
  FaCoffee,
  FaArrowRight,
  FaRedoAlt,
  FaTasks,
  FaPlaneDeparture,
  FaHistory,
  FaClipboardList,
  FaUserCheck,
  FaCheckCircle,
  FaSpinner,
  FaThLarge,
  FaLayerGroup,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api";

/* =========================
   GOOGLE MAPS KEY (CRA .env)
========================= */
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || "";

/* =========================
   BACKEND HOST (for images)
========================= */
const DEV_BACKEND_FALLBACK = "http://localhost:5001";
const ENV_BACKEND = process.env.REACT_APP_SERVER_URL || process.env.REACT_APP_BACKEND_URL || "";

/* =========================
   MAP SETTINGS
========================= */
const mapContainerStyle = { width: "100%", height: "260px", borderRadius: "16px" };

/* =========================
   Request helper (fallback safe)
========================= */
const tryReq = async (fnList = []) => {
  let lastErr = null;
  for (const fn of fnList) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const st = e?.response?.status;
      if (st === 404 || st === 405) continue; // fallback only on route missing
      throw e;
    }
  }
  throw lastErr || new Error("Request failed");
};

/* =========================
   Resolve backend host safely
========================= */
const getApiHost = () => {
  const base = API?.defaults?.baseURL || "";

  // absolute baseURL (e.g. https://domain.com/api)
  if (typeof base === "string" && /^https?:\/\//i.test(base)) {
    return base.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  }

  // relative baseURL (e.g. /api)
  const winOrigin =
    typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";

  const isLocalDev =
    typeof window !== "undefined" && /localhost:3000|127\.0\.0\.1:3000/i.test(winOrigin);

  if (ENV_BACKEND && /^https?:\/\//i.test(ENV_BACKEND)) {
    return ENV_BACKEND.replace(/\/+$/, "");
  }

  if (isLocalDev) return DEV_BACKEND_FALLBACK;

  return (winOrigin || DEV_BACKEND_FALLBACK).replace(/\/+$/, "");
};

const normalizeUploadPath = (raw) => {
  if (!raw) return "";
  const p = String(raw).replace(/\\/g, "/");

  if (/^https?:\/\//i.test(p)) return p;

  const lower = p.toLowerCase();
  const idx = lower.lastIndexOf("/uploads/");
  if (idx !== -1) return p.slice(idx + 1);

  const idx2 = lower.indexOf("uploads/");
  if (idx2 !== -1) return p.slice(idx2);

  return p.replace(/^\/+/, "").replace(/^backend\//i, "");
};

const getImageUrl = (imgPath) => {
  if (!imgPath) return "https://via.placeholder.com/150";
  const p = String(imgPath);
  if (p.startsWith("http")) return p;

  const host = getApiHost();
  const clean = normalizeUploadPath(p);
  return `${host}/${clean}`;
};

/* =========================
   GEO HELPERS
========================= */
const haversineMeters = (a, b) => {
  if (!a || !b) return null;
  const lat1 = Number(a.lat);
  const lon1 = Number(a.lng);
  const lat2 = Number(b.lat);
  const lon2 = Number(b.lng);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const x =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
};

const computeDistanceMeters = (a, b) => {
  try {
    if (
      typeof window !== "undefined" &&
      window.google?.maps?.geometry?.spherical &&
      a?.lat != null &&
      a?.lng != null &&
      b?.lat != null &&
      b?.lng != null
    ) {
      const p1 = new window.google.maps.LatLng(Number(a.lat), Number(a.lng));
      const p2 = new window.google.maps.LatLng(Number(b.lat), Number(b.lng));
      const d = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
      return Number.isFinite(d) ? d : null;
    }
  } catch (e) { }
  return haversineMeters(a, b);
};

/* =========================
   ACCURATE GPS
========================= */
const getAccuratePosition = ({
  desiredAccuracy = 60,
  maxWaitMs = 25000,
  enableHighAccuracy = true,
} = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));

    const opts = { enableHighAccuracy, timeout: 15000, maximumAge: 0 };
    let best = null;
    let watchId = null;
    let done = false;

    const finish = (pos, isTimeout = false) => {
      if (done) return;
      done = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      if (isTimeout && best) return resolve(best);
      resolve(pos);
    };

    const fail = (err) => {
      if (done) return;
      done = true;
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      reject(err);
    };

    const consider = (pos) => {
      const acc = Number(pos?.coords?.accuracy);
      if (!best || (Number.isFinite(acc) && acc < Number(best.coords.accuracy))) best = pos;
      if (Number.isFinite(acc) && acc <= desiredAccuracy) finish(pos);
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        consider(pos);

        const acc = Number(pos?.coords?.accuracy);
        if (Number.isFinite(acc) && acc <= desiredAccuracy) return;

        watchId = navigator.geolocation.watchPosition(
          (p) => consider(p),
          (e) => (best ? finish(best, true) : fail(e)),
          { enableHighAccuracy, maximumAge: 0, timeout: 20000 }
        );

        setTimeout(() => finish(best || pos, true), maxWaitMs);
      },
      (err) => fail(err),
      opts
    );
  });
};

/* =========================
   DATA NORMALIZERS
========================= */
const pickArray = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.rows)) return d.rows;
  return [];
};

const normalizeLeaveType = (t) => {
  const s = String(t || "").trim().toLowerCase();
  if (!s) return "";
  if (s === "wfh" || s.includes("work from home")) return "WFH";
  if (s.includes("unpaid") || s === "absent") return "Unpaid";
  if (s.includes("paid") || s.includes("leave") || s === "sick" || s === "casual") return "Paid";
  return t;
};

const fmtTime = (val, tz = "Asia/Kolkata") => {
  if (!val) return "--";
  const dt = new Date(val);
  if (Number.isNaN(dt.getTime())) return "--";
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: tz });
};

const fmtDate = (val, tz = "Asia/Kolkata") => {
  if (!val) return "--";
  const dt = new Date(val);
  if (Number.isNaN(dt.getTime())) return String(val);
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric", timeZone: tz });
};

const toYMD = (val, tz = "Asia/Kolkata") => {
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const dt = new Date(val);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-CA", { timeZone: tz });
};

const resolveJoiningDate = (u) => {
  if (!u) return null;
  return (
    u.joiningDate ||
    u.joinDate ||
    u.dateOfJoining ||
    u.doj ||
    u.joining_date ||
    u.employeeDetails?.joiningDate ||
    u.employmentDetails?.joiningDate ||
    u.employment?.joiningDate ||
    u.joinedAt ||
    u.createdAt ||
    u.created_on ||
    null
  );
};

const normalizeProfile = (u) => {
  if (!u) return null;
  return {
    ...u,
    name: u.name || u.fullName || "Employee",
    designation: u.designation || u.roleTitle || u.role || "Employee",
    profileImage: u.profileImage || u.avatar || u.photo || "",
    joiningDate: resolveJoiningDate(u),
  };
};

/* =========================
   Lazy Map Loader (only when modal opens)
========================= */
const VerifyMap = React.memo(function VerifyMap({ apiKey, currentPos, officePos, circleOptions }) {
  const libraries = useMemo(() => ["places", "geometry"], []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  const mapBlocked = !apiKey || !!loadError;

  if (mapBlocked) {
    return (
      <div className="warnBox">
        Google Map not available. Check:
        <br />• REACT_APP_GOOGLE_MAPS_KEY in .env
        <br />• Maps JavaScript API enabled
        <br />• Billing enabled on GCP
      </div>
    );
  }

  if (!isLoaded) return <div className="mapFallback">Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={currentPos || officePos || { lat: 20.5937, lng: 78.9629 }}
      zoom={currentPos || officePos ? 16 : 5}
      options={{
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        clickableIcons: false,
      }}
    >
      {officePos && (
        <>
          <Marker position={officePos} />
          <Circle center={officePos} options={circleOptions} />
        </>
      )}
      {currentPos && <Marker position={{ lat: currentPos.lat, lng: currentPos.lng }} />}
    </GoogleMap>
  );
});

const NAV_ITEMS = [
  { label: "Dashboard", path: "/employee/dashboard", icon: <FaThLarge /> },
  { label: "My Attendance", path: "/employee/attendance", icon: <FaHistory /> },
  { label: "My Leaves", path: "/employee/leaves", icon: <FaPlaneDeparture /> },
  { label: "Tasks", path: "/employee/tasks", icon: <FaTasks /> },
  { label: "Onboarding", path: "/employee/onboarding", icon: <FaUserCheck /> },
];

const PAGE_SIZE = 5;

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination state
  const [attPage, setAttPage] = useState(1);
  const [leavePage, setLeavePage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);

  // loader only first time (no blink)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const initialLoadedRef = useRef(false);

  // latest self profile
  const [meProfile, setMeProfile] = useState(null);

  // datasets
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);

  // onboarding summary
  const [onboardingSummary, setOnboardingSummary] = useState({ pending: 0, total: 0, assigned: false });
  const onboardingDisabledRef = useRef(false);

  // punch flow
  const [todayStatus, setTodayStatus] = useState("Not Started");
  const [showTextModal, setShowTextModal] = useState(false);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [actionType, setActionType] = useState(null); // "in" | "out"

  // location
  const [currentPos, setCurrentPos] = useState(null);
  const [officePos, setOfficePos] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState(null);
  const [isInsideRadius, setIsInsideRadius] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const watchToastRef = useRef(null);

  const profile = useMemo(() => normalizeProfile(meProfile || user), [meProfile, user]);
  const uid = profile?._id || user?._id || null;

  // keep latest profile in ref (avoid dependency loops)
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const tz = useMemo(() => {
    const companyTz = profile?.companyId?.officeTiming?.timeZone || profile?.companyId?.timeZone || "Asia/Kolkata";
    try {
      return companyTz || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    } catch {
      return "Asia/Kolkata";
    }
  }, [profile?.companyId?.officeTiming?.timeZone, profile?.companyId?.timeZone]);

  const radiusMeters = useMemo(() => {
    const r =
      Number(profile?.companyId?.location?.radius) ||
      Number(profile?.companyId?.radius) ||
      Number(profile?.companyId?.attendanceRadius) ||
      3000;
    if (!Number.isFinite(r)) return 3000;
    return Math.min(Math.max(r, 50), 5000);
  }, [profile?.companyId?.location?.radius, profile?.companyId?.radius, profile?.companyId?.attendanceRadius]);

  const attendanceMethod = useMemo(() => {
    return profile?.companyId?.attendanceMethod || profile?.companyId?.attendancePolicy?.method || "GPS_FACE";
  }, [profile?.companyId?.attendanceMethod, profile?.companyId?.attendancePolicy?.method]);

  const circleOptions = useMemo(() => {
    return {
      strokeColor: "#10b981",
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: "#10b981",
      fillOpacity: 0.12,
      clickable: false,
      radius: radiusMeters,
      zIndex: 1,
    };
  }, [radiusMeters]);

  /* =========================
     FETCH LATEST PROFILE (loop-safe)
  ========================= */
  const fetchMe = useCallback(async () => {
    if (!user?._id) return;

    try {
      const res = await tryReq([
        () => API.get("/employee/me"),
        () => API.get("/auth/me"),
        () => API.get("/users/me"),
      ]);

      const u = res?.data?.user || res?.data;
      if (!u?._id) return;

      setMeProfile((prev) => {
        if (!prev) return u;

        const sameId = String(prev._id) === String(u._id);
        const sameUpdated = String(prev.updatedAt || "") === String(u.updatedAt || "");
        // if backend returns same profile again -> don't set (prevents render loop)
        if (sameId && sameUpdated) return prev;
        return u;
      });
    } catch {
      // ignore
    }
  }, [user?._id]);

  /* =========================
     FETCH DASHBOARD (no blink after first load)
  ========================= */
  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      if (!uid) return;

      if (!initialLoadedRef.current) setLoading(true);
      else if (isRefresh) setRefreshing(true);

      try {
        const leavesPromise = API.get("/leaves/my").catch(() => API.get(`/leaves/employee/${uid}`));

        const [statsRes, attRes, leaveRes, taskRes] = await Promise.all([
          API.get("/attendance/stats"),
          API.get("/attendance/history"),
          leavesPromise,
          API.get("/tasks/my-tasks"),
        ]);

        setStats(statsRes?.data || {});

        const attList = pickArray(attRes?.data);
        const sortedAtt = [...attList].sort((a, b) => {
          const da = new Date(a?.date || a?.punchInTime || 0).getTime();
          const db = new Date(b?.date || b?.punchInTime || 0).getTime();
          return db - da;
        });
        setHistory(sortedAtt);

        const leaveList = pickArray(leaveRes?.data).sort(
          (a, b) => new Date(b?.createdAt || b?.startDate || 0) - new Date(a?.createdAt || a?.startDate || 0)
        );
        setLeaves(leaveList);
        setLeavePage(1);

        setTasks(pickArray(taskRes?.data));
        setTaskPage(1);
        setAttPage(1);

        // office location from latest profile ref (no dependency loop)
        const p = profileRef.current;
        const cLoc = p?.companyId?.location || {};
        const lat = Number(cLoc.lat);
        const lng = Number(cLoc.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) setOfficePos({ lat, lng });
        else setOfficePos(null);

        const todayYmd = toYMD(new Date(), tz);
        const todayRecord = sortedAtt.find((d) => toYMD(d?.date, tz) === todayYmd);

        if (!todayRecord) setTodayStatus("Not Started");
        else if (todayRecord?.punchOutTime) setTodayStatus("Completed");
        else if (String(todayRecord?.status || "").toLowerCase().includes("break")) setTodayStatus("On Break");
        else setTodayStatus("Working");

        initialLoadedRef.current = true;
      } catch (err) {
        console.error(err);
        toast.error("Dashboard load failed");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [uid, tz]
  );

  /* =========================
     ONBOARDING SUMMARY (404 -> stop forever)
  ========================= */
  const fetchOnboardingSummary = useCallback(async () => {
    if (onboardingDisabledRef.current) return;

    try {
      // ✅ FIX: specific endpoint only (no fallbacks)
      const res = await API.get("/onboarding/my");

      // Handle 200 OK with null body (from backend fix)
      if (!res.data) {
        setOnboardingSummary({ pending: 0, total: 0, assigned: false });
        return;
      }

      const data = res?.data;
      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.steps)
          ? data.steps
          : Array.isArray(data)
            ? data
            : [];
      const total = items.length;
      const pending = items.filter((x) => String(x?.status || "").toLowerCase() !== "done").length;

      setOnboardingSummary({ pending, total, assigned: true });
    } catch (e) {
      const st = e?.response?.status;
      // 404 means "No onboarding assigned" -> Valid state, not an error.
      if (st === 404) {
        setOnboardingSummary({ pending: 0, total: 0, assigned: false });
        return;
      }
      // 403/500 etc -> log but don't break dashboard
      console.warn("Onboarding check failed:", e);
      setOnboardingSummary({ pending: 0, total: 0, assigned: false });
    }
  }, []);

  /* =========================
     EFFECTS
  ========================= */
  useEffect(() => {
    if (!user?._id) return;
    fetchMe();
    // only once per login/user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    if (!uid) return;
    fetchDashboardData(false);
    fetchOnboardingSummary();
  }, [uid, fetchDashboardData, fetchOnboardingSummary]);

  useEffect(() => {
    if (!currentPos || !officePos) {
      setDistanceMeters(null);
      setIsInsideRadius(true);
      return;
    }
    const d = computeDistanceMeters(currentPos, officePos);
    setDistanceMeters(d);
    setIsInsideRadius(d == null ? false : d <= radiusMeters);
  }, [currentPos, officePos, radiusMeters]);

  /* =========================
     PUNCH FLOW
  ========================= */
  const handlePunchInit = (type) => {
    setActionType(type);
    setReportText("");
    setShowTextModal(true);
  };

  const proceedToVerification = () => {
    setShowTextModal(false);
    setShowPunchModal(true);

    setIsGpsLocked(false);
    setCurrentPos(null);
    setGpsAccuracy(null);
    setDistanceMeters(null);
    setIsInsideRadius(true);

    fetchLocation(); // try, but not mandatory
  };

  const fetchLocation = async () => {
    setIsLocating(true);
    setIsGpsLocked(false);
    setCurrentPos(null);
    setGpsAccuracy(null);
    setDistanceMeters(null);
    setIsInsideRadius(true);

    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      // no toast spam, just once
    }

    try {
      if (watchToastRef.current) toast.dismiss(watchToastRef.current);
      watchToastRef.current = toast.info("📍 Getting accurate location…", { autoClose: 2000 });

      const pos = await getAccuratePosition({
        desiredAccuracy: 60,
        maxWaitMs: 25000,
        enableHighAccuracy: true,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = Number(pos.coords.accuracy);

      setCurrentPos({ lat, lng, accuracy });
      setGpsAccuracy(Number.isFinite(accuracy) ? accuracy : null);
      setIsGpsLocked(true);

      toast.success(`Location Locked ✅ (±${Number.isFinite(accuracy) ? Math.round(accuracy) : "?"}m)`);
    } catch (err) {
      // location optional — no hard block
      console.error(err);
      toast.info("Location not available — continuing without GPS.");
    } finally {
      setIsLocating(false);
    }
  };

  const onFaceVerified = async (faceData) => {
    const locationOk =
      isGpsLocked &&
      currentPos &&
      Number.isFinite(Number(currentPos.lat)) &&
      Number.isFinite(Number(currentPos.lng));

    if (officePos && locationOk && distanceMeters != null && distanceMeters > radiusMeters) {
      return toast.error(`❌ You are outside office radius (${radiusMeters}m). Attendance blocked.`);
    }

    try {
      const payload = {
        faceDescriptor: JSON.stringify(faceData?.descriptor || []),
        faceDescriptorArray: faceData?.descriptor || [],
        image: faceData?.image,

        attendanceMethod,
        method: attendanceMethod,

        // location optional
        ...(locationOk
          ? {
            location: {
              lat: currentPos.lat,
              lng: currentPos.lng,
              accuracy: currentPos.accuracy ?? gpsAccuracy ?? null,
              capturedAt: new Date().toISOString(),
            },
          }
          : {}),

        morningReport: actionType === "in" ? reportText : undefined,
        dailyReport: actionType === "out" ? reportText : undefined,
        plannedTasks: actionType === "in" ? reportText : undefined,
      };

      const endpoint = actionType === "in" ? "/attendance/punch-in" : "/attendance/punch-out";
      await API.post(endpoint, payload);

      toast.success(actionType === "in" ? "Attendance Marked ✅" : "Logged Out Successfully 🏠");
      setShowPunchModal(false);
      fetchDashboardData(true);
      fetchMe();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed!");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.put(`/tasks/update-status/${taskId}`, { status });
      toast.success(`Task updated: ${status}`);
      fetchDashboardData(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Task update failed");
    }
  };

  /* =========================
     UI HELPERS
  ========================= */
  const approvedLeavesCount = useMemo(() => {
    return leaves.filter((l) => String(l?.status || "").toLowerCase() === "approved").length;
  }, [leaves]);

  const pendingTasksCount = useMemo(() => {
    return tasks.filter((t) => {
      const s = String(t?.status || "").toLowerCase();
      return s === "pending" || s === "in progress";
    }).length;
  }, [tasks]);

  const presentThisMonth = useMemo(() => {
    const v = stats?.present ?? stats?.presentDays ?? stats?.presentCount ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }, [stats]);

  const distanceLabel = (d) => {
    if (d == null) return "--";
    if (d < 1000) return `${Math.round(d)} m`;
    return `${(d / 1000).toFixed(2)} km`;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="loaderScreen">
        <div className="spinBig" />
        <div className="loaderText">Loading Dashboard…</div>

        <style>{`
          .loaderScreen{ min-height: 70vh; display:grid; place-items:center; gap:10px; }
          .spinBig{ width:46px; height:46px; border-radius:50%; border:5px solid #e5e7eb; border-top-color:#10b981; animation: sp 1s linear infinite; }
          @keyframes sp{ to{ transform: rotate(360deg);} }
          .loaderText{ font-weight:950; color:#334155; }
        `}</style>
      </div>
    );
  }

  const companyName = profile?.companyId?.name || profile?.companyId?.companyName || "Company";
  const companyIdVal =
    profile?.companyId?._id ||
    profile?.companyId?.id ||
    (typeof profile?.companyId === "string" ? profile.companyId : "");
  const companyIdText = companyIdVal ? String(companyIdVal) : "";


  /* Pagination helpers */
  const attTotal = history.length;
  const attTotalPages = Math.max(1, Math.ceil(attTotal / PAGE_SIZE));
  const paginatedHistory = history.slice((attPage - 1) * PAGE_SIZE, attPage * PAGE_SIZE);

  const leaveTotal = leaves.length;
  const leaveTotalPages = Math.max(1, Math.ceil(leaveTotal / PAGE_SIZE));
  const paginatedLeaves = leaves.slice((leavePage - 1) * PAGE_SIZE, leavePage * PAGE_SIZE);

  const taskTotal = tasks.length;
  const taskTotalPages = Math.max(1, Math.ceil(taskTotal / PAGE_SIZE));
  const paginatedTasks = tasks.slice((taskPage - 1) * PAGE_SIZE, taskPage * PAGE_SIZE);

  const renderPageNums = (current, total) => {
    const pages = [];
    if (total <= 5) { for (let i = 1; i <= total; i++) pages.push(i); }
    else {
      let l = Math.max(1, current - 1), r = Math.min(total, current + 1);
      if (current === 1) r = Math.min(total, 3);
      if (current === total) l = Math.max(1, total - 2);
      if (l > 1) { pages.push(1); if (l > 2) pages.push("..."); }
      for (let i = l; i <= r; i++) pages.push(i);
      if (r < total) { if (r < total - 1) pages.push("..."); pages.push(total); }
    }
    return pages;
  };

  return (
    <div className="edash">
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && <div className="edash-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ── LEFT SIDEBAR ── */}
      <aside className={`edash-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="edash-sb-brand">
          <div className="edash-sb-icon"><FaLayerGroup /></div>
          <h2 className="edash-sb-title">Smart<span>Hrms</span></h2>
          <button className="edash-sb-close" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
        </div>

        <nav className="edash-sb-nav">
          <span className="edash-sb-label">Main</span>
          {NAV_ITEMS.map(item => (
            <button key={item.path}
              className={`edash-sb-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="edash-sb-footer">
          <div className="edash-sb-user">
            <div className="edash-sb-avatar">{(profile?.name || user.name || "E")[0].toUpperCase()}</div>
            <div className="edash-sb-uinfo">
              <span className="edash-sb-uname">{profile?.name || user.name}</span>
              <span className="edash-sb-urole">{profile?.designation || "Employee"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="edash-main">
        {/* Top Header */}
        <header className="edash-header">
          <button className="edash-burger" onClick={() => setSidebarOpen(true)}><FaBars /></button>
          <div className="edash-hdr-right">
            <div className="edash-date"><FaCalendarAlt /><span>{new Date().toLocaleDateString("en-GB")}</span></div>
            <button className="edash-hdr-btn" onClick={() => fetchDashboardData(true)} style={{ opacity: refreshing ? 0.6 : 1 }}>
              <FaRedoAlt /> {refreshing ? "…" : "Refresh"}
            </button>
            <button className="edash-logout" onClick={() => logout('/')} title="Logout"><FaSignOutAlt /></button>
          </div>
        </header>

        {/* Content */}
        <div className="edash-content">
          {/* ── Welcome Card ── */}
          <div className="edash-welcome">
            <div className="edash-wl-left">
              <div className="edash-wl-avatar">
                <img src={getImageUrl(profile?.profileImage)} alt="Profile"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")} />
                <span className="edash-wl-dot" data-status={todayStatus}></span>
              </div>
              <div className="edash-wl-info">
                <div className="edash-wl-tag">Welcome Back 👋</div>
                <div className="edash-wl-name">{profile?.name || user.name}</div>
                <div className="edash-wl-meta">
                  <span><b>{companyName}</b></span>
                  <span>Method: <b>{attendanceMethod}</b></span>
                  <span>TZ: <b>{tz}</b></span>
                  <span>Radius: <b>{radiusMeters}m</b></span>
                </div>
              </div>
            </div>
            <div className="edash-wl-right">
              {todayStatus === "Not Started" ? (
                <button className="edash-btn-p edash-pulse" onClick={() => handlePunchInit("in")}><FaPlay /> Start Shift</button>
              ) : todayStatus === "Completed" ? (
                <div className="edash-done"><FaCheckCircle /> Shift Completed</div>
              ) : (
                <div className="edash-punch-dual">
                  <button className="edash-btn-g" onClick={() => navigate("/employee/attendance")}><FaCoffee /> Break</button>
                  <button className="edash-btn-d" onClick={() => handlePunchInit("out")}><FaSignOutAlt /> End Day</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="edash-stats">
            <div className="edash-sc"><div className="edash-sc-lbl">Present</div><div className="edash-sc-val">{presentThisMonth}</div><div className="edash-sc-hint">This month</div></div>
            <div className="edash-sc"><div className="edash-sc-lbl">Approved Leaves</div><div className="edash-sc-val">{approvedLeavesCount}</div><div className="edash-sc-hint">All time</div></div>
            <div className="edash-sc"><div className="edash-sc-lbl">Pending Tasks</div><div className="edash-sc-val">{pendingTasksCount}</div><div className="edash-sc-hint">Need action</div></div>
            <div className="edash-sc"><div className="edash-sc-lbl">Onboarding</div><div className="edash-sc-val">{onboardingSummary.assigned ? `${onboardingSummary.pending}/${onboardingSummary.total}` : "--"}</div><div className="edash-sc-hint">{onboardingSummary.assigned ? "Pending steps" : "Not assigned"}</div></div>
          </div>

          {/* ── Tables ── */}
          <div className="edash-tables">
            {/* Attendance */}
            <section className="edash-panel">
              <div className="edash-ph"><div className="edash-pt"><FaClipboardList /> Attendance (Recent)</div><button className="edash-link" onClick={() => navigate("/employee/attendance")}>View All</button></div>
              <div className="edash-tw">
                <table className="edash-tbl">
                  <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Net</th><th>Reports</th><th>Status</th></tr></thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr><td colSpan={6} className="edash-empty">No attendance records yet.</td></tr>
                    ) : paginatedHistory.map((h) => {
                      const m = String(h?.mode || "").toLowerCase();
                      const displayStatus = m.includes("wfh") ? "WFH" : m.includes("unpaid") ? "Unpaid" : m.includes("paid") ? "Paid" : h.status || "—";
                      const isManual = h.isManualEntry || h.source === 'MANUAL_HR';
                      const hasMorning = !!h.plannedTasks;
                      const hasDaily = !!h.dailyReport;
                      return (
                        <tr key={h._id || `${h.date}-${h.punchInTime}`}>
                          <td><div className="edash-bold">{fmtDate(h.date, tz)}</div>
                            {isManual && <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 800 }}>Marked by HR</span>}
                          </td>
                          <td className="edash-green">{fmtTime(h.punchInTime, tz)}</td>
                          <td className="edash-red">{fmtTime(h.punchOutTime, tz)}</td>
                          <td>{h.netWorkHours || h.netHours || "--"}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontWeight: 800 }}>
                              <span title={h.plannedTasks || "No Morning Plan"} style={{ color: hasMorning ? '#16a34a' : '#94a3b8', background: hasMorning ? '#dcfce7' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>M: {hasMorning ? "✅" : "—"}</span>
                              <span title={h.dailyReport || "No Daily Report"} style={{ color: hasDaily ? '#2563eb' : '#94a3b8', background: hasDaily ? '#dbeafe' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>E: {hasDaily ? "✅" : "—"}</span>
                            </div>
                          </td>
                          <td><span className={`edash-pill ${String(displayStatus || "").toLowerCase().replace(/\s/g, "-")}`}>{displayStatus}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {attTotalPages > 1 && (
                <div className="edash-pg">
                  <span className="edash-pg-info">Showing {(attPage - 1) * PAGE_SIZE + 1}–{Math.min(attPage * PAGE_SIZE, attTotal)} of {attTotal}</span>
                  <div className="edash-pg-btns">
                    <button className="edash-pg-btn" disabled={attPage === 1} onClick={() => setAttPage(p => p - 1)}><FaChevronLeft /></button>
                    {renderPageNums(attPage, attTotalPages).map((p, i) => (<button key={i} className={`edash-pg-num ${p === attPage ? 'active' : ''} ${p === '...' ? 'dots' : ''}`} disabled={p === '...'} onClick={() => typeof p === 'number' && setAttPage(p)}>{p}</button>))}
                    <button className="edash-pg-btn" disabled={attPage === attTotalPages} onClick={() => setAttPage(p => p + 1)}><FaChevronRight /></button>
                  </div>
                </div>
              )}
            </section>

            {/* Leaves */}
            <section className="edash-panel">
              <div className="edash-ph"><div className="edash-pt"><FaPlaneDeparture /> Leaves (Recent)</div><button className="edash-link" onClick={() => navigate("/employee/leaves")}>Manage</button></div>
              <div className="edash-tw">
                <table className="edash-tbl">
                  <thead><tr><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
                  <tbody>
                    {leaves.length === 0 ? (
                      <tr><td colSpan={3} className="edash-empty">No leave requests yet.</td></tr>
                    ) : paginatedLeaves.map((l) => (
                      <tr key={l._id || `${l.startDate}-${l.endDate}`}>
                        <td className="edash-bold">{normalizeLeaveType(l.leaveType) || "Leave"}</td>
                        <td>{fmtDate(l.startDate, tz)} - {fmtDate(l.endDate, tz)}</td>
                        <td><span className={`edash-pill ${String(l.status || "").toLowerCase()}`}>{l.status || "Pending"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {leaveTotalPages > 1 && (
                <div className="edash-pg">
                  <span className="edash-pg-info">Showing {(leavePage - 1) * PAGE_SIZE + 1}–{Math.min(leavePage * PAGE_SIZE, leaveTotal)} of {leaveTotal}</span>
                  <div className="edash-pg-btns">
                    <button className="edash-pg-btn" disabled={leavePage === 1} onClick={() => setLeavePage(p => p - 1)}><FaChevronLeft /></button>
                    {renderPageNums(leavePage, leaveTotalPages).map((p, i) => (<button key={i} className={`edash-pg-num ${p === leavePage ? 'active' : ''} ${p === '...' ? 'dots' : ''}`} disabled={p === '...'} onClick={() => typeof p === 'number' && setLeavePage(p)}>{p}</button>))}
                    <button className="edash-pg-btn" disabled={leavePage === leaveTotalPages} onClick={() => setLeavePage(p => p + 1)}><FaChevronRight /></button>
                  </div>
                </div>
              )}
            </section>

            {/* Tasks */}
            <section className="edash-panel edash-panel-wide">
              <div className="edash-ph"><div className="edash-pt"><FaTasks /> Tasks (My Work)</div><button className="edash-link" onClick={() => navigate("/employee/tasks")}>Open Tasks</button></div>
              <div className="edash-hint">New joiner? ✅ First complete your <b>Onboarding</b> checklist from <b>My Onboarding</b>.</div>
              <div className="edash-tw">
                <table className="edash-tbl">
                  <thead><tr><th>Task</th><th>Due</th><th>Status</th><th style={{ width: 180 }}>Action</th></tr></thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr><td colSpan={4} className="edash-empty">No tasks assigned right now.</td></tr>
                    ) : paginatedTasks.map((t) => {
                      const status = String(t.status || "Pending");
                      const s = status.toLowerCase();
                      return (
                        <tr key={t._id || t.id}>
                          <td><div className="edash-bold">{t.title || "Untitled Task"}</div><div className="edash-muted">{t.description || ""}</div></td>
                          <td>{t.deadline ? fmtDate(t.deadline, tz) : "--"}</td>
                          <td><span className={`edash-pill ${s.replace(/\s/g, "-")}`}>{status}</span></td>
                          <td>
                            {s === "pending" ? (
                              <button className="edash-mini greenBtn" onClick={() => updateTaskStatus(t._id, "In Progress")}>Start</button>
                            ) : s === "in progress" ? (
                              <button className="edash-mini blueBtn" onClick={() => navigate("/employee/tasks")}>Submit</button>
                            ) : s === "completed" ? (
                              <span className="edash-muted">Under Review</span>
                            ) : s === "verified" ? (
                              <span className="edash-okText">Verified ✅</span>
                            ) : (
                              <span className="edash-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {taskTotalPages > 1 && (
                <div className="edash-pg">
                  <span className="edash-pg-info">Showing {(taskPage - 1) * PAGE_SIZE + 1}–{Math.min(taskPage * PAGE_SIZE, taskTotal)} of {taskTotal}</span>
                  <div className="edash-pg-btns">
                    <button className="edash-pg-btn" disabled={taskPage === 1} onClick={() => setTaskPage(p => p - 1)}><FaChevronLeft /></button>
                    {renderPageNums(taskPage, taskTotalPages).map((p, i) => (<button key={i} className={`edash-pg-num ${p === taskPage ? 'active' : ''} ${p === '...' ? 'dots' : ''}`} disabled={p === '...'} onClick={() => typeof p === 'number' && setTaskPage(p)}>{p}</button>))}
                    <button className="edash-pg-btn" disabled={taskPage === taskTotalPages} onClick={() => setTaskPage(p => p + 1)}><FaChevronRight /></button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* ── MODALS (unchanged) ── */}
      {showTextModal && (
        <div className="modalOverlay">
          <div className="modalCard">
            <div className="modalHead">
              <div className="modalTitle">{actionType === "in" ? "Morning Report" : "Daily Report"}</div>
              <button className="iconBtn" onClick={() => setShowTextModal(false)}><FaTimes /></button>
            </div>
            <textarea className="modalText" placeholder={actionType === "in" ? "Today's plan / tasks..." : "Today's work summary..."} value={reportText} onChange={(e) => setReportText(e.target.value)} />
            <button className="edash-btn-p" onClick={proceedToVerification}>Proceed <FaArrowRight /></button>
          </div>
        </div>
      )}

      {showPunchModal && (
        <div className="modalOverlay">
          <div className="modalCard wide">
            <div className="modalHead">
              <div className="modalTitle">Verification</div>
              <button className="iconBtn" onClick={() => setShowPunchModal(false)}><FaTimes /></button>
            </div>
            <div className="locStrip">
              <div className={`locPill ${officePos && distanceMeters != null && !isInsideRadius ? "bad" : "ok"}`}>
                <FaMapMarkerAlt />
                <span>{officePos ? `Distance: ${distanceLabel(distanceMeters)} (Limit: ${radiusMeters}m)` : "Office location not configured (Admin must set office lat/lng)."}</span>
              </div>
              <div className="locMeta">
                <span>Accuracy: {gpsAccuracy != null ? `±${Math.round(gpsAccuracy)}m` : "--"}</span>
                <button className="edash-mini" onClick={fetchLocation} type="button"><FaRedoAlt /> Refresh</button>
              </div>
            </div>
            <div className="verifyGrid">
              <div className="mapBox">
                <VerifyMap apiKey={GOOGLE_MAPS_API_KEY} currentPos={currentPos} officePos={officePos} circleOptions={circleOptions} />
                {isLocating && (<div className="gpsOverlay"><FaSpinner className="spin" /> Detecting Location…</div>)}
              </div>
              <div className="faceBox">
                <div className={`faceWrap ${officePos && distanceMeters != null && !isInsideRadius ? "blocked" : ""}`}>
                  <FaceCapture onCapture={onFaceVerified} btnText="Verify & Punch" />
                  {officePos && distanceMeters != null && !isInsideRadius && (<div className="blockOverlay">❌ You are outside office radius. Move closer and refresh location.</div>)}
                </div>
                <div className="smallHint">Tip: Good light + face centered = fast verification ✅</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STYLES ── */}
      <style>{`
        /* ===== LAYOUT ===== */
        .edash{display:flex;min-height:100vh;background:#f8fafc;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a}
        .edash-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:90}

        /* ===== SIDEBAR ===== */
        .edash-sidebar{position:fixed;top:0;left:0;width:260px;height:100vh;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;z-index:100;transition:transform .3s ease}
        .edash-sb-brand{height:70px;display:flex;align-items:center;padding:0 24px;border-bottom:1px solid #e2e8f0;gap:12px}
        .edash-sb-icon{width:36px;height:36px;background:#10b981;color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
        .edash-sb-title{font-size:1.2rem;font-weight:700;color:#0f172a;margin:0}
        .edash-sb-title span{color:#10b981}
        .edash-sb-close{display:none;margin-left:auto;background:none;border:1px solid #e2e8f0;border-radius:8px;width:32px;height:32px;align-items:center;justify-content:center;cursor:pointer;font-size:14px;color:#64748b}
        .edash-sb-nav{flex:1;padding:24px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:6px}
        .edash-sb-label{font-size:.75rem;text-transform:uppercase;color:#64748b;font-weight:600;padding-left:12px;margin-bottom:8px;letter-spacing:.5px}
        .edash-sb-link{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:8px;color:#64748b;font-weight:500;transition:all .2s;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-size:.95rem;font-family:inherit}
        .edash-sb-link:hover{background:#f1f5f9;color:#0f172a}
        .edash-sb-link.active{background:#ecfdf5;color:#10b981;font-weight:600}
        .edash-sb-footer{padding:16px;border-top:1px solid #e2e8f0;background:#f8fafc}
        .edash-sb-user{display:flex;align-items:center;gap:12px}
        .edash-sb-avatar{width:40px;height:40px;background:#10b981;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0}
        .edash-sb-uinfo{display:flex;flex-direction:column;overflow:hidden}
        .edash-sb-uname{font-size:.9rem;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}
        .edash-sb-urole{font-size:.75rem;color:#64748b}

        /* ===== MAIN ===== */
        .edash-main{margin-left:260px;width:calc(100% - 260px);min-height:100vh;display:flex;flex-direction:column}
        .edash-header{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:flex-end;padding:14px 24px;gap:10px}
        .edash-burger{display:none;border:none;background:transparent;font-size:18px;cursor:pointer;color:#0f172a;margin-right:auto}
        .edash-hdr-right{display:flex;align-items:center;gap:10px}
        .edash-date{display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:#ecfdf5;color:#059669;font-weight:700;font-size:13px;border:1px solid #d1fae5}
        .edash-hdr-btn{border:1px solid #e2e8f0;background:#fff;padding:8px 14px;border-radius:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#0f172a;transition:.15s}
        .edash-hdr-btn:hover{background:#f8fafc}
        .edash-logout{width:38px;height:38px;display:grid;place-items:center;border:none;border-radius:12px;cursor:pointer;background:#fee2e2;color:#ef4444;font-size:14px;transition:.15s}
        .edash-logout:hover{background:#fecaca}
        .edash-content{padding:24px;display:flex;flex-direction:column;gap:20px;max-width:1200px;width:100%}

        /* ===== WELCOME ===== */
        .edash-welcome{background:linear-gradient(135deg,#ecfdf5 0%,#fff 65%);border:1px solid #d1fae5;border-radius:16px;padding:24px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
        .edash-wl-left{display:flex;align-items:center;gap:20px}
        .edash-wl-avatar{position:relative;width:72px;height:72px;border-radius:50%;border:3px solid #10b981;padding:3px;background:#fff;flex-shrink:0}
        .edash-wl-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
        .edash-wl-dot{width:14px;height:14px;border-radius:50%;position:absolute;bottom:2px;right:2px;background:#d1d5db;border:2px solid #fff}
        .edash-wl-dot[data-status="Working"]{background:#10b981}
        .edash-wl-dot[data-status="On Break"]{background:#f59e0b}
        .edash-wl-dot[data-status="Completed"]{background:#2563eb}
        .edash-wl-tag{font-size:13px;color:#64748b;font-weight:600}
        .edash-wl-name{font-size:22px;font-weight:800;color:#0f172a;margin:4px 0}
        .edash-wl-meta{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#64748b;font-weight:600}
        .edash-wl-meta b{color:#0f172a}
        .edash-wl-right{display:flex;align-items:center}
        .edash-punch-dual{display:flex;gap:10px}
        .edash-btn-p{border:none;padding:12px 20px;border-radius:12px;background:#10b981;color:#fff;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 20px rgba(16,185,129,.2);transition:.15s;white-space:nowrap;width:100%}
        .edash-btn-p:hover{background:#059669;transform:translateY(-1px)}
        .edash-pulse{animation:edPulse 1.5s infinite}
        @keyframes edPulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.35)}70%{box-shadow:0 0 0 12px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}
        .edash-done{padding:10px 16px;border-radius:12px;border:1px solid #bbf7d0;background:#ecfdf5;color:#065f46;font-weight:700;display:flex;align-items:center;gap:8px;white-space:nowrap}
        .edash-btn-g{border:1px solid #e2e8f0;padding:10px 16px;border-radius:12px;background:#fff;color:#0f172a;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap}
        .edash-btn-g:hover{border-color:#cbd5e1}
        .edash-btn-d{border:none;padding:10px 16px;border-radius:12px;background:#ef4444;color:#fff;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap}
        .edash-btn-d:hover{background:#dc2626}

        /* ===== STAT CARDS ===== */
        .edash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .edash-sc{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px;box-shadow:0 4px 12px rgba(15,23,42,.03)}
        .edash-sc-lbl{color:#64748b;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.8px}
        .edash-sc-val{font-weight:800;font-size:28px;margin-top:8px;color:#0f172a}
        .edash-sc-hint{color:#64748b;font-weight:600;font-size:12px;margin-top:4px}

        /* ===== TABLES ===== */
        .edash-tables{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .edash-panel-wide{grid-column:1/-1}
        .edash-panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px;box-shadow:0 4px 12px rgba(15,23,42,.03);overflow:hidden}
        .edash-ph{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
        .edash-pt{font-weight:800;display:flex;align-items:center;gap:10px;font-size:15px}
        .edash-link{border:none;background:#f1f5f9;color:#0f172a;font-weight:700;padding:8px 12px;border-radius:10px;cursor:pointer;font-size:13px;transition:.15s}
        .edash-link:hover{background:#e2e8f0}
        .edash-hint{background:#f8fafc;border:1px dashed #e2e8f0;padding:10px 12px;border-radius:12px;margin-bottom:12px;font-weight:700;color:#334155;font-size:12px}
        .edash-tw{overflow-x:auto}
        .edash-tbl{width:100%;border-collapse:collapse;min-width:500px}
        .edash-tbl thead th{text-align:left;padding:12px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid #f1f5f9;font-weight:700}
        .edash-tbl tbody td{padding:12px;border-bottom:1px solid #f8fafc;font-weight:700;font-size:13px;color:#0f172a;vertical-align:top}
        .edash-tbl tbody tr:hover{background:#fcfcfd}
        .edash-empty{text-align:center;color:#64748b!important;font-weight:700;padding:24px!important}
        .edash-bold{font-weight:800}
        .edash-muted{color:#64748b;font-weight:700;font-size:12px;margin-top:4px}
        .edash-green{color:#16a34a}
        .edash-red{color:#ef4444}
        .edash-okText{font-weight:800;color:#065f46}

        /* ===== PILLS ===== */
        .edash-pill{display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid #e2e8f0;background:#f8fafc;text-transform:capitalize}
        .edash-pill.present,.edash-pill.approved,.edash-pill.verified{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}
        .edash-pill.pending,.edash-pill.in-progress{background:#fffbeb;border-color:#fde68a;color:#92400e}
        .edash-pill.rejected,.edash-pill.absent,.edash-pill.unpaid{background:#fee2e2;border-color:#fecaca;color:#991b1b}
        .edash-pill.wfh{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}
        .edash-pill.paid{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}

        /* ===== PAGINATION ===== */
        .edash-pg{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid #f1f5f9;flex-wrap:wrap}
        .edash-pg-info{font-size:12px;color:#64748b;font-weight:600}
        .edash-pg-btns{display:flex;align-items:center;gap:4px}
        .edash-pg-btn,.edash-pg-num{border:1px solid #e2e8f0;background:#fff;padding:6px 10px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12px;color:#0f172a;transition:.15s}
        .edash-pg-btn:disabled{opacity:.4;cursor:not-allowed}
        .edash-pg-num.active{background:#10b981;color:#fff;border-color:#10b981}
        .edash-pg-num.dots{border:none;background:none;cursor:default;padding:6px 4px}

        /* ===== MINI BUTTONS ===== */
        .edash-mini{border:1px solid #e2e8f0;background:#fff;padding:7px 12px;border-radius:10px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:12px}
        .edash-mini.greenBtn{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}
        .edash-mini.blueBtn{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8}

        /* ===== MODALS ===== */
        .modalOverlay{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}
        .modalCard{width:100%;max-width:540px;background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.18);padding:20px}
        .modalCard.wide{max-width:1100px}
        .modalHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
        .modalTitle{font-weight:800;font-size:16px}
        .iconBtn{width:38px;height:38px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:grid;place-items:center}
        .modalText{width:100%;min-height:120px;border:1px solid #e2e8f0;border-radius:14px;padding:12px;outline:none;font-weight:700;color:#0f172a;margin-bottom:12px;font-family:inherit;font-size:14px;resize:vertical}
        .locStrip{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
        .locPill{flex:1;display:flex;align-items:center;gap:10px;border-radius:14px;padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:800;color:#334155;min-width:260px;font-size:13px}
        .locPill.ok{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}
        .locPill.bad{background:#fee2e2;border-color:#fecaca;color:#991b1b}
        .locMeta{display:flex;gap:10px;align-items:center;color:#64748b;font-weight:800;font-size:13px}
        .verifyGrid{display:grid;grid-template-columns:1.4fr 1fr;gap:12px;align-items:start}
        .mapBox{position:relative;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;min-height:260px;background:#fff}
        .mapFallback{height:260px;display:grid;place-items:center;color:#64748b;font-weight:800}
        .gpsOverlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:900;color:#0f172a;background:rgba(255,255,255,.6);backdrop-filter:blur(6px)}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .warnBox{padding:12px;background:#fffbeb;border:1px solid #fde68a;color:#92400e;font-weight:800;border-radius:14px;margin:10px}
        .faceWrap{position:relative;border:1px solid #e2e8f0;border-radius:16px;padding:10px;background:#fff}
        .blockOverlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:14px;background:rgba(15,23,42,.65);color:#fff;font-weight:900;border-radius:16px}
        .smallHint{margin-top:10px;color:#64748b;font-weight:700;font-size:12px}

        /* ===== LOADER ===== */
        .edash-loader{min-height:100vh;display:grid;place-items:center;gap:10px;background:#f8fafc;font-family:Inter,system-ui,sans-serif}
        .edash-spin{width:46px;height:46px;border-radius:50%;border:5px solid #e5e7eb;border-top-color:#10b981;animation:spin 1s linear infinite}
        .edash-loader-txt{font-weight:800;color:#334155}

        /* ===== RESPONSIVE ===== */
        @media(max-width:1024px){
          .edash-sidebar{transform:translateX(-100%)}
          .edash-sidebar.open{transform:translateX(0)}
          .edash-sb-close{display:flex}
          .edash-main{margin-left:0;width:100%}
          .edash-burger{display:inline-flex}
          .edash-stats{grid-template-columns:repeat(2,1fr)}
          .edash-tables{grid-template-columns:1fr}
          .verifyGrid{grid-template-columns:1fr}
        }
        @media(max-width:768px){
          .edash-stats{grid-template-columns:repeat(2,1fr)}
          .edash-tables{grid-template-columns:1fr}
          .edash-content{padding:16px}
          .edash-tbl{min-width:400px}
          .edash-panel{padding:14px}
          .locStrip{flex-direction:column;gap:8px}
          .locPill{min-width:unset}
          .modalCard.wide{max-width:95vw}
          .edash-welcome{padding:18px}
          .edash-wl-meta{gap:10px;font-size:12px}
          .edash-sc{padding:14px}
          .edash-sc-val{font-size:22px}
        }
        @media(max-width:560px){
          .edash-stats{grid-template-columns:1fr}
          .edash-welcome{flex-direction:column;align-items:flex-start}
          .edash-wl-left{flex-direction:column;align-items:flex-start}
          .edash-wl-right{width:100%}
          .edash-punch-dual{width:100%}
          .edash-btn-p{width:100%}
          .edash-content{padding:14px}
          .edash-hdr-right{flex-wrap:wrap;justify-content:flex-end}
          .edash-date span{display:none}
          .edash-hdr-btn{padding:8px 10px;font-size:12px}
          .edash-pg{flex-direction:column;align-items:center;gap:8px}
          .edash-pg-info{text-align:center}
          .edash-btn-g,.edash-btn-d{flex:1;justify-content:center}
          .modalCard{padding:14px;border-radius:14px}
        }
        @media(max-width:400px){
          .edash-content{padding:10px}
          .edash-panel{padding:10px}
          .edash-tbl thead th{padding:8px;font-size:10px}
          .edash-tbl tbody td{padding:8px;font-size:12px}
          .edash-tbl{min-width:350px}
          .edash-welcome{padding:14px}
          .edash-wl-name{font-size:18px}
          .edash-wl-avatar{width:56px;height:56px}
          .edash-sc{padding:10px}
          .edash-sc-val{font-size:20px}
          .edash-sc-lbl{font-size:10px}
          .edash-header{padding:10px 12px}
          .edash-logout{width:32px;height:32px;font-size:12px}
          .edash-pg-btn,.edash-pg-num{padding:4px 8px;font-size:11px}
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
