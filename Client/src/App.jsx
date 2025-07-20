import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import { useSelector } from 'react-redux'
import AuthInit from './components/auth/AuthInit'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './redux/store'

// Pages
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import QueryBuilder from './pages/QueryBuilder'
import SchemaGenerator from './pages/SchemaGenerator'
import Settings from './pages/Settings'
import About from './pages/About'
import ManageDatabases from './pages/ManageDatabases'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import DatabaseVisualization from './pages/DatabaseVisualization'

// Components
import Tutorial from './components/onboarding/Tutorial'
import DatabaseConnection from './components/database/DatabaseConnection'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, isLoading, user } = useSelector((state) => state.auth)
  const { hasCompletedTutorial } = useSelector((state) => state.onboarding)
  const location = useLocation()

  // Show loading state while auth is initializing or loading
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Only redirect if we're sure auth is initialized and user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: { pathname: location.pathname } }} replace />
  }

  // List of core feature routes that require tutorial completion
  const coreFeatureRoutes = [
    '/dashboard',
    '/manage-databases',
    '/query-builder',
    '/schema-generator',
    '/settings'
  ]

  // Show tutorial only for core feature routes if not completed
  // Check both the Redux state and the user object from the backend
  if ((!hasCompletedTutorial || !user?.isTutorialCompleted) && 
      coreFeatureRoutes.includes(location.pathname) &&
      location.pathname !== '/tutorial') {
    return <Navigate to="/tutorial" replace />
  }

  return children
}

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  return (
    <PersistGate loading={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    } persistor={persistor}>
      <AuthInit>
        <ToastProvider>
          <Routes>
            {/* Public Routes - Always accessible */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />

            {/* Onboarding Routes - Only after authentication */}
            <Route
              path="/tutorial"
              element={
                <ProtectedRoute>
                  <Tutorial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/connect-database"
              element={
                <ProtectedRoute>
                  <DatabaseConnection />
                </ProtectedRoute>
              }
            />

            {/* Core Feature Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-databases"
              element={
                <ProtectedRoute>
                  <ManageDatabases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/query-builder"
              element={
                <ProtectedRoute>
                  <QueryBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schema-generator"
              element={
                <ProtectedRoute>
                  <SchemaGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/database-visualization"
              element={
                <ProtectedRoute>
                  <DatabaseVisualization />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - Redirect to landing if not authenticated */}
            <Route
              path="*"
              element={
                <Navigate
                  to={isAuthenticated ? '/dashboard' : '/'}
                  replace
                />
              }
            />
          </Routes>
        </ToastProvider>
      </AuthInit>
    </PersistGate>
  )
}

export default App
