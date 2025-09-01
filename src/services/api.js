import axios from "axios";

function joinApiBase(root) {
  if (!root) return "";
  const trimmed = root.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : trimmed + "/api";
}

const RAW = process.env.REACT_APP_API_URL || "";
const API_BASE = joinApiBase(RAW);

export const api = axios.create({ baseURL: API_BASE });

// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 handler (optional) — but never swallow errors.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      console.error("API ERROR:", err.response.status, err.response.data);
    } else if (err.request) {
      console.error("API NO RESPONSE (likely CORS/preflight/cert):", err.message);
    } else {
      console.error("API SETUP ERROR:", err.message);
    }
    return Promise.reject(err); // <-- do NOT swallow
  }
);




