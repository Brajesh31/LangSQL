import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm z-[100] ${colors[type]}`}
      >
        {icons[type]}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default Toast 