import { useEffect, useImperativeHandle, forwardRef, useRef, useState } from 'react'
import { Camera, Zap, CameraOff, Upload, X } from 'lucide-react'
import useCamera from '../hooks/useCamera'
import { useApp } from '../context/AppContext'

// Live camera preview + capture, with an image-upload fallback.
// Exposes capture() via ref: returns the uploaded image if one is selected,
// otherwise grabs the current camera frame.
const CameraViewfinder = forwardRef(function CameraViewfinder(
  { isScanning, label = 'Point camera at target', autoStart = true },
  ref
) {
  const { t } = useApp()
  const { videoRef, active, error, start, stop, capture } = useCamera()
  const fileRef = useRef(null)
  const [uploaded, setUploaded] = useState(null) // { blob, url }

  useEffect(() => {
    if (autoStart) start()
    return () => stop()
  }, [autoStart, start, stop])

  useImperativeHandle(ref, () => ({
    capture: async () => (uploaded ? uploaded.blob : await capture()),
    active,
    restart: start,
  }), [capture, active, start, uploaded])

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploaded({ blob: file, url: URL.createObjectURL(file) })
  }

  const clearUpload = () => {
    if (uploaded?.url) URL.revokeObjectURL(uploaded.url)
    setUploaded(null)
  }

  return (
    <div className="camera-viewfinder" role="img" aria-label="Camera preview area">
      {/* Uploaded image takes precedence */}
      {uploaded ? (
        <>
          <img src={uploaded.url} alt="Selected for scanning" className="absolute inset-0 w-full h-full object-cover" />
          <button onClick={clearUpload} className="absolute top-3 right-3 z-10 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center" aria-label="Remove uploaded image">
            <X className="w-5 h-5 text-white" />
          </button>
        </>
      ) : (
        <>
          <video ref={videoRef} playsInline muted className={`absolute inset-0 w-full h-full object-cover ${active ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
          {!active && (
            <div className="absolute inset-0 bg-gradient-to-b from-surface-800 via-surface-900 to-surface-800">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            </div>
          )}
          {!isScanning && !active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              {error ? <CameraOff className="w-12 h-12 text-surface-600" strokeWidth={1.5} /> : <Camera className="w-12 h-12 text-surface-600" strokeWidth={1.5} />}
              <p className="text-surface-500 text-sm">{error || label}</p>
              {error && (<button onClick={start} className="mt-1 text-primary-400 text-sm font-semibold underline">{t('common.enableCamera')}</button>)}
            </div>
          )}
          {!isScanning && active && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2"><span className="text-white/70 text-xs bg-black/40 px-3 py-1 rounded-full">{label}</span></div>
          )}
        </>
      )}

      {isScanning && <div className="scan-line" />}

      <div className="corner-bracket tl" aria-hidden="true" />
      <div className="corner-bracket tr" aria-hidden="true" />
      <div className="corner-bracket bl" aria-hidden="true" />
      <div className="corner-bracket br" aria-hidden="true" />

      {isScanning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full px-4 py-1.5">
            <Zap className="w-3 h-3 text-primary-400 animate-pulse" />
            <span className="text-primary-300 text-xs font-semibold">{t('ocr.scanning')}</span>
          </div>
        </div>
      )}

      {/* Upload fallback button */}
      {!isScanning && !uploaded && (
        <>
          <button onClick={() => fileRef.current?.click()} className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-semibold" aria-label={t('common.upload')}>
            <Upload className="w-3.5 h-3.5" />{t('common.upload')}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </>
      )}
    </div>
  )
})

export default CameraViewfinder
