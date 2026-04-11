import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import "./AdminLogin.css"; 
import NestCartIcon from "../../components/NestCartIcon";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); 
  const [error, setError] = useState("");     
  const [showPassword, setShowPassword] = useState(false);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // STEP 1: Login Request
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await authService.adminLogin({ email, password });

    if (!res || res.data?.success === false) {
      setError(res?.data?.message || "Email and password is wrong");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Capture the temp token from backend
    setTempToken(res.data.tempToken);
    setMessage(res.data.message); 

    // Wait 3.5 seconds then trigger the OTP modal
    setTimeout(() => {
      setMessage(""); 
      setShowOtpModal(true);
    }, 3500);
  };

  // STEP 2: OTP Verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");

    // ✅ FIX APPLED HERE: Changed verifyOtp to verifyAdminOtp
    const res = await authService.verifyAdminOtp({ tempToken, otp });

    if (res && res.data?.success) {
      setOtpSuccess("Login Successful!");
      
      dispatch(
        loginSuccess({
          email: res.data.data.email,
          role: "admin",
        })
      );
      localStorage.setItem('userRole', 'admin');

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } else {
      setOtpError(res?.data?.message || "Login Failed: Invalid OTP");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Toast Messages */}
      {error && <div className="toast-error">⚠️ {error}</div>}
      {message && <div className="toast-success-popup">✉️ {message}</div>}

      <div className="auth-container">
        
        {/* LEFT PANE: FORM */}
        <div className="form-pane">
          <div className="logo">
            <div className="logo-icon"><NestCartIcon /></div>
            <div className="logo-text">
              <h1>Nest</h1>
              <p>MART & GROCERY</p>
            </div>
          </div>

          <div className="toggle-buttons">
            <button type="button" className="toggle-btn active">Login</button>
            <button type="button" className="toggle-btn inactive" onClick={() => navigate('/admin/register')}>Sign Up</button>
          </div>

          <div className="form-header">
            <h2>Welcome Back!</h2>
            <p>Please login to your admin account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <div className={`input-wrapper ${error ? "error-mode" : ""}`}>
                <span className="icon left-icon">✉️</span>
                <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className={`input-wrapper ${error ? "error-mode" : ""}`}>
                <span className="icon left-icon">🔒</span>
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <span className="icon right-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁️🗨️" : "👁️"}</span>
              </div>
            </div>

            <div className="forgot-password">
              <a href="/admin/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="submit-btn">Login</button>
          </form>
        </div>

        {/* RIGHT PANE: INFO & BENEFITS (RESTORED) */}
        <div className="info-pane">
          <div className="info-header">
            <h2>What is Here</h2>
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
              <button type="button" className="otp-cancel" onClick={() => setShowOtpModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;