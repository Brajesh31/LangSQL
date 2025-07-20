import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Schema Generator', href: '/schema-generator' },
    { name: 'Query Builder', href: '/query-builder' },
    { name: 'About', href: '/about' },
  ]

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/LangSQL',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/LangSQL',
      icon: Twitter,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/LangSQL',
      icon: Linkedin,
    },
  ]

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} LangSQL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 