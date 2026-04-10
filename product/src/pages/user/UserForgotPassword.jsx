import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import conf from "../../conf/conf";
import "../admin/AdminForgotPassword.css"; // Reuse the new premium cardinal design

const UserForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Toggle password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP States
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState("");
    const [tempToken, setTempToken] = useState("");

    const navigate = useNavigate();
    const timerRef = useRef(null);
    const otpTimerRef = useRef(null);

    // 🔐 cleanup timers
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (otpTimerRef.current) clearTimeout(otpTimerRef.current);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("the both password is mismatched");
            return;
        }

        try {
            const res = await axios.put(
                `${conf.API_URL}/auth/api/user/forgot-password`,
                { email, password, confirmPassword },
                { withCredentials: true }
            );

            if (res.data.success) {
                if (res.data.tempToken) {
                    setTempToken(res.data.tempToken);
                }

                setMessage("Enter the OTP to change the password");

                timerRef.current = setTimeout(() => {
                    setMessage("");
                    setShowOtpModal(true);
                }, 4000);
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.errors?.confirmPassword?.[0] ||
                "Password reset failed"
            );
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setOtpError("");
        setOtpSuccess("");

        const payload = {
            email: email,
            otp: otp,
            password: password,
            confirmPassword: confirmPassword,
        };
        if (tempToken) payload.tempToken = tempToken;

        let res;
        try {
            res = await axios.post(
                `${conf.API_URL}/auth/api/user/reset-password-verify`,
                payload,
                { withCredentials: true }
            );
        } catch (postErr) {
            try {
                res = await axios.put(
                    `${conf.API_URL}/auth/api/user/reset-password-verify`,
                    payload,
                    { withCredentials: true }
                );
            } catch (putErr) {
                console.error("OTP Verify Error:", putErr.response);
                setOtpError(
                    putErr.response?.data?.message ||
                    postErr.response?.data?.message ||
                    "OTP is incorrect"
                );
                return;
            }
        }

        if (res?.data && res.data.success) {
            setOtpSuccess("Password changed successfully");
            otpTimerRef.current = setTimeout(() => {
                navigate("/user/login", { replace: true });
            }, 3000);
        } else {
            setOtpError(res?.data?.message || "OTP is incorrect");
        }
    };

    return (
        <div className="forgot-password-wrapper">
            <div className="forgot-password-card">
                {/* --- LOGO SECTION --- */}
                <div className="logo-section">
                    <div className="logo-icon-box">🛒</div>
                    <div className="logo-text-box">
                        <h1>Nest</h1>
                        <p>MART & GROCERY</p>
                    </div>
                </div>

                {/* --- HEADER --- */}
                <div className="forgot-header">
                    <h2>Forgot Password</h2>
                    <p>Reset your password using your registered email and new credentials.</p>
                </div>

                {/* --- ERRORS / MESSAGES --- */}
                {error && <div className="error-msg">⚠️ {error}</div>}
                {message && <div className="success-msg">✉️ {message}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <span className="icon-left">✉️</span>
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
                        <label>New Password</label>
                        <div className="input-wrapper">
                            <span className="icon-left orange-icon">🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span 
                                className="icon-right" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "👁️‍🗨️" : "👁️"}
                            </span>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <span className="icon-left orange-icon">🔒</span>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <span 
                                className="icon-right" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="reset-btn">Reset Password</button>
                </form>
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

export default UserForgotPassword;
