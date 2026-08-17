import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './LanguageContext'
import { AdminProvider } from './AdminContext'
import { ThemeProvider } from './ThemeContext'
import { useLanguage } from './language-context'
import { Navbar } from './components/Navbar'
import { Home } from './components/Home'
import { ConsolePage } from './components/ConsolePage'
import { SearchPage } from './components/SearchPage'
import { GameDetail } from './components/GameDetail'
import { AdminPage } from './components/AdminPage'
import { loadGamesFromApi } from './data/store'
import './App.css'

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="footer">
      <span>FarenZone</span>
      <p>{t.footer.rights}</p>
    </footer>
  )
}

function App() {
  useEffect(() => {
    loadGamesFromApi()
  }, [])
  return (
    <ThemeProvider>
      <AdminProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Navbar />
            <div className="layout">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/consola/:id" element={<ConsolePage />} />
                <Route path="/buscar" element={<SearchPage />} />
                <Route path="/juego/:id" element={<GameDetail />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Home />} />
              </Routes>
              <Footer />
            </div>
          </BrowserRouter>
        </LanguageProvider>
      </AdminProvider>
    </ThemeProvider>
  )
}

export default App
