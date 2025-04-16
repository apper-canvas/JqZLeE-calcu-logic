import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Delete, Divide, Plus, Minus, 
  Percent, SquareRoot, ArrowLeft, 
  RotateCcw, Calculator
} from 'lucide-react'

function MainFeature({ onCalculate }) {
  const [input, setInput] = useState('0')
  const [result, setResult] = useState('')
  const [calculated, setCalculated] = useState(false)
  const [error, setError] = useState('')
  const [animation, setAnimation] = useState(false)
  
  // Reset animation state after it plays
  useEffect(() => {
    if (animation) {
      const timer = setTimeout(() => setAnimation(false), 300)
      return () => clearTimeout(timer)
    }
  }, [animation])

  const handleNumberInput = (num) => {
    setError('')
    
    if (calculated) {
      setInput(num)
      setCalculated(false)
      return
    }
    
    if (input === '0') {
      setInput(num)
    } else {
      setInput(prev => prev + num)
    }
  }
  
  const handleOperatorInput = (operator) => {
    setError('')
    setCalculated(false)
    
    // Don't allow consecutive operators except minus for negative numbers
    const lastChar = input.slice(-1)
    if (['+', '-', '*', '/', '.'].includes(lastChar) && operator !== '-') {
      setInput(prev => prev.slice(0, -1) + operator)
    } else {
      setInput(prev => prev + operator)
    }
  }
  
  const handleDecimal = () => {
    setError('')
    
    if (calculated) {
      setInput('0.')
      setCalculated(false)
      return
    }
    
    // Check if the last number already has a decimal
    const parts = input.split(/[-+*/]/)
    const lastPart = parts[parts.length - 1]
    
    if (!lastPart.includes('.')) {
      setInput(prev => prev + '.')
    }
  }
  
  const handleClear = () => {
    setInput('0')
    setResult('')
    setCalculated(false)
    setError('')
  }
  
  const handleDelete = () => {
    if (input.length === 1 || calculated) {
      setInput('0')
      setCalculated(false)
    } else {
      setInput(prev => prev.slice(0, -1))
    }
    setError('')
  }
  
  const handleEquals = () => {
    try {
      // Replace × with * and ÷ with / for evaluation
      const sanitizedInput = input.replace(/×/g, '*').replace(/÷/g, '/')
      
      // Validate input before evaluation
      if (/[+\-*/]$/.test(sanitizedInput)) {
        throw new Error("Expression can't end with an operator")
      }
      
      // Use Function constructor instead of eval for safer evaluation
      const calculatedResult = new Function('return ' + sanitizedInput)()
      
      // Format the result
      const formattedResult = Number.isInteger(calculatedResult) 
        ? calculatedResult.toString()
        : calculatedResult.toFixed(8).replace(/\.?0+$/, '')
      
      setResult(formattedResult)
      setCalculated(true)
      setAnimation(true)
      
      // Add to history
      if (onCalculate) {
        onCalculate(sanitizedInput, formattedResult)
      }
      
    } catch (err) {
      setError('Invalid expression')
      setAnimation(true)
    }
  }
  
  const handleSquareRoot = () => {
    try {
      const value = parseFloat(input)
      if (isNaN(value)) {
        throw new Error("Can't calculate square root of expression")
      }
      if (value < 0) {
        throw new Error("Can't calculate square root of negative number")
      }
      
      const sqrtResult = Math.sqrt(value)
      const formattedResult = sqrtResult.toFixed(8).replace(/\.?0+$/, '')
      
      setInput(formattedResult)
      setCalculated(true)
      
      // Add to history
      if (onCalculate) {
        onCalculate(`√(${value})`, formattedResult)
      }
      
    } catch (err) {
      setError(err.message)
      setAnimation(true)
    }
  }
  
  const handlePercentage = () => {
    try {
      const value = parseFloat(input)
      if (isNaN(value)) {
        throw new Error("Can't calculate percentage of expression")
      }
      
      const percentResult = value / 100
      const formattedResult = percentResult.toString()
      
      setInput(formattedResult)
      setCalculated(true)
      
      // Add to history
      if (onCalculate) {
        onCalculate(`${value}%`, formattedResult)
      }
      
    } catch (err) {
      setError(err.message)
      setAnimation(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl overflow-hidden dark:neu-effect-dark neu-effect-light p-6"
    >
      <div className="mb-4 relative">
        <div className="calculator-display min-h-[100px] flex flex-col items-end justify-between">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-accent text-sm self-start mt-1"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="text-surface-500 text-sm h-6 overflow-x-auto scrollbar-hide w-full text-right">
            {calculated && input}
          </div>
          
          <motion.div 
            animate={animation ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`text-3xl font-semibold overflow-x-auto scrollbar-hide w-full ${calculated ? 'text-primary-dark dark:text-primary-light' : ''}`}
          >
            {calculated ? result : input}
          </motion.div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleClear}
          className="calculator-key-function"
        >
          <RotateCcw size={18} className="mr-1" />
          C
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleSquareRoot}
          className="calculator-key-function"
        >
          <SquareRoot size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handlePercentage}
          className="calculator-key-function"
        >
          <Percent size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperatorInput('/')}
          className="calculator-key-operation"
        >
          <Divide size={18} />
        </motion.button>
        
        {/* Row 2 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('7')}
          className="calculator-key-number"
        >
          7
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('8')}
          className="calculator-key-number"
        >
          8
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('9')}
          className="calculator-key-number"
        >
          9
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperatorInput('*')}
          className="calculator-key-operation"
        >
          <X size={18} />
        </motion.button>
        
        {/* Row 3 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('4')}
          className="calculator-key-number"
        >
          4
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('5')}
          className="calculator-key-number"
        >
          5
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('6')}
          className="calculator-key-number"
        >
          6
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperatorInput('-')}
          className="calculator-key-operation"
        >
          <Minus size={18} />
        </motion.button>
        
        {/* Row 4 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('1')}
          className="calculator-key-number"
        >
          1
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('2')}
          className="calculator-key-number"
        >
          2
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('3')}
          className="calculator-key-number"
        >
          3
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperatorInput('+')}
          className="calculator-key-operation"
        >
          <Plus size={18} />
        </motion.button>
        
        {/* Row 5 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="calculator-key-number"
        >
          <Delete size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNumberInput('0')}
          className="calculator-key-number"
        >
          0
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleDecimal}
          className="calculator-key-number"
        >
          .
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleEquals}
          className="calculator-key-equals"
        >
          =
        </motion.button>
      </div>
      
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <Calculator size={14} />
          <span>CalcuLogic Standard Mode</span>
        </div>
      </div>
    </motion.div>
  )
}

export default MainFeature