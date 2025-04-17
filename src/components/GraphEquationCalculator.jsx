import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Calculator, ArrowLeftRight } from 'lucide-react'
import Graph from './Graph'
import EquationSolver from './EquationSolver'

function GraphEquationCalculator({ onCalculate }) {
  const [activeTab, setActiveTab] = useState('graph') // 'graph' or 'equation'
  const [expression, setExpression] = useState('sin(x)')
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl overflow-hidden dark:neu-effect-dark neu-effect-light p-6"
    >
      <div className="tabs flex gap-2 mb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('graph')}
          className={activeTab === 'graph' ? 'tab-button-active' : 'tab-button-inactive'}
        >
          <div className="flex items-center gap-2">
            <LineChart size={16} />
            <span>Graph Plotter</span>
          </div>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('equation')}
          className={activeTab === 'equation' ? 'tab-button-active' : 'tab-button-inactive'}
        >
          <div className="flex items-center gap-2">
            <Calculator size={16} />
            <span>Equation Solver</span>
          </div>
        </motion.button>
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'graph' && (
          <motion.div
            key="graph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <label htmlFor="function-input" className="text-sm text-surface-600 dark:text-surface-400 mb-1 block">
                Enter a function to graph (use 'x' as the variable)
              </label>
              <input
                id="function-input"
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g., x^2 or sin(x)"
                className="equation-input"
              />
              <div className="mt-2 text-xs text-surface-500">
                Examples: x^2, sin(x), cos(x), sqrt(x), x^3 - 2*x
              </div>
            </div>
            
            <Graph expression={expression} onCalculate={onCalculate} />
          </motion.div>
        )}
        
        {activeTab === 'equation' && (
          <motion.div
            key="equation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <EquationSolver onCalculate={onCalculate} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <ArrowLeftRight size={14} />
          <span>CalciPro Graph & Equations Mode</span>
        </div>
      </div>
    </motion.div>
  )
}

export default GraphEquationCalculator