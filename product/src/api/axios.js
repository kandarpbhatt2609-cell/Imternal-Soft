import axios from "axios";

const api = axios.create({
  baseURL: "https://six-sem-project.onrender.com", 
  withCredentials: true,
});
// Add an Interceptor to automatically attach the token from LocalStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("my_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;