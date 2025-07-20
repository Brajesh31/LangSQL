import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Database, Sun, Moon, Home, Settings, FileCode, Network, LogOut, Bell, User, ChevronDown, BarChart2, Loader2 } from 'lucide-react'
import { toggleTheme } from '../../redux/slices/themeSlice'
import { logout } from '../../redux/slices/authSlice'
import { authAPI } from '../../services/axios.api'
import { useToast } from '../../contexts/ToastContext'

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen')
    return savedState === null ? true : JSON.parse(savedState)
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [error, setError] = useState('')
  const { showSuccess, showError } = useToast()
  const { isDark } = useSelector((state) => state.theme)
  const { user } = useSelector((state) => state.auth)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Demo notifications
  const notifications = [
    {
      id: 1,
      title: 'Schema Generation Complete',
      message: 'Your database schema has been successfully generated.',
      time: '5 minutes ago',
      type: 'success'
    },
    {
      id: 2,
      title: 'Query Optimization',
      message: 'Your query has been optimized for better performance.',
      time: '1 hour ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'New Feature Available',
      message: 'Check out our new query builder feature!',
      time: '2 hours ago',
      type: 'feature'
    }
  ]

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen))
  }, [isSidebarOpen])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Manage Databases', href: '/manage-databases', icon: Database },
    { name: 'Query Builder', href: '/query-builder', icon: FileCode },
    { name: 'Schema Generator', href: '/schema-generator', icon: Network },
    { name: 'Database Visualization', href: '/database-visualization', icon: BarChart2 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true)
    setIsUserMenuOpen(false) // Close the menu immediately
    
    try {
      const response = await authAPI.logout()
      if (response.data.success === true) {
        // Clear any local storage/cookies
        localStorage.clear()
        
        // Dispatch logout action
        dispatch(logout())
        
        // Show success message
        showSuccess('Successfully logged out')
        
        // Navigate to landing page
        navigate('/', { replace: true })
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to logout. Please try again.'
      showError(errorMessage)
      
      // Still logout the user on frontend if backend fails
      dispatch(logout())
      navigate('/', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleThemeToggle = () => {
    dispatch(toggleTheme())
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113] text-gray-900 dark:text-white transition-all">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-[#111113] border-r border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'w-[280px]' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50">
            <Link className="flex items-center space-x-2 min-w-[40px]">
              <img
                src={isDark ? "/Logo-White.png" : "/Logo-Dark.png"}
                alt="LangSQL Logo"
                className="h-8 w-8"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xl font-bold bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent whitespace-nowrap"
                  >
                    LangSQL
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-500/10 dark:bg-[#00E5FF]/10 text-blue-500 dark:text-[#00E5FF]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-[280px]' : 'ml-20'
        }`}
      >
        {/* Top Bar */}
        <div className={`fixed top-0 right-0 z-30 h-16 bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 ${
          isSidebarOpen ? 'left-[280px]' : 'left-20'
        }`}>
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Welcome back, {user?.name|| 'User'}!
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111113] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full ${
                                notification.type === 'success' ? 'bg-green-100 dark:bg-green-900' :
                                notification.type === 'info' ? 'bg-blue-100 dark:bg-blue-900' :
                                'bg-purple-100 dark:bg-purple-900'
                              }`}>
                                <Bell className={`w-4 h-4 ${
                                  notification.type === 'success' ? 'text-green-500' :
                                  notification.type === 'info' ? 'text-blue-500' :
                                  'text-purple-500'
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <button className="w-full text-sm text-blue-500 dark:text-[#00E5FF] hover:text-blue-600 dark:hover:text-[#00E5FF]/90">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-[#00E5FF] flex items-center justify-center text-white font-medium">
                    {user?.imageURL ? (
                      <img src={user.imageURL} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user?.name?.[0].toUpperCase() || 'U'
                    )}
                  </div>

                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role || 'User'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111113] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-medium">{user?.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'User'}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4" />
                          )}
                          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="pt-16 p-4">
          {children}
        </div>
      </main>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-y-0 right-0 w-64 bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-800/50 z-50 p-4"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-500/10 dark:bg-[#00E5FF]/10 text-blue-500 dark:text-[#00E5FF]'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DashboardLayout 