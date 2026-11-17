import React from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import "../Company/CompanyLayout.css";

const EmployeeLayout = () => {
  return (
    <div className="company-layout">
      <EmployeeSidebar />
      <main className="company-content" style={{ position: "relative", minWidth: 0, width: "calc(100% - var(--sidebar-w))" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
