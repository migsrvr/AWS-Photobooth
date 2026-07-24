import { useState, useEffect, useCallback } from 'react'

export default function useCountdown(initialSeconds, onComplete) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  const start = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(true)
  }, [initialSeconds])

  const stop = useCallback(() => {
    setIsRunning(false)
    setSeconds(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (!isRunning) return
    if (seconds <= 0) {
      setIsRunning(false)
      onComplete?.()
      return
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning, seconds, onComplete])

  return { seconds, isRunning, start, stop }
}
