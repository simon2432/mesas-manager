import axios from "axios";

import { getApiBaseUrl } from "@/src/constants/api";
import { useAuthStore } from "@/src/store/auth.store";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

function isPublicAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register")
  );
}

api.interceptors.request.use((config) => {
  if (!isPublicAuthPath(config.url)) {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
