
/* Pagination helpers */
const attTotal = history.length;
const attTotalPages = Math.max(1, Math.ceil(attTotal / PAGE_SIZE));
const paginatedHistory = history.slice((attPage - 1) * PAGE_SIZE, attPage * PAGE_SIZE);

const leaveTotal = leaves.length;
const leaveTotalPages = Math.max(1, Math.ceil(leaveTotal / PAGE_SIZE));
const paginatedLeaves = leaves.slice((leavePage - 1) * PAGE_SIZE, leavePage * PAGE_SIZE);

const taskTotal = tasks.length;
const taskTotalPages = Math.max(1, Math.ceil(taskTotal / PAGE_SIZE));
const paginatedTasks = tasks.slice((taskPage - 1) * PAGE_SIZE, taskPage * PAGE_SIZE);

const renderPageNums = (current, total) => {
    const pages = [];
    if (total <= 5) { for (let i = 1; i <= total; i++) pages.push(i); }
    else {
        let l = Math.max(1, current - 1), r = Math.min(total, current + 1);
        if (current === 1) r = Math.min(total, 3);
        if (current === total) l = Math.max(1, total - 2);
        if (l > 1) { pages.push(1); if (l > 2) pages.push("..."); }
        for (let i = l; i <= r; i++) pages.push(i);
        if (r < total) { if (r < total - 1) pages.push("..."); pages.push(total); }
    }
    return pages;
};

