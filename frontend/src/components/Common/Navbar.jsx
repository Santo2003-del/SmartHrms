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
      <div className={`nav-container ${scrolled ? "scrolled" : ""}`}>
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
                <button onClick={() => { logout('/'); closeMenu(); }} className="mobile-btn logout">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="mobile-btn login">Login</Link>
                <Link to="/register" onClick={closeMenu} className="mobile-btn get-started">Get Started</Link>
                <Link to="/partner-with-us" onClick={closeMenu} className="mobile-btn partner">Partner With Us</Link>
              </>
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
              <button onClick={() => logout('/')} className="logout-btn" title="Logout">
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
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          z-index: 99999;
          padding: 0;
          pointer-events: none;
        }

        .nav-container {
          pointer-events: auto;
          background: rgba(18, 18, 18, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          
          /* PADDING & SIZE */
          padding: 0 48px; 
          height: 72px;

          display: flex;
          align-items: center; /* STRICT VERTICAL CENTER */
          
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-container.scrolled {
          background: rgba(5, 5, 5, 0.98);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 40px rgba(0,0,0,0.7);
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
          margin-right: auto; /* Pushes menu and actions to the right */
          line-height: 1;
          overflow: visible; /* FORCE VISIBLE */
        }

        /* LOGO TEXT - Ensure baseline alignment with icon */
        .logo-text {
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: -0.5px;
          display: inline-block !important; /* Force inline block */
          white-space: nowrap;
        }

        /* LOGO ICON WRAPPER */
        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00ff9d; /* Existing color */
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
          margin-right: 32px; /* Space between links and actions */
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
          .nav-container {
            padding: 0 20px;
            justify-content: space-between;
            background: #0b0f19 !important; /* Force solid dark background */
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-bottom: 1px solid rgba(0, 255, 157, 0.15); /* Awesome subtle premium accent border */
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.9); /* Deep shadow for 3D separation */
            height: 64px;
          }
          
          .logo { margin-right: 0; position: relative; z-index: 10001; }
          .logo-text { font-size: 1.3rem; } /* Slightly scale down for sleek mobile fit */
          .logo-icon { font-size: 1.4rem; }
          
          .hamburger { 
            display: flex; 
            align-items: center; 
            justify-content: center;
            position: relative; 
            z-index: 10001; 
            width: 44px;
            height: 44px;
            background: rgba(0, 255, 157, 0.1); /* Visible premium button styling */
            border-radius: 8px;
            border: 1px solid rgba(0, 255, 157, 0.4);
            font-size: 1.5rem;
            color: #00ff9d;
            transition: all 0.2s ease;
          }
          
          .hamburger:hover, .hamburger:active {
            background: rgba(0, 255, 157, 0.2);
            border-color: rgba(0, 255, 157, 0.6);
            color: #00ff9d;
            transform: scale(0.95);
          }
          
          .menu { margin-right: 0; }
          
          /* CRITICAL BUG FIX: Solid Mobile Menu Overlay */
          .menu {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100vw;
            height: 100vh;
            background: #0b0f19; /* 100% SOLID DARK BACKGROUND */
            flex-direction: column;
            padding: 90px 24px 32px 24px; /* Extra top padding to clear the logo/hamburger */
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease;
            pointer-events: none;
            align-items: stretch;
            gap: 12px; /* Neat vertical column */
            z-index: 9999; /* CRITICAL: Highest z-index to cover hero text */
            overflow-y: auto;
            backdrop-filter: none; /* STRICTLY REMOVE glassmorphism */
            -webkit-backdrop-filter: none;
            box-shadow: none;
            border: none;
            transform: none; /* Remove transform issues */
            margin: 0;
          }
          
          .menu.open { 
            opacity: 1; 
            visibility: visible; 
            pointer-events: auto; 
          }
          
          .menu a { 
            padding: 14px 16px; 
            border-radius: 12px; 
            font-size: 1.1rem; 
            text-align: center; 
            background: rgba(255, 255, 255, 0.02); /* Subtle button look for links */
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
          }
          .menu a:active { 
            background: rgba(0, 255, 157, 0.1); 
            border-color: rgba(0, 255, 157, 0.3);
            color: #00ff9d;
          }
          .active-dot { display: none; }
          
          .desktop-only { display: none; }
          /* Partner With Us now visible on mobile */
          
          /* Push buttons to bottom of menu */
          .mobile-only { 
            display: flex; 
            flex-direction: column; 
            width: 100%; 
            gap: 14px; 
            margin-top: 20px; /* Instead of auto, give some spacing */
            padding-top: 24px; 
            border-top: 1px solid rgba(255, 255, 255, 0.05); /* Clean separator */
            padding-bottom: 40px; /* Extra padding at bottom so buttons are completely visible */
          }
          
          .mobile-btn {
            width: 100%; padding: 16px; border-radius: 12px; font-weight: 700; text-align: center;
            border: none; text-decoration: none; cursor: pointer; font-size: 1rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-shrink: 0; /* Prevent buttons from shrinking */
            min-height: 52px;
            max-height: 56px; /* Stop flex block children from stretching uncontrollably */
          }
          .mobile-btn.login { background: #00ff9d; color: #000; box-shadow: 0 4px 15px rgba(0, 255, 157, 0.2); }
          .mobile-btn.get-started { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); }
          .mobile-btn.partner { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.05); }
          .mobile-btn.dashboard { background: rgba(0, 255, 157, 0.1); color: #00ff9d; border: 1px solid rgba(0,255,157,0.3); }
          .mobile-btn.logout { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;