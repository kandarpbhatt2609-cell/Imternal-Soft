import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import authService from "../auth/authService";
import { loginSuccess, logout } from "../auth/authSlice";

const UserProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { status, userData } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only fetch session if status is null (happens on refresh)
    if (status === null) {
      authService.getUserSession()
        .then((res) => {
          if (res.data?.success) {
            dispatch(loginSuccess({
              email: res.data.data.email,
              role: "user",
            }));
          } else {
            dispatch(logout()); // Set status to false
          }
        })
        .catch(() => {
          dispatch(logout()); // Set status to false
        });
    }
  }, [status, dispatch]);

  // STATE 1: Still checking the cookie (Don't redirect yet!)
  if (status === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <h3>Verifying Session...</h3>
      </div>
    );
  }

  // STATE 2: Checked and confirmed user is NOT logged in
  // if (status === false) {
  //   return <Navigate to="/user/login" replace />;
  // }

  // STATE 3: Logged in but wrong role
  // if (userData?.role !== "user") {
  //   return <Navigate to="/user/login" replace />;
  // }

  // STATE 4: Everything is correct
  return children;
};

export default UserProtectedRoute;