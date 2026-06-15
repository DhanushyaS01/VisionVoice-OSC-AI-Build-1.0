import { useRef, useState } from 'react'
import { Pill, Volume2, RefreshCw, AlertTriangle, Calendar, Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CameraViewfinder from '../components/CameraViewfinder'
import LoadingState from '../components/LoadingState'
import BottomNav from '../components/BottomNav'
import ErrorBanner from '../components/ErrorBanner'
import { useApp } from '../context/AppContext'
import { scanMedicine } from '../utils/api'

const mockMedicine = {
  name: 'Paracetamol Tablets IP', strength: '500mg', manufacturer: 'Cipla Ltd.',
  dosage: 'Adults: 1-2 tablets every 4-6 hours. Max 8 tablets/day.',
  warnings: ['Do not exceed recommended dose', 'Keep away from children'],
  expiry: '03/2027', expiryStatus: 'valid', mfgDate: '03/2025', batchNo: 'PCM-2025-0341',
  voiceSummary: 'This is Paracetamol 500 milligrams by Cipla. Take 1 to 2 tablets every 4 to 6 hours. It expires March 2027, which is valid.',
}

export default function MedicineReaderScreen() {
  const { speak, addHistory, t } = useApp()
  const cameraRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [medicine, setMedicine] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const expiryColors = { valid: 'badge-success', warning: 'badge-warning', expired: 'badge-danger' }
  const expiryLabel = { valid: t('med.valid'), warning: t('med.check'), expired: t('med.expired') }

  const handleScan = async () => {
    setIsScanning(true); setLoading(true); setMedicine(null); setNotice('')
    try {
      const blob = await cameraRef.current?.capture()
      const med = await scanMedicine(blob)
      setMedicine(med); speak(med.voiceSummary)
      addHistory({ type: 'Medicine', icon: 'pill', title: med.name, preview: med.voiceSummary, color: 'green' })
    } catch (e) {
      setMedicine(mockMedicine); setNotice(t('common.sample')); speak(mockMedicine.voiceSummary)
      addHistory({ type: 'Medicine', icon: 'pill', title: mockMedicine.name, preview: mockMedicine.voiceSummary, color: 'green' })
    } finally { setLoading(false); setIsScanning(false) }
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('med.title')} subtitle={t('med.subtitle')} speakText={`${t('med.title')}. ${t('med.subtitle')}`} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-4">
        <CameraViewfinder ref={cameraRef} isScanning={isScanning} label={t('med.cameraLabel')} />
        <div className="flex gap-3">
          <button onClick={handleScan} disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-3 disabled:opacity-50" aria-label={t('med.scan')}>
            <Pill className="w-5 h-5" /><span>{loading ? t('med.reading') : t('med.scan')}</span>
          </button>
          {medicine && (<button onClick={() => { setMedicine(null); setNotice('') }} className="w-14 h-14 btn-secondary flex items-center justify-center" aria-label={t('common.retry')}><RefreshCw className="w-5 h-5" /></button>)}
        </div>
        <ErrorBanner message={notice} variant="info" />
        {loading && <LoadingState message={t('med.loading')} />}
        {medicine && !loading && (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-gradient-to-br from-green-900/40 to-surface-900 border border-green-500/20 rounded-3xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2"><Pill className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-semibold uppercase tracking-wide">{t('med.detected')}</span></div>
                  <h2 className="text-xl font-bold text-white">{medicine.name}</h2>
                  <p className="text-surface-400 text-sm mt-1">{[medicine.strength, medicine.manufacturer].filter(Boolean).join(' · ')}</p>
                </div>
                <button onClick={() => speak(medicine.voiceSummary)} className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center" aria-label={t('common.listen')}><Volume2 className="w-5 h-5 text-green-400" /></button>
              </div>
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-4"><Calendar className="w-5 h-5 text-surface-400" /><h3 className="font-semibold text-white text-sm">{t('med.expiryInfo')}</h3></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-800 rounded-2xl p-3"><p className="text-surface-500 text-xs">{t('med.manufactured')}</p><p className="text-white font-semibold text-sm mt-1">{medicine.mfgDate}</p></div>
                <div className="bg-surface-800 rounded-2xl p-3">
                  <p className="text-surface-500 text-xs">{t('med.expires')}</p>
                  <div className="flex items-center gap-2 mt-1"><p className="text-white font-semibold text-sm">{medicine.expiry}</p><span className={expiryColors[medicine.expiryStatus]}>{expiryLabel[medicine.expiryStatus]}</span></div>
                </div>
              </div>
              <div className="mt-3 bg-surface-800 rounded-2xl p-3"><p className="text-surface-500 text-xs">{t('med.batch')}</p><p className="text-white font-semibold text-sm mt-1">{medicine.batchNo}</p></div>
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-3"><Info className="w-5 h-5 text-primary-400" /><h3 className="font-semibold text-white text-sm">{t('med.dosage')}</h3></div>
              <p className="text-surface-300 text-sm leading-relaxed">{medicine.dosage}</p>
            </div>
            {medicine.warnings?.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/20 rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-3"><AlertTriangle className="w-5 h-5 text-red-400" /><h3 className="font-semibold text-red-300 text-sm">{t('med.warnings')}</h3></div>
                <ul className="space-y-2">{medicine.warnings.map((w, i) => (<li key={i} className="flex items-center gap-2 text-surface-300 text-sm"><div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />{w}</li>))}</ul>
              </div>
            )}
            <button onClick={() => speak(medicine.voiceSummary)} className="w-full btn-accent flex items-center justify-center gap-3" aria-label={t('med.hear')}><Volume2 className="w-5 h-5" /><span>{t('med.hear')}</span></button>
          </div>
        )}
      </div>
      <BottomNav active="" />
    </div>
  )
}
