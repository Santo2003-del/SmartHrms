import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaLayerGroup,
  FaThLarge,
  FaHandshake,
  FaHeadset,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../Company/CompanyLayout.css";

const SuperAdminSidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout("/system-access-gmv2026");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="company-sidebar">
      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="brand-icon" style={{ background: "#7c3aed" }}>
          <FaShieldAlt />
        </div>
        <div className="brand-text">
          <h2>Smart<span>HRMS</span></h2>
          <small style={{ fontSize: "0.68rem", color: "#7c3aed", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Super Admin
          </small>
        </div>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        <div className="menu-group">
          <span className="menu-label">Administration</span>

          <Link
            to="/superadmin/dashboard"
            className={`menu-item ${isActive("/superadmin/dashboard") ? "active" : ""}`}
          >
            <FaThLarge /> Overview & Companies
          </Link>

          <Link
            to="/super-admin/inquiries"
            className={`menu-item ${isActive("/super-admin/inquiries") ? "active" : ""}`}
          >
            <FaHandshake /> Partner Inquiries
          </Link>

          <Link
            to="/super-admin/support"
            className={`menu-item ${isActive("/super-admin/support") ? "active" : ""}`}
          >
            <FaHeadset /> Support Hub
          </Link>
        </div>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar" style={{ background: "#7c3aed" }}>
            S
          </div>
          <div className="user-details">
            <span className="user-name">Root Admin</span>
            <span className="user-role">Super Admin</span>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout" title="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
