import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Save, Copy, Download, History, Database, Table, Clock } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useToast } from '../contexts/ToastContext'
import { useSelector } from 'react-redux'

const Execution = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState('default')
  const { showSuccess, showError } = useToast()
  const { isDark } = useSelector((state) => state.theme)

  const connections = [
    { id: 'default', name: 'Local PostgreSQL' },
    { id: 'prod', name: 'Production Database' },
    { id: 'staging', name: 'Staging Database' },
  ]

  const handleExecute = async () => {
    if (!query.trim()) {
      showError('Please enter a SQL query to execute')
      return
    }
    setIsLoading(true)
    // Simulated API call
    setTimeout(() => {
      setResults({
        data: [
          { id: 1, username: 'john_doe', email: 'john@example.com', created_at: '2024-03-14' },
          { id: 2, username: 'jane_smith', email: 'jane@example.com', created_at: '2024-03-14' },
        ],
        metadata: {
          rowCount: 2,
          executionTime: '0.123s',
          affectedRows: 2,
        },
      })
      setIsLoading(false)
      showSuccess('Query executed successfully!')
    }, 1500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(query)
    showSuccess('Query copied to clipboard!')
  }

  const handleSave = () => {
    // Implement save functionality
    showSuccess('Query saved successfully!')
  }

  const handleDownload = () => {
    if (!results) return
    const csv = [
      Object.keys(results.data[0]).join(','),
      ...results.data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const element = document.createElement('a')
    const file = new Blob([csv], { type: 'text/csv' })
    element.href = URL.createObjectURL(file)
    element.download = 'query_results.csv'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    showSuccess('Results downloaded successfully!')
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Query Execution</h1>
            <p className="text-gray-600 dark:text-gray-400">Execute SQL queries and analyze results</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 transition-all"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">SQL Query</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Write your SQL query to execute
                  </p>
                </div>
                <select
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] transition-colors"
                >
                  {connections.map((conn) => (
                    <option key={conn.id} value={conn.id}>
                      {conn.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-48 p-4 rounded-lg bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#00E5FF] resize-none font-mono transition-colors"
                  placeholder="Enter your SQL query here..."
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Save query"
                  >
                    <Save className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-500 dark:bg-[#00E5FF] text-white dark:text-black font-medium hover:bg-blue-600 dark:hover:bg-[#00E5FF]/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    'Executing...'
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Query
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Results Section */}
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Query Results</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {results.metadata.executionTime}
                      </div>
                      <div className="flex items-center">
                        <Table className="w-4 h-4 mr-1" />
                        {results.metadata.rowCount} rows
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        {Object.keys(results.data[0]).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.data.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#0A0A0B] transition-colors"
                        >
                          {Object.values(row).map((value, j) => (
                            <td
                              key={j}
                              className="px-4 py-2 text-sm whitespace-nowrap"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>

          {/* History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Recent Queries</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your execution history</p>
              </div>
              <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-4 rounded-lg bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Select Users Query</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">30 mins ago</span>
                  </div>
                  <pre className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    SELECT * FROM users WHERE active = true;
                  </pre>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      0.123s
                    </span>
                    <span className="flex items-center">
                      <Table className="w-3 h-3 mr-1" />
                      100 rows
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default Execution 