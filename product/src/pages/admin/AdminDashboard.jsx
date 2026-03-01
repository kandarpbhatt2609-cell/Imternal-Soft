import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../auth/authService";
import { logout } from "../../auth/authSlice";
import conf from "../../conf/conf";

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]); // 🔹 NEW: State for employees
  const [error, setError] = useState("");

  const [employeeData, setEmployeeData] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
  });

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

  // 🔹 NEW: Fetch Employees
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

  // 🔹 Handle Adding a New Employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.employeeRegister(employeeData);
      
      if (res?.data?.success || res?.status === 200 || res?.status === 201) {
        alert("Employee added successfully!");
        setEmployeeData({ username: "", email: "", phonenumber: "", password: "" });
        setActiveSection("employees"); // Automatically switch to employees view to see them
      } else {
        alert("Failed to add employee: " + (res?.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Add Employee Error:", err);
      alert("Something went wrong adding the employee.");
    }
  };

  // 🔹 Load data based on active section
  useEffect(() => {
    if (activeSection === "users") {
      fetchUsers();
    } else if (activeSection === "employees") {
      fetchEmployees(); // 🔹 Fetch employees when the tab is clicked
    }
  }, [activeSection]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* 🔹 Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#f4f4f4",
          padding: "20px",
        }}
      >
        <h3>Admin Panel</h3>

        <button
          onClick={() => setActiveSection("dashboard")}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", textAlign: "left" }}
        >
          Dashboard
        </button>

        <button
          onClick={() => setActiveSection("users")}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", textAlign: "left" }}
        >
          View All Users
        </button>

        {/* 🔹 NEW: View All Employees Sidebar Button */}
        <button
          onClick={() => setActiveSection("employees")}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", textAlign: "left" }}
        >
          View All Employees
        </button>

        <button
          onClick={() => setActiveSection("add-employee")}
          style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", textAlign: "left", backgroundColor: "#e0e0e0", border: "1px solid #ccc" }}
        >
          + Add Employee
        </button>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "20px",
            padding: "8px",
            cursor: "pointer",
            background: "red",
            color: "white",
            border: "none",
            width: "100%"
          }}
        >
          Logout
        </button>
      </div>

      {/* 🔹 Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {activeSection === "dashboard" && (
          <>
            <h1>Admin Dashboard 🔐</h1>
            <p>Welcome Admin</p>
          </>
        )}

        {/* 🔹 Add Employee Form Section */}
        {activeSection === "add-employee" && (
          <>
            <h2>Add New Employee</h2>
            <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", maxWidth: "400px" }}>
              <form onSubmit={handleAddEmployee} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input 
                  type="text" 
                  placeholder="Username" 
                  required
                  value={employeeData.username}
                  onChange={(e) => setEmployeeData({...employeeData, username: e.target.value})} 
                  style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  required
                  value={employeeData.email}
                  onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})} 
                  style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <input 
                  type="text" 
                  placeholder="Phone Number" 
                  required
                  value={employeeData.phonenumber}
                  onChange={(e) => setEmployeeData({...employeeData, phonenumber: e.target.value})} 
                  style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  value={employeeData.password}
                  onChange={(e) => setEmployeeData({...employeeData, password: e.target.value})} 
                  style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <button 
                  type="submit" 
                  style={{ backgroundColor: "#4CAF50", color: "white", border: "none", padding: "10px", cursor: "pointer", borderRadius: "4px", fontWeight: "bold" }}
                >
                  Register Employee
                </button>
              </form>
            </div>
          </>
        )}

        {/* 🔹 View Users Section */}
        {activeSection === "users" && (
          <>
            <h2>All Users</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#eee" }}>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phonenumber}</td>
                      <td>{user.role}</td>
                      <td>
                        <button
                          onClick={() => handleStatusChange(user.id, user.status)}
                          style={{
                            backgroundColor: user.status === "active" ? "green" : "red",
                            color: "white",
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold"
                          }}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>{user.created_at}</td>
                      <td>{user.last_login}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* 🔹 NEW: View Employees Section */}
        {activeSection === "employees" && (
          <>
            <h2>All Employees</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#eee" }}>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(employees) && employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        {emp.profile_image ? (
                          // Adjust the src path depending on exactly how your express static folder is setup
                          <img 
                            src={`${conf.API_URL}/image/employeeimage/${emp.profile_image}`} 
                            alt="profile" 
                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} 
                            onError={(e) => { e.target.style.display = 'none'; }} // Hides broken image icons
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td>{emp.id}</td>
                      <td>{emp.username}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phonenumber}</td>
                      <td>{emp.role}</td>
                      <td>
                        <span style={{ 
                          backgroundColor: emp.status === "active" ? "green" : "red", 
                          color: "white", 
                          padding: "6px 12px", 
                          borderRadius: "4px",
                          fontWeight: "bold"
                        }}>
                          {emp.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{emp.created_at}</td>
                      <td>{emp.last_login}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;