import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import conf from "../../conf/conf";

const UserForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // 🧹 cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.put(
        `${conf.API_URL}/auth/api/user/forgot-password`, // 👈 USER API
        { email, password, confirmPassword },
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessage(res.data.message);

        // ✅ redirect to user login
        timerRef.current = setTimeout(() => {
          navigate("/user/login", { replace: true });
        }, 1500);
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

  return (
    <form onSubmit={handleSubmit}>
      <h2>User Forgot Password</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button type="submit">Reset Password</button>
    </form>
  );
};

export default UserForgotPassword;
