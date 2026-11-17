import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaLayerGroup,
  FaThLarge,
  FaClock,
  FaCalendarAlt,
  FaTasks,
  FaUserCheck,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../Company/CompanyLayout.css";

const EmployeeSidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="company-sidebar">
      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="brand-icon" style={{ background: "#059669" }}>
          <FaLayerGroup />
        </div>
        <div className="brand-text">
          <h2>Smart<span>HRMS</span></h2>
          <small style={{ fontSize: "0.68rem", color: "#059669", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Employee Portal
          </small>
        </div>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        <div className="menu-group">
          <span className="menu-label">Workspace</span>

          <Link
            to="/employee/dashboard"
            className={`menu-item ${isActive("/employee/dashboard") ? "active" : ""}`}
          >
            <FaThLarge /> Dashboard
          </Link>

          <Link
            to="/employee/attendance"
            className={`menu-item ${isActive("/employee/attendance") ? "active" : ""}`}
          >
            <FaClock /> My Attendance
          </Link>

          <Link
            to="/employee/leaves"
            className={`menu-item ${isActive("/employee/leaves") ? "active" : ""}`}
          >
            <FaCalendarAlt /> Leave Requests
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-label">My Activities</span>

          <Link
            to="/employee/tasks"
            className={`menu-item ${isActive("/employee/tasks") ? "active" : ""}`}
          >
            <FaTasks /> My Tasks
          </Link>

          <Link
            to="/employee/onboarding"
            className={`menu-item ${isActive("/employee/onboarding") ? "active" : ""}`}
          >
            <FaUserCheck /> My Onboarding
          </Link>
        </div>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar" style={{ background: "#059669" }}>
            {user?.name?.[0]?.toUpperCase() || "E"}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || "Employee"}</span>
            <span className="user-role">{user?.designation || "Staff Member"}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout" title="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
