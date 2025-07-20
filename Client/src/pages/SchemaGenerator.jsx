import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Database,
  Download,
  Copy,
  Wand2,
  Save,
  Table,
  History,
  ChevronRight,
  ChevronDown,
  Clock,
  Sparkles,
  MenuIcon,
  X,
  Keyboard,
  Info,
  MessageSquare,
  Zap,
  Edit
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useToast } from '../contexts/ToastContext'
import { useSelector } from 'react-redux'
import { sqlAPI } from '../services/api/axios.api'

// Loading indicator component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
    <span className="text-sm">Processing...</span>
  </div>
)

const SchemaGenerator = () => {
  const [schemaDescription, setSchemaDescription] = useState('')
  const [generatedSchema, setGeneratedSchema] = useState('')
  const [selectedDialect, setSelectedDialect] = useState('postgresql')
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [editorInstance, setEditorInstance] = useState(null)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [isExplaining, setIsExplaining] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [optimization, setOptimization] = useState(null)
  const [savedSchemas] = useState([
    {
      name: "Blog Database Schema",
      description: "A blog database with users, posts, and comments tables",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      schema: `CREATE TABLE users (...);\nCREATE TABLE posts (...);\nCREATE TABLE comments (...);`
    },
    {
      name: "E-commerce Database",
      description: "Complete e-commerce system with products, orders, and customers",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      schema: `CREATE TABLE products (...);\nCREATE TABLE orders (...);\nCREATE TABLE customers (...);`
    },
    {
      name: "Task Management System",
      description: "Project management database with tasks, projects, and users",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      schema: `CREATE TABLE tasks (...);\nCREATE TABLE projects (...);\nCREATE TABLE users (...);`
    }
  ])
  const { showSuccess, showError } = useToast()
  const { isDark } = useSelector((state) => state.theme)
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPromptValue, setAIPromptValue] = useState('')
  const [commandPalettePosition, setCommandPalettePosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const aiPromptRef = useRef(null)
  const [isViewMode, setIsViewMode] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'enter':
            e.preventDefault()
            if (schemaDescription.trim() && !isGenerating) {
              handleGenerateSchema()
            }
            break
          case 's':
            e.preventDefault()
            if (generatedSchema.trim()) {
              handleSaveSchema()
            }
            break
          case 'k':
            e.preventDefault()
            setShowKeyboardShortcuts(true)
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [schemaDescription, generatedSchema, isGenerating])

  const dialects = [
    { id: 'postgresql', name: 'PostgreSQL' },
    { id: 'mysql', name: 'MySQL' },
    { id: 'trino', name: 'Trino' },
    { id: 'spark', name: 'Spark SQL' }
  ]

  // Editor ready handler
  const handleEditorDidMount = (editor, monaco) => {
    setIsEditorReady(true)
    setEditorInstance(editor)

    // Handle command execution
    editor.onDidChangeModelContent((e) => {
      const model = editor.getModel()
      if (!model) return

      const position = editor.getPosition()
      const lineContent = model.getLineContent(position.lineNumber)
      const beforeCursor = lineContent.substring(0, position.column - 1)

      if (beforeCursor === '/') {
        setShowAIPrompt(true)
        // Focus the AI prompt input
        setTimeout(() => {
          if (aiPromptRef.current) {
            aiPromptRef.current.focus()
          }
        }, 0)
      }
    })

    // Add custom SQL completions
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: 'CREATE TABLE',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'CREATE TABLE ',
          },
          {
            label: 'PRIMARY KEY',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'PRIMARY KEY',
          },
          {
            label: 'FOREIGN KEY',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'FOREIGN KEY',
          },
          // Add more SQL keywords as needed
        ],
      }),
    })
  }

  const handleGenerateSchema = async () => {
    if (!schemaDescription.trim()) {
      showError('Please describe your database schema requirements')
      return
    }
  
    setIsGenerating(true)
  
    try {
      const response = await sqlAPI.generateSchema(schemaDescription, selectedDialect)
      console.log("response", response)
      if (response.sucess) {
        // Remove markdown code block markers and parse the JSON
        const cleanSchema = response.schema.replace(/```json\n?|\n?```/g, '').trim()
        console.log("Cleaned schema:", cleanSchema)
        const schemaObj = JSON.parse(cleanSchema)
        console.log("Parsed schema:", schemaObj)
        
        // Set the SQL query from the parsed object
        setGeneratedSchema(schemaObj.sql_query)
        setIsViewMode(true)
  
        // Optimization Suggestions
        setOptimizationSuggestions([
          'Consider adding an index on user_id in the orders table for faster lookups',
          'Partitioning the orders table by created_at will improve OLAP queries',
          'Adding a composite index on (user_id, created_at) will optimize common queries'
        ])
  
        showSuccess('Schema generated successfully!')
      } else {
        throw new Error(response.message || 'Failed to generate schema')
      }
    } catch (error) {
      showError('Failed to generate schema')
      console.error('Failed to generate schema:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  

  const handleExplainSchema = async () => {
    if (!generatedSchema.trim()) return
    
    setIsExplaining(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setExplanation({
        overview: "This schema defines a basic e-commerce database structure",
        tables: [
          "Users table stores customer information with unique constraints",
          "Orders table tracks all transactions with proper foreign key relationships",
        ],
        relationships: "One-to-many relationship between users and orders",
        bestPractices: "Proper use of timestamps and constraints for data integrity"
      })
      showSuccess('Schema explained!')
    } catch (error) {
      showError('Failed to explain schema')
    } finally {
      setIsExplaining(false)
    }
  }

  const handleOptimizeSchema = async () => {
    if (!generatedSchema.trim()) return
    
    setIsOptimizing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setOptimization({
        suggestions: [
          "Add indexes on frequently queried columns",
          "Consider using UUID instead of AUTO_INCREMENT for better distribution",
          "Add appropriate table partitioning strategy"
        ],
        improvements: "Estimated 30% query performance improvement"
      })
      showSuccess('Optimization suggestions generated!')
    } catch (error) {
      showError('Failed to generate optimization suggestions')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleCopySchema = () => {
    navigator.clipboard.writeText(generatedSchema)
    showSuccess('Schema copied to clipboard!')
  }

  const handleSaveSchema = () => {
    if (!generatedSchema) return
    // Add save logic here
    showSuccess('Schema saved successfully!')
  }

  const handleDownloadSchema = () => {
    if (!generatedSchema) return
    const blob = new Blob([generatedSchema], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.sql'
    a.click()
    URL.revokeObjectURL(url)
    showSuccess('Schema downloaded!')
  }

  // Handle AI prompt submission
  const handleAIPromptSubmit = async (e) => {
    e.preventDefault()
    if (!aiPromptValue.trim()) return

    setIsLoading(true)
    try {
      console.log("Sending request with:", { description: aiPromptValue, dialect: selectedDialect });
      const response = await sqlAPI.generateSchema(aiPromptValue, selectedDialect)
      console.log("Received response:", response);
      
      if (response.success) {
        try {
          // Remove markdown code block markers and parse the JSON
          const cleanSchema = response.schema.replace(/```json\n?|\n?```/g, '').trim()
          console.log("Cleaned schema:", cleanSchema)
          const schemaObj = JSON.parse(cleanSchema)
          console.log("Parsed schema:", schemaObj)
          
          // Set the SQL query from the parsed object
          setGeneratedSchema(schemaObj.sql_query)
          setIsViewMode(true)
          
          setOptimizationSuggestions([
            'Consider adding an index on user_id in the orders table for faster lookups',
            'Partitioning the orders table by created_at will improve OLAP queries',
            'Adding a composite index on (user_id, created_at) will optimize common queries'
          ])
          showSuccess('Schema generated successfully!')
        } catch (parseError) {
          console.error("Error parsing schema:", parseError);
          showError('Failed to parse generated schema')
        }
      } else {
        throw new Error(response.message || 'Failed to generate schema')
      }
    } catch (error) {
      console.error('Failed to generate schema:', error)
      showError(error.message || 'Failed to generate schema')
    } finally {
      setIsLoading(false)
      setShowAIPrompt(false)
      setAIPromptValue('')
    }
  }

  // Add keyboard event handler for AI prompt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showAIPrompt) {
        if (e.key === 'Escape') {
          setShowAIPrompt(false)
          setAIPromptValue('')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showAIPrompt])

  // Keyboard shortcuts modal
  const KeyboardShortcutsModal = () => (
    <AnimatePresence>
      {showKeyboardShortcuts && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowKeyboardShortcuts(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-background p-6 rounded-xl border border-border shadow-lg max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="p-2 hover:bg-accent rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">General</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <span>Generate Schema</span>
                    <kbd className="px-2 py-1 bg-background rounded-md">⌘/Ctrl + Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <span>Save Schema</span>
                    <kbd className="px-2 py-1 bg-background rounded-md">⌘/Ctrl + S</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <span>Show Shortcuts</span>
                    <kbd className="px-2 py-1 bg-background rounded-md">⌘/Ctrl + K</kbd>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Editor</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <span>Format Schema</span>
                    <kbd className="px-2 py-1 bg-background rounded-md">Shift + Alt + F</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <span>Comment Line</span>
                    <kbd className="px-2 py-1 bg-background rounded-md">⌘/Ctrl + /</kbd>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <DashboardLayout>
      <KeyboardShortcutsModal />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background text-foreground">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Toggle Templates"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>

        {/* Left Section - Schema Templates */}
        <div className={`w-full sm:w-80 lg:w-64 xl:w-72 flex-shrink-0 border-r border-border bg-background transition-all duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative h-full z-40`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Templates</h2>
                <button 
                  className="p-2 hover:bg-accent rounded-lg transition-all duration-200 hover:shadow-sm"
                  title="Refresh Templates"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {['Blog System', 'E-commerce', 'Social Network', 'Task Management'].map((template) => (
                  <motion.button
                    key={template}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center w-full p-3 rounded-lg text-sm transition-all duration-200 hover:bg-accent hover:shadow-sm"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    {template}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background relative w-full">
          <div className="h-full overflow-y-auto">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <h1 className="text-2xl font-bold">Schema Generator</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowKeyboardShortcuts(true)}
                    className="p-2 hover:bg-accent rounded-lg transition-all duration-200 flex items-center space-x-2"
                    title="Show Keyboard Shortcuts"
                  >
                    <Keyboard className="w-4 h-4" />
                    <span className="text-sm">Shortcuts</span>
                  </button>
                </div>
              </div>

              {/* Editor Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-background p-4 lg:p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4 mb-4 lg:mb-0">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {isViewMode ? 'Generated Schema' : 'Schema Description'}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsViewMode(false)}
                      disabled={!isViewMode}
                      className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 group relative"
                    >
                      <Edit className="w-5 h-5" />
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground text-xs py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                        Edit Description
                      </span>
                    </button>
                    <button
                      onClick={handleExplainSchema}
                      disabled={!schemaDescription || isExplaining}
                      className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 group relative"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground text-xs py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                        Explain Schema
                      </span>
                    </button>
                    <button
                      onClick={handleOptimizeSchema}
                      disabled={!schemaDescription || isOptimizing}
                      className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 group relative"
                    >
                      <Zap className="w-5 h-5" />
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground text-xs py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                        Optimize Schema
                      </span>
                    </button>
                  </div>
                </div>

                <div className="relative min-h-[400px] rounded-xl overflow-hidden border border-border shadow-sm">
                  {!isEditorReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <LoadingSpinner />
                    </div>
                  )}
                  <Editor
                    height="400px"
                    defaultLanguage="sql"
                    value={isViewMode ? generatedSchema : schemaDescription}
                    onChange={isViewMode ? setGeneratedSchema : setSchemaDescription}
                    theme={isDark ? "vs-dark" : "light"}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      padding: { top: 16, bottom: 16 },
                      roundedSelection: true,
                      automaticLayout: true,
                      wordWrap: 'on',
                      lineHeight: 1.5,
                      folding: false,
                      renderLineHighlight: 'all',
                      smoothScrolling: true,
                      cursorSmoothCaretAnimation: true,
                      quickSuggestions: true,
                      suggestOnTriggerCharacters: true,
                      readOnly: isViewMode,
                      scrollbar: {
                        vertical: 'hidden',
                        horizontal: 'hidden',
                        verticalScrollbarSize: 0,
                        horizontalScrollbarSize: 0
                      }
                    }}
                  />

                  {/* AI Prompt Input */}
                  {showAIPrompt && (
                    <div 
                      className="absolute bg-background/95 backdrop-blur-sm border border-border shadow-lg z-50 w-full"
                      style={{
                        left: 0,
                        top: 0,
                        borderTopLeftRadius: '0.75rem',
                        borderTopRightRadius: '0.75rem',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      <form onSubmit={handleAIPromptSubmit} className="p-3">
                        <div className="flex items-center justify-between space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 px-2 py-1 bg-accent/50 rounded-md">
                              <Wand2 className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">AI Schema Generation</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <select
                              value={selectedDialect}
                              onChange={(e) => setSelectedDialect(e.target.value)}
                              className="px-3 py-1.5 rounded-md border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            >
                              {dialects.map(dialect => (
                                <option key={dialect.id} value={dialect.id}>
                                  {dialect.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAIPrompt(false)
                                setAIPromptValue('')
                              }}
                              className="p-1.5 hover:bg-accent rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground text-sm">/</span>
                          </div>
                          <input
                            ref={aiPromptRef}
                            type="text"
                            value={aiPromptValue}
                            onChange={(e) => setAIPromptValue(e.target.value)}
                            placeholder="Describe your schema in natural language..."
                            className="w-full pl-7 pr-24 py-2.5 bg-background text-foreground border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                            autoFocus
                          />
                          <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
                            {isLoading ? (
                              <div className="px-3">
                                <LoadingSpinner />
                              </div>
                            ) : (
                              <button
                                type="submit"
                                disabled={!aiPromptValue.trim()}
                                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                              >
                                <span>Generate</span>
                                <kbd className="px-1.5 py-0.5 text-xs bg-primary-foreground/20 rounded">↵</kbd>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end text-xs text-muted-foreground mt-2">
                          <p className="space-x-3">
                            <span>Press Enter to generate schema</span>
                            <span>·</span>
                            <span>Press Esc to cancel</span>
                          </p>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {!isViewMode && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleGenerateSchema}
                      disabled={isGenerating || !schemaDescription.trim()}
                      className="group px-6 py-3.5 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded-lg flex items-center space-x-3 transition-all duration-200 shadow-sm font-medium min-w-[150px] justify-center"
                    >
                      {isGenerating ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          <span>Generate</span>
                          <kbd className="absolute right-2 top-2 text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ⌘/Ctrl + ↵
                          </kbd>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Optimization Suggestions */}
              {optimizationSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 lg:p-5 bg-accent rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-sm font-medium">Optimization Suggestions</h3>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <ul className="space-y-2.5">
                    {optimizationSuggestions.map((suggestion, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-2.5 text-sm text-muted-foreground"
                      >
                        <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                        <span>{suggestion}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* History Sidebar - Right Section */}
        <div className={`w-full sm:w-80 lg:w-72 xl:w-80 flex-shrink-0 border-l border-border bg-background transition-all duration-300 transform ${
          isHistoryOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 fixed lg:relative right-0 h-full z-40 overflow-hidden`}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
              <div className="p-4 lg:p-6 space-y-6">
                {/* Saved Schemas */}
                <div>
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold tracking-tight">Saved Schemas</h2>
                      <button 
                        className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 hover:shadow-sm"
                        title="Clear History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {savedSchemas.map((schema, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-accent rounded-lg cursor-pointer hover:bg-accent/90 transition-all duration-200 border border-border hover:shadow-md"
                      >
                        <h3 className="font-medium mb-1">{schema.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{schema.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(schema.timestamp).toLocaleString()}</span>
                        </p>
                      </motion.div>
                    ))}
                    {savedSchemas.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          No saved schemas yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile History Toggle */}
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Toggle History"
        >
          <History className="w-5 h-5" />
        </button>
      </div>
    </DashboardLayout>
  )
}

export default SchemaGenerator 