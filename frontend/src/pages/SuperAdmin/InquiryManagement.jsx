// src/pages/SuperAdmin/InquiryManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { toast } from 'react-toastify';
import SuperAdminLayout from './SuperAdminLayout';
import {
  FaSearch, FaFilter, FaSync,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrash, FaEdit, FaSave, FaBan,
  FaSpinner, FaCheck
} from 'react-icons/fa';

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Edit Modal State
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await API.get('/superadmin/dashboard-data');
      const data = res.data.inquiries || (Array.isArray(res.data) ? res.data : []);
      setInquiries(data);
    } catch (err) {
      console.error("Fetch Inquiries Error:", err);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, action) => {
    if (!window.confirm("⚠️ Confirm Action? This cannot be undone.")) return;
    try {
      await API.delete(`/superadmin/inquiry/${id}`);
      toast.success(action === 'delete' ? 'Inquiry Archived' : 'Inquiry Rejected');
      fetchInquiries();
    } catch { toast.error('Action failed'); }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Confirm Approval? This will create a Company & User account.")) return;
    try {
      await API.approveInquiry(id);
      toast.success("Inquiry Approved & Email Sent ✅");
      fetchInquiries();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approval Failed");
    }
  };

  const handleEdit = (inq) => {
    setSelected(inq);
    setEditForm({
      companyName: inq.companyName,
      email: inq.email,
      mobile: inq.mobile,
      address: inq.address || ""
    });
    setShowEdit(true);
  };

  const submitEdit = async () => {
    try {
      await API.put(`/superadmin/inquiry/${selected._id}`, editForm);
      toast.success("Inquiry Updated ✅");
      setShowEdit(false);
      fetchInquiries();
    } catch { toast.error("Update Failed"); }
  };

  const filteredData = useMemo(() => {
    return inquiries.filter((item) => {
      const company = (item.companyName || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const status = (item.status || 'Pending');

      const matchesSearch = company.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'All' ? true : status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [inquiries, searchTerm, filterStatus]);

  return (
    <SuperAdminLayout title="Inquiry Pipeline">
      <div className="sa-card">
        {/* CONTROLS */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
            <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              placeholder="Search by company or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: '150px' }}>
            <FaFilter style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white' }}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <button className="sa-btn sa-btn-outline" onClick={fetchInquiries}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        {/* GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}><FaSpinner className="spin" /> Loading...</div>
          ) : filteredData.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No inquiries found.</div>
          ) : (
            filteredData.map(inq => (
              <div key={inq._id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {(inq.companyName || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: '0', fontSize: '1.1rem', color: '#0f172a' }}>{inq.companyName}</h3>
                      <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b' }}>{inq.contactPerson}</p>
                    </div>
                  </div>
                  <span className={`sa-badge ${inq.status === 'Approved' ? 'badge-active' : inq.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                    {inq.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.9rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaEnvelope style={{ color: '#94a3b8' }} /> {inq.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaPhone style={{ color: '#94a3b8' }} /> {inq.mobile}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaMapMarkerAlt style={{ color: '#94a3b8' }} /> {inq.address || "N/A"}</div>
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleEdit(inq)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><FaEdit /></button>
                  {inq.status === 'Pending' && (
                    <>
                      <button className="sa-btn sa-btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDelete(inq._id, 'reject')}>Reject</button>
                      <button className="sa-btn sa-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleApprove(inq._id)}>Approve</button>
                    </>
                  )}
                  <button onClick={() => handleDelete(inq._id, 'delete')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FaTrash /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="sa-card" style={{ width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px' }}>Edit Inquiry</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Company</label>
                <input value={editForm.companyName} onChange={e => setEditForm({ ...editForm, companyName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Email</label>
                <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Mobile</label>
                <input value={editForm.mobile} onChange={e => setEditForm({ ...editForm, mobile: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="sa-btn sa-btn-outline" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="sa-btn sa-btn-primary" onClick={submitEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

    </SuperAdminLayout>
  );
};

export default InquiryManagement;