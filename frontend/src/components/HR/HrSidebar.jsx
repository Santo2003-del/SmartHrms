import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaLayerGroup,
  FaThLarge,
  FaUsers,
  FaTasks,
  FaBriefcase,
  FaUserCheck,
  FaCalendarCheck,
  FaSignOutAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../Company/CompanyLayout.css";

const HrSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout("/");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside className="company-sidebar">
      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="brand-icon" style={{ background: "#ea580c" }}>
          <FaLayerGroup />
        </div>
        <div className="brand-text">
          <h2>Smart<span>HRMS</span></h2>
          <small style={{ fontSize: "0.68rem", color: "#ea580c", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            HR Portal
          </small>
        </div>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        <div className="menu-group">
          <span className="menu-label">Main Dashboard</span>

          <Link
            to="/hr/dashboard"
            className={`menu-item ${location.pathname === "/hr/dashboard" ? "active" : ""}`}
          >
            <FaThLarge /> Overview & Directory
          </Link>

          <Link
            to="/hr/tasks"
            className={`menu-item ${isActive("/hr/tasks") ? "active" : ""}`}
          >
            <FaTasks /> Tasks Management
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-label">Recruitment & Hiring</span>

          <Link
            to="/hr/recruitment/jobs"
            className={`menu-item ${isActive("/hr/recruitment/jobs") ? "active" : ""}`}
          >
            <FaBriefcase /> Job Postings
          </Link>

          <Link
            to="/hr/recruitment/applications"
            className={`menu-item ${isActive("/hr/recruitment/applications") ? "active" : ""}`}
          >
            <FaUsers /> Applications
          </Link>

          <Link
            to="/hr/recruitment/interviews"
            className={`menu-item ${isActive("/hr/recruitment/interviews") ? "active" : ""}`}
          >
            <FaCalendarCheck /> Interviews
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-label">Onboarding & Staff</span>

          <Link
            to="/hr/onboarding/templates"
            className={`menu-item ${isActive("/hr/onboarding/templates") ? "active" : ""}`}
          >
            <FaUserCheck /> Templates
          </Link>

          <Link
            to="/hr/onboarding/assignments"
            className={`menu-item ${isActive("/hr/onboarding/assignments") ? "active" : ""}`}
          >
            <FaUsers /> Assignments
          </Link>
        </div>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar" style={{ background: "#ea580c" }}>
            {user?.name?.[0]?.toUpperCase() || "H"}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || "HR Admin"}</span>
            <span className="user-role">{user?.role || "HR Manager"}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout" title="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  );
};

export default HrSidebar;
