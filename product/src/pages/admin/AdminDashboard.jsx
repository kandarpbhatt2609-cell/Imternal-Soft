import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../auth/authService";
import { logout } from "../../auth/authSlice";
import conf from "../../conf/conf";
import "../admin/AdminLogin.css"; // Styles for the two-pane layout

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // --- STATES FOR ADD EMPLOYEE ---
  const [employeeData, setEmployeeData] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      const res = await authService.logout("admin");
      if (res?.data?.success) {
        dispatch(logout());
        navigate("/admin/login");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Something went wrong while logging out");
    }
  };

  // 🔹 Fetch Users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${conf.API_URL}/auth/api/admin/users/all`, 
        { withCredentials: true }
      );
      setUsers(response.data.data || response.data || []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    }
  };

  // 🔹 Fetch Employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${conf.API_URL}/auth/api/admin/employees/all`, 
        { withCredentials: true }
      );
      setEmployees(response.data.data || response.data || []);
    } catch (err) {
      console.error("Fetch Employees Error:", err);
    }
  };

  // 🔹 Change User Status
  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    try {
      await axios.put(
        `${conf.API_URL}/auth/api/admin/users/status/${userId}`,
        { status: newStatus },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Status Update Error:", err);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: currentStatus } : user
        )
      );
      alert("Failed to update user status on the server.");
    }
  };

  // 🔹 Handle Input Changes
  const handleInputChange = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" }); // Clear field error on type
  };

  // 🔹 Handle Adding a New Employee (Design Updated)
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setFieldErrors({});

    try {
      const res = await authService.employeeRegister(employeeData);
      
      if (res?.data?.success || res?.status === 200 || res?.status === 201) {
        // STAY ON PAGE: Show success message and reset fields
        setMessage("Employee registered successfully!");
        setEmployeeData({ username: "", email: "", phonenumber: "", password: "" });
        
        // Auto-clear message after 4 seconds
        setTimeout(() => setMessage(""), 4000);
      } else {
        // Handle specific field errors if your backend sends them
        if (res?.data?.errors) {
            setFieldErrors(res.data.errors);
        } else {
            setError(res?.data?.message || "Email already exists or invalid data");
        }
      }
    } catch (err) {
      console.error("Add Employee Error:", err);
      setError("Server error: Could not register employee.");
    }
  };

  // 🔹 Load data based on active section
  useEffect(() => {
    if (activeSection === "users") {
      fetchUsers();
    } else if (activeSection === "employees") {
      fetchEmployees();
    }
  }, [activeSection]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* 🔹 Sidebar */}
      <div style={{ width: "220px", background: "#f4f4f4", padding: "20px" }}>
        <h3>Admin Panel</h3>
        <button onClick={() => setActiveSection("dashboard")} style={sidebarBtnStyle}>Dashboard</button>
        <button onClick={() => setActiveSection("users")} style={sidebarBtnStyle}>View All Users</button>
        <button onClick={() => setActiveSection("employees")} style={sidebarBtnStyle}>View All Employees</button>
        <button 
            onClick={() => setActiveSection("add-employee")} 
            style={{ ...sidebarBtnStyle, backgroundColor: activeSection === "add-employee" ? "#d0d0d0" : "#e0e0e0", fontWeight: "bold" }}
        >
            + Add Employee
        </button>

        <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
      </div>

      {/* 🔹 Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#fff" }}>
        {activeSection === "dashboard" && (
          <>
            <h1>Admin Dashboard 🔐</h1>
            <p>Welcome Admin</p>
          </>
        )}

        {/* 🔹 ADD EMPLOYEE SECTION (THE CHANGE) */}
        {activeSection === "add-employee" && (
          <div className="auth-wrapper" style={{ padding: 0, minHeight: "auto" }}>
            <div className="auth-container" style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)", maxWidth: "1000px" }}>
              
              {/* LEFT PANE: FORM */}
              <div className="form-pane">
                <div className="form-header">
                  <h2>Create Staff Account</h2>
                  <p>Register a new employee to the management system</p>
                </div>

                {/* Status Messages */}
                {message && <div className="msg-success" style={{ textAlign: "center", marginBottom: "15px" }}>✅ {message}</div>}
                {error && <div className="msg-error" style={{ textAlign: "center", marginBottom: "15px" }}>⚠️ {error}</div>}

                <form onSubmit={handleAddEmployee}>
                  <div className="input-group">
                    <label>Username</label>
                    <div className={`input-wrapper ${fieldErrors.username ? "error-mode" : ""}`}>
                      <span className="icon left-icon">👤</span>
                      <input
                        type="text"
                        name="username"
                        placeholder="Employee full name"
                        value={employeeData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Email Address</label>
                    <div className={`input-wrapper ${fieldErrors.email ? "error-mode" : ""}`}>
                      <span className="icon left-icon">✉️</span>
                      <input
                        type="email"
                        name="email"
                        placeholder="employee@nest.com"
                        value={employeeData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Phone Number</label>
                    <div className={`input-wrapper ${fieldErrors.phonenumber ? "error-mode" : ""}`}>
                      <span className="icon left-icon">📞</span>
                      <input
                        type="text"
                        name="phonenumber"
                        placeholder="Phone number"
                        value={employeeData.phonenumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Temp Password</label>
                    <div className={`input-wrapper ${fieldErrors.password ? "error-mode" : ""}`}>
                      <span className="icon left-icon">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Set temporary password"
                        value={employeeData.password}
                        onChange={handleInputChange}
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

                  <button type="submit" className="submit-btn" style={{ marginTop: "10px" }}>
                    Register Employee
                  </button>
                </form>
              </div>

              {/* RIGHT PANE: INFO */}
              <div className="info-pane">
                <div className="info-header">
                  <h2>Internal Access</h2>
                  <p>Employees can manage store data once registered.</p>
                </div>
                <div className="benefits-list">
                  <div className="benefit-card">
                    <div className="benefit-title">📦 Inventory Access</div>
                    <p>Can add, edit, and remove products.</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-title">📋 Order Handling</div>
                    <p>Process customer orders and updates.</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-title">🛡️ Secure System</div>
                    <p>Employee roles are restricted to staff tasks only.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 🔹 View Users Section (Existing) */}
        {activeSection === "users" && (
            <div className="table-container">
                <h2>All Users</h2>
                <table border="1" cellPadding="10" style={tableStyle}>
                    <thead style={{ backgroundColor: "#eee" }}>
                        <tr>
                            <th>ID</th><th>Username</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Created At</th><th>Last Login</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td><td>{user.username}</td><td>{user.email}</td><td>{user.phonenumber}</td><td>{user.role}</td>
                                <td>
                                    <button onClick={() => handleStatusChange(user.id, user.status)} style={{ ...statusBtnStyle, backgroundColor: user.status === "active" ? "green" : "red" }}>
                                        {user.status === "active" ? "Active" : "Inactive"}
                                    </button>
                                </td>
                                <td>{user.created_at}</td><td>{user.last_login}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* 🔹 View Employees Section (Existing) */}
        {activeSection === "employees" && (
            <div className="table-container">
                <h2>All Employees</h2>
                <table border="1" cellPadding="10" style={tableStyle}>
                    <thead style={{ backgroundColor: "#eee" }}>
                        <tr>
                            <th>Image</th><th>ID</th><th>Username</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Created At</th><th>Last Login</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.id}>
                                <td>
                                    {emp.profile_image ? (
                                        <img src={`${conf.API_URL}/image/employeeimage/${emp.profile_image}`} alt="profile" style={profileImgStyle} onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : "No Image"}
                                </td>
                                <td>{emp.id}</td><td>{emp.username}</td><td>{emp.email}</td><td>{emp.phonenumber}</td><td>{emp.role}</td>
                                <td>
                                    <span style={{ ...statusBadgeStyle, backgroundColor: emp.status === "active" ? "green" : "red" }}>{emp.status}</span>
                                </td>
                                <td>{emp.created_at}</td><td>{emp.last_login}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const sidebarBtnStyle = { display: "block", marginBottom: "10px", width: "100%", padding: "10px", textAlign: "left", cursor: "pointer", border: "1px solid #ddd", borderRadius: "4px" };
const logoutBtnStyle = { marginTop: "20px", padding: "10px", cursor: "pointer", background: "red", color: "white", border: "none", width: "100%", borderRadius: "4px" };
const tableStyle = { width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: "15px" };
const statusBtnStyle = { color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const statusBadgeStyle = { color: "white", padding: "6px 12px", borderRadius: "4px", fontWeight: "bold", display: "inline-block" };
const profileImgStyle = { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" };

export default AdminDashboard;