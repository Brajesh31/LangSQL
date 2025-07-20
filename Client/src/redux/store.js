import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import onboardingReducer from "./slices/onboardingSlice";
import databaseReducer from "./slices/databaseSlice";

// Configure persist options
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth", "theme", "onboarding", "database"], // Only persist these reducers
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(
  { ...persistConfig, key: "auth" },
  authReducer
);
const persistedThemeReducer = persistReducer(
  { ...persistConfig, key: "theme" },
  themeReducer
);
const persistedOnboardingReducer = persistReducer(
  { ...persistConfig, key: "onboarding" },
  onboardingReducer
);
const persistedDatabaseReducer = persistReducer(
  { ...persistConfig, key: "database" },
  databaseReducer
);

export const store = configureStore({
  reducer: {
    theme: persistedThemeReducer,
    auth: persistedAuthReducer,
    onboarding: persistedOnboardingReducer,
    database: persistedDatabaseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
