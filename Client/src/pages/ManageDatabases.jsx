import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronRight,
  X,
  Server,
  DatabaseBackup
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useSelector, useDispatch } from 'react-redux'
import { useToast } from '../contexts/ToastContext'
import { databaseAPI } from '../services/api/axios.api'
import {
  addConnection,
  removeConnection,
  setActiveConnection,
  setConnecting,
  setError,
  clearError,
} from '../redux/slices/databaseSlice'

import { encryptData, decryptData } from '../services/encryption/aes.encryption'

const ManageDatabases = () => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [testStatus, setTestStatus] = useState(null)
  const { showSuccess, showError } = useToast()
  const { connections, isConnecting, error } = useSelector((state) => state.database)
  const { user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    ssl: false,
    clientId: '',
    apiKey: '',
    galaxyDomain: '',
  })

  const databaseTypes = [
    { id: 'postgresql', name: 'PostgreSQL', icon: Database },
    { id: 'mysql', name: 'MySQL', icon: Database },
    { id: 'trino', name: 'Trino', icon: Server },
    { id: 'spark', name: 'Spark SQL', icon: Server },
  ]

  const fetchConnections = useCallback(async () => {
    try {
      if (!user?._id) return;

      const response = await databaseAPI.getConnections();
      
      if (response.sucess) {
        const decryptedConnections = response.data.connections.map(conn => {
          try {
            const decryptedData = decryptData(conn.connectionData, user._id);
            const connectionData = typeof decryptedData === 'string' 
              ? JSON.parse(decryptedData) 
              : decryptedData;

            return {
              ...connectionData,
              id: conn._id,
              status: conn.status,
              lastConnected: conn.lastConnected
            };
          } catch (error) {
            console.error('Failed to decrypt connection:', error);
            return null;
          }
        }).filter(Boolean);

        dispatch(setActiveConnection(decryptedConnections));
      } else {
        showError(response.message || 'Failed to fetch connections');
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      showError(error.message || 'Failed to load connections');
    }
  }, [dispatch, user, showError]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleTestConnection = async (id) => {
    setIsLoading(true)
    setTestStatus(null)
    const connection = connections.find(conn => conn.id === id) || formData
    try {
      const encryptedData = encryptData({
        ...connection,
        password: connection.password
      }, user._id);

      const response = await databaseAPI.testConnection(encryptedData);
      
      if (response.success) {
        setTestStatus({
          success: true,
          message: 'Connection tested successfully!'
        });
        showSuccess('Connection tested successfully!');
      }
    } catch (error) {
      setTestStatus({
        success: false,
        message: error.message || 'Failed to test connection'
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConnection = async (id) => {
    try {
      const response = await databaseAPI.deleteConnection(id);
      if (response.sucess) {
        dispatch(removeConnection(id));
        setIsDeleteModalOpen(false);
        showSuccess('Connection deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
      dispatch(setError(error.message || 'Failed to delete connection'));
      showError('Failed to delete connection');
    }
  }

  const handleAddConnection = async (e) => {
    e.preventDefault()
    if (!user?._id) {
      showError('User not authenticated. Please log in again.');
      return;
    }

    const requiredFields = formData.type === 'trino' 
      ? ['name', 'galaxyDomain', 'clientId', 'apiKey']
      : ['name', 'host', 'port', 'database', 'username', 'password'];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.name) {
      dispatch(setConnecting(true))
      dispatch(clearError())

      try {
        const dataToEncrypt = {
          name: formData.name,
          type: formData.type,
          ...(formData.type === 'trino' 
            ? { 
                host: formData.galaxyDomain,
                clientId: formData.clientId, 
                apiKey: formData.apiKey 
              }
            : { 
                host: formData.host,
                port: formData.port,
                database: formData.database,
                username: formData.username,
                password: formData.password,
                ssl: formData.ssl 
              }
          )
        };
        
        const encryptedData = encryptData(dataToEncrypt, user._id);
        const response = await databaseAPI.createConnection(encryptedData);

        if (response.sucess) {
          const newConnection = {
            ...formData,
            id: Date.now().toString(),
            status: 'connected',
            lastConnected: new Date().toISOString()
          };
          
          dispatch(addConnection(newConnection));
          setFormData({
            name: '',
            type: 'postgresql',
            host: '',
            port: '',
            database: '',
            username: '',
            password: '',
            ssl: false,
            clientId: '',
            apiKey: '',
            galaxyDomain: '',
          });
          setIsAddModalOpen(false);
          showSuccess('Connection added successfully!');
          await fetchConnections();
        } else {
          throw new Error(response.message || 'Failed to add connection');
        }
      } catch (error) {
        console.error('Error adding connection:', error);
        dispatch(setError(error.message || 'Failed to connect to database'));
        showError(error.message || 'Failed to add connection');
      } finally {
        dispatch(setConnecting(false));
      }
    } else {
      showError('Please fill in all required fields');
    }
  }

  const handleEditConnection = async (e) => {
    e.preventDefault()
    try {
      const encryptedData = encryptData({
        ...formData,
        password: formData.password || undefined
      }, user._id);

      const response = await databaseAPI.updateConnection(selectedConnection.id, encryptedData);
      if (response.sucess) {
        const updatedConnection = {
          ...formData,
          id: selectedConnection.id,
          status: selectedConnection.status,
          lastConnected: selectedConnection.lastConnected
        };
        const updatedConnections = connections.map(conn =>
          conn.id === selectedConnection.id ? updatedConnection : conn
        );
        dispatch(setActiveConnection(updatedConnections));
        setIsEditModalOpen(false);
        showSuccess('Connection updated successfully!');
      }
    } catch (error) {
      console.error('Error updating connection:', error);
      dispatch(setError(error.message || 'Failed to update connection'));
      showError('Failed to update connection');
    }
  }

  const openEditModal = (connection) => {
    setSelectedConnection(connection)
    setFormData({
      name: connection.name,
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: '', // Don't show existing password
      ssl: connection.ssl || false
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (connection) => {
    setSelectedConnection(connection)
    setIsDeleteModalOpen(true)
  }

  const openViewDetails = async (connection) => {
    try {
      if (connection) {
        setSelectedConnection(connection);
        setIsViewDetailsOpen(true);
        return;
      }

      const response = await databaseAPI.getConnectionDetails(connection.id);
      if (response.sucess) {
        try {
          const decryptedData = decryptData(response.data.connectionData, user._id);
          const connectionData = typeof decryptedData === 'string' 
            ? JSON.parse(decryptedData) 
            : decryptedData;
            
          setSelectedConnection({
            ...connectionData,
            id: response.data._id,
            status: response.data.status,
            lastConnected: response.data.lastConnected
          });
          setIsViewDetailsOpen(true);
        } catch (decryptError) {
          console.error('Decryption error:', decryptError);
          showError('Failed to decrypt connection details');
        }
      }
    } catch (error) {
      console.error('Error loading connection details:', error);
      showError('Failed to load connection details');
    }
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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">Database Connections</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage and monitor your database connections</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Connection</span>
              </button>
            </div>

            {/* Connection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {connections.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
                  <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                    <DatabaseBackup className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Connections Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    Get started by adding your first database connection.
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Your First Connection</span>
                  </button>
                </div>
              ) : (
                connections.map((connection) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 transition-all hover:border-blue-500 dark:hover:border-[#00E5FF] group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Database className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{connection.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{connection.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {connection.status === 'connected' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Host: </span>
                        {connection.host}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Database: </span>
                        {connection.database}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Last Connected: </span>
                        {connection.lastConnected}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestConnection(connection.id)}
                          disabled={isLoading}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => openEditModal(connection)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(connection)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => openViewDetails(connection)}
                        className="flex items-center space-x-1 text-sm text-primary hover:text-primary/90 transition-colors"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Connection Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-200/50 dark:border-gray-800/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">New Database Connection</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                  placeholder="My Database"
                  required
                />
              </div>

              {/* Database Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Database Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      type: e.target.value,
                      clientId: '',
                      apiKey: '',
                      galaxyDomain: '',
                    })
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                >
                  {databaseTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Conditional Fields based on Database Type */}
              {formData.type === 'trino' ? (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-500">
                      Please enter your Starburst Galaxy credentials below. You can find these in your Starburst Galaxy account settings.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Galaxy Domain</label>
                    <input
                      type="text"
                      value={formData.galaxyDomain}
                      onChange={(e) => setFormData({ ...formData, galaxyDomain: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                      placeholder="e.g., galaxy.starburstdata.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Client ID</label>
                    <input
                      type="text"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                      placeholder="Enter your Starburst Galaxy Client ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                      placeholder="Enter your Starburst Galaxy API Key"
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Host & Port */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Host</label>
                      <input
                        type="text"
                        value={formData.host}
                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                        placeholder="localhost"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Port</label>
                      <input
                        type="text"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                        placeholder="5432"
                        required
                      />
                    </div>
                  </div>

                  {/* Database Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Database Name</label>
                    <input
                      type="text"
                      value={formData.database}
                      onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                      placeholder="mydatabase"
                      required
                    />
                  </div>

                  {/* Username & Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                        placeholder="username"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] outline-none transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SSL Toggle - Only show for non-Trino connections */}
              {formData.type !== 'trino' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ssl"
                    checked={formData.ssl}
                    onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ssl" className="text-sm font-medium">
                    Use SSL Connection
                  </label>
                </div>
              )}

              {/* Test Connection Status */}
              {testStatus && (
                <div className={`p-4 rounded-lg border ${
                  testStatus.success 
                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testStatus.success ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span>{testStatus.message}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => handleTestConnection(Date.now())}
                  disabled={isConnecting || (
                    formData.type === 'trino' 
                      ? !formData.galaxyDomain || !formData.clientId || !formData.apiKey
                      : !formData.host || !formData.port || !formData.database || !formData.username || !formData.password
                  )}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Test Connection</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleAddConnection}
                  disabled={isConnecting || (
                    formData.type === 'trino'
                      ? !formData.name || !formData.galaxyDomain || !formData.clientId || !formData.apiKey
                      : !formData.name || !formData.host || !formData.port || !formData.database || !formData.username || !formData.password
                  )}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Connection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Connection Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Connection</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditConnection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                >
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="MySQL">MySQL</option>
                  <option value="SQLite">SQLite</option>
                  <option value="MongoDB">MongoDB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Host</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Port</label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Database Name</label>
                <input
                  type="text"
                  value={formData.database}
                  onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 rounded-lg border border-border bg-background"
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-gray-200/50 dark:border-gray-800/50">
            <h2 className="text-xl font-semibold mb-4">Delete Connection</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete the connection "{selectedConnection?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConnection(selectedConnection?.id)}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewDetailsOpen && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Connection Details</h2>
              <button
                onClick={() => {
                  setIsViewDetailsOpen(false);
                  setSelectedConnection(null);
                }}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                <div className="flex items-center space-x-2">
                  {selectedConnection.status === 'connected' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-destructive" />
                      <span>Disconnected</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                <p className="text-gray-900 dark:text-white">{selectedConnection.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                <p className="text-gray-900 dark:text-white">{selectedConnection.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Host</label>
                <p className="text-gray-900 dark:text-white">{selectedConnection.host}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Port</label>
                <p className="text-gray-900 dark:text-white">{selectedConnection.port}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Database</label>
                <p className="text-gray-900 dark:text-white">{selectedConnection.database}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
                <p className="text-gray-900 dark:text-white">{selectedConnection.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Last Connected</label>
                <p className="text-gray-900 dark:text-white">
                  {selectedConnection.lastConnected ? new Date(selectedConnection.lastConnected).toLocaleString() : 'Never'}
                </p>
              </div>
              {selectedConnection.ssl && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">SSL</label>
                  <p className="text-gray-900 dark:text-white">Enabled</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsViewDetailsOpen(false);
                  setSelectedConnection(null);
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default ManageDatabases 