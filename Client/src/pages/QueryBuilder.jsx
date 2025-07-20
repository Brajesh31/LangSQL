import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import queryAutocomplete from "../services/autocomplete/trie";
import { 
  Play, 
  Copy, 
  Save, 
  Download, 
  Table, 
  Clock, 
  Database, 
  ChevronRight, 
  ChevronDown, 
  TableProperties,
  Columns,
  Key,
  RefreshCw,
  Wand2,
  Sparkles,
  MessageSquare,
  Zap,
  History,
  MenuIcon,
  X,
  Keyboard,
  Info
} from 'lucide-react'
import Editor from '@monaco-editor/react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useSelector, useDispatch } from 'react-redux'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { sqlAPI } from '../services/api/axios.api'
import { databaseAPI } from '../services/api/axios.api'
import { decryptData } from '../services/encryption/aes.encryption'

// Enhanced feedback for database connection
const ConnectionStatus = ({ selectedDb, connections }) => {
  const connection = connections.find(conn => conn.id === selectedDb);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedDb ? 'connected' : 'disconnected'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`px-4 py-1.5 rounded-lg text-sm flex items-center space-x-2 ${
          selectedDb 
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-amber-500/10 text-amber-500'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${selectedDb ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <span>{selectedDb ? `Connected to ${connection?.name || 'Unknown Database'}` : 'No database selected'}</span>
      </motion.div>
    </AnimatePresence>
  )
}

const QueryBuilder = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [selectedDb, setSelectedDb] = useState(null)
  const [selectedDialect, setSelectedDialect] = useState('postgresql')
  const [expandedSchemas, setExpandedSchemas] = useState({})
  const [expandedTables, setExpandedTables] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [results, setResults] = useState(null)
  const [savedQueries, setSavedQueries] = useState([])
  const [executionHistory, setExecutionHistory] = useState([])
  const { isDark } = useSelector((state) => state.theme)
  const { showSuccess, showError } = useToast()
  const { connections, activeConnection } = useSelector((state) => state.database)
  const { user } = useSelector((state) => state.auth)
  const [explanation, setExplanation] = useState(null)
  const [optimization, setOptimization] = useState(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [editorInstance, setEditorInstance] = useState(null)
  const [databaseMetadata, setDatabaseMetadata] = useState(null)
  const [promptHistory, setPromptHistory] = useState([])
  const [suggestion, setSuggestion] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inlineSuggestion, setInlineSuggestion] = useState('');
  const inputRef = useRef(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandPalettePosition, setCommandPalettePosition] = useState({ x: 0, y: 0 })
  const [editorContent, setEditorContent] = useState('')
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('')
  const [showAIPrompt, setShowAIPrompt] = useState(false)
  const [aiPromptValue, setAIPromptValue] = useState('')
  const aiPromptRef = useRef(null)

  // Update useEffect to use naturalLanguageInput instead of input
  useEffect(() => {
    const getSuggestions = () => {
      if (!naturalLanguageInput.trim()) {
        setSuggestion([]);
        setInlineSuggestion('');
        return;
      }

      try {
        const results = queryAutocomplete.getSuggestions(naturalLanguageInput);
        console.log('Autocomplete suggestions:', results);
        
        const bestMatch = results.find(r => r.toLowerCase().startsWith(naturalLanguageInput.toLowerCase()));
        if (bestMatch) {
          setInlineSuggestion(bestMatch.slice(naturalLanguageInput.length));
        } else {
          setInlineSuggestion('');
        }
        
        setSuggestion(results);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestion([]);
        setInlineSuggestion('');
      }
    };

    const timeoutId = setTimeout(getSuggestions, 100);
    return () => clearTimeout(timeoutId);
  }, [naturalLanguageInput]);

  // Update handleKeyDown to use naturalLanguageInput
  const handleKeyDown = (e) => {
    if (inlineSuggestion) {
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        setNaturalLanguageInput(naturalLanguageInput + inlineSuggestion);
        setInlineSuggestion('');
        setSuggestion([]);
        setSelectedIndex(-1);
        return;
      }
    }

    if (suggestion.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < suggestion.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : suggestion.length - 1));
    } else if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex !== -1) {
        const selectedQuery = suggestion[selectedIndex];
        console.log('Selected query:', selectedQuery); // Debug log
        setNaturalLanguageInput(selectedQuery);
        setSuggestion([]);
        setInlineSuggestion('');
        setSelectedIndex(-1);
      }
    }
  };

  // Update handleSelect
  const handleSelect = (query) => {
    console.log('Clicked query:', query);
    setNaturalLanguageInput(query);
    setSuggestion([]);
    setInlineSuggestion('');
    setSelectedIndex(-1);
  };

  // Fetch database metadata when a connection is selected
  useEffect(() => {
    const fetchDatabaseMetadata = async () => {
      if (!selectedDb || !user?._id) return;

      try {
        const response = await databaseAPI.getConnectionDetails(selectedDb);
        if (response.sucess) {
          // The metadata is directly in response.metadata, no need to decrypt
          setDatabaseMetadata({
            id: response.metadata._id,
            db_name: response.metadata.db_name,
            tables: response.metadata.tables.map(table => ({
              name: table.name,
              description: table.description,
              columns: table.columns.map(column => ({
                name: column.name,
                type: column.type,
                isPrimary: column.indexed && column.unique,
                isIndexed: column.indexed,
                isUnique: column.unique,
                nullable: column.nullable,
                description: column.description,
                references: column.references
              }))
            })),
            lastUpdated: response.metadata.last_updated,
            createdAt: response.metadata.created_at
          });
      //    console.log(databaseMetadata)
        //  const buffer=await databaseAPI.getBufferQuestions(databaseMetadata)
         // console.log(buffer)
        } else {
          throw new Error(response.message || 'Failed to fetch metadata');
        }
      } catch (error) {
        console.error('Error fetching database metadata:', error);
        showError('Failed to load database metadata');
      }
    };

    fetchDatabaseMetadata();
  }, [selectedDb, user?._id]);

  useEffect(() => {
    if (databaseMetadata) {
      const fetchBuffer = async () => {
        try {
          const buffer = await databaseAPI.getBufferQuestions(databaseMetadata);
          console.log(buffer);
          localStorage.setItem("bufferData", JSON.stringify(buffer));
        } catch (error) {
          console.error('Error fetching buffer questions:', error);
        }
      };
  
      fetchBuffer();
    }
  }, [databaseMetadata]);

  // Fetch saved queries and execution history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [queryHistoryResponse, promptHistoryResponse] = await Promise.all([
          sqlAPI.getQueryHistory(),
          sqlAPI.getPromptHistory()
        ]);

        if (queryHistoryResponse.success) {
          setSavedQueries(queryHistoryResponse.data.savedQueries || []);
          setExecutionHistory(queryHistoryResponse.data.executionHistory || []);
        } else {
          throw new Error(queryHistoryResponse.message || 'Failed to fetch query history');
        }

        if (promptHistoryResponse.success) {
          setPromptHistory(promptHistoryResponse.data.prompts || []);
        } else {
          throw new Error(promptHistoryResponse.message || 'Failed to fetch prompt history');
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        showError('Failed to load history');
      }
    };

    fetchHistory();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle if not in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'enter':
            e.preventDefault()
            if (editorContent.trim() && selectedDb && !isExecuting) {
              handleExecute()
            }
            break
          case 's':
            e.preventDefault()
            if (editorContent.trim()) {
              handleSave()
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
  }, [editorContent, selectedDb, isExecuting])

  // Add Monaco editor command palette handling
  const handleEditorDidMount = (editor, monaco) => {
    setIsEditorReady(true)
    setEditorInstance(editor)

    // Handle command execution
    editor.onDidType((text) => {
      if (text === '/') {
        const position = editor.getPosition()
        const coords = editor.getScrolledVisiblePosition(position)
        const editorDom = editor.getDomNode()
        
        if (editorDom) {
          const rect = editorDom.getBoundingClientRect()
          setCommandPalettePosition({
            x: rect.left + coords.left,
            y: rect.top + coords.top + 20
          })
          setShowAIPrompt(true)
          // Focus the AI prompt input
          setTimeout(() => {
            if (aiPromptRef.current) {
              aiPromptRef.current.focus()
            }
          }, 0)
        }
      }
    })

    // Handle command selection
    editor.onDidChangeModelContent((e) => {
      const model = editor.getModel()
      if (!model) return

      e.changes.forEach(async (change) => {
        const lineContent = model.getLineContent(change.range.startLineNumber)
        if (lineContent.trim() === '/') {
          // Remove the "/" character
          editor.executeEdits('', [{
            range: {
              startLineNumber: change.range.startLineNumber,
              startColumn: change.range.startColumn - 1,
              endLineNumber: change.range.startLineNumber,
              endColumn: change.range.startColumn
            },
            text: ''
          }])
        }
      })
    })
  }

  // Handle AI prompt submission
  const handleAIPromptSubmit = async (e) => {
    e.preventDefault()
    if (!aiPromptValue.trim()) return

    setIsLoading(true)
    try {
      const response = await sqlAPI.generateQuerry(aiPromptValue, selectedDialect, selectedDb)
      if (response.success && editorInstance) {
        editorInstance.setValue(response.data.sql_query)
        showSuccess('Query generated successfully!')
      }
    } catch (error) {
      showError('Failed to generate query')
    } finally {
      setIsLoading(false)
      setShowAIPrompt(false)
      setAIPromptValue('')
    }
  }

  // Loading indicator component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Processing...</span>
    </div>
  )

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
                    <span>Execute Query</span>
                    <kbd className="px-2 py-1 bg-background rounded-md">⌘/Ctrl + Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                    <span>Save Query</span>
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
                    <span>Format Query</span>
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

  const dialects = [
    { id: 'postgresql', name: 'PostgreSQL' },
    { id: 'mysql', name: 'MySQL' },
    { id: 'trino', name: 'Trino' },
    { id: 'spark', name: 'Spark SQL' }
  ]

  const toggleSchema = (dbName, schemaName) => {
    setExpandedSchemas(prev => ({
      ...prev,
      [`${dbName}.${schemaName}`]: !prev[`${dbName}.${schemaName}`]
    }))
  }

  const toggleTable = (dbName, tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [`${dbName}.${tableName}`]: !prev[`${dbName}.${tableName}`]
    }))
  }

  const handleSelectDatabase = (dbId) => {
    setSelectedDb(dbId);
    const connection = connections.find(conn => conn.id === dbId);
    if (connection) {
      setSelectedDialect(connection.type);
      showSuccess(`Connected to ${connection.name}`);
      console.log("content:",databaseMetadata)
    }
  };

  const handleTableClick = (tableName) => {
    setEditorContent(`SELECT * FROM ${tableName} LIMIT 100;`);
  };

  const handleNaturalLanguageQuery = async () => {
    if (!naturalLanguageInput.trim() || !selectedDb) {
      showError('Please enter a query and select a database')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await sqlAPI.generateQuerry(naturalLanguageInput, selectedDialect, selectedDb)
      
      const query = response.data.sql_query
      setEditorContent(query)
      setSuggestions([
        'You might also want to include the total order value',
        'Consider adding a date range filter',
        'You could join with the products table to see what they bought'
      ])
      showSuccess('Query generated successfully!')
    } catch (error) {
      showError('Failed to generate query')
      console.error('Failed to generate query:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExplainQuery = async () => {
    if (!editorContent.trim()) return
    
    setIsExplaining(true)
    try {
      // TODO: Call your AI service to explain the query
      await new Promise(resolve => setTimeout(resolve, 800))
      setExplanation({
        overview: "This query finds users who have placed more than 5 orders",
        steps: [
          "Joins the users table with orders table",
          "Groups results by username",
          "Filters for users with more than 5 orders",
          "Returns username and order count"
        ],
        performance: "The query uses an index on user_id for efficient joining"
      })
      showSuccess('Query explained!')
    } catch (error) {
      showError('Failed to explain query')
    } finally {
      setIsExplaining(false)
    }
  }

  const handleOptimizeQuery = async () => {
    if (!editorContent.trim()) return
    
    setIsOptimizing(true)
    try {
      // TODO: Call your AI service to optimize the query
      await new Promise(resolve => setTimeout(resolve, 800))
      setOptimization({
        optimizedQuery: editorContent.replace('SELECT *', 'SELECT id, username, email'),
        improvements: [
          "Replaced SELECT * with specific columns",
          "Added index hint for better performance",
          "Restructured JOIN for better execution plan"
        ],
        estimatedImprovement: "~40% performance increase"
      })
      showSuccess('Query optimized!')
    } catch (error) {
      showError('Failed to optimize query')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleExecute = async () => {
    if (!editorContent.trim()) {
      showError('Please generate or write a SQL query first')
      return
    }
    
    if (!selectedDb) {
      showError('Please connect to a database first')
      return
    }

    setIsExecuting(true)
    try {
      const response = await sqlAPI.executeQuery({
        query: editorContent,
        connectionId: selectedDb,
        dialect: selectedDialect
      })

      if (response.success) {
        // Handle the actual response format from the /execute endpoint
        const { results, metadata } = response.data;
        
        // Format the results for display
        const formattedResults = results.map(row => {
          const formattedRow = {};
          Object.entries(row).forEach(([key, value]) => {
            // Handle null values
            if (value === null) {
              formattedRow[key] = 'NULL';
            }
            // Handle Date objects
            else if (value instanceof Date) {
              formattedRow[key] = value.toISOString();
            }
            // Handle other types
            else {
              formattedRow[key] = value;
            }
          });
          return formattedRow;
        });

        setResults({
          data: formattedResults,
          metadata: {
            rowCount: metadata.rowCount,
            executionTime: metadata.executionTime,
            affectedRows: metadata.affectedRows,
            columns: metadata.columns
          }
        });

        // Add to execution history
        setExecutionHistory(prev => [{
          query: editorContent,
          timestamp: new Date(),
          metadata: metadata
        }, ...prev]);

        showSuccess(response.message || 'Query executed successfully!')
      } else {
        throw new Error(response.message || 'Failed to execute query')
      }
    } catch (error) {
      console.error('Failed to execute query:', error)
      showError(error.message || 'Failed to execute query')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent)
    showSuccess('Query copied to clipboard!')
  }

  const handleSave = () => {
    if (!editorContent) return
    setSavedQueries([...savedQueries, { query: editorContent, timestamp: new Date() }])
    showSuccess('Query saved successfully!')
  }

  const handleDownload = () => {
    if (!results) return
    const csv = [
      Object.keys(results.data[0]).join(','),
      ...results.data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const element = document.createElement('a')
    const file = new Blob([csv], { type: 'text/csv' })
    element.href = URL.createObjectURL(file)
    element.download = 'query_results.csv'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    showSuccess('Results downloaded successfully!')
  }

  const handleClearPromptHistory = () => {
    setPromptHistory([])
    showSuccess('Prompt history cleared')
  }

  return (
    <DashboardLayout>
      <KeyboardShortcutsModal />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background text-foreground relative">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Toggle Database Explorer"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>

        {/* Database Sidebar - Left Section */}
        <div className={`w-full sm:w-80 lg:w-64 xl:w-72 flex-shrink-0 border-r border-border bg-background transition-all duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative h-full z-40 overflow-hidden`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Databases</h2>
                <button 
                  className="p-2 hover:bg-accent rounded-lg transition-all duration-200 hover:shadow-sm"
                  title="Refresh"
                  onClick={() => {
                    // Refresh connections
                    dispatch(fetchConnections());
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
              <div className="space-y-2">
                {connections.map(conn => (
                  <div key={conn.id} className="space-y-1">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectDatabase(conn.id)}
                      className={`flex items-center w-full p-3 rounded-lg text-sm transition-all duration-200 ${
                        selectedDb === conn.id 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'hover:bg-accent hover:shadow-sm'
                      }`}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      {conn.name}
                    </motion.button>
                    {selectedDb === conn.id && databaseMetadata && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-4"
                      >
                        {databaseMetadata.tables?.map(table => (
                          <div key={table.name}>
                            <button
                              onClick={() => toggleTable(conn.id, table.name)}
                              className="flex items-center w-full p-2.5 text-sm hover:bg-accent rounded-lg transition-all duration-200"
                            >
                              {expandedTables[`${conn.id}.${table.name}`] ? (
                                <ChevronDown className="w-3 h-3 mr-2" />
                              ) : (
                                <ChevronRight className="w-3 h-3 mr-2" />
                              )}
                              <Table className="w-4 h-4 mr-2" />
                              {table.name}
                            </button>
                            {expandedTables[`${conn.id}.${table.name}`] && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="ml-7 border-l border-border"
                              >
                                {table.columns.map(column => (
                                  <div
                                    key={column.name}
                                    className="flex items-center p-2 text-sm"
                                  >
                                    {column.isPrimary ? (
                                      <Key className="w-3 h-3 mr-2 text-primary" />
                                    ) : (
                                      <Columns className="w-3 h-3 mr-2" />
                                    )}
                                    <span className="text-foreground">
                                      {column.name}
                                    </span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      {column.type}
                                    </span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
                {connections.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No database connections available
                    </p>
                    <button
                      onClick={() => navigate('/manage-databases')}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                    >
                      Add Connection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
          <div className="h-full overflow-y-auto pb-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6 space-y-6">
              {/* Header with Connection Status */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <h1 className="text-2xl font-bold">Query Builder</h1>
                <div className="flex items-center space-x-4">
                  <ConnectionStatus selectedDb={selectedDb} connections={connections} />
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

              {/* Single Editor Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-background p-4 lg:p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4 mb-4 lg:mb-0">
                    <h2 className="text-xl font-semibold tracking-tight">SQL Query</h2>
                    <ConnectionStatus selectedDb={selectedDb} connections={connections} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExplainQuery}
                      disabled={!editorContent || isExplaining}
                      className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 group relative"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground text-xs py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                        Explain Query (/explain)
                      </span>
                    </button>
                    <button
                      onClick={handleOptimizeQuery}
                      disabled={!editorContent || isOptimizing}
                      className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 group relative"
                    >
                      <Zap className="w-5 h-5" />
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground text-xs py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                        Optimize Query (/optimize)
                      </span>
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={!editorContent}
                      className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 group relative"
                    >
                      <Copy className="w-5 h-5" />
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground text-xs py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                        Copy to clipboard
                      </span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!editorContent}
                      className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 disabled:opacity-50 group relative"
                    >
                      <Save className="w-5 h-5" />
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground text-xs py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                        Save query
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
                    value={editorContent}
                    onChange={setEditorContent}
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
                              <span className="text-sm font-medium">AI Query Generation</span>
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
                          <div className="relative">
                            <input
                              ref={aiPromptRef}
                              type="text"
                              value={aiPromptValue}
                              onChange={(e) => {
                                setAIPromptValue(e.target.value);
                                // Get suggestions when input changes
                                const suggestions = queryAutocomplete.getSuggestions(e.target.value);
                                if (suggestions.length > 0) {
                                  const bestMatch = suggestions.find(s => 
                                    s.toLowerCase().startsWith(e.target.value.toLowerCase())
                                  );
                                  if (bestMatch) {
                                    setInlineSuggestion(bestMatch.slice(e.target.value.length));
                                  } else {
                                    setInlineSuggestion('');
                                  }
                                } else {
                                  setInlineSuggestion('');
                                }
                              }}
                              onKeyDown={(e) => {
                                if (inlineSuggestion) {
                                  if (e.key === "Tab" || e.key === "Enter") {
                                    e.preventDefault();
                                    setAIPromptValue(aiPromptValue + inlineSuggestion);
                                    setInlineSuggestion('');
                                    return;
                                  }
                                }
                              }}
                              placeholder="Describe your query in natural language..."
                              className="w-full pl-7 pr-24 py-2.5 bg-background text-foreground border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                              autoFocus
                            />
                            {inlineSuggestion && (
                              <div className="absolute inset-0 pointer-events-none">
                                <span className="pl-7 text-muted-foreground/50">
                                  {aiPromptValue}
                                  <span className="text-muted-foreground">{inlineSuggestion}</span>
                                </span>
                              </div>
                            )}
                          </div>
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
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <p className="space-x-3">
                            <span>Press Enter to generate SQL</span>
                            <span>·</span>
                            <span>Press Esc to cancel</span>
                          </p>
                          {inlineSuggestion && (
                            <p className="flex items-center space-x-1">
                              <span>Press Tab to complete</span>
                              <kbd className="px-1.5 py-0.5 text-xs bg-background text-foreground rounded">Tab</kbd>
                            </p>
                          )}
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleExecute}
                    disabled={isExecuting || !editorContent.trim() || !selectedDb}
                    className="group px-6 py-3.5 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded-lg flex items-center space-x-3 transition-all duration-200 shadow-sm font-medium min-w-[150px] justify-center"
                  >
                    {isExecuting ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        <span>Execute</span>
                        <kbd className="absolute right-2 top-2 text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          ⌘/Ctrl + ↵
                        </kbd>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Results Section */}
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden mb-20"
                >
                  <div className="p-4 lg:p-5 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{results.metadata.executionTime}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Table className="w-4 h-4" />
                          <span>{results.metadata.rowCount} rows</span>
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="px-5 py-2.5 bg-accent hover:bg-accent/90 rounded-lg flex items-center justify-center space-x-3 transition-all duration-200 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-accent/80 backdrop-blur-sm sticky top-0">
                          {results.data.length > 0 && Object.keys(results.data[0]).map((key) => (
                            <th
                              key={key}
                              className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {results.data.map((row, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-accent/50 transition-colors duration-150"
                          >
                            {Object.values(row).map((value, j) => (
                              <td
                                key={j}
                                className="px-6 py-4 text-sm whitespace-nowrap"
                              >
                                {value}
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                {/* Prompts History */}
                <div>
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold tracking-tight">Prompts History</h2>
                      <button 
                        className="p-2.5 hover:bg-accent rounded-lg transition-all duration-200 hover:shadow-sm"
                        title="Clear History"
                        onClick={handleClearPromptHistory}
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {promptHistory.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-accent rounded-lg cursor-pointer hover:bg-accent/90 transition-all duration-200 border border-border hover:shadow-md"
                        onClick={() => setEditorContent(item.prompt)}
                      >
                        <p className="text-sm text-foreground mb-2 line-clamp-2">{item.prompt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                          <span className="px-2 py-1 bg-background text-foreground rounded-full">
                            {item.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {promptHistory.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          No prompts history yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Execution History */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Execution History</h2>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    {[...executionHistory, ...(results ? [{
                      query: editorContent,
                      timestamp: new Date(),
                      response: {
                        metadata: results.metadata
                      }
                    }] : [])].map((execution, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-accent rounded-lg border border-border hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {index === 0 && results ? (
                              <span className="text-primary">Latest Execution</span>
                            ) : (
                              'Previous Execution'
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {execution.responseTime || execution.response?.metadata?.executionTime || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {execution.query}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-1 bg-background text-foreground rounded-full">
                            Rows: {execution.rows || execution.response?.metadata?.rowCount || 0}
                          </span>
                          <span className="px-2 py-1 bg-background text-foreground rounded-full">
                            Affected: {execution.affectedRows || execution.response?.metadata?.affectedRows || 0}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {executionHistory.length === 0 && !results && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          No execution history yet
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

export default QueryBuilder 
