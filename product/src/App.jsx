import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "./auth/authSlice";
import authService from "./auth/authService";

// --- Main Site ---
import Home from "./homepage/Home";
import AboutPage from "./homepage/AboutPage";
import ContactPage from "./homepage/ContactPage";


// --- Admin ---
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminForgotPassword from "./pages/admin/AdminForgotPassword";

// --- Employee ---
import EmployeeLogin from "./pages/employee/EmployeeLogin";
import EmployeeDashboard from "./pages/employee/EmploeeDashboard";
import EmployeeProtectedRoute from "./routes/EmployeeProtectedRoute";
import EmployeeForgotPassword from "./pages/employee/EmployeeForgotPassword";

// --- User ---
import UserLogin from "./pages/user/UserLogin";
import UserRegister from "./pages/user/UserRegister";
import UserDashboard from "./pages/user/UserDashboard";
import UserProtectedRoute from "./routes/UserProtectedRoute"; 
import UserForgotPassword from "./pages/user/UserForgotPassword";
import UserCart from "./pages/user/UserCart";
import CategoryPage from "./pages/user/CategoryPage";
import UserOrders from "./pages/user/UserOrders";
import SearchPage from "./pages/user/SearchPage";

/* ── Auth Initializer ──────────────────────────────────────────────
   Runs once on app boot. Checks the session cookie and restores the
   Redux auth state so users stay logged in after a page refresh.
─────────────────────────────────────────────────────────────────── */
const AuthInitializer = () => {
  const dispatch = useDispatch();
  const status   = useSelector((state) => state.auth?.status);

  useEffect(() => {
    // If status is not null, we've already tried to verify the session
    if (status !== null) return;

    // Get role from localStorage to decide which endpoint to ping
    // Default to 'user' if not found
    const role = localStorage.getItem('userRole') || 'user';
    
    // Select the appropriate session verification method
    const sessionMethod = 
      role === 'admin'    ? authService.getAdminSession.bind(authService) :
      role === 'employee' ? authService.getEmployeeSession.bind(authService) :
                            authService.getUserSession.bind(authService);

    sessionMethod()
      .then((res) => {
        // Check for success in the common response format
        if (res?.data?.success) {
          // Identify user data from response (handles different response structures across roles)
          const userData = res.data.data || res.data.admin || res.data.employee || {};
          
          dispatch(loginSuccess({
            email: userData.email,
            role:  role,
            ...userData
          }));
        } else {
          // If the backend says no session, definitely logout
          localStorage.removeItem('userRole');
          dispatch(logout());
        }
      })
      .catch((err) => {
        console.error(`Session recovery failed for ${role}:`, err);
        // On network error or 401, we treat it as logged out for safety
        localStorage.removeItem('userRole');
        dispatch(logout());
      });
  }, [status, dispatch]);

  return null;
};


function App() {
  return (
    <>
      <AuthInitializer />
      <Routes>
      {/* Public Home Page */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<Navigate to="/#about-us" replace />} />
      <Route path="/contact" element={<Navigate to="/#contact-us" replace />} />
      <Route path="/category/:categoryName" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/forgot-password"
        element={<AdminForgotPassword />}
      />

      {/* Employee */}
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route 
        path="/employee/dashboard" 
        element={
          <EmployeeProtectedRoute>
            <EmployeeDashboard />
          </EmployeeProtectedRoute>
        } 
      />
      <Route
        path="/employee/forgot-password"
        element={<EmployeeForgotPassword />}
      />

      {/* User */}
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/register" element={<UserRegister />} />
      <Route
        path="/user/dashboard"
        element={
          <UserProtectedRoute>
            <UserDashboard />
          </UserProtectedRoute>
        }
      />
      <Route
        path="/user/forgot-password"
        element={<UserForgotPassword />}
      />
      <Route
        path="/user/cart"
        element={
          <UserProtectedRoute>
            <UserCart />
          </UserProtectedRoute>
        }
      />
      <Route
        path="/user/orders"
        element={
          <UserProtectedRoute>
            <UserOrders />
          </UserProtectedRoute>
        }
      />
      </Routes>
    </>
  );
}

export default App;