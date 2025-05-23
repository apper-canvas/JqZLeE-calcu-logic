import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator, RotateCcw, Clock, ChevronDown, ChevronUp,
  FunctionSquare, ArrowLeftRight, LineChart
} from 'lucide-react'
import MainFeature from '../components/MainFeature'
import ScientificCalculator from '../components/ScientificCalculator'
import GraphEquationCalculator from '../components/GraphEquationCalculator'

function Home() {
  const [showHistory, setShowHistory] = useState(false)
  const [calculationHistory, setCalculationHistory] = useState([])
  const [calculatorMode, setCalculatorMode] = useState('standard') // 'standard', 'scientific', or 'graph'
  
  const addToHistory = (expression, result) => {
    const newEntry = {
      expression,
      result,
      timestamp: new Date().toISOString()
    }
    setCalculationHistory(prev => [newEntry, ...prev])
  }
  
  const clearHistory = () => {
    setCalculationHistory([])
  }

  const cycleCalculatorMode = () => {
    setCalculatorMode(prev => {
      if (prev === 'standard') return 'scientific'
      if (prev === 'scientific') return 'graph'
      return 'standard'
    })
  }

  const getCalculatorIcon = () => {
    switch (calculatorMode) {
      case 'standard': return <Calculator className="text-primary" size={24} />
      case 'scientific': return <FunctionSquare className="text-primary" size={24} />
      case 'graph': return <LineChart className="text-primary" size={24} />
      default: return <Calculator className="text-primary" size={24} />
    }
  }

  const getCalculatorTitle = () => {
    switch (calculatorMode) {
      case 'standard': return 'Smart Calculator'
      case 'scientific': return 'Scientific Calculator'
      case 'graph': return 'Graph & Equations'
      default: return 'Smart Calculator'
    }
  }

  const getNextModeLabel = () => {
    switch (calculatorMode) {
      case 'standard': return 'Scientific'
      case 'scientific': return 'Graph & Eq'
      case 'graph': return 'Standard'
      default: return 'Scientific'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCalculatorIcon()}
            <h1 className="text-2xl font-bold">
              {getCalculatorTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={cycleCalculatorMode}
              className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary-dark transition-colors"
            >
              <ArrowLeftRight size={16} />
              {getNextModeLabel()}
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              <Clock size={16} />
              History
              {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </motion.button>
          </div>
        </div>
        
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-medium">Calculation History</h2>
                  <button 
                    onClick={clearHistory}
                    className="text-xs flex items-center gap-1 text-surface-500 hover:text-accent transition-colors"
                  >
                    <RotateCcw size={12} />
                    Clear
                  </button>
                </div>
                
                <div className="max-h-48 overflow-y-auto scrollbar-hide">
                  {calculationHistory.length > 0 ? (
                    <ul className="space-y-2">
                      {calculationHistory.map((entry, index) => (
                        <li key={index} className="text-sm p-2 rounded bg-surface-50 dark:bg-surface-700">
                          <div className="font-mono">{entry.expression} = {entry.result}</div>
                          <div className="text-xs text-surface-500">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-surface-500 text-center py-4">
                      No calculations yet
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          {calculatorMode === 'standard' && (
            <motion.div
              key="standard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <MainFeature onCalculate={addToHistory} />
            </motion.div>
          )}
          
          {calculatorMode === 'scientific' && (
            <motion.div
              key="scientific"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ScientificCalculator onCalculate={addToHistory} />
            </motion.div>
          )}

          {calculatorMode === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GraphEquationCalculator onCalculate={addToHistory} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Home