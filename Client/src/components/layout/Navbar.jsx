import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../../redux/slices/themeSlice'
import { logout } from '../../redux/slices/authSlice'
import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  Home,
  Database,
  Code2,
  Settings,
  FileCode
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isDark } = useSelector((state) => state.theme)
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Manage Databases', href: '/manage-databases', icon: Database },
    { name: 'Query Builder', href: '/query-builder', icon: Code2 },
    { name: 'Schema Generator', href: '/schema-generator', icon: FileCode },
    { name: 'Settings', href: '/settings', icon: Settings }
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary">
                LangSQL
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary"
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              {isAuthenticated ? (
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                    {user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="ml-3 space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 