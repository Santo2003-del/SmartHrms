import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaLayerGroup,
  FaThLarge,
  FaUsers,
  FaTasks,
  FaBriefcase,
  FaUserCheck,
  FaCalendarCheck,
  FaSignOutAlt,
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaClipboardList,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../Company/CompanyLayout.css";

const HrSidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout("/");
  };

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "employees";

  const isHrTabActive = (tab) => {
    return location.pathname === "/hr/dashboard" && currentTab === tab;
  };

  const isPathActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

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
          <span className="menu-label">HR Management</span>

          <Link
            to="/hr/dashboard?tab=employees"
            className={`menu-item ${isHrTabActive("employees") ? "active" : ""}`}
          >
            <FaUsers /> Directory
          </Link>

          <Link
            to="/hr/dashboard?tab=recruitment"
            className={`menu-item ${isHrTabActive("recruitment") ? "active" : ""}`}
          >
            <FaBriefcase /> Recruitment
          </Link>

          <Link
            to="/hr/dashboard?tab=tasks"
            className={`menu-item ${isHrTabActive("tasks") ? "active" : ""}`}
          >
            <FaTasks /> Tasks
          </Link>

          <Link
            to="/hr/dashboard?tab=leaves"
            className={`menu-item ${isHrTabActive("leaves") ? "active" : ""}`}
          >
            <FaCalendarAlt /> Leaves
          </Link>

          <Link
            to="/hr/dashboard?tab=onboarding"
            className={`menu-item ${isHrTabActive("onboarding") ? "active" : ""}`}
          >
            <FaUserCheck /> Onboarding
          </Link>

          <Link
            to="/hr/dashboard?tab=holidays"
            className={`menu-item ${isHrTabActive("holidays") ? "active" : ""}`}
          >
            <FaUmbrellaBeach /> Holidays
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-label">Recruitment Pipeline</span>

          <Link
            to="/hr/recruitment/jobs"
            className={`menu-item ${isPathActive("/hr/recruitment/jobs") ? "active" : ""}`}
          >
            <FaBriefcase /> Job Postings
          </Link>

          <Link
            to="/hr/recruitment/applications"
            className={`menu-item ${isPathActive("/hr/recruitment/applications") ? "active" : ""}`}
          >
            <FaUsers /> Applications
          </Link>

          <Link
            to="/hr/recruitment/interviews"
            className={`menu-item ${isPathActive("/hr/recruitment/interviews") ? "active" : ""}`}
          >
            <FaCalendarCheck /> Interviews
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-label">Onboarding Setup</span>

          <Link
            to="/hr/onboarding/templates"
            className={`menu-item ${isPathActive("/hr/onboarding/templates") ? "active" : ""}`}
          >
            <FaClipboardList /> Templates
          </Link>

          <Link
            to="/hr/onboarding/assignments"
            className={`menu-item ${isPathActive("/hr/onboarding/assignments") ? "active" : ""}`}
          >
            <FaUserCheck /> Assignments
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
