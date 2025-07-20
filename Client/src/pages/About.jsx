import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Code2,
  Database,
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
  Globe,
  Shield,
} from 'lucide-react'
import LandingNavbar from '../components/layout/LandingNavbar'

const About = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  const features = [
    {
      name: 'AI-Powered SQL Generation',
      description: 'Generate complex SQL queries from natural language descriptions using advanced AI models.',
      icon: Code2,
    },
    {
      name: 'Schema Design',
      description: 'Create and optimize database schemas with intelligent suggestions and best practices.',
      icon: Database,
    },
    {
      name: 'Query Translation',
      description: 'Translate SQL queries between different database dialects automatically.',
      icon: Globe,
    },
    {
      name: 'Performance Analysis',
      description: 'Get detailed insights into query performance and optimization suggestions.',
      icon: Sparkles,
    },
  ]

  const faqs = [
    {
      question: 'What is LangSQL?',
      answer:
        'LangSQL is an AI-powered SQL development platform that helps developers write, optimize, and manage SQL queries more efficiently. It combines advanced AI models with best practices to streamline database development.',
    },
    {
      question: 'How does the AI query generation work?',
      answer:
        'Our AI models analyze your natural language description of what you want to achieve, understand the context and requirements, and generate appropriate SQL queries. The system considers best practices, performance implications, and database-specific features.',
    },
    {
      question: 'Which database systems are supported?',
      answer:
        'LangSQL supports major database systems including MySQL, PostgreSQL, SQLite, SQL Server, and Oracle. We continuously add support for more databases based on user demand.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes, we take security seriously. All queries and data are encrypted in transit and at rest. We never store sensitive database credentials or actual query results.',
    },
  ]

  const gettingStarted = [
    {
      title: 'Create an Account',
      description: 'Sign up for a free account to access all features.',
      icon: Users,
    },
    {
      title: 'Connect Your Database',
      description: 'Add your database connection details securely.',
      icon: Shield,
    },
    {
      title: 'Start Building',
      description: 'Use our AI-powered tools to write and optimize queries.',
      icon: Zap,
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white">
      <LandingNavbar />
      
      <div className="pt-16 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0A0A0B] dark:via-[#0D0D0F] dark:to-[#111113]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-12 px-4 sm:px-6 lg:px-8 py-12"
        >
          {/* Hero Section */}
          <div className="relative mb-16">
            {/* Background gradient effect */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-[#00E5FF]/20 blur-3xl transform rotate-12" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-[#00E5FF]/10 backdrop-blur-sm border border-blue-500/20 dark:border-[#00E5FF]/20 shadow-xl"
            >
              <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                ✨ About LangSQL
              </span>
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Empowering Developers with AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              Our mission is to revolutionize SQL development by making it more intuitive, efficient, and accessible through AI-powered tools.
            </p>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all"
                >
                  <feature.icon className="h-10 w-10 text-blue-500 dark:text-[#00E5FF] mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Getting Started Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gettingStarted.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 dark:bg-[#00E5FF]/10 rounded-lg flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-blue-500 dark:text-[#00E5FF]" />
                    </div>
                    <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full text-left flex justify-between items-center p-6 hover:bg-blue-500/5 dark:hover:bg-[#00E5FF]/5 transition-colors"
                  >
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </span>
                    {openFaqIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-blue-500 dark:text-[#00E5FF]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200/50 dark:border-gray-800/50"
                      >
                        <div className="p-6">
                          <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Documentation Section */}
          <div className="mb-16">
            <div className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] transition-all">
              <div className="flex items-center mb-6">
                <BookOpen className="h-8 w-8 text-blue-500 dark:text-[#00E5FF] mr-4" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Documentation</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Explore our comprehensive documentation to learn more about LangSQL's features and capabilities.
              </p>
              <motion.a
                href="#"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-500 dark:bg-[#00E5FF] text-white dark:text-black hover:bg-blue-600 dark:hover:bg-[#00E5FF]/90 transition-colors"
              >
                View Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </motion.a>
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center pb-8">
            <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Connect With Us</h2>
            <div className="flex justify-center space-x-6">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] hover:text-blue-500 dark:hover:text-[#00E5FF] transition-all"
              >
                <Github className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] hover:text-blue-500 dark:hover:text-[#00E5FF] transition-all"
              >
                <Twitter className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-500 dark:hover:border-[#00E5FF] hover:text-blue-500 dark:hover:text-[#00E5FF] transition-all"
              >
                <Linkedin className="h-6 w-6" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default About