import React from 'react';
import { motion } from 'framer-motion';
import { FaGavel, FaHandshake, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const TermsConditions = () => {
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
                        background: "rgba(0, 198, 255, 0.1)",
                        color: "#00c6ff",
                        padding: "8px 20px",
                        borderRadius: "50px",
                        fontWeight: "800",
                        fontSize: "0.8rem",
                        letterSpacing: "1px",
                        border: "1px solid rgba(0, 198, 255, 0.2)"
                    }}>
                        LEGAL AGREEMENT
                    </span>
                    <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", margin: "25px 0", color: "#ffffff" }}>
                        Terms & <span style={{ color: "#00c6ff" }}>Conditions</span>
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Last updated: February 16, 2026</p>
                </motion.div>

                {/* Content Section */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ background: "#0a0a0a", padding: "50px", borderRadius: "30px", border: "1px solid #111" }}>
                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00c6ff", fontSize: "1.5rem", marginBottom: "20px" }}>
                            <FaHandshake /> 1. Acceptance of Terms
                        </h2>
                        <p style={{ color: "#94a3b8", lineHeight: "1.8", fontSize: "1.05rem" }}>
                            By accessing and using SmartHrms, you agree to be bound by these Terms and Conditions. Our services are provided primarily to corporate entities for workforce management.
                        </p>
                    </section>

                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00c6ff", fontSize: "1.5rem", marginBottom: "20px" }}>
                            <FaGavel /> 2. User Obligations
                        </h2>
                        <p style={{ color: "#94a3b8", lineHeight: "1.8", fontSize: "1.05rem" }}>
                            Users must provide accurate information and maintain the security of their accounts. Any unauthorized use of the platform and its biometric features is strictly prohibited.
                        </p>
                    </section>

                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00c6ff", fontSize: "1.5rem", marginBottom: "20px" }}>
                            <FaCheckCircle /> 3. Service Availability
                        </h2>
                        <p style={{ color: "#94a3b8", lineHeight: "1.8", fontSize: "1.05rem" }}>
                            We strive for 99.9% uptime. However, maintenance and updates are necessary to ensure the security and performance of the platform. We will notify customers in advance of any planned downtime.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#00c6ff", fontSize: "1.5rem", marginBottom: "20px" }}>
                            <FaExclamationTriangle /> 4. Limitation of Liability
                        </h2>
                        <p style={{ color: "#94a3b8", lineHeight: "1.8", fontSize: "1.05rem" }}>
                            SmartHrms shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.
                        </p>
                    </section>
                </motion.div>

                {/* Footer Contact */}
                <div style={{ textAlign: "center", marginTop: "60px" }}>
                    <p style={{ color: "#94a3b8" }}>Need clarification on our terms?</p>
                    <a href="mailto:reportsinsider@gmail.com" style={{ color: "#00c6ff", fontWeight: "700", textDecoration: "none" }}>reportsinsider@gmail.com</a>
                </div>

            </div>
        </div>
    );
};

export default TermsConditions;
