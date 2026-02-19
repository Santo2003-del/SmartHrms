import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaUserSecret, FaKey } from 'react-icons/fa';

const PrivacyPolicy = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="legal-wrapper" style={{ background: "#050505", color: "#ffffff", minHeight: "100vh", padding: "120px 0 80px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}>

                {/* Header */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ textAlign: "center", marginBottom: "60px" }}>
                    <span style={{
                        background: "rgba(0, 255, 157, 0.1)",
                        color: "#00ff9d",
                        padding: "8px 20px",
                        borderRadius: "50px",
                        fontWeight: "800",
                        fontSize: "0.8rem",
                        letterSpacing: "1px",
                        border: "1px solid rgba(0, 255, 157, 0.2)"
                    }}>
                        SECURITY & COMPLIANCE
                    </span>
                    <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", margin: "25px 0", color: "#ffffff" }}>
                        Privacy <span style={{ color: "#00ff9d" }}>Policy</span>
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Last updated: February 16, 2026</p>
                </motion.div>

                {/* Content Section */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ background: "#0a0a0a", padding: "50px", borderRadius: "30px", border: "1px solid #111" }}>
                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00ff9d", fontSize: "1.5rem", marginBottom: "20px" }}>
                            <FaShieldAlt /> 1. Information Collection
                        </h2>
                        <p style={{ color: "#94a3b8", lineHeight: "1.8", fontSize: "1.05rem" }}>
                            We collect information to provide better services to all our users. This includes personal identification information (Name, Email, Phone number) and organizational data necessary for HR processing.
                        </p>
                    </section>

                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00ff9d", fontSize: "1.5rem", marginBottom: "20px" }}>
                            <FaLock /> 2. Data Usage & Security
                        </h2>
                        <p style={{ color: "#94a3b8", lineHeight: "1.8", fontSize: "1.05rem" }}>
                            Your data is encrypted using AES-256 standards. We use facial descriptors (not photos) for biometric attendance, ensuring that your raw biometric data is never stored on our servers in a reversible format.
                        </p>
                    </section>

                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00ff9d", fontSize: "1.5rem", marginBottom: "20px" }}>
                            <FaUserSecret /> 3. Information Sharing
                        </h2>
                        <p style={{ color: "#94a3b8", lineHeight: "1.8", fontSize: "1.05rem" }}>
                            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website or servicing you.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00ff9d", fontSize: "1.5rem", marginBottom: "20px" }}>
                            <FaKey /> 4. Your Rights
                        </h2>
                        <p style={{ color: "#94a3b8", lineHeight: "1.8", fontSize: "1.05rem" }}>
                            Users have the right to request access to their personal data, request corrections, or request deletion of their account information at any time.
                        </p>
                    </section>
                </motion.div>

                {/* Footer Contact */}
                <div style={{ textAlign: "center", marginTop: "60px" }}>
                    <p style={{ color: "#94a3b8" }}>Questions about our Privacy Policy?</p>
                    <a href="mailto:reportsinsider@gmail.com" style={{ color: "#00ff9d", fontWeight: "700", textDecoration: "none" }}>reportsinsider@gmail.com</a>
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;
