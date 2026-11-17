import React from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "./SuperAdminSidebar";
import "../Company/CompanyLayout.css";

const SuperAdminLayout = () => {
  return (
    <div className="company-layout">
      <SuperAdminSidebar />
      <main className="company-content" style={{ position: "relative", minWidth: 0, width: "calc(100% - var(--sidebar-w))" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
