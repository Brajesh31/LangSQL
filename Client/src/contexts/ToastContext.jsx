import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/common/Toast'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ message, type = 'info', duration = 5000 }) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showSuccess = useCallback(
    (message) => addToast({ message, type: 'success' }),
    [addToast]
  )

  const showError = useCallback(
    (message) => addToast({ message, type: 'error' }),
    [addToast]
  )

  const showWarning = useCallback(
    (message) => addToast({ message, type: 'warning' }),
    [addToast]
  )

  const showInfo = useCallback(
    (message) => addToast({ message, type: 'info' }),
    [addToast]
  )

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 