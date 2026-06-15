import { useRef, useState } from 'react'
import { Palette, Volume2, RefreshCw, Sparkles } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CameraViewfinder from '../components/CameraViewfinder'
import LoadingState from '../components/LoadingState'
import BottomNav from '../components/BottomNav'
import ErrorBanner from '../components/ErrorBanner'
import { useApp } from '../context/AppContext'
import { analyzeOutfit } from '../utils/api'

const mockOutfit = {
  primaryColor: 'Navy Blue', primaryHex: '#1e3a8a', secondaryColor: 'Beige', secondaryHex: '#d4b483',
  accentColor: 'White', accentHex: '#ffffff', outfit: 'Navy Blue & Beige clothing', occasion: ['Office', 'Business casual'],
  suggestions: ['This is a great business casual combination.', 'Pair with brown leather shoes for a complete look.'],
  voiceSummary: 'You are holding a navy blue and beige item. This is a great business casual combination. Pair with brown leather shoes.',
}

function ColorSwatch({ color, hex, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-2xl border-2 border-white/10 shadow-lg" style={{ backgroundColor: hex }} aria-label={`${label}: ${color}`} />
      <div className="text-center"><p className="text-white text-xs font-semibold">{color}</p><p className="text-surface-500 text-xs">{label}</p></div>
    </div>
  )
}

export default function ColorOutfitScreen() {
  const { speak, addHistory, t } = useApp()
  const cameraRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const handleScan = async () => {
    setIsScanning(true); setLoading(true); setResult(null); setNotice('')
    try {
      const blob = await cameraRef.current?.capture()
      const outfit = await analyzeOutfit(blob)
      setResult(outfit); speak(outfit.voiceSummary)
      addHistory({ type: 'Color', icon: 'palette', title: outfit.outfit, preview: outfit.voiceSummary, color: 'orange' })
    } catch (e) {
      setResult(mockOutfit); setNotice(t('common.sample')); speak(mockOutfit.voiceSummary)
      addHistory({ type: 'Color', icon: 'palette', title: mockOutfit.outfit, preview: mockOutfit.voiceSummary, color: 'orange' })
    } finally { setLoading(false); setIsScanning(false) }
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('col.title')} subtitle={t('col.subtitle')} speakText={`${t('col.title')}. ${t('col.subtitle')}`} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-4">
        <CameraViewfinder ref={cameraRef} isScanning={isScanning} label={t('col.cameraLabel')} />
        <div className="flex gap-3">
          <button onClick={handleScan} disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-3 disabled:opacity-50" aria-label={t('col.analyze')}>
            <Palette className="w-5 h-5" /><span>{loading ? t('col.analyzing') : t('col.analyze')}</span>
          </button>
          {result && (<button onClick={() => { setResult(null); setNotice('') }} className="w-14 h-14 btn-secondary flex items-center justify-center" aria-label={t('common.retry')}><RefreshCw className="w-5 h-5" /></button>)}
        </div>
        <ErrorBanner message={notice} variant="info" />
        {loading && <LoadingState message={t('col.loading')} />}
        {result && !loading && (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
              <h3 className="font-semibold text-white text-sm mb-4">{t('col.detected')}</h3>
              <div className="flex justify-around">
                <ColorSwatch color={result.primaryColor} hex={result.primaryHex} label={t('col.primary')} />
                <ColorSwatch color={result.secondaryColor} hex={result.secondaryHex} label={t('col.secondary')} />
                <ColorSwatch color={result.accentColor} hex={result.accentHex} label={t('col.accent')} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-900/30 to-surface-900 border border-pink-500/20 rounded-3xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2"><Palette className="w-4 h-4 text-pink-400" /><span className="text-pink-400 text-xs font-semibold uppercase">{t('col.outfit')}</span></div>
                  <p className="text-white font-semibold capitalize">{result.outfit}</p>
                </div>
                <button onClick={() => speak(result.voiceSummary)} className="w-9 h-9 bg-pink-500/20 rounded-xl flex items-center justify-center" aria-label={t('common.listen')}><Volume2 className="w-4 h-4 text-pink-400" /></button>
              </div>
              {result.occasion?.length > 0 && (<div className="flex flex-wrap gap-2 mt-3">{result.occasion.map((o, i) => (<span key={i} className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-300 text-xs font-medium">{o}</span>))}</div>)}
            </div>
            {result.suggestions?.length > 0 && (
              <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-yellow-400" /><h3 className="font-semibold text-white text-sm">{t('col.suggestions')}</h3></div>
                <ul className="space-y-3">{result.suggestions.map((s, i) => (<li key={i} className="flex items-start gap-3 text-surface-300 text-sm"><div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-yellow-400 text-xs font-bold">{i + 1}</span></div>{s}</li>))}</ul>
              </div>
            )}
            <button onClick={() => speak(result.voiceSummary)} className="w-full btn-accent flex items-center justify-center gap-3" aria-label={t('col.hear')}><Volume2 className="w-5 h-5" /><span>{t('col.hear')}</span></button>
          </div>
        )}
      </div>
      <BottomNav active="" />
    </div>
  )
}
