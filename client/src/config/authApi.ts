// utils/authApi.ts
import api from "./api";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function useAuthApi() {
  const { refreshToken } = useAuth();

  // Request interceptor: always use latest token from localStorage
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken"); // always get latest
        if (token) config.headers.Authorization = `Bearer ${token}`;
        config.withCredentials = true;
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Response interceptor: handle 401 and refresh token
  useEffect(() => {
    let isRefreshing = false;
    let failedQueue: Array<{
      resolve: (value: any) => void;
      reject: (error: any) => void;
    }> = [];

    const processQueue = (error: any, token: string | null = null) => {
      failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
      });
      failedQueue = [];
    };

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newToken = await refreshToken(); // call AuthContext refreshToken
            if (newToken) {
              processQueue(null, newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            } else {
              processQueue(error, null);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken]);

  return api;
}
