import { useEffect, useState } from "react"; 
import { useDispatch, useSelector } from "react-redux"; 
import { Navigate } from "react-router-dom"; 
import authService from "../auth/authService"; 
import { loginSuccess, logout } from "../auth/authSlice"; 

const AdminProtectedRoute = ({ children }) => { 
    const dispatch = useDispatch(); 
    const isLoggedIn = useSelector(state => state.auth.status); 
    const [loading, setLoading] = useState(true); // 👈 Track the check process

    useEffect(() => { 
        const checkSession = async () => {
            if (!isLoggedIn) { 
                try {
                    const res = await authService.getAdminSession(); 
                    if (res.data?.success) { 
                        dispatch(loginSuccess({ 
                            email: res.data.admin.email, 
                            role: "admin", 
                        })); 
                    } else {
                        dispatch(logout());
                    }
                } catch (error) {
                    dispatch(logout());
                } finally {
                    setLoading(false); // 👈 Check is done
                }
            } else {
                setLoading(false);
            }
        };
        
        checkSession();
    }, [isLoggedIn, dispatch]); 

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                <p>Checking session... Please wait.</p>
            </div>
        );
    }

    // If loading is finished and still not logged in, redirect to login
    if (!isLoggedIn) {
        return <Navigate to="/admin/login" replace />;
    }

    return children; 
}; 

export default AdminProtectedRoute;