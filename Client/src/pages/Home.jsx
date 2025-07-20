import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Database,
  Code,
  Languages,
  Play,
  ArrowRight,
  Clock,
  Activity,
  Users,
} from 'lucide-react'

const Home = () => {
  const { stats } = useSelector((state) => state.stats)

  const quickActions = [
    {
      name: 'Schema Generator',
      description: 'Generate database schemas from natural language descriptions',
      href: '/schema-generator',
      icon: Database,
      color: 'bg-blue-500',
    },
    {
      name: 'Query Builder',
      description: 'Build complex SQL queries with an intuitive interface',
      href: '/query-builder',
      icon: Code,
      color: 'bg-green-500',
    },
    {
      name: 'Query Translation',
      description: 'Translate between different SQL dialects',
      href: '/query-translation',
      icon: Languages,
      color: 'bg-purple-500',
    },
    {
      name: 'Execution',
      description: 'Execute and analyze SQL queries',
      href: '/execution',
      icon: Play,
      color: 'bg-orange-500',
    },
  ]

  const statsData = [
    {
      name: 'Queries Generated',
      value: stats.queriesGenerated || '0',
      icon: Code,
      color: 'text-blue-500',
    },
    {
      name: 'Schemas Created',
      value: stats.schemasGenerated || '0',
      icon: Database,
      color: 'text-green-500',
    },
    {
      name: 'Translations',
      value: stats.translationsCompleted || '0',
      icon: Languages,
      color: 'text-purple-500',
    },
    {
      name: 'Executions',
      value: stats.queriesExecuted || '0',
      icon: Play,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's what's happening with your SQL projects today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full ${stat.color} bg-opacity-10`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div
                  className={`p-3 rounded-full ${action.color} bg-opacity-10`}
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-gray-900/10 dark:ring-white/10 group-hover:ring-primary/50 dark:group-hover:ring-primary/50" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <Link
            to="/activity"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            View all
          </Link>
        </div>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            <span>No recent activity</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 