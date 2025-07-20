import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connections: [],
  isConnecting: false,
  error: null,
};

const databaseSlice = createSlice({
  name: "database",
  initialState,
  reducers: {
    setActiveConnection: (state, action) => {
      state.connections = action.payload;
    },
    addConnection: (state, action) => {
      state.connections.push(action.payload);
    },
    removeConnection: (state, action) => {
      state.connections = state.connections.filter(
        (conn) => conn.id !== action.payload
      );
    },
    setConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setActiveConnection,
  addConnection,
  removeConnection,
  setConnecting,
  setError,
  clearError,
} = databaseSlice.actions;

export default databaseSlice.reducer;
