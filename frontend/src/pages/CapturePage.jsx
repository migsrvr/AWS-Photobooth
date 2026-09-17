import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import WebcamPanel from '../components/WebcamPanel'
import CountdownOverlay from '../components/CountdownOverlay'
import capturePhoto from '../utils/capturePhoto'
import composeNewspaper from '../utils/composeNewspaper'
import { startMirroredRecording } from '../utils/recordVideo'
import useWebcam from '../hooks/useWebcam'
import startBg from '../assets/start-bg.webp'
import awsLogo from '../assets/aws-logo.webp'

export default function CapturePage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)
  const [phase, setPhase] = useState('countdown')
  const [encoderReady, setEncoderReady] = useState(false)
  const videoRef = useRef(null)
  const recorderRef = useRef(null)
  const { stream, status } = useWebcam()
  const cameraReady = status === 'live' || status === 'error'

  useEffect(() => {
    if (phase !== 'countdown' || !cameraReady) return undefined
    // Record the user's countdown behavior; clip ends at the flash.
    // Re-created if the stream identity changes (StrictMode remounts can
    // leave the first recorder attached to stopped tracks).
    if (!recorderRef.current || recorderRef.current.stream !== stream) {
      recorderRef.current?.stop()
      setEncoderReady(false)
      setCountdown(5)
      const rec = { stream, ready: false }
      recorderRef.current = {
        ...rec,
        ...startMirroredRecording(stream, {
          onstarted: () => {
            rec.ready = true
            setEncoderReady(true)
          },
        }),
      }
    }
    // Hold the countdown until the encoder is actually recording: the
    // settle window would otherwise eat the head of the 5s clip. The
    // ready flag lives on the ref so StrictMode remounts (which reuse a
    // settled recorder but reset state) don't stall in dev.
    if (!recorderRef.current.ready) return undefined
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
  }, [phase, cameraReady, stream, encoderReady])

  const handleFlashDone = useCallback(async () => {
    const raw = capturePhoto(videoRef.current)
    // Keep raw (mirrored) so /preview can re-compose with chosen template/bw.
    // Also compose default orgfest for immediate preview (back-compat).
    const photo = await composeNewspaper(raw, { template: 'orgfest', bw: false }).catch(() => raw)
    const recorder = recorderRef.current
    recorderRef.current = null
    const videoBlob = recorder ? await recorder.stop() : null
    navigate('/video', { state: { photo, rawPhoto: raw, videoBlob } })
  }, [navigate])

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f0dfce]">
      <img
        src={startBg}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none"
      />

      <header className="absolute top-8 left-8 z-10 flex items-center gap-4 pointer-events-none">
        <img
          src={awsLogo}
          alt="AWS Student Builder Group - JRU logo"
          loading="lazy"
          decoding="async"
          className="w-16 h-16 object-contain"
        />
        <div className="text-center">
          <p className="font-display text-[#1e1e1e] text-[22px] leading-tight tracking-[1.1px]">
            AWS STUDENT BUILDER GROUP - JRU
          </p>
          <p className="font-display text-[#1e1e1e] text-xl leading-tight tracking-[1px]">
            PHOTOBOOTH
          </p>
        </div>
      </header>

      <main className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <h1 className="font-primary font-extrabold text-[#1e1e1e] text-[40px] tracking-[1.2px] text-center">
          {phase === 'flash' ? 'SMILE!' : 'PREPARING THE FRONT PAGE...'}
        </h1>
        {phase !== 'flash' && (
          <p className="font-primary font-medium italic text-[#1e1e1e] text-[22px] text-center mt-1">
            Get ready... Taking photos in...
          </p>
        )}

        <div className="relative w-full max-w-[1046px] aspect-[1046/567] mt-6">
          <WebcamPanel videoRef={videoRef} stream={stream} status={status} className="absolute inset-0" />
          {cameraReady && encoderReady && (phase === 'countdown' || phase === 'flash') && (
            <CountdownOverlay seconds={countdown} onFlashDone={handleFlashDone} />
          )}
          {!cameraReady && (
            <p className="absolute inset-x-0 bottom-4 z-10 text-center text-[#1e1e1e]/70 text-sm font-medium pointer-events-none">
              Waking up the camera…
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
