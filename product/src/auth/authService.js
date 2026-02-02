import axios from 'axios';
import conf from '../conf/conf.js';

const Adminlogin = `${conf.API_URL}/admin/login` 

class AuthService {

  async adminLogin(data) {
    const response = await axios.post(
      Adminlogin,
      data,
      { withCredentials: true }
    );
    return response
  }

  async employeeLogin(data) {
    return axios.post(
      `${conf.API_URL}/employee/login`,
      data,
      { withCredentials: true }
    );
  }

  async userLogin(data) {
    return axios.post(
      `${conf.API_URL}/user/login`,
      data,
      { withCredentials: true }
    );
  }

  async getCurrentUser() {
    return axios.get(
      `${conf.API_URL}/auth/me`,
      { withCredentials: true }
    );
  }

  async logout(role) {
    const map = {
      admin: "/admin/logout",
      employee: "/employee/logout",
      user: "/user/logout"
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
