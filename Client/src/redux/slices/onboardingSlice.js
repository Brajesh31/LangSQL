import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hasCompletedTutorial: false,
  currentStep: 0,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    completeTutorial: (state) => {
      state.hasCompletedTutorial = true;
      state.currentStep = 0;
    },
    skipTutorial: (state) => {
      state.hasCompletedTutorial = true;
      state.currentStep = 0;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    resetOnboarding: (state) => {
      state.hasCompletedTutorial = false;
      state.currentStep = 0;
    },
  },
});

export const {
  completeTutorial,
  skipTutorial,
  setCurrentStep,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
