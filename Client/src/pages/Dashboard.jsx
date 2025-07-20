import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Code2,
  Database,
  Table,
  Languages,
  CheckCircle,
  XCircle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  History,
  ArrowRight,
  FileCode,
  Cpu,
  MessageSquare,
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useToast } from '../contexts/ToastContext'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const { showError } = useToast()
  const { isDark } = useSelector((state) => state.theme)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setStats({
          schemasGenerated: {
            value: 156,
            trend: 'up',
            percentage: 15.5,
            icon: Database,
          },
          queriesTranslated: {
            value: 892,
            trend: 'up',
            percentage: 12.1,
            icon: Languages,
          },
          executionSuccess: {
            value: '98.2%',
            trend: 'up',
            percentage: 2.1,
            icon: CheckCircle,
          },
          avgOptimization: {
            value: '45%',
            trend: 'up',
            percentage: 8.4,
            icon: Zap,
          },
        })

        setRecentActivity([
          {
            id: 1,
            type: 'schema',
            status: 'success',
            title: 'E-commerce Schema Generated',
            description: 'Optimized schema with partitioning for order analytics',
            timestamp: '2 minutes ago',
            tables: 8,
            dialect: 'Trino',
            optimizations: ['Partitioning', 'Clustering'],
          },
          {
            id: 2,
            type: 'query',
            status: 'success',
            title: 'Complex Query Translated',
            description: 'Natural language to SparkSQL with window functions',
            timestamp: '15 minutes ago',
            dialect: 'Spark SQL',
            optimizations: ['Window Functions', 'Predicate Pushdown'],
          },
          {
            id: 3,
            type: 'feedback',
            status: 'success',
            title: 'Schema Optimization Feedback',
            description: 'Incorporated user feedback for better partitioning strategy',
            timestamp: '1 hour ago',
            improvement: 'Storage optimization',
            impact: '+25% query performance',
          },
        ])

        setIsLoading(false)
      } catch (error) {
        showError('Failed to fetch dashboard data')
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [showError])

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'schema':
        return <Database className="w-8 h-8 text-blue-500 dark:text-[#00E5FF]" />
      case 'query':
        return <Languages className="w-8 h-8 text-emerald-500" />
      case 'feedback':
        return <MessageSquare className="w-8 h-8 text-purple-500" />
      default:
        return <History className="w-8 h-8 text-blue-500 dark:text-[#00E5FF]" />
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113] text-gray-900 dark:text-white p-6 transition-all relative">
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 dark:border-[#00E5FF] border-t-transparent rounded-full"
            />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113] text-gray-900 dark:text-white p-6 transition-all duration-300 ease-in-out">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="max-w-[1600px] mx-auto space-y-8"
        >
          {/* Main Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <Link
              to="/schema-generator"
              className="group block p-8 bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Schema Generator
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Generate optimized database schemas from natural language descriptions. Supports both Trino and Spark SQL dialects.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Storage-optimized schema design
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Automatic partitioning strategies
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      DDL generation with best practices
                    </li>
                  </ul>
                </div>
              </div>
            </Link>

            <Link
              to="/query-builder"
              className="group block p-8 bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Code2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Query Assistant
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Translate natural language to optimized SQL queries. Full support for Trino and Spark SQL syntax.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Smart query completion
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Performance optimization
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Dialect-specific functions
                    </li>
                  </ul>
                </div>
              </div>
            </Link>

            <Link
              to="/manage-databases"
              className="group block p-8 bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Database Manager
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Manage your database connections and monitor their status. Add, edit, or remove database connections.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Connection management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Status monitoring
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Secure credentials
                    </li>
                  </ul>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Object.entries(stats).map(([key, stat], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all group relative overflow-hidden"
              >
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#00E5FF]/10 border border-blue-500/20 dark:border-[#00E5FF]/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                      <stat.icon className="w-6 h-6 text-blue-500 dark:text-[#00E5FF]" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 group-hover:translate-x-2 transition-transform">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:translate-x-2 transition-transform">
                    {stat.value}
                  </h3>
                  <div className="flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-medium ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Recent Activity & Feedback
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your latest operations and improvements
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#00E5FF]/10 border border-blue-500/20 dark:border-[#00E5FF]/20">
                <History className="w-6 h-6 text-blue-500 dark:text-[#00E5FF]" />
              </div>
            </div>

            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start space-x-4 p-6 rounded-xl bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all group relative overflow-hidden"
                >
                  <div className="relative">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#00E5FF]/10 border border-blue-500/20 dark:border-[#00E5FF]/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                      {getActivityIcon(activity.type, activity.status)}
                    </div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:translate-x-2 transition-transform">
                        {activity.title}
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:translate-x-2 transition-transform">
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 group-hover:translate-x-2 transition-transform">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm group-hover:translate-x-2 transition-transform">
                      {activity.dialect && (
                        <span className="flex items-center text-gray-600 dark:text-gray-400">
                          <Cpu className="w-4 h-4 mr-1.5" />
                          {activity.dialect}
                        </span>
                      )}
                      {activity.tables && (
                        <span className="flex items-center text-gray-600 dark:text-gray-400">
                          <Table className="w-4 h-4 mr-1.5" />
                          {activity.tables} tables
                        </span>
                      )}
                      {activity.optimizations && (
                        <span className="flex items-center text-gray-600 dark:text-gray-400">
                          <Zap className="w-4 h-4 mr-1.5" />
                          {activity.optimizations.join(', ')}
                        </span>
                      )}
                      {activity.improvement && (
                        <span className="flex items-center text-gray-600 dark:text-gray-400">
                          <ArrowUpRight className="w-4 h-4 mr-1.5" />
                          {activity.improvement}
                        </span>
                      )}
                      {activity.impact && (
                        <span className="flex items-center text-emerald-500">
                          <Zap className="w-4 h-4 mr-1.5" />
                          {activity.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard 