import React from 'react';
import {
  FaHistory, FaRocket, FaEye, FaMicrochip, FaShieldAlt,
  FaUsers, FaAward, FaHandshake, FaGlobe, FaLightbulb, FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="about-wrapper" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#050505", color: "#ffffff", overflowX: "hidden" }}>
      {/* --- HERO SECTION: MISSION & VISION --- */}
      <section style={{ padding: "120px 0 80px", background: "#050505", textAlign: "center", position: "relative" }}>
        {/* Neon Glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "rgba(0, 198, 255, 0.05)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 2 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="hero-content">
            <span style={{
              background: "rgba(0, 255, 157, 0.1)",
              color: "#00ff9d",
              padding: "8px 20px",
              borderRadius: "50px",
              fontWeight: "800",
              fontSize: "0.75rem",
              letterSpacing: "1px",
              border: "1px solid rgba(0, 255, 157, 0.2)"
            }}>
              OUR JOURNEY
            </span>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", margin: "25px 0", letterSpacing: "-2px", lineHeight: "1.1", color: "#ffffff" }}>
              Digitizing Human Capital with <span style={{ color: "#00ff9d" }}>AI Precision</span>
            </h1>
            <p style={{ maxWidth: "800px", margin: "0 auto", fontSize: "1.25rem", color: "#94a3b8", lineHeight: "1.6" }}>
              SmartHrms was born out of a simple vision: To eliminate the friction between
              workforce management and modern technology. We are not just a software;
              we are the digital backbone of high-performing organizations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CORE STATS: TRUST SIGNALS --- */}
      <div style={{ background: "#0a0a0a", display: "flex", flexWrap: "wrap", justifyContent: "space-around", padding: "60px 5%", color: "#fff", textAlign: "center", gap: "30px", borderTop: "1px solid #111", borderBottom: "1px solid #111" }}>
        {[
          { val: "2018", label: "Year Founded" },
          { val: "500+", label: "Global Clients" },
          { val: "150+", label: "AI Engineers" },
          { val: "Zero", label: "Data Breaches" }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="stat-node"
          >
            <strong style={{ fontSize: "2.5rem", color: "#00ff9d", display: "block", marginBottom: "5px" }}>{stat.val}</strong>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase" }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* --- OUR IDENTITY (IMAGE + TEXT) --- */}
      <section style={{ padding: "100px 5%" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "80px", alignItems: "center" }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Our Team Working"
                style={{ width: "100%", borderRadius: "24px", boxShadow: "0 0 40px rgba(0, 255, 157, 0.1)", border: "1px solid rgba(0, 255, 157, 0.2)", filter: "brightness(0.8) contrast(1.2)" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "25px", color: "#ffffff" }}>
                Driven by <span style={{ color: "#00ff9d" }}>Integrity</span> & Innovation
              </h2>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#94a3b8", marginBottom: "30px" }}>
                At SmartHrms, we believe that every second of work matters. Our team of data scientists and
                HR experts work tirelessly to ensure that our biometric algorithms provide the
                highest level of accuracy in the SaaS industry.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {[
                  "Biometric Excellence", "Data Sovereignty", "User-Centric Design"
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "700", color: "#e2e8f0", fontSize: "1.1rem" }}>
                    <FaCheckCircle style={{ color: "#00ff9d" }} /> <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- THE THREE PILLARS --- */}
      <section style={{ padding: "100px 0", background: "#0a0a0a", borderTop: "1px solid #111" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}
          >
            {[
              { icon: FaRocket, title: "Our Mission", text: "To empower 10,000+ organizations by 2030 with seamless, transparent, and AI-driven HR operations.", color: "#00ff9d" },
              { icon: FaEye, title: "Our Vision", text: "To become the world's most trusted biometric SaaS ecosystem, redefining how humans interact with workplace data.", color: "#00ff9d" },
              { icon: FaLightbulb, title: "Core Values", text: "Innovation, Transparency, and Security are the three DNA strands of every line of code we write.", color: "#00ff9d" }
            ].map((pillar, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -10, boxShadow: `0 0 30px ${pillar.color}20`, borderColor: pillar.color }}
                style={{
                  background: "#111",
                  padding: "50px 40px",
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  textAlign: "center",
                  transition: "all 0.3s"
                }}
              >
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `${pillar.color}10`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 30px"
                }}>
                  <pillar.icon style={{ fontSize: "2.5rem", color: pillar.color, filter: `drop-shadow(0 0 10px ${pillar.color})` }} />
                </div>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#ffffff", fontWeight: "800" }}>{pillar.title}</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>{pillar.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- TECH ARCHITECTURE --- */}
      <section style={{ padding: "100px 5%" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "60px",
              alignItems: "center",
              background: "#111",
              borderRadius: "40px",
              padding: "80px",
              color: "#fff",
              border: "1px solid #222",
              boxShadow: "0 0 50px rgba(0,0,0,0.5)"
            }}
          >
            <div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "20px" }}>
                The Technology Behind the <span style={{ color: "#00ff9d" }}>Face-AI</span>
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#94a3b8", lineHeight: "1.7", marginBottom: "40px" }}>
                Our system uses 128-point facial landmarking. This means we don't store
                your actual photo; we store a mathematical descriptor that is
                impossible to reverse-engineer. Security isn't an option; it's our foundation.
              </p>
              <div style={{ display: "grid", gap: "20px" }}>
                {[
                  { icon: FaShieldAlt, text: "AES-256 Cloud Encryption" },
                  { icon: FaMicrochip, text: "Real-time Liveness Detection" },
                  { icon: FaGlobe, text: "Multi-Region Data Hosting" }
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "15px", fontWeight: "600", color: "#e2e8f0" }}>
                    <feat.icon style={{ color: "#00ff9d" }} /> {feat.text}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Cyber Security" style={{ width: "100%", borderRadius: "24px", boxShadow: "0 0 40px rgba(0, 198, 255, 0.2)", filter: "brightness(0.9) contrast(1.1)" }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- CTA: FINAL TOUCH --- */}
      <section style={{ padding: "120px 0 80px", textAlign: "center", background: "#050505", position: "relative" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: "900", marginBottom: "20px", color: "#ffffff" }}>
            Building the <span style={{ color: "#00ff9d" }}>Future</span> Together
          </h2>
          <p style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: "40px" }}>
            Join the revolution and bring SmartHrms to your organization today.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 255, 157, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "#00ff9d",
                  color: "#000",
                  padding: "18px 40px",
                  borderRadius: "15px",
                  fontWeight: "800",
                  textDecoration: "none",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem"
                }}
              >
                Become a Partner
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  border: "2px solid #fff",
                  color: "#fff",
                  padding: "18px 40px",
                  borderRadius: "15px",
                  fontWeight: "800",
                  textDecoration: "none",
                  background: "transparent",
                  fontSize: "1.1rem",
                  cursor: "pointer"
                }}
              >
                Free Product Tour
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .tech-container { padding: 40px !important; }
        }
      `}</style>
    </div>
  );
};

export default About;