return (
    <div className="edash">
        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && <div className="edash-backdrop" onClick={() => setSidebarOpen(false)} />}

        {/* ── LEFT SIDEBAR ── */}
        <aside className={`edash-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="edash-sb-brand">
                <div className="edash-sb-icon"><FaLayerGroup /></div>
                <h2 className="edash-sb-title">Smart<span>Hrms</span></h2>
                <button className="edash-sb-close" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
            </div>

            <nav className="edash-sb-nav">
                <span className="edash-sb-label">Main</span>
                {NAV_ITEMS.map(item => (
                    <button key={item.path}
                        className={`edash-sb-link ${location.pathname === item.path ? "active" : ""}`}
                        onClick={() => { navigate(item.path); setSidebarOpen(false); }}>
                        {item.icon} {item.label}
                    </button>
                ))}
            </nav>

            <div className="edash-sb-footer">
                <div className="edash-sb-user">
                    <div className="edash-sb-avatar">{(profile?.name || user.name || "E")[0].toUpperCase()}</div>
                    <div className="edash-sb-uinfo">
                        <span className="edash-sb-uname">{profile?.name || user.name}</span>
                        <span className="edash-sb-urole">{profile?.designation || "Employee"}</span>
                    </div>
                </div>
            </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div className="edash-main">
            {/* Top Header */}
            <header className="edash-header">
                <button className="edash-burger" onClick={() => setSidebarOpen(true)}><FaBars /></button>
                <div className="edash-hdr-right">
                    <div className="edash-date"><FaCalendarAlt /><span>{new Date().toLocaleDateString("en-GB")}</span></div>
                    <button className="edash-hdr-btn" onClick={() => fetchDashboardData(true)} style={{ opacity: refreshing ? 0.6 : 1 }}>
                        <FaRedoAlt /> {refreshing ? "…" : "Refresh"}
                    </button>
                    <button className="edash-logout" onClick={() => logout('/')} title="Logout"><FaSignOutAlt /></button>
                </div>
            </header>

            {/* Content */}
            <div className="edash-content">
                {/* ── Welcome Card ── */}
                <div className="edash-welcome">
                    <div className="edash-wl-left">
                        <div className="edash-wl-avatar">
                            <img src={getImageUrl(profile?.profileImage)} alt="Profile"
                                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")} />
                            <span className="edash-wl-dot" data-status={todayStatus}></span>
                        </div>
                        <div className="edash-wl-info">
                            <div className="edash-wl-tag">Welcome Back 👋</div>
                            <div className="edash-wl-name">{profile?.name || user.name}</div>
                            <div className="edash-wl-meta">
                                <span><b>{companyName}</b></span>
                                <span>Method: <b>{attendanceMethod}</b></span>
                                <span>TZ: <b>{tz}</b></span>
                                <span>Radius: <b>{radiusMeters}m</b></span>
                            </div>
                        </div>
                    </div>
                    <div className="edash-wl-right">
                        {todayStatus === "Not Started" ? (
                            <button className="edash-btn-p edash-pulse" onClick={() => handlePunchInit("in")}><FaPlay /> Start Shift</button>
                        ) : todayStatus === "Completed" ? (
                            <div className="edash-done"><FaCheckCircle /> Shift Completed</div>
                        ) : (
                            <div className="edash-punch-dual">
                                <button className="edash-btn-g" onClick={() => navigate("/employee/attendance")}><FaCoffee /> Break</button>
                                <button className="edash-btn-d" onClick={() => handlePunchInit("out")}><FaSignOutAlt /> End Day</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="edash-stats">
                    <div className="edash-sc"><div className="edash-sc-lbl">Present</div><div className="edash-sc-val">{presentThisMonth}</div><div className="edash-sc-hint">This month</div></div>
                    <div className="edash-sc"><div className="edash-sc-lbl">Approved Leaves</div><div className="edash-sc-val">{approvedLeavesCount}</div><div className="edash-sc-hint">All time</div></div>
                    <div className="edash-sc"><div className="edash-sc-lbl">Pending Tasks</div><div className="edash-sc-val">{pendingTasksCount}</div><div className="edash-sc-hint">Need action</div></div>
                    <div className="edash-sc"><div className="edash-sc-lbl">Onboarding</div><div className="edash-sc-val">{onboardingSummary.assigned ? `${onboardingSummary.pending}/${onboardingSummary.total}` : "--"}</div><div className="edash-sc-hint">{onboardingSummary.assigned ? "Pending steps" : "Not assigned"}</div></div>
                </div>

                {/* ── Tables ── */}
                <div className="edash-tables">
                    {/* Attendance */}
                    <section className="edash-panel">
                        <div className="edash-ph"><div className="edash-pt"><FaClipboardList /> Attendance (Recent)</div><button className="edash-link" onClick={() => navigate("/employee/attendance")}>View All</button></div>
                        <div className="edash-tw">
                            <table className="edash-tbl">
                                <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Net</th><th>Reports</th><th>Status</th></tr></thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr><td colSpan={6} className="edash-empty">No attendance records yet.</td></tr>
                                    ) : paginatedHistory.map((h) => {
                                        const m = String(h?.mode || "").toLowerCase();
                                        const displayStatus = m.includes("wfh") ? "WFH" : m.includes("unpaid") ? "Unpaid" : m.includes("paid") ? "Paid" : h.status || "—";
                                        const isManual = h.isManualEntry || h.source === 'MANUAL_HR';
                                        const hasMorning = !!h.plannedTasks;
                                        const hasDaily = !!h.dailyReport;
                                        return (
                                            <tr key={h._id || `${h.date}-${h.punchInTime}`}>
                                                <td><div className="edash-bold">{fmtDate(h.date, tz)}</div>
                                                    {isManual && <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 800 }}>Marked by HR</span>}
                                                </td>
                                                <td className="edash-green">{fmtTime(h.punchInTime, tz)}</td>
                                                <td className="edash-red">{fmtTime(h.punchOutTime, tz)}</td>
                                                <td>{h.netWorkHours || h.netHours || "--"}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', fontSize: '11px', fontWeight: 800 }}>
                                                        <span title={h.plannedTasks || "No Morning Plan"} style={{ color: hasMorning ? '#16a34a' : '#94a3b8', background: hasMorning ? '#dcfce7' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>M: {hasMorning ? "✅" : "—"}</span>
                                                        <span title={h.dailyReport || "No Daily Report"} style={{ color: hasDaily ? '#2563eb' : '#94a3b8', background: hasDaily ? '#dbeafe' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>E: {hasDaily ? "✅" : "—"}</span>
                                                    </div>
                                                </td>
                                                <td><span className={`edash-pill ${String(displayStatus || "").toLowerCase().replace(/\s/g, "-")}`}>{displayStatus}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {attTotalPages > 1 && (
                            <div className="edash-pg">
                                <span className="edash-pg-info">Showing {(attPage - 1) * PAGE_SIZE + 1}–{Math.min(attPage * PAGE_SIZE, attTotal)} of {attTotal}</span>
                                <div className="edash-pg-btns">
                                    <button className="edash-pg-btn" disabled={attPage === 1} onClick={() => setAttPage(p => p - 1)}><FaChevronLeft /></button>
                                    {renderPageNums(attPage, attTotalPages).map((p, i) => (<button key={i} className={`edash-pg-num ${p === attPage ? 'active' : ''} ${p === '...' ? 'dots' : ''}`} disabled={p === '...'} onClick={() => typeof p === 'number' && setAttPage(p)}>{p}</button>))}
                                    <button className="edash-pg-btn" disabled={attPage === attTotalPages} onClick={() => setAttPage(p => p + 1)}><FaChevronRight /></button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Leaves */}
                    <section className="edash-panel">
                        <div className="edash-ph"><div className="edash-pt"><FaPlaneDeparture /> Leaves (Recent)</div><button className="edash-link" onClick={() => navigate("/employee/leaves")}>Manage</button></div>
                        <div className="edash-tw">
                            <table className="edash-tbl">
                                <thead><tr><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
                                <tbody>
                                    {leaves.length === 0 ? (
                                        <tr><td colSpan={3} className="edash-empty">No leave requests yet.</td></tr>
                                    ) : paginatedLeaves.map((l) => (
                                        <tr key={l._id || `${l.startDate}-${l.endDate}`}>
                                            <td className="edash-bold">{normalizeLeaveType(l.leaveType) || "Leave"}</td>
                                            <td>{fmtDate(l.startDate, tz)} - {fmtDate(l.endDate, tz)}</td>
                                            <td><span className={`edash-pill ${String(l.status || "").toLowerCase()}`}>{l.status || "Pending"}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {leaveTotalPages > 1 && (
                            <div className="edash-pg">
                                <span className="edash-pg-info">Showing {(leavePage - 1) * PAGE_SIZE + 1}–{Math.min(leavePage * PAGE_SIZE, leaveTotal)} of {leaveTotal}</span>
                                <div className="edash-pg-btns">
                                    <button className="edash-pg-btn" disabled={leavePage === 1} onClick={() => setLeavePage(p => p - 1)}><FaChevronLeft /></button>
                                    {renderPageNums(leavePage, leaveTotalPages).map((p, i) => (<button key={i} className={`edash-pg-num ${p === leavePage ? 'active' : ''} ${p === '...' ? 'dots' : ''}`} disabled={p === '...'} onClick={() => typeof p === 'number' && setLeavePage(p)}>{p}</button>))}
                                    <button className="edash-pg-btn" disabled={leavePage === leaveTotalPages} onClick={() => setLeavePage(p => p + 1)}><FaChevronRight /></button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Tasks */}
                    <section className="edash-panel edash-panel-wide">
                        <div className="edash-ph"><div className="edash-pt"><FaTasks /> Tasks (My Work)</div><button className="edash-link" onClick={() => navigate("/employee/tasks")}>Open Tasks</button></div>
                        <div className="edash-hint">New joiner? ✅ First complete your <b>Onboarding</b> checklist from <b>My Onboarding</b>.</div>
                        <div className="edash-tw">
                            <table className="edash-tbl">
                                <thead><tr><th>Task</th><th>Due</th><th>Status</th><th style={{ width: 180 }}>Action</th></tr></thead>
                                <tbody>
                                    {tasks.length === 0 ? (
                                        <tr><td colSpan={4} className="edash-empty">No tasks assigned right now.</td></tr>
                                    ) : paginatedTasks.map((t) => {
                                        const status = String(t.status || "Pending");
                                        const s = status.toLowerCase();
                                        return (
                                            <tr key={t._id || t.id}>
                                                <td><div className="edash-bold">{t.title || "Untitled Task"}</div><div className="edash-muted">{t.description || ""}</div></td>
                                                <td>{t.deadline ? fmtDate(t.deadline, tz) : "--"}</td>
                                                <td><span className={`edash-pill ${s.replace(/\s/g, "-")}`}>{status}</span></td>
                                                <td>
                                                    {s === "pending" ? (
                                                        <button className="edash-mini greenBtn" onClick={() => updateTaskStatus(t._id, "In Progress")}>Start</button>
                                                    ) : s === "in progress" ? (
                                                        <button className="edash-mini blueBtn" onClick={() => navigate("/employee/tasks")}>Submit</button>
                                                    ) : s === "completed" ? (
                                                        <span className="edash-muted">Under Review</span>
                                                    ) : s === "verified" ? (
                                                        <span className="edash-okText">Verified ✅</span>
                                                    ) : (
                                                        <span className="edash-muted">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {taskTotalPages > 1 && (
                            <div className="edash-pg">
                                <span className="edash-pg-info">Showing {(taskPage - 1) * PAGE_SIZE + 1}–{Math.min(taskPage * PAGE_SIZE, taskTotal)} of {taskTotal}</span>
                                <div className="edash-pg-btns">
                                    <button className="edash-pg-btn" disabled={taskPage === 1} onClick={() => setTaskPage(p => p - 1)}><FaChevronLeft /></button>
                                    {renderPageNums(taskPage, taskTotalPages).map((p, i) => (<button key={i} className={`edash-pg-num ${p === taskPage ? 'active' : ''} ${p === '...' ? 'dots' : ''}`} disabled={p === '...'} onClick={() => typeof p === 'number' && setTaskPage(p)}>{p}</button>))}
                                    <button className="edash-pg-btn" disabled={taskPage === taskTotalPages} onClick={() => setTaskPage(p => p + 1)}><FaChevronRight /></button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>

        {/* ── MODALS (unchanged) ── */}
        {showTextModal && (
            <div className="modalOverlay">
                <div className="modalCard">
                    <div className="modalHead">
                        <div className="modalTitle">{actionType === "in" ? "Morning Report" : "Daily Report"}</div>
                        <button className="iconBtn" onClick={() => setShowTextModal(false)}><FaTimes /></button>
                    </div>
                    <textarea className="modalText" placeholder={actionType === "in" ? "Today's plan / tasks..." : "Today's work summary..."} value={reportText} onChange={(e) => setReportText(e.target.value)} />
                    <button className="edash-btn-p" onClick={proceedToVerification}>Proceed <FaArrowRight /></button>
                </div>
            </div>
        )}

        {showPunchModal && (
            <div className="modalOverlay">
                <div className="modalCard wide">
                    <div className="modalHead">
                        <div className="modalTitle">Verification</div>
                        <button className="iconBtn" onClick={() => setShowPunchModal(false)}><FaTimes /></button>
                    </div>
                    <div className="locStrip">
                        <div className={`locPill ${officePos && distanceMeters != null && !isInsideRadius ? "bad" : "ok"}`}>
                            <FaMapMarkerAlt />
                            <span>{officePos ? `Distance: ${distanceLabel(distanceMeters)} (Limit: ${radiusMeters}m)` : "Office location not configured (Admin must set office lat/lng)."}</span>
                        </div>
                        <div className="locMeta">
                            <span>Accuracy: {gpsAccuracy != null ? `±${Math.round(gpsAccuracy)}m` : "--"}</span>
                            <button className="edash-mini" onClick={fetchLocation} type="button"><FaRedoAlt /> Refresh</button>
                        </div>
                    </div>
                    <div className="verifyGrid">
                        <div className="mapBox">
                            <VerifyMap apiKey={GOOGLE_MAPS_API_KEY} currentPos={currentPos} officePos={officePos} circleOptions={circleOptions} />
                            {isLocating && (<div className="gpsOverlay"><FaSpinner className="spin" /> Detecting Location…</div>)}
                        </div>
                        <div className="faceBox">
                            <div className={`faceWrap ${officePos && distanceMeters != null && !isInsideRadius ? "blocked" : ""}`}>
                                <FaceCapture onCapture={onFaceVerified} btnText="Verify & Punch" />
                                {officePos && distanceMeters != null && !isInsideRadius && (<div className="blockOverlay">❌ You are outside office radius. Move closer and refresh location.</div>)}
                            </div>
                            <div className="smallHint">Tip: Good light + face centered = fast verification ✅</div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── STYLES ── */}
        <style>{`
        /* ===== LAYOUT ===== */
        .edash{display:flex;min-height:100vh;background:#f8fafc;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a}
        .edash-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:90}

        /* ===== SIDEBAR ===== */
        .edash-sidebar{position:fixed;top:0;left:0;width:260px;height:100vh;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;z-index:100;transition:transform .3s ease}
        .edash-sb-brand{height:70px;display:flex;align-items:center;padding:0 24px;border-bottom:1px solid #e2e8f0;gap:12px}
        .edash-sb-icon{width:36px;height:36px;background:#10b981;color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
        .edash-sb-title{font-size:1.2rem;font-weight:700;color:#0f172a;margin:0}
        .edash-sb-title span{color:#10b981}
        .edash-sb-close{display:none;margin-left:auto;background:none;border:1px solid #e2e8f0;border-radius:8px;width:32px;height:32px;align-items:center;justify-content:center;cursor:pointer;font-size:14px;color:#64748b}
        .edash-sb-nav{flex:1;padding:24px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:6px}
        .edash-sb-label{font-size:.75rem;text-transform:uppercase;color:#64748b;font-weight:600;padding-left:12px;margin-bottom:8px;letter-spacing:.5px}
        .edash-sb-link{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:8px;color:#64748b;font-weight:500;transition:all .2s;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-size:.95rem;font-family:inherit}
        .edash-sb-link:hover{background:#f1f5f9;color:#0f172a}
        .edash-sb-link.active{background:#ecfdf5;color:#10b981;font-weight:600}
        .edash-sb-footer{padding:16px;border-top:1px solid #e2e8f0;background:#f8fafc}
        .edash-sb-user{display:flex;align-items:center;gap:12px}
        .edash-sb-avatar{width:40px;height:40px;background:#10b981;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0}
        .edash-sb-uinfo{display:flex;flex-direction:column;overflow:hidden}
        .edash-sb-uname{font-size:.9rem;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px}
        .edash-sb-urole{font-size:.75rem;color:#64748b}

        /* ===== MAIN ===== */
        .edash-main{margin-left:260px;width:calc(100% - 260px);min-height:100vh;display:flex;flex-direction:column}
        .edash-header{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:flex-end;padding:14px 24px;gap:10px}
        .edash-burger{display:none;border:none;background:transparent;font-size:18px;cursor:pointer;color:#0f172a;margin-right:auto}
        .edash-hdr-right{display:flex;align-items:center;gap:10px}
        .edash-date{display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:#ecfdf5;color:#059669;font-weight:700;font-size:13px;border:1px solid #d1fae5}
        .edash-hdr-btn{border:1px solid #e2e8f0;background:#fff;padding:8px 14px;border-radius:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#0f172a;transition:.15s}
        .edash-hdr-btn:hover{background:#f8fafc}
        .edash-logout{width:38px;height:38px;display:grid;place-items:center;border:none;border-radius:12px;cursor:pointer;background:#fee2e2;color:#ef4444;font-size:14px;transition:.15s}
        .edash-logout:hover{background:#fecaca}
        .edash-content{padding:24px;display:flex;flex-direction:column;gap:20px;max-width:1200px;width:100%}

        /* ===== WELCOME ===== */
        .edash-welcome{background:linear-gradient(135deg,#ecfdf5 0%,#fff 65%);border:1px solid #d1fae5;border-radius:16px;padding:24px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
        .edash-wl-left{display:flex;align-items:center;gap:20px}
        .edash-wl-avatar{position:relative;width:72px;height:72px;border-radius:50%;border:3px solid #10b981;padding:3px;background:#fff;flex-shrink:0}
        .edash-wl-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
        .edash-wl-dot{width:14px;height:14px;border-radius:50%;position:absolute;bottom:2px;right:2px;background:#d1d5db;border:2px solid #fff}
        .edash-wl-dot[data-status="Working"]{background:#10b981}
        .edash-wl-dot[data-status="On Break"]{background:#f59e0b}
        .edash-wl-dot[data-status="Completed"]{background:#2563eb}
        .edash-wl-tag{font-size:13px;color:#64748b;font-weight:600}
        .edash-wl-name{font-size:22px;font-weight:800;color:#0f172a;margin:4px 0}
        .edash-wl-meta{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#64748b;font-weight:600}
        .edash-wl-meta b{color:#0f172a}
        .edash-wl-right{display:flex;align-items:center}
        .edash-punch-dual{display:flex;gap:10px}
        .edash-btn-p{border:none;padding:12px 20px;border-radius:12px;background:#10b981;color:#fff;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 20px rgba(16,185,129,.2);transition:.15s;white-space:nowrap;width:100%}
        .edash-btn-p:hover{background:#059669;transform:translateY(-1px)}
        .edash-pulse{animation:edPulse 1.5s infinite}
        @keyframes edPulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.35)}70%{box-shadow:0 0 0 12px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}}
        .edash-done{padding:10px 16px;border-radius:12px;border:1px solid #bbf7d0;background:#ecfdf5;color:#065f46;font-weight:700;display:flex;align-items:center;gap:8px;white-space:nowrap}
        .edash-btn-g{border:1px solid #e2e8f0;padding:10px 16px;border-radius:12px;background:#fff;color:#0f172a;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap}
        .edash-btn-g:hover{border-color:#cbd5e1}
        .edash-btn-d{border:none;padding:10px 16px;border-radius:12px;background:#ef4444;color:#fff;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap}
        .edash-btn-d:hover{background:#dc2626}

        /* ===== STAT CARDS ===== */
        .edash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .edash-sc{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px;box-shadow:0 4px 12px rgba(15,23,42,.03)}
        .edash-sc-lbl{color:#64748b;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.8px}
        .edash-sc-val{font-weight:800;font-size:28px;margin-top:8px;color:#0f172a}
        .edash-sc-hint{color:#64748b;font-weight:600;font-size:12px;margin-top:4px}

        /* ===== TABLES ===== */
        .edash-tables{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .edash-panel-wide{grid-column:1/-1}
        .edash-panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:20px;box-shadow:0 4px 12px rgba(15,23,42,.03);overflow:hidden}
        .edash-ph{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
        .edash-pt{font-weight:800;display:flex;align-items:center;gap:10px;font-size:15px}
        .edash-link{border:none;background:#f1f5f9;color:#0f172a;font-weight:700;padding:8px 12px;border-radius:10px;cursor:pointer;font-size:13px;transition:.15s}
        .edash-link:hover{background:#e2e8f0}
        .edash-hint{background:#f8fafc;border:1px dashed #e2e8f0;padding:10px 12px;border-radius:12px;margin-bottom:12px;font-weight:700;color:#334155;font-size:12px}
        .edash-tw{overflow-x:auto}
        .edash-tbl{width:100%;border-collapse:collapse;min-width:500px}
        .edash-tbl thead th{text-align:left;padding:12px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid #f1f5f9;font-weight:700}
        .edash-tbl tbody td{padding:12px;border-bottom:1px solid #f8fafc;font-weight:700;font-size:13px;color:#0f172a;vertical-align:top}
        .edash-tbl tbody tr:hover{background:#fcfcfd}
        .edash-empty{text-align:center;color:#64748b!important;font-weight:700;padding:24px!important}
        .edash-bold{font-weight:800}
        .edash-muted{color:#64748b;font-weight:700;font-size:12px;margin-top:4px}
        .edash-green{color:#16a34a}
        .edash-red{color:#ef4444}
        .edash-okText{font-weight:800;color:#065f46}

        /* ===== PILLS ===== */
        .edash-pill{display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid #e2e8f0;background:#f8fafc;text-transform:capitalize}
        .edash-pill.present,.edash-pill.approved,.edash-pill.verified{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}
        .edash-pill.pending,.edash-pill.in-progress{background:#fffbeb;border-color:#fde68a;color:#92400e}
        .edash-pill.rejected,.edash-pill.absent,.edash-pill.unpaid{background:#fee2e2;border-color:#fecaca;color:#991b1b}
        .edash-pill.wfh{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}
        .edash-pill.paid{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}

        /* ===== PAGINATION ===== */
        .edash-pg{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid #f1f5f9;flex-wrap:wrap}
        .edash-pg-info{font-size:12px;color:#64748b;font-weight:600}
        .edash-pg-btns{display:flex;align-items:center;gap:4px}
        .edash-pg-btn,.edash-pg-num{border:1px solid #e2e8f0;background:#fff;padding:6px 10px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12px;color:#0f172a;transition:.15s}
        .edash-pg-btn:disabled{opacity:.4;cursor:not-allowed}
        .edash-pg-num.active{background:#10b981;color:#fff;border-color:#10b981}
        .edash-pg-num.dots{border:none;background:none;cursor:default;padding:6px 4px}

        /* ===== MINI BUTTONS ===== */
        .edash-mini{border:1px solid #e2e8f0;background:#fff;padding:7px 12px;border-radius:10px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:12px}
        .edash-mini.greenBtn{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}
        .edash-mini.blueBtn{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8}

        /* ===== MODALS ===== */
        .modalOverlay{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}
        .modalCard{width:100%;max-width:540px;background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.18);padding:20px}
        .modalCard.wide{max-width:1100px}
        .modalHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
        .modalTitle{font-weight:800;font-size:16px}
        .iconBtn{width:38px;height:38px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:grid;place-items:center}
        .modalText{width:100%;min-height:120px;border:1px solid #e2e8f0;border-radius:14px;padding:12px;outline:none;font-weight:700;color:#0f172a;margin-bottom:12px;font-family:inherit;font-size:14px;resize:vertical}
        .locStrip{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
        .locPill{flex:1;display:flex;align-items:center;gap:10px;border-radius:14px;padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:800;color:#334155;min-width:260px;font-size:13px}
        .locPill.ok{background:#ecfdf5;border-color:#bbf7d0;color:#065f46}
        .locPill.bad{background:#fee2e2;border-color:#fecaca;color:#991b1b}
        .locMeta{display:flex;gap:10px;align-items:center;color:#64748b;font-weight:800;font-size:13px}
        .verifyGrid{display:grid;grid-template-columns:1.4fr 1fr;gap:12px;align-items:start}
        .mapBox{position:relative;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;min-height:260px;background:#fff}
        .mapFallback{height:260px;display:grid;place-items:center;color:#64748b;font-weight:800}
        .gpsOverlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:900;color:#0f172a;background:rgba(255,255,255,.6);backdrop-filter:blur(6px)}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .warnBox{padding:12px;background:#fffbeb;border:1px solid #fde68a;color:#92400e;font-weight:800;border-radius:14px;margin:10px}
        .faceWrap{position:relative;border:1px solid #e2e8f0;border-radius:16px;padding:10px;background:#fff}
        .blockOverlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:14px;background:rgba(15,23,42,.65);color:#fff;font-weight:900;border-radius:16px}
        .smallHint{margin-top:10px;color:#64748b;font-weight:700;font-size:12px}

        /* ===== LOADER ===== */
        .edash-loader{min-height:100vh;display:grid;place-items:center;gap:10px;background:#f8fafc;font-family:Inter,system-ui,sans-serif}
        .edash-spin{width:46px;height:46px;border-radius:50%;border:5px solid #e5e7eb;border-top-color:#10b981;animation:spin 1s linear infinite}
        .edash-loader-txt{font-weight:800;color:#334155}

        /* ===== RESPONSIVE ===== */
        @media(max-width:1024px){
          .edash-sidebar{transform:translateX(-100%)}
          .edash-sidebar.open{transform:translateX(0)}
          .edash-sb-close{display:flex}
          .edash-main{margin-left:0;width:100%}
          .edash-burger{display:inline-flex}
          .edash-stats{grid-template-columns:repeat(2,1fr)}
          .edash-tables{grid-template-columns:1fr}
          .verifyGrid{grid-template-columns:1fr}
        }
        @media(max-width:560px){
          .edash-stats{grid-template-columns:1fr}
          .edash-welcome{flex-direction:column;align-items:flex-start}
          .edash-wl-left{flex-direction:column;align-items:flex-start}
          .edash-wl-right{width:100%}
          .edash-punch-dual{width:100%}
          .edash-btn-p{width:100%}
          .edash-content{padding:16px}
        }
      `}</style>
    </div>
);


export default EmployeeDashboard; v
