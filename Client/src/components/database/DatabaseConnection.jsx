import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronRight,
  Server,
  Key,
  User,
  Lock,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import {
  addConnection,
  removeConnection,
  setActiveConnection,
  setConnecting,
  setError,
  clearError,
} from '../../redux/slices/databaseSlice'

const DatabaseConnection = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { connections, isConnecting, error } = useSelector((state) => state.database)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'postgresql', // postgresql, mysql, trino, spark
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    ssl: false,
  })

  const databaseTypes = [
    { id: 'postgresql', name: 'PostgreSQL', icon: Database },
    { id: 'mysql', name: 'MySQL', icon: Database },
    { id: 'trino', name: 'Trino', icon: Server },
    { id: 'spark', name: 'Spark SQL', icon: Server },
  ]

  const handleTestConnection = async () => {
    if (!newConnection.host || !newConnection.port || !newConnection.database || !newConnection.username) {
      showError('Please fill in all required fields before testing connection')
      return
    }

    setIsTesting(true)
    setTestResult(null)
    dispatch(clearError())

    try {
      // Simulate API call to test connection
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate successful connection
      setTestResult({
        success: true,
        message: 'Connection successful!',
        details: {
          version: '14.0',
          tables: 12,
          size: '2.5GB'
        }
      })
      showSuccess('Connection test successful!')
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection failed',
        details: error.message
      })
      showError('Connection test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleAddConnection = async () => {
    if (!testResult?.success) {
      showError('Please test the connection before adding it')
      return
    }

    if (newConnection.name && newConnection.host) {
      dispatch(setConnecting(true))
      dispatch(clearError())

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        dispatch(addConnection({ 
          ...newConnection, 
          id: Date.now(),
          status: 'connected',
          lastConnected: new Date().toLocaleString()
        }))
        setNewConnection({
          name: '',
          type: 'postgresql',
          host: '',
          port: '',
          database: '',
          username: '',
          password: '',
          ssl: false,
        })
        setIsAddingNew(false)
        showSuccess('Connection added successfully!')
        navigate('/dashboard')
      } catch (error) {
        dispatch(setError(error.message || 'Failed to connect to database'))
        showError('Failed to add connection')
      } finally {
        dispatch(setConnecting(false))
      }
    }
  }

  const handleDeleteConnection = (id) => {
    dispatch(removeConnection(id))
  }

  const handleConnect = (connection) => {
    dispatch(setActiveConnection(connection))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Database Connections
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your database connections and explore schemas
            </p>
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Connection</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Connection List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Database className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{connection.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {connection.type} • {connection.host}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteConnection(connection.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleConnect(connection)}
                className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all"
              >
                <span>Connect</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Add New Connection Modal */}
        {isAddingNew && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#111113] rounded-xl p-8 max-w-2xl w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">New Database Connection</h2>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Connection Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Connection Name</label>
                  <input
                    type="text"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                    placeholder="My Database"
                  />
                </div>

                {/* Database Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Database Type</label>
                  <select
                    value={newConnection.type}
                    onChange={(e) => setNewConnection({ ...newConnection, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                  >
                    {databaseTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                {/* Host & Port */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Host</label>
                    <input
                      type="text"
                      value={newConnection.host}
                      onChange={(e) => setNewConnection({ ...newConnection, host: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                      placeholder="localhost"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Port</label>
                    <input
                      type="text"
                      value={newConnection.port}
                      onChange={(e) => setNewConnection({ ...newConnection, port: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                      placeholder="5432"
                    />
                  </div>
                </div>

                {/* Database Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Database Name</label>
                  <input
                    type="text"
                    value={newConnection.database}
                    onChange={(e) => setNewConnection({ ...newConnection, database: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                    placeholder="mydatabase"
                  />
                </div>

                {/* Username & Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      value={newConnection.username}
                      onChange={(e) => setNewConnection({ ...newConnection, username: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={newConnection.password}
                      onChange={(e) => setNewConnection({ ...newConnection, password: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* SSL Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ssl"
                    checked={newConnection.ssl}
                    onChange={(e) => setNewConnection({ ...newConnection, ssl: e.target.checked })}
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ssl" className="text-sm font-medium">
                    Use SSL Connection
                  </label>
                </div>

                {/* Test Connection Button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>

                  {/* Test Result Display */}
                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center space-x-2 ${
                        testResult.success ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      <span>{testResult.message}</span>
                    </motion.div>
                  )}
                </div>

                {/* Connection Details */}
                {testResult?.success && testResult.details && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                  >
                    <h3 className="text-sm font-medium text-emerald-500 mb-2">Connection Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Version:</span>
                        <span className="ml-2">{testResult.details.version}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Tables:</span>
                        <span className="ml-2">{testResult.details.tables}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Database Size:</span>
                        <span className="ml-2">{testResult.details.size}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Error Display */}
                {testResult?.success === false && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <h3 className="text-sm font-medium text-red-500 mb-2">Connection Error</h3>
                    <p className="text-sm text-red-500">{testResult.details}</p>
                  </motion.div>
                )}

                <div className="flex items-center justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddConnection}
                    disabled={isConnecting || !testResult?.success}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    <span>{isConnecting ? 'Connecting...' : 'Add Connection'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DatabaseConnection 