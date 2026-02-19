import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaHeadset,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaExclamationCircle,
  FaCheckCircle
} from "react-icons/fa";
import { raiseSupportTicket } from "../../services/api";

const SupportHub = () => {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null); // { ticketId: '#TK-1234' }

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    issueType: "Login Issue",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await raiseSupportTicket(form);
      if (res.data?.success) {
        setSuccessData({ ticketId: res.data.ticketId });
        toast.success("Ticket Raised Successfully! ✅");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to raise ticket.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (successData) {
    return (
      <div className="contact-wrapper" style={{ background: "#050505", minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#ffffff" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="success-card"
          style={{
            background: "#111",
            padding: "50px",
            borderRadius: "24px",
            border: "1px solid rgba(0, 255, 157, 0.3)",
            textAlign: "center",
            maxWidth: "500px",
            boxShadow: "0 0 50px rgba(0, 255, 157, 0.1)"
          }}
        >
          <FaCheckCircle style={{ fontSize: "4rem", color: "#00ff9d", marginBottom: "20px" }} />
          <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>Ticket Registered!</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "20px" }}>
            Your issue has been reported successfully. Our technical experts are looking into it.
          </p>
          <div style={{ background: "rgba(0, 255, 157, 0.1)", padding: "15px", borderRadius: "12px", marginBottom: "30px" }}>
            <span style={{ display: "block", fontSize: "0.9rem", color: "#00ff9d", letterSpacing: "1px" }}>TICKET ID</span>
            <strong style={{ fontSize: "1.5rem", color: "#fff" }}>{successData.ticketId}</strong>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "transparent",
              border: "1px solid #333",
              color: "#fff",
              padding: "12px 25px",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Raise Another Ticket
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="contact-wrapper" style={{ background: "#050505", overflowX: "hidden", color: "#ffffff", minHeight: "100vh" }}>
      {/* --- HERO SECTION --- */}
      <section style={{
        padding: "120px 0 80px",
        textAlign: "center",
        background: "#050505",
        position: "relative"
      }}>
        {/* Neon Glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "rgba(0, 198, 255, 0.05)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 2 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <span style={{
              background: "rgba(0, 198, 255, 0.1)",
              color: "#00c6ff",
              padding: "8px 20px",
              borderRadius: "50px",
              fontWeight: "700",
              fontSize: "0.8rem",
              letterSpacing: "1.5px",
              border: "1px solid rgba(0, 198, 255, 0.2)",
              boxShadow: "0 0 15px rgba(0, 198, 255, 0.1)"
            }}>
              24/7 HELP DESK
            </span>
            <h1 style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: "900",
              margin: "25px 0",
              color: "#ffffff",
              lineHeight: "1.1"
            }}>
              Technical Support & <span style={{ color: "#00c6ff" }}>Issue Reporting</span>
            </h1>
            <p style={{
              fontSize: "1.2rem",
              color: "#94a3b8",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.7"
            }}>
              Facing issues with your HRMS? Report your problem below, and our technical team will resolve it shortly.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 100px", display: "grid", gridTemplateColumns: "minmax(350px, 400px) 1fr", gap: "50px" }}>

        {/* === LEFT: CONTACT INFO === */}
        <motion.aside
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div style={{
            background: "#111",
            borderRadius: "24px",
            padding: "40px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 0 30px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "30px", display: "flex", alignItems: "center", gap: "12px", color: "#ffffff" }}>
              <FaHeadset style={{ color: "#00c6ff", filter: "drop-shadow(0 0 5px #00c6ff)" }} /> Support Channels
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0, 255, 157, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00ff9d", flexShrink: 0, border: "1px solid rgba(0, 255, 157, 0.2)" }}>
                  <FaEnvelope />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Support Email</label>
                  <a href="mailto:reportsinsider@gmail.com" style={{ color: "#ffffff", fontWeight: "600", fontSize: "1rem", textDecoration: "none", transition: "0.2s" }} className="hover-neon">reportsinsider@gmail.com</a>
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(0, 198, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00c6ff", flexShrink: 0, border: "1px solid rgba(0, 198, 255, 0.2)" }}>
                  <FaPhoneAlt />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Priority Line</label>
                  <p style={{ margin: 0, color: "#ffffff", fontWeight: "600", fontSize: "1rem" }}>+44 151 528 9267</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <FaClock />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Support Hours</label>
                  <p style={{ margin: 0, color: "#ffffff", fontWeight: "600", fontSize: "1rem" }}>Mon - Sat: 09:00 AM - 07:00 PM</p>
                </div>
              </div>

            </div>
          </div>
        </motion.aside>

        {/* === RIGHT: SUPPORT FORM === */}
        <motion.main
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div style={{
            background: "#111",
            borderRadius: "24px",
            padding: "50px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 0 30px rgba(0,0,0,0.5)"
          }}>
            <div style={{ marginBottom: "35px" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "10px", color: "#ffffff" }}>
                Raise a <span style={{ color: "#00c6ff" }}>ticket</span>
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
                Describe your issue below.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                <div className="input-group">
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    style={{ width: "100%", padding: "14px", border: "1px solid #333", borderRadius: "12px", outline: "none", fontSize: "1rem", background: "#050505", color: "#fff", transition: "0.3s" }}
                  />
                </div>

                <div className="input-group">
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>User Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    style={{ width: "100%", padding: "14px", border: "1px solid #333", borderRadius: "12px", outline: "none", fontSize: "1rem", background: "#050505", color: "#fff", transition: "0.3s" }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: "100%", padding: "14px", border: "1px solid #333", borderRadius: "12px", outline: "none", fontSize: "1rem", background: "#050505", color: "#fff", transition: "0.3s" }}
                />
              </div>

              <div className="input-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>Issue Category</label>
                <select
                  required
                  value={form.issueType}
                  onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                  style={{ width: "100%", padding: "14px", border: "1px solid #333", borderRadius: "12px", outline: "none", fontSize: "1rem", background: "#050505", color: "#fff", transition: "0.3s", cursor: "pointer" }}
                >
                  <option value="Login Issue">Login Issue</option>
                  <option value="Attendance Error">Attendance Error</option>
                  <option value="Payroll Bug">Payroll Bug</option>
                  <option value="Performance Issue">Performance Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>Issue Description</label>
                <textarea
                  placeholder="Please describe the issue in detail..."
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: "100%", padding: "14px", border: "1px solid #333", borderRadius: "12px", outline: "none", fontSize: "1rem", background: "#050505", color: "#fff", transition: "0.3s", height: "150px", resize: "none", fontFamily: "inherit" }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0, 255, 157, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: "linear-gradient(135deg, #00ff9d, #00cc7e)",
                  color: "#000",
                  border: "none",
                  padding: "18px",
                  borderRadius: "15px",
                  fontWeight: "800",
                  fontSize: "1rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  boxShadow: "0 10px 20px rgba(0, 255, 157, 0.2)",
                  opacity: loading ? 0.7 : 1,
                  transition: "0.3s"
                }}
              >
                {loading ? "Submitting..." : <><FaExclamationCircle /> Submit Report</>}
              </motion.button>
            </form>
          </div>
        </motion.main>
      </div>

      <style>{`
        .input-group input:focus, .input-group textarea:focus, .input-group select:focus {
          border-color: #00c6ff !important;
          box-shadow: 0 0 0 2px rgba(0, 198, 255, 0.2) !important;
          background: #0a0a0a !important;
        }
        .hover-neon:hover {
          color: #00c6ff !important;
        }
        @media (max-width: 1024px) {
          .container { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .input-group { grid-column: span 2; } 
          form > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default SupportHub;