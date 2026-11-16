import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import CompanySidebar from "./CompanySidebar";
import "./CompanyLayout.css";
import { requestRenewal } from "../../services/api";
import { getCompanyProfile } from "../../services/api";
import { toast } from "react-toastify";

const CompanyLayout = () => {
    const [expired, setExpired] = useState(false);
    const [expiredMessage, setExpiredMessage] = useState("");
    
    const [company, setCompany] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);

    const [renewing, setRenewing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("Annual Plan");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const handleSubscriptionExpired = (e) => {
            setExpired(true);
            if (e.detail?.message) setExpiredMessage(e.detail.message);
        };
        window.addEventListener("subscription_expired", handleSubscriptionExpired);
        
        return () => window.removeEventListener("subscription_expired", handleSubscriptionExpired);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getCompanyProfile();
                const comp = res.data.company;
                setCompany(comp);
                
                if (comp.subscriptionExpiry) {
                    const expiry = new Date(comp.subscriptionExpiry);
                    const now = new Date();
                    const diffTime = expiry - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays <= 7 && diffDays > 0) {
                        setShowBanner(true);
                        setDaysLeft(diffDays);
                    } else if (diffDays <= 0 || comp.subscriptionStatus !== 'Active') {
                        setExpired(true);
                        setExpiredMessage("Your subscription has expired or is inactive.");
                    }
                }
            } catch (err) {
                if (err?.response?.data?.errorType === 'SUBSCRIPTION_REQUIRED') {
                    setExpired(true);
                    setExpiredMessage(err.response.data.message);
                }
            }
        };
        fetchProfile();
    }, []);

    const handleRenew = async () => {
        setRenewing(true);
        try {
            await requestRenewal({ plan: selectedPlan, notes });
            toast.success("Renewal request submitted successfully!");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to submit renewal request.");
        } finally {
            setRenewing(false);
        }
    };

    return (
        <div className="company-layout">
            <CompanySidebar />
            
            <main className="company-content" style={{ position: 'relative' }}>
                {showBanner && !expired && (
                    <div style={{ background: '#f59e0b', color: '#fff', padding: '10px 20px', textAlign: 'center', fontWeight: '600', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                        <span>⚠️ Your subscription expires in {daysLeft} day(s).</span>
                        <button onClick={() => setExpired(true)} style={{ background: '#fff', color: '#f59e0b', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Renew Now</button>
                    </div>
                )}
                
                <Outlet />
            </main>

            {expired && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#111827', padding: '40px', borderRadius: '16px', maxWidth: '500px', width: '100%', border: '1px solid #374151', color: '#f3f4f6', textAlign: 'center' }}>
                        <h2 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '1.8rem' }}>Subscription Required</h2>
                        <p style={{ marginBottom: '25px', fontSize: '1.1rem', color: '#d1d5db' }}>{expiredMessage || "Your subscription has expired or is inactive. Please renew to restore access."}</p>
                        
                        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#9ca3af' }}>Select Plan to Renew</label>
                            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff', outline: 'none' }}>
                                <option value="Quarterly Plan">Quarterly Plan (₹3,799 / 3 mos)</option>
                                <option value="Annual Plan">Annual Plan (₹10,000 / yr)</option>
                            </select>
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#9ca3af' }}>Additional Notes (Optional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4b5563', background: '#1f2937', color: '#fff', outline: 'none' }} placeholder="Any specific requirements..."></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            {showBanner && (
                                <button onClick={() => setExpired(false)} disabled={renewing} style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid #4b5563', color: '#fff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            )}
                            <button onClick={handleRenew} disabled={renewing} style={{ flex: showBanner ? 1 : 2, padding: '14px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>
                                {renewing ? "Submitting..." : "Submit Renewal Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyLayout;
