import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Database,
  Code2,
  MessageSquare,
  Zap,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { completeTutorial, skipTutorial, setCurrentStep } from '../../redux/slices/onboardingSlice'
import { updateUserProfile } from '../../redux/slices/authSlice'
import { authAPI } from '../../services/axios.api'

const Tutorial = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentStep = useSelector((state) => state.onboarding.currentStep)
  const [isSkipLoading, setIsSkipLoading] = useState(false)
  const [isCompleteLoading, setIsCompleteLoading] = useState(false)

  const steps = [
    {
      title: 'Welcome to LangSQL',
      description: 'Your AI-powered SQL assistant for smarter database management',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            LangSQL helps you with:
          </p>
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Database className="w-5 h-5 text-blue-500" />
              </div>
              <span>Database schema design and optimization</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Code2 className="w-5 h-5 text-emerald-500" />
              </div>
              <span>Natural language to SQL translation</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </div>
              <span>Interactive query assistance</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <span>Performance optimization suggestions</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Connect Your Database',
      description: 'Set up your database connections just like in DBeaver',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            LangSQL supports multiple database types:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/50 dark:bg-[#111113]/50 border border-gray-200/50 dark:border-gray-800/50">
              <h4 className="font-medium mb-2">PostgreSQL</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full support for PostgreSQL features and extensions
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/50 dark:bg-[#111113]/50 border border-gray-200/50 dark:border-gray-800/50">
              <h4 className="font-medium mb-2">MySQL</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete MySQL dialect and optimization support
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/50 dark:bg-[#111113]/50 border border-gray-200/50 dark:border-gray-800/50">
              <h4 className="font-medium mb-2">Trino</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced distributed query processing
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/50 dark:bg-[#111113]/50 border border-gray-200/50 dark:border-gray-800/50">
              <h4 className="font-medium mb-2">Spark SQL</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Big data processing and analytics
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Schema Design & Visualization',
      description: 'Design and visualize your database schemas with AI assistance',
      icon: Code2,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Use natural language to describe your requirements:
          </p>
          <div className="p-4 rounded-xl bg-white/50 dark:bg-[#111113]/50 border border-gray-200/50 dark:border-gray-800/50">
            <p className="text-sm italic">
              "Create a schema for an e-commerce platform with products, orders, and customers..."
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            LangSQL will generate:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Optimized table structures</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Proper relationships and constraints</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Indexing recommendations</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Partitioning strategies</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Natural Language Queries',
      description: 'Convert plain English to optimized SQL queries',
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Simply describe what you want to query:
          </p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/50 dark:bg-[#111113]/50 border border-gray-200/50 dark:border-gray-800/50">
              <p className="text-sm italic">
                "Show me the top 10 customers by order value in the last month"
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-[#00E5FF]/10 border border-blue-500/20 dark:border-[#00E5FF]/20">
              <pre className="text-sm overflow-x-auto">
                <code>
                  SELECT c.customer_name,{'\n'}
                         SUM(o.total_amount) as total_value{'\n'}
                  FROM customers c{'\n'}
                  JOIN orders o ON c.id = o.customer_id{'\n'}
                  WHERE o.order_date {'>='}  DATE_SUB(NOW(), INTERVAL 1 MONTH){'\n'}
                  GROUP BY c.customer_name{'\n'}
                  ORDER BY total_value DESC{'\n'}
                  LIMIT 10;
                </code>
              </pre>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const handleSkip = async () => {
    setIsSkipLoading(true)
    try {
      const response = await authAPI.completeTutorial()
      if (response.data.success === true) {
        dispatch(skipTutorial())
        dispatch(updateUserProfile({ isTutorialCompleted: true }))
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Failed to skip tutorial:', error)
    } finally {
      setIsSkipLoading(false)
    }
  }

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      setIsCompleteLoading(true)
      try {
        const response = await authAPI.completeTutorial()
        if (response.data.success === true) {
          dispatch(completeTutorial())
          dispatch(updateUserProfile({ isTutorialCompleted: true }))
          navigate('/dashboard')
        }
      } catch (error) {
        console.error('Failed to complete tutorial:', error)
      } finally {
        setIsCompleteLoading(false)
      }
    } else {
      dispatch(setCurrentStep(currentStep + 1))
    }
  }

  const handlePrevious = () => {
    dispatch(setCurrentStep(currentStep - 1))
  }

  const StepIcon = steps[currentStep].icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#00E5FF]/10 border border-blue-500/20 dark:border-[#00E5FF]/20">
              <StepIcon className="w-6 h-6 text-blue-500 dark:text-[#00E5FF]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            disabled={isSkipLoading}
            className="flex items-center space-x-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm">Skip tutorial</span>
            {isSkipLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-8"
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => dispatch(setCurrentStep(index))}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    currentStep === index
                      ? 'bg-blue-500 dark:bg-[#00E5FF] w-4'
                      : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={isCompleteLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 dark:bg-[#00E5FF] text-white dark:text-black rounded-lg hover:bg-blue-600 dark:hover:bg-[#00E5FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentStep === steps.length - 1 && isCompleteLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Tutorial 