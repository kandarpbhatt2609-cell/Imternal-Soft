import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import './AdminLogin.css'; 
import NestCartIcon from "../../components/NestCartIcon";

const AdminRegister = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear the specific error for this field when the user starts typing again
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  // --- NEW: Client-Side Validation Function ---
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    // 1. Validate Email Structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      // Note: Wrapping in an array ["..."] to match your existing JSX setup (fieldErrors.email[0])
      errors.email = ["Please enter a valid email address."]; 
      isValid = false;
    }

    // 2. Validate Password Requirements
    const hasUppercase = /[A-Z]/.test(form.password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
    const hasDigit = /[0-9]/.test(form.password);

    if (!hasUppercase || !hasSymbol || !hasDigit) {
      errors.password = ["Password needs 1 uppercase, 1 symbol, and 1 digit."];
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setFieldErrors({});

    // Run our custom validation before sending to the server
    if (!validateForm()) {
      return; // Stop the function here if validation fails
    }

    const res = await authService.adminRegister(form);

    if (!res || res.data?.success === false) {
      if (res?.data?.errors) {
        setFieldErrors(res.data.errors);
      } else {
        setError(res?.data?.message || "Registration failed");
      }
      return;
    }

    // --- UPDATED: Set the custom message ---
    setMessage(`Registration successful! A verification link has been sent to your email: ${form.email}`);

    dispatch(
      loginSuccess({
        email: res.data.data.email,
        role: "admin",
      })
    );

    // --- UPDATED: Change timeout to 5000ms (5 seconds) ---
    setTimeout(() => {
      navigate("/admin/login");
    }, 5000); 
  };

  return (
    <div className="auth-wrapper">
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
            <button 
              type="button" 
              className="toggle-btn inactive" 
              onClick={() => navigate('/admin/login')}
            >
              Login
            </button>
            <button type="button" className="toggle-btn active">Sign Up</button>
          </div>

          <div className="form-header">
            <h2>Create Account</h2>
            <p>Sign up to get started with wholesale shopping</p>
          </div>

          {error && <p className="msg-error">{error}</p>}
          {message && <p className="msg-success">{message}</p>}

          <form onSubmit={handleRegister}>
            {/* Username */}
            <div className="input-group">
              <label>Username</label>
              {/* Added dynamic error-mode class */}
              <div className={`input-wrapper ${fieldErrors.username ? "error-mode" : ""}`}>
                <span className="icon left-icon">👤</span>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.username && (
                <p className="field-error-text">{fieldErrors.username[0]}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="input-group">
              <label>Email Address</label>
              {/* Added dynamic error-mode class */}
              <div className={`input-wrapper ${fieldErrors.email ? "error-mode" : ""}`}>
                <span className="icon left-icon">✉️</span>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.email && (
                <p className="field-error-text">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="input-group">
              <label>Phone Number</label>
              {/* Added dynamic error-mode class */}
              <div className={`input-wrapper ${fieldErrors.phonenumber ? "error-mode" : ""}`}>
                <span className="icon left-icon">📞</span>
                <input
                  name="phonenumber"
                  type="text"
                  placeholder="Enter your phone number"
                  value={form.phonenumber}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.phonenumber && (
                <p className="field-error-text">{fieldErrors.phonenumber[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="input-group">
              <label>Password</label>
              {/* Added dynamic error-mode class */}
              <div className={`input-wrapper ${fieldErrors.password ? "error-mode" : ""}`}>
                <span className="icon left-icon">🔒</span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <span 
                  className="icon right-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </span>
              </div>
              {fieldErrors.password && (
                <p className="field-error-text">{fieldErrors.password[0]}</p>
              )}
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>Sign Up</button>
          </form>
        </div>

        {/* RIGHT PANE: INFO */}
        <div className="info-pane">
          <div className="info-header">
            <h2>Join Us Today!</h2>
            <p>Start your wholesale journey with exclusive benefits</p>
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
              <div className="benefit-title">💰 Special Offers</div>
              <p>Exclusive discounts for new members</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminRegister;