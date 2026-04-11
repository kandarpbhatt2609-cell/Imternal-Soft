import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import "../admin/AdminLogin.css";
import NestCartIcon from "../../components/NestCartIcon";

const UserRegister = () => {
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
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  // Client-Side Validation (Same as Admin)
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      errors.email = ["Please enter a valid email address."]; 
      isValid = false;
    }

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

    if (!validateForm()) return;

    try {
      const res = await authService.userRegister(form);

      if (!res || res.data?.success === false) {
        if (res?.data?.errors) {
          setFieldErrors(res.data.errors);
        } else {
          setError(res?.data?.message || "Registration failed");
        }
        return;
      }

      // Success message with the email link notification
      setMessage(`Registration successful! A verification link has been sent to your email: ${form.email}`);

      dispatch(
        loginSuccess({
          email: res.data.data.email,
          role: "user",
        })
      );

      // 5-second delay before redirecting
      setTimeout(() => {
        navigate("/user/login");
      }, 5000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* LEFT PANE: FORM */}
        <div className="form-pane relative">
          <Link 
            to="/" 
            className="absolute top-8 right-8 lg:top-10 lg:right-10 flex items-center gap-2 text-[#4b5563] bg-white hover:text-[var(--nest-primary)] 
                       hover:shadow-md px-4 py-2 rounded-full font-bold shadow-sm transition-all z-10 text-[13px] border border-gray-200"
            style={{ textDecoration: "none" }}
          >
            <span>🏠 Home</span>
          </Link>

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
              onClick={() => navigate('/user/login')}
            >
              Login
            </button>
            <button type="button" className="toggle-btn active">Sign Up</button>
          </div>

          <div className="form-header">
            <h2>Create Account</h2>
            <p>Sign up to start shopping with Nest Mart</p>
          </div>

          {error && <p className="msg-error">{error}</p>}
          {message && <p className="msg-success">{message}</p>}

          <form onSubmit={handleRegister}>
            {/* Username */}
            <div className="input-group">
              <label>Username</label>
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
              {fieldErrors.username && <p className="field-error-text">{fieldErrors.username[0]}</p>}
            </div>

            {/* Email Address */}
            <div className="input-group">
              <label>Email Address</label>
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
              {fieldErrors.email && <p className="field-error-text">{fieldErrors.email[0]}</p>}
            </div>

            {/* Phone Number */}
            <div className="input-group">
              <label>Phone Number</label>
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
              {fieldErrors.phonenumber && <p className="field-error-text">{fieldErrors.phonenumber[0]}</p>}
            </div>

            {/* Password */}
            <div className="input-group">
              <label>Password</label>
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
              {fieldErrors.password && <p className="field-error-text">{fieldErrors.password[0]}</p>}
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>Sign Up</button>
          </form>
        </div>

        {/* RIGHT PANE: INFO */}
        <div className="info-pane">
          <div className="info-header">
            <h2>Shop With Us!</h2>
            <p>Join thousands of happy customers today</p>
          </div>

          <div className="benefits-list">
            <div className="benefit-card">
              <div className="benefit-title">🍎 Fresh Products</div>
              <p>Daily updated stock of fresh groceries</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-title">⚡ Quick Checkout</div>
              <p>Save time with our optimized shopping flow</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-title">🎁 Member Rewards</div>
              <p>Earn points on every purchase you make</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserRegister;