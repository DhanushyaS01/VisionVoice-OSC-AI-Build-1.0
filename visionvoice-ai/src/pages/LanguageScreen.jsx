import { Check, Globe } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'
import { useApp } from '../context/AppContext'

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', description: 'All features available in English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', description: 'அனைத்து அம்சங்களும் தமிழில் கிடைக்கும்' },
]

export default function LanguageScreen() {
  const { language, setLanguage, speak, t } = useApp()

  const handleSelect = (code) => {
    setLanguage(code)
    speak(code === 'ta' ? 'மொழி தமிழாக மாற்றப்பட்டது' : 'Language changed to English')
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('lang.title')} subtitle={t('lang.subtitle')} speakText={`${t('lang.title')}. ${t('lang.subtitle')}`} />
      <div className="flex-1 px-4 pb-28 space-y-4">
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Globe className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <p className="text-surface-300 text-sm leading-relaxed">{t('lang.info')}</p>
        </div>
        <div className="space-y-3">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code
            return (
              <button key={lang.code} onClick={() => handleSelect(lang.code)}
                className={`w-full p-5 rounded-3xl border text-left transition-all duration-200 active:scale-95 flex items-center gap-4 ${isSelected ? 'bg-primary-500/20 border-primary-500/50 shadow-glow' : 'bg-surface-900 border-surface-800 hover:border-surface-700'}`}
                aria-pressed={isSelected} aria-label={`Select ${lang.name}`}>
                <div className="text-4xl">{lang.flag}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><p className="text-white font-bold text-lg">{lang.nativeName}</p>{lang.code !== 'en' && (<span className="text-surface-400 text-sm">({lang.name})</span>)}</div>
                  <p className={`text-sm mt-1 ${isSelected ? 'text-primary-300' : 'text-surface-500'}`}>{lang.description}</p>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary-500 border-primary-400' : 'border-surface-600'}`}>{isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}</div>
              </button>
            )
          })}
        </div>
        <div className="text-center py-4"><p className="text-surface-500 text-sm">{t('lang.current')}: <span className="text-white font-semibold">{LANGUAGES.find(l => l.code === language)?.nativeName}</span></p></div>
      </div>
      <BottomNav active="" />
    </div>
  )
}
