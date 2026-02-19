import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    FaWallet,
    FaMoneyBillWave,
    FaPlus,
    FaFilePdf,
    FaFilter,
    FaTimes,
    FaUsers
} from "react-icons/fa";
import "./CompanyDashboard.css"; // Reusing existing styles

const CompanyExpenditure = () => {
    // ... (keep state)
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [adding, setAdding] = useState(false);

    // Filters & Pagination
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [form, setForm] = useState({
        title: "",
        amount: "",
        category: "General",
        description: "",
        date: new Date().toISOString().split("T")[0] // default today
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await API.get("/company/dashboard");
            const root = res.data?.data || res.data || {};

            setExpenses(root.customExpenses || []);
            setStats(root.stats || {});
        } catch (err) {
            toast.error("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) return toast.warning("Required fields missing");

        setAdding(true);
        try {
            await API.post("/company/expenses", {
                ...form,
                amount: Number(form.amount),
                date: form.date ? new Date(form.date) : new Date()
            });
            toast.success("Expense added successfully");
            setShowModal(false);
            setForm({ title: "", amount: "", category: "General", description: "", date: new Date().toISOString().split("T")[0] });
            fetchExpenses();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to add expense");
        } finally {
            setAdding(false);
        }
    };

    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const expDate = new Date(exp.date).setHours(0, 0, 0, 0);
            const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
            const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

            if (start && expDate < start) return false;
            if (end && expDate > end) return false;
            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, startDate, endDate]);

    const paginatedExpenses = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredExpenses.slice(start, start + rowsPerPage);
    }, [filteredExpenses, currentPage]);

    const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Company Expenditure Report", 14, 20);
        autoTable(doc, {
            startY: 30,
            head: [["Date", "Title", "Category", "Amount (₹)"]],
            body: filteredExpenses.map(e => [
                new Date(e.date).toLocaleDateString(),
                e.title,
                e.category,
                e.amount.toLocaleString()
            ]),
        });
        doc.save("expenditure-report.pdf");
    };

    if (loading) return <div className="cd-loader"><div className="spinner"></div></div>;

    return (
        <div className="company-dashboard"> {/* Reusing wrapper for layout consistency */}
            <main className="cd-wrap">

                <div className="secHead">
                    <div className="sh-flex" style={{ alignItems: "center" }}>
                        <div>
                            <h3>Company Expenditure</h3>
                            <p>Track salaries and operational expenses</p>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button className="addExpBtn" onClick={exportPDF} style={{ background: "#ef4444" }}>
                                <FaFilePdf /> Export PDF
                            </button>
                            <button className="addExpBtn" onClick={() => setShowModal(true)}>
                                <FaPlus /> Add Expense
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="expGrid">
                    <div className="expCard">
                        <div className="eIcon"><FaUsers /></div>
                        <div className="eTxt">
                            <span>Total Salaries</span>
                            <strong>₹{(stats.totalSalaryExpense || 0).toLocaleString()}</strong>
                            <small>Recurring monthly</small>
                        </div>
                    </div>
                    <div className="expCard">
                        <div className="eIcon purple"><FaWallet /></div>
                        <div className="eTxt">
                            <span>Operational Expenses</span>
                            <strong>₹{(stats.totalCustomExpense || 0).toLocaleString()}</strong>
                            <small>{expenses.length} records</small>
                        </div>
                    </div>
                    <div className="expCard highlight">
                        <div className="eIcon green"><FaMoneyBillWave /></div>
                        <div className="eTxt">
                            <span>Total Expenditure</span>
                            <strong>₹{(stats.overallExpenditure || 0).toLocaleString()}</strong>
                            <small>Combined Total</small>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="settingsCard" style={{ marginBottom: "20px" }}>
                    <div className="settingsHead" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
                        <div className="shLeft">
                            <FaFilter className="text-muted" />
                            <h4 style={{ margin: 0 }}>Filters</h4>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input
                                type="date"
                                className="fg input"
                                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                className="fg input"
                                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                            {(startDate || endDate) && (
                                <button
                                    className="ghost-btn"
                                    onClick={() => { setStartDate(""); setEndDate(""); }}
                                    style={{ padding: "8px 12px" }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="expTable">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Expense Title</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedExpenses.length > 0 ? (
                                paginatedExpenses.map(exp => (
                                    <tr key={exp._id}>
                                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                                        <td>{exp.title}</td>
                                        <td><span className="cat-pill">{exp.category}</span></td>
                                        <td>{exp.description || "-"}</td>
                                        <td><strong>₹{exp.amount.toLocaleString()}</strong></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                                        No expenses found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                        <button
                            className="ghost-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Previous
                        </button>
                        <span style={{ display: "flex", alignItems: "center", fontWeight: "600" }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="ghost-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}

            </main>

            {/* Add Expense Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-head">
                            <h3>Add New Expense</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAddExpense}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="fg">
                                    <label>Title</label>
                                    <input
                                        required
                                        placeholder="e.g. Office Rent"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>
                                <div className="fg">
                                    <label>Amount (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                    />
                                </div>
                                <div className="fg">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                    />
                                </div>
                                <div className="fg">
                                    <label>Category</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option>General</option>
                                        <option>Rent</option>
                                        <option>Utilities</option>
                                        <option>Equipment</option>
                                        <option>Marketing</option>
                                        <option>Travel</option>
                                        <option>Software</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="fg">
                                    <label>Description (Optional)</label>
                                    <input
                                        placeholder="Additional details..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="saveBtn" disabled={adding}>
                                    {adding ? "Saving..." : "Add Expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CompanyExpenditure;
