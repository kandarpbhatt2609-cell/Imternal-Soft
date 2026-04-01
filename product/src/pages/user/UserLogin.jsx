import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import "../admin/AdminLogin.css"; // Using the shared design styles

const UserLogin = () => {
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

  // STEP 1: Initial Login (Email/Password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await authService.userLogin({ email, password });

    if (!res || res.data?.success === false) {
      setError(res?.data?.message || "Invalid email or password");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Capture the temp token and show the sending message
    setTempToken(res.data.tempToken);
    setMessage(res.data.message); 

    // Wait 3.5 seconds then open the OTP Modal
    setTimeout(() => {
      setMessage(""); 
      setShowOtpModal(true);
    }, 3500);
  };

  // STEP 2: Verify OTP
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");

    const res = await authService.verifyOtp({ 
      tempToken, 
      otp 
    });

    if (res && res.data?.success) {
      setOtpSuccess("Login Successful!");
      
      dispatch(
        loginSuccess({
          email: res.data.data.email,
          role: "user",
        })
      );

      // Redirect to user dashboard after a brief delay
      setTimeout(() => {
        navigate("/user/dashboard");
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

          <div className="toggle-buttons">
            <button type="button" className="toggle-btn active">Login</button>
            <button 
              type="button" 
              className="toggle-btn inactive" 
              onClick={() => navigate('/user/register')}
            >
              Sign Up
            </button>
          </div>

          <div className="form-header">
            <h2>Welcome Back!</h2>
            <p>Login to start your shopping journey</p>
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

            <div className="forgot-password">
              <Link to="/user/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="submit-btn">Login</button>
          </form>
        </div>

        {/* RIGHT PANE: USER BENEFITS */}
        <div className="info-pane">
          <div className="info-header">
            <h2>Nest Family</h2>
            <p>Enjoy fresh groceries delivered right to your doorstep</p>
          </div>

          <div className="benefits-list">
            <div className="benefit-card">
              <div className="benefit-title">🍎 Fresh Produce</div>
              <p>Farm-to-table quality in every order</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-title">⚡ Express Delivery</div>
              <p>Your groceries delivered in 60 minutes</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-title">🎁 Daily Offers</div>
              <p>Exclusive discounts for registered members</p>
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

export default UserLogin;