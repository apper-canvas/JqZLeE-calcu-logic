import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Delete, Divide, Plus, Minus, 
  Percent, RotateCcw, Calculator,
  ArrowLeft, ArrowRight, Power, Hash
} from 'lucide-react'

function ScientificCalculator({ onCalculate }) {
  const [input, setInput] = useState('0')
  const [result, setResult] = useState('')
  const [calculated, setCalculated] = useState(false)
  const [error, setError] = useState('')
  const [animation, setAnimation] = useState(false)
  const [isDegreeMode, setIsDegreeMode] = useState(true)
  const [isInverseMode, setIsInverseMode] = useState(false)
  
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
      let sanitizedInput = input
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, Math.PI)
        .replace(/e/g, Math.E)
      
      // Handle special functions
      sanitizedInput = sanitizedInput
        .replace(/sin\(([^)]+)\)/g, (_, arg) => {
          const val = parseFloat(evaluateSubExpression(arg))
          return isDegreeMode ? Math.sin(val * Math.PI / 180) : Math.sin(val)
        })
        .replace(/cos\(([^)]+)\)/g, (_, arg) => {
          const val = parseFloat(evaluateSubExpression(arg))
          return isDegreeMode ? Math.cos(val * Math.PI / 180) : Math.cos(val)
        })
        .replace(/tan\(([^)]+)\)/g, (_, arg) => {
          const val = parseFloat(evaluateSubExpression(arg))
          return isDegreeMode ? Math.tan(val * Math.PI / 180) : Math.tan(val)
        })
        .replace(/asin\(([^)]+)\)/g, (_, arg) => {
          const val = parseFloat(evaluateSubExpression(arg))
          return isDegreeMode ? Math.asin(val) * 180 / Math.PI : Math.asin(val)
        })
        .replace(/acos\(([^)]+)\)/g, (_, arg) => {
          const val = parseFloat(evaluateSubExpression(arg))
          return isDegreeMode ? Math.acos(val) * 180 / Math.PI : Math.acos(val)
        })
        .replace(/atan\(([^)]+)\)/g, (_, arg) => {
          const val = parseFloat(evaluateSubExpression(arg))
          return isDegreeMode ? Math.atan(val) * 180 / Math.PI : Math.atan(val)
        })
        .replace(/log\(([^)]+)\)/g, (_, arg) => {
          return Math.log10(parseFloat(evaluateSubExpression(arg)))
        })
        .replace(/ln\(([^)]+)\)/g, (_, arg) => {
          return Math.log(parseFloat(evaluateSubExpression(arg)))
        })
        .replace(/sqrt\(([^)]+)\)/g, (_, arg) => {
          return Math.sqrt(parseFloat(evaluateSubExpression(arg)))
        })
        .replace(/\^/g, '**')
      
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

  // Helper function to evaluate sub-expressions
  const evaluateSubExpression = (expr) => {
    try {
      return new Function('return ' + expr)()
    } catch (e) {
      return expr
    }
  }
  
  const handleFunction = (func) => {
    setError('')
    
    try {
      if (calculated) {
        setInput(`${func}(${result})`)
        setCalculated(false)
        return
      }
      
      // If there's already content, wrap it in the function
      if (input !== '0') {
        setInput(`${func}(${input})`)
      } else {
        setInput(`${func}(`)
      }
    } catch (err) {
      setError('Invalid operation')
      setAnimation(true)
    }
  }
  
  const handleTrigFunction = (func) => {
    let trigFunc = func
    
    // Handle inverse trig functions
    if (isInverseMode) {
      if (func === 'sin') trigFunc = 'asin'
      else if (func === 'cos') trigFunc = 'acos'
      else if (func === 'tan') trigFunc = 'atan'
    }
    
    handleFunction(trigFunc)
  }
  
  const handlePower = (power) => {
    if (calculated) {
      setInput(result + power)
      setCalculated(false)
      return
    }
    
    setInput(prev => prev + power)
  }
  
  const handleConstant = (constant) => {
    if (calculated) {
      setInput(constant)
      setCalculated(false)
      return
    }
    
    // If the input is just 0, replace it with the constant
    if (input === '0') {
      setInput(constant)
    } else {
      // If the last character is an operator or open parenthesis, we can just add the constant
      const lastChar = input.slice(-1)
      if (['+', '-', '*', '/', '('].includes(lastChar)) {
        setInput(prev => prev + constant)
      } else {
        // Otherwise, add a multiplication operator before the constant
        setInput(prev => prev + '*' + constant)
      }
    }
  }
  
  const handleParenthesis = (paren) => {
    if (calculated) {
      setInput(paren)
      setCalculated(false)
      return
    }
    
    setInput(prev => prev === '0' ? paren : prev + paren)
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
      
      <div className="flex gap-2 mb-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDegreeMode(!isDegreeMode)}
          className={`calculator-key-function text-xs py-2 flex-1 ${isDegreeMode ? 'bg-secondary' : 'bg-secondary-light/90'}`}
        >
          {isDegreeMode ? 'DEG' : 'RAD'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsInverseMode(!isInverseMode)}
          className={`calculator-key-function text-xs py-2 flex-1 ${isInverseMode ? 'bg-secondary' : 'bg-secondary-light/90'}`}
        >
          {isInverseMode ? 'INV' : 'NORM'}
        </motion.button>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {/* Row 1 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTrigFunction('sin')}
          className="calculator-key-scientific"
        >
          {isInverseMode ? 'sin⁻¹' : 'sin'}
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTrigFunction('cos')}
          className="calculator-key-scientific"
        >
          {isInverseMode ? 'cos⁻¹' : 'cos'}
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTrigFunction('tan')}
          className="calculator-key-scientific"
        >
          {isInverseMode ? 'tan⁻¹' : 'tan'}
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleFunction('log')}
          className="calculator-key-scientific"
        >
          log
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleFunction('ln')}
          className="calculator-key-scientific"
        >
          ln
        </motion.button>
        
        {/* Row 2 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleConstant('π')}
          className="calculator-key-scientific"
        >
          π
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleConstant('e')}
          className="calculator-key-scientific"
        >
          e
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePower('^')}
          className="calculator-key-scientific"
        >
          <Power size={16} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePower('^2')}
          className="calculator-key-scientific"
        >
          x²
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleFunction('sqrt')}
          className="calculator-key-scientific"
        >
          √
        </motion.button>
        
        {/* Row 3 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleParenthesis('(')}
          className="calculator-key-function"
        >
          (
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleParenthesis(')')}
          className="calculator-key-function"
        >
          )
        </motion.button>
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
          onClick={handleDelete}
          className="calculator-key-function"
        >
          <Delete size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperatorInput('/')}
          className="calculator-key-operation"
        >
          <Divide size={18} />
        </motion.button>
        
        {/* Row 4 */}
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
          onClick={() => handleNumberInput('%')}
          className="calculator-key-number"
        >
          <Percent size={18} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperatorInput('*')}
          className="calculator-key-operation"
        >
          <X size={18} />
        </motion.button>
        
        {/* Row 5 */}
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
          onClick={() => handleFunction('factorial')}
          className="calculator-key-number"
        >
          n!
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperatorInput('-')}
          className="calculator-key-operation"
        >
          <Minus size={18} />
        </motion.button>
        
        {/* Row 6 */}
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
          onClick={() => handleParenthesis('E')}
          className="calculator-key-number"
        >
          EXP
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOperatorInput('+')}
          className="calculator-key-operation"
        >
          <Plus size={18} />
        </motion.button>
        
        {/* Row 7 */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePower('*10^-')}
          className="calculator-key-number"
        >
          EE
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
          onClick={() => handleNumberInput('×10^')}
          className="calculator-key-number"
        >
          ×10ⁿ
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
          <span>CalcuLogic Scientific Mode</span>
        </div>
      </div>
    </motion.div>
  )
}

export default ScientificCalculator