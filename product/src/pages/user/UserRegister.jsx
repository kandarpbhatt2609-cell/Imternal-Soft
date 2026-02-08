import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";

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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setFieldErrors({});

    try {
      const res = await authService.userRegister(form);

      // ❌ API or validation error
      if (!res || res.data?.success === false) {
        if (res?.data?.errors) {
          setFieldErrors(res.data.errors);
        } else {
          setError(res?.data?.message || "Registration failed");
        }
        return;
      }

      // ✅ success
      setMessage(res.data.message);

      // optional auto-login
      dispatch(
        loginSuccess({
          email: res.data.data.email,
          role: "user",
        })
      );

      setTimeout(() => {
        navigate("/user/dashboard");
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>User Register</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
      />
      {fieldErrors.username && (
        <p style={{ color: "red" }}>{fieldErrors.username[0]}</p>
      )}

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      {fieldErrors.email && (
        <p style={{ color: "red" }}>{fieldErrors.email[0]}</p>
      )}

      <input
        name="phonenumber"
        placeholder="Phone Number"
        value={form.phonenumber}
        onChange={handleChange}
      />
      {fieldErrors.phonenumber && (
        <p style={{ color: "red" }}>{fieldErrors.phonenumber[0]}</p>
      )}

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />
      {fieldErrors.password && (
        <p style={{ color: "red" }}>{fieldErrors.password[0]}</p>
      )}

      <button type="submit">Register</button>
    </form>
  );
};

export default UserRegister;
