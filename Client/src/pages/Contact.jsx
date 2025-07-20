import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react'
import LandingNavbar from '../components/layout/LandingNavbar'
import { useSelector } from 'react-redux'

const Contact = () => {
  const { isDark } = useSelector((state) => state.theme)

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'support@langsql.com',
      link: 'mailto:support@langsql.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+91 9175895896',
      link: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Office',
      content: 'LangSQL, India',
      link: 'https://maps.google.com'
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
                📞 Get in Touch
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
            >
              We'd Love to Hear From You
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Have questions about LangSQL? We're here to help. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50"
            >
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Send us a Message
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0B] border-2 border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0B] border-2 border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all"
                    placeholder="Your Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0B] border-2 border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0A0A0B] border-2 border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#00E5FF]/20 transition-all"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-[#00E5FF] text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <a
                      key={index}
                      href={info.link}
                      className="flex items-start space-x-4 group"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#00E5FF]/10 border border-blue-500/20 dark:border-[#00E5FF]/20 group-hover:scale-110 transition-transform">
                        <info.icon className="w-5 h-5 text-blue-500 dark:text-[#00E5FF]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-[#00E5FF] transition-colors">
                          {info.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {info.content}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-white/50 dark:bg-[#111113]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Support Hours
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact 