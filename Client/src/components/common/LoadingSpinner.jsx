import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'md', color = 'primary', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-500',
  }

  const spinner = (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-t-2 border-b-2 rounded-full animate-spin`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner 