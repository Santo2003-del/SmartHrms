// frontend/src/pages/SuperAdmin/SuperAdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  FaSync,
  FaSearch,
  FaPhone,
  FaMapMarkerAlt,
  FaBan,
  FaCheck,
  FaTrash,
  FaEdit,
  FaKey,
  FaBuilding,
  FaUserPlus,
  FaTimes,
  FaCopy,
  FaExclamationTriangle,
  FaChartLine,
  FaUsers
} from "react-icons/fa";

import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || "";
const libraries = ["places", "geometry"];
const mapStyle = { width: "100%", height: "260px", borderRadius: "14px" };

const safeStr = (v) => (v === null || v === undefined ? "" : String(v));
const normalizeRole = (role = "") => safeStr(role).trim().toUpperCase().replace(/\s+/g, "_");

const pickCompanyDisplayName = (item) => item?.name || item?.companyName || "Company";
const pickCompanyEmail = (item) => item?.email || "";
const pickCompanyPhone = (item) => item?.mobile || item?.phone || "";
const pickCompanyAddress = (item) => item?.location?.address || item?.address || "";

const isCompanyActive = (c) => {
  const st = String(c?.status || "Active").toLowerCase();
  return st !== "inactive" && st !== "deleted";
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Layout handles logout

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState("clients"); // clients | inquiries | requests
  const [searchTerm, setSearchTerm] = useState("");

  const [inquiries, setInquiries] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditInquiryModal, setShowEditInquiryModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit forms
  const [editForm, setEditForm] = useState({
    companyName: "",
    email: "",
    mobile: "",
    address: "",
    lat: 18.5204,
    lng: 73.8567,
    password: "",
  });

  const [editInquiryForm, setEditInquiryForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    address: "",
    lat: 18.5204,
    lng: 73.8567,
  });

  // Maps
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [autocomplete, setAutocomplete] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== "SUPERADMIN" && role !== "SUPER_ADMIN") {
      toast.error("Unauthorized");
      navigate("/system-access-gmv2026");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setSyncing(true);
      setLoading(true);

      const res = await API.get("/superadmin/dashboard-data");
      const inq = res?.data?.inquiries || [];
      const comps = res?.data?.companies || [];

      setInquiries(Array.isArray(inq) ? inq : []);
      setCompanies(Array.isArray(comps) ? comps : []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Sync Failed");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const pendingInquiries = useMemo(
    () => inquiries.filter((i) => (i?.status || "Pending") === "Pending"),
    [inquiries]
  );

  const activeCompanies = useMemo(() => companies.filter(isCompanyActive), [companies]);

  const limitRequests = useMemo(
    () => activeCompanies.filter((c) => (c?.hrLimitRequest || "") === "Pending"),
    [activeCompanies]
  );

  const list = useMemo(() => {
    if (activeTab === "inquiries") return pendingInquiries;
    if (activeTab === "requests") return limitRequests;
    return activeCompanies;
  }, [activeTab, activeCompanies, pendingInquiries, limitRequests]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => {
      const name = pickCompanyDisplayName(item).toLowerCase();
      const email = safeStr(pickCompanyEmail(item)).toLowerCase();
      const phone = safeStr(pickCompanyPhone(item)).toLowerCase();
      const addr = safeStr(pickCompanyAddress(item)).toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || addr.includes(q);
    });
  }, [list, searchTerm]);

  const onPlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place?.geometry) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setEditForm((prev) => ({
      ...prev,
      lat,
      lng,
      address: place.formatted_address || prev.address,
    }));
    if (map) map.panTo({ lat, lng });
  };

  const onMarkerDragEnd = (e) => {
    if (!e?.latLng) return;
    setEditForm((prev) => ({
      ...prev,
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }));
  };

  const handleLimitAction = async (companyId, action) => {
    try {
      await API.put(`/superadmin/company-limit/${companyId}`, { action });
      toast.success(action === "approve" ? "Approved +1 ✅" : "Request Denied ✅");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const handleRejectOrDelete = async (id, type) => {
    const msg =
      type === "reject"
        ? "Reject this inquiry? (Irreversible)"
        : "Delete this company? (It will be archived and hidden from Clients)";
    if (!window.confirm(`⚠️ ${msg}`)) return;

    try {
      const endpoint = type === "reject" ? `/superadmin/inquiry/${id}` : `/superadmin/company/${id}`;
      await API.delete(endpoint);

      if (type === "delete") {
        setCompanies((prev) => prev.filter((c) => c._id !== id));
      } else {
        setInquiries((prev) => prev.filter((i) => i._id !== id));
      }

      toast.success("Action Completed ✅");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const handleApprove = async (inq) => {
    if (!inq?._id) return;
    if (!window.confirm(`Approve ${pickCompanyDisplayName(inq)}?\n\nThis will provision the company account using the partner's pre-submitted password.`)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        inquiryId: inq._id,
      };

      await API.post("/superadmin/approve-inquiry", payload);
      toast.success("Company Provisioned Successfully 🚀");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Provision failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditInquiryModal = (inq) => {
    setSelected(inq);
    setEditInquiryForm({
      companyName: inq.companyName || "",
      contactPerson: inq.contactPerson || "",
      email: inq.email || "",
      mobile: inq.mobile || "",
      address: inq.address || "",
      lat: inq.lat || 18.5204,
      lng: inq.lng || 73.8567,
    });
    setShowEditInquiryModal(true);
  };

  const submitInquiryEdit = async () => {
    if (!selected?._id) return;
    setIsSubmitting(true);
    try {
      await API.put(`/superadmin/inquiry/${selected._id}`, {
        ...editInquiryForm,
        lat: Number(editInquiryForm.lat),
        lng: Number(editInquiryForm.lng)
      });
      toast.success("Inquiry Updated ✅");
      setShowEditInquiryModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (comp) => {
    setSelected(comp);
    setEditForm({
      companyName: pickCompanyDisplayName(comp),
      email: pickCompanyEmail(comp),
      mobile: pickCompanyPhone(comp) || "",
      address: pickCompanyAddress(comp) || "",
      lat: comp?.location?.lat ?? comp?.lat ?? 18.5204,
      lng: comp?.location?.lng ?? comp?.lng ?? 73.8567,
      password: "",
    });
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!selected?._id) return;
    if (!editForm.companyName.trim() || !editForm.email.trim()) {
      return toast.warning("Company name and email are required");
    }
    setIsSubmitting(true);

    try {
      const payload = {
        name: editForm.companyName.trim(),
        companyName: editForm.companyName.trim(),
        email: editForm.email.trim(),
        mobile: editForm.mobile.trim(),
        phone: editForm.mobile.trim(),
        password: editForm.password ? editForm.password : undefined,
        location: {
          address: editForm.address || "",
          lat: Number(editForm.lat),
          lng: Number(editForm.lng),
        },
        address: editForm.address || "",
        lat: Number(editForm.lat),
        lng: Number(editForm.lng),
      };

      if (!payload.password) delete payload.password;

      await API.put(`/superadmin/company/${selected._id}`, payload);
      toast.success("Details Updated ✅");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const topStats = useMemo(() => {
    return {
      companies: activeCompanies.length,
      inquiries: pendingInquiries.length,
      requests: limitRequests.length,
    };
  }, [activeCompanies.length, pendingInquiries.length, limitRequests.length]);

  return (
    <SuperAdminLayout title="Dashboard Overview">
      {/* STATS */}
      <section className="sa-grid-3">
        <div className="sa-stat-card" onClick={() => setActiveTab("clients")} style={{ cursor: 'pointer' }}>
          <div className="sa-stat-info">
            <h3>Active Clients</h3>
            <div className="sa-stat-val">{topStats.companies}</div>
          </div>
          <div className="sa-stat-icon icon-blue">
            <FaBuilding />
          </div>
        </div>

        <div className="sa-stat-card" onClick={() => setActiveTab("inquiries")} style={{ cursor: 'pointer' }}>
          <div className="sa-stat-info">
            <h3>Pending Inquiries</h3>
            <div className="sa-stat-val">{topStats.inquiries}</div>
          </div>
          <div className="sa-stat-icon icon-orange">
            <FaUserPlus />
          </div>
        </div>

        <div className="sa-stat-card" onClick={() => setActiveTab("requests")} style={{ cursor: 'pointer' }}>
          <div className="sa-stat-info">
            <h3>Limit Requests</h3>
            <div className="sa-stat-val">{topStats.requests}</div>
          </div>
          <div className="sa-stat-icon icon-red">
            <FaExclamationTriangle />
          </div>
        </div>
      </section>

      {/* MAIN CARD */}
      <div className="sa-card">
        <div className="sad-toolbar">
          {/* TABS */}
          <div className="sad-tab-row">
            <button
              className={`sa-btn ${activeTab === "clients" ? "sa-btn-primary" : "sa-btn-outline"}`}
              onClick={() => setActiveTab("clients")}
            >
              <FaUsers /> Clients
            </button>
            <button
              className={`sa-btn ${activeTab === "inquiries" ? "sa-btn-primary" : "sa-btn-outline"}`}
              onClick={() => setActiveTab("inquiries")}
            >
              <FaUserPlus /> Inquiries
              {topStats.inquiries > 0 && <span className="sad-badge">{topStats.inquiries}</span>}
            </button>
            <button
              className={`sa-btn ${activeTab === "requests" ? "sa-btn-primary" : "sa-btn-outline"}`}
              onClick={() => setActiveTab("requests")}
            >
              <FaChartLine /> Requests
              {topStats.requests > 0 && <span className="sad-badge">{topStats.requests}</span>}
            </button>
          </div>

          <div className="sad-actions-row">
            <button className="sa-btn sa-btn-outline" onClick={fetchData} disabled={syncing}>
              <FaSync className={syncing ? "spin" : ""} /> Sync
            </button>
            <div className="sad-search-wrap">
              <FaSearch className="sad-search-icon" />
              <input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sad-search-input"
              />
            </div>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading Data...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No records found</div>
        ) : (
          <div className="sad-table-wrap">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Company / Contact</th>
                  <th>Info</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const name = pickCompanyDisplayName(item);
                  const email = pickCompanyEmail(item);
                  const phone = pickCompanyPhone(item);
                  const status = activeTab === "clients" ? (item?.status || "Active") : "Pending";

                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="sad-user-cell">
                          <div className="sad-avatar">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="sad-name">{name}</div>
                            <div className="sad-email">{email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="sad-phone"><FaPhone className="sad-phone-icon" /> {phone || "N/A"}</div>
                      </td>
                      <td>
                        <span className={`sa-badge ${status === 'Active' ? 'badge-active' : 'badge-pending'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="sad-actions-cell">
                        <div className="sad-actions-btns">
                          {activeTab === "clients" && (
                            <>
                              <button className="sa-btn sa-btn-outline" onClick={() => openEditModal(item)}><FaEdit /></button>
                              <button className="sa-btn sa-btn-danger" onClick={() => handleRejectOrDelete(item._id, "delete")}><FaTrash /></button>
                            </>
                          )}
                          {activeTab === "inquiries" && (
                            <>
                              <button className="sa-btn sa-btn-outline" onClick={() => openEditInquiryModal(item)} title="Edit"><FaEdit /></button>
                              <button className="sa-btn sa-btn-outline" onClick={() => handleRejectOrDelete(item._id, "reject")} style={{ color: '#ef4444' }}>Reject</button>
                              <button className="sa-btn sa-btn-primary" onClick={() => handleApprove(item)} disabled={isSubmitting}>Approve</button>
                            </>
                          )}
                          {activeTab === "requests" && (
                            <>
                              <button className="sa-btn sa-btn-outline" onClick={() => handleLimitAction(item._id, "reject")}>Deny</button>
                              <button className="sa-btn sa-btn-primary" onClick={() => handleLimitAction(item._id, "approve")}>Allow +1</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="sad-modal-overlay">
          <div className="sa-card sad-modal-card">
            <div className="sad-modal-head">
              <h3>Edit Company</h3>
              <button onClick={() => setShowEditModal(false)} className="sad-close-btn"><FaTimes /></button>
            </div>

            <div className="sad-form-grid">
              <div className="sad-fg">
                <label className="sad-label">Name</label>
                <input className="sad-input" value={editForm.companyName} onChange={e => setEditForm({ ...editForm, companyName: e.target.value })} />
              </div>
              <div className="sad-fg">
                <label className="sad-label">Email</label>
                <input className="sad-input" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="sad-fg">
                <label className="sad-label">Phone</label>
                <input className="sad-input" value={editForm.mobile} onChange={e => setEditForm({ ...editForm, mobile: e.target.value })} />
              </div>
              <div className="sad-fg sad-fg-full">
                <label className="sad-label">Address</label>
                <textarea className="sad-input" rows="2" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
              </div>
            </div>

            <div className="sad-map-container">
              {!isLoaded ? <p style={{ padding: '20px' }}>Loading Maps...</p> : (
                <>
                  <Autocomplete onLoad={a => setAutocomplete(a)} onPlaceChanged={onPlaceChanged}>
                    <input placeholder="Search Location..." style={{ width: '100%', padding: '10px', borderBottom: '1px solid #e2e8f0', outline: 'none' }} />
                  </Autocomplete>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: Number(editForm.lat), lng: Number(editForm.lng) }}
                    zoom={14}
                    onLoad={m => setMap(m)}
                  >
                    <Marker position={{ lat: Number(editForm.lat), lng: Number(editForm.lng) }} draggable onDragEnd={onMarkerDragEnd} />
                  </GoogleMap>
                </>
              )}
            </div>

            <div className="sad-modal-foot">
              <button className="sa-btn sa-btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="sa-btn sa-btn-primary" onClick={submitEdit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INQUIRY MODAL */}
      {showEditInquiryModal && (
        <div className="sad-modal-overlay">
          <div className="sa-card sad-modal-card">
            <div className="sad-modal-head">
              <h3>Edit Inquiry</h3>
              <button onClick={() => setShowEditInquiryModal(false)} className="sad-close-btn"><FaTimes /></button>
            </div>

            <div className="sad-form-grid">
              <div className="sad-fg">
                <label className="sad-label">Company Name</label>
                <input className="sad-input" value={editInquiryForm.companyName} onChange={e => setEditInquiryForm({ ...editInquiryForm, companyName: e.target.value })} />
              </div>
              <div className="sad-fg">
                <label className="sad-label">Contact Person</label>
                <input className="sad-input" value={editInquiryForm.contactPerson} onChange={e => setEditInquiryForm({ ...editInquiryForm, contactPerson: e.target.value })} />
              </div>
              <div className="sad-fg">
                <label className="sad-label">Email</label>
                <input className="sad-input" value={editInquiryForm.email} onChange={e => setEditInquiryForm({ ...editInquiryForm, email: e.target.value })} />
              </div>
              <div className="sad-fg">
                <label className="sad-label">Mobile</label>
                <input className="sad-input" value={editInquiryForm.mobile} onChange={e => setEditInquiryForm({ ...editInquiryForm, mobile: e.target.value })} />
              </div>
              <div className="sad-fg sad-fg-full">
                <label className="sad-label">Address</label>
                <textarea className="sad-input" rows="2" value={editInquiryForm.address} onChange={e => setEditInquiryForm({ ...editInquiryForm, address: e.target.value })} />
              </div>
            </div>

            <div className="sad-modal-foot">
              <button className="sa-btn sa-btn-outline" onClick={() => setShowEditInquiryModal(false)}>Cancel</button>
              <button className="sa-btn sa-btn-primary" onClick={submitInquiryEdit} disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Inquiry"}</button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .sad-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:16px}
        .sad-tab-row{display:flex;gap:8px;flex-wrap:wrap}
        .sad-badge{background:#ef4444;color:#fff;padding:2px 6px;border-radius:10px;font-size:.7em}
        .sad-actions-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
        .sad-search-wrap{position:relative}
        .sad-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#94a3b8}
        .sad-search-input{padding:8px 10px 8px 34px;border:1px solid #e2e8f0;border-radius:8px;outline:none;width:200px;font-size:.9rem}
        .sad-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .sad-user-cell{display:flex;align-items:center;gap:12px}
        .sad-avatar{width:40px;height:40px;background:#f1f5f9;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#2563eb;flex-shrink:0}
        .sad-name{font-weight:600;color:#0f172a}
        .sad-email{font-size:.85rem;color:#64748b}
        .sad-phone{font-size:.9rem;color:#475569}
        .sad-phone-icon{font-size:.8rem}
        .sad-actions-cell{text-align:right}
        .sad-actions-btns{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
        .sad-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px}
        .sad-modal-card{width:90%;max-width:600px;max-height:90vh;overflow-y:auto}
        .sad-modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
        .sad-modal-head h3{margin:0;font-size:1.15rem;font-weight:700}
        .sad-close-btn{background:none;border:none;cursor:pointer;font-size:1.1rem;color:#64748b;padding:4px}
        .sad-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
        .sad-fg-full{grid-column:span 2}
        .sad-label{display:block;margin-bottom:4px;font-size:.9rem;font-weight:600;color:#475569}
        .sad-input{width:100%;padding:8px;border-radius:6px;border:1px solid #e2e8f0;outline:none;font-size:.9rem;box-sizing:border-box}
        .sad-input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .sad-map-container{height:300px;background:#f1f5f9;border-radius:8px;margin-bottom:20px;overflow:hidden}
        .sad-modal-foot{display:flex;justify-content:flex-end;gap:10px}

        @media(max-width:768px){
          .sad-toolbar{flex-direction:column;align-items:stretch}
          .sad-tab-row{overflow-x:auto;padding-bottom:4px}
          .sad-actions-row{width:100%;justify-content:space-between}
          .sad-search-input{width:100%}
          .sad-search-wrap{flex:1}
          .sad-form-grid{grid-template-columns:1fr}
          .sad-fg-full{grid-column:span 1}
          .sad-modal-card{width:95%;max-width:95vw}
          .sad-modal-foot{flex-direction:column}
          .sad-modal-foot .sa-btn{width:100%;justify-content:center}
          .sad-map-container{height:220px}
        }
        @media(max-width:480px){
          .sad-toolbar{gap:10px}
          .sad-tab-row{gap:6px}
          .sad-tab-row .sa-btn{padding:7px 10px;font-size:.8rem}
          .sad-user-cell{gap:8px}
          .sad-avatar{width:32px;height:32px;font-size:.8rem}
          .sad-name{font-size:.85rem}
          .sad-email{font-size:.78rem}
          .sad-actions-btns{gap:6px}
          .sad-actions-btns .sa-btn{padding:6px 8px;font-size:.78rem}
          .sad-map-container{height:180px}
          .sad-input{padding:7px;font-size:.85rem}
        }
      `}</style>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
