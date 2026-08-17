import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.onerror = (msg, src, line, col, err) => {
  console.error('[FarenZone GlobalError]', msg, `at ${src}:${line}:${col}`, err)
}

window.addEventListener('error', (e) => {
  console.error('[FarenZone WindowError]', e.message, e.filename, e.lineno, e.error)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('[FarenZone UnhandledRejection]', e.reason)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
