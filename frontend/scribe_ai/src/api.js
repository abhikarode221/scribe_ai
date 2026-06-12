import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "")
});

export default api;
