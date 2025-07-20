import { useState } from 'react'
import { motion } from 'framer-motion'
import { Languages, Copy, Save, Download } from 'lucide-react'
import Editor from '@monaco-editor/react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useSelector } from 'react-redux'

const QueryTranslation = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [sourceDialect, setSourceDialect] = useState('mysql')
  const [targetDialect, setTargetDialect] = useState('postgresql')
  const [isLoading, setIsLoading] = useState(false)
  const [savedTranslations, setSavedTranslations] = useState([])
  const { isDark } = useSelector((state) => state.theme)

  const dialects = [
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mssql', label: 'SQL Server' },
    { value: 'oracle', label: 'Oracle' },
    { value: 'sqlite', label: 'SQLite' },
  ]

  const handleTranslate = async () => {
    if (!input.trim()) return
    
    setIsLoading(true)
    try {
      // TODO: Implement query translation
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOutput(input.replace('AUTO_INCREMENT', 'SERIAL'))
    } catch (error) {
      console.error('Failed to translate query:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  const handleSave = () => {
    if (!output) return
    setSavedTranslations([
      ...savedTranslations,
      {
        source: input,
        target: output,
        sourceDialect,
        targetDialect,
        timestamp: new Date(),
      },
    ])
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translated_query.sql'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0B] text-gray-900 dark:text-white p-6 transition-colors">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Query Translation</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Translate SQL queries between different database dialects.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Source Query</h2>
                <select
                  value={sourceDialect}
                  onChange={(e) => setSourceDialect(e.target.value)}
                  className="w-40"
                >
                  {dialects.map((dialect) => (
                    <option key={dialect.value} value={dialect.value}>
                      {dialect.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Editor
                  height="300px"
                  defaultLanguage="sql"
                  value={input}
                  onChange={setInput}
                  theme={isDark ? "vs-dark" : "light"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'off',
                    folding: false,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 0,
                    renderLineHighlight: 'none',
                    scrollBeyondLastLine: false,
                    overviewRulerLanes: 0,
                    overviewRulerBorder: false,
                  }}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                />
              </div>
              <button
                onClick={handleTranslate}
                disabled={isLoading || !input.trim()}
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    <span>Translate Query</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Section */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-lg font-medium">Translated Query</h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={targetDialect}
                      onChange={(e) => setTargetDialect(e.target.value)}
                      className="w-40"
                    >
                      {dialects.map((dialect) => (
                        <option key={dialect.value} value={dialect.value}>
                          {dialect.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopy}
                        disabled={!output}
                        className="btn btn-secondary p-2"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!output}
                        className="btn btn-secondary p-2"
                        title="Save translation"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDownload}
                        disabled={!output}
                        className="btn btn-secondary p-2"
                        title="Download as SQL file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Editor
                  height="300px"
                  defaultLanguage="sql"
                  value={output}
                  theme={isDark ? "vs-dark" : "light"}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'off',
                    folding: false,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 0,
                    renderLineHighlight: 'none',
                    scrollBeyondLastLine: false,
                    overviewRulerLanes: 0,
                    overviewRulerBorder: false,
                  }}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                />
              </div>
            </div>
          </div>

          {/* Saved Translations */}
          {savedTranslations.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium mb-4">Saved Translations</h2>
              <div className="space-y-4">
                {savedTranslations.map((saved, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {saved.timestamp.toLocaleString()}
                        </span>
                        <span className="mx-2 text-gray-400 dark:text-gray-600">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {dialects.find((d) => d.value === saved.sourceDialect)?.label} →{' '}
                          {dialects.find((d) => d.value === saved.targetDialect)?.label}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setInput(saved.source)
                          setOutput(saved.target)
                          setSourceDialect(saved.sourceDialect)
                          setTargetDialect(saved.targetDialect)
                        }}
                        className="text-blue-500 dark:text-[#00E5FF] hover:text-blue-600 dark:hover:text-[#00E5FF]/80 text-sm"
                      >
                        Load Translation
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Source Query</h3>
                        <pre className="text-sm overflow-x-auto">
                          <code>{saved.source}</code>
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Translated Query</h3>
                        <pre className="text-sm overflow-x-auto">
                          <code>{saved.target}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default QueryTranslation 