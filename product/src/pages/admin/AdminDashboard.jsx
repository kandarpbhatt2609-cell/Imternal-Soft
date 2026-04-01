import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../auth/authService";
import { logout } from "../../auth/authSlice";
import conf from "../../conf/conf";
import "../admin/AdminLogin.css"; 

// Only import what is needed for the category management functions
import { getCategories, addCategory } from "../../admincatagory/categoryService";

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // --- STATES FOR CATEGORIES ---
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    allowedUnits: []
  });
  const [catMessage, setCatMessage] = useState("");
  const [catError, setCatError] = useState("");
  
  const availableUnits = ["kg", "gm", "l", "ml", "packet", "piece"];

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

  // 🔹 Fetch Data Functions
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${conf.API_URL}/auth/api/admin/users/all`, { withCredentials: true });
      setUsers(response.data.data || response.data || []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${conf.API_URL}/auth/api/admin/employees/all`, { withCredentials: true });
      setEmployees(response.data.data || response.data || []);
    } catch (err) {
      console.error("Fetch Employees Error:", err);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const data = await getCategories();
      setCategoriesList(data || []);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
    }
  };

  // 🔹 Handle Adding Category
  const handleUnitToggle = (unit) => {
    setNewCategory(prev => {
      const units = prev.allowedUnits;
      if (units.includes(unit)) {
        return { ...prev, allowedUnits: units.filter(u => u !== unit) };
      } else {
        return { ...prev, allowedUnits: [...units, unit] };
      }
    });
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    setCatMessage("");
    setCatError("");

    if (newCategory.allowedUnits.length === 0) {
      setCatError("Please select at least one unit.");
      return;
    }

    try {
      const res = await addCategory(newCategory);
      if (res.success || res.categoryName) {
        setCatMessage("Category added successfully!");
        setNewCategory({ categoryName: "", allowedUnits: [] });
        setTimeout(() => setCatMessage(""), 4000);
      } else {
        setCatError(res.message || "Failed to add category");
      }
    } catch (err) {
      setCatError(err.response?.data?.message || "Server error: Could not add category.");
    }
  };

  // 🔹 Handle Adding a New Employee
  const handleInputChange = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" }); 
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setFieldErrors({});

    try {
      const res = await authService.employeeRegister(employeeData);
      if (res?.data?.success || res?.status === 200 || res?.status === 201) {
        setMessage("Employee registered successfully!");
        setEmployeeData({ username: "", email: "", phonenumber: "", password: "" });
        setTimeout(() => setMessage(""), 4000);
      } else {
        if (res?.data?.errors) {
            setFieldErrors(res.data.errors);
        } else {
            setError(res?.data?.message || "Email already exists or invalid data");
        }
      }
    } catch (err) {
      setError("Server error: Could not register employee.");
    }
  };

  useEffect(() => {
    if (activeSection === "users") fetchUsers();
    else if (activeSection === "employees") fetchEmployees();
    else if (activeSection === "view-categories") fetchAllCategories();
  }, [activeSection]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* 🔹 Sidebar */}
      <div style={{ width: "240px", background: "#f4f4f4", padding: "20px", display: "flex", flexDirection: "column" }}>
        <h3>Admin Panel</h3>
        <button onClick={() => setActiveSection("dashboard")} style={sidebarBtnStyle(activeSection === "dashboard")}>Dashboard</button>
        <button onClick={() => setActiveSection("users")} style={sidebarBtnStyle(activeSection === "users")}>View All Users</button>
        <button onClick={() => setActiveSection("employees")} style={sidebarBtnStyle(activeSection === "employees")}>View All Employees</button>
        <button onClick={() => setActiveSection("add-employee")} style={sidebarBtnStyle(activeSection === "add-employee")}>+ Add Employee</button>

        {/* 🔹 Categories Sidebar Dropdown */}
        <div style={{ marginTop: "10px", marginBottom: "10px" }}>
          <button 
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)} 
            style={{ ...sidebarBtnStyle(false), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>Categories</span> <span>{isCategoryMenuOpen ? "▲" : "▼"}</span>
          </button>
          
          {isCategoryMenuOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", paddingLeft: "15px", marginTop: "5px" }}>
              <button onClick={() => setActiveSection("view-categories")} style={subSidebarBtnStyle(activeSection === "view-categories")}>View Categories</button>
              <button onClick={() => setActiveSection("add-category")} style={subSidebarBtnStyle(activeSection === "add-category")}>+ Add Category</button>
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto" }}>
            <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
        </div>
      </div>

      {/* 🔹 Main Content Area */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#fff" }}>
        
        {/* 🔹 CLEAN DASHBOARD VIEW */}
        {activeSection === "dashboard" && (
          <div className="dashboard-container">
            <h1>Admin Dashboard 🔐</h1>
            <p>Welcome Admin</p>
            <hr style={{ margin: "20px 0", border: "0.5px solid #eee" }} />
            {/* "Assign Category" and Dropdown have been removed from here */}
          </div>
        )}

        {/* 🔹 ADD CATEGORY FORM */}
        {activeSection === "add-category" && (
          <div className="auth-wrapper" style={{ padding: 0, minHeight: "auto" }}>
            <div className="auth-container" style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)", maxWidth: "1000px" }}>
              <div className="form-pane">
                <div className="form-header">
                  <h2>Create Category</h2>
                  <p>Add a new product category and its allowed measurement units</p>
                </div>
                {catMessage && <div className="msg-success" style={{ textAlign: "center", marginBottom: "15px" }}>✅ {catMessage}</div>}
                {catError && <div className="msg-error" style={{ textAlign: "center", marginBottom: "15px" }}>⚠️ {catError}</div>}
                <form onSubmit={submitCategory}>
                  <div className="input-group">
                    <label>Category Name</label>
                    <div className="input-wrapper">
                      <span className="icon left-icon">🏷️</span>
                      <input
                        type="text"
                        placeholder="e.g., dairy, grains"
                        value={newCategory.categoryName}
                        onChange={(e) => setNewCategory({...newCategory, categoryName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="input-group" style={{ marginTop: "15px" }}>
                    <label>Allowed Units</label>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
                      {availableUnits.map((unit) => (
                        <label key={unit} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                          <input type="checkbox" checked={newCategory.allowedUnits.includes(unit)} onChange={() => handleUnitToggle(unit)} />
                          {unit}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="submit-btn" style={{ marginTop: "20px" }}>Add Category</button>
                </form>
              </div>
              <div className="info-pane">
                <div className="info-header"><h2>Category Guidelines</h2><p>Proper organization helps manage inventory.</p></div>
                <div className="benefits-list">
                    <div className="benefit-card"><div className="benefit-title">⚖️ Units</div><p>Ensures billing accuracy.</p></div>
                    <div className="benefit-card"><div className="benefit-title">🔍 Filtering</div><p>Easier product search.</p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔹 VIEW CATEGORIES TABLE */}
        {activeSection === "view-categories" && (
            <div className="table-container">
                <h2>All Categories</h2>
                <table border="1" cellPadding="10" style={tableStyle}>
                    <thead style={{ backgroundColor: "#eee" }}>
                        <tr>
                            <th>ID</th><th>Category Name</th><th>Allowed Units</th><th>Status</th><th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoriesList.map((cat) => (
                            <tr key={cat.id}>
                                <td>{cat.id}</td>
                                <td><strong style={{textTransform: 'capitalize'}}>{cat.categoryName}</strong></td>
                                <td>{cat.allowedUnits && cat.allowedUnits.map((unit, idx) => <span key={idx} style={unitBadgeStyle}>{unit}</span>)}</td>
                                <td><span style={{ ...statusBadgeStyle, backgroundColor: cat.isActive ? "green" : "red" }}>{cat.isActive ? "Active" : "Inactive"}</span></td>
                                <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Rest of the views (Employees/Users) remain the same */}
        {activeSection === "add-employee" && (
            /* ... keep existing Add Employee logic ... */
            <div style={{padding: "20px"}}>Add Employee Section (Form code goes here)</div>
        )}
        
        {activeSection === "users" && (
             <div className="table-container">
                <h2>All Users</h2>
                <table border="1" cellPadding="10" style={tableStyle}>
                    <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Phone</th></tr></thead>
                    <tbody>{users.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td>{u.phonenumber}</td></tr>)}</tbody>
                </table>
             </div>
        )}

        {activeSection === "employees" && (
             <div className="table-container">
                <h2>All Employees</h2>
                <table border="1" cellPadding="10" style={tableStyle}>
                    <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Status</th></tr></thead>
                    <tbody>{employees.map(e => <tr key={e.id}><td>{e.id}</td><td>{e.username}</td><td>{e.email}</td><td>{e.status}</td></tr>)}</tbody>
                </table>
             </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const sidebarBtnStyle = (isActive) => ({ display: "block", marginBottom: "8px", width: "100%", padding: "10px", textAlign: "left", cursor: "pointer", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: isActive ? "#d0d0d0" : "#fff", fontWeight: isActive ? "bold" : "normal" });
const subSidebarBtnStyle = (isActive) => ({ display: "block", width: "100%", padding: "8px 10px", textAlign: "left", cursor: "pointer", border: "none", borderRadius: "4px", backgroundColor: isActive ? "#d0d0d0" : "transparent", fontWeight: isActive ? "bold" : "normal", fontSize: "14px" });
const logoutBtnStyle = { marginTop: "20px", padding: "10px", cursor: "pointer", background: "red", color: "white", border: "none", width: "100%", borderRadius: "4px" };
const tableStyle = { width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: "15px" };
const statusBadgeStyle = { color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", display: "inline-block" };
const unitBadgeStyle = { background: "#eee", padding: "2px 6px", borderRadius: "4px", fontSize: "12px", marginRight: "4px", display: "inline-block", border: "1px solid #ccc" };

export default AdminDashboard;