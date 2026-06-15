import { useRef, useState, useCallback, useEffect } from 'react'

// Manages a getUserMedia stream and reliable frame capture for a <video> element.
// Gracefully degrades when no camera/permission is available.
export default function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported on this device')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 }, height: { ideal: 1440 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setActive(true)
      return true
    } catch (e) {
      setError(e.name === 'NotAllowedError' ? 'Camera permission denied' : 'Could not access camera')
      setActive(false)
      return false
    }
  }, [])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setActive(false)
  }, [])

  // Wait until the video element actually has pixels to read.
  const waitForFrame = (video, timeout = 2000) =>
    new Promise((resolve) => {
      if (video.videoWidth > 0 && video.readyState >= 2) return resolve(true)
      const started = Date.now()
      const tick = () => {
        if (video.videoWidth > 0 && video.readyState >= 2) return resolve(true)
        if (Date.now() - started > timeout) return resolve(false)
        requestAnimationFrame(tick)
      }
      tick()
    })

  // Capture the current video frame as a high-quality JPEG Blob.
  const capture = useCallback(async () => {
    const video = videoRef.current
    if (!video) return null
    const ready = await waitForFrame(video)
    if (!ready || !video.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95))
  }, [])

  useEffect(() => () => stop(), [stop])

  return { videoRef, active, error, start, stop, capture }
}
