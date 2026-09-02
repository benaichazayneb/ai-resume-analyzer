import axios from "axios";

/**
 * Instance Axios centralisée. Toutes les requêtes vers le backend
 * doivent passer par ici plutôt que d'appeler axios directement,
 * pour bénéficier de la baseURL et de l'injection automatique du
 * token JWT stocké après login (Phase 4 côté backend).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
