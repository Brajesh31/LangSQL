import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  queriesGenerated: 0,
  schemasGenerated: 0,
  translationsCompleted: 0,
  queriesExecuted: 0,
  lastActive: null,
}

export const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    incrementQueriesGenerated: (state) => {
      state.queriesGenerated += 1
      state.lastActive = new Date().toISOString()
    },
    incrementSchemasGenerated: (state) => {
      state.schemasGenerated += 1
      state.lastActive = new Date().toISOString()
    },
    incrementTranslationsCompleted: (state) => {
      state.translationsCompleted += 1
      state.lastActive = new Date().toISOString()
    },
    incrementQueriesExecuted: (state) => {
      state.queriesExecuted += 1
      state.lastActive = new Date().toISOString()
    },
    resetStats: (state) => {
      return initialState
    },
  },
})

export const {
  incrementQueriesGenerated,
  incrementSchemasGenerated,
  incrementTranslationsCompleted,
  incrementQueriesExecuted,
  resetStats,
} = statsSlice.actions

export default statsSlice.reducer 