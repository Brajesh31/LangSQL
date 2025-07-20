import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { toggleTheme } from '../../redux/slices/themeSlice'

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isDark } = useSelector((state) => state.theme)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const handleNavigation = (href) => {
    navigate(href)
    setIsMobileMenuOpen(false)
  }

  const handleThemeToggle = () => {
    dispatch(toggleTheme())
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={isDark ? "/Logo-White.png" : "/Logo-Dark.png"}
              alt="LangSQL Logo"
              className="h-8"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
              LangSQL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-[#00E5FF] transition-colors"
              >
                {item.name}
              </button>
            ))}
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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
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
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl"
      >
        <div className="px-4 py-4 space-y-4">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className="block w-full text-left text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-[#00E5FF] transition-colors py-2"
            >
              {item.name}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  )
}

export default LandingNavbar 