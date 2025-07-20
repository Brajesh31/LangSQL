import api from "./api/axios.api";

export const databaseService = {
  // Get all connections
  getConnections: async (params = {}) => {
    try {
      const response = await api.get("/api/connections", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Test connection
  testConnection: async (connectionData) => {
    try {
      const response = await api.post("/api/connections/test", connectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new connection
  createConnection: async (connectionData) => {
    try {
      const response = await api.post("/api/connections", connectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update connection
  updateConnection: async (id, connectionData) => {
    try {
      const response = await api.put(`/api/connections/${id}`, connectionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete connection
  deleteConnection: async (id) => {
    try {
      const response = await api.delete(`/api/connections/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get connection details
  getConnectionDetails: async (id) => {
    try {
      const response = await api.get(`/api/connections/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
