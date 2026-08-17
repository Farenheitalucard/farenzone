import { useEffect, useState } from 'react'
import { LanguageContext } from './language-context'
import { translations } from './i18n'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('farenzone-lang')
    return saved === 'en' ? 'en' : 'es'
  })

  useEffect(() => {
    localStorage.setItem('farenzone-lang', lang)
  }, [lang])

  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
