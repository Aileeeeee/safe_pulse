/**
 * Central Axios client for SAFEPULSE.
 *
 * Handles:
 *  - Attaching JWT access token to every request
 *  - Auto-refreshing the access token on 401
 *  - Redirecting to /login on refresh failure
 *  - Typed error wrapping
 */
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { API_BASE, TOKEN_KEY, REFRESH_KEY, AUTH_ENDPOINTS } from "@/constants";
import type { AuthTokens, ApiError } from "@/types";

// ─── Create instance ──────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 / token refresh ───────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue subsequent 401s until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = Cookies.get(REFRESH_KEY);

      if (!refresh) {
        // No refresh token → force logout
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<AuthTokens>(
          `${API_BASE}${AUTH_ENDPOINTS.REFRESH}`,
          { refresh }
        );
        saveTokens(data);
        processQueue(null, data.access);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Wrap error into a friendly shape
    return Promise.reject(normaliseError(error));
  }
);

// ─── Token helpers ────────────────────────────────────────────────────────────
export function saveTokens(tokens: AuthTokens) {
  Cookies.set(TOKEN_KEY, tokens.access, {
    expires: 1,          // 1 day — access token
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  Cookies.set(REFRESH_KEY, tokens.refresh, {
    expires: 7,          // 7 days — refresh token
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function clearTokens() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_KEY);
}

export function getAccessToken() {
  return Cookies.get(TOKEN_KEY) ?? null;
}

// ─── Error normaliser ─────────────────────────────────────────────────────────
function normaliseError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data) {
    return {
      message: error.response.data.message ?? "An error occurred",
      code: error.response.data.code,
      details: error.response.data.details,
    };
  }
  if (error.request) {
    return { message: "Network error. Please check your connection." };
  }
  return { message: error.message ?? "Unexpected error." };
}

export default api;
