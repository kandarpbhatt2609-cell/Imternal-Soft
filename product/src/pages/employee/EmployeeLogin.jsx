import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { loginSuccess } from "../../auth/authSlice";
import EmployeeForgotPassword from './EmployeeForgotPassword';

const EmployeeLogin = () => {
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

    try {
      const res = await authService.employeeLogin({ email, password });

      // Match the structure from your employeeController.js
      if (res.status === 200 && res.data?.success !== false) {
        setMessage("employee login succesfull"); 

        dispatch(loginSuccess({
          email: res.data.data.email, // Using res.data.data.email
          role: "employee",
        }));

        setTimeout(() => navigate("/employee/dashboard"), 800);
      } else {
        setError(res.data?.message || "Login failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <form onSubmit={handleLogin}>
        <h2>Employee Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br/><br/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br/><br/>
        
        <button type="submit">Login</button>

         <p>
          <a href="/employee/forgot-password">Forgot password?</a>
      </p>

      </form>
    </div>
  );
};

export default EmployeeLogin;