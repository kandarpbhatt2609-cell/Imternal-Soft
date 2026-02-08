import { useEffect } from "react"; 
import { useDispatch, useSelector } from "react-redux"; 
import { Navigate } from "react-router-dom"; 
import authService from "../auth/authService"; 
import { loginSuccess, logout } from "../auth/authSlice"; 


const AdminProtectedRoute = ({ children }) => 
  { 
    const dispatch = useDispatch(); 
    const isLoggedIn = useSelector(state => state.auth.status); 
    useEffect(() => { if (!isLoggedIn) 
      { 
        authService.getAdminSession() 
        .then(res => { if (res.data?.success) 
        { 
          dispatch( loginSuccess({ 
            email: res.data.admin.email, role: "admin", }) ); 
          } 
        }) 
        .catch(() => { dispatch(logout()); 

        });
      } }, []); 
      if (!isLoggedIn) 
          return <p>Checking session...</p>; 
        return children; }; 
export default AdminProtectedRoute;