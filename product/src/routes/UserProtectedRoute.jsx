import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import authService from "../auth/authService";
import { loginSuccess, logout } from "../auth/authSlice";

const UserProtectedRoute = ({ children }) => {
  const { status } = useSelector((state) => state.auth);

  // STATE 1: Still checking the cookie in AuthInitializer (Don't redirect yet!)
  if (status === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #3BB77E', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3 style={{ color: '#253d4e', fontWeight: '700' }}>Verifying Session...</h3>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // STATE 2: Checked and confirmed user is NOT logged in
  if (status === false) {
    // Save current path for redirect after login
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/user/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  // STATE 3: Everything is correct
  return children;
};


export default UserProtectedRoute;