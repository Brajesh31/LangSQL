import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Cloud,
  Database,
  Code,
  ArrowRight,
  Twitter,
  Github,
  Linkedin,
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import LandingNavbar from '../components/layout/LandingNavbar'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { authAPI } from '../services/axios.api'
import { useToast } from '../contexts/ToastContext'
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice'
import { completeTutorial, resetOnboarding } from '../redux/slices/onboardingSlice'
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/emailjs'
import { auth } from '../Firebase/firebase'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  getAdditionalUserInfo 
} from 'firebase/auth'

const AuthModal = ({ isLogin, show, onClose, onSwitchToRegister, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendTimeout, setResendTimeout] = useState(0)
  const [showResendSuccess, setShowResendSuccess] = useState(false)
  const [verificationData, setVerificationData] = useState(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { showSuccess, showError } = useToast()
  const { isDark } = useSelector((state) => state.theme)

  // Reset states when modal is closed
  useEffect(() => {
    if (!show) {
      setShowPassword(false)
      setError('')
      setShowVerification(false)
      setVerificationCode('')
      setResendTimeout(0)
      setShowResendSuccess(false)
      setVerificationData(null)
    }
  }, [show])

  // Handle countdown timer
  useEffect(() => {
    let timer
    if (resendTimeout > 0) {
      timer = setInterval(() => {
        setResendTimeout(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendTimeout])

  // Function to generate a 6-digit code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleResendCode = async () => {
    if (resendTimeout > 0) return
    
    setIsLoading(true)
    try {
      // Generate new verification code
      const newVerificationCode = generateVerificationCode()
      
      // Send new verification email
      await sendVerificationEmail(registerForm.email, newVerificationCode,registerForm.name)
      
      // Update verification data
      setVerificationData({
        code: newVerificationCode,
        timestamp: Date.now()
      })
      
      setResendTimeout(60) // Start 60 second countdown
      setShowResendSuccess(true)
      setTimeout(() => setShowResendSuccess(false), 3000)
      showSuccess('Verification code resent!')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend code. Please try again.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    if (!verificationCode) {
      showError('Please enter verification code')
      return
    }
    
    setIsVerifying(true)
    try {
      // Verify the code
      if (!verificationData || verificationCode !== verificationData.code) {
        throw new Error('Invalid verification code')
      }

      // Check if code is expired (15 minutes)
      if (Date.now() - verificationData.timestamp > 15 * 60 * 1000) {
        throw new Error('Verification code has expired')
      }

      // If code is verified, proceed with registration
      const registerResponse = await authAPI.register(registerForm)
      
      if (registerResponse.data.success === true) {
        console.log('Registration successful, sending welcome email...')
        try {
          const welcomeResponse = await sendWelcomeEmail(registerForm.email, registerForm.name)
          console.log('Welcome email sent:', welcomeResponse)
          
          dispatch(loginSuccess(registerResponse.data))
          dispatch(resetOnboarding())
          showSuccess('Registration successful!')
      onClose()
      navigate('/dashboard')
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Still proceed with registration even if welcome email fails
          dispatch(loginSuccess(registerResponse.data))
          dispatch(resetOnboarding())
          showSuccess('Registration successful! (Welcome email could not be sent)')
          onClose()
          navigate('/dashboard')
        }
      } else {
        throw new Error(registerResponse.data.message || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error.message || 'Invalid verification code'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError('Please fill in all fields')
      showError('Please fill in all fields')
      return
    }
    
    setIsLoading(true)
    try {
      // Generate a verification code
      const verificationCode = generateVerificationCode()
      
      // Send verification email
      await sendVerificationEmail(registerForm.email, verificationCode, registerForm.name)
      
      // Store verification data
      setVerificationData({
        code: verificationCode,
        timestamp: Date.now()
      })
      
      showSuccess('Verification code sent to your email!')
      setShowVerification(true)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification code. Please try again.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    // Prevent form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setError('')
    
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields')
      showError('Please fill in all fields')
      return
    }
    
    setIsLoading(true)
    dispatch(loginStart())
    
    try {
      const response = await authAPI.login(loginForm)
      
      // Check if response has the expected data structure
      if (response.data.success === false) {
        throw new Error('Invalid response from server')
      }

      dispatch(loginSuccess(response.data))
      
      // Handle tutorial completion state
      if (response.data.user.isTutorialCompleted) {
        dispatch(completeTutorial())
      } else {
        dispatch(resetOnboarding())
      }
      
      showSuccess('Login successful!')
      setLoginForm({ email: '', password: '' })
      onClose()
      navigate('/dashboard')
    } catch (error) {
      // Handle the specific error response format from the backend
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
      
      setError(errorMessage)
      dispatch(loginFailure(errorMessage))
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = async (provider) => {
    setIsLoading(true)
    setError('')
    
    try {
      let authProvider
      if (provider === 'google') {
        authProvider = new GoogleAuthProvider()
      } else if (provider === 'github') {
        authProvider = new GithubAuthProvider()
      }

      const result = await signInWithPopup(auth, authProvider)
      const auth_token = await result.user.getIdToken()

      // Use the unified social auth endpoint
      const response = await authAPI.socialAuth(provider, { auth_token })
      
      if (response.data.success) {
        dispatch(loginSuccess(response.data))
        
        // Handle onboarding state based on whether this is a new user
        if (response.data.isNewUser) {
          dispatch(resetOnboarding())
          showSuccess('Registration successful!')
        } else {
          if (response.data.user.isTutorialCompleted) {
            dispatch(completeTutorial())
          }
          showSuccess('Login successful!')
        }
        
        onClose()
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Social auth error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Authentication failed'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Render verification screen if showVerification is true
  if (showVerification) {
  return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="min-h-screen px-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
              onClick={onClose}
            />

            <div className="fixed inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-[#111113] p-8 text-left shadow-2xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white"
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </motion.button>

              {/* Email icon with animation */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-[#00E5FF]/10 flex items-center justify-center mb-6"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Mail className="w-10 h-10 text-blue-500 dark:text-[#00E5FF]" />
                </motion.div>
              </motion.div>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Check Your Email
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  We've sent a verification code to
                </p>
                <p className="text-blue-500 dark:text-[#00E5FF] font-medium text-lg mt-1">
                  {registerForm.email}
                </p>
              </div>

              <form onSubmit={handleVerification} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Enter 6-digit verification code
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        if (value.length <= 6) {
                          setVerificationCode(value)
                        }
                      }}
                      className="w-full px-4 py-3 bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all duration-200 text-center text-3xl tracking-[1em] font-mono placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="______"
                      maxLength={6}
                    />
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`relative w-8 h-1 rounded-full transition-all duration-200 ${
                            verificationCode.length > i
                              ? 'bg-blue-500 dark:bg-[#00E5FF] scale-100'
                              : 'bg-gray-200 dark:bg-gray-800 scale-95'
                          }`}
                        >
                          {verificationCode.length === i && (
                            <motion.div
                              layoutId="cursor"
                              className="absolute inset-0 bg-blue-500 dark:bg-[#00E5FF] rounded-full"
                              animate={{
                                opacity: [1, 0.5, 1],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-10 text-center space-y-2">
                    {showResendSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-green-600 dark:text-green-400"
                      >
                        ✓ New code sent successfully!
                      </motion.p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Didn't receive the code?{' '}
                      {resendTimeout > 0 ? (
                        <span className="text-blue-500 dark:text-[#00E5FF]">
                          Resend in {resendTimeout}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={isLoading || resendTimeout > 0}
                          className="text-blue-500 dark:text-[#00E5FF] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Resend
                        </button>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-[#00E5FF] dark:from-[#00E5FF] dark:to-blue-500 text-white dark:text-black font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 dark:shadow-[#00E5FF]/25 flex items-center justify-center space-x-2"
                >
                  {isVerifying ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <span>Verify Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />

        <div className="fixed inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-[#111113] p-8 text-left shadow-2xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white"
              >
                {/* Close button with hover effect */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </motion.button>

                {/* Logo */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 flex justify-center"
                >
                  <img
                    src={isDark ? "/Logo-White.png" : "/Logo-Dark.png"}
                    alt="LangSQL Logo"
                    className="h-12"
                  />
                </motion.div>
                
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent text-center"
                >
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </motion.h2>

                <motion.p
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 dark:text-gray-400 text-center mb-8"
                >
                  {isLogin ? 'Sign in to continue to LangSQL' : 'Join the SQL revolution today'}
                </motion.p>
                
                <motion.form
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onSubmit={isLogin ? handleLogin : handleRegister}
                  className="space-y-4"
                >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </motion.div>
              )}
              
                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-[#00E5FF] transition-colors" />
                        <input
                          type="text"
                          value={registerForm.name}
                          onChange={(e) =>
                            setRegisterForm({ ...registerForm, name: e.target.value })
                          }
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="John Doe"
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-[#00E5FF] transition-colors" />
                      <input
                        type="email"
                        value={isLogin ? loginForm.email : registerForm.email}
                        onChange={(e) =>
                          isLogin
                            ? setLoginForm({ ...loginForm, email: e.target.value })
                            : setRegisterForm({ ...registerForm, email: e.target.value })
                        }
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-[#00E5FF] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={isLogin ? loginForm.password : registerForm.password}
                        onChange={(e) =>
                          isLogin
                            ? setLoginForm({ ...loginForm, password: e.target.value })
                            : setRegisterForm({ ...registerForm, password: e.target.value })
                        }
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="••••••••"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-[#00E5FF] transition-colors" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-[#00E5FF] transition-colors" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-[#00E5FF] dark:from-[#00E5FF] dark:to-blue-500 text-white dark:text-black font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 dark:shadow-[#00E5FF]/25 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isLogin ? (
                    <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setLoginForm({ email: '', password: '' })
                          onClose()
                      onSwitchToRegister()
                        }}
                        className="text-blue-500 dark:text-[#00E5FF] hover:underline font-medium"
                      >
                        Sign up
                      </motion.button>
                    </p>
                  ) : (
                    <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setRegisterForm({
                            name: '',
                            email: '',
                            password: '',
                          })
                          onClose()
                      onSwitchToLogin()
                        }}
                        className="text-blue-500 dark:text-[#00E5FF] hover:underline font-medium"
                      >
                        Sign in
                      </motion.button>
                    </p>
                  )}
                  
                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white/80 dark:bg-[#111113]/80 text-gray-500 dark:text-gray-400">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {[
                        { Icon: FaGoogle, label: 'Google', onClick: () => handleSocialAuth('google') },
                        { Icon: Github, label: 'GitHub', onClick: () => handleSocialAuth('github') },
                        { Icon: Linkedin, label: 'Linkedin', onClick: () => handleSocialAuth('github') }
                      ].map(({ Icon, label, onClick }, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={onClick}
                          disabled={isLoading}
                          className="group flex items-center justify-center px-4 py-2.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-500 dark:hover:border-[#00E5FF] hover:bg-blue-500/5 dark:hover:bg-[#00E5FF]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-[#00E5FF] transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
  )
}

const Landing = () => {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const { isDark } = useSelector((state) => state.theme)

  const closeLoginModal = useCallback(() => setShowLoginModal(false), [])
  const closeRegisterModal = useCallback(() => setShowRegisterModal(false), [])

  const switchToRegister = useCallback(() => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }, [])

  const switchToLogin = useCallback(() => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }, [])

  const features = [
    {
      icon: Cloud,
      title: 'AI-Powered SQL Generation',
      description: 'Convert natural language into accurate, optimized SQL queries.',
    },
    {
      icon: Database,
      title: 'Instant Schema Design',
      description: 'AI assists in designing your database schemas effortlessly.',
    },
    {
      icon: Code,
      title: 'Multi-Dialect Support',
      description: 'Supports Trino, SparkSQL, PostgreSQL, and more.',
    },
  ]

  const steps = [
    {
      number: '1',
      title: 'Describe Your Query',
      description: 'Type what you need in simple English.',
    },
    {
      number: '2',
      title: 'Get AI-Generated SQL',
      description: 'LangSQL generates an optimized query.',
    },
    {
      number: '3',
      title: 'Connect & Execute',
      description: 'Run it on your own database seamlessly.',
    },
  ]

  const testimonials = [
    {
      content: "LangSQL has revolutionized how we write and optimize our database queries. It's like having a SQL expert right at your fingertips.",
      author: 'Pratik Pujari',
      role: 'Senior Developer @ Google Inc.',
      avatar: '/pratik.png',
    },
    {
      content: 'The AI-powered schema design feature saved us countless hours during our database restructuring project.',
      author: 'Jyotsna Kasibhotla',
      role: 'Lead Engineer @ Amazon India',
      avatar: '/jyotsna.png',
    },
    {
      content: 'Multi-dialect support makes it incredibly versatile. We use it across different projects with various database systems.',
      author: 'Soham Narvankar',
      role: 'CTO @ LangSQL',
      avatar: '/soham.png',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113] text-gray-900 dark:text-white transition-all">
      <LandingNavbar />

      {/* Floating shapes in the background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 dark:bg-[#00E5FF]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00E5FF]/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center relative">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <img
                src={isDark ? "/Logo-White.png" : "/Logo-Dark.png"}
                alt="LangSQL Logo"
                className="h-16 mx-auto"
              />
            </motion.div>
            
            {/* Background gradient effect */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-[#00E5FF]/20 dark:from-blue-500/10 dark:to-[#00E5FF]/10 blur-3xl transform rotate-12" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-[#00E5FF]/10 backdrop-blur-sm border border-blue-500/20 dark:border-[#00E5FF]/20 shadow-xl shadow-blue-500/5 dark:shadow-[#00E5FF]/5"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                ✨ Introducing LangSQL 1.0
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
            >
              <span className="block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Write SQL Like You're
              </span>
              <span className="block mt-2">
                Having a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                    Conversation
                  </span>
                  <motion.span
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    className="absolute bottom-0 left-0 h-3 bg-gradient-to-r from-blue-500/50 to-[#00E5FF]/50 -rotate-2 rounded-lg"
                  />
                  <motion.span
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    className="absolute -right-8 -top-1 text-3xl">
                    ✨
                  </motion.span>
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              Transform natural language into powerful SQL queries instantly. 
              Let AI handle the complexity while you focus on what matters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full sm:w-auto px-8 py-4 text-white dark:text-black bg-gradient-to-r from-blue-500 to-blue-600 dark:from-[#00E5FF] dark:to-[#00E5FF]/90 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 dark:shadow-[#00E5FF]/25 font-medium transform hover:scale-105 hover:-translate-y-0.5 active:scale-95"
              >
                Get Started Free
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm border-2 border-blue-500 dark:border-[#00E5FF] text-blue-500 dark:text-[#00E5FF] rounded-xl hover:bg-blue-500/10 dark:hover:bg-[#00E5FF]/10 transition-all font-medium transform hover:scale-105 hover:-translate-y-0.5 active:scale-95"
              >
                View Demo
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              {[
                { value: '100K+', label: 'Queries Generated' },
                { value: '98%', label: 'Accuracy Rate' },
                { value: '50+', label: 'SQL Dialects' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-6 rounded-2xl bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 shadow-xl"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-500/5 to-transparent dark:from-[#00E5FF]/5" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 dark:bg-[#00E5FF]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00E5FF]/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-[#00E5FF]/10 backdrop-blur-sm border border-blue-500/20 dark:border-[#00E5FF]/20 shadow-xl"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                ✨ Powerful Features
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6"
            >
              Modern SQL Development<br />Made Simple
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-xl"
            >
              Everything you need to write, optimize, and manage your database queries efficiently.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all group overflow-hidden"
              >
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-[#00E5FF]/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#00E5FF]/10 border border-blue-500/20 dark:border-[#00E5FF]/20 w-fit mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <feature.icon className="h-7 w-7 text-blue-500 dark:text-[#00E5FF]" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:translate-x-2 transition-transform">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed group-hover:translate-x-2 transition-transform">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-100 via-white to-gray-50 dark:from-[#0D0D0F] dark:via-[#111113] dark:to-[#0A0A0B] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#00E5FF1A,_transparent_50%)]" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/10 dark:bg-[#00E5FF]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#00E5FF]/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-[#00E5FF]/10 backdrop-blur-sm border border-blue-500/20 dark:border-[#00E5FF]/20 shadow-xl"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                🚀 Simple Process
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6"
            >
              Three Steps to SQL<br />Mastery
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-xl"
            >
              Get started in minutes and experience the power of AI-assisted SQL development
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-[#00E5FF]/50 -translate-y-1/2 hidden md:block" />
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 relative group hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all"
              >
                {/* Step number */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -12 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-[#00E5FF] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/25 dark:shadow-[#00E5FF]/25 transform -rotate-6 group-hover:rotate-12 transition-transform"
                >
                  {step.number}
                </motion.div>
                
                <div className="pt-8">
                  <h3 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg text-center group-hover:translate-y-1 transition-transform">
                    {step.description}
                  </p>
                </div>

                {/* Decorative dots */}
                <div className="absolute bottom-4 right-4 flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-blue-500/50 dark:bg-[#00E5FF]/50 group-hover:scale-150 transition-transform"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-blue-500/5 to-transparent dark:from-[#00E5FF]/5" />
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-500/10 dark:bg-[#00E5FF]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#00E5FF]/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-[#00E5FF]/10 backdrop-blur-sm border border-blue-500/20 dark:border-[#00E5FF]/20 shadow-xl"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                💬 User Stories
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6"
            >
              Loved by Developers<br />Worldwide
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-xl"
            >
              Join thousands of developers who trust LangSQL for their database needs
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all relative overflow-hidden"
              >
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-[#00E5FF]/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <motion.img
                        whileHover={{ scale: 1.1, rotate: -6 }}
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-16 h-16 rounded-xl border-2 border-blue-500 dark:border-[#00E5FF] mr-4 object-cover transition-transform"
                      />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-[#00E5FF] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-lg group-hover:translate-x-2 transition-transform">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:translate-x-2 transition-transform">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed italic group-hover:translate-y-1 transition-transform">
                    "{testimonial.content}"
                  </p>
                </div>

                {/* Decorative quote marks */}
                <div className="absolute top-4 right-4 text-4xl font-serif text-blue-500/20 dark:text-[#00E5FF]/20 group-hover:scale-125 transition-transform">
                  "
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 via-blue-600 to-[#00E5FF] dark:from-blue-600 dark:via-[#00E5FF] dark:to-[#00E5FF] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_white/10,_transparent_50%)]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Transform Your<br />SQL Workflow?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-white/90 mb-12 text-xl"
          >
            Join thousands of developers who are already writing better SQL with LangSQL.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={() => setShowRegisterModal(true)}
            className="px-12 py-4 bg-white text-blue-500 rounded-xl hover:bg-white/90 transition-all font-medium shadow-xl shadow-blue-600/25 transform hover:-translate-y-1"
          >
            Get Started Free
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#111113] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features', href: '/features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Enterprise', href: '/enterprise' }
                ]
              },
              {
                title: 'Company',
                links: [
                  { label: 'About', href: '/about' },
                  { label: 'Careers', href: '/careers' },
                  { label: 'Blog', href: '/blog' }
                ]
              },
              {
                title: 'Resources',
                links: [
                  { label: 'Documentation', href: '/docs' },
                  { label: 'API', href: '/api' },
                  { label: 'Community', href: '/community' }
                ]
              },
              {
                title: 'Connect',
                links: [
                  { label: 'Discord', href: '/discord' },
                  { label: 'Twitter', href: '/twitter' },
                  { label: 'GitHub', href: '/github' }
                ]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-sm font-semibold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        to={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-[#00E5FF] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-3">
                  <img
                    src={isDark ? "/Logo-White.png" : "/Logo-Dark.png"}
                    alt="LangSQL Logo"
                    className="h-8"
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                    LangSQL
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  © 2025 LangSQL. All rights reserved.
                </span>
              </div>
              <div className="flex items-center space-x-6">
                {[
                  { Icon: Twitter, href: 'https://twitter.com' },
                  { Icon: Github, href: 'https://github.com' },
                  { Icon: Linkedin, href: 'https://linkedin.com' }
                ].map(({ Icon, href }, index) => (
                  <a
                    key={index}
                    href={href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-[#00E5FF] transition-colors transform hover:scale-110"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      <AnimatePresence mode="wait">
        {showLoginModal && (
      <AuthModal
            key="login-modal"
        isLogin={true}
            show={true}
        onClose={closeLoginModal}
            onSwitchToRegister={switchToRegister}
            onSwitchToLogin={switchToLogin}
      />
        )}
        {showRegisterModal && (
      <AuthModal
            key="register-modal"
        isLogin={false}
            show={true}
        onClose={closeRegisterModal}
            onSwitchToRegister={switchToRegister}
            onSwitchToLogin={switchToLogin}
      />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Landing 