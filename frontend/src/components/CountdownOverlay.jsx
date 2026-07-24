import { useEffect, useState } from 'react'

export default function CountdownOverlay({ seconds, onFlashDone }) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (seconds === 0) {
      setFlash(true)
      const timer = setTimeout(() => {
        setFlash(false)
        onFlashDone?.()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [seconds, onFlashDone])

  return (
    <>
      {seconds > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20
                        bg-black/50 rounded-xl">
          <span className="text-9xl font-bold text-transparent bg-clip-text
                        bg-gradient-to-b from-[#fafe00] to-[#ffb700]
                        drop-shadow-[0_0_40px_rgba(233,69,96,0.8)]
                        animate-[bounce_in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
            {seconds}
          </span>
        </div>
      )}
      {flash && (
        <div className="absolute inset-0 z-30 bg-white rounded-xl
                       animate-[flash_0.3s_ease-out]" />
      )}
    </>
  )
}
