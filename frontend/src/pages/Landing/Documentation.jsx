import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FaBook, FaUserTie, FaUsers, FaBuilding, FaArrowRight,
    FaCheckCircle, FaProjectDiagram, FaFingerprint, FaFileInvoiceDollar
} from 'react-icons/fa';

const Documentation = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const sections = [
        {
            icon: FaBuilding,
            title: "Company Administrator",
            subtitle: "Global System Configuration",
            color: "#00ff9d",
            description: "The Company Admin is the top-level authority who sets up the organizational foundation.",
            steps: [
                "Organizational Setup: Define branches, departments, and hierarchies.",
                "Policy Configuration: Set global leave, attendance, and payroll rules.",
                "Security & Access: Manage HR access levels and biometric encryption settings.",
                "Inquiry Tracking: Monitor systemic growth and platform utilization."
            ]
        },
        {
            icon: FaUserTie,
            title: "HR Specialist",
            subtitle: "Lifecycle & Operations Management",
            color: "#00c6ff",
            description: "HR Admins manage the daily heartbeat of the workforce through our intelligent modules.",
            steps: [
                "Recruitment: Post jobs, track candidates, and schedule AI-facilitated interviews.",
                "Onboarding: Deploy automated onboarding templates and document collection.",
                "Performance Tracking: Monitor real-time KPIs and attendance logs.",
                "Payroll Processing: Generate smart payslips based on automated attendance data."
            ]
        },
        {
            icon: FaUsers,
            title: "Employee",
            subtitle: "Engagement & Self-Service",
            color: "#ff00ff",
            description: "Employees interact with a simplified, biometric-first portal designed for productivity.",
            steps: [
                "AI Attendance: Clock-in/out via Face AI or Mobile Geofencing.",
                "Task Management: View and update daily assignments and project deadlines.",
                "Self-Service: Request leaves, view payslips, and update digital profiles.",
                "Career Growth: Access internal job postings and skill development paths."
            ]
        }
    ];

    return (
        <div className="docs-wrapper" style={{ background: "#050505", color: "#ffffff", minHeight: "100vh", padding: "120px 0 80px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>

                {/* Hero Header */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ textAlign: "center", marginBottom: "80px" }}>
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
                        PLATFORM GUIDE
                    </span>
                    <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", margin: "25px 0", color: "#ffffff", lineHeight: "1.1" }}>
                        Understanding the <span style={{ color: "#00ff9d" }}>System Flow</span>
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "1.2rem", maxWidth: "800px", margin: "0 auto", lineHeight: "1.7" }}>
                        Explore how SmartHrms synchronizes Company, HR, and Employee operations into one intelligent, biometric-driven ecosystem.
                    </p>
                </motion.div>

                {/* Role-Based Documentation Tracks */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px", marginBottom: "100px" }}>
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            whileHover={{ y: -10 }}
                            style={{
                                background: "#0a0a0a",
                                padding: "50px 40px",
                                borderRadius: "30px",
                                border: `1px solid rgba(255,255,255,0.05)`,
                                position: "relative",
                                overflow: "hidden"
                            }}
                        >
                            <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", background: `${section.color}05`, borderRadius: "50%", filter: "blur(40px)", transform: "translate(30%, -30%)" }} />

                            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: `${section.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: section.color, fontSize: "1.8rem", marginBottom: "30px", border: `1px solid ${section.color}30` }}>
                                <section.icon />
                            </div>

                            <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "10px", color: "#ffffff" }}>{section.title}</h3>
                            <h4 style={{ fontSize: "0.9rem", color: section.color, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "25px", fontWeight: "700" }}>{section.subtitle}</h4>

                            <p style={{ color: "#94a3b8", lineHeight: "1.6", marginBottom: "30px" }}>{section.description}</p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                {section.steps.map((step, sIdx) => (
                                    <div key={sIdx} style={{ display: "flex", gap: "12px", color: "#e2e8f0", fontSize: "0.95rem" }}>
                                        <FaCheckCircle style={{ color: section.color, marginTop: "4px", flexShrink: 0 }} />
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* System Flow Diagram Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        background: "linear-gradient(135deg, #111, #050505)",
                        padding: "80px",
                        borderRadius: "40px",
                        border: "1px solid #222",
                        textAlign: "center"
                    }}
                >
                    <FaProjectDiagram style={{ fontSize: "3rem", color: "#00ff9d", marginBottom: "30px" }} />
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "30px" }}>The Unified <span style={{ color: "#00ff9d" }}>Workforce Flow</span></h2>

                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "40px", flexWrap: "wrap", marginTop: "50px" }}>
                        <div style={{ textAlign: "center", maxWidth: "200px" }}>
                            <div style={{ fontSize: "2rem", color: "#ffffff", marginBottom: "15px" }}>01</div>
                            <h5 style={{ fontWeight: "700", marginBottom: "10px" }}>Initial Setup</h5>
                            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Company Admin configures hierarchy and rules.</p>
                        </div>
                        <FaArrowRight style={{ color: "#333", fontSize: "1.5rem" }} />
                        <div style={{ textAlign: "center", maxWidth: "200px" }}>
                            <div style={{ fontSize: "2rem", color: "#ffffff", marginBottom: "15px" }}>02</div>
                            <h5 style={{ fontWeight: "700", marginBottom: "10px" }}>HR Management</h5>
                            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>HR starts onboarding and daily ops.</p>
                        </div>
                        <FaArrowRight style={{ color: "#333", fontSize: "1.5rem" }} />
                        <div style={{ textAlign: "center", maxWidth: "200px" }}>
                            <div style={{ fontSize: "2rem", color: "#ffffff", marginBottom: "15px" }}>03</div>
                            <h5 style={{ fontWeight: "700", marginBottom: "10px" }}>Employee Sync</h5>
                            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Team logs attendance and tracks tasks.</p>
                        </div>
                        <FaArrowRight style={{ color: "#333", fontSize: "1.5rem" }} />
                        <div style={{ textAlign: "center", maxWidth: "200px" }}>
                            <div style={{ fontSize: "2rem", color: "#ffffff", marginBottom: "15px" }}>04</div>
                            <h5 style={{ fontWeight: "700", marginBottom: "10px" }}>Intelligent Reports</h5>
                            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>System generates AI-driven analytics.</p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <div style={{ textAlign: "center", marginTop: "100px" }}>
                    <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "20px" }}>Need more help?</h3>
                    <p style={{ color: "#94a3b8", marginBottom: "40px" }}>Our documentation is constantly updated. Contact us if you have specific questions.</p>
                    <Link to="/contact" style={{
                        background: "#00ff9d",
                        padding: "15px 40px",
                        borderRadius: "50px",
                        color: "#000",
                        fontWeight: "800",
                        textDecoration: "none",
                        display: "inline-block"
                    }}>
                        Get In Touch
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Documentation;
