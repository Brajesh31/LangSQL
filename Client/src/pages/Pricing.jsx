import { motion } from 'framer-motion'
import { Check, Zap, Shield, Users, Database, Cpu } from 'lucide-react'
import LandingNavbar from '../components/layout/LandingNavbar'
import { useSelector } from 'react-redux'

const Pricing = () => {
  const { isDark } = useSelector((state) => state.theme)

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started with LangSQL',
      features: [
        'Up to 100 queries per month',
        'Basic SQL generation',
        'Single database connection',
        'Community support',
        'Basic query optimization'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For professional developers and teams',
      features: [
        'Unlimited queries',
        'Advanced SQL generation',
        'Multiple database connections',
        'Priority support',
        'Advanced query optimization',
        'Schema design assistance',
        'Team collaboration',
        'Analytics dashboard'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with custom needs',
      features: [
        'Everything in Pro',
        'Custom AI model training',
        'Dedicated support',
        'SLA guarantees',
        'Custom integrations',
        'Advanced security features',
        'On-premise deployment',
        'Custom feature development'
      ],
      cta: 'Contact Sales',
      popular: false
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
                💎 Simple Pricing
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            >
              Choose Your Perfect Plan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Start with our free plan and upgrade as you grow. All plans include our core features.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border-2 ${
                  plan.popular
                    ? 'border-blue-500 dark:border-[#00E5FF] shadow-xl shadow-blue-500/25 dark:shadow-[#00E5FF]/25'
                    : 'border-gray-200/50 dark:border-gray-800/50'
                } transition-all group`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-[#00E5FF] rounded-full text-white text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-[#00E5FF] bg-clip-text text-transparent">
                    {plan.price}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600 dark:text-gray-400">
                      <Check className="w-5 h-5 text-blue-500 dark:text-[#00E5FF] mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-[#00E5FF] text-white hover:opacity-90'
                      : 'bg-white/50 dark:bg-[#111113]/50 border-2 border-blue-500 dark:border-[#00E5FF] text-blue-500 dark:text-[#00E5FF] hover:bg-blue-500/10 dark:hover:bg-[#00E5FF]/10'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-6">
            {[
              {
                question: 'Can I switch plans later?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.'
              },
              {
                question: 'Do you offer refunds?',
                answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans.'
              },
              {
                question: 'What kind of support do you provide?',
                answer: 'Free users get community support, Pro users get priority email support, and Enterprise users get dedicated support with guaranteed response times.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-800/50"
              >
                <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing 