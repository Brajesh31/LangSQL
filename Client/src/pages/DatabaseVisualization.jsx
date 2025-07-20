import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Database, Table, Users, Activity } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Chart defaults
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
    },
  },
}

// Function to generate random number within a range
const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
}

// Generate random integer within a range
const randomIntInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DatabaseVisualization = () => {
  const [selectedDatabase, setSelectedDatabase] = useState('')
  const [timeRange, setTimeRange] = useState('7d')
  const [randomData, setRandomData] = useState(null)
  const [stats, setStats] = useState({
    tables: 0,
    rows: 0,
    connections: 0,
    queriesPerSec: 0
  })

  // Generate random data on component mount
  useEffect(() => {
    generateRandomData()
  }, [])

  // Function to generate all random data
  const generateRandomData = () => {
    // Random stats
    setStats({
      tables: randomIntInRange(8, 20),
      rows: randomIntInRange(15, 50) * 1000,
      connections: randomIntInRange(20, 80),
      queriesPerSec: randomIntInRange(90, 300)
    })

    // Generate random data for all charts
    const queryPerformanceData = generateQueryPerformanceData()
    const resourceUtilizationData = generateResourceUtilizationData()
    const queryExecutionFlowData = generateQueryExecutionFlowData()
    const indexEfficiencyData = generateIndexEfficiencyData()
    const lockWaitData = generateLockWaitData()

    setRandomData({
      queryPerformanceData,
      resourceUtilizationData,
      queryExecutionFlowData,
      indexEfficiencyData,
      lockWaitData
    })
  }

  // Generate random data for Query Performance Heatmap
  const generateQueryPerformanceData = () => {
    return {
      labels: ['12am', '4am', '8am', '12pm', '4pm', '8pm'],
      datasets: [
        {
          label: 'SELECT',
          data: Array(6).fill().map(() => randomInRange(0.3, 3.0).toFixed(1)),
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value > 2 ? 'rgba(221, 11, 11, 0.7)' : 
                  value > 1.5 ? 'rgba(232, 228, 5, 0.7)' : 
                  value > 1 ? 'rgba(59, 130, 246, 0.7)' : 
                  'rgba(23, 113, 83, 0.7)';
          },
          borderWidth: 1,
          borderColor: '#fff',
        },
        {
          label: 'INSERT',
          data: Array(6).fill().map(() => randomInRange(0.2, 2.0).toFixed(1)),
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value > 2 ? 'rgba(175, 7, 7, 0.7)' : 
                  value > 1.5 ? 'rgba(210, 222, 40, 0.7)' : 
                  value > 1 ? 'rgba(102, 155, 239, 0.7)' : 
                  'rgba(27, 143, 104, 0.7)';
          },
          borderWidth: 1,
          borderColor: '#fff',
        },
        {
          label: 'UPDATE',
          data: Array(6).fill().map(() => randomInRange(0.3, 1.8).toFixed(1)),
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value > 2 ? 'rgba(239, 68, 68, 0.7)' : 
                  value > 1.5 ? 'rgba(245, 158, 11, 0.7)' : 
                  value > 1 ? 'rgba(59, 130, 246, 0.7)' : 
                  'rgba(16, 185, 129, 0.7)';
          },
          borderWidth: 1,
          borderColor: '#fff',
        },
        {
          label: 'DELETE',
          data: Array(6).fill().map(() => randomInRange(0.1, 1.2).toFixed(1)),
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex];
            return value > 2 ? 'rgba(239, 68, 68, 0.7)' : 
                  value > 1.5 ? 'rgba(245, 158, 11, 0.7)' : 
                  value > 1 ? 'rgba(59, 130, 246, 0.7)' : 
                  'rgba(16, 185, 129, 0.7)';
          },
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    }
  }

  // Generate random data for Resource Utilization Stacked Chart
  const generateResourceUtilizationData = () => {
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'CPU',
          data: Array(7).fill().map(() => randomIntInRange(15, 60)),
          backgroundColor: 'rgba(161, 3, 87, 0.6)',
        },
        {
          label: 'Memory',
          data: Array(7).fill().map(() => randomIntInRange(15, 50)),
          backgroundColor: 'rgba(216, 54, 146, 0.6)',
        },
        {
          label: 'Disk I/O',
          data: Array(7).fill().map(() => randomIntInRange(5, 30)),
          backgroundColor: 'rgba(215, 123, 177, 0.6)',
        },
        {
          label: 'Network',
          data: Array(7).fill().map(() => randomIntInRange(5, 25)),
          backgroundColor: 'rgba(237, 184, 218, 0.6)',
        },
      ],
    }
  }

  // Generate random data for Query Execution Flow
  const generateQueryExecutionFlowData = () => {
    return {
      labels: ['Parse', 'Plan', 'Execute', 'Fetch', 'Return'],
      datasets: [
        {
          label: 'Average time (ms)',
          data: [
            randomInRange(0.2, 0.8).toFixed(1),
            randomInRange(0.8, 1.5).toFixed(1),
            randomInRange(2.5, 5.0).toFixed(1),
            randomInRange(1.0, 3.0).toFixed(1),
            randomInRange(0.2, 0.6).toFixed(1)
          ],
          backgroundColor: [
            'rgba(25, 81, 171, 0.6)',
            'rgba(45, 181, 32, 0.6)',
            'rgba(192, 125, 10, 0.6)',
            'rgba(77, 30, 186, 0.6)',
            'rgba(185, 45, 115, 0.6)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)',
            'rgb(236, 72, 153)',
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Generate random data for Index Efficiency Bubble Chart
  const generateIndexEfficiencyData = () => {
    return {
      datasets: [
        {
          label: 'Primary Indexes',
          data: [
            { x: randomIntInRange(80, 100), y: randomInRange(7.0, 9.5), r: randomIntInRange(12, 18) },
            { x: randomIntInRange(75, 95), y: randomInRange(5.5, 7.0), r: randomIntInRange(10, 14) },
            { x: randomIntInRange(65, 85), y: randomInRange(4.0, 5.5), r: randomIntInRange(8, 12) },
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
        },
        {
          label: 'Secondary Indexes',
          data: [
            { x: randomIntInRange(55, 75), y: randomInRange(3.0, 4.5), r: randomIntInRange(7, 10) },
            { x: randomIntInRange(45, 65), y: randomInRange(2.0, 3.5), r: randomIntInRange(5, 8) },
            { x: randomIntInRange(35, 55), y: randomInRange(1.0, 2.0), r: randomIntInRange(3, 6) },
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgb(16, 185, 129)',
        },
        {
          label: 'Custom Indexes',
          data: [
            { x: randomIntInRange(60, 80), y: randomInRange(3.5, 5.0), r: randomIntInRange(8, 11) },
            { x: randomIntInRange(30, 50), y: randomInRange(1.0, 2.5), r: randomIntInRange(3, 6) },
          ],
          backgroundColor: 'rgba(245, 158, 11, 0.6)',
          borderColor: 'rgb(245, 158, 11)',
        },
      ],
    }
  }

  // Generate random data for Lock Wait Analysis
  const generateLockWaitData = () => {
    // Generate 5 random values that sum to 100
    let values = Array(5).fill().map(() => randomIntInRange(5, 40));
    const sum = values.reduce((a, b) => a + b, 0);
    values = values.map(v => Math.round(v / sum * 100));
    
    // Ensure the values sum to 100
    const diff = 100 - values.reduce((a, b) => a + b, 0);
    values[0] += diff;
    
    return {
      labels: ['Users', 'Orders', 'Products', 'Categories', 'Inventory'],
      datasets: [
        {
          data: values,
          backgroundColor: [
            'rgba(21, 46, 137, 0.6)',
            'rgba(19, 183, 55, 0.6)', 
            'rgba(255, 166, 12, 0.89)',
            'rgba(246, 16, 0, 0.6)',
            'rgba(139, 92, 246, 0.6)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
          ],
          borderWidth: 1,
          hoverOffset: 15,
        }
      ],
    }
  }

  // Query Performance Heatmap Options
  const queryPerformanceOptions = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      title: {
        display: true,
        text: '📊 Query Performance Heatmap',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}ms execution time`;
          }
        }
      },
      legend: {
        position: 'left',
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time of Day',
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Query Type',
        },
        grid: {
          display: false,
        },
      },
    },
  }

  // Resource Utilization Options
  const resourceUtilizationOptions = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      title: {
        display: true,
        text: '📉 Resource Utilization',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        max: 100,
        title: {
          display: true,
          text: 'Utilization (%)',
        },
      },
    },
  }

  // Query Execution Flow Options
  const queryExecutionFlowOptions = {
    ...chartDefaults,
    indexAxis: 'y',
    plugins: {
      ...chartDefaults.plugins,
      title: {
        display: true,
        text: '🔀 Query Execution Flow',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.raw}ms`;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (ms)',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  }

  // Index Efficiency Options
  const indexEfficiencyOptions = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      title: {
        display: true,
        text: '🔵 Index Efficiency Analysis',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return [
              `${context.dataset.label}`,
              `Usage: ${context.raw.x}%`,
              `Performance gain: ${context.raw.y}x`,
              `Size: ${context.raw.r * 10}MB`
            ];
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Usage (%)',
        },
        min: 0,
        max: 100,
      },
      y: {
        title: {
          display: true,
          text: 'Performance Gain (x times)',
        },
        min: 0,
        max: 10,
      },
    },
  }

  // Lock Wait Analysis Options
  const lockWaitOptions = {
    ...chartDefaults,
    cutout: '40%',
    plugins: {
      ...chartDefaults.plugins,
      title: {
        display: true,
        text: '🔄 Lock Wait Analysis',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const tables = ['Users', 'Orders', 'Products', 'Categories', 'Inventory'];
            const lockedBy = tables[(context.dataIndex + 2) % tables.length];
            return [
              `${context.label} Table`,
              `${context.raw}% of total lock time`,
              `Most blocked by: ${lockedBy}`
            ];
          }
        }
      },
    },
  }

  // Demo databases
  const databases = [
    { id: 1, name: 'Production DB', tables: randomIntInRange(10, 15), size: `${randomInRange(2.0, 3.5).toFixed(1)} GB`, connections: randomIntInRange(40, 60) },
    { id: 2, name: 'Analytics DB', tables: randomIntInRange(6, 10), size: `${randomInRange(1.5, 2.5).toFixed(1)} GB`, connections: randomIntInRange(25, 45) },
    { id: 3, name: 'Development DB', tables: randomIntInRange(4, 8), size: `${randomIntInRange(0.7, 1.2).toFixed(1)} GB`, connections: randomIntInRange(10, 20) },
  ]

  // Handle database change
  const handleDatabaseChange = (e) => {
    setSelectedDatabase(e.target.value)
    // Regenerate data when database changes
    generateRandomData()
  }

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value)
    // Regenerate data when time range changes
    generateRandomData()
  }

  // Format number with K for thousands
  const formatNumber = (num) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num
  }

  // If data is still loading
  if (!randomData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Database Visualization</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor and analyze your database performance (refreshes automatically)</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedDatabase}
                onChange={handleDatabaseChange}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] focus:border-transparent"
              >
                <option value="">Select Database</option>
                {databases.map((db) => (
                  <option key={db.id} value={db.id}>
                    {db.name}
                  </option>
                ))}
              </select>
              <select
                value={timeRange}
                onChange={handleTimeRangeChange}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#00E5FF] focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Database className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tables</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.tables}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <Table className="w-6 h-6 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Rows</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatNumber(stats.rows)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Users className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Connections</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.connections}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Activity className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Queries/sec</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.queriesPerSec}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Performance Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="h-80">
                <Bar options={queryPerformanceOptions} data={randomData.queryPerformanceData} />
              </div>
            </motion.div>

            {/* Resource Utilization Stacked Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="h-80">
                <Bar options={resourceUtilizationOptions} data={randomData.resourceUtilizationData} />
              </div>
            </motion.div>
          </div>

          {/* Additional Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Execution Flow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="h-80">
                <Bar options={queryExecutionFlowOptions} data={randomData.queryExecutionFlowData} />
              </div>
            </motion.div>

            {/* Index Efficiency Bubble Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
            >
              <div className="h-80">
                <Scatter options={indexEfficiencyOptions} data={randomData.indexEfficiencyData} />
              </div>
            </motion.div>
          </div>

          {/* Lock Wait Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
          >
            <div className="h-80 flex justify-center">
              <div className="w-full md:w-2/3 lg:w-1/2">
                <Doughnut options={lockWaitOptions} data={randomData.lockWaitData} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}


export default DatabaseVisualization

