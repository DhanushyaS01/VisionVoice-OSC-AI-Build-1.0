import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function PageHeader({ title, subtitle, onSpeak, speakText, showBack = true }) {
  const navigate = useNavigate()
  const { speak } = useApp()

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak()
    } else if (speakText) {
      speak(speakText)
    } else {
      speak(title)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 pt-6 pb-4">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-surface-800 rounded-xl flex items-center justify-center hover:bg-surface-700 transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-surface-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={handleSpeak}
        className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center hover:bg-primary-500/30 transition-colors"
        aria-label="Read page aloud"
      >
        <Volume2 className="w-5 h-5 text-primary-400" />
      </button>
    </div>
  )
}
