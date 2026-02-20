import React, { useState, useEffect, useRef, useMemo } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { registerEmployee, getActiveCompanies } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import {
  FaCamera,
  FaCheckCircle,
  FaRedo,
  FaIdCard,
  FaUserTie,
  FaLock,
  FaBuilding,
  FaSpinner,
  FaSyncAlt,
  FaArrowRight,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaImage
} from "react-icons/fa";
import { readEnv } from "../../utils/env";

const Register = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    designation: "",
    companyId: "",
  });

  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  const [profileImage, setProfileImage] = useState(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);

  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scannedImage, setScannedImage] = useState(null);

  const [facingMode, setFacingMode] = useState("user");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const MODEL_URL = useMemo(() => {
    return (
      readEnv("VITE_FACE_MODEL_URL") ||
      readEnv("REACT_APP_FACE_MODEL_URL") ||
      "https://justadudewhohacks.github.io/face-api.js/models"
    );
  }, []);

  const videoConstraints = useMemo(() => ({ facingMode }), [facingMode]);

  const loadModels = async () => {
    setModelLoading(true);
    setModelsLoaded(false);
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (err) {
      console.error(err);
      toast.error("Face models failed to load. Check your internet connection.");
      setModelsLoaded(false);
    } finally {
      setModelLoading(false);
    }
  };

  const loadCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const res = await getActiveCompanies();
      const data = res?.data;

      const list =
        Array.isArray(data) ? data :
          Array.isArray(data?.companies) ? data.companies :
            Array.isArray(data?.data) ? data.data : [];

      setCompanies(list);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load companies list.");
      setCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MODEL_URL]);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfileImage(file);
  };

  const handleFaceScan = async () => {
    if (!modelsLoaded) return toast.warning("Models are loading. Please wait.");
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return toast.error("Camera capture failed");

    const img = new Image();
    img.src = imageSrc;

    img.onload = async () => {
      try {
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          toast.error("No face detected. Keep your face centered in good lighting.");
          return;
        }

        setFaceDescriptor(Array.from(detection.descriptor));
        setScannedImage(imageSrc);
        setIsCameraOpen(false);
        toast.success("Biometrics Captured Successfully");

        // Auto-advance to next step
        setTimeout(() => setStep(2), 800);
      } catch (e) {
        toast.error("Face scan error. Please try again.");
      }
    };
  };

  const resetFace = () => {
    setScannedImage(null);
    setFaceDescriptor(null);
    setIsCameraOpen(true);
  };

  const validate = () => {
    if (!formData.companyId) return toast.warning("Please select your Organization"), false;
    if (!faceDescriptor) return toast.warning("Face Scan is mandatory"), false;
    if (!profileImage) return toast.warning("Profile Photo is required"), false;

    if ((formData.password || "").length < 6) {
      toast.warning("Password must be at least 6 characters");
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
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));

      data.append("image", profileImage);
      data.append("faceDescriptor", JSON.stringify(faceDescriptor));

      await registerEmployee(data);

      toast.success("Registration Successful! Please Login.");
      navigate("/employee-login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-reg-page">
      {/* Background ambient shapes */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="dark-reg-container slide-up">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="panel-content">
            <div className="brand-logo">
              <FaBuilding /> <span>SmartHRMS</span>
            </div>
            <h1>Join the Future of Work</h1>
            <p>
              Experience seamless onboarding with our secure biometric registration system.
              Empowering your organization with advanced identity verification.
            </p>

            <div className="feature-list" style={{ marginBottom: '40px' }}>
              <div className="f-item"><FaCheckCircle /> <span>AI-Powered Face Recognition</span></div>
              <div className="f-item"><FaCheckCircle /> <span>Secure Profile Management</span></div>
              <div className="f-item"><FaCheckCircle /> <span>Automated Attendance</span></div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=2070&auto=format&fit=crop"
              alt="Digital Workplace"
              className="splash-img"
            />
          </div>
        </div>

        {/* RIGHT PANEL (Form) */}
        <div className="right-panel">
          <div className="form-header">
            <h2>Employee Registration</h2>
            <p>Complete your profile to finish onboarding.</p>
          </div>

          <div className="stepper">
            <div className={`step ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
              <div className="step-circle">1</div>
              <span>Biometrics</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`} onClick={() => faceDescriptor ? setStep(2) : toast.warn("Complete Biometrics first")}>
              <div className="step-circle">2</div>
              <span>Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-content">

            {/* STEP 1: Biometrics */}
            <div className={`step-content fade-in ${step === 1 ? 'active' : 'hidden'}`}>
              <div className="form-section">
                <h3 className="section-title">Facial Verification</h3>
                <p className="section-sub">Ensure your face is clearly visible to register your biometrics securely.</p>

                <div className="camera-box">
                  {modelLoading ? (
                    <div className="loading-state">
                      <FaSpinner className="spin" />
                      <span>Initializing AI Models...</span>
                    </div>
                  ) : !modelsLoaded ? (
                    <div className="error-state">
                      <p>Failed to load AI models. Please check your connection.</p>
                      <button type="button" className="btn-secondary" onClick={loadModels}>Retry</button>
                    </div>
                  ) : scannedImage ? (
                    <div className="scanned-result">
                      <div className="image-ring">
                        <img src={scannedImage} alt="Scanned Profile" />
                        <div className="success-badge"><FaCheckCircle /></div>
                      </div>
                      <p className="success-text">Identity Captured Successfully</p>
                      <div className="action-buttons">
                        <button type="button" className="btn-secondary" onClick={resetFace}>
                          <FaRedo /> Retake
                        </button>
                        <button type="button" className="submit-btn" style={{ margin: 0, width: 'auto' }} onClick={() => setStep(2)}>
                          Continue <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  ) : isCameraOpen ? (
                    <div className="active-camera text-center">
                      <div className="camera-frame">
                        <Webcam
                          ref={webcamRef}
                          audio={false}
                          screenshotFormat="image/jpeg"
                          className="webcam-feed"
                          videoConstraints={videoConstraints}
                        />
                        <div className="scan-overlay"></div>
                      </div>
                      <div className="camera-controls">
                        <button type="button" className="btn-camera-switch" onClick={() => setFacingMode((m) => (m === "user" ? "environment" : "user"))}>
                          <FaSyncAlt />
                        </button>
                        <button type="button" className="btn-capture" onClick={handleFaceScan}>
                          <div className="capture-inner"></div>
                        </button>
                      </div>
                      <p className="cam-hint">Position your face within the frame</p>
                    </div>
                  ) : (
                    <div className="start-camera-state">
                      <div className="icon-wrapper">
                        <FaCamera />
                      </div>
                      <h4>Provide Face Biometrics</h4>
                      <p>Used for daily attendance and secure access.</p>
                      <button type="button" className="submit-btn" style={{ marginTop: '20px' }} onClick={() => setIsCameraOpen(true)}>
                        Start Camera
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 2: Details */}
            <div className={`step-content slide-up ${step === 2 ? 'active' : 'hidden'}`}>
              <div className="form-section">
                <h3 className="section-title">Personal Details</h3>

                <div className="field-group" style={{ marginBottom: '18px' }}>
                  <label>Select Organization <span className="req">*</span></label>
                  <div className="input-wrap">
                    <FaBuilding className="field-icon" />
                    <select
                      name="companyId"
                      value={formData.companyId}
                      onChange={(e) => setField("companyId", e.target.value)}
                      required
                      disabled={companiesLoading}
                    >
                      <option value="">{companiesLoading ? "Loading..." : "Choose Organization"}</option>
                      {companies.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.companyName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-row">
                  <div className="field-group">
                    <label>Full Name <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaUserTie className="field-icon" />
                      <input type="text" placeholder="John Doe" value={formData.name} onChange={e => setField("name", e.target.value)} required />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Official Email <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaEnvelope className="field-icon" />
                      <input type="email" placeholder="john@company.com" value={formData.email} onChange={e => setField("email", e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="field-group">
                    <label>Mobile Number <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaPhone className="field-icon" />
                      <input type="tel" placeholder="+91 " value={formData.mobile} onChange={e => setField("mobile", e.target.value)} required />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Designation <span className="req">*</span></label>
                    <div className="input-wrap">
                      <FaBriefcase className="field-icon" />
                      <input type="text" placeholder="Software Engineer" value={formData.designation} onChange={e => setField("designation", e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: '18px' }}>
                  <label>Password <span className="req">*</span></label>
                  <div className="input-wrap">
                    <FaLock className="field-icon" />
                    <input type="password" placeholder="••••••••" value={formData.password} onChange={e => setField("password", e.target.value)} required />
                  </div>
                </div>

                <div className="field-group">
                  <label>Profile Photo <span className="req">*</span></label>
                  <div className="file-upload-wrapper">
                    <input type="file" id="profile-upload" accept="image/*" onChange={handleFileChange} required className="hidden-input" />
                    <label htmlFor="profile-upload" className="file-upload-box">
                      {profileImage ? (
                        <span className="file-selected"><FaCheckCircle className="text-green" style={{ marginRight: '8px' }} /> {profileImage.name}</span>
                      ) : (
                        <span><FaImage style={{ marginRight: '8px', color: '#10b981' }} /> Select a photo for your ID card</span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="form-actions mt-6" style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 0.3 }} onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="submit-btn" style={{ margin: 0, flex: 1 }} disabled={loading}>
                    {loading ? <><FaSpinner className="spin" /> Processing...</> : "Complete Registration"}
                  </button>
                </div>

              </div>
            </div>

          </form>

          <p className="login-link text-center" style={{ marginTop: '25px', color: '#94a3b8', fontSize: '0.95rem' }}>
            Already have an account? <Link to="/employee-login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
          </p>

        </div>
      </div>

      <style>{`
        /* Reuse Partner With Us Theme */
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        :root {
          --primary-color: #10b981;
          --primary-dark: #059669;
          --bg-color: #050505;
          --glass-bg: rgba(15, 15, 15, 0.9);
          --glass-border: rgba(16, 185, 129, 0.2);
          --text-dark: #ffffff;
          --text-light: #94a3b8;
        }

        .hidden { display: none !important; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .dark-reg-page {
          min-height: 100vh;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px 60px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        /* Ambient Background Elements */
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

        .dark-reg-container {
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
        
        .splash-img {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          opacity: 0.8;
          margin-top: 10px;
        }

        /* Right Panel */
        .right-panel {
          flex: 1.2;
          padding: 50px;
          overflow-y: auto;
          max-height: 85vh;
        }

        .form-header { margin-bottom: 30px; text-align: center; }
        .form-header h2 { font-size: 2rem; color: var(--text-dark); margin: 0 0 5px; }
        .form-header p { color: var(--text-light); margin: 0; }

        /* Stepper */
        .stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 35px;
          padding: 0 10%;
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          opacity: 0.4;
          transition: 0.3s ease;
        }
        .step.active { opacity: 1; }
        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          color: var(--text-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          transition: 0.3s ease;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .step.active .step-circle {
          background: rgba(16, 185, 129, 0.15);
          color: var(--primary-color);
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .step span { font-weight: 600; font-size: 0.85rem; color: var(--text-dark); }
        .step-line {
          flex: 1;
          height: 2px;
          background: rgba(255,255,255,0.1);
          margin: 0 20px;
          position: relative;
          top: -10px;
          border-radius: 2px;
        }

        /* Camera Box */
        .form-section { margin-bottom: 30px; }
        .section-title { font-size: 1.1rem; color: var(--primary-color); border-bottom: 1px solid rgba(16, 185, 129, 0.3); padding-bottom: 8px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
        .section-sub { color: var(--text-light); font-size: 0.95rem; margin-bottom: 20px; }

        .camera-box {
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 2rem;
          min-height: 340px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: 0.3s;
        }

        .start-camera-state { text-align: center; }
        .icon-wrapper {
          width: 70px; height: 70px;
          background: rgba(16,185,129,0.1);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; color: var(--primary-color);
          margin: 0 auto 1rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          border: 1px solid rgba(16,185,129,0.2);
        }
        .start-camera-state h4 { font-size: 1.1rem; font-weight: 700; margin: 0 0 4px 0; color: var(--text-dark); }
        .start-camera-state p { font-size: 0.9rem; color: var(--text-light); margin: 0; }

        .active-camera { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; }
        .camera-frame {
          position: relative;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--primary-color);
          box-shadow: 0 10px 30px rgba(16,185,129,0.2);
          margin-bottom: 1rem;
        }
        .webcam-feed { width: 100%; height: 100%; object-fit: cover; }
        .scan-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.2) 50%, transparent 100%);
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        .camera-controls { display: flex; align-items: center; gap: 1rem; margin-bottom: 10px; }
        .btn-capture {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.5);
          padding: 4px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-capture:hover { border-color: var(--primary-color); }
        .capture-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: var(--primary-color);
          transition: 0.2s;
        }
        .btn-capture:hover .capture-inner { transform: scale(0.9); }
        .btn-camera-switch {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; cursor: pointer;
        }
        .btn-camera-switch:hover { color: var(--primary-color); border-color: var(--primary-color); }
        .cam-hint { font-size: 0.85rem; color: var(--text-light); font-weight: 500; }

        .scanned-result { text-align: center; }
        .image-ring { position: relative; width: 140px; height: 140px; margin: 0 auto 1rem; }
        .image-ring img {
          width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
          border: 3px solid var(--primary-color);
        }
        .success-badge {
          position: absolute; bottom: 4px; right: 4px;
          background: #111827; border-radius: 50%; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; color: var(--primary-color);
        }
        .success-text { font-weight: 700; color: var(--text-dark); font-size: 1.1rem; margin-bottom: 1.5rem; }
        .action-buttons { display: flex; gap: 10px; justify-content: center; }

        /* Form Inputs */
        .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 18px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        label { font-size: 0.9rem; font-weight: 600; color: var(--text-dark); }
        .req { color: #ef4444; }
        
        .input-wrap { position: relative; }
        .input-wrap input, .input-wrap select {
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
        .input-wrap input::placeholder { color: #6b7280; opacity: 1; }
        .input-wrap input:focus, .input-wrap select:focus {
          border-color: var(--primary-color);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
          outline: none;
        }

        .field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #10b981; font-size: 1.1rem; pointer-events: none;
        }

        /* File Upload */
        .hidden-input { display: none; }
        .file-upload-box {
          display: flex; align-items: center; justify-content: center;
          padding: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px dashed rgba(255,255,255,0.2);
          border-radius: 12px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-light);
          transition: 0.2s;
        }
        .file-upload-box:hover { border-color: var(--primary-color); color: white; background: rgba(16,185,129,0.05); }
        .file-selected { display: flex; align-items: center; color: white; }

        /* Buttons */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: var(--primary-color);
          color: white;
          font-size: 1.05rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
        }
        .submit-btn:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.5); }
        .submit-btn:disabled { background: #9CA3AF; transform: none; box-shadow: none; cursor: not-allowed; }

        .btn-secondary {
          background: rgba(255,255,255,0.05);
          color: white;
          padding: 12px 20px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: 0.2s ease;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }

        /* Animations */
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        /* Responsive */
        @media (max-width: 900px) {
          .dark-reg-container { flex-direction: column; max-width: 600px; }
          .left-panel { padding: 40px 30px; text-align: center; }
          .brand-logo { justify-content: center; }
          .feature-list { display: inline-block; text-align: left; }
          .right-panel { padding: 30px 20px; }
          .input-row { grid-template-columns: 1fr; gap: 15px; }
          .stepper { padding: 0; }
        }
      `}</style>
    </div>
  );
};

export default Register;
