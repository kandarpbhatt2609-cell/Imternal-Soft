import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import { Link } from "react-router-dom";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await authService.userLogin({ email, password });

    if (!res || res.data?.success === false) {
      setError(res?.data?.message || "Login failed");
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
    <form onSubmit={handleLogin}>
      <h2>User Login</h2>

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

      {/* 👇 Forgot Password Link */}
      <p style={{ marginTop: "10px" }}>
        <Link to="/user/forgot-password">Forgot password?</Link>
      </p>
    </form>
  );
};

export default UserLogin;
