import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import { Link } from "react-router-dom";
import "../admin/AdminLogin.css"; // Using the shared design styles

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // For eye icon toggle

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await authService.userLogin({ email, password });

    if (!res || res.data?.success === false) {
      setError(res?.data?.message || "Invalid email or password");
      
      // Clear error toast after 3 seconds to match Admin behavior
      setTimeout(() => {
        setError("");
      }, 3000);
      
      return;
    }

    setMessage(res.data.message);

    dispatch(
      loginSuccess({
        email: res.data.data.email,
        role: "user",
      })
    );

    setTimeout(() => {
      navigate("/user/dashboard");
    }, 800);
  };

  return (
    <div className="auth-wrapper">
      {/* --- TOAST ERROR MESSAGE --- */}
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
              onClick={() => navigate('/user/register')}
            >
              Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="form-header">
            <h2>Welcome Back!</h2>
            <p>Login to start your shopping journey</p>
          </div>

          {/* Success Message */}
          {message && <p className="msg-success">{message}</p>}

          <form onSubmit={handleLogin}>
            {/* Email Input */}
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

            {/* Password Input */}
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
                  style={{ cursor: 'pointer' }}
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

        {/* RIGHT PANE: INFO & BENEFITS */}
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
    </div>
  );
};

export default UserLogin;