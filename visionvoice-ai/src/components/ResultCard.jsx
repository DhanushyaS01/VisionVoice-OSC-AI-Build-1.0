import { Volume2, Copy, Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function ResultCard({ title, content, icon: Icon, color = 'primary' }) {
  const { speak } = useApp()
  const [copied, setCopied] = useState(false)

  const colorMap = {
    primary: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h3 className="font-semibold text-white text-sm">{title}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="w-8 h-8 bg-surface-800 rounded-xl flex items-center justify-center hover:bg-surface-700 transition-colors"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-surface-400" />
            )}
          </button>
          <button
            onClick={() => speak(content)}
            className="w-8 h-8 bg-primary-500/20 rounded-xl flex items-center justify-center hover:bg-primary-500/30 transition-colors"
            aria-label="Listen to result"
          >
            <Volume2 className="w-4 h-4 text-primary-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-surface-300 text-sm leading-relaxed">{content}</p>
    </div>
  )
}
