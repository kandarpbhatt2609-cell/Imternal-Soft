import { Routes, Route } from "react-router-dom";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import EmployeeLogin from "./pages/employee/EmployeeLogin";
import UserLogin from "./pages/user/UserLogin";

function App() {
  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Employee */}
      <Route path="/employee/login" element={<EmployeeLogin />} />

      {/* User */}
      <Route path="/user/login" element={<UserLogin />} />
    </Routes>
  );
}

export default App;
