import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../services/api";
import ApplicationModal from "../../components/Modals/ApplicationModal";
import "./Careers.css"; // Import the custom CSS
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaSpinner,
  FaFilter,
  FaClock,
  FaRupeeSign,
  FaArrowRight,
  FaTimes,
  FaBolt,
  FaRocket,
  FaHeart,
  FaUsers,
  FaLaptopCode,
  FaGraduationCap
} from "react-icons/fa";
import { toast } from "react-toastify";

// --- Helper: Relative time ---
const timeAgo = (iso) => {
  if (!iso) return "Recently";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "Recently";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

// --- Helper: Status Color ---
const stageColor = (s = "") => {
  const key = String(s || "").toLowerCase();
  if (key.includes("reject")) return "bg-red-900/30 text-red-400 border-red-800/50";
  if (key.includes("hire")) return "bg-green-900/30 text-green-400 border-green-800/50";
  if (key.includes("offer")) return "bg-blue-900/30 text-blue-400 border-blue-800/50";
  if (key.includes("interview")) return "bg-yellow-900/30 text-yellow-400 border-yellow-800/50";
  if (key.includes("screen")) return "bg-purple-900/30 text-purple-400 border-purple-800/50";
  return "bg-slate-800/50 text-slate-300 border-slate-700/50";
};

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  // URL Params
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();
  const queryCompanyId = searchParams.get("companyId");
  const targetCompanyId = companyId || queryCompanyId;

  // Track status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ email: "", applicationId: "" });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    types: new Set(),
    remoteOnly: false,
    dept: new Set(),
    sort: "newest",
  });

  useEffect(() => {
    fetchPublicJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetCompanyId]);

  const fetchPublicJobs = async () => {
    try {
      setLoading(true);
      const url = targetCompanyId
        ? `/recruitment/public/jobs?companyId=${targetCompanyId}`
        : `/recruitment/public/jobs`;

      const res = await API.get(url);
      const arr = Array.isArray(res.data) ? res.data : [];
      setJobs(arr);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplied = (payload) => {
    if (!payload?.trackId) return;
    setStatusForm({ email: payload.email || "", applicationId: payload.trackId });
    setStatusResult(null);
    setShowStatusModal(true);
  };

  useEffect(() => {
    if (!showStatusModal) return;
    try {
      const saved = JSON.parse(localStorage.getItem("last_application_track") || "null");
      if (saved?.trackId) {
        setStatusForm((p) => ({
          email: p.email || saved.email || "",
          applicationId: p.applicationId || saved.trackId || "",
        }));
      }
    } catch (_) { }
  }, [showStatusModal]);

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    try {
      setStatusLoading(true);
      const res = await API.post("/recruitment/public/check-status", statusForm);
      setStatusResult(res.data);
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Invalid details or Application not found.");
      setStatusResult(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const departments = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => {
      const d = String(j.department || "").trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let list = jobs.filter((job) => {
      const title = String(job.title || "").toLowerCase();
      const dept = String(job.department || "").toLowerCase();
      const loc = String(job.location || "").toLowerCase();
      const company = String(job.companyId?.name || job.companyId?.companyName || "").toLowerCase();

      const matchesTerm =
        !term ||
        title.includes(term) ||
        dept.includes(term) ||
        loc.includes(term) ||
        company.includes(term);

      if (!matchesTerm) return false;

      if (filters.types.size > 0) {
        if (!filters.types.has(String(job.employmentType || ""))) return false;
      }

      if (filters.remoteOnly) {
        const isRemote = loc.includes("remote") || loc.includes("work from home") || loc.includes("wfh");
        if (!isRemote) return false;
      }

      if (filters.dept.size > 0) {
        if (!filters.dept.has(String(job.department || ""))) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      if (filters.sort === "oldest") return da - db;
      return db - da;
    });

    return list;
  }, [jobs, searchTerm, filters]);

  const toggleSet = (key, value) => {
    setFilters((p) => {
      const next = new Set(p[key]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...p, [key]: next };
    });
  };

  const resetFilters = () => {
    setFilters({ types: new Set(), remoteOnly: false, dept: new Set(), sort: "newest" });
  };

  return (
    <div className="career-page-wrapper">
      {/* 1. HERO SECTION (Split Layout) */}
      <div className="careers-hero">
        <div className="careers-container hero-split">

          <div className="hero-text">
            <div className="hero-badge">
              <FaBolt className="text-yellow-400" /> Hiring Now
            </div>
            <h1 className="hero-title">
              Find Your <span className="gradient-text">Dream Job</span> With Us
            </h1>
            <p className="hero-subtitle">
              Join a team of innovators and creators. Explore exciting career opportunities that match your passion.
            </p>

            {/* Glassmorphism Search */}
            <div className="search-wrapper">
              <div className="search-hero-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search job title, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="hero-image-container">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
              alt="Team Collaboration"
              className="hero-image"
            />
          </div>

        </div>
      </div>

      {/* 2. MAIN CONTENT (Sidebar + Job Grid) */}
      <div className="careers-container content-layout">

        {/* Filters Sidebar */}
        <aside className="filters-panel">
          <div className="filters-card">
            <div className="filters-header">
              <h3><FaFilter /> Filter Jobs</h3>
              <button className="reset-filters-btn" onClick={resetFilters}>Reset</button>
            </div>

            <div className="filter-section">
              <div className="filter-title">Employment Type</div>
              {["Full-time", "Part-time", "Contract", "Intern"].map((t) => (
                <label key={t} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={filters.types.has(t)}
                    onChange={() => toggleSet("types", t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <div className="filter-title">Department</div>
              {departments.length === 0 ? (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>No departments</div>
              ) : (
                departments.map((d) => (
                  <label key={d} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={filters.dept.has(d)}
                      onChange={() => toggleSet("dept", d)}
                    />
                    <span>{d}</span>
                  </label>
                ))
              )}
            </div>

            <div className="filter-section">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={filters.remoteOnly}
                  onChange={() => setFilters(p => ({ ...p, remoteOnly: !p.remoteOnly }))}
                />
                <span style={{ fontWeight: 600 }}>Remote / WFH Only</span>
              </label>
            </div>

            <button
              className="track-application-btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: 'var(--primary-color)',
                color: '#000',
                fontWeight: '800',
                marginTop: '10px',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => {
                setStatusResult(null);
                setShowStatusModal(true);
              }}
            >
              Track Application
            </button>

          </div>
        </aside>

        {/* Jobs Grid */}
        <div className="job-list-area">
          <div className="list-header-bar">
            <h2 className="list-title">
              Open Positions <span className="count-bubble">{filteredJobs.length}</span>
            </h2>
            <select
              className="sort-select"
              value={filters.sort}
              onChange={(e) => setFilters(p => ({ ...p, sort: e.target.value }))}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {loading ? (
            <div className="loader-box">
              <FaSpinner className="spinner-icon" />
              <p style={{ marginTop: '1rem', color: '#cbd5e1' }}>Loading positions...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-box">
              <FaSearch style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3 style={{ color: '#ffffff' }}>No jobs found</h3>
              <p style={{ color: '#cbd5e1' }}>Try adjusting your search or filters.</p>
              <button className="reset-filters-btn" onClick={resetFilters} style={{ marginTop: '1rem' }}>Clear All Filters</button>
            </div>
          ) : (
            <div className="job-grid">
              {filteredJobs.map((job) => (
                <div key={job._id} className="job-card-modern">
                  <div className="job-head">
                    <div className="company-logo-box">
                      {(job.companyId?.name || job.companyId?.companyName || "C").charAt(0)}
                    </div>
                    <div className="job-info-main">
                      <h3 className="job-title-text">{job.title}</h3>
                      <p className="job-company-text">
                        <FaBuilding style={{ fontSize: '0.8rem', marginRight: '4px' }} />
                        {job.companyId?.name || job.companyId?.companyName || "Company"}
                      </p>
                    </div>
                    {job.employmentType && <span className="job-type-tag">{job.employmentType}</span>}
                  </div>

                  <div className="job-details-row">
                    <div className="detail-item">
                      <FaBriefcase /> {job.experience || "Fresher"}
                    </div>
                    <div className="detail-item">
                      <FaMapMarkerAlt /> {job.location || "Remote"}
                    </div>
                    <div className="detail-item">
                      <FaRupeeSign /> {job.salaryRange || "Competitive"}
                    </div>
                    {job.passingYear && (
                      <div className="detail-item highlight-detail">
                        <FaGraduationCap /> Batch {job.passingYear}
                      </div>
                    )}
                  </div>

                  <p className="job-desc">
                    {(job.description || "").substring(0, 150)}...
                  </p>

                  <div className="job-tags">
                    {job.skills?.slice(0, 4).map((skill, i) => (
                      <span key={i} className="tag-pill">{skill}</span>
                    ))}
                  </div>

                  <div className="job-footer-row">
                    <span className="posted-date">
                      <FaClock /> {timeAgo(job.createdAt)}
                    </span>
                    <button className="apply-button" onClick={() => setSelectedJob(job)}>
                      Apply Now <FaArrowRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. WHY JOIN US - 4 Column Grid */}
      <section className="why-join-section">
        <div className="careers-container">
          <div className="section-head">
            <h2 style={{ color: '#ffffff' }}>Why Join Us?</h2>
            <p style={{ color: '#cbd5e1' }}>We believe in growth, balance, and innovation.</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="icon-circle icon-blue"><FaRocket /></div>
              <h3>Fast-Paced Growth</h3>
              <p>Accelerate your career with rapid advancement opportunities.</p>
            </div>
            <div className="benefit-card">
              <div className="icon-circle icon-red"><FaHeart /></div>
              <h3>Health & Wellness</h3>
              <p>Comprehensive benefits to take care of you and your family.</p>
            </div>
            <div className="benefit-card">
              <div className="icon-circle icon-green"><FaUsers /></div>
              <h3>Collaborative Culture</h3>
              <p>Work with humble, talented people who support each other.</p>
            </div>
            <div className="benefit-card">
              <div className="icon-circle icon-purple"><FaLaptopCode /></div>
              <h3>Flexible Work</h3>
              <p>Remote options and flexible hours for a healthy work-life balance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modals remain mostly the same structure, styled via global CSS or inline if minimal */}
      {showStatusModal && (
        <div className="modal-backdrop" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Track Application</h3>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCheckStatus}>
                <div className="form-group">
                  <label>Registered Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={statusForm.email}
                    onChange={e => setStatusForm({ ...statusForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Application ID / Track ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. APP-123456-78"
                    value={statusForm.applicationId}
                    onChange={e => setStatusForm({ ...statusForm, applicationId: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={statusLoading}>
                  {statusLoading ? <FaSpinner className="spin" /> : "Check Status"}
                </button>
              </form>

              {statusResult && (
                <div className="status-result-card animate-fade-in-up">
                  <div className="status-header">
                    <h4>{statusResult.jobTitle}</h4>
                    {/* Using inline util for color still valid or move to CSS class */}
                    <span className={`status-badge ${stageColor(statusResult.stage)}`}>
                      {statusResult.stage}
                    </span>
                  </div>
                  <div className="status-timeline">
                    <p className="last-updated">Last Updated: {new Date(statusResult.updatedAt).toLocaleDateString()}</p>
                    <div className="feedback-box">
                      {statusResult.feedback}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedJob && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplied={handleApplied}
        />
      )}
    </div>
  );
};

export default Careers;
