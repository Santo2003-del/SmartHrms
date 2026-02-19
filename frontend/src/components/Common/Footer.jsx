import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArrowUp
} from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="main-footer">
      <div className="footer-container">

        {/* COMPANY INFO */}
        <div className="footer-brand">
          <h3 className="brand-title">
            <span className="brand-gradient">SmartHrms</span>
          </h3>

          <p className="brand-desc">
            Empowering enterprises with cutting-edge HR solutions and intelligent workforce management.
            Transforming how organizations manage their people through innovation and excellence.
          </p>

          <div className="contact-info">
            <p><FaMapMarkerAlt /> Office No: 301 Ashwamedh Building, Veerbhadra Nagar, Baner, Pune, Maharashtra 411045</p>
            <p><FaPhoneAlt /> +44 151 528 9267</p>
            <p><FaPhoneAlt /> +44 20 8144 2701</p>
            <p>
              <FaEnvelope />
              <a href="mailto:reportsinsider@gmail.com" className="email-link">
                reportsinsider@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* PLATFORM */}
        <div className="footer-links">
          <h4>Platform</h4>
          <Link to="/">Home</Link>
          <Link to="/features">Features</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About Us</Link>
        </div>

        {/* SUPPORT */}
        <div className="footer-links">
          <h4>Support</h4>
          <Link to="/contact">Contact</Link>
          <Link to="/partner-with-us">Partner Program</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>2026 © SmartHrms | All rights reserved</p>
        <button onClick={scrollToTop} aria-label="Scroll to top"><FaArrowUp /></button>
      </div>

      {/* STYLES */}
      <style>{`
        .main-footer {
          background: #050505;
          color: #94a3b8;
          padding: 80px 0 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow: hidden;
          border-top: 1px solid #111;
        }

        .main-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00ff9d, transparent);
          box-shadow: 0 0 10px #00ff9d;
        }

        .footer-container {
          width: 90%;
          max-width: 1400px;
          margin: auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 60px;
          padding-bottom: 60px;
        }

        /* BRAND */
        .brand-title {
          font-size: 1.8rem;
          font-weight: 900;
          margin-bottom: 20px;
        }

        .brand-gradient {
          color: #fff;

        }

        .brand-desc {
          margin-bottom: 30px;
          font-size: 0.95rem;
          line-height: 1.7;
          color: #94a3b8;
        }

        .contact-info {
          margin-bottom: 30px;
        }

        .contact-info p {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .contact-info svg {
          color: #00ff9d;
          margin-top: 3px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 5px rgba(0, 255, 157, 0.5));
        }

        .email-link {
          color: #00ff9d;
          text-decoration: none;
          transition: 0.2s;
        }

        .email-link:hover {
          color: #fff;
          text-decoration: underline;

        }


        /* LINKS */
        .footer-links h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .footer-links a,
        .footer-links .external-link {
          display: block;
          margin-bottom: 12px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.95rem;
          transition: 0.2s;
          cursor: pointer;
        }

        .footer-links a:hover,
        .footer-links .external-link:hover {
          color: #00ff9d;
          padding-left: 8px;

        }


        /* BOTTOM */
        .footer-bottom {
          background: #000;
          padding: 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #111;
        }

        .footer-bottom p {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
          font-weight: 500;
          width: 90%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 5%;
        }

        .footer-bottom button {
          background: #111;
          border: 1px solid #222;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          color: #00ff9d;
          cursor: pointer;
          transition: 0.3s;
          position: absolute;
          right: 5%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-bottom button:hover {
          background: #00ff9d;
          color: #000;
          box-shadow: 0 0 20px rgba(0, 255, 157, 0.4);
          border-color: #00ff9d;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .footer-container {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 600px) {
          .footer-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 50px;
          }

          .brand-title,
          .contact-info p {
            justify-content: center;
          }

          .contact-info p {
            text-align: center;
            justify-content: center;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 20px;
            text-align: center;
            position: relative;
          }

          .footer-bottom button {
            position: static;
            margin-top: 10px;
          }

          .footer-links a:hover,
          .footer-links .external-link:hover {
            padding-left: 0;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;