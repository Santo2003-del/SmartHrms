import React, { useState, useEffect } from 'react';
import API, { getSupportTickets, updateSupportTicketStatus } from '../../services/api';
import { toast } from 'react-toastify';
import SuperAdminLayout from './SuperAdminLayout';
import {
    FaSearch, FaFilter, FaSync,
    FaEnvelope, FaUser, FaBuilding, FaCheckCircle, FaSpinner, FaCircle
} from 'react-icons/fa';

const SupportTicketManagement = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await getSupportTickets();
            setTickets(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateSupportTicketStatus(id, newStatus);
            toast.success(`Ticket marked as ${newStatus}`);
            fetchTickets();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const filteredData = tickets.filter(t => {
        const matchSearch =
            t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchFilter = filterStatus === 'All' ? true : t.status === filterStatus;
        return matchSearch && matchFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return '#f59e0b'; // Orange
            case 'Resolved': return '#10b981'; // Green
            case 'Closed': return '#64748b'; // Grey
            default: return '#3b82f6'; // Blue
        }
    };

    return (
        <SuperAdminLayout title="Customer Reports">
            <div className="sa-card">
                {/* CONTROLS */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            placeholder="Search Ticket ID, Company, Email..."
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
                            <option value="Open">Open</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <button className="sa-btn sa-btn-outline" onClick={fetchTickets}>
                        <FaSync className={loading ? "spin" : ""} /> Refresh
                    </button>
                </div>

                {/* GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}><FaSpinner className="spin" /> Loading Tickets...</div>
                    ) : filteredData.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No tickets found.</div>
                    ) : (
                        filteredData.map(ticket => (
                            <div key={ticket._id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', borderLeft: `4px solid ${getStatusColor(ticket.status)}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{ticket.ticketId}</span>
                                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>

                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f172a' }}>{ticket.issueType}</h3>
                                <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                    {ticket.description}
                                </p>

                                <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaBuilding style={{ color: '#94a3b8' }} /> {ticket.companyName}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaUser style={{ color: '#94a3b8' }} /> {ticket.contactPerson}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaEnvelope style={{ color: '#94a3b8' }} /> {ticket.email}</div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        background: `${getStatusColor(ticket.status)}20`,
                                        color: getStatusColor(ticket.status)
                                    }}>
                                        {ticket.status}
                                    </span>

                                    {ticket.status === 'Open' && (
                                        <button
                                            className="sa-btn"
                                            style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }}
                                            onClick={() => handleStatusUpdate(ticket._id, 'Resolved')}
                                        >
                                            <FaCheckCircle /> Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default SupportTicketManagement;
