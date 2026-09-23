
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      setUser(response.data);
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
    const response = await authService.login(credentials);
    const userInfo = response.data;

    localStorage.setItem("token", userInfo.token);

    const { token, ...userWithoutToken } = userInfo;
    setUser(userWithoutToken);

    return userWithoutToken;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    const userInfo = response.data;

    localStorage.setItem("token", userInfo.token);

    const { token, ...userWithoutToken } = userInfo;
    setUser(userWithoutToken);

    return userWithoutToken;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("latestResumeId");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}