import React from "react";
import { Outlet } from "react-router-dom";
import CompanySidebar from "./CompanySidebar";
import "./CompanyLayout.css";

const CompanyLayout = () => {
    return (
        <div className="company-layout">
            <CompanySidebar />
            <main className="company-content">
                <Outlet />
            </main>
        </div>
    );
};

export default CompanyLayout;
