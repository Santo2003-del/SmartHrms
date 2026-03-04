import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUserTie, FaEnvelope, FaLock, FaArrowRight, FaBuilding, FaCircleNotch } from "react-icons/fa";
import { loginUser, clearAuthStorage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const canonRole = (role = "") => {
  const r = String(role || "").trim().toLowerCase();
  if (!r) return "";
  if (["companyowner", "companyadmin", "company_admin", "company-admin"].includes(r)) return "CompanyAdmin";
  if (["hr", "hradmin", "hr_admin", "hr-admin", "admin", "manager"].includes(r)) return "Admin";
  if (["employee"].includes(r)) return "Employee";
  if (["superadmin", "super-admin", "super_admin", "root"].includes(r)) return "SuperAdmin";
  return role;
};

const extractAuth = (res) => {
  const d = res?.data;
  const token = d?.token || d?.accessToken || d?.data?.token || d?.data?.accessToken;
  const user = d?.user || d?.data?.user || d?.profile || d?.data?.profile;
  return { token, user };
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.warning("Please fill all fields");

    setLoading(true);
    try {
      // ✅ very important: remove old session before new login
      clearAuthStorage();

      const res = await loginUser(form);
      const { user, token } = extractAuth(res);

      if (!token || !user) throw new Error("Invalid response from server");

      const role = canonRole(user.role);

      if (role !== "Admin") {
        clearAuthStorage();
        toast.error("Access denied. HR/Admin credentials required.");
        return;
      }

      login({ token, user: { ...user, role } });

      const first = (user?.name || "HR").split(" ")[0];
      toast.success(`Welcome HR ${first} 👨‍💼`);
      navigate("/hr/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid HR credentials";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-login-page">
      <div className="bg-circle c1"></div>
      <div className="bg-circle c2"></div>

      <div className="hr-card slide-in">
        <div className="hr-header">
          <div className="icon-wrapper">
            <div className="hr-icon">
              <FaUserTie />
            </div>
            {/* Neon Ring */}
            <div className="icon-ring"></div>
          </div>
          <h2>HR Admin Portal</h2>
          <p>Secure access for HR & Managers</p>
        </div>

        <form onSubmit={handleLogin} className="hr-form">
          <div className="input-group">
            <label>Official Email</label>
            <div className="hr-input-wrapper">
              <FaEnvelope className="field-icon" />
              <input type="email" name="email" placeholder="hr@company.com" onChange={handleChange} value={form.email} required autoComplete="username" />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="hr-input-wrapper">
              <FaLock className="field-icon" />
              <input type="password" name="password" placeholder="••••••••" onChange={handleChange} value={form.password} required autoComplete="current-password" />
            </div>
          </div>

          <button className="hr-btn" disabled={loading}>
            {loading ? (
              <>
                <FaCircleNotch className="spin" /> Verifying...
              </>
            ) : (
              "Login as HR"
            )}
          </button>
        </form>

        <div className="hr-footer">
          <p>
            Are you a Company Owner?
            <Link to="/company-login">
              <FaBuilding /> Owner Login <FaArrowRight size={11} />
            </Link>
          </p>
        </div>
      </div>
      <style>{`
        .hr-login-page {
          min-height: 100vh; display:flex; align-items:center; justify-content:center;
          background: #050505;
          position: relative; overflow:hidden; font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px;
        }
        .bg-circle { position:absolute; border-radius:50%; filter: blur(100px); opacity: 0.15; z-index:0; }
        .c1 { width: 500px; height: 500px; background: #00ff9d; top: -100px; left: -100px; }
        .c2 { width: 400px; height: 400px; background: #00c6ff; bottom: -50px; right: -50px; }

        .hr-card {
          width: 100%; max-width: 440px; background: #111; border-radius: 22px;
          padding: 48px 38px; 
          border: 1px solid rgba(0, 255, 157, 0.2);
          box-shadow: 0 0 50px rgba(0, 255, 157, 0.1);
          z-index:10; position:relative;
        }
        .slide-in { animation: slideUpFade 0.6s ease-out; }
        @keyframes slideUpFade { from { opacity:0; transform: translateY(30px);} to {opacity:1; transform: translateY(0);} }

        .hr-header { text-align:center; margin-bottom: 32px; }
        .icon-wrapper { position: relative; width: 80px; height:80px; margin: 0 auto 15px; display:flex; align-items:center; justify-content:center; }
        .hr-icon {
          width: 68px; height: 68px; border-radius: 20px;
          background: rgba(0, 255, 157, 0.1); color: #00ff9d;
          display:flex; align-items:center; justify-content:center;
          font-size: 30px; z-index:2; 
          border: 1px solid rgba(0, 255, 157, 0.2);
          box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
        }
        .icon-ring {
          position:absolute; width:100%; height:100%;
          border: 2px dashed rgba(0, 255, 157, 0.3); border-radius: 24px;
          animation: spinSlow 15s linear infinite; z-index:1;
        }
        @keyframes spinSlow { to { transform: rotate(360deg);} }

        .hr-header h2 { margin:0; font-size:1.7rem; font-weight: 900; color: #fff; }
        .hr-header p { color: #94a3b8; font-size: .92rem; margin-top: 6px; }

        .hr-form { display:flex; flex-direction: column; gap: 18px; }
        .input-group label { display:block; font-size: .85rem; font-weight: 700; color: #94a3b8; margin: 0 0 6px 5px; }
        .hr-input-wrapper { position: relative; }
        .field-icon { position:absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #00ff9d; font-size:1rem; z-index:2; }
        .hr-input-wrapper input{
          width:100%; box-sizing:border-box; padding: 15px 15px 15px 46px;
          border-radius: 14px; border: 1px solid #333; background: #0a0a0a;
          font-size: .95rem; outline:none; transition:.25s; color: #fff;
        }
        .hr-input-wrapper input:focus{
          border-color: #00ff9d; box-shadow: 0 0 0 4px rgba(0, 255, 157, 0.1); background: #000;
        }
        .hr-btn{
          margin-top: 8px; padding: 15px; border:none; border-radius: 14px;
          background: linear-gradient(135deg, #00ff9d, #00cb7c); color: #000;
          font-weight: 900; font-size:1rem; cursor:pointer; transition:.3s;
          box-shadow: 0 10px 20px rgba(0, 255, 157, 0.2);
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .hr-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0, 255, 157, 0.3); }
        .hr-btn:disabled { background: #333; box-shadow:none; cursor:not-allowed; transform:none; color: #666; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg);} }

        .hr-footer { margin-top: 26px; text-align:center; font-size:.9rem; color: #64748b; }
        .hr-footer a{
          display:inline-flex; align-items:center; gap:6px; margin-left:6px;
          color: #00ff9d; font-weight: 900; text-decoration:none; transition: .2s;
        }
        .hr-footer a:hover { }

        @media (max-width:480px){
          .hr-login-page { padding: 0; background:#050505; }
          .bg-circle{ display:none; }
          .hr-card{ box-shadow:none; border-radius:0; padding: 30px 25px; max-width:100%; min-height:100vh;
            border: none;
            display:flex; flex-direction:column; justify-content:center;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
