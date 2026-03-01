import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/authSlice"; 
import authService from "../../auth/authService"; // 👈 You must import this!

const EmployeeDashboard = () => {
  // 👈 Fix: Change 'user' to 'userData' to match your authSlice.js
  const { userData } = useSelector((state) => state.auth); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // 1. Tell the backend to destroy the cookie FIRST
    const res = await authService.logout("employee");
      console.log("Backend Logout Response:", res.data);
      
      // 2. Clear the Redux state SECOND
      dispatch(logout());
      
      // 3. Redirect the user
      navigate("/employee/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the backend fails, force the user out of the frontend
      dispatch(logout());
      navigate("/employee/login");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <h1>Employee Dashboard</h1>
        <button onClick={handleLogout} style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "8px 15px", cursor: "pointer", borderRadius: "4px" }}>
          Logout
        </button>
      </nav>

      <main style={{ marginTop: "30px" }}>
        <div style={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
          {/* 👈 Fix: Use userData here */}
          <h2>Welcome back, {userData?.email}!</h2>
          <p><strong>Role:</strong> {userData?.role}</p>
          <p><strong>Status:</strong> Active</p>
        </div>

        <section style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
            <h3>Upcoming Tasks</h3>
            <ul>
              <li>Complete daily report</li>
              <li>Attend team meeting at 2:00 PM</li>
            </ul>
          </div>
          <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
            <h3>Recent Announcements</h3>
            <p>The office will be closed this Friday for the holiday.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmployeeDashboard;