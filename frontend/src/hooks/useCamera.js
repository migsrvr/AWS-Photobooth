import { useState, useEffect, useCallback } from 'react'

export default function useCamera() {
  const [videoEl, setVideoEl] = useState(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } })
      .then((s) => {
        if (!mounted) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        setStream(s)
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!videoEl || !stream) return
    videoEl.srcObject = stream
    const onReady = () => setIsReady(true)
    videoEl.addEventListener('loadeddata', onReady)
    videoEl.play()
    return () => videoEl.removeEventListener('loadeddata', onReady)
  }, [stream, videoEl])

  const capture = useCallback(() => {
    if (!videoEl || !isReady) return null
    const canvas = document.createElement('canvas')
    canvas.width = videoEl.videoWidth
    canvas.height = videoEl.videoHeight
    canvas.getContext('2d').drawImage(videoEl, 0, 0)
    return canvas.toDataURL('image/jpeg')
  }, [videoEl, isReady])

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  return { setVideoEl, isReady, error, capture }
}