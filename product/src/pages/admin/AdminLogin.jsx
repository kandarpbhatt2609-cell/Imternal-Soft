import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import AdminForgotPassword from './AdminForgotPassword';


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // 🔥 message state
  const [error, setError] = useState("");     // 🔥 error state

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await authService.adminLogin({ email, password });

    // ❌ backend error
    if (!res || res.data?.success === false) {
      setError(res?.data?.message || "Login failed");
      return;
    }

    // ✅ success
    setMessage(res.data.message);

    dispatch(
      loginSuccess({
        email: res.data.data.email,
        role: "admin",
      })
    );

    // small delay so message is visible
    setTimeout(() => {
      navigate("/admin/dashboard");
    }, 800);
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Admin Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Login</button>

      <p>
          <a href="/admin/forgot-password">Forgot password?</a>
      </p>

    </form>
  );
};

export default AdminLogin;
