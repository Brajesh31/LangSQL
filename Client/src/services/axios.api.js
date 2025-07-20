import axios from "axios";
import { handleAPIError } from "../utils/errorHandler";

const API_URL = import.meta.env.VITE_API_HOST || "http://localhost:3000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // No need to manually set Authorization header
    // The cookie will be automatically sent by the browser
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just reject the error, no need to handle token removal
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  socialAuth: (provider, data) =>
    api.post(`/api/auth/social/${provider}`, data),
  completeTutorial: () => api.post("/api/auth/tutorial/complete"),

  // Get the current logged-in user
  getCurrentUser: async () => {
    try {
      const response = await api.get("/api/auth/user", {
        withCredentials: true, // Ensure cookies are sent with request
      });
      return response.data; // Return the direct response data
    } catch (error) {
      if (error.response?.status === 401) {
        // If unauthorized, clear any stale state
        return { success: false, message: "Session expired" };
      }
      throw error;
    }
  },

  // Update the user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/api/auth/profile", profileData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      await api.post(
        "/api/auth/forgot-password",
        { email },
        {
          withCredentials: true, // Send cookies with the request
        }
      );
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      await api.post(
        "/api/auth/reset-password",
        { token, password },
        {
          withCredentials: true, // Send cookies with the request
        }
      );
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  googleLogin: (data) => api.post("/api/auth/google/login", data),
  googleRegister: (data) => api.post("/api/auth/google/register", data),
  githubLogin: (data) => api.post("/api/auth/github/login", data),
  githubRegister: (data) => api.post("/api/auth/github/register", data),
};

// SQL API
export const sqlAPI = {
  executeQuery: async (query) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        results: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
        ],
        executionTime: "0.23s",
      },
    };
  },

  generateSchema: async (description, dialect) => {
    try {
      const response = await api.post("/api/connection/schema/generate", {
        description,
        dialect,
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  translateQuery: async (query, from, to) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        translatedQuery: query.replace("LIMIT", "TOP"),
        from,
        to,
      },
    };
  },

  getQueryHistory: async () => {
    try {
      const response = await api.get("/sql/history");
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },
};

export default api;
