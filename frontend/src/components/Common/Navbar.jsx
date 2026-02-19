import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaBriefcase,
  FaLayerGroup,
  FaBuilding
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { PUBLIC_NAV, ROLE_NAV } from "../../config/navConfig";

// Helper to determine if we show the Role Menu or Public Menu
const isDashboardPath = (pathname) => {
  const p = pathname || "";
  return (
    p.startsWith("/superadmin") ||
    p.startsWith("/super-admin") ||
    p.startsWith("/company") ||
    p.startsWith("/hr") ||
    p.startsWith("/employee")
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Scroll Effect Logic
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const goDashboard = () => {
    closeMenu();
    if (!user) return;
    if (user.role === "SuperAdmin") navigate("/superadmin/dashboard");
    else if (user.role === "CompanyAdmin") navigate("/company/dashboard");
    else if (user.role === "Admin") navigate("/hr/dashboard");
    else navigate("/employee/dashboard");
  };

  const showRoleNav = !!user && isDashboardPath(location.pathname);

  const roleLinks = useMemo(() => {
    if (!user?.role) return [];
    return ROLE_NAV[user.role] || [];
  }, [user?.role]);

  // Combined Public Nav with Careers Link
  const publicLinks = [
    ...PUBLIC_NAV,
    { label: "Careers", to: "/careers", icon: FaBriefcase },
    { label: "Partner With Us", to: "/partner-with-us", icon: FaBuilding }
  ];

  const currentLinks = showRoleNav ? roleLinks : publicLinks;
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      <div className={`nav-pill ${scrolled ? "scrolled" : ""}`}>
        {/* LOGO */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon">
            <FaLayerGroup />
          </span>
          <span className="logo-text">Smart<span className="logo-highlight">Hrms</span></span>
        </Link>

        {/* DESKTOP MENU */}
        <ul className={`menu ${menuOpen ? "open" : ""}`}>
          {currentLinks.map((link, idx) => (
            <li key={idx}>
              <Link
                to={link.to}
                className={isActive(link.to)}
                onClick={closeMenu}
              >
                {link.label}
                {isActive(link.to) && <div className="active-dot" />}
              </Link>
            </li>
          ))}

          {/* MOBILE ACTIONS */}
          <div className="mobile-only">
            {user ? (
              <>
                <button onClick={goDashboard} className="mobile-btn dashboard">Dashboard</button>
                <button onClick={() => { logout(); closeMenu(); }} className="mobile-btn logout">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className="mobile-btn login">Login</Link>
            )}
          </div>
        </ul>

        {/* DESKTOP ACTIONS */}
        <div className="actions desktop-only">
          {user ? (
            <div className="user-actions">
              <button onClick={goDashboard} className="dashboard-btn">
                <FaUserCircle />
              </button>
              <button onClick={logout} className="logout-btn" title="Logout">
                <FaTimes />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="login-btn-pill">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <style>{`
        /* --- CORE NAVBAR LAYOUT --- */
        .navbar {
          position: fixed;
          top: 24px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          z-index: 1000;
          padding: 0 20px;
          pointer-events: none;
        }

        .nav-pill {
          pointer-events: auto;
          background: rgba(18, 18, 18, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          
          /* PADDING & SIZE */
          padding: 8px 32px; 
          min-height: 64px;

          display: flex;
          align-items: center; /* STRICT VERTICAL CENTER */
          justify-content: space-between; 
          gap: 40px;
          
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
          width: auto;
          max-width: 98%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-pill.scrolled {
          background: rgba(5, 5, 5, 0.98);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 40px rgba(0,0,0,0.7);
          padding: 6px 28px;
        }

        /* --- LOGO --- */
        .logo {
          display: flex;
          align-items: center; /* STRICT VERTICAL CENTER */
          justify-content: flex-start;
          gap: 12px;
          text-decoration: none;
          color: #fff;
          background: transparent !important;
          flex-shrink: 0;
          height: 100%;
          padding: 0;
          margin: 0;
          margin-right: 40px; /* Add explicit spacing */
          line-height: 1;
          overflow: visible; /* FORCE VISIBLE */
          max-width: none;
        }

        /* LOGO TEXT - Ensure baseline alignment with icon */
        .logo-text {
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.5px;
          display: inline-block !important; /* Force inline block */
          white-space: nowrap;
          min-width: max-content;
          width: auto;
        }

        /* LOGO ICON WRAPPER */
        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00ff9d;
          font-size: 1.6rem;
          filter: drop-shadow(0 0 8px rgba(0, 255, 157, 0.5));
          height: 100%;
          flex-shrink: 0;
        }

        .logo-highlight {
          color: #00ff9d;
        }

        /* --- MENU --- */
        .menu {
          display: flex;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center; /* STRICT VERTICAL CENTER */
          height: 100%;
        }
        
        .menu a {
          text-decoration: none;
          font-weight: 600;
          color: #94a3b8;
          transition: color 0.2s ease;
          font-size: 0.9rem;
          text-transform: capitalize;
          position: relative;
          display: flex;
          align-items: center; /* STRICT VERTICAL CENTER */
          height: 100%;
        }

        .menu a:hover {
          color: #fff;
        }

        .menu a.active {
          color: #00ff9d;
          font-weight: 700;
        }
        
        .active-dot {
          width: 5px;
          height: 5px;
          background: #00ff9d;
          border-radius: 50%;
          position: absolute;
          bottom: -8px; 
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 8px #00ff9d;
        }

        /* --- ACTIONS --- */
        .actions {
          display: flex;
          align-items: center; /* STRICT VERTICAL CENTER */
          gap: 16px;
          flex-shrink: 0;
          height: 100%;
        }

        .login-btn-pill {
          background: #00ff9d;
          color: #000;
          border: none;
          padding: 10px 32px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .login-btn-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 255, 157, 0.4);
          background: #05ffa4;
        }

        .user-actions { display: flex; gap: 10px; align-items: center; }
        
        .dashboard-btn, .logout-btn {
          width: 42px; height: 42px; border-radius: 50%;
          border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; transition: 0.2s;
        }
        .dashboard-btn { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
        .dashboard-btn:hover { background: #00ff9d; color: #000; border-color: #00ff9d; }
        .logout-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .logout-btn:hover { background: #ef4444; color: #fff; }

        /* --- MOBILE --- */
        .hamburger { display: none; font-size: 1.5rem; background: none; border: none; color: #fff; cursor: pointer; padding: 0; }
        .mobile-only { display: none; }
        .desktop-only { display: flex; }

        @media (max-width: 1024px) {
          .navbar { top: 10px; padding: 0 10px; }
          .nav-pill {
            width: 100%;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 12px 20px;
            justify-content: space-between;
            background: rgba(10, 10, 10, 0.95);
            min-height: 64px;
            gap: 0;
          }
          
          .menu {
            position: absolute;
            top: calc(100% + 10px);
            left: 0;
            right: 0;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 24px;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            transform: translateY(-10px);
            opacity: 0;
            visibility: hidden;
            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            align-items: stretch;
            gap: 12px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          }
          .menu.open { transform: translateY(0); opacity: 1; visibility: visible; pointer-events: auto; }
          
          .menu a { padding: 12px; border-radius: 8px; font-size: 1rem; }
          .menu a:hover { background: rgba(255,255,255,0.05); }
          .active-dot { display: none; }
          
          .hamburger { display: block; }
          .desktop-only { display: none; }
          .mobile-only { display: flex; flex-direction: column; width: 100%; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); }
          
          .mobile-btn {
            width: 100%; padding: 14px; border-radius: 8px; font-weight: 700; text-align: center;
            border: none; text-decoration: none; cursor: pointer; font-size: 0.95rem;
          }
          .mobile-btn.login { background: #00ff9d; color: #000; }
          .mobile-btn.dashboard { background: rgba(255,255,255,0.1); color: #fff; }
          .mobile-btn.logout { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;