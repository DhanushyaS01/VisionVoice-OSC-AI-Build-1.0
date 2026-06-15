import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { saveSettings } from '../utils/api'
import { translate } from '../utils/i18n'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'en')
  const [theme, setTheme] = useState('dark')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speechRate, setSpeechRate] = useState(1.0)
  const [fontSize, setFontSize] = useState('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [history, setHistory] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Priya (Sister)', phone: '+91 98765 43210', relation: 'Family' },
    { id: 2, name: 'Dr. Kumar', phone: '+91 87654 32109', relation: 'Doctor' },
    { id: 3, name: 'Ravi (Friend)', phone: '+91 76543 21098', relation: 'Friend' },
  ])

  // Translation helper.
  const t = useCallback((key) => translate(language, key), [language])

  const addHistory = (item) => {
    setHistory(prev => [{ ...item, id: Date.now(), timestamp: new Date() }, ...prev])
  }

  // Pick the best available voice for the current language.
  const pickVoice = (lang) => {
    if (!window.speechSynthesis) return null
    const voices = window.speechSynthesis.getVoices()
    const want = lang === 'ta' ? 'ta' : 'en'
    return (
      voices.find(v => v.lang?.toLowerCase().startsWith(want === 'ta' ? 'ta' : 'en-in')) ||
      voices.find(v => v.lang?.toLowerCase().startsWith(want)) ||
      null
    )
  }

  const speak = (text, options = {}) => {
    if (!voiceEnabled || !window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume || 1.0
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN'
    const v = pickVoice(language)
    if (v) utterance.voice = v
    window.speechSynthesis.speak(utterance)
  }

  // Warm up voices list (loads async in most browsers).
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Font size → root class (CSS scales rem-based UI)
  useEffect(() => {
    const el = document.documentElement
    el.classList.remove('font-small', 'font-normal', 'font-large')
    el.classList.add(`font-${fontSize}`)
  }, [fontSize])

  // High contrast → root class
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast)
  }, [highContrast])

  // Persist language for the API client (Accept-Language) + html lang attr
  useEffect(() => {
    localStorage.setItem('app_language', language)
    document.documentElement.lang = language === 'ta' ? 'ta' : 'en'
  }, [language])

  // Persist settings to backend (best-effort)
  useEffect(() => {
    saveSettings({
      languagePref: language,
      settings: { theme, voiceEnabled, speechRate, fontSize, highContrast },
    }).catch(() => {})
  }, [language, theme, voiceEnabled, speechRate, fontSize, highContrast])

  return (
    <AppContext.Provider
      value={{
        language, setLanguage, t,
        theme, setTheme,
        voiceEnabled, setVoiceEnabled,
        speechRate, setSpeechRate,
        fontSize, setFontSize,
        highContrast, setHighContrast,
        history, addHistory,
        emergencyContacts, setEmergencyContacts,
        speak,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
