import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import "./AdminLogin.css"; // Importing CSS for styling

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); 
  const [error, setError] = useState("");     
  const [showPassword, setShowPassword] = useState(false); // To toggle eye icon

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");

  const res = await authService.adminLogin({ email, password });

  if (!res || res.data?.success === false) {
    // Set the specific error or a default fallback
    setError(res?.data?.message || "Email and password is wrong");
    
    // Clear the error (and red borders) after 3 seconds
    setTimeout(() => {
      setError("");
    }, 3000);
    
    return;
  }

  setMessage(res.data.message);

  dispatch(
    loginSuccess({
      email: res.data.data.email,
      role: "admin",
    })
  );

  setTimeout(() => {
    navigate("/admin/dashboard");
  }, 800);
};

  return (
    <div className="auth-wrapper">
      {/* --- TOAST MESSAGE (Displays only when error exists) --- */}
      {error && (
        <div className="toast-error">
          ⚠️ {error}
        </div>
      )}

      <div className="auth-container">
        
        {/* LEFT PANE: FORM */}
        <div className="form-pane">
          
          {/* Logo Area */}
          <div className="logo">
            <div className="logo-icon">🛒</div>
            <div className="logo-text">
              <h1>Nest</h1>
              <p>MART & GROCERY</p>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="toggle-buttons">
            <button type="button" className="toggle-btn active">Login</button>
            <button 
              type="button" 
              className="toggle-btn inactive" 
              onClick={() => navigate('/admin/register')}
            >
              Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="form-header">
            <h2>Welcome Back!</h2>
            <p>Please login to your admin account</p>
          </div>

          {/* Success Message (kept inline) */}
          {message && <p className="msg-success">{message}</p>}

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="input-group">
              <label>Email Address</label>
              {/* Added dynamic class "error-mode" here */}
              <div className={`input-wrapper ${error ? "error-mode" : ""}`}>
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
              {/* Added dynamic class "error-mode" here */}
              <div className={`input-wrapper ${error ? "error-mode" : ""}`}>
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

            <div className="forgot-password">
              <a href="/admin/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="submit-btn">Login</button>
          </form>
        </div>

        {/* RIGHT PANE: INFO & BENEFITS */}
        <div className="info-pane">
          <div className="info-header">
            <h2>What is Hear</h2>
            <p>Manage your wholesale inventory and track business growth</p>
          </div>

          <div className="benefits-list">
            <div className="benefit-card">
              <div className="benefit-title">🎯 Wholesale Prices</div>
              <p>Get the best bulk deals for your business</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-title">🚚 Fast Delivery</div>
              <p>Quick shipping for all your orders</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-title">✨ Quality Products</div>
              <p>Premium goods from trusted suppliers</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;