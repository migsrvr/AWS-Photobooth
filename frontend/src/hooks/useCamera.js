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
    const w = videoEl.videoWidth
    const h = videoEl.videoHeight
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(videoEl, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg')
  }, [videoEl, isReady])

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [stream])

  return { setVideoEl, isReady, error, capture }
}