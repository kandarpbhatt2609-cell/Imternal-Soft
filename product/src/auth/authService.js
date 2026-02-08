import axios from 'axios';
import conf from '../conf/conf.js';

const Adminlogin = `${conf.API_URL}/auth/api/admin/login`;
const AdminRegister = `${conf.API_URL}/auth/api/admin/register`;
const UserRegister = `${conf.API_URL}/auth/api/user/register`;

class AuthService {

  async adminLogin(data) {
    try {
      const response = await axios.post(
        Adminlogin,
        data,
        { withCredentials: true }
      );
      return response;
    } catch (error) {
      return error.response;
    }
  }

  // ✅ ADMIN REGISTER (FIXED)
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

      const res = await axios.post(
        AdminRegister, // ✅ FIXED
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      return res;
    } catch (err) {
      return err.response;
    }
  }

  // ✅ USER REGISTER (EXACT SAME LOGIC)
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

      const res = await axios.post(
        UserRegister,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      return res;
    } catch (err) {
      return err.response;
    }
  }

  async getAdminSession() {
    return axios.get(
      `${conf.API_URL}/auth/api/admin/dashboard`,
      { withCredentials: true }
    );
  }

  async employeeLogin(data) {
    return axios.post(
      `${conf.API_URL}/api/employee/login`,
      data,
      { withCredentials: true }
    );
  }

  async userLogin(data) {
    return axios.post(
      `${conf.API_URL}/auth/api/user/login`,
      data,
      { withCredentials: true }
    );
  }

  async getUserSession() {
  return axios.get(
    `${conf.API_URL}/auth/api/user/dashboard`,
    { withCredentials: true }
  );
}


  async getCurrentUser() {
    return axios.get(
      `${conf.API_URL}/api/auth/me`,
      { withCredentials: true }
    );
  }

  async logout(role) {
    const map = {
      admin: "/auth/api/admin/logout",
      employee: "/auth/api/employee/logout",
      user: "/auth/api/user/logout",
    };

    return axios.post(
      `${conf.API_URL}${map[role]}`,
      {},
      { withCredentials: true }
    );
  }
}

const authService = new AuthService();
export default authService;
