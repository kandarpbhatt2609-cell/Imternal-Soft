import { useState, useEffect, useRef } from "react";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import authService from "../../auth/authService";
import { logout } from "../../auth/authSlice";
import conf from "../../conf/conf";

// 🔹 New CSS for Design Update
import "./admindashboard.css"; 

// 🔹 Imported category services
import { getCategories, addCategory, updateCategory, deleteCategory } from "../../admincatagory/categoryService";
import CategoryProducts from "./CategoryProducts";
import AddProduct from "./AddProduct";
import UpdateProduct from "./UpdateProduct";
import AddBatch from "./AddBatch";
import ViewBatchDetails from "./ViewBatchDetails";
import AdminOrders from "./AdminOrders";
import AdminReturns from "./AdminReturns";

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Navigation State
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [categoryViewMode, setCategoryViewMode] = useState("grid"); // "grid" or "list"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingBatchProduct, setAddingBatchProduct] = useState(null);
  const [viewingBatchProduct, setViewingBatchProduct] = useState(null);

  // Data States
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // Form States
  const [newCategory, setNewCategory] = useState({ categoryName: "", allowedUnits: [] });
  const [editCategory, setEditCategory] = useState({ id: null, categoryName: "", allowedUnits: [] });
  const [employeeData, setEmployeeData] = useState({ username: "", email: "", phonenumber: "", password: "" });

  // Feedback States
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const availableUnits = ["kg", "gm", "l", "ml", "packet", "piece"];
  
  // Pastel backgrounds for category cards
  const pastelColors = ["#f2fce4", "#fffceb", "#ecffec", "#feefea", "#fff3eb", "#fff3ff", "#f2fce4"];

  // --- ADMIN AVATAR STATE ---
  const [adminProfile, setAdminProfile] = useState({ 
    username: "Admin", 
    email: "", 
    mobileNumber: "", 
    profileImage: null 
  });
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const avatarWrapperRef = useRef(null);


  // --- API FETCHING ---

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/auth/api/admin/users/all`);
      setUsers(res.data.data || []);
    } catch (err) { console.error("User Fetch Error", err); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get(`/auth/api/admin/employees/all`);
      setEmployees(res.data.data || []);
    } catch (err) { console.error("Employee Fetch Error", err); }
  };

  const fetchAllCategories = async () => {
    try {
      const data = await getCategories();
      setCategoriesList(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Category Fetch Error", err); 
      setCategoriesList([]);
    }
  };

  useEffect(() => {
    fetchAllCategories();
    if (activeSection === "users") fetchUsers();
    if (activeSection === "employees") fetchEmployees();
  }, [activeSection]);

  // --- FETCH ADMIN PROFILE & AVATAR ---
  const fetchMyProfile = async () => {
    try {
      const res = await api.get("/auth/api/admin/profile");
      const data = res.data?.data || res.data || {};
      
      setAdminProfile({
        username: data.username || "Admin",
        email: data.email || "",
        mobileNumber: data.mobileNumber || data.mobile || data.phonenumber || "",
        profileImage: data.profile_image || data.image || data.profileImage || null
      });

      if (data.profile_image || data.image || data.profileImage) {
        setAvatarSrc(data.profile_image || data.image || data.profileImage);
      }
    } catch (err) {
      console.warn("Could not fetch admin profile from API:", err);
      // Fallback: try session if profile fails
      try {
        const res = await authService.getAdminSession();
        const data = res?.data?.data || res?.data?.admin || res?.data || {};
        setAdminProfile(prev => ({ ...prev, username: data.username || "Admin" }));
      } catch (sErr) {
        console.error("Session fetch error:", sErr);
      }
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  // Close avatar popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarWrapperRef.current && !avatarWrapperRef.current.contains(e.target)) {
        setShowAvatarPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---

  const handleLogout = async () => {
    try {
      const res = await authService.logout("admin");
      if (res?.data?.success) {
        dispatch(logout());
        navigate("/admin/login");
      }
    } catch (error) { console.error("Logout Error:", error); }
  };

  // Upload avatar image to server
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: local preview for instant feedback
    const previewReader = new FileReader();
    previewReader.onload = (event) => setAvatarSrc(event.target.result);
    previewReader.readAsDataURL(file);

    setAvatarUploading(true);
    setShowAvatarPopup(false);

    try {
      const formData = new FormData();
      // 🔹 IMPORTANT: The backend expects 'profile_image' as the field name
      formData.append("profile_image", file);

      // Changed from POST to PUT to match the project's consistent update pattern
      const res = await api.put("/auth/api/admin/profile/update-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        setMessage("Profile photo updated! ✓");
        await fetchMyProfile(); // Refresh data to get permanent URL
      } else {
        const errorMsg = res.data?.message || res.data?.error || "Upload failed";
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Avatar Upload Error:", err);
      const backendMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(`Failed to update image: ${backendMsg}`);
      // Revert preview on failure
      fetchMyProfile();
    } finally {
      setAvatarUploading(false);
      setTimeout(() => { setMessage(""); setError(""); }, 3000);
      if (avatarInputRef.current) avatarInputRef.current.value = null;
    }
  };

  // Helper: get initials from name
  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };


  const submitCategory = async (e) => {
    e.preventDefault();
    try {
      await addCategory(newCategory);
      setMessage("Category added successfully!");
      setNewCategory({ categoryName: "", allowedUnits: [] });
      fetchAllCategories();
      setTimeout(() => setMessage(""), 3000);
      setActiveSection("view-categories");
      setCategoryViewMode("grid");
    } catch (err) { setError("Failed to add category."); }
  };

  const startEditing = (category) => {
    setEditCategory({
      id: category.id,
      categoryName: category.categoryName,
      allowedUnits: category.allowedUnits || []
    });
    setActiveSection("edit-category");
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(editCategory.id, {
        categoryName: editCategory.categoryName,
        allowedUnits: editCategory.allowedUnits
      });
      setMessage("Category updated!");
      fetchAllCategories();
      setActiveSection("update-categories");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { setError("Update failed."); }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        setMessage("Category deleted successfully!");
        fetchAllCategories();
        setTimeout(() => setMessage(""), 3000);
      } catch (err) { 
        const errMsg = err.response?.data?.message || err.response?.data?.error || "Failed to delete category.";
        setError(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg)); 
        setTimeout(() => setError(""), 5000);
      }
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.employeeRegister(employeeData);
      if (res?.data?.success || res?.status === 200 || res?.status === 201) {
        setMessage("Employee registered!");
        setEmployeeData({ username: "", email: "", phonenumber: "", password: "" });
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorMsg = res?.data?.message || res?.data?.error || "Employee registration failed.";
        setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) { 
        setError("Employee registration failed."); 
        setTimeout(() => setError(""), 5000);
    }
  };

  // 🔹 Shared Components
  const StatusToggle = ({ initialStatus = true }) => {
    const [isActive, setIsActive] = useState(initialStatus);
    return (
      <button 
        onClick={() => setIsActive(!isActive)} 
        style={{ 
          background: isActive ? "#d1e7dd" : "#f8d7da", 
          color: isActive ? "#0f5132" : "#842029", 
          padding: "5px 12px", 
          borderRadius: "20px", 
          fontSize: "12px", 
          fontWeight: "bold", 
          border: "none", 
          cursor: "pointer", 
          transition: "0.2s" 
        }}
      >
        {isActive ? "Active" : "Inactive"}
      </button>
    );
  };

  return (
    <div className="admin-layout">
      
      {/* 🔹 SIDEBAR MATCHED TO IMAGE */}
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        
        <button onClick={() => setActiveSection("dashboard")} className={`sidebar-btn ${activeSection === "dashboard" ? "active" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Dashboard
        </button>
        
        <button onClick={() => setActiveSection("users")} className={`sidebar-btn ${activeSection === "users" ? "active" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Users
        </button>
        
        <button onClick={() => setActiveSection("employees")} className={`sidebar-btn ${activeSection === "employees" ? "active" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Employee
        </button>
        
        <button onClick={() => setActiveSection("add-employee")} className={`sidebar-btn ${activeSection === "add-employee" ? "active" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>
          Add Employee
        </button>

        <button onClick={() => setActiveSection("orders")} className={`sidebar-btn ${activeSection === "orders" ? "active" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          View Orders
        </button>
        
        <button onClick={() => setActiveSection("returns")} className={`sidebar-btn ${activeSection === "returns" ? "active" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 15h2m-2-4h2m-2-4h2m-9 13h10a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          View Returns
        </button>

        <div className="dropdown-container">
          <button onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)} className="sidebar-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            Categories <span style={{ marginLeft: "auto", fontSize: "12px" }}>{isCategoryMenuOpen ? "▲" : "▼"}</span>
          </button>
          
          {isCategoryMenuOpen && (
            <div className="dropdown-menu">
              {categoriesList.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.categoryName);
                    setActiveSection("category-products");
                  }}
                  className={`sub-sidebar-btn ${activeSection === "category-products" && selectedCategory === cat.categoryName ? "active" : ""}`}
                >
                  {cat.categoryName}
                </button>
              ))}
              <button onClick={() => { setActiveSection("view-categories"); setCategoryViewMode("list"); }} className={`sub-sidebar-btn ${activeSection === "update-categories" ? "active" : ""}`}>Update</button>
              <button onClick={() => setActiveSection("add-category")} className={`sub-sidebar-btn ${activeSection === "add-category" ? "active" : ""}`}>+ Add Category</button>
              <button onClick={() => setActiveSection("add-product")} className={`sub-sidebar-btn ${activeSection === "add-product" ? "active" : ""}`}>+ Add Product</button>
            </div>
          )}
        </div>
      </aside>

      {/* 🔹 MAIN CONTENT SECTION */}
      <main className="main-content">
        
        {/* HEADER */}
        <header className="top-header">
           <h1>Admin Dashboard</h1>
           <div className="header-right">

             {/* Hidden file input for avatar upload */}
             <input
               ref={avatarInputRef}
               type="file"
               accept="image/*"
               style={{ display: "none" }}
               onChange={handleAvatarUpload}
             />

             {/* Admin Avatar Button */}
             <div className="admin-avatar-wrapper" ref={avatarWrapperRef}>
               <button
                 className="admin-avatar-btn"
                 onClick={() => setShowAvatarPopup(v => !v)}
                 title="Admin Profile"
               >
                 {avatarSrc ? (
                   <img src={avatarSrc} alt="Admin" />
                 ) : (
                   <span className="avatar-initials">{getInitials(adminProfile.username)}</span>
                 )}
               </button>

               {showAvatarPopup && (
                 <div className="avatar-popup">
                   <div className="avatar-popup-header">
                     {avatarSrc ? (
                       <img src={avatarSrc} alt="Admin" className="popup-avatar" />
                     ) : (
                       <div className="popup-initials">{getInitials(adminProfile.username)}</div>
                     )}
                     <div className="popup-user-info">
                       <span className="avatar-popup-name">{adminProfile.username}</span>
                       <span className="avatar-popup-role">Administrator</span>
                     </div>
                   </div>
                   
                   <div className="avatar-popup-details">
                     <div className="popup-detail-item">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                       <span>{adminProfile.email || "No email provided"}</span>
                     </div>
                     <div className="popup-detail-item">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                       <span>{adminProfile.mobileNumber || "No mobile number"}</span>
                     </div>
                   </div>

                   <button
                     className={`avatar-upload-btn ${avatarUploading ? "avatar-uploading" : ""}`}
                     disabled={avatarUploading}
                     onClick={() => avatarInputRef.current?.click()}
                   >
                     {avatarUploading ? (
                       <>⏳ Uploading...</>
                     ) : (
                       <>📷 Change Photo</>
                     )}
                   </button>
                 </div>
               )}
             </div>

             {/* Logout Button */}
             <button onClick={handleLogout} className="logout-btn">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
               Logout
             </button>
           </div>
        </header>


        <div className="content-body">
            {message && <div className="toast-msg">✉️ {message}</div>}
            {error && <div className="toast-msg" style={{ borderLeftColor: "#dc3545", color: "#dc3545" }}>⚠️ {error}</div>}

            {activeSection === "dashboard" && (
                <div style={{ animation: "fadeIn 0.5s ease" }}>
                    <h1 style={{fontSize: '28px', color: '#253D4E', marginBottom: "10px"}}>Dashboard Overview</h1>
                    <p style={{color: '#7E7E7E'}}>Manage your grocery B2B system from here.</p>
                </div>
            )}

            {/* USERS TABLE */}
            {activeSection === "users" && (
                <div className="section-card">
                    <h2 style={{marginBottom: '20px', color: '#253D4E'}}>Registered Users</h2>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u.id}>
                                    <td style={{fontWeight: 'bold'}}>#{u.id || i+100}</td>
                                    <td style={{color: '#51A37E', fontWeight: '600'}}>{u.username}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phonenumber || 'N/A'}</td>
                                    <td><StatusToggle /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* EMPLOYEES TABLE */}
            {activeSection === "employees" && (
                <div className="section-card">
                    <h2 style={{marginBottom: '20px', color: '#253D4E'}}>Employee Roster</h2>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Employee Name</th>
                                <th>Email Contact</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((e, i) => (
                                <tr key={e.id}>
                                    <td style={{fontWeight: 'bold'}}>#EMP{e.id || i+1}</td>
                                    <td style={{color: '#51A37E', fontWeight: '600'}}>{e.username}</td>
                                    <td>{e.email}</td>
                                    <td><StatusToggle /></td>
                                    <td>
                                        <button className="action-btn">Details ▾</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* CATEGORIES GRID/LIST */}
            {activeSection === "view-categories" && (
                <div className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h2 style={{ color: '#253D4E', margin: 0 }}>Product Categories</h2>
                    </div>

                    {categoryViewMode === "grid" ? (
                        <div className="grid-container">
                            {categoriesList.map((cat, idx) => (
                                <div 
                                    key={cat.id} 
                                    onClick={() => { setSelectedCategory(cat.categoryName); setActiveSection("category-products"); }}
                                    className="category-card"
                                    style={{backgroundColor: pastelColors[idx % pastelColors.length]}}
                                >
                                    <div className="category-icon">🛍️</div>
                                    <h4>{cat.categoryName}</h4>
                                    <p>{cat.allowedUnits?.length || 0} Units</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Category Name</th>
                                    <th>Allowed Units</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoriesList.map(cat => (
                                    <tr key={cat.id}>
                                        <td>#{cat.id}</td>
                                        <td style={{textTransform: 'capitalize', fontWeight: 'bold', color: '#253D4E'}}>{cat.categoryName}</td>
                                        <td>{cat.allowedUnits?.join(", ")}</td>
                                        <td>
                                            <button onClick={() => startEditing(cat)} className="edit-btn">Update</button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="delete-btn">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ADD EMPLOYEE - Dual Pane Layout */}
            {activeSection === "add-employee" && (
                <div className="dual-pane-section">
                    <div className="dual-pane-card">
                        <div className="form-side">
                            <h2 style={{ fontSize: '32px', color: '#253D4E', marginBottom: '10px' }}>Create Account</h2>
                            <p style={{ color: '#7E7E7E', marginBottom: '30px' }}>Enter employee details below to create an admin account.</p>
                            
                            <form onSubmit={handleAddEmployee}>
                                <div className="input-group">
                                    <label>Username</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">👤</span>
                                        <input className="form-input-styled" type="text" placeholder="Enter your username" value={employeeData.username} onChange={e => setEmployeeData({...employeeData, username: e.target.value})} required />
                                    </div>
                                </div>
                                
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">✉️</span>
                                        <input className="form-input-styled" type="email" placeholder="Enter your email" value={employeeData.email} onChange={e => setEmployeeData({...employeeData, email: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">📞</span>
                                        <input className="form-input-styled" type="text" placeholder="Enter your phone number" value={employeeData.phonenumber} onChange={e => setEmployeeData({...employeeData, phonenumber: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Password</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">🔒</span>
                                        <input className="form-input-styled" type="password" placeholder="Enter your password" value={employeeData.password} onChange={e => setEmployeeData({...employeeData, password: e.target.value})} required />
                                    </div>
                                </div>

                                <button type="submit" className="logout-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '15px' }}>
                                    Sign Up
                                </button>
                            </form>
                        </div>

                        <div className="info-side">
                            <h3>Join Our Team!</h3>
                            <div className="benefit-card">
                                <div className="benefit-title">
                                    <span className="benefit-icon">🛠️</span> Work Efficiency
                                </div>
                                <p>Access dedicated tools to manage product catalogs and user requests efficiently.</p>
                            </div>
                            
                            <div className="benefit-card">
                                <div className="benefit-title">
                                    <span className="benefit-icon">🛡️</span> Secure Access
                                </div>
                                <p>Your high-security administrative account ensures safe and protected data management.</p>
                            </div>

                            <div className="benefit-card">
                                <div className="benefit-title">
                                    <span className="benefit-icon">🤝</span> Team Synergy
                                    </div>
                                <p>Collaborate with other team members to optimize and improve the B2B supply chain.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD CATEGORY - Dual Pane Layout */}
            {activeSection === "add-category" && (
                <div className="dual-pane-section">
                    <div className="dual-pane-card">
                        <div className="form-side">
                            <h2 style={{ fontSize: '32px', color: '#253D4E', marginBottom: '10px' }}>Add Category</h2>
                            <p style={{ color: '#7E7E7E', marginBottom: '30px' }}>Create a new product category for your B2B catalog.</p>
                            
                            <form onSubmit={submitCategory}>
                                <div className="input-group">
                                    <label>Category Name</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">🛍️</span>
                                        <input className="form-input-styled" type="text" placeholder="e.g. Fresh Vegetables" value={newCategory.categoryName} onChange={(e) => setNewCategory({...newCategory, categoryName: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Allowed Units</label>
                                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "5px" }}>
                                        {availableUnits.map(unit => (
                                            <label key={unit} style={{ fontSize: "14px", cursor: "pointer", display: 'flex', alignItems: 'center', gap: '5px', background: '#f8f9fa', padding: '5px 12px', borderRadius: '20px', border: '1px solid #eee' }}>
                                                <input type="checkbox" checked={newCategory.allowedUnits.includes(unit)} onChange={(e) => setNewCategory(prev => ({ ...prev, allowedUnits: e.target.checked ? [...prev.allowedUnits, unit] : prev.allowedUnits.filter(u => u !== unit) }))} /> {unit}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="logout-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '15px' }}>
                                    Add Category
                                </button>
                            </form>
                        </div>

                        <div className="info-side">
                            <h3>Category Management</h3>
                            <div className="benefit-card">
                                <div className="benefit-title">
                                    <span className="benefit-icon">📊</span> Standardized Catalog
                                </div>
                                <p>Defining categories helps vendors organize products efficiently.</p>
                            </div>
                            
                            <div className="benefit-card">
                                <div className="benefit-title">
                                    <span className="benefit-icon">⚖️</span> Unit Control
                                </div>
                                <p>Select appropriate measuring units for consistent order fulfillment.</p>
                            </div>

                            <div className="benefit-card">
                                <div className="benefit-title">
                                    <span className="benefit-icon">🔍</span> Easy Discovery
                                </div>
                                <p>Well-categorized items are easier for customers to find and purchase.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT CATEGORY - Dual Pane Layout */}
            {activeSection === "edit-category" && (
                <div className="dual-pane-section">
                    <div className="dual-pane-card">
                        <div className="form-side">
                            <h2 style={{ fontSize: '32px', color: '#253D4E', marginBottom: '10px' }}>Update Category</h2>
                            <p style={{ color: '#7E7E7E', marginBottom: '30px' }}>Update existing product category details.</p>
                            
                            <form onSubmit={submitUpdate}>
                                <div className="input-group">
                                    <label>Category Name</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">🛍️</span>
                                        <input className="form-input-styled" type="text" placeholder="e.g. Fresh Vegetables" value={editCategory.categoryName} onChange={(e) => setEditCategory({...editCategory, categoryName: e.target.value})} required />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Allowed Units</label>
                                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "5px" }}>
                                        {availableUnits.map(unit => (
                                            <label key={unit} style={{ fontSize: "14px", cursor: "pointer", display: 'flex', alignItems: 'center', gap: '5px', background: '#f8f9fa', padding: '5px 12px', borderRadius: '20px', border: '1px solid #eee' }}>
                                                <input type="checkbox" checked={editCategory.allowedUnits.includes(unit)} onChange={(e) => setEditCategory(prev => ({ ...prev, allowedUnits: e.target.checked ? [...prev.allowedUnits, unit] : prev.allowedUnits.filter(u => u !== unit) }))} /> {unit}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="logout-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '15px' }}>
                                    Save Changes
                                </button>
                                <button type="button" onClick={() => { setActiveSection("view-categories"); setCategoryViewMode("list"); }} className="logout-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '15px', background: '#f8f9fa', color: '#4F5D77', border: '1px solid #ddd' }}>
                                    Cancel
                                </button>
                            </form>
                        </div>

                        <div className="info-side">
                            <h3>Update Category</h3>
                            <div className="benefit-card">
                                <div className="benefit-title">
                                    <span className="benefit-icon">🛠️</span> Maintain Integrity
                                </div>
                                <p>Ensure product schemas remain accurate by keeping category names up to date.</p>
                            </div>
                            
                            <div className="benefit-card">
                                <div className="benefit-title">
                                    <span className="benefit-icon">⚖️</span> Adapt Units
                                </div>
                                <p>Add or remove allowed units to adapt to new packaging options.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ORDERS SECTION */}
            {activeSection === "orders" && (
                <AdminOrders />
            )}

            {/* RETURNS SECTION */}
            {activeSection === "returns" && (
                <AdminReturns />
            )}

            {/* Update existing components integration */}
            {activeSection === "category-products" && selectedCategory && (
                <CategoryProducts 
                    categoryName={selectedCategory} 
                    onBack={() => setActiveSection("dashboard")} 
                    onEditProduct={(prod) => { setEditingProduct(prod); setActiveSection("update-product"); }}
                    onAddBatch={(prod) => { setAddingBatchProduct(prod); setActiveSection("add-batch"); }}
                    onViewBatches={(prod) => { setViewingBatchProduct(prod); setActiveSection("view-batch-details"); }}
                />
            )}

            {activeSection === "add-product" && (
                <AddProduct 
                    categoriesList={categoriesList} 
                    onBack={() => setActiveSection("dashboard")} 
                />
            )}

            {activeSection === "update-product" && (
                <UpdateProduct 
                    categoriesList={categoriesList} 
                    product={editingProduct}
                    onBack={() => setActiveSection("category-products")} 
                />
            )}

            {activeSection === "add-batch" && addingBatchProduct && (
                <AddBatch 
                    product={addingBatchProduct} 
                    onBack={() => setActiveSection("category-products")} 
                />
            )}

            {activeSection === "view-batch-details" && viewingBatchProduct && (
                <ViewBatchDetails 
                    product={viewingBatchProduct} 
                    onBack={() => setActiveSection("category-products")} 
                />
            )}

        </div>
      </main>

      {/* Internal CSS for simple section styles that weren't moved yet */}
      <style>{`
        .section-card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .modern-table { width: 100%; border-collapse: collapse; }
        .modern-table th { text-align: left; padding: 15px; border-bottom: 2px solid #eee; color: var(--text-muted); font-size: 14px; }
        .modern-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 15px; color: var(--text-dark); }
        .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
        .category-card { padding: 30px; border-radius: 15px; text-align: center; cursor: pointer; transition: 0.3s; }
        .category-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        .category-icon { font-size: 40px; margin-bottom: 10px; }
        .form-section { display: flex; justify-content: center; }
        .form-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); width: 100%; max-width: 500px; }
        .form-input { width: 100%; padding: 15px; margin-bottom: 15px; border: 1px solid #eee; border-radius: 10px; outline: none; }
        .submit-btn { width: 100%; padding: 15px; border: none; border-radius: 10px; color: white; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .submit-btn:hover { transform: scale(1.02); }
        .edit-btn { background: #d1e7dd; color: #0f5132; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; margin-right: 10px; }
        .delete-btn { background: #f8d7da; color: #842029; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }
        .action-btn { background: #f8f9fa; border: 1px solid #eee; padding: 5px 12px; border-radius: 8px; cursor: pointer; }
      `}</style>
    </div>
  );
}

export default AdminDashboard;