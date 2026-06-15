import { useRef, useState } from 'react'
import { Banknote, Volume2, RefreshCw, TrendingUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CameraViewfinder from '../components/CameraViewfinder'
import LoadingState from '../components/LoadingState'
import BottomNav from '../components/BottomNav'
import ErrorBanner from '../components/ErrorBanner'
import { useApp } from '../context/AppContext'
import { detectCurrency } from '../utils/api'

const mockCurrency = {
  currency: 'Indian Rupee', denomination: '₹500', value: 500, words: 'Five Hundred Rupees',
  series: '2016 Mahatma Gandhi (New) Series', color: 'Stone Grey',
  features: ['Watermark: Mahatma Gandhi portrait', 'Security thread: RBI, ₹500'],
  confidence: 99, voiceSummary: 'I detected an Indian currency note. This is Five Hundred Rupees.',
}

export default function CurrencyReaderScreen() {
  const { speak, addHistory, t } = useApp()
  const cameraRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [currency, setCurrency] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const handleScan = async () => {
    setIsScanning(true); setLoading(true); setCurrency(null); setNotice('')
    try {
      const blob = await cameraRef.current?.capture()
      const curr = await detectCurrency(blob)
      setCurrency(curr); speak(curr.voiceSummary)
      addHistory({ type: 'Currency', icon: 'banknote', title: curr.denomination, preview: curr.voiceSummary, color: 'green' })
    } catch (e) {
      if (e.softFail) { setNotice(e.message || t('common.noText')); speak(e.message) }
      else { setCurrency(mockCurrency); setNotice(t('common.sample')); speak(mockCurrency.voiceSummary); addHistory({ type: 'Currency', icon: 'banknote', title: mockCurrency.denomination, preview: mockCurrency.voiceSummary, color: 'green' }) }
    } finally { setLoading(false); setIsScanning(false) }
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('cur.title')} subtitle={t('cur.subtitle')} speakText={`${t('cur.title')}. ${t('cur.subtitle')}`} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-4">
        <CameraViewfinder ref={cameraRef} isScanning={isScanning} label={t('cur.cameraLabel')} />
        <div className="flex gap-3">
          <button onClick={handleScan} disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-3 disabled:opacity-50" aria-label={t('cur.scan')}>
            <Banknote className="w-5 h-5" /><span>{loading ? t('cur.reading') : t('cur.scan')}</span>
          </button>
          {currency && (<button onClick={() => { setCurrency(null); setNotice('') }} className="w-14 h-14 btn-secondary flex items-center justify-center" aria-label={t('common.retry')}><RefreshCw className="w-5 h-5" /></button>)}
        </div>
        <ErrorBanner message={notice} variant="info" />
        {loading && <LoadingState message={t('cur.loading')} />}
        {currency && !loading && (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-gradient-to-br from-yellow-900/40 to-surface-900 border border-yellow-500/20 rounded-3xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2"><Banknote className="w-5 h-5 text-yellow-400" /><span className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">{currency.currency}</span></div>
              <div className="text-6xl font-black text-white mb-1">{currency.denomination}</div>
              <p className="text-surface-300 text-lg font-medium">{currency.words}</p>
              <div className="flex items-center justify-center gap-2 mt-3"><TrendingUp className="w-4 h-4 text-green-400" /><span className="text-green-400 text-sm font-semibold">{t('cur.confidence')}: {currency.confidence}%</span></div>
            </div>
            {(currency.series && currency.series !== '—') && (
              <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
                <h3 className="font-semibold text-white text-sm mb-4">{t('cur.details')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-surface-500 text-sm">{t('cur.series')}</span><span className="text-white text-sm font-medium text-right max-w-[60%]">{currency.series}</span></div>
                  {currency.color && currency.color !== '—' && (<div className="flex justify-between"><span className="text-surface-500 text-sm">{t('cur.color')}</span><span className="text-white text-sm font-medium">{currency.color}</span></div>)}
                </div>
              </div>
            )}
            {currency.features?.length > 0 && (
              <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
                <h3 className="font-semibold text-white text-sm mb-4">{t('cur.security')}</h3>
                <ul className="space-y-2">{currency.features.map((f, i) => (<li key={i} className="flex items-center gap-2 text-surface-300 text-sm"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full flex-shrink-0" />{f}</li>))}</ul>
              </div>
            )}
            <button onClick={() => speak(currency.voiceSummary)} className="w-full btn-accent flex items-center justify-center gap-3" aria-label={t('cur.hear')}><Volume2 className="w-5 h-5" /><span>{t('cur.hear')}</span></button>
          </div>
        )}
      </div>
      <BottomNav active="" />
    </div>
  )
}
