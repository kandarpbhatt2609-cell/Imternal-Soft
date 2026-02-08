import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../../auth/authService";
import { logout } from "../../auth/authSlice";

function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await authService.logout("user");

      if (res?.data?.success) {
        dispatch(logout());
        navigate("/user/login");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Something went wrong while logging out");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Dashboard 👤</h1>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default UserDashboard;
