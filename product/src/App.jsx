import { Routes, Route } from "react-router-dom";


import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import AdminForgotPassword from "./pages/admin/AdminForgotPassword";

import EmployeeLogin from "./pages/employee/EmployeeLogin";

import UserLogin from "./pages/user/UserLogin";
import UserRegister from "./pages/user/UserRegister";
import UserDashboard from "./pages/user/UserDashboard";
import UserProtectedRoute from "./routes/UserProtectedRoute"; 
import UserForgotPassword from "./pages/user/UserForgotPassword";

function App() {
  return (
    <Routes>
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

</Routes>
  );
}

export default App;
