import { useEffect, useState } from "react"; 
import { useDispatch, useSelector } from "react-redux"; 
import { Navigate } from "react-router-dom"; 
import authService from "../auth/authService"; 
import { loginSuccess, logout } from "../auth/authSlice"; 

const EmployeeProtectedRoute = ({ children }) => { 
  const dispatch = useDispatch(); 
  const isLoggedIn = useSelector(state => state.auth.status); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👈 Fix: If Redux already knows we are logged in, don't ping the backend again
    if (isLoggedIn === true) {
      setLoading(false);
      return;
    }

    if (isLoggedIn === false) {
      setLoading(false);
      return;
    }

    // If status is null (meaning page was refreshed), check the cookie session
    let mounted = true;
    authService.getEmployeeSession()
      .then(res => {
        if (!mounted) return;
        if (res?.data?.success) {
          dispatch(loginSuccess({
            email: res.data.data?.email,
            role: "employee",
          }));
        } else {
          dispatch(logout());
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Session check failed:", err);
        if (mounted) {
          dispatch(logout());
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [isLoggedIn, dispatch]); // 👈 Added isLoggedIn to dependencies

  if (loading) return <p>Verifying Employee Session...</p>; 

  if (!isLoggedIn) return <Navigate to="/employee/login" replace />;

  return children; 
}; 

export default EmployeeProtectedRoute;