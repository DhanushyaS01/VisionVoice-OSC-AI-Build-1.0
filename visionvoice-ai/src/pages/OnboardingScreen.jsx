import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Brain, Shield, ArrowRight, Check, Bell, Camera, Mic } from 'lucide-react'
import { useApp } from '../context/AppContext'

const slideMeta = [
  { id: 0, icon: <Eye className="w-16 h-16 text-white" strokeWidth={1.5} />, gradient: 'from-primary-600 to-primary-800', glow: 'bg-primary-500/20', badge: 'ob.badge1', title: 'ob.title1', desc: 'ob.desc1', features: ['ob.f1a', 'ob.f1b', 'ob.f1c'] },
  { id: 1, icon: <Brain className="w-16 h-16 text-white" strokeWidth={1.5} />, gradient: 'from-purple-600 to-purple-800', glow: 'bg-purple-500/20', badge: 'ob.badge2', title: 'ob.title2', desc: 'ob.desc2', features: ['ob.f2a', 'ob.f2b', 'ob.f2c'] },
  { id: 2, icon: <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />, gradient: 'from-green-600 to-green-800', glow: 'bg-green-500/20', badge: 'ob.badge3', title: 'ob.title3', desc: 'ob.desc3', features: ['ob.f3a', 'ob.f3b', 'ob.f3c'] },
  { id: 3, icon: <Camera className="w-16 h-16 text-white" strokeWidth={1.5} />, gradient: 'from-accent-500 to-accent-700', glow: 'bg-accent-500/20', badge: 'ob.badge4', title: 'ob.title4', desc: 'ob.desc4', isPermissions: true,
    permissions: [
      { icon: <Camera className="w-5 h-5" />, label: 'ob.pCam', desc: 'ob.pCamD' },
      { icon: <Mic className="w-5 h-5" />, label: 'ob.pMic', desc: 'ob.pMicD' },
      { icon: <Bell className="w-5 h-5" />, label: 'ob.pBell', desc: 'ob.pBellD' },
    ] },
]

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { t } = useApp()
  const [current, setCurrent] = useState(0)
  const [permissions, setPermissions] = useState([true, true, false])

  const slide = slideMeta[current]
  const isLast = current === slideMeta.length - 1

  const handleNext = () => { if (isLast) navigate('/home'); else setCurrent(c => c + 1) }
  const togglePermission = (index) => setPermissions(prev => prev.map((p, i) => i === index ? !p : p))

  return (
    <div className="screen-container bg-surface-950">
      <div className="flex justify-end p-4 pt-6">
        <button onClick={() => navigate('/home')} className="text-surface-400 text-sm font-medium px-4 py-2 rounded-xl hover:text-white hover:bg-surface-800 transition-all">{t('onboard.skip')}</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 animate-slide-up">
        <div className="relative mb-10">
          <div className={`absolute inset-0 ${slide.glow} rounded-full blur-2xl scale-150 animate-pulse-slow`} />
          <div className={`relative w-32 h-32 bg-gradient-to-br ${slide.gradient} rounded-[2.5rem] flex items-center justify-center shadow-elevated`}>{slide.icon}</div>
        </div>
        <div className="badge-primary mb-5"><span>{t(slide.badge)}</span></div>
        <h2 className="text-3xl font-black text-center text-white mb-4 leading-tight whitespace-pre-line">{t(slide.title)}</h2>
        <p className="text-surface-400 text-center text-base leading-relaxed mb-8">{t(slide.desc)}</p>
        {slide.isPermissions ? (
          <div className="w-full space-y-3">
            {slide.permissions.map((perm, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-surface-900 border border-surface-800 rounded-2xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${permissions[i] ? 'bg-success/20 text-green-400' : 'bg-surface-700 text-surface-400'}`}>{perm.icon}</div>
                <div className="flex-1"><p className="font-semibold text-white text-sm">{t(perm.label)}</p><p className="text-surface-500 text-xs">{t(perm.desc)}</p></div>
                <button onClick={() => togglePermission(i)} className={`w-12 h-6 rounded-full transition-all duration-300 relative ${permissions[i] ? 'bg-success' : 'bg-surface-700'}`} aria-label={t(perm.label)}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${permissions[i] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full space-y-3">
            {slide.features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4 text-primary-400" /></div>
                <span className="text-surface-300 text-sm">{t(f)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-6 pb-8 space-y-4">
        <div className="flex justify-center gap-2">
          {slideMeta.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-primary-400' : 'w-2 h-2 bg-surface-700 hover:bg-surface-600'}`} aria-label={`Slide ${i + 1}`} />))}
        </div>
        <button onClick={handleNext} className="w-full btn-primary flex items-center justify-center gap-3 text-lg" aria-label={isLast ? t('onboard.start') : t('onboard.next')}>
          <span>{isLast ? t('onboard.start') : t('onboard.next')}</span><ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
