import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col items-center justify-center p-6 relative"
    >
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at 50% 30%, rgba(255,183,0,0.06) 0%, transparent 50%)'
           }} />
      <div className="relative w-full max-w-lg aspect-[4/3] mb-6
                     conic-border transition-all duration-500">
        <CameraFeed setVideoEl={setVideoEl} isReady={isReady} shotIndex={shotIndex} />

        {(phase === 'countdown' || phase === 'flash') && (
          <CountdownOverlay
            seconds={countdown}
            onFlashDone={handleFlashDone}
          />
        )}
      </div>

      {error && (
        <p className="font-ui text-[#f93c40] text-xs mt-3">Camera error: {error}</p>
      )}

      <div className="flex flex-col items-center gap-4">
        <ShotTracker currentShot={shotIndex} totalShots={4} />

        <p className="font-ui text-[#b9d2df] text-xs font-semibold tracking-widest uppercase">
          {!isReady
            ? 'Requesting camera...'
            : phase === 'countdown'
            ? 'Get ready...'
            : phase === 'flash'
            ? 'Cheese!'
            : `Frame ${shotIndex + 1} of 4`}
        </p>
      </div>
    </motion.div>
  )
}
