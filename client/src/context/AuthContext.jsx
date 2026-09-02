import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app : si un token existe déjà, on vérifie sa validité
  // en récupérant le profil (GET /api/auth/me) plutôt que de faire confiance
  // aveuglément au contenu du localStorage.
  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.getMe();
      setUser(data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    const { token, ...userInfo } = data;
    localStorage.setItem("token", token);
    setUser(userInfo);
    return userInfo;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    const { token, ...userInfo } = data;
    localStorage.setItem("token", token);
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("latestResumeId");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
