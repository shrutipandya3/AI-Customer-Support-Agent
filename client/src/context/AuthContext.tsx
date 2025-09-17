import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../config/api";

type AuthContextType = {
  isAuthenticated: boolean;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Variables to handle refresh token logic
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("accessToken")
  );
  const [loading, setLoading] = useState(true);


  const refreshToken = async (): Promise<string | null> => {
    try {
      console.log("Attempting to refresh token...");
      const response = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );
      
      const newAccessToken = response.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      setAccessToken(newAccessToken);
      setIsAuthenticated(true);
      
      console.log("Token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear everything and user will be logged out
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      
      if (storedToken) {
        // You could test the token validity here by making a request
        // For now, we'll assume it's valid and let the interceptor handle expiry
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("accessToken", res.data.accessToken);
      setAccessToken(res.data.accessToken);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      const res = await api.post("/auth/register", data, {
        withCredentials: true,
      });
      localStorage.setItem("accessToken", res.data.accessToken);
      setAccessToken(res.data.accessToken);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await api.post(
         "/auth/logout",
          { accessToken },
          { withCredentials: true }
        );
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        accessToken, 
        loading,
        login, 
        logout, 
        register, 
        refreshToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

// Export these for use in the authApi
export { isRefreshing, failedQueue, processQueue };