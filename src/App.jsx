import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode')
    return savedMode ? JSON.parse(savedMode) : false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.div 
            initial={{ rotate: -20 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            ICal
          </motion.div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </header>
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-surface-500">
        <p>© {new Date().getFullYear()} ICal. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App