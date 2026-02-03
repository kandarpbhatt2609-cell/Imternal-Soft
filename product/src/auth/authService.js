import axios from 'axios';
import conf from '../conf/conf.js';

const Adminlogin = `${conf.API_URL}/auth/api/admin/login`;

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
    console.error("Login Error:", error);
    return error.response;
  }
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
      `${conf.API_URL}/api/user/login`,
      data,
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
      admin: "/api/admin/logout",
      employee: "/api/employee/logout",
      user: "/api/user/logout"
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
