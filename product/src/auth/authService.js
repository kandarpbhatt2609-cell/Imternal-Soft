import api from '../api/axios'; 
class AuthService {
  // ==========================
  // 🔹 ADMIN AUTH
  // ==========================
  async adminLogin(data) {
    try {
      return await api.post("/auth/api/admin/login", data);
    } catch (error) {
      return error.response;
    }
  }
  // 👇 DEDICATED ADMIN OTP VERIFY (Guaranteed to work)
  async verifyAdminOtp(data) {
    try {
      return await api.post("/auth/api/admin/verify-otp", data);
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
      if (data.image) formData.append("profile_image", data.image);
      return await api.post("/auth/api/admin/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } catch (err) {
      return err.response;
    }
  }
  // ==========================
  // 🔹 EMPLOYEE AUTH
  // ==========================
  async employeeRegister(data) {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("phonenumber", data.phonenumber);
      formData.append("password", data.password);
      if (data.image) formData.append("profile_image", data.image);
      return await api.post("/auth/api/employee/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } catch (err) {
      return err.response;
    }
  }

  async employeeLogin(data) {
    try {
      return await api.post("/auth/api/employee/login", data);
    } catch (error) {
      return error.response;
    }
  }
  // 👇 DEDICATED EMPLOYEE OTP VERIFY
  async verifyEmployeeOtp(data) {
    try {
      return await api.post("/auth/api/employee/verify-otp", data);
    } catch (error) {
      return error.response;
    }
  }
  async getEmployeeSession() {
    return await api.get("/auth/api/employee/dashboard");
  }
  // ==========================
  // 🔹 USER AUTH
  // ==========================
  async userLogin(data) {
    try {
      return await api.post("/auth/api/user/login", data);
    } catch (error) {
      return error.response;
    }
  }
  // 👇 DEDICATED USER OTP VERIFY
  async verifyUserOtp(data) {
    try {
      return await api.post("/auth/api/user/verify-otp", data);
    } catch (error) {
      return error.response;
    }
  }
  async getUserSession() {
    return await api.get("/auth/api/user/dashboard");
  }
  async userRegister(data) {
    try {
      return await api.post("/auth/api/user/register", data);
    } catch (error) {
      return error.response;
    }
  }
  // ==========================
  // 🔹 SHARED
  // ==========================
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