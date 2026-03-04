import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBuilding, FaUserTie, FaUsers, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const LoginGateway = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const roles = [
    {
      title: "Company Owner",
      desc: "Manage organization, payments & subscriptions.",
      icon: FaBuilding,
      link: "/company-login",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    {
      title: "HR Admin",
      desc: "Employee management, payroll & recruitment.",
      icon: FaUserTie,
      link: "/admin-login",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      title: "Employee",
      desc: "Self-service portal for leave & attendance.",
      icon: FaUsers,
      link: "/employee-login",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    }
  ];

  return (
    <div className="gateway-page">
      {/* Decorative Elements */}
      <div className="gateway-bg-shape shape-1" />
      <div className="gateway-bg-shape shape-2" />

      <div className="gateway-container">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="gateway-header"
        >
          <div className="gateway-badge">
            <FaShieldAlt /> Secure Login Portal
          </div>
          <h1>Welcome <span className="highlight">Back</span></h1>
          <p>Select your role to access the dashboard securely.</p>
        </motion.div>

        <motion.div
          className="roles-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {roles.map((role, idx) => (
            <motion.div key={idx} variants={itemVariants} className="role-card-wrapper">
              <Link to={role.link} className="role-card">
                <div className="card-bg" />
                <div className="icon-box" style={{ background: role.gradient }}>
                  <role.icon />
                </div>
                <div className="role-content">
                  <h3>{role.title}</h3>
                  <p>{role.desc}</p>
                </div>
                <div className="action-row">
                  <span className="login-text" style={{ color: role.color }}>Login Now</span>
                  <div className="arrow-circle" style={{ background: role.gradient }}>
                    <FaArrowRight />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="gateway-footer"
        >
          <p>Don't have an account? <Link to="/register">Register your Company</Link></p>
        </motion.div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .gateway-page {
          min-height: calc(100vh - 80px);
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 60px;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .gateway-bg-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          z-index: 0;
        }

        .shape-1 {
          top: -10%;
          left: -10%;
          width: 600px;
          height: 600px;
          background: #4f46e5;
        }

        .shape-2 {
          bottom: -10%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: #10b981;
        }

        .gateway-container {
          max-width: 1100px;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .gateway-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .gateway-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          margin-bottom: 20px;
        }

        .gateway-header h1 {
          font-size: 3.5rem;
          color: #fff;
          font-weight: 800;
          margin: 0 0 15px 0;
          letter-spacing: -0.02em;
        }

        .highlight {
          background: linear-gradient(135deg, #4f46e5 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gateway-header p {
          color: #94a3b8;
          font-size: 1.2rem;
          margin: 0;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          padding: 0 20px;
        }

        .role-card {
          display: flex;
          flex-direction: column;
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px 30px;
          text-decoration: none;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          height: 100%;
          box-sizing: border-box;
        }

        .role-card:hover {
          transform: translateY(-10px);
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .icon-box {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: white;
          margin-bottom: 25px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .role-content h3 {
          font-size: 1.5rem;
          color: #fff;
          margin: 0 0 10px 0;
          font-weight: 700;
        }

        .role-content p {
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 30px 0;
          min-height: 48px;
        }

        .action-row {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .login-text {
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .arrow-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
          transition: transform 0.3s ease;
        }

        .role-card:hover .arrow-circle {
          transform: translateX(5px);
        }

        .gateway-footer {
          margin-top: 60px;
          text-align: center;
        }

        .gateway-footer p {
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .gateway-footer a {
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          margin-left: 8px;
          position: relative;
        }

        .gateway-footer a::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: #10b981;
          bottom: -4px;
          left: 0;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }

        .gateway-footer a:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        @media (max-width: 992px) {
          .roles-grid { grid-template-columns: repeat(2, 1fr); max-width: 700px; margin: 0 auto; }
        }

        @media (max-width: 600px) {
          .gateway-page { padding-top: 100px; }
          .roles-grid { grid-template-columns: 1fr; }
          .gateway-header h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
};

export default LoginGateway;
