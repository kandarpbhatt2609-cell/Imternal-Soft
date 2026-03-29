import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom"; 
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import "../admin/AdminLogin.css"; // Reusing the admin styles

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await authService.employeeLogin({ email, password });

      if (res.status === 200 && res.data?.success !== false) {
        setMessage("Employee login successful! Redirecting...");

        dispatch(loginSuccess({
          email: res.data.data.email,
          role: "employee",
        }));

        setTimeout(() => navigate("/employee/dashboard"), 1200);
      } else {
        setError(res.data?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* LEFT PANE: LOGIN FORM */}
        <div className="form-pane">
          
          {/* ADDED: Logo Area to match Admin Login */}
          <div className="logo">
            <div className="logo-icon">🛒</div>
            <div className="logo-text">
              <h1>Nest</h1>
              <p>MART & GROCERY</p>
            </div>
          </div>

          <div className="form-header">
            <h2>Employee Login</h2>
            <p>Welcome back! Please enter your details to access the portal.</p>
          </div>

          {/* Messages */}
          {error && <div className="msg-error">⚠️ {error}</div>}
          {message && <div className="msg-success">✅ {message}</div>}

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="icon left-icon">✉️</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="icon left-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span 
                  className="icon right-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </span>
              </div>
            </div>

            <div className="form-options">
              <Link to="/employee/forgot-password" style={{ color: "#2E7D32", fontWeight: "500", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            {/* UPDATED: Button text changed from "Login to Portal" to "Login" */}
            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>
        </div>

        {/* RIGHT PANE: INFO PANEL */}
        <div className="info-pane">
          <div className="info-header">
            <h2>Start Your Shift</h2>
            <p>Your work fuels our success. Connect with your dashboard to get started.</p>
          </div>

          <div className="benefits-list">
            <div className="benefit-card">
              <div className="benefit-title">📋 Track Tasks</div>
              <p>View your assigned orders and daily objectives instantly.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-title">📈 Real-time Updates</div>
              <p>Stay updated with inventory shifts and customer requests.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-title">🤝 Team Sync</div>
              <p>Seamlessly communicate status updates to the admin panel.</p>
            </div>
          </div>

          <div className="info-footer">
            <p>© 2024 Nest Management System. All rights reserved.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeLogin;