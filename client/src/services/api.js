import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Don't auto-redirect on 401 — guest token handles auth silently
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
