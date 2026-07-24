import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraFeed from '../components/CameraFeed'
import CountdownOverlay from '../components/CountdownOverlay'
import ShotTracker from '../components/ShotTracker'

export default function CapturePage() {
  const navigate = useNavigate()
  const [shotIndex, setShotIndex] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const [phase, setPhase] = useState('idle')
  const capturedRef = useRef([])

  const advance = useCallback(() => {
    const next = shotIndex + 1
    if (next >= 4) {
      navigate('/preview')
      return
    }
    setShotIndex(next)
    setCountdown(5)
    setPhase('countdown')
  }, [shotIndex, navigate])

  const handleFlashDone = useCallback(() => {
    capturedRef.current = [...capturedRef.current, `shot_${shotIndex + 1}`]

    if (shotIndex + 1 >= 4) {
      navigate('/preview')
    } else {
      setShotIndex((prev) => prev + 1)
      setCountdown(5)
      setPhase('countdown')
    }
  }, [shotIndex, navigate])

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
    startCountdown()
  }, [startCountdown])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8
                   bg-gradient-to-b from-[#00075d] to-[#01164a]">
      <div className="relative w-full max-w-lg aspect-[4/3] mb-8
                     conic-border hover-glow transition-all duration-500">
        <CameraFeed shotIndex={shotIndex} />

        {(phase === 'countdown' || phase === 'flash') && (
          <CountdownOverlay
            seconds={countdown}
            onFlashDone={handleFlashDone}
          />
        )}
      </div>

      <ShotTracker currentShot={shotIndex} totalShots={4} />

      <p className="text-[#b9d2df] text-sm mt-4">
        {phase === 'countdown'
          ? 'Get ready...'
          : phase === 'flash'
          ? 'Cheese!'
          : `Shot ${shotIndex + 1} of 4`}
      </p>
    </div>
  )
}
