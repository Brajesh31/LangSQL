import axios from "axios";
import { handleAPIError } from "../../utils/errorHandler";

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
  executeQuery: async ({ query, connectionId, dialect }) => {
    try {
      const response = await api.post("/api/execute/", {
        query,
        connectionId,
        dialect,
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },
  generateQuerry: async (message, dialect, database) => {
    try {
      const response = await api.post("/api/execute/ai/generate", {
        message,
        dialect,
        database,
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  generateSchema: async (description, dialect) => {
    try {
      const response = await api.post("/api/connections/schema/generate", {
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
      const response = await api.get("/api/history/query");
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  getPromptHistory: async () => {
    try {
      const response = await api.get("/api/history/prompt");
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },
};

// Database Connections API
export const databaseAPI = {
  // Get all connections
  getConnections: async (params = {}) => {
    try {
      const response = await api.get("/api/connections", { params });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  // Test connection
  testConnection: async (connectionData) => {
    try {
      const response = await api.post("/api/connections/test", {
        connectionData: connectionData,
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  // Create new connection
  createConnection: async (connectionData) => {
    try {
      const response = await api.post("/api/connections/create", {
        connectionData: connectionData,
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  // Update connection
  updateConnection: async (id, connectionData) => {
    try {
      const response = await api.put(`/api/connections/update/${id}`, {
        connectionData: connectionData,
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  // Delete connection
  deleteConnection: async (id) => {
    try {
      const response = await api.delete(`/api/connections/delete/${id}`);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  // Get connection details
  getConnectionDetails: async (id) => {
    try {
      const response = await api.get(`/api/connections/metadata/${id}`);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  getBufferQuestions: async (metadata) => {
    try {
      const response = [
        "Generate a blog post about the impact of AI on daily life.",
        "Write a creative story about a time traveler who gets stuck in the past.",
        "Explain quantum computing in simple terms for beginners.",
        "Describe a futuristic city where humans and robots coexist peacefully.",
        "Create a motivational speech for students preparing for exams.",
        "List 10 innovative business ideas for startups in 2025.",
        "Write a poem about the beauty of the changing seasons.",
        "Draft a product description for a smart home security device.",
        "Summarize the plot of a famous novel in under 100 words.",
        "Generate a dialogue between two characters debating space exploration.",
      ];

      return { response };
    } catch (error) {
      throw handleAPIError(error);
    }
  },
};

export default api;
