import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useCamera from '../hooks/useCamera'
import CameraFeed from '../components/CameraFeed'
import CountdownOverlay from '../components/CountdownOverlay'
import ShotTracker from '../components/ShotTracker'

export default function CapturePage() {
  const navigate = useNavigate()
  const { setVideoEl, isReady, error, capture } = useCamera()
  const [shotIndex, setShotIndex] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const [phase, setPhase] = useState('idle')
  const capturedRef = useRef([])

  const handleFlashDone = useCallback(() => {
    const photo = capture()
    if (photo) {
      capturedRef.current = [...capturedRef.current, photo]
    }

    if (shotIndex + 1 >= 4) {
      navigate('/preview', { state: { photos: capturedRef.current } })
    } else {
      setShotIndex((prev) => prev + 1)
      setCountdown(5)
      setPhase('countdown')
    }
  }, [shotIndex, navigate, capture])

  useEffect(() => {
    if (phase !== 'countdown') return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhase('flash')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  const startCountdown = useCallback(() => {
    setCountdown(5)
    setPhase('countdown')
  }, [])

  useEffect(() => {
    if (isReady) startCountdown()
  }, [isReady, startCountdown])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8
                   bg-gradient-to-b from-[#00075d] to-[#01164a]">
      <div className="relative w-full max-w-lg aspect-[4/3] mb-8
                     conic-border hover-glow transition-all duration-500">
        <CameraFeed setVideoEl={setVideoEl} isReady={isReady} shotIndex={shotIndex} />

        {(phase === 'countdown' || phase === 'flash') && (
          <CountdownOverlay
            seconds={countdown}
            onFlashDone={handleFlashDone}
          />
        )}
      </div>

      {error && (
        <p className="text-[#f93c40] text-sm mt-4">Camera error: {error}</p>
      )}

      <ShotTracker currentShot={shotIndex} totalShots={4} />

      <p className="text-[#b9d2df] text-sm mt-4">
        {!isReady
          ? 'Requesting camera...'
          : phase === 'countdown'
          ? 'Get ready...'
          : phase === 'flash'
          ? 'Cheese!'
          : `Shot ${shotIndex + 1} of 4`}
      </p>
    </div>
  )
}
