import { useEffect, useState } from 'react'

/**
 * Requests the kiosk camera and exposes its MediaStream.
 * Status: 'idle' | 'requesting' | 'live' | 'error'
 * Tracks are stopped automatically on unmount.
 */
export default function useWebcam(enabled = true) {
  const [stream, setStream] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    let activeStream = null

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setError(new Error('Camera API unavailable (needs localhost or HTTPS)'))
      return undefined
    }

    setStatus('requesting')
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        activeStream = s
        setStream(s)
        setStatus('live')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setStatus('error')
      })

    return () => {
      cancelled = true
      activeStream?.getTracks().forEach((t) => t.stop())
    }
  }, [enabled])

  return { stream, status, error }
}
