import { useRef, useState } from 'react'
import { Scan, Volume2, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CameraViewfinder from '../components/CameraViewfinder'
import LoadingState from '../components/LoadingState'
import ResultCard from '../components/ResultCard'
import BottomNav from '../components/BottomNav'
import ErrorBanner from '../components/ErrorBanner'
import { useApp } from '../context/AppContext'
import { scanOCR } from '../utils/api'

const mockTexts = [
  'PARACETAMOL TABLETS IP 500mg\nTake 1-2 tablets every 4-6 hours as needed.\nDo not exceed 8 tablets in 24 hours.',
  'WARNING: This area is under CCTV surveillance\nTrespassers will be prosecuted\nContact security: +91 98765 43210',
  'Cafe Menu\nCappuccino - ₹120\nLatte - ₹140\nEspresso - ₹90\nMuffin - ₹60',
]

export default function OCRReaderScreen() {
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
      const data = await scanOCR(blob)
      const text = data.text || ''
      if (!text.trim()) {
        setNotice(data.ocrSpaceError ? `No text read. OCR engine error: ${data.ocrSpaceError}` : t('common.noText'))
      } else if (data.engine) {
        setNotice(`Read with ${data.engine}.`)
      }
      setResult(text)
      speak(data.voiceSummary || text)
      if (text.trim()) addHistory({ type: 'OCR', icon: 'scan', title: 'Text Scan', preview: text.slice(0, 60) + '...', color: 'blue' })
    } catch (e) {
      const text = mockTexts[Math.floor(Math.random() * mockTexts.length)]
      setResult(text); setNotice(t('common.sample')); speak(text)
      addHistory({ type: 'OCR', icon: 'scan', title: 'Text Scan', preview: text.slice(0, 60) + '...', color: 'blue' })
    } finally { setLoading(false); setIsScanning(false) }
  }

  const handleReset = () => { setResult(null); setIsScanning(false); setNotice('') }

  return (
    <div className="screen-container">
      <PageHeader title={t('ocr.title')} subtitle={t('ocr.subtitle')} speakText={`${t('ocr.title')}. ${t('ocr.subtitle')}`} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-4">
        <CameraViewfinder ref={cameraRef} isScanning={isScanning} label={t('ocr.cameraLabel')} />
        <div className="flex gap-3">
          <button onClick={handleScan} disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed" aria-label={t('ocr.scan')}>
            <Scan className="w-5 h-5" /><span>{loading ? t('ocr.scanning') : t('ocr.scan')}</span>
          </button>
          {result && (<button onClick={handleReset} className="w-14 h-14 btn-secondary flex items-center justify-center" aria-label={t('common.retry')}><RefreshCw className="w-5 h-5" /></button>)}
        </div>
        <ErrorBanner message={notice} variant="info" />
        {loading && <LoadingState message={t('ocr.reading')} />}
        {result && !loading && (
          <div className="space-y-3 animate-slide-up">
            <ResultCard title={t('ocr.detected')} content={result || '—'} icon={Scan} color="primary" />
            <button onClick={() => speak(result)} className="w-full btn-accent flex items-center justify-center gap-3" aria-label={t('ocr.listen')}>
              <Volume2 className="w-5 h-5" /><span>{t('ocr.listen')}</span>
            </button>
          </div>
        )}
        {!result && !loading && (<div className="text-center py-8"><p className="text-surface-500 text-sm">{t('ocr.empty')}</p></div>)}
      </div>
      <BottomNav active="" />
    </div>
  )
}
