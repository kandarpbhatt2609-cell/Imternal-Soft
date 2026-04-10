import { useEffect, useState } from "react"; 
import { useDispatch, useSelector } from "react-redux"; 
import { Navigate } from "react-router-dom"; 
import authService from "../auth/authService"; 
import { loginSuccess, logout } from "../auth/authSlice"; 

const EmployeeProtectedRoute = ({ children }) => { 
  const status = useSelector(state => state.auth.status); 

  // STATE 1: Still checking session in App.jsx
  if (status === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #3BB77E', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3 style={{ color: '#253d4e', fontWeight: '700' }}>Verifying Employee Session...</h3>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // STATE 2: Not logged in
  if (status === false) {
    return <Navigate to="/employee/login" replace />;
  }

  return children; 
}; 

export default EmployeeProtectedRoute;