import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/authSlice"; 
import authService from "../../auth/authService"; 
import api from "../../api/axios";
import "./EmployeeDashboard.css"; // 👈 Import new styles

const EmployeeDashboard = () => {
  const { userData } = useSelector((state) => state.auth); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- State Management ---
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard' or 'my_orders'
  const [notifications, setNotifications] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({}); // { taskId: 'status' }
  
  // --- Profile State ---
  const [profile, setProfile] = useState({ username: "Employee", email: "", mobileNumber: "" });
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const avatarInputRef = useRef(null);


  const fetchAssignments = async () => {
    try {
      const res = await api.get("/auth/api/employee/assigned-orders");
      if (res.data.success) {
        const tasks = res.data.data.activeTasks || [];
        // 🔍 Debug: log fields to find correct assignment ID field name
        if (tasks.length > 0) {
          console.log('📋 Task fields from API:', Object.keys(tasks[0]));
          console.log('📋 First task data:', tasks[0]);
        }
        setNotifications(res.data.data.notifications || []);
        setActiveTasks(tasks);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const fetchEmployeeProfile = async () => {
    try {
      const res = await api.get("/auth/api/employee/profile");
      const data = res.data?.data || res.data || {};
      setProfile({
        username: data.username || "Employee",
        email: data.email || "",
        mobileNumber: data.mobile || data.mobileNumber || data.phonenumber || ""
      });
      if (data.profile_image || data.image || data.profileImage) {
        setAvatarSrc(data.profile_image || data.image || data.profileImage);
      }
    } catch (err) {
      console.warn("Could not fetch employee profile:", err);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (evt) => setAvatarSrc(evt.target.result);
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    setShowProfilePopup(false);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("profile_image", file);

      const res = await api.put("/auth/api/employee/profile/update-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success || res.status === 200 || res.status === 201) {
        setMessage("Profile photo updated! ✓");
        await fetchEmployeeProfile();
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Avatar Upload Error:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(`Failed to update image: ${msg}`);
      fetchEmployeeProfile(); // Revert preview
    } finally {
      setAvatarUploading(false);
      setTimeout(() => { setMessage(""); setError(""); }, 4000);
      if (avatarInputRef.current) avatarInputRef.current.value = null;
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchEmployeeProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout("employee");
      dispatch(logout());
      navigate("/employee/login");
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      navigate("/employee/login");
    }
  };

  const handleAcceptTask = async (assignmentId) => {
    try {
      setAcceptingId(assignmentId);
      // Backend expects 'status' to change to 'accepted'
      await api.put(`/auth/api/employee/assignment/${assignmentId}/status`, {
        status: "accepted"
      });
      // Refresh notifications & active tasks directly
      await fetchAssignments();
    } catch (error) {
      console.error("Error accepting task:", error);
      const backendError = error.response?.data?.message || error.response?.data?.error || "Unknown error";
      alert(`Failed to accept order. Backend says: ${backendError}`);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleUpdateStatus = async (assignmentId, newStatus) => {
    if (!assignmentId) {
      console.error('❌ handleUpdateStatus: assignmentId is missing!');
      alert('Error: Assignment ID is missing. Check the console.');
      return;
    }

    console.log(`🚀 Attempting to update assignment ${assignmentId} to ${newStatus}`);
    
    try {
      setUpdatingStatusId(assignmentId);
      
      // Hit the endpoint confirmed by your Postman screenshot
      const response = await api.put(`/auth/api/employee/assignment/${assignmentId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        console.log(`✅ Status updated to ${newStatus}`);
        await fetchAssignments(); // Refresh to move to next step
      } else {
        alert(`Update failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const msg = error.response?.data?.message || error.message;
      alert(`Status update failed!\n\nURL: /auth/api/employee/assignment/${assignmentId}/status\nError: ${msg}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="emp-dashboard-wrapper">
      
      {/* ── Sidebar ── */}
      <aside className="emp-sidebar">
        <div className="emp-sidebar-header">
          <div className="emp-logo-icon">🛒</div>
          <div className="emp-logo-text">
            <h2>Nest</h2>
            <span>EMP PORTAL</span>
          </div>
        </div>
        
        <nav className="emp-nav-menu">
          <button 
            className={`emp-nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <span className="emp-nav-icon">📊</span> Overview
          </button>
          
          <button 
            className={`emp-nav-btn ${activeView === 'my_orders' ? 'active' : ''}`}
            onClick={() => setActiveView('my_orders')}
          >
            <span className="emp-nav-icon">📦</span> My Orders
          </button>
        </nav>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="emp-main-content">
        
        {/* Toast Messages */}
        {message && <div className="emp-toast-msg">✉️ {message}</div>}
        {error && <div className="emp-toast-msg error">⚠️ {error}</div>}

        {/* Top Navbar */}
        <header className="emp-topbar">
          <div className="emp-topbar-left">
            <h1>{activeView === 'dashboard' ? 'Overview' : 'My Orders'}</h1>
          </div>

          <div className="emp-topbar-right">
            
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button 
                className="emp-notif-btn"
                onClick={() => setShowNotifications(!showNotifications)} 
              >
                🔔
                {notifications.length > 0 && (
                  <span className="emp-notif-badge">{notifications.length}</span>
                )}
              </button>

              {showNotifications && (
                <div className="emp-notif-dropdown">
                  <div className="emp-notif-header">
                    <h3>New Assigned Orders ({notifications.length})</h3>
                  </div>
                  
                  <div className="emp-notif-list">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif.assignmentId} className="emp-notif-item">
                          <strong>Order #{notif.orderNumber}</strong>
                          <p className="emp-notif-meta">📍 {notif.deliveryAddress}</p>
                          <p className="emp-notif-meta" style={{ color: "#059669" }}>
                            💰 ₹{notif.finalAmount}
                          </p>
                          
                          <div className="emp-notif-actions">
                            <button 
                              className="emp-accept-btn"
                              onClick={() => handleAcceptTask(notif.assignmentId)}
                              disabled={acceptingId === notif.assignmentId}
                            >
                              {acceptingId === notif.assignmentId ? "Accepting..." : "Accept Order"}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                        No pending assigned orders.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="emp-profile-wrapper">
              <input 
                type="file" 
                ref={avatarInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleAvatarUpload}
              />
              <button 
                className={`emp-avatar-btn ${avatarUploading ? 'uploading' : ''}`}
                onClick={() => setShowProfilePopup(!showProfilePopup)}
                disabled={avatarUploading}
              >
                {avatarUploading ? "..." : (
                  avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" />
                  ) : (
                    <div className="emp-avatar-placeholder">
                      {(profile.username || "E")[0].toUpperCase()}
                    </div>
                  )
                )}
              </button>

              {showProfilePopup && (
                <div className="emp-profile-popup">
                  <div className="emp-popup-header">
                    <div className="emp-popup-avatar-big">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="Avatar" />
                      ) : (
                        <span>{(profile.username || "E")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="emp-popup-info">
                      <h4>{profile.username}</h4>
                      <span className="emp-badge">Employee</span>
                    </div>
                  </div>

                  <div className="emp-popup-details">
                    <button 
                      className="emp-popup-upload-btn"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      📷 Change Photo
                    </button>

                    <div className="emp-detail-item">
                      <span className="emp-detail-icon">📧</span>
                      <div className="emp-detail-text">
                        <label>Email Address</label>
                        <p>{profile.email || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="emp-detail-item">
                      <span className="emp-detail-icon">📱</span>
                      <div className="emp-detail-text">
                        <label>Mobile Number</label>
                        <p>{profile.mobileNumber || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="emp-popup-footer">
                    <button onClick={handleLogout} className="emp-popup-logout">
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="emp-header-logout">
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Content Scroll Area */}
        <div className="emp-content-scroll">
          
          {activeView === 'dashboard' && (
            <>
              {/* Welcome Banner */}
              <div className="emp-welcome-card">
                <h2>Welcome back, {profile.username || userData?.username || 'Employee'}!</h2>
                <p>Role: {userData?.role || 'Delivery Partner'} | Status: Online</p>
              </div>

              {/* Status & Tasks Board */}
              <div className="emp-grid">
                <div className="emp-card">
                  <h3 className="emp-card-title">Pending Tasks (To Accept)</h3>
                  <ul className="emp-task-list">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <li key={notif.assignmentId}>
                          <div className="emp-task-icon">📍</div>
                          <div className="emp-task-text">
                            <h4>Order #{notif.orderNumber}</h4>
                            <p>Total: ₹{notif.finalAmount}</p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li><p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No new assignments pending.</p></li>
                    )}
                  </ul>
                </div>

                <div className="emp-card">
                  <h3 className="emp-card-title">Recent Announcements</h3>
                  <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "16px", color: "#1e3a8a", border: "1px solid #bfdbfe", fontSize: "14px", lineHeight: "1.5" }}>
                    <strong>📢 System Notice:</strong> Please remember to mark orders as delivered promptly to maintain accurate records.
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'my_orders' && (
            <div className="emp-orders-container">
              {activeTasks.length > 0 ? (
                activeTasks.map(task => {
                  // Robust ID resolution based on your screenshot (likely 'id' or 'assignmentId')
                  const taskId = task.id || task.assignmentId || task.assignment_id || task._id || task.orderId;
                  const st = (task.status || 'accepted').toLowerCase();
                  
                  // Available statuses to move to
                  const statusOptions = [
                    { value: 'packed',    label: '📦 Packing' },
                    { value: 'shipped',   label: '🚚 Shipping' },
                    { value: 'completed', label: '✅ Completed' },
                  ];

                  const isUpdating = updatingStatusId === taskId;
                  const currentSelection = selectedStatus[taskId] || '';

                  return (
                    <div key={taskId || `task-${task.orderNumber}`} style={{
                      background: '#fff', border: '1.5px solid #e5e7eb',
                      borderRadius: 16, padding: 24, marginBottom: 16,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      display: 'flex', flexDirection: 'column', gap: 16,
                    }}>
                      {/* Order Info Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: 17, color: '#111827' }}>Order #{task.orderNumber}</h3>
                          <p style={{ margin: '2px 0', fontSize: 13, color: '#6b7280' }}>📍 {task.deliveryAddress}</p>
                          <p style={{ margin: '2px 0', fontSize: 13, color: '#6b7280' }}>💵 Amount: ₹{task.finalAmount}</p>
                          <p style={{ margin: '2px 0', fontSize: 11, color: '#9ca3af' }}>Assigned: {new Date(task.assignedAt).toLocaleString()}</p>
                        </div>
                        <span className={`emp-status-badge ${st}`}>
                          {st.toUpperCase()}
                        </span>
                      </div>

                      {/* Dropdown Status Selection Container */}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#f9fafb', padding: '16px', borderRadius: 12, border: '1.5px solid #f1f5f9' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Update Status To:</label>
                          <select 
                            value={currentSelection}
                            onChange={(e) => setSelectedStatus(prev => ({ ...prev, [taskId]: e.target.value }))}
                            style={{
                              width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
                              fontSize: 14, fontWeight: 600, color: '#374151', outline: 'none', background: '#fff'
                            }}
                          >
                            <option value="">-- Select Status --</option>
                            {statusOptions.map(opt => {
                              const alreadyDone = ['packed', 'shipped', 'completed', 'delivered'].indexOf(st) >= ['packed', 'shipped', 'completed', 'delivered'].indexOf(opt.value);
                              return (
                                <option key={opt.value} value={opt.value} disabled={alreadyDone}>
                                  {alreadyDone ? `✓ ${opt.label.split(' ')[1]} Finished` : opt.label}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <button
                          onClick={() => currentSelection && handleUpdateStatus(taskId, currentSelection)}
                          disabled={isUpdating || !currentSelection}
                          style={{
                            padding: '12px 24px', borderRadius: 10, border: 'none',
                            fontWeight: 800, fontSize: 14, cursor: (currentSelection && !isUpdating) ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                            background: currentSelection ? '#3BB77E' : '#e5e7eb',
                            color: '#fff', alignSelf: 'flex-end',
                            boxShadow: currentSelection ? '0 4px 12px rgba(59, 183, 126, 0.2)' : 'none'
                          }}
                        >
                          {isUpdating ? '⏳ Updating...' : 'Update Status'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "12px", border: "1px dashed #ccc" }}>
                  <div style={{ fontSize: "50px", marginBottom: "15px" }}>📭</div>
                  <h3 style={{ margin: "0", color: "var(--text-dark)" }}>No Accepted Orders</h3>
                  <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>You do not have any active accepted orders right now.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;