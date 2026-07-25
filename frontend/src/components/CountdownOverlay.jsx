import { useEffect, useState } from 'react'

export default function CountdownOverlay({ seconds, onFlashDone }) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (seconds === 0) {
      setFlash(true)
      const timer = setTimeout(() => {
        setFlash(false)
        onFlashDone?.()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [seconds, onFlashDone])

  return (
    <>
      {seconds > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20
                        rounded-xl">
          <div className="absolute w-64 h-64 rounded-full animate-aperture-pulse"
               style={{
                 background: 'radial-gradient(circle at center, rgba(250,254,0,0.2) 0%, rgba(255,183,0,0.1) 40%, transparent 70%)'
               }} />
          <span className="relative font-display text-9xl font-black text-transparent bg-clip-text
                         bg-gradient-to-b from-[#fafe00] to-[#ffb700]
                         drop-shadow-[0_0_60px_rgba(255,183,0,0.6)]
                         animate-bounce-in">
            {seconds}
          </span>
        </div>
      )}
      {flash && (
        <div className="absolute inset-0 z-30 rounded-xl
                       animate-[flash_radial_0.4s_ease-out_forwards]" />
      )}
    </>
  )
}