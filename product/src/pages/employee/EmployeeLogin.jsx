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

  // --- OTP States ---
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // STEP 1: Initial Login Request
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await authService.employeeLogin({ email, password });

      // Check if backend returned success and a tempToken
      if (res.status === 200 && res.data?.success !== false) {
        setTempToken(res.data.tempToken);
        setMessage(res.data.message || "OTP sent to your email.");

        // Wait 3.5 seconds to show the toast, then open OTP modal
        setTimeout(() => {
          setMessage("");
          setShowOtpModal(true);
        }, 3500);
      } else {
        setError(res.data?.message || "Invalid credentials. Please try again.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Server error. Please try again later.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // STEP 2: OTP Verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");

    const res = await authService.verifyEmployeeOtp({ tempToken, otp });

    if (res && res.data?.success) {
      setOtpSuccess("Login Successful!");
      
      dispatch(
        loginSuccess({
          email: res.data.data.email,
          role: "employee",
        })
      );
      localStorage.setItem('userRole', 'employee');

      setTimeout(() => {
        navigate("/employee/dashboard");
      }, 1500);
    } else {
      setOtpError("Login Failed: Invalid OTP");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Toast Messages */}
      {error && <div className="toast-error">⚠️ {error}</div>}
      {message && <div className="toast-success-popup">✉️ {message}</div>}

      <div className="auth-container">
        
        {/* LEFT PANE: LOGIN FORM */}
        <div className="form-pane">
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

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
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

            <div className="input-group">
              <label>Password</label>
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

            <button type="submit" className="submit-btn">Login</button>
          </form>
        </div>

        {/* RIGHT PANE: EMPLOYEE INFO */}
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
            <p>© 2026 Nest Management System. All rights reserved.</p>
          </div>
        </div>

      </div>

      {/* --- OTP MODAL POPUP --- */}
      {showOtpModal && (
        <div className="otp-overlay">
          <div className="otp-card">
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to your email</p>
            
            <form onSubmit={handleOtpVerify}>
              <input 
                type="text" 
                className="otp-input"
                maxLength="6" 
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              
              {otpError && <p className="otp-msg-error">{otpError}</p>}
              {otpSuccess && <p className="otp-msg-success">{otpSuccess}</p>}

              <button type="submit" className="otp-submit-btn">Verify & Proceed</button>
              <button 
                type="button" 
                className="otp-cancel" 
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLogin;