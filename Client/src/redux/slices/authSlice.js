import { createSlice } from "@reduxjs/toolkit";

// Initial state for authentication
const initialState = {
  user: null, // No user initially
  user_id: null, // No user ID initially
  isAuthenticated: false, // User is not authenticated by default
  isLoading: true, // Changed to true by default
  isInitialized: false, // Add initialization state
  error: null,
  lastLogin: null,
  rememberMe: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth: (state) => {
      state.isInitialized = true;
      state.isLoading = false;
    },
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.user_id = action.payload.user.id;
      state.lastLogin = new Date().toISOString();
      state.error = null;
      state.isInitialized = true;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.user_id = null;
      state.error = action.payload;
      state.isInitialized = true;
    },
    logout: (state) => {
      return {
        ...initialState,
        isLoading: false,
        isInitialized: true,
      };
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  initializeAuth,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setRememberMe,
  clearError,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;
