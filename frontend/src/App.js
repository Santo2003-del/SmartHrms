import React, { lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context & Utils
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './utils/ScrollToTop';

// Common Components
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';

// Public
import Home from './pages/Landing/Home';
import About from './pages/Landing/About';
import Services from './pages/Landing/Services';
import Features from './pages/Landing/Features';
import Contact from './pages/Landing/Contact';
import Careers from './pages/public/Careers'; // ✅ Imported
import PrivacyPolicy from './pages/Landing/PrivacyPolicy';
import TermsConditions from './pages/Landing/TermsConditions';
import Documentation from './pages/Landing/Documentation';

// Auth
import SuperAdminLogin from './pages/Auth/SuperAdminLogin';
import CompanyLogin from './pages/Auth/CompanyLogin';
import AdminLogin from './pages/Auth/AdminLogin';
import EmployeeLogin from './pages/Auth/EmployeeLogin';
import LoginGateway from './pages/Auth/LoginGateway'; // ✅ Imported Gateway
import Register from './pages/Auth/Register';
import CompanyInquiry from './pages/Auth/CompanyInquiry';

// Existing Dashboards
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import InquiryManagement from './pages/SuperAdmin/InquiryManagement';
// const LeaveManagement = lazy(() => import("./pages/SuperAdmin/LeaveManagement"));
const SupportTicketManagement = lazy(() => import("./pages/SuperAdmin/SupportTicketManagement"));

import CompanyDashboard from './pages/Company/CompanyDashboard';
import HRManagement from './pages/Company/HRManagement';
import EmployeeManagement from './pages/Company/EmployeeManagement';
import CompanyExpenditure from './pages/Company/CompanyExpenditure';

import HrAdminDashboard from './pages/Admin/HrAdminDashboard';
import AdminEmployeeView from './pages/Admin/HrAdminEmployeeView';

import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import Attendance from './pages/Employee/Attendance';
import LeaveRequest from './pages/Employee/LeaveRequest';

// ✅ NEW UX Component
import Unauthorized from "./components/Unauthorized";

// ✅ NEW Tasks
import Tasks from "./pages/Tasks/Tasks";

// ✅ NEW Recruitment
import Jobs from "./pages/Recruitment/Jobs";
import Applications from "./pages/Recruitment/Applications";
import Interviews from "./pages/Recruitment/Interviews";

// ✅ NEW Onboarding
import Templates from "./pages/Onboarding/Templates";
import Assignments from "./pages/Onboarding/Assignments";
import MyOnboarding from "./pages/Onboarding/MyOnboarding";

// ✅ NEW Layouts
import CompanyLayout from "./components/Company/CompanyLayout";

/* =========================================================
   CONDITIONAL NAVBAR COMPONENT
   ========================================================= */
const ConditionalNavbar = () => {
  const location = useLocation();

  const hideNavbarPrefixes = [
    '/superadmin',
    '/super-admin',
    '/company',
    '/hr',
    '/employee'
  ];

  const shouldHide = hideNavbarPrefixes.some(prefix => location.pathname.startsWith(prefix));
  if (shouldHide) return null;
  return <Navbar />;
};

/* =========================================================
   CONDITIONAL FOOTER COMPONENT
   ========================================================= */
const ConditionalFooter = () => {
  const location = useLocation();

  const hideFooterPrefixes = [
    '/superadmin',
    '/super-admin',
    '/company',
    '/hr',
    '/employee'
  ];

  const shouldHide = hideFooterPrefixes.some(prefix => location.pathname.startsWith(prefix));
  if (shouldHide) return null;
  return <Footer />;
};

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <ConditionalNavbar />

      <div className="main-content">
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/partner-with-us" element={<CompanyInquiry />} />

          {/* ✅ CAREERS (Publicly Accessible) */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:companyId" element={<Careers />} />

          {/* AUTH */}
          <Route path="/login" element={<LoginGateway />} /> {/* ✅ Gateway Route */}
          <Route path="/system-access-gmv2026" element={<SuperAdminLogin />} />
          <Route path="/company-login" element={<CompanyLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/register" element={<Register />} />

          {/* UX */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* SUPER ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['SuperAdmin']} />}>
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/inquiries" element={<InquiryManagement />} />
            {/* <Route path="/super-admin/leaves" element={<LeaveManagement />} /> */}
            <Route path="/super-admin/support" element={<SupportTicketManagement />} />
          </Route>

          {/* COMPANY OWNER */}
          <Route element={<ProtectedRoute allowedRoles={['CompanyAdmin']} />}>
            <Route element={<CompanyLayout />}>
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/hr-management" element={<HRManagement />} />
              <Route path="/company/employee-management" element={<EmployeeManagement />} />
              <Route path="/company/expenditure" element={<CompanyExpenditure />} />

              {/* ✅ NEW Tasks */}
              <Route path="/company/tasks" element={<Tasks />} />

              {/* ✅ NEW Recruitment */}
              <Route path="/company/recruitment/jobs" element={<Jobs />} />
              <Route path="/company/recruitment/applications" element={<Applications />} />
              <Route path="/company/recruitment/interviews" element={<Interviews />} />

              {/* ✅ NEW Onboarding */}
              <Route path="/company/onboarding/templates" element={<Templates />} />
              <Route path="/company/onboarding/assignments" element={<Assignments />} />
            </Route>
          </Route>

          {/* HR ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/hr/dashboard" element={<HrAdminDashboard />} />
            <Route path="/hr/view-employee/:userId" element={<AdminEmployeeView />} />

            {/* ✅ NEW Tasks */}
            <Route path="/hr/tasks" element={<Tasks />} />

            {/* ✅ NEW Recruitment */}
            <Route path="/hr/recruitment/jobs" element={<Jobs />} />
            <Route path="/hr/recruitment/applications" element={<Applications />} />
            <Route path="/hr/recruitment/interviews" element={<Interviews />} />

            {/* ✅ NEW Onboarding */}
            <Route path="/hr/onboarding/templates" element={<Templates />} />
            <Route path="/hr/onboarding/assignments" element={<Assignments />} />
          </Route>

          {/* EMPLOYEE */}
          <Route element={<ProtectedRoute allowedRoles={['Employee', 'Admin']} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<Attendance />} />
            <Route path="/employee/leaves" element={<LeaveRequest />} />

            {/* ✅ NEW Tasks & Onboarding */}
            <Route path="/employee/tasks" element={<Tasks />} />
            <Route path="/employee/onboarding" element={<MyOnboarding />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Home />} />

        </Routes>
      </div>

      <ConditionalFooter />

      <style>{`
        body {
          margin: 0;
          background: #050505;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .main-content {
          min-height: 100vh;
        }
      `}</style>

    </AuthProvider>
  );
}

export default App;