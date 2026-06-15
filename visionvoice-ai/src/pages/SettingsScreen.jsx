import { useState } from 'react'
import { Moon, Sun, Volume2, VolumeX, Globe, Contrast, Type, ChevronRight, Info, Shield, Star, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import BottomNav from '../components/BottomNav'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

function ToggleSwitch({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full transition-all duration-300 relative ${value ? 'bg-primary-500' : 'bg-surface-700'}`} aria-label={label} aria-pressed={value} role="switch">
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

function SettingsSection({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-1 mb-3">{title}</h3>
      <div className="bg-surface-900 border border-surface-800 rounded-3xl overflow-hidden">{children}</div>
    </div>
  )
}

function SettingsRow({ icon: Icon, iconBg, iconColor, label, subtitle, action, isLast, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={`w-full text-left flex items-center gap-4 p-4 ${!isLast ? 'border-b border-surface-800' : ''} ${onClick ? 'hover:bg-surface-800/50 transition-colors' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
      <div className="flex-1"><p className="text-white font-medium text-sm">{label}</p>{subtitle && <p className="text-surface-500 text-xs mt-0.5">{subtitle}</p>}</div>
      {action}
    </Tag>
  )
}

export default function SettingsScreen() {
  const { theme, setTheme, voiceEnabled, setVoiceEnabled, speechRate, setSpeechRate, highContrast, setHighContrast, fontSize, setFontSize, language, t, speak } = useApp()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null) // { title, body }
  const fontLabel = { small: t('set.small'), normal: t('set.normal'), large: t('set.large') }

  const openModal = (titleKey, bodyKey) => { const m = { title: t(titleKey), body: t(bodyKey) }; setModal(m); speak(m.body) }

  return (
    <div className="screen-container">
      <PageHeader title={t('set.title')} subtitle={t('set.subtitle')} speakText={`${t('set.title')}. ${t('set.subtitle')}`} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-6">
        <div className="bg-gradient-to-br from-primary-900/40 to-surface-900 border border-primary-500/20 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-700 rounded-2xl flex items-center justify-center"><span className="text-2xl font-black text-white">V</span></div>
          <div><p className="text-white font-bold text-lg">VisionVoice AI</p><p className="text-surface-400 text-sm">Version 1.0.0</p><div className="badge-primary mt-2">Hackathon Edition</div></div>
        </div>

        <SettingsSection title={t('set.appearance')}>
          <SettingsRow icon={theme === 'dark' ? Moon : Sun} iconBg="bg-indigo-500/10" iconColor="text-indigo-400" label={t('set.theme')} subtitle={theme === 'dark' ? t('set.dark') : t('set.light')}
            action={<ToggleSwitch value={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} label={t('set.theme')} />} />
          <SettingsRow icon={Contrast} iconBg="bg-surface-700" iconColor="text-surface-300" label={t('set.contrast')} subtitle={t('set.contrastSub')}
            action={<ToggleSwitch value={highContrast} onChange={setHighContrast} label={t('set.contrast')} />} />
          <SettingsRow icon={Type} iconBg="bg-surface-700" iconColor="text-surface-300" label={t('set.fontSize')} subtitle={fontLabel[fontSize]} isLast
            action={<div className="flex gap-2">{['small', 'normal', 'large'].map(s => (<button key={s} onClick={() => setFontSize(s)} className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${fontSize === s ? 'bg-primary-500 text-white' : 'bg-surface-700 text-surface-400'}`} aria-label={fontLabel[s]}>{fontLabel[s]}</button>))}</div>} />
        </SettingsSection>

        <SettingsSection title={t('set.voiceAudio')}>
          <SettingsRow icon={voiceEnabled ? Volume2 : VolumeX} iconBg="bg-cyan-500/10" iconColor="text-cyan-400" label={t('set.voiceFeedback')} subtitle={t('set.voiceFeedbackSub')}
            action={<ToggleSwitch value={voiceEnabled} onChange={setVoiceEnabled} label={t('set.voiceFeedback')} />} />
          <SettingsRow icon={Volume2} iconBg="bg-cyan-500/10" iconColor="text-cyan-400" label={t('set.speechRate')} subtitle={`${speechRate.toFixed(1)}x ${t('set.speed')}`} isLast
            action={<div className="flex items-center gap-2">
              <button onClick={() => setSpeechRate(r => Math.max(0.5, +(r - 0.25).toFixed(2)))} className="w-8 h-8 bg-surface-700 rounded-xl flex items-center justify-center text-white font-bold hover:bg-surface-600" aria-label="−">−</button>
              <span className="text-white font-semibold text-sm w-8 text-center">{speechRate.toFixed(1)}</span>
              <button onClick={() => setSpeechRate(r => Math.min(2.0, +(r + 0.25).toFixed(2)))} className="w-8 h-8 bg-surface-700 rounded-xl flex items-center justify-center text-white font-bold hover:bg-surface-600" aria-label="+">+</button>
            </div>} />
        </SettingsSection>

        <SettingsSection title={t('set.language')}>
          <SettingsRow icon={Globe} iconBg="bg-green-500/10" iconColor="text-green-400" label={t('set.appLanguage')} subtitle={language === 'ta' ? 'தமிழ்' : 'English'} isLast onClick={() => navigate('/language')}
            action={<span className="flex items-center gap-1 text-primary-400 text-sm">{t('set.change')}<ChevronRight className="w-4 h-4" /></span>} />
        </SettingsSection>

        <SettingsSection title={t('set.about')}>
          <SettingsRow icon={Info} iconBg="bg-blue-500/10" iconColor="text-blue-400" label={t('set.aboutApp')} subtitle={t('set.aboutSub')} onClick={() => openModal('set.aboutApp', 'set.aboutBody')} action={<ChevronRight className="w-5 h-5 text-surface-500" />} />
          <SettingsRow icon={Shield} iconBg="bg-surface-700" iconColor="text-surface-300" label={t('set.privacy')} subtitle={t('set.privacySub')} onClick={() => openModal('set.privacy', 'set.privacyBody')} action={<ChevronRight className="w-5 h-5 text-surface-500" />} />
          <SettingsRow icon={Star} iconBg="bg-yellow-500/10" iconColor="text-yellow-400" label={t('set.rate')} subtitle={t('set.rateSub')} isLast onClick={() => openModal('set.rate', 'set.rateBody')} action={<ChevronRight className="w-5 h-5 text-surface-500" />} />
        </SettingsSection>

        <div className="text-center py-4"><p className="text-surface-600 text-xs">VisionVoice AI v1.0.0</p><p className="text-surface-700 text-xs mt-1">Built for Hackathon 2026 · AI for Social Impact</p></div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-md bg-surface-900 border border-surface-800 rounded-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg">{modal.title}</h3>
              <button onClick={() => setModal(null)} className="w-8 h-8 bg-surface-800 rounded-xl flex items-center justify-center" aria-label={t('sos.close')}><X className="w-4 h-4 text-surface-400" /></button>
            </div>
            <p className="text-surface-300 text-sm leading-relaxed">{modal.body}</p>
            <button onClick={() => setModal(null)} className="w-full btn-primary mt-5">{t('sos.close')}</button>
          </div>
        </div>
      )}
      <BottomNav active="settings" />
    </div>
  )
}
