import React from 'react';
import {
  FaLaptopCode, FaUserClock, FaMoneyCheckAlt, FaChartLine,
  FaMobileAlt, FaDatabase, FaCogs, FaHeadset, FaArrowRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Services = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="services-page" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#050505", color: "#ffffff", overflowX: "hidden" }}>
      {/* --- HERO SECTION --- */}
      <section style={{ padding: "120px 0 80px", textAlign: "center", background: "#050505", position: "relative" }}>
        {/* Neon Glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "rgba(0, 255, 157, 0.05)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 2 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
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
              OUR SOLUTIONS
            </span>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", margin: "25px 0", letterSpacing: "-2px", color: "#ffffff", lineHeight: "1.1" }}>
              Enterprise-Grade <span style={{ color: "#00ff9d" }}>Services</span>
            </h1>
            <p style={{ fontSize: "1.25rem", color: "#94a3b8", maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" }}>
              Experience the full spectrum of SmartHrms capabilities. From recruitment
              to retirement, we digitize every step of the employee lifecycle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- MAIN SERVICES GRID --- */}
      <section style={{ padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px" }}
          >
            {[
              { icon: FaLaptopCode, title: "SaaS Implementation", text: "End-to-end setup of the SmartHrms suite tailored to your organizational hierarchy.", color: "#00ff9d" },
              { icon: FaUserClock, title: "Biometric Integration", text: "Connecting hardware devices with our cloud servers for real-time attendance syncing.", color: "#00cc7e" },
              { icon: FaMoneyCheckAlt, title: "Payroll Automation", text: "Configuring complex salary structures, tax deductions, and compliance rules.", color: "#00ff9d" },
              { icon: FaMobileAlt, title: "Mobile App Rollout", text: "Deploying the employee self-service app (iOS/Android) for your entire workforce.", color: "#00cc7e" },
              { icon: FaDatabase, title: "Data Migration", text: "Seamlessly transferring your legacy HR data into our secure cloud environment.", color: "#00ff9d" },
              { icon: FaHeadset, title: "24/7 Premium Support", text: "Dedicated account managers and technical support for enterprise clients.", color: "#00cc7e" }
            ].map((service, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -10, boxShadow: `0 0 30px ${service.color}20`, borderColor: service.color }}
                style={{
                  background: "#111",
                  padding: "40px",
                  borderRadius: "24px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  transition: "all 0.3s",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
              >
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: `rgba(255,255,255,0.03)`,
                  color: service.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  marginBottom: "25px",
                  border: `1px solid ${service.color}40`,
                  boxShadow: `0 0 15px ${service.color}20`
                }}>
                  <service.icon style={{ filter: `drop-shadow(0 0 5px ${service.color})` }} />
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "15px", color: "#ffffff" }}>{service.title}</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>{service.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- HOW WE WORK (PROCESS) --- */}
      <section style={{ padding: "100px 0", background: "#0a0a0a", position: "relative", overflow: "hidden", borderTop: "1px solid #111" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "60px", color: "#ffffff" }}>Deployment <span style={{ color: "#00ff9d" }}>Process</span></h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", position: "relative", zIndex: 2 }}>
            {[
              { num: "01", title: "Discovery", text: "Analyzing your HR workflows" },
              { num: "02", title: "Configuration", text: "Setting up rules & policies" },
              { num: "03", title: "Training", text: "Onboarding your HR team" },
              { num: "04", title: "Go Live", text: "Launching to all employees" }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                style={{ position: "relative" }}
              >
                <div style={{ fontSize: "4rem", fontWeight: "900", color: "#111", marginBottom: "-20px", position: "relative", zIndex: -1 }}>{step.num}</div>
                <h4 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#ffffff", marginBottom: "10px" }}>{step.title}</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ENTERPRISE MODULES LIST --- */}
      <section style={{ padding: "100px 0", background: "#050505", color: "#fff", textAlign: "center", borderTop: "1px solid #111" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "20px" }}>Additional <span style={{ color: "#00ff9d" }}>Enterprise Modules</span></h2>
            <p style={{ color: "#94a3b8", fontSize: "1.2rem", marginBottom: "50px" }}>Extend the power of SmartHrms with these add-ons.</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "50px", flexWrap: "wrap", marginBottom: "50px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", textAlign: "left", background: "#111", padding: "20px 30px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <FaChartLine style={{ fontSize: "2.5rem", color: "#00ff9d", filter: "drop-shadow(0 0 5px #00ff9d)" }} />
                <div>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "5px", color: "#fff" }}>Performance Management</h4>
                  <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>KPIs, OKRs, & Appraisals</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", textAlign: "left", background: "#111", padding: "20px 30px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <FaCogs style={{ fontSize: "2.5rem", color: "#00ff9d", filter: "drop-shadow(0 0 5px #00ff9d)" }} />
                <div>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "5px", color: "#fff" }}>Custom API Access</h4>
                  <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Integrate with ERP/CRM</span>
                </div>
              </div>
            </div>

            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 255, 157, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: "inline-block",
                  background: "#00ff9d",
                  color: "#000",
                  padding: "18px 45px",
                  borderRadius: "16px",
                  fontWeight: "800",
                  textDecoration: "none",
                  transition: "0.3s",
                  border: "none",
                  fontSize: "1.1rem",
                  cursor: "pointer"
                }}
              >
                Request Demo
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section style={{ padding: "120px 0", textAlign: "center", background: "#080808" }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              background: "linear-gradient(135deg, #00ff9d 0%, #00c6ff 100%)",
              borderRadius: "40px",
              padding: "80px 40px",
              color: "#000",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)", opacity: 0.5 }}></div>
            <div style={{ position: "relative", zIndex: 2 }}>
              <h2 style={{ fontSize: "2.8rem", fontWeight: "900", marginBottom: "25px", color: "#000" }}>Ready to <span style={{ color: "#fff" }}>Modernize?</span></h2>
              <p style={{ fontSize: "1.2rem", color: "rgba(0,0,0,0.7)", marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px", fontWeight: "600" }}>
                Join 500+ forward-thinking companies running on SmartHrms.
              </p>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "inline-block",
                    background: "#000",
                    color: "#00ff9d",
                    padding: "18px 45px",
                    borderRadius: "16px",
                    fontWeight: "800",
                    textDecoration: "none",
                    fontSize: "1.1rem",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Get Started Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;