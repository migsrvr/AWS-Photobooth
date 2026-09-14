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
        <div className="absolute inset-0 flex items-center justify-center z-20 rounded-xl">
          <span
            key={seconds}
            className="font-primary font-extrabold text-[#1e1e1e] text-[96px] tracking-[2.88px]
                       animate-[bounce_in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]"
          >
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
