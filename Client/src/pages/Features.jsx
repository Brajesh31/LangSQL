import { motion } from 'framer-motion'
import { Cloud, Database, Code, Zap, Shield, Clock, BarChart, Cpu } from 'lucide-react'
import LandingNavbar from '../components/layout/LandingNavbar'
import { useSelector } from 'react-redux'

const Features = () => {
  const { isDark } = useSelector((state) => state.theme)

  const features = [
    {
      icon: Cloud,
      title: 'AI-Powered SQL Generation',
      description: 'Convert natural language into accurate, optimized SQL queries with our advanced AI technology.',
      details: [
        'Natural language processing',
        'Context-aware query generation',
        'Query optimization suggestions',
        'Multiple SQL dialect support'
      ]
    },
    {
      icon: Database,
      title: 'Schema Design Assistant',
      description: 'Let AI help you design and optimize your database schemas with best practices.',
      details: [
        'Automated schema suggestions',
        'Relationship visualization',
        'Performance optimization tips',
        'Schema migration assistance'
      ]
    },
    {
      icon: Code,
      title: 'Multi-Dialect Support',
      description: 'Support for all major SQL dialects including PostgreSQL, MySQL, SQLite, and more.',
      details: [
        'PostgreSQL support',
        'MySQL compatibility',
        'SQLite integration',
        'Custom dialect support'
      ]
    },
    {
      icon: Zap,
      title: 'Query Optimization',
      description: 'Get AI-powered suggestions to optimize your SQL queries for better performance.',
      details: [
        'Performance analysis',
        'Index recommendations',
        'Query rewriting',
        'Execution plan optimization'
      ]
    },
    {
      icon: Shield,
      title: 'Security Features',
      description: 'Built-in security features to protect your database operations.',
      details: [
        'SQL injection prevention',
        'Access control management',
        'Audit logging',
        'Data encryption'
      ]
    },
    {
      icon: Clock,
      title: 'Real-time Collaboration',
      description: 'Work together with your team in real-time on database operations.',
      details: [
        'Shared workspaces',
        'Live query editing',
        'Team permissions',
        'Activity tracking'
      ]
    },
    {
      icon: BarChart,
      title: 'Analytics Dashboard',
      description: 'Visualize your database performance and usage patterns.',
      details: [
        'Query performance metrics',
        'Resource utilization',
        'Usage patterns',
        'Custom reports'
      ]
    },
    {
      icon: Cpu,
      title: 'Advanced AI Features',
      description: 'Leverage advanced AI capabilities for database management.',
      details: [
        'Query intent understanding',
        'Schema recommendations',
        'Performance predictions',
        'Anomaly detection'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113] text-gray-900 dark:text-white transition-all">
      <LandingNavbar />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-[#00E5FF]/10 backdrop-blur-sm border border-blue-500/20 dark:border-[#00E5FF]/20 shadow-xl"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                ✨ Powerful Features
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            >
              Everything You Need for<br />Modern SQL Development
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Discover the comprehensive set of features that make LangSQL the ultimate SQL development platform.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#00E5FF]/10 border border-blue-500/20 dark:border-[#00E5FF]/20 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-blue-500 dark:text-[#00E5FF]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-[#00E5FF] mr-2" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features 