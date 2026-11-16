import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { toast } from 'react-toastify';
import SuperAdminLayout from './SuperAdminLayout';
import {
  FaSearch, FaFilter, FaSync,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrash, FaEdit, FaSave, FaBan,
  FaSpinner, FaCheck, FaBuilding, FaClipboardList, FaMoneyBillWave, FaPlay
} from 'react-icons/fa';

const STATUS_COLORS = {
  'Pending Review': 'orange',
  'Approved': '#10b981',
  'Payment Requested': '#3b82f6',
  'Payment Under Verification': '#8b5cf6',
  'Active': '#10b981',
  'Rejected': '#ef4444',
  'Renewal Requested': '#f59e0b',
  'Expired': '#64748b',
  'Suspended': '#ef4444',
  'Pending': 'orange'
};

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State
  const [showManage, setShowManage] = useState(false);
  const [selected, setSelected] = useState(null);
  const [manageForm, setManageForm] = useState({});

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await API.get('/superadmin/inquiries'); // Use dedicated endpoint
      const data = res.data.inquiries || (Array.isArray(res.data) ? res.data : []);
      setInquiries(data);
    } catch (err) {
      console.error("Fetch Inquiries Error:", err);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManage = (inq) => {
    setSelected(inq);
    setManageForm({
      plan: inq.plan || 'Free Trial',
      notes: inq.notes || '',
      paymentRef: inq.paymentRef || '',
      paymentAmount: inq.paymentAmount || '',
      paymentDate: inq.paymentDate || new Date().toISOString().substring(0, 10),
      durationDays: 30
    });
    setShowManage(true);
  };

  const handleUpdateStatus = async (statusId, actionData = {}) => {
    try {
      await API.post(`/superadmin/inquiry/${selected._id}/action`, { status: statusId, ...actionData });
      toast.success("Inquiry updated successfully ✅");
      setShowManage(false);
      fetchInquiries();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action Failed");
    }
  };

  const submitProvision = async () => {
    try {
      await API.post(`/superadmin/inquiry/${selected._id}/provision`, { 
        plan: manageForm.plan,
        durationDays: manageForm.durationDays 
      });
      toast.success("Company provisioned successfully ✅");
      setShowManage(false);
      fetchInquiries();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Provisioning Failed");
    }
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
    <SuperAdminLayout title="Subscription Management">
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
              {Object.keys(STATUS_COLORS).map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <button className="sa-btn sa-btn-outline" onClick={fetchInquiries}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        {/* LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}><FaSpinner className="spin" /> Loading...</div>
          ) : filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No records found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px' }}>Company</th>
                  <th style={{ padding: '12px 16px' }}>Plan</th>
                  <th style={{ padding: '12px 16px' }}>Contact</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(inq => (
                  <tr key={inq._id} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{inq.companyName}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {inq.plan || 'Free Trial'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      <div>{inq.contactPerson}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{inq.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{new Date(inq.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        background: `${STATUS_COLORS[inq.status] || 'grey'}20`, 
                        color: STATUS_COLORS[inq.status] || 'grey', 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' 
                      }}>
                        {inq.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button className="sa-btn sa-btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleManage(inq)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MANAGE MODAL */}
      {showManage && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="sa-card" style={{ width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Manage Subscription: {selected.companyName}</h3>
              <button onClick={() => setShowManage(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '0.9rem', color: '#475569' }}>
              <div><strong>Email:</strong> {selected.email}</div>
              <div><strong>Phone:</strong> {selected.mobile}</div>
              <div><strong>Current Status:</strong> {selected.status}</div>
              <div><strong>Requested Plan:</strong> {selected.plan || 'Free Trial'}</div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: '600' }}>Override Plan</label>
                <select value={manageForm.plan} onChange={e => setManageForm({ ...manageForm, plan: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }}>
                  <option value="Free Trial">Free Trial</option>
                  <option value="Quarterly Plan">Quarterly Plan</option>
                  <option value="Annual Plan">Annual Plan</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: '600' }}>Admin Notes (Reason for change)</label>
                <textarea rows="2" value={manageForm.notes} onChange={e => setManageForm({ ...manageForm, notes: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }} placeholder="Notes visible to admins only"></textarea>
              </div>

              {(selected.status === 'Pending Review' || selected.status === 'Pending') && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="sa-btn sa-btn-outline" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleUpdateStatus('Rejected', { notes: manageForm.notes })}>Reject</button>
                  <button className="sa-btn sa-btn-primary" style={{ flex: 1 }} onClick={() => handleUpdateStatus('Payment Requested', { plan: manageForm.plan, notes: manageForm.notes })}>Approve & Request Payment</button>
                  <button className="sa-btn" style={{ flex: 1, background: '#10b981', color: '#fff' }} onClick={() => handleUpdateStatus('Approved', { plan: manageForm.plan, notes: manageForm.notes })}>Approve (No Payment)</button>
                </div>
              )}

              {(selected.status === 'Payment Requested' || selected.status === 'Payment Under Verification') && (
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}><FaMoneyBillWave /> Record Payment</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input placeholder="Reference ID (e.g. UTR)" value={manageForm.paymentRef} onChange={e => setManageForm({ ...manageForm, paymentRef: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input placeholder="Amount (₹)" type="number" value={manageForm.paymentAmount} onChange={e => setManageForm({ ...manageForm, paymentAmount: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <button className="sa-btn sa-btn-primary" style={{ width: '100%' }} onClick={() => handleUpdateStatus('Approved', { plan: manageForm.plan, paymentRef: manageForm.paymentRef, paymentAmount: manageForm.paymentAmount, notes: manageForm.notes })}>
                    Verify Payment & Approve
                  </button>
                </div>
              )}

              {selected.status === 'Approved' && (
                <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#1e40af' }}><FaPlay /> Provision Company</h4>
                  <p style={{ fontSize: '0.85rem', color: '#3b82f6', marginBottom: '15px' }}>Payment is verified or not required. Provision the account to activate the subscription and email credentials.</p>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>Subscription Duration (Days)</label>
                    <input type="number" value={manageForm.durationDays} onChange={e => setManageForm({ ...manageForm, durationDays: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <button className="sa-btn" style={{ width: '100%', background: '#10b981', color: '#fff' }} onClick={submitProvision}>
                    Provision Account Now
                  </button>
                </div>
              )}

              {(selected.status === 'Active' || selected.status === 'Expired' || selected.status === 'Suspended') && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {selected.status !== 'Suspended' && <button className="sa-btn sa-btn-outline" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleUpdateStatus('Suspended')}>Suspend Access</button>}
                  {selected.status === 'Suspended' && <button className="sa-btn sa-btn-outline" style={{ flex: 1, borderColor: '#10b981', color: '#10b981' }} onClick={() => handleUpdateStatus('Active')}>Reactivate</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </SuperAdminLayout>
  );
};

export default InquiryManagement;