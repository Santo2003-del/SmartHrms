import React from 'react';
import {
  FaFingerprint, FaMapMarkedAlt, FaFileInvoice, FaMobile,
  FaCogs, FaChartPie, FaBolt, FaLock, FaSync, FaShieldAlt,
  FaArrowRight, FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Features = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="features-page" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#050505", overflowX: "hidden", color: "#ffffff" }}>
      {/* --- HERO SECTION --- */}
      <section style={{ padding: "120px 0 80px", textAlign: "center", background: "#050505", position: "relative" }}>
        {/* Neon Glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "rgba(0, 198, 255, 0.05)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 2 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span style={{
              background: "rgba(0, 255, 157, 0.1)",
              color: "#00ff9d",
              padding: "8px 18px",
              borderRadius: "50px",
              fontWeight: "800",
              fontSize: "0.75rem",
              letterSpacing: "1px",
              border: "1px solid rgba(0, 255, 157, 0.2)"
            }}>
              PLATFORM CAPABILITIES
            </span>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", margin: "25px 0", letterSpacing: "-2px", color: "#ffffff", lineHeight: "1.1" }}>
              Powerful Features for <span style={{ color: "#00ff9d" }}>Infinite</span> Growth
            </h1>
            <p style={{ fontSize: "1.25rem", color: "#94a3b8", maxWidth: "700px", margin: "0 auto", lineHeight: "1.6" }}>
              SmartHrms combines artificial intelligence with human-centric design
              to provide tools that don't just track work, but improve it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURE DEEP DIVE (BIG SECTIONS) --- */}
      <section style={{ padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>

          {/* Feature 1: AI Biometrics */}
          <div className="dive-row">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="dive-text"
            >
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "25px",
                background: "rgba(0, 255, 157, 0.1)",
                color: "#00ff9d",
                border: "1px solid rgba(0, 255, 157, 0.2)",
                boxShadow: "0 0 15px rgba(0, 255, 157, 0.1)"
              }}>
                <FaFingerprint />
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "20px", fontWeight: "800", color: "#ffffff" }}>Advanced <span style={{ color: "#00ff9d" }}>AI Biometric</span> Verification</h2>
              <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: "1.7", marginBottom: "25px" }}>
                Say goodbye to proxy attendance. Our system analyzes 128 unique facial landmarks
                to verify identity with 99.9% accuracy, even in low-light conditions.
              </p>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {["Anti-Spoofing Technology", "Liveness Detection (Prevents Photo-Punches)", "Instant Recognition (< 0.5s)"].map((item, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "700", color: "#e2e8f0", marginBottom: "12px", fontSize: "1rem" }}>
                    <FaCheckCircle style={{ color: "#00ff9d" }} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="dive-visual"
            >
              <img src="https://images.unsplash.com/photo-1555664424-778a1e5e1b48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="AI Biometrics" style={{ width: "100%", borderRadius: "24px", boxShadow: "0 0 50px rgba(0, 255, 157, 0.1)", border: "1px solid rgba(0, 255, 157, 0.2)", filter: "brightness(0.8) contrast(1.2)" }} />
            </motion.div>
          </div>

          {/* Feature 2: Geo-Fencing */}
          <div className="dive-row reverse" style={{ marginTop: "100px" }}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="dive-text"
            >
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "25px",
                background: "rgba(220, 38, 38, 0.1)",
                color: "#ff4d4d",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                boxShadow: "0 0 15px rgba(220, 38, 38, 0.1)"
              }}>
                <FaMapMarkedAlt />
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "20px", fontWeight: "800", color: "#ffffff" }}>Dynamic <span style={{ color: "#ff4d4d" }}>Geo-Fencing</span> Security</h2>
              <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: "1.7", marginBottom: "25px" }}>
                Define virtual boundaries around your multiple office branches.
                Employees can only punch in when they are physically present inside the designated zone.
              </p>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {["Multi-Branch Location Support", "GPS Coordinate Tracking", "Custom Radius Definition (50m - 500m)"].map((item, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "700", color: "#e2e8f0", marginBottom: "12px", fontSize: "1rem" }}>
                    <FaCheckCircle style={{ color: "#ff4d4d" }} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="dive-visual"
            >
              <img src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="GPS Tracking" style={{ width: "100%", borderRadius: "24px", boxShadow: "0 0 50px rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.2)", filter: "brightness(0.8) contrast(1.2)" }} />
            </motion.div>
          </div>

          {/* Feature 3: Smart Payroll */}
          <div className="dive-row" style={{ marginTop: "100px" }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="dive-text"
            >
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "25px",
                background: "rgba(22, 163, 74, 0.1)",
                color: "#4ade80",
                border: "1px solid rgba(22, 163, 74, 0.2)",
                boxShadow: "0 0 15px rgba(22, 163, 74, 0.1)"
              }}>
                <FaFileInvoice />
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "20px", fontWeight: "800", color: "#ffffff" }}>Integrated <span style={{ color: "#4ade80" }}>Payroll</span> Automation</h2>
              <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: "1.7", marginBottom: "25px" }}>
                Directly link attendance logs to salary processing. Calculate overtime,
                late marks, and leave deductions automatically every month.
              </p>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {["Statutory Compliance (PF/ESI)", "Custom Allowance Management", "One-Click Payslip Generation"].map((item, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "700", color: "#e2e8f0", marginBottom: "12px", fontSize: "1rem" }}>
                    <FaCheckCircle style={{ color: "#4ade80" }} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="dive-visual"
            >
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Payroll Data" style={{ width: "100%", borderRadius: "24px", boxShadow: "0 0 50px rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)", filter: "brightness(0.8) contrast(1.2)" }} />
            </motion.div>
          </div>

        </div>
      </section>

      {/* --- GRID: ADDITIONAL HIGHLIGHTS --- */}
      <section style={{ padding: "100px 0", background: "#080808", borderTop: "1px solid #111" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "70px" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#ffffff" }}>Small Details, <span style={{ color: "#00c6ff" }}>Big Impact</span></h2>
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", marginTop: "10px" }}>Every tool you need to manage your workforce professionally.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
            {[
              { icon: FaMobile, title: "Mobile Portal", text: "Dedicated access for employees to view history and apply for leaves." },
              { icon: FaSync, title: "Real-time Sync", text: "Data updates instantly across SuperAdmin and HR dashboards." },
              { icon: FaChartPie, title: "Analytics Pro", text: "Visual charts and reports to track company performance trends." },
              { icon: FaLock, title: "Data Encryption", text: "AES-256 bit encryption ensures employee data is always private." }
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10, borderBottomColor: "#00c6ff", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                style={{
                  padding: "40px",
                  background: "#111",
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderBottom: "4px solid transparent",
                  transition: "all 0.3s"
                }}
              >
                <feat.icon style={{ fontSize: "2rem", color: "#00ff9d", marginBottom: "20px", filter: "drop-shadow(0 0 5px #00ff9d)" }} />
                <h4 style={{ marginBottom: "10px", fontSize: "1.2rem", fontWeight: "700", color: "#ffffff" }}>{feat.title}</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.6" }}>{feat.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TECH STACK BANNER --- */}
      <section style={{ padding: "60px 0", background: "#000", color: "#fff", borderTop: "1px solid #111" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <FaBolt style={{ color: "#f59e0b" }} /> Built on Industry Standard Cloud Infrastructure
          </h3>
          <div style={{ fontWeight: "800", color: "#64748b", letterSpacing: "2px", fontSize: "0.9rem", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px" }}>
            <span>MERN STACK</span> • <span>AWS S3</span> • <span>FACE-API.JS</span> • <span>MONGODB ATLAS</span>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section style={{ padding: "120px 0", background: "#050505", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(135deg, #0a0a0a, #111)",
            padding: "80px 40px",
            borderRadius: "40px",
            maxWidth: "900px",
            margin: "0 auto",
            border: "1px solid #222",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
          }}
        >
          <h2 style={{ fontSize: "2.8rem", fontWeight: "900", marginBottom: "20px", color: "#ffffff" }}>Experience the <span style={{ color: "#00ff9d" }}>Next-Gen</span> HRMS</h2>
          <p style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: "40px" }}>Take the first step towards an automated organization today.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 255, 157, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "#00ff9d",
                  color: "#000",
                  padding: "18px 40px",
                  borderRadius: "16px",
                  fontWeight: "800",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem"
                }}
              >
                Contact Sales <FaArrowRight />
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  border: "1px solid #fff",
                  background: "transparent",
                  color: "#fff",
                  padding: "18px 40px",
                  borderRadius: "16px",
                  fontWeight: "800",
                  textDecoration: "none",
                  fontSize: "1.1rem",
                  cursor: "pointer"
                }}
              >
                Register Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      <style>{`
        .dive-row { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .dive-row.reverse { direction: rtl; }
        .dive-row.reverse .dive-text { direction: ltr; }
        
        @media (max-width: 1024px) {
          .dive-row { grid-template-columns: 1fr; gap: 50px; text-align: center; }
          .dive-visual { order: -1; }
          .dive-row.reverse { direction: ltr; }
        }
      `}</style>
    </div>
  );
};

export default Features;