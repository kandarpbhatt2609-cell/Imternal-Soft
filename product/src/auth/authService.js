import api from '../api/axios'; // 👈 Use your centralized instance
import conf from '../conf/conf.js';

class AuthService {
  // 🔹 ADMIN AUTH
 async adminLogin(data) {
    try {
      const response = await api.post("/auth/api/admin/login", data);
      
      // 👇 ADD THIS: If login is successful and a token is returned, save it!
      if (response.data?.success && response.data.token) {
        localStorage.setItem("my_admin_token", response.data.token);
      }
      
      return response;
    } catch (error) {
      return error.response;
    }
  }

  async getAdminSession() {
    try {
      return await api.get("/auth/api/admin/dashboard");
    } catch (error) {
      throw error;
    }
  }

  async adminRegister(data) {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("phonenumber", data.phonenumber);
      formData.append("password", data.password);

      if (data.image) {
        formData.append("profile_image", data.image);
      }

      return await api.post("/auth/api/admin/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } catch (err) {
      return err.response;
    }
  }

  // 🔹 EMPLOYEE AUTH
  async employeeLogin(data) {
    try {
      return await api.post("/auth/api/employee/login", data);
    } catch (error) {
      return error.response;
    }
  }

  async getEmployeeSession() {
    return await api.get("/auth/api/employee/dashboard");
  }

  async employeeRegister(data) {
    try {
      return await api.post("/auth/api/employee/register", data);
    } catch (err) {
      return err.response;
    }
  }

  // 🔹 USER AUTH
  async userLogin(data) {
    try {
      return await api.post("/auth/api/user/login", data);
    } catch (error) {
      return error.response;
    }
  }

  async getUserSession() {
    return await api.get("/auth/api/user/dashboard");
  }

  async userRegister(data) {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("phonenumber", data.phonenumber);
      formData.append("password", data.password);

      if (data.image) {
        formData.append("profile_image", data.image);
      }

      return await api.post("/auth/api/user/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } catch (err) {
      return err.response;
    }
  }

  // 🔹 OTP & SHARED
  async verifyOtp(data) {
    try {
      return await api.post("/auth/api/user/verify-otp", data);
    } catch (error) {
      return error.response;
    }
  }

  async getCurrentUser() {
    return await api.get("/api/auth/me");
  }

  async logout(role) {
    const map = {
      admin: "/auth/api/admin/logout",
      employee: "/auth/api/employee/logout",
      user: "/auth/api/user/logout",
    };

    try {
      return await api.post(map[role], {});
    } catch (error) {
      return error.response;
    }
  }
}

const authService = new AuthService();
export default authService;