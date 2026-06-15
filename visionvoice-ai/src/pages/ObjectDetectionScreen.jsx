import { useRef, useState } from 'react'
import { Eye, Volume2, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CameraViewfinder from '../components/CameraViewfinder'
import LoadingState from '../components/LoadingState'
import BottomNav from '../components/BottomNav'
import ErrorBanner from '../components/ErrorBanner'
import { useApp } from '../context/AppContext'
import { detectScene } from '../utils/api'

const mockScenes = [
  { description: 'In front of you, I can see a sofa on the left, a coffee table in the center, and a television in front of you.',
    objects: [ { name: 'Sofa', confidence: 98, distance: '1.2m', position: 'Left' }, { name: 'Coffee Table', confidence: 95, distance: '0.8m', position: 'Center' }, { name: 'Television', confidence: 97, distance: '2.5m', position: 'Center' } ] },
  { description: 'In front of you, I can see a chair on the left and a dining table in front of you.',
    objects: [ { name: 'Chair', confidence: 92, distance: '2.2m', position: 'Left' }, { name: 'Dining Table', confidence: 94, distance: '2.0m', position: 'Center' } ] },
]

const confidenceColor = (c) => c >= 90 ? 'text-green-400 bg-green-500/10' : c >= 75 ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'

export default function ObjectDetectionScreen() {
  const { speak, addHistory, t } = useApp()
  const cameraRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scene, setScene] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  const handleDetect = async () => {
    setIsScanning(true); setLoading(true); setScene(null); setNotice('')
    try {
      const blob = await cameraRef.current?.capture()
      const data = await detectScene(blob)
      if (!data.objects.length) setNotice(t('obj.none'))
      setScene(data); speak(data.description)
      if (data.objects.length) addHistory({ type: 'Object', icon: 'eye', title: 'Scene Detection', preview: data.objects.map(o => o.name).join(', ').slice(0, 60), color: 'purple' })
    } catch (e) {
      const detected = mockScenes[Math.floor(Math.random() * mockScenes.length)]
      setScene(detected); setNotice(t('common.sample')); speak(detected.description)
      addHistory({ type: 'Object', icon: 'eye', title: 'Scene Detection', preview: detected.description.slice(0, 60) + '...', color: 'purple' })
    } finally { setLoading(false); setIsScanning(false) }
  }

  return (
    <div className="screen-container">
      <PageHeader title={t('obj.title')} subtitle={t('obj.subtitle')} speakText={`${t('obj.title')}. ${t('obj.subtitle')}`} />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 space-y-4">
        <CameraViewfinder ref={cameraRef} isScanning={isScanning} label={t('obj.cameraLabel')} />
        <div className="flex gap-3">
          <button onClick={handleDetect} disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-3 disabled:opacity-50" aria-label={t('obj.detect')}>
            <Eye className="w-5 h-5" /><span>{loading ? t('obj.detecting') : t('obj.detect')}</span>
          </button>
          {scene && (<button onClick={() => { setScene(null); setIsScanning(false); setNotice('') }} className="w-14 h-14 btn-secondary flex items-center justify-center" aria-label={t('common.retry')}><RefreshCw className="w-5 h-5" /></button>)}
        </div>
        <ErrorBanner message={notice} variant="info" />
        {loading && <LoadingState message={t('obj.loading')} />}
        {scene && !loading && (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white text-sm">{t('obj.scene')}</h3>
                <button onClick={() => speak(scene.description)} className="w-8 h-8 bg-primary-500/20 rounded-xl flex items-center justify-center" aria-label={t('common.listen')}><Volume2 className="w-4 h-4 text-primary-400" /></button>
              </div>
              <p className="text-surface-300 text-sm leading-relaxed">{scene.description}</p>
            </div>
            {scene.objects.length > 0 && (
              <div className="bg-surface-900 border border-surface-800 rounded-3xl p-5">
                <h3 className="font-semibold text-white text-sm mb-4">{t('obj.detected')} ({scene.objects.length})</h3>
                <div className="space-y-3">
                  {scene.objects.map((obj, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center"><Eye className="w-4 h-4 text-purple-400" /></div>
                        <div><p className="text-white text-sm font-medium">{obj.name}</p><p className="text-surface-500 text-xs">{obj.distance} · {obj.position}</p></div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${confidenceColor(obj.confidence)}`}>{obj.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => speak(scene.description)} className="w-full btn-accent flex items-center justify-center gap-3" aria-label={t('obj.hear')}><Volume2 className="w-5 h-5" /><span>{t('obj.hear')}</span></button>
          </div>
        )}
      </div>
      <BottomNav active="" />
    </div>
  )
}
