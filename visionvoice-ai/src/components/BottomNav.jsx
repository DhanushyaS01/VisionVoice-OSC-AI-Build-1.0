import { useNavigate } from 'react-router-dom'
import { Home, History, Settings, Mic, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { id: 'home', icon: Home, key: 'nav.home', path: '/home' },
  { id: 'voice', icon: Mic, key: 'nav.voice', path: '/voice-companion' },
  { id: 'emergency', icon: AlertTriangle, key: 'home.emergency', path: '/emergency', danger: true, short: 'SOS' },
  { id: 'history', icon: History, key: 'nav.history', path: '/history' },
  { id: 'settings', icon: Settings, key: 'nav.settings', path: '/settings' },
]

export default function BottomNav({ active }) {
  const navigate = useNavigate()
  const { t } = useApp()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          const isDanger = item.danger
          const label = item.short || t(item.key)
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[60px] ${
                isDanger ? 'bg-red-500/20 hover:bg-red-500/30' : isActive ? 'bg-primary-500/20' : 'hover:bg-surface-800'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${isDanger ? 'text-red-400' : isActive ? 'text-primary-400' : 'text-surface-500'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] font-semibold ${isDanger ? 'text-red-400' : isActive ? 'text-primary-400' : 'text-surface-500'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
