import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const { status, userData } = useSelector(state => state.auth);

  if (!status) return <Navigate to="/login" />;
  if (role && userData.role !== role) return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;
