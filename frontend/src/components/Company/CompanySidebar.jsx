import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    FaLayerGroup,
    FaThLarge,
    FaUsers,
    FaUserTie,
    FaWallet,
    FaCog,
    FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./CompanyLayout.css";

const CompanySidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout('/');
    };

    const scrollToSection = (id) => {
        // If we are not on the dashboard, go there first
        if (location.pathname !== "/company/dashboard") {
            navigate("/company/dashboard");
            // Use a timeout to allow navigation to complete before scrolling
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 500);
        } else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="company-sidebar">
            {/* BRAND */}
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <FaLayerGroup />
                </div>
                <div className="brand-text">
                    <h2>Smart<span>Hrms</span></h2>
                </div>
            </div>

            {/* MENU */}
            <nav className="sidebar-menu">
                <div className="menu-group">
                    <span className="menu-label">Main</span>

                    <Link
                        to="/company/dashboard"
                        className={`menu-item ${isActive("/company/dashboard") ? "active" : ""}`}
                    >
                        <FaThLarge /> Dashboard
                    </Link>

                    <Link
                        to="/company/hr-management"
                        className={`menu-item ${isActive("/company/hr-management") ? "active" : ""}`}
                    >
                        <FaUserTie /> HR Management
                    </Link>

                    <Link
                        to="/company/employee-management"
                        className={`menu-item ${isActive("/company/employee-management") ? "active" : ""}`}
                    >
                        <FaUsers /> Employees
                    </Link>
                </div>

                <div className="menu-group">
                    <span className="menu-label">Finance & Settings</span>

                    <Link
                        to="/company/expenditure"
                        className={`menu-item ${isActive("/company/expenditure") ? "active" : ""}`}
                    >
                        <FaWallet /> Company Expenditure
                    </Link>

                    <button
                        onClick={() => scrollToSection("settings")}
                        className="menu-item-btn"
                    >
                        <FaCog /> Settings
                    </button>
                </div>
            </nav>

            {/* FOOTER */}
            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.name?.[0] || "C"}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.name || "Company Admin"}</span>
                        <span className="user-role">Company Admin</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="sidebar-logout" title="Logout">
                    <FaSignOutAlt />
                </button>
            </div>
        </aside>
    );
};

export default CompanySidebar;
