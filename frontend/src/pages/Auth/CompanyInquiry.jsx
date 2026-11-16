import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaBuilding,
  FaPaperPlane,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaCheckCircle,
  FaClipboardList,
  FaCommentDots,
  FaMapMarkerAlt
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { submitInquiry } from "../../services/api";

const CompanyInquiry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || "Free Trial";

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    industryType: "",
    employeeCount: "",
    plan: initialPlan,
    message: ""
  });

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const validate = () => {
    if (!form.companyName || !form.contactPerson || !form.email || !form.mobile || !form.plan) {
      toast.warning("⚠️ Please fill all required fields.");
      return false;
    }
    if (!form.address.trim()) {
      toast.warning("⚠️ Please enter your company address.");
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
      // Send form with default lat/lng=0 (backend will accept)
      await submitInquiry({
        ...form,
        lat: 0,
        lng: 0,
      });
      setSubmitted(true);
      toast.success("Subscription Inquiry Submitted Successfully! 🚀");
      setTimeout(() => navigate("/"), 6000);
    } catch (error) {
      const msg = error?.response?.data?.message || "Server Error. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
              Join thousands of businesses digitizing their workforce with our AI-powered platform.
              Streamline Attendance, Payroll, and Compliance effortlessly.
            </p>
            <div className="feature-list" style={{ marginBottom: '40px' }}>
              <div className="f-item"><FaCheckCircle /> <span>AI Attendance & Facial Regognition</span></div>
              <div className="f-item"><FaCheckCircle /> <span>Automated Payroll & Compliance</span></div>
              <div className="f-item"><FaCheckCircle /> <span>Recruitment & Onboarding</span></div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="form-header">
            <h2>Subscription Inquiry</h2>
            <p>Fill in the details to request access.</p>
          </div>

          {submitted ? (
            <div className="success-screen slide-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="success-icon" style={{ fontSize: '70px', color: '#10b981', marginBottom: '30px' }}>
                <FaCheckCircle />
              </div>
              <h2 style={{ fontSize: '2.4rem', color: '#fff', marginBottom: '20px' }}>Inquiry Received</h2>
              <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px' }}>
                Your subscription inquiry has been submitted successfully. Our team will contact you shortly.
              </p>
              <button onClick={() => navigate("/")} className="submit-btn" style={{ maxWidth: '280px', margin: '0 auto' }}>
                Return to Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-content">
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
                    <label>Selected Plan <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaClipboardList className="field-icon" />
                      <select value={form.plan} onChange={e => setField("plan", e.target.value)} required>
                        <option value="Free Trial">Free Trial</option>
                        <option value="Quarterly Plan">Quarterly Plan</option>
                        <option value="Annual Plan">Annual Plan</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: '18px' }}>
                  <label>Company Address <span className="req">*</span></label>
                  <div className="input-wrap">
                    <FaMapMarkerAlt className="field-icon" />
                    <input type="text" placeholder="e.g. 123 Business Park, Mumbai, Maharashtra" value={form.address} onChange={e => setField("address", e.target.value)} required />
                  </div>
                </div>

                <div className="input-row">
                  <div className="field-group">
                    <label>City</label>
                    <div className="input-wrap">
                      <FaBuilding className="field-icon" />
                      <input type="text" placeholder="e.g. Mumbai" value={form.city} onChange={e => setField("city", e.target.value)} />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>State</label>
                    <div className="input-wrap">
                      <FaBuilding className="field-icon" />
                      <input type="text" placeholder="e.g. Maharashtra" value={form.state} onChange={e => setField("state", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="field-group">
                    <label>Industry Type</label>
                    <div className="input-wrap">
                      <FaClipboardList className="field-icon" />
                      <select value={form.industryType} onChange={e => setField("industryType", e.target.value)}>
                        <option value="">Select Industry</option>
                        <option value="IT & Software">IT &amp; Software</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance & Banking">Finance &amp; Banking</option>
                        <option value="Education">Education</option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Construction">Construction</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Employee Count</label>
                    <div className="input-wrap">
                      <FaUserTie className="field-icon" />
                      <select value={form.employeeCount} onChange={e => setField("employeeCount", e.target.value)}>
                        <option value="">Select Range</option>
                        <option value="1-10">1–10</option>
                        <option value="11-50">11–50</option>
                        <option value="51-200">51–200</option>
                        <option value="201-500">201–500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="input-row">
                  <div className="field-group">
                    <label>Contact Person <span className="req">*</span></label>
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
                  <label>Registered Company Email <span className="req">*</span></label>
                  <div className="input-wrap">
                    <FaEnvelope className="field-icon" />
                    <input type="email" placeholder="hr@company.com" value={form.email} onChange={e => setField("email", e.target.value)} required />
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: '18px' }}>
                  <label>Optional Message</label>
                  <div className="input-wrap">
                    <FaCommentDots className="field-icon" style={{ top: '25px' }} />
                    <textarea placeholder="Any specific requirements?" value={form.message} onChange={e => setField("message", e.target.value)}></textarea>
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Processing..." : <>Submit Inquiry <FaPaperPlane /></>}
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

        .left-panel {
          flex: 0.8;
          background: #111827;
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
        }
        .input-wrap select option { background-color: #111; color: #fff; padding: 10px; }
        .input-wrap input::placeholder, .input-wrap textarea::placeholder { color: #6b7280; }
        .input-wrap input:focus, .input-wrap select:focus, .input-wrap textarea:focus { border-color: var(--primary-color); background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); outline: none; }
        .field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #10b981; font-size: 1.1rem; pointer-events: none; }
        textarea { padding-left: 42px; resize: vertical; min-height: 100px; }
        
        .submit-btn { width: 100%; padding: 16px; background: var(--primary-color); color: white; font-size: 1.1rem; font-weight: 700; border: none; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; margin-top: 10px; box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4); }
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
          .input-row { grid-template-columns: 1fr; gap: 15px; }
        }
      `}</style>
    </div>
  );
};

export default CompanyInquiry;
