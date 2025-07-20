import { createSlice } from '@reduxjs/toolkit'

// Get theme from localStorage or system preference
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    return savedTheme === 'dark'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Initialize theme
const initialTheme = getInitialTheme()
if (initialTheme) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

const initialState = {
  isDark: initialTheme,
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark
      localStorage.setItem('theme', state.isDark ? 'dark' : 'light')
      if (state.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setTheme: (state, action) => {
      state.isDark = action.payload
      localStorage.setItem('theme', action.payload ? 'dark' : 'light')
      if (action.payload) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer 