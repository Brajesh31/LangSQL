import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Moon,
  Sun,
  Bell,
  Globe,
  Shield,
  Save,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../redux/slices/themeSlice'
import { useToast } from '../contexts/ToastContext'

const Settings = () => {
  const dispatch = useDispatch()
  const { isDark } = useSelector((state) => state.theme)
  const { showSuccess } = useToast()
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    notifications: {
      email: true,
      push: false,
      updates: true,
    },
    language: 'en',
    theme: isDark ? 'dark' : 'light',
  })

  const handleSave = () => {
    showSuccess('Settings saved successfully')
  }

  const handleDeleteAccount = () => {
    // Add account deletion logic here
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113] text-gray-900 dark:text-white p-6 transition-all duration-300 ease-in-out">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="max-w-[1600px] mx-auto"
        >
          {/* Header */}
          <div className="relative mb-12">
            {/* Background gradient effect */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-[#00E5FF]/20 blur-3xl transform rotate-12" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-[#00E5FF]/10 backdrop-blur-sm border border-blue-500/20 shadow-xl"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                ⚙️ Settings
              </span>
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage your account preferences and settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 transition-all"
            >
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-blue-500 dark:text-[#00E5FF] mr-3" />
                <h2 className="text-xl font-semibold">Profile Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 transition-all"
            >
              <div className="flex items-center mb-6">
                <Bell className="h-6 w-6 text-blue-500 dark:text-[#00E5FF] mr-3" />
                <h2 className="text-xl font-semibold">Preferences</h2>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-[#0A0A0B]/80">
                <div className="flex items-center">
                  {isDark ? (
                    <Moon className="h-5 w-5 text-blue-500 dark:text-[#00E5FF] mr-3" />
                  ) : (
                    <Sun className="h-5 w-5 text-blue-500 dark:text-[#00E5FF] mr-3" />
                  )}
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch(toggleTheme())}
                  className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-[#00E5FF] hover:bg-blue-500/20 transition-colors"
                >
                  Toggle Theme
                </motion.button>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-[#0A0A0B]/80 mt-4">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-blue-500 dark:text-[#00E5FF] mr-3" />
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select your preferred language
                    </p>
                  </div>
                </div>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              {/* Notification Settings */}
              <div className="mt-6">
                <h3 className="font-medium mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  {Object.entries(formData.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-[#0A0A0B]/80">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-blue-500 dark:text-[#00E5FF] mr-3" />
                        <div>
                          <p className="font-medium capitalize">{key} Notifications</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Receive {key} notifications about updates
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              notifications: {
                                ...formData.notifications,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 dark:peer-checked:bg-[#00E5FF]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 transition-all lg:col-span-2"
            >
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-blue-500 dark:text-[#00E5FF] mr-3" />
                <h2 className="text-xl font-semibold">Security</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {}}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-[#0A0A0B]/80 hover:bg-white/90 dark:hover:bg-[#0A0A0B]/90 transition-colors"
                >
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 dark:text-[#00E5FF] mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update your password
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {}}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-[#0A0A0B]/80 hover:bg-white/90 dark:hover:bg-[#0A0A0B]/90 transition-colors"
                >
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 dark:text-[#00E5FF] mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-500 dark:bg-[#00E5FF] text-white dark:text-black font-medium hover:bg-blue-600 dark:hover:bg-[#00E5FF]/90 transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAccount}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Account
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default Settings 