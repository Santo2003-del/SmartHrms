import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFingerprint, FaMoneyCheckAlt, FaMapMarkedAlt, FaChartLine, FaCogs, FaHeadset,
  FaCheckCircle, FaQuoteLeft, FaAws, FaMicrosoft, FaBook
} from "react-icons/fa";
import { SiZoom, SiQuickbooks, SiSalesforce, SiAsana, SiSlack, SiGoogle } from "react-icons/si";

// --- Assets / Placeholders (High Quality) ---
const heroImage = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop";
const aboutImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop";
const featureImg1 = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"; // Biometrics / Cyber
const featureImg2 = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"; // Analytics / Dashboard

const Home = () => {
  // --- Animation Variants ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden", backgroundColor: "#050505", color: "#ffffff" }}>

      {/* =========================================================
          HERO SECTION (Dark Neon Theme)
         ========================================================= */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "#050505",
        overflow: "visible",
        paddingTop: "120px",
        paddingBottom: "100px"
      }}>
        {/* Neon Grid Pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 157, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 157, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(circle at 50% 50%, black, transparent 80%)",
          zIndex: 0
        }} />

        {/* Ambient Glows */}
        <div style={{ position: "absolute", top: "15%", right: "15%", width: "500px", height: "500px", background: "rgba(0, 255, 157, 0.15)", borderRadius: "50%", filter: "blur(150px)", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "600px", height: "600px", background: "rgba(0, 198, 255, 0.1)", borderRadius: "50%", filter: "blur(180px)", zIndex: 0 }} />

        <div className="container" style={{ width: "95%", maxWidth: "1440px", margin: "0 auto", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "2rem", alignItems: "center" }}>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} style={{ marginBottom: "2.5rem" }}>
              <div style={{
                background: "rgba(0, 255, 157, 0.05)",
                color: "#00ff9d",
                border: "1px solid rgba(0, 255, 157, 0.2)",
                padding: "10px 24px",
                borderRadius: "100px",
                fontSize: "0.8rem",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 0 30px rgba(0, 255, 157, 0.1)"
              }}>
                <span style={{ width: "8px", height: "8px", background: "#00ff9d", borderRadius: "50%", boxShadow: "0 0 10px #00ff9d" }}></span>
                Global Market Vision
              </div>
            </motion.div>

            <motion.h1 variants={fadeInUp} style={{
              fontSize: "clamp(3.5rem, 6vw, 5.2rem)",
              fontWeight: "900",
              lineHeight: "1.05",
              marginBottom: "2rem",
              color: "#fff",
              letterSpacing: "-2px"
            }}>
              The AI-Powered <br />
              <span style={{
                background: "linear-gradient(135deg, #00ff9d 0%, #00c6ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(0, 255, 157, 0.2))"
              }}>Workforce OS.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} style={{ fontSize: "1.25rem", color: "#94a3b8", lineHeight: "1.7", marginBottom: "3.5rem", maxWidth: "620px", fontWeight: "500" }}>
              Experience the next generation of HR. Real-time biometrics, automated payroll, and predictive people analytics—all in one intelligent ecosystem.
            </motion.p>

            <motion.div variants={fadeInUp} className="hero-btns" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <Link to="/partner-with-us" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0, 255, 157, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: "20px 48px",
                    background: "#00ff9d",
                    color: "#000",
                    border: "none",
                    borderRadius: "16px",
                    fontSize: "1.1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    transition: "all 0.3s ease"
                  }}
                >
                  Get Started
                </motion.button>
              </Link>
              <Link to="/contact" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: "20px 48px",
                    background: "rgba(255,255,255,0.03)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease"
                  }}
                >
                  Book Demo
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ position: "relative" }}
          >
            {/* Image Container with Floating Effect */}
            <div style={{
              position: "relative",
              zIndex: 1,
              padding: "1px",
              borderRadius: "32px",
              background: "linear-gradient(135deg, rgba(0, 255, 157, 0.4), rgba(0, 198, 255, 0.4))",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 100px rgba(0, 255, 157, 0.1)"
            }}>
              <div style={{ position: "relative", borderRadius: "31px", overflow: "hidden", background: "#000" }}>
                <img src={heroImage} alt="Dashboard UI" style={{ width: "100%", display: "block", opacity: 0.9 }} />

                {/* Overlay Scanning Effect */}
                <motion.div
                  animate={{ top: ["-100%", "200%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: "150px",
                    background: "linear-gradient(to bottom, transparent, rgba(0, 255, 157, 0.05), transparent)",
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            {/* Premium Stat Badges */}
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "15%",
                left: "-12%",
                zIndex: 3,
                background: "rgba(10, 10, 10, 0.8)",
                backdropFilter: "blur(12px)",
                padding: "24px",
                borderRadius: "24px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                minWidth: "160px"
              }}
            >
              <div style={{ fontSize: "2.4rem", fontWeight: "900", color: "#00ff9d", lineHeight: 1, marginBottom: "4px" }}>98.7%</div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Accuracy</div>
            </motion.div>

            <motion.div
              animate={{ y: [15, -15, 15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: "20%",
                right: "-10%",
                zIndex: 3,
                background: "rgba(10, 10, 10, 0.8)",
                backdropFilter: "blur(12px)",
                padding: "24px",
                borderRadius: "24px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                minWidth: "160px"
              }}
            >
              <div style={{ fontSize: "2.4rem", fontWeight: "900", color: "#00c6ff", lineHeight: 1, marginBottom: "4px" }}>24/7</div>
              <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Support</div>
            </motion.div>
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .container { grid-template-columns: 1fr !important; gap: 4rem !important; padding-top: 2rem; text-align: center; }
            .container > div { display: flex; flex-direction: column; align-items: center; }
            motion.p { margin: 0 auto 3rem !important; }
            .container div[style*="position: absolute"] { display: none; } /* Hide floating badges on mobile */
          }
          @media (max-width: 640px) {
            .hero-btns { flex-direction: column !important; width: 100% !important; gap: 1rem !important; }
            .hero-btns a { width: 100% !important; }
            .hero-btns button { width: 100% !important; }
          }
        `}</style>
      </section>

      {/* =========================================================
          ABOUT SECTION (Clean Light Background)
         ========================================================= */}
      {/* =========================================================
          ABOUT SECTION (Dark Background)
         ========================================================= */}
      <section style={{ padding: "120px 0", background: "#050505" }}>
        <div className="container" style={{ width: "90%", maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>

          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0, 255, 157, 0.2)", boxShadow: "0 0 40px rgba(0, 255, 157, 0.05)" }}>
              <img src={aboutImage} alt="Team collaboration" style={{ width: "100%", display: "block", filter: "grayscale(20%) contrast(1.1)" }} />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp}>
              <span style={{
                background: "rgba(0, 255, 157, 0.1)",
                color: "#00ff9d",
                padding: "8px 20px",
                borderRadius: "50px",
                fontSize: "0.8rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                display: "inline-block",
                marginBottom: "1.5rem",
                border: "1px solid rgba(0, 255, 157, 0.2)"
              }}>
                About Us
              </span>
            </motion.div>

            <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: "900", marginBottom: "1.5rem", color: "#ffffff", lineHeight: "1.2" }}>
              Trusted By Leading <span style={{ color: "#00ff9d" }}>Enterprises</span>
            </motion.h2>

            <motion.p variants={fadeInUp} style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#94a3b8", marginBottom: "2rem" }}>
              We empower organizations worldwide with smart, scalable HRMS solutions. Our biometric-powered platform combines cutting-edge AI technology with intuitive design to revolutionize workforce management.
            </motion.p>

            <motion.div variants={fadeInUp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Real-time Attendance Tracking", "Automated Payroll Processing", "Advanced Analytics Dashboard", "Multi-location Support"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(0, 255, 157, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "1px solid rgba(0, 255, 157, 0.3)"
                  }}>
                    <FaCheckCircle style={{ color: "#00ff9d", fontSize: "0.9rem" }} />
                  </div>
                  <span style={{ fontSize: "1.05rem", fontWeight: "600", color: "#e2e8f0" }}>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .container { grid-template-columns: 1fr !important; gap: 3rem !important; }
          }
        `}</style>
      </section>

      {/* =========================================================
          FEATURES SECTION (Dark Gray Background)
         ========================================================= */}
      <section style={{ padding: "120px 0", background: "#0a0a0a" }}>
        <div className="container" style={{ width: "90%", maxWidth: "1400px", margin: "0 auto" }}>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} style={{ textAlign: "center", marginBottom: "5rem" }}>
            <span style={{
              background: "rgba(0, 198, 255, 0.1)",
              color: "#00c6ff",
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "0.8rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              display: "inline-block",
              marginBottom: "1.5rem",
              border: "1px solid rgba(0, 198, 255, 0.2)"
            }}>
              Core Features
            </span>
            <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: "900", marginBottom: "1rem", color: "#ffffff" }}>
              Everything You Need, <span style={{ color: "#00c6ff" }}>Simplified</span>
            </h2>
            <p style={{ fontSize: "1.15rem", color: "#94a3b8", maxWidth: "700px", margin: "0 auto", lineHeight: "1.7" }}>
              Powerful tools designed for modern workforce management, built with precision and simplicity.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}
          >
            {[
              { icon: FaFingerprint, title: "Biometric Attendance", desc: "Facial recognition & fingerprint technology for 100% accuracy.", color: "#00ff9d" },
              { icon: FaMoneyCheckAlt, title: "Automated Payroll", desc: "Smart calculations with tax compliance and direct deposits.", color: "#00c6ff" },
              { icon: FaMapMarkedAlt, title: "Multi-Location Tracking", desc: "Manage global teams with geo-fencing and GPS tracking.", color: "#00ff9d" },
              { icon: FaChartLine, title: "Predictive Analytics", desc: "AI-powered insights for workforce optimization and planning.", color: "#00c6ff" },
              { icon: FaCogs, title: "Seamless Integrations", desc: "Connect with Slack, Zoom, QuickBooks and 50+ apps.", color: "#00ff9d" },
              { icon: FaHeadset, title: "24/7 Support", desc: "Dedicated support team available anytime, anywhere.", color: "#00c6ff" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -8, boxShadow: `0 0 30px ${feature.color}20`, borderColor: feature.color }}
                style={{
                  background: "#111",
                  padding: "2.5rem",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  transition: "all 0.3s"
                }}
              >
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: `rgba(255, 255, 255, 0.03)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  border: `1px solid ${feature.color}40`,
                  boxShadow: `0 0 15px ${feature.color}20`
                }}>
                  <feature.icon style={{ fontSize: "1.8rem", color: feature.color, filter: `drop-shadow(0 0 5px ${feature.color})` }} />
                </div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "0.8rem", color: "#ffffff" }}>{feature.title}</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.7", fontSize: "1rem" }}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          BIOMETRICS DEEP DIVE (White Background)
         ========================================================= */}
      {/* =========================================================
          BIOMETRICS DEEP DIVE (Dark Background)
         ========================================================= */}
      <section style={{ padding: "120px 0", background: "#050505" }}>
        <div className="container" style={{ width: "90%", maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp}>
              <span style={{
                background: "rgba(0, 255, 157, 0.1)",
                color: "#00ff9d",
                padding: "8px 20px",
                borderRadius: "50px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                display: "inline-block",
                marginBottom: "1.5rem",
                border: "1px solid rgba(0, 255, 157, 0.2)"
              }}>
                Advanced Technology
              </span>
            </motion.div>

            <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: "900", marginBottom: "1.5rem", color: "#ffffff", lineHeight: "1.2" }}>
              Enterprise-Grade <span style={{ color: "#00ff9d" }}>Biometrics</span>
            </motion.h2>

            <motion.p variants={fadeInUp} style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#94a3b8", marginBottom: "2.5rem" }}>
              Military-grade facial recognition and fingerprint authentication ensure unparalleled security and accuracy for your workforce.
            </motion.p>

            <motion.div variants={fadeInUp} style={{ display: "grid", gap: "1.5rem" }}>
              {[
                { label: "Recognition Speed", value: "0.3s" },
                { label: "Accuracy Rate", value: "99.8%" },
                { label: "Concurrent Users", value: "10K+" }
              ].map((stat, idx) => (
                <div key={idx} style={{
                  padding: "1.5rem",
                  background: "rgba(0, 255, 157, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(0, 255, 157, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                }}
                  className="hover:bg-opacity-10 transition-all duration-300"
                >
                  <span style={{ fontSize: "1rem", fontWeight: "600", color: "#94a3b8" }}>{stat.label}</span>
                  <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "#00ff9d" }}>{stat.value}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0, 255, 157, 0.2)", boxShadow: "0 0 50px rgba(0, 255, 157, 0.05)" }}>
              <img src={featureImg1} alt="Biometric Technology" style={{ width: "100%", display: "block", filter: "brightness(0.8) contrast(1.2)" }} />
              {/* Overlay Scan Effect */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0, 255, 157, 0.1) 51%, transparent 52%)", backgroundSize: "100% 4px" }}></div>
            </div>
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .container { grid-template-columns: 1fr !important; gap: 3rem !important; }
          }
        `}</style>
      </section>

      {/* =========================================================
          ANALYTICS DEEP DIVE (Dark Gray Background)
         ========================================================= */}
      <section style={{ padding: "120px 0", background: "#0a0a0a" }}>
        <div className="container" style={{ width: "90%", maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>

          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0, 198, 255, 0.2)", boxShadow: "0 0 50px rgba(0, 198, 255, 0.05)" }}>
              <img src={featureImg2} alt="Analytics Dashboard" style={{ width: "100%", display: "block", filter: "brightness(0.8) contrast(1.2) hue-rotate(180deg) saturate(1.5)" }} />
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp}>
              <span style={{
                background: "rgba(0, 198, 255, 0.1)",
                color: "#00c6ff",
                padding: "8px 20px",
                borderRadius: "50px",
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                display: "inline-block",
                marginBottom: "1.5rem",
                border: "1px solid rgba(0, 198, 255, 0.2)"
              }}>
                Intelligent Insights
              </span>
            </motion.div>

            <motion.h2 variants={fadeInUp} style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: "900", marginBottom: "1.5rem", color: "#ffffff", lineHeight: "1.2" }}>
              Data-Driven <span style={{ color: "#00c6ff" }}>Decision Making</span>
            </motion.h2>

            <motion.p variants={fadeInUp} style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#94a3b8", marginBottom: "2.5rem" }}>
              Transform raw workforce data into actionable insights with our AI-powered analytics engine. Predict trends, optimize schedules, and make smarter decisions.
            </motion.p>

            <motion.div variants={fadeInUp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["Real-time Performance Metrics", "Predictive Workforce Planning", "Custom Report Builder", "Automated Compliance Tracking"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(0, 198, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "1px solid rgba(0, 198, 255, 0.3)"
                  }}>
                    <FaCheckCircle style={{ color: "#00c6ff", fontSize: "0.9rem" }} />
                  </div>
                  <span style={{ fontSize: "1.05rem", fontWeight: "600", color: "#e2e8f0" }}>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .container { grid-template-columns: 1fr !important; gap: 3rem !important; }
          }
        `}</style>
      </section>

      {/* =========================================================
          INTEGRATIONS (Dark Background)
         ========================================================= */}
      <section style={{ padding: "100px 0", background: "#080808", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div className="container" style={{ width: "90%", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>

          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "1rem", color: "#ffffff" }}>
            Seamless <span style={{ color: "#00c6ff" }}>Integrations</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ fontSize: "1.05rem", color: "#94a3b8", marginBottom: "4rem", maxWidth: "600px", margin: "0 auto 4rem" }}>
            Connect effortlessly with the tools your team already uses
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "2rem", alignItems: "center" }}
          >
            {[
              { Icon: SiZoom, name: "Zoom", color: "#2D8CFF" },
              { Icon: FaAws, name: "AWS", color: "#FF9900" },
              { Icon: SiQuickbooks, name: "QuickBooks", color: "#2CA01C" },
              { Icon: SiSalesforce, name: "Salesforce", color: "#00A1E0" },
              { Icon: FaMicrosoft, name: "Microsoft", color: "#00A4EF" },
              { Icon: SiSlack, name: "Slack", color: "#E01E5A" },
              { Icon: SiGoogle, name: "Google", color: "#4285F4" },
              { Icon: SiAsana, name: "Asana", color: "#F06A6A" }
            ].map(({ Icon, name, color }, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ scale: 1.1, color: color }}
                style={{
                  fontSize: "3.5rem",
                  color: "#475569",
                  transition: "all 0.3s",
                  cursor: "pointer"
                }}
              >
                <Icon />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          TESTIMONIALS (Dark Background)
         ========================================================= */}
      <section style={{ padding: "120px 0", background: "#0a0a0a" }}>
        <div className="container" style={{ width: "90%", maxWidth: "1400px", margin: "0 auto" }}>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginBottom: "5rem" }}>
            <span style={{
              background: "rgba(0, 255, 157, 0.1)",
              color: "#00ff9d",
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "0.8rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              display: "inline-block",
              marginBottom: "1.5rem",
              border: "1px solid rgba(0, 255, 157, 0.2)"
            }}>
              Testimonials
            </span>
            <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: "900", marginBottom: "1rem", color: "#ffffff" }}>
              Loved By <span style={{ color: "#00ff9d" }}>Thousands</span>
            </h2>
            <p style={{ fontSize: "1.15rem", color: "#94a3b8", maxWidth: "700px", margin: "0 auto" }}>
              See what industry leaders have to say about our platform
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}
          >
            {[
              { name: "Sarah Mitchell", role: "HR Director", company: "TechCorp Inc.", text: "SmartHrms transformed our entire HR workflow. The biometric attendance alone saved us 20 hours per week!", avatar: "https://i.pravatar.cc/150?img=1" },
              { name: "David Chen", role: "Operations Manager", company: "Global Dynamics", text: "The analytics dashboard is phenomenal. We can now predict workforce needs with incredible accuracy.", avatar: "https://i.pravatar.cc/150?img=33" },
              { name: "Emily Rodriguez", role: "CEO", company: "InnovateX", text: "Best investment we've made. The ROI was visible within the first month. Highly recommended!", avatar: "https://i.pravatar.cc/150?img=5" }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: "0 0 40px rgba(0, 255, 157, 0.1)", borderColor: "#00ff9d" }}
                style={{
                  background: "#111",
                  padding: "2.5rem",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  transition: "all 0.3s"
                }}
              >
                <FaQuoteLeft style={{ fontSize: "2rem", color: "#00ff9d", marginBottom: "1.5rem", opacity: 0.5 }} />
                <p style={{ fontSize: "1.05rem", lineHeight: "1.8", color: "#94a3b8", marginBottom: "2rem" }}>
                  "{testimonial.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(0, 255, 157, 0.2)",
                    overflow: "hidden",
                    border: "2px solid #00ff9d",
                    boxShadow: "0 0 15px rgba(0, 255, 157, 0.2)"
                  }}>
                    <img src={testimonial.avatar} alt={testimonial.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(50%)" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", color: "#ffffff", fontSize: "1.05rem" }}>{testimonial.name}</div>
                    <div style={{ color: "#64748b", fontSize: "0.9rem" }}>{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          DOCUMENTATION CTA (Dark Background)
         ========================================================= */}
      <section style={{ padding: "120px 0", background: "#050505", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div className="container" style={{ width: "95%", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(0, 198, 255, 0.05))",
              padding: "80px",
              borderRadius: "40px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
            }}>
              <FaBook style={{ fontSize: "3rem", color: "#00ff9d", marginBottom: "30px", filter: "drop-shadow(0 0 10px rgba(0, 255, 157, 0.4))" }} />
              <h2 style={{ fontSize: "2.8rem", fontWeight: "900", marginBottom: "20px", color: "#fff" }}>
                System <span style={{ color: "#00ff9d" }}>Documentation</span>
              </h2>
              <p style={{ fontSize: "1.2rem", color: "#94a3b8", maxWidth: "700px", margin: "0 auto 40px", lineHeight: "1.7" }}>
                Deep dive into our comprehensive guide to understand the complete HRMS flow for Company Admins, HR Managers, and Employees.
              </p>
              <Link to="/documentation" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 157, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "#111",
                    color: "#00ff9d",
                    border: "1px solid #00ff9d",
                    padding: "16px 40px",
                    borderRadius: "50px",
                    fontSize: "1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    transition: "0.3s"
                  }}
                >
                  Explore Documentation
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          CTA SECTION (Neon Gradient Background)
         ========================================================= */}
      <section style={{
        padding: "100px 0",
        background: "linear-gradient(135deg, #00ff9d 0%, #00c6ff 100%)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative Elements */}
        <div style={{ position: "absolute", top: "-50%", left: "-10%", width: "600px", height: "600px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "50%", filter: "blur(100px)" }} />
        <div style={{ position: "absolute", bottom: "-40%", right: "-5%", width: "500px", height: "500px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "50%", filter: "blur(100px)" }} />

        <div className="container" style={{ width: "90%", maxWidth: "900px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.8rem)", fontWeight: "900", marginBottom: "1.5rem", color: "#000" }}>
              Ready to Transform Your Workforce?
            </h2>
            <p style={{ fontSize: "1.25rem", color: "rgba(0,0,0,0.8)", marginBottom: "3rem", lineHeight: "1.7", fontWeight: "500" }}>
              Join 10,000+ organizations already using SmartHrms to streamline their HR operations
            </p>

            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/partner-with-us">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 15px 40px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "18px 48px",
                    background: "#000",
                    color: "#00ff9d",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                  }}
                >
                  Start Free Trial
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05, background: "rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "18px 48px",
                    background: "rgba(0,0,0,0.05)",
                    color: "#000",
                    border: "2px solid #000",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}
                >
                  Schedule Demo
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div >
  );
};

export default Home;
