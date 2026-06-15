import { useNavigate } from 'react-router-dom'
import { Scan, Eye, Pill, Banknote, Palette, Mic, AlertTriangle, History, Settings, Globe, Bell, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'

const features = [
  { id: 'ocr', lbl: 'feat.ocr', dsc: 'feat.ocrDesc', icon: Scan, path: '/ocr', gradient: 'from-blue-500 to-blue-700', bg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
  { id: 'object', lbl: 'feat.object', dsc: 'feat.objectDesc', icon: Eye, path: '/object-detection', gradient: 'from-purple-500 to-purple-700', bg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
  { id: 'medicine', lbl: 'feat.medicine', dsc: 'feat.medicineDesc', icon: Pill, path: '/medicine', gradient: 'from-green-500 to-green-700', bg: 'bg-green-500/10', iconColor: 'text-green-400' },
  { id: 'currency', lbl: 'feat.currency', dsc: 'feat.currencyDesc', icon: Banknote, path: '/currency', gradient: 'from-yellow-500 to-yellow-700', bg: 'bg-yellow-500/10', iconColor: 'text-yellow-400' },
  { id: 'color', lbl: 'feat.color', dsc: 'feat.colorDesc', icon: Palette, path: '/color-outfit', gradient: 'from-pink-500 to-pink-700', bg: 'bg-pink-500/10', iconColor: 'text-pink-400' },
  { id: 'voice', lbl: 'feat.voice', dsc: 'feat.voiceDesc', icon: Mic, path: '/voice-companion', gradient: 'from-cyan-500 to-cyan-700', bg: 'bg-cyan-500/10', iconColor: 'text-cyan-400' },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const { speak, t } = useApp()

  const handleFeatureClick = (feature) => { speak(t(feature.lbl)); navigate(feature.path) }

  return (
    <div className="screen-container">
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 bg-success rounded-full animate-pulse" /><span className="text-xs text-surface-400 font-medium">AI Active</span></div>
            <h1 className="text-2xl font-black text-white">{t('home.greeting')}</h1>
            <p className="text-surface-400 text-sm mt-1">{t('home.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/settings')} className="w-10 h-10 bg-surface-800 rounded-xl flex items-center justify-center hover:bg-surface-700 transition-colors" aria-label={t('nav.settings')}><Settings className="w-5 h-5 text-surface-400" /></button>
            <button onClick={() => { speak(t('home.notifications')); navigate('/history') }} className="w-10 h-10 bg-surface-800 rounded-xl flex items-center justify-center hover:bg-surface-700 transition-colors relative" aria-label={t('home.notifications')}><Bell className="w-5 h-5 text-surface-400" /><div className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full" /></button>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4">
        <button onClick={() => { speak(t('home.emergency')); navigate('/emergency') }} className="w-full bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-4 flex items-center justify-between active:scale-95 transition-all duration-200 shadow-glow-red" aria-label={t('home.emergency')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-white" /></div>
            <div className="text-left"><p className="text-white font-bold text-sm">{t('home.emergency')}</p><p className="text-red-200 text-xs">{t('home.emergencyDesc')}</p></div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">{t('home.features')}</h2>
          <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-primary-400 text-sm font-medium"><History className="w-4 h-4" />{t('nav.history')}</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {features.slice(0, 2).map((feature) => (<FeatureCard key={feature.id} feature={feature} onClick={() => handleFeatureClick(feature)} t={t} />))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {features.slice(2).map((feature) => (<FeatureCard key={feature.id} feature={feature} onClick={() => handleFeatureClick(feature)} t={t} />))}
        </div>

        <button onClick={() => navigate('/language')} className="w-full mt-3 p-4 bg-surface-900 border border-surface-800 rounded-2xl flex items-center justify-between active:scale-95 transition-all hover:border-primary-500/30" aria-label={t('set.language')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-800 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-surface-400" /></div>
            <div className="text-left"><p className="text-white font-semibold text-sm">{t('set.language')}</p><p className="text-surface-500 text-xs">English / தமிழ்</p></div>
          </div>
          <ChevronRight className="w-5 h-5 text-surface-500" />
        </button>
      </div>

      <BottomNav active="home" />
    </div>
  )
}

function FeatureCard({ feature, onClick, t }) {
  const Icon = feature.icon
  return (
    <button onClick={onClick} className="group relative aspect-square bg-surface-900 border border-surface-800 rounded-3xl p-5 flex flex-col justify-between active:scale-95 transition-all duration-200 hover:border-primary-500/30 hover:shadow-lg text-left overflow-hidden" aria-label={`${t(feature.lbl)}: ${t(feature.dsc)}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${feature.gradient} opacity-5`} />
      <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center`}><Icon className={`w-6 h-6 ${feature.iconColor}`} strokeWidth={1.5} /></div>
      <div><p className="text-white font-bold text-sm leading-tight">{t(feature.lbl)}</p><p className="text-surface-500 text-xs mt-1">{t(feature.dsc)}</p></div>
    </button>
  )
}
