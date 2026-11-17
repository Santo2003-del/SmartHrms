import React from "react";
import { Outlet } from "react-router-dom";
import HrSidebar from "./HrSidebar";
import "../Company/CompanyLayout.css";

const HrLayout = () => {
  return (
    <div className="company-layout">
      <HrSidebar />
      <main className="company-content" style={{ position: "relative", minWidth: 0, width: "calc(100% - var(--sidebar-w))" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default HrLayout;
