import { useLayoutEffect, useState } from 'react'
import { ThemeContext } from './theme-context'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('farenzone-theme')
    return saved === 'light' ? 'light' : 'dark'
  })

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('farenzone-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
