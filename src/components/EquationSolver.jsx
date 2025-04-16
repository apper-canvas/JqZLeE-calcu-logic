import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Calculator, Lightbulb } from 'lucide-react'

function EquationSolver({ onCalculate }) {
  const [equation, setEquation] = useState('')
  const [variable, setVariable] = useState('x')
  const [solution, setSolution] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [examples, setExamples] = useState([
    { label: "Linear", equation: "2x + 3 = 7" },
    { label: "Quadratic", equation: "x^2 - 5x + 6 = 0" },
    { label: "With fractions", equation: "x/2 + 1/4 = 3/4" }
  ])
  const [showExamples, setShowExamples] = useState(false)

  // Linear equation solver
  const solveLinearEquation = (equation) => {
    try {
      // Format: ax + b = c
      // Move everything to the left side: ax + b - c = 0
      // Then x = (c - b) / a
      
      // Replace the equation to standard form ax + b = c
      let processedEq = equation.replace(/\s/g, ''); // Remove spaces
      
      // Split by equals sign
      const sides = processedEq.split('=');
      if (sides.length !== 2) throw new Error('Invalid equation format, expected format like "ax + b = c"');
      
      const leftSide = sides[0];
      const rightSide = sides[1];
      
      // Move everything to left-hand side
      // Construct new equation in form ax + b = 0
      const standardForm = `(${leftSide})-(${rightSide})`;
      
      // Find coefficient of x
      let xCoeff = 0;
      let constant = 0;
      
      // Helper function to evaluate terms
      const evaluateTerm = (term) => {
        if (term.includes(variable)) {
          // Term with variable
          const parts = term.split(variable);
          const coefficient = parts[0] === '' ? 1 : parts[0] === '-' ? -1 : parseFloat(parts[0]);
          xCoeff += coefficient;
        } else {
          // Constant term
          constant -= parseFloat(term);
        }
      };
      
      // Process each term in the standard form
      const terms = standardForm.match(/[+-]?[^+-]+/g) || [];
      terms.forEach(term => evaluateTerm(term));
      
      if (xCoeff === 0) {
        if (constant === 0) {
          return "Infinite solutions";
        } else {
          return "No solution";
        }
      }
      
      const solution = constant / xCoeff;
      return `${variable} = ${solution.toFixed(4).replace(/\.?0+$/, '')}`;
    } catch (e) {
      console.error("Error solving linear equation:", e);
      throw new Error("Could not solve the equation. Check format.");
    }
  };

  // Quadratic equation solver
  const solveQuadraticEquation = (equation) => {
    try {
      // Format: ax^2 + bx + c = 0
      // Using quadratic formula: x = (-b ± sqrt(b^2 - 4ac)) / 2a
      
      // Standardize the equation to ax^2 + bx + c = 0
      let processedEq = equation.replace(/\s/g, ''); // Remove spaces
      
      // Replace x^2 with x² for parsing
      processedEq = processedEq.replace(/x\^2/g, 'x²');
      
      // Split by equals sign
      const sides = processedEq.split('=');
      if (sides.length !== 2) throw new Error('Invalid format, expected format like "ax^2 + bx + c = 0"');
      
      // Move everything to left side
      const standardForm = `(${sides[0]})-(${sides[1]})`;
      
      // Extract coefficients
      let a = 0, b = 0, c = 0;
      
      // Match terms with x², x, and constants
      const quadraticRegex = /([+-]?\d*x²)/g;
      const linearRegex = /([+-]?\d*x(?!²))/g;
      const constantRegex = /([+-]?\d+)(?!x)/g;
      
      // Extract quadratic coefficient
      const quadraticTerms = standardForm.match(quadraticRegex) || [];
      quadraticTerms.forEach(term => {
        const coefficient = term.replace('x²', '');
        a += coefficient === '' ? 1 : coefficient === '+' ? 1 : coefficient === '-' ? -1 : parseFloat(coefficient);
      });
      
      // Extract linear coefficient
      const linearTerms = standardForm.match(linearRegex) || [];
      linearTerms.forEach(term => {
        const coefficient = term.replace('x', '');
        b += coefficient === '' ? 1 : coefficient === '+' ? 1 : coefficient === '-' ? -1 : parseFloat(coefficient);
      });
      
      // Extract constant term
      const constantTerms = standardForm.match(constantRegex) || [];
      constantTerms.forEach(term => {
        c += parseFloat(term);
      });
      
      // Calculate discriminant
      const discriminant = b * b - 4 * a * c;
      
      if (a === 0) {
        // Not a quadratic equation, it's linear
        if (b === 0) {
          if (c === 0) {
            return "Infinite solutions";
          } else {
            return "No solution";
          }
        } else {
          const x = -c / b;
          return `${variable} = ${x.toFixed(4).replace(/\.?0+$/, '')}`;
        }
      }
      
      if (discriminant < 0) {
        // Complex roots
        const realPart = -b / (2 * a);
        const imaginaryPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);
        return `${variable} = ${realPart.toFixed(4).replace(/\.?0+$/, '')} + ${imaginaryPart.toFixed(4).replace(/\.?0+$/, '')}i or ${variable} = ${realPart.toFixed(4).replace(/\.?0+$/, '')} - ${imaginaryPart.toFixed(4).replace(/\.?0+$/, '')}i`;
      } else if (discriminant === 0) {
        // One real root (double root)
        const x = -b / (2 * a);
        return `${variable} = ${x.toFixed(4).replace(/\.?0+$/, '')} (double root)`;
      } else {
        // Two real roots
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return `${variable} = ${x1.toFixed(4).replace(/\.?0+$/, '')} or ${variable} = ${x2.toFixed(4).replace(/\.?0+$/, '')}`;
      }
    } catch (e) {
      console.error("Error solving quadratic equation:", e);
      throw new Error("Could not solve the equation. Check format.");
    }
  };

  const solveEquation = () => {
    if (!equation || equation.trim() === '') {
      setError('Please enter an equation');
      return;
    }

    setLoading(true);
    setError('');
    setSolution(null);

    try {
      setTimeout(() => {
        try {
          // Determine equation type and solve
          if (equation.includes(`${variable}^2`) || equation.includes(`${variable}²`)) {
            const result = solveQuadraticEquation(equation);
            setSolution(result);
            if (onCalculate) {
              onCalculate(`Solve: ${equation}`, result);
            }
          } else {
            const result = solveLinearEquation(equation);
            setSolution(result);
            if (onCalculate) {
              onCalculate(`Solve: ${equation}`, result);
            }
          }
        } catch (e) {
          setError(e.message || 'Failed to solve equation');
        } finally {
          setLoading(false);
        }
      }, 500); // Small delay for better UX
    } catch (e) {
      setError('Error processing equation');
      setLoading(false);
    }
  };

  const loadExample = (exampleEquation) => {
    setEquation(exampleEquation);
    setShowExamples(false);
  };

  return (
    <div className="equation-solver mt-3">
      <div className="mb-4">
        <label htmlFor="equation-input" className="text-sm text-surface-600 dark:text-surface-400 mb-1 block">
          Enter an equation to solve (e.g., 2x + 3 = 7)
        </label>
        <div className="flex gap-2">
          <input
            id="equation-input"
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="Enter equation"
            className="equation-input flex-1"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={solveEquation}
            className="calculator-key-equals px-4"
          >
            Solve
          </motion.button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <label htmlFor="variable-input" className="text-sm text-surface-600 dark:text-surface-400">
              Variable:
            </label>
            <input
              id="variable-input"
              type="text"
              value={variable}
              onChange={(e) => setVariable(e.target.value.charAt(0) || 'x')}
              className="p-1 w-10 text-center rounded border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800"
              maxLength="1"
            />
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-1 text-xs text-surface-500 hover:text-primary transition-colors"
          >
            <Lightbulb size={14} />
            {showExamples ? 'Hide Examples' : 'Show Examples'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <h3 className="text-sm font-medium mb-2">Examples:</h3>
              <div className="grid grid-cols-3 gap-2">
                {examples.map((example, index) => (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadExample(example.equation)}
                    className="text-xs p-2 rounded bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  >
                    <div className="font-medium">{example.label}</div>
                    <div className="font-mono">{example.equation}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="solution-area min-h-20 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-100/50 dark:bg-surface-800/50 z-10 rounded-xl">
            <RefreshCw size={24} className="animate-spin text-primary" />
          </div>
        )}
        
        {error && (
          <div className="equation-solution">
            <p className="text-accent">{error}</p>
          </div>
        )}
        
        {solution && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="equation-solution"
          >
            <div className="text-lg font-medium mb-1">Solution:</div>
            <div className="text-xl font-mono">{solution}</div>
          </motion.div>
        )}
        
        {!solution && !error && !loading && (
          <div className="equation-solution flex items-center justify-center text-surface-500 min-h-20">
            <p>Enter an equation and click Solve</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <Calculator size={14} />
          <span>Equation Solver</span>
        </div>
      </div>
    </div>
  )
}

export default EquationSolver