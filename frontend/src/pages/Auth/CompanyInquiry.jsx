import React, { useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCheckCircle,
  FaSearch,
  FaClock,
  FaDotCircle,
  FaGlobe,
  FaUsers,
  FaBriefcase,
  FaIdCard,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from "@react-google-maps/api";
import { submitInquiry } from "../../services/api";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || "";
const libraries = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "16px",
  marginTop: "15px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India Center

const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
];

const INDUSTRY_TYPES = [
  "IT Services",
  "Manufacturing",
  "Healthcare",
  "Education",
  "Retail",
  "Finance",
  "Logistics",
  "Real Estate",
  "Others",
];

const EMPLOYEE_COUNTS = ["1-10", "11-50", "51-200", "201-500", "500+"];

const CompanyInquiry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    } catch {
      return "Asia/Kolkata";
    }
  }, []);

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    website: "",
    gstin: "",
    industryType: "",
    employeeCount: "",
    address: "",
    city: "",
    state: "",
    lat: "",
    lng: "",
    radius: 200,
    timeZone: "Asia/Kolkata", // Default Indian Timezone
    officeStartTime: "09:30",
    officeEndTime: "18:30",
    password: "",
    confirmPassword: "",
  });

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markerPos, setMarkerPos] = useState(defaultCenter);

  const onLoad = useCallback((m) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const onPlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || form.address;

    // Extract City and State from address components
    let city = "";
    let state = "";
    if (place.address_components) {
      place.address_components.forEach((component) => {
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
      });
    }

    setMarkerPos({ lat, lng });
    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(17);
    }

    setForm((prev) => ({ ...prev, lat, lng, address, city, state }));
    toast.success("Location Selected! 📍");
  };

  // Update marker position when place changes
  const onMarkerDragEnd = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    setForm((prev) => ({ ...prev, lat, lng }));
  }, []);

  const validate = () => {
    if (!form.companyName || !form.contactPerson || !form.email || !form.mobile) {
      toast.warning("⚠️ Please fill all basic details.");
      return false;
    }
    if (form.password.length < 6) {
      toast.warning("⚠️ Password must be at least 6 characters.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast.warning("⚠️ Passwords do not match.");
      return false;
    }
    if (!form.industryType || !form.employeeCount) {
      toast.warning("⚠️ Please select Industry & Employee Count.");
      return false;
    }
    if (!form.lat || !form.lng || !form.address) {
      toast.warning("⚠️ Please select office location.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        lat: Number(form.lat),
        lng: Number(form.lng),
        radius: Number(form.radius),
      };

      await submitInquiry(payload);
      setSubmitted(true);
      toast.success("Inquiry Submitted Successfully! 🚀");

      setTimeout(() => navigate("/"), 6000);
    } catch (error) {
      const msg = error?.response?.data?.message || "Server Error. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const mapsProblem = !GOOGLE_MAPS_API_KEY || !!loadError;

  return (
    <div className="inquiry-page">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="inquiry-container slide-up">
        <div className="left-panel">
          <div className="panel-content">
            <div className="brand-logo">
              <FaBuilding /> <span>SmartHRMS</span>
            </div>
            <h1>Partner with the Future of HR</h1>
            <p>
              Join thousands of Indian businesses digitizing their workforce with our AI-powered platform.
              Streamline Attendance, Payroll, and Compliance effortlessly.
            </p>
            <div className="feature-list" style={{ marginBottom: '40px' }}>
              <div className="f-item"><FaCheckCircle /> <span>AI Attendance & Facial Regognition</span></div>
              <div className="f-item"><FaCheckCircle /> <span>Automated Payroll & Compliance</span></div>
              <div className="f-item"><FaCheckCircle /> <span>Geo-fencing & Field Tracking</span></div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
              alt="Business Partnership"
              style={{ width: '100%', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', opacity: 0.8 }}
            />
          </div>
        </div>

        <div className="right-panel">
          <div className="form-header">
            <h2>Business Inquiry</h2>
            <p>Fill in the details to get started.</p>
          </div>

          {submitted ? (
            <div className="success-screen slide-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="success-icon" style={{ fontSize: '70px', color: '#10b981', marginBottom: '30px' }}>
                <FaCheckCircle />
              </div>
              <h2 style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '20px' }}>Application Received</h2>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px' }}>
                Your request is under review. Our team will verify your details and approve your access soon.
                <br />
                You will receive an email once your account is provisioned.
              </p>
              <button onClick={() => navigate("/")} className="submit-btn" style={{ maxWidth: '280px', margin: '0 auto' }}>
                Return to Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-content">

              {/* Section: Company Info */}
              <div className="form-section">
                <h3 className="section-title">Company Details</h3>
                <div className="input-row">
                  <div className="field-group">
                    <label>Company Name <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaBuilding className="field-icon" />
                      <input type="text" placeholder="e.g. Tata Consultancy Services" value={form.companyName} onChange={e => setField("companyName", e.target.value)} required />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Industry Type <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaBriefcase className="field-icon" />
                      <select value={form.industryType} onChange={e => setField("industryType", e.target.value)} required>
                        <option value="">Select Industry</option>
                        {INDUSTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="field-group">
                    <label>Employee Count <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaUsers className="field-icon" />
                      <select value={form.employeeCount} onChange={e => setField("employeeCount", e.target.value)} required>
                        <option value="">Select Range</option>
                        {EMPLOYEE_COUNTS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>GSTIN (Optional)</label>
                    <div className="input-wrap">
                      <FaIdCard className="field-icon" />
                      <input type="text" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e => setField("gstin", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="field-group">
                    <label>Website URL (Optional)</label>
                    <div className="input-wrap">
                      <FaGlobe className="field-icon" />
                      <input type="url" placeholder="https://www.company.com" value={form.website} onChange={e => setField("website", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Contact & Security */}
              <div className="form-section">
                <h3 className="section-title">Contact & Security</h3>
                <div className="input-row">
                  <div className="field-group">
                    <label>Full Name <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaUserTie className="field-icon" />
                      <input type="text" placeholder="John Doe" value={form.contactPerson} onChange={e => setField("contactPerson", e.target.value)} required />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Mobile Number <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaPhone className="field-icon" />
                      <input type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={e => setField("mobile", e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: '18px' }}>
                  <label>Email Address <span className="req">*</span></label>
                  <div className="input-wrap">
                    <FaEnvelope className="field-icon" />
                    <input type="email" placeholder="Enter work email address" value={form.email} autoComplete="username" onChange={e => setField("email", e.target.value)} required />
                  </div>
                </div>

                <div className="input-row">
                  <div className="field-group">
                    <label>Password <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaLock className="field-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Create Password"
                        value={form.password}
                        onChange={e => setField("password", e.target.value)}
                        required
                      />
                      <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </div>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Confirm Password <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaLock className="field-icon" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={e => setField("confirmPassword", e.target.value)}
                        required
                      />
                      <div className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Office Setup */}
              <div className="form-section">
                <h3 className="section-title">Office Configuration</h3>
                <div className="grid-3">
                  <div className="field-group">
                    <label>Start Time</label>
                    <div className="input-wrap"><input type="time" className="no-icon" value={form.officeStartTime} onChange={e => setField("officeStartTime", e.target.value)} /></div>
                  </div>
                  <div className="field-group">
                    <label>End Time</label>
                    <div className="input-wrap"><input type="time" className="no-icon" value={form.officeEndTime} onChange={e => setField("officeEndTime", e.target.value)} /></div>
                  </div>
                  <div className="field-group">
                    <label>Time Zone</label>
                    <div className="input-wrap">
                      <select className="no-icon" value={form.timeZone} onChange={e => setField("timeZone", e.target.value)} style={{ color: form.timeZone ? '#ffffff' : '#cbd5e1' }}>
                        {TIMEZONE_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="field-group" style={{ marginTop: '15px' }}>
                  <label>Attendance Radius: <strong>{form.radius} meters</strong></label>
                  <input type="range" min="50" max="5000" step="50" value={form.radius} onChange={e => setField("radius", e.target.value)} className="range-slider" />
                </div>
              </div>

              {/* Section: Location */}
              <div className="form-section">
                <h3 className="section-title">Office Location <span className="req">*</span></h3>

                {mapsProblem ? (
                  <div className="map-error">Google Maps API Key Missing. Please enter coordinates manually.</div>
                ) : isLoaded ? (
                  <div className="map-wrapper">
                    <Autocomplete onLoad={a => setAutocomplete(a)} onPlaceChanged={onPlaceChanged}>
                      <div className="search-box">
                        <FaSearch />
                        <input type="text" placeholder="Search your office location..." />
                      </div>
                    </Autocomplete>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={markerPos}
                      zoom={5}
                      onLoad={onLoad}
                      onUnmount={onUnmount}
                    >
                      <Marker
                        position={markerPos}
                        draggable
                        onDragEnd={onMarkerDragEnd}
                      />
                    </GoogleMap>
                  </div>
                ) : <div className="map-loading">Loading Map...</div>}

                <div className="full-address-box">
                  <div className="input-wrap">
                    <FaMapMarkerAlt className="field-icon" />
                    <textarea placeholder="Full address will appear here..." value={form.address} onChange={e => setField("address", e.target.value)} rows="2"></textarea>
                  </div>
                  <div className="row-2">
                    <input type="text" placeholder="City" value={form.city} onChange={e => setField("city", e.target.value)} className="simple-input" />
                    <input type="text" placeholder="State" value={form.state} onChange={e => setField("state", e.target.value)} className="simple-input" />
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Processing..." : <>Submit Application <FaPaperPlane /></>}
              </button>

              <div className="secure-note">
                <FaLock /> Your data is encrypted and secure.
              </div>

            </form>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        :root {
          --primary-color: #10b981;
          --primary-dark: #059669;
          --secondary-color: #10B981;
          --accent-gradient: linear-gradient(135deg, #059669 0%, #10b981 100%);
          --bg-color: #050505;
          --glass-bg: rgba(15, 15, 15, 0.9);
          --glass-border: rgba(16, 185, 129, 0.2);
          --text-dark: #ffffff;
          --text-light: #94a3b8;
        }

        body { margin: 0; font-family: 'Outfit', sans-serif; background: #050505; }

        .inquiry-page {
          min-height: 100vh;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 60px;
          position: relative;
          overflow: hidden;
        }

        .background-shapes .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          z-index: 0;
        }
        .shape-1 { top: -100px; left: -100px; width: 500px; height: 500px; background: rgba(16, 185, 129, 0.1); }
        .shape-2 { bottom: -150px; right: -150px; width: 600px; height: 600px; background: rgba(16, 185, 129, 0.05); }
        .shape-3 { top: 40%; right: 20%; width: 300px; height: 300px; background: rgba(16, 185, 129, 0.05); }

        .inquiry-container {
          display: flex;
          width: 100%;
          max-width: 1100px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.15);
          border: 1px solid var(--glass-border);
          overflow: hidden;
          z-index: 10;
        }

        /* Left Panel */
        .left-panel {
          flex: 0.8;
          background: #111827; /* Dark background for contrast */
          color: white;
          padding: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .left-panel::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: url('https://www.transparenttextures.com/patterns/cubes.png');
          opacity: 0.05;
        }
        .panel-content { position: relative; z-index: 2; }
        .brand-logo { font-size: 1.8rem; font-weight: 800; display: flex; align-items: center; gap: 10px; margin-bottom: 30px; color: #10b981; }
        .left-panel h1 { font-size: 2.8rem; line-height: 1.2; margin-bottom: 20px; font-weight: 700; color: #f0fdf4; }
        .left-panel p { font-size: 1.1rem; opacity: 0.8; line-height: 1.6; margin-bottom: 40px; color: #d1d5db; }
        .feature-list .f-item { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; font-size: 1.05rem; font-weight: 500; color: #10b981; }
        .feature-list .f-item span { color: #f3f4f6; }

        /* Right Panel */
        .right-panel {
          flex: 1.2;
          padding: 50px;
          overflow-y: auto;
          max-height: 85vh;
        }

        .form-header { margin-bottom: 30px; }
        .form-header h2 { font-size: 2rem; color: var(--text-dark); margin: 0 0 5px; }
        .form-header p { color: var(--text-light); margin: 0; }

        .form-section { margin-bottom: 30px; }
        .section-title { font-size: 1.1rem; color: var(--primary-color); border-bottom: 1px solid rgba(16, 185, 129, 0.3); padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }

        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 18px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        
        .field-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        label { font-size: 0.9rem; font-weight: 600; color: var(--text-dark); }
        .req { color: #ef4444; }
        
        .input-wrap { position: relative; }
        .input-wrap input, .input-wrap select, .input-wrap textarea {
          width: 100%;
          padding: 12px 15px 12px 42px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 0.95rem;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.2s;
          font-family: inherit;
          box-sizing: border-box;
          font-weight: 500;
          cursor: pointer;
        }

        .input-wrap select option {
          background-color: #111;
          color: #fff;
          padding: 10px;
        }

        .input-wrap input::placeholder, .input-wrap textarea::placeholder {
          color: #cbd5e1; /* Better placeholder visibility */
          opacity: 1;
        }

        .input-wrap input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.8;
          cursor: pointer;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          transition: color 0.2s;
        }
        .password-toggle:hover {
          color: #10b981;
        }
        .input-wrap input:focus, .input-wrap select:focus, .input-wrap textarea:focus {
          border-color: var(--primary-color);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
          outline: none;
        }

        .input-wrap .no-icon {
          padding-left: 15px !important;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #10b981;
          font-size: 1.1rem;
          pointer-events: none;
        }
        
        textarea { padding-left: 42px; resize: vertical; min-height: 80px; }
        .map-wrapper { position: relative; border-radius: 16px; overflow: hidden; margin-bottom: 15px; border: 2px solid #e5e7eb; }
        .search-box {
          position: absolute;
          top: 15px; left: 50%; transform: translateX(-50%);
          width: 80%;
          z-index: 10;
          background: white;
          border-radius: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          display: flex; align-items: center;
          padding: 8px 15px;
          border: 1px solid #e5e7eb;
        }
        .search-box input { border: none; background: transparent; width: 100%; margin-left: 10px; font-size: 0.95rem; outline: none; color: #000; }
        .search-box svg { color: #10b981; }

        .full-address-box { display: flex; flex-direction: column; gap: 10px; }
        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .simple-input { padding: 12px !important; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; background: rgba(255, 255, 255, 0.05); color: #fff; font-weight: 500; }

        .range-slider { width: 100%; accent-color: var(--primary-color); cursor: pointer; margin-top: 5px; }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: var(--primary-color);
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.3s;
          margin-top: 10px;
          box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
        }
        .submit-btn:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.5); }
        .submit-btn:disabled { background: #9CA3AF; transform: none; box-shadow: none; cursor: not-allowed; }

        .secure-note { text-align: center; margin-top: 20px; font-size: 0.85rem; color: #6B7280; display: flex; align-items: center; justify-content: center; gap: 6px; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

        @media (max-width: 900px) {
          .inquiry-container { flex-direction: column; max-width: 600px; }
          .left-panel { padding: 40px 30px; text-align: center; }
          .brand-logo { justify-content: center; }
          .feature-list { display: inline-block; text-align: left; }
          .right-panel { padding: 30px 20px; }
          .input-row, .grid-3, .row-2 { grid-template-columns: 1fr; gap: 15px; }
        }
      `}</style>
    </div>
  );
};

export default CompanyInquiry;
