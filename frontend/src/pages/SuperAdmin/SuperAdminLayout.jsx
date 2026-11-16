import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SuperAdminLayout.css';
import {
    FaUserShield,
    FaChartPie,
    FaUserPlus,
    FaHeadset,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';

const SuperAdminLayout = ({ children, title = "Dashboard" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { path: '/superadmin/dashboard', icon: FaChartPie, label: 'Dashboard' },
        { path: '/super-admin/inquiries', icon: FaUserPlus, label: 'Inquiries' },
        { path: '/super-admin/support', icon: FaHeadset, label: 'Customer Reports' }, // Renamed from Support Tickets
    ];

    const handleLogout = () => {
        logout('/');
    };

    return (
        <div className="sa-layout">
            {/* SIDEBAR */}
            <aside className={`sa-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sa-brand">
                    <div className="sa-brand-icon"><FaUserShield /></div>
                    <div className="sa-brand-text">SUPER ADMIN</div>
                </div>

                <nav className="sa-nav">
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            className={`sa-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => {
                                navigate(item.path);
                                setIsMobileOpen(false);
                            }}
                        >
                            <item.icon className="sa-nav-icon" />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sa-footer-nav">
                    <button className="sa-logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="sa-main-wrapper">
                <header className="sa-header">
                    <div className="sa-page-title">
                        <h2>{title}</h2>
                    </div>

                    <div className="sa-user-profile">
                        <span style={{ fontWeight: 500, color: '#64748b' }}>{user?.username || 'Admin'}</span>
                        <div className="sa-avatar">
                            {(user?.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <button
                            className="sa-btn-outline mobile-toggle"
                            style={{ display: 'none' }} /* Visible via CSS media query */
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                        >
                            {isMobileOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </header>

                <main className="sa-content">
                    {children}
                </main>
            </div>

            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </div>
    );
};

export default SuperAdminLayout;
