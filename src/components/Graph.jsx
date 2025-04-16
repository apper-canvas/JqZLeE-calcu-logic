import { useEffect, useState } from 'react'
import Chart from 'react-apexcharts'
import { motion } from 'framer-motion'
import { RefreshCw, ZoomIn, ZoomOut, Plus, Minus } from 'lucide-react'

function Graph({ expression, onCalculate }) {
  const [series, setSeries] = useState([])
  const [error, setError] = useState('')
  const [xRange, setXRange] = useState([-10, 10])
  const [yRange, setYRange] = useState([-10, 10])
  const [loading, setLoading] = useState(false)
  
  const evaluateExpression = (x, expr) => {
    try {
      // Replace common mathematical functions with their Math equivalents
      const processedExpr = expr
        .replace(/x/g, x)
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/e\^/g, 'Math.exp(')
        .replace(/π/g, 'Math.PI')
        .replace(/\^/g, '**');
        
      // Evaluate the expression
      return new Function('return ' + processedExpr)();
    } catch (e) {
      return null;
    }
  }

  const generatePoints = () => {
    if (!expression || expression.trim() === '') {
      setSeries([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate points for the graph
      const step = (xRange[1] - xRange[0]) / 100;
      const points = [];
      
      for (let x = xRange[0]; x <= xRange[1]; x += step) {
        try {
          const y = evaluateExpression(x, expression);
          
          // Check if the result is a valid number within the y-range
          if (y !== null && !isNaN(y) && isFinite(y) && y >= yRange[0] && y <= yRange[1]) {
            points.push([x, y]);
          }
        } catch (e) {
          // Skip points that can't be evaluated
        }
      }
      
      if (points.length === 0) {
        setError('No valid points to display in the current range');
        setSeries([]);
      } else {
        setSeries([{
          name: expression,
          data: points
        }]);
        
        if (onCalculate) {
          onCalculate(`Graph: ${expression}`, 'Displayed');
        }
      }
    } catch (e) {
      setError('Error generating graph: ' + e.message);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generatePoints();
  }, [expression, xRange, yRange]);

  const zoomIn = () => {
    setXRange([xRange[0] / 1.5, xRange[1] / 1.5]);
    setYRange([yRange[0] / 1.5, yRange[1] / 1.5]);
  }

  const zoomOut = () => {
    setXRange([xRange[0] * 1.5, xRange[1] * 1.5]);
    setYRange([yRange[0] * 1.5, yRange[1] * 1.5]);
  }

  const increaseXRange = () => {
    setXRange([xRange[0] - 2, xRange[1] + 2]);
  }

  const decreaseXRange = () => {
    if (xRange[1] - xRange[0] > 4) {
      setXRange([xRange[0] + 1, xRange[1] - 1]);
    }
  }

  const resetView = () => {
    setXRange([-10, 10]);
    setYRange([-10, 10]);
  }

  const chartOptions = {
    chart: {
      id: 'function-graph',
      type: 'line',
      animations: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      background: 'transparent'
    },
    colors: ['#3b82f6'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: '#e0e0e0',
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.5
      },
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    markers: {
      size: 0
    },
    tooltip: {
      x: {
        show: true,
        formatter: (val) => val.toFixed(2)
      },
      y: {
        formatter: (val) => val.toFixed(4)
      }
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 10,
      min: xRange[0],
      max: xRange[1],
      labels: {
        formatter: (val) => val.toFixed(1)
      },
      axisBorder: {
        show: true,
        color: '#78909c'
      },
      axisTicks: {
        show: true,
        color: '#78909c'
      }
    },
    yaxis: {
      type: 'numeric',
      tickAmount: 10,
      min: yRange[0],
      max: yRange[1],
      labels: {
        formatter: (val) => val.toFixed(1)
      }
    },
    theme: {
      mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
  }

  return (
    <div className="graph-component mt-3">
      <div className="graph-container h-72 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-100/50 dark:bg-surface-800/50 z-10">
            <RefreshCw size={30} className="animate-spin text-primary" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-100/80 dark:bg-surface-800/80 z-10">
            <div className="text-accent text-center p-4">
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {series.length > 0 && (
          <Chart 
            options={chartOptions} 
            series={series} 
            type="line" 
            height="100%" 
          />
        )}
        
        {series.length === 0 && !loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-surface-500">Enter a function to graph</p>
          </div>
        )}
      </div>
      
      <div className="graph-controls flex items-center justify-center gap-2 mt-3">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={zoomIn}
          className="calculator-key-scientific p-2 h-10 w-10"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={zoomOut}
          className="calculator-key-scientific p-2 h-10 w-10"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={decreaseXRange}
          className="calculator-key-scientific p-2 h-10 w-10"
          title="Decrease Range"
        >
          <Minus size={16} />
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={increaseXRange}
          className="calculator-key-scientific p-2 h-10 w-10"
          title="Increase Range"
        >
          <Plus size={16} />
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={resetView}
          className="calculator-key-scientific p-2 h-10"
          title="Reset View"
        >
          <RefreshCw size={16} className="mr-1" />
          Reset
        </motion.button>
      </div>
      
      <div className="graph-info text-xs text-center mt-3 text-surface-500">
        <p>X: [{xRange[0].toFixed(1)}, {xRange[1].toFixed(1)}] • Y: [{yRange[0].toFixed(1)}, {yRange[1].toFixed(1)}]</p>
      </div>
    </div>
  )
}

export default Graph