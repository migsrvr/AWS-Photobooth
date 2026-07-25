import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

export default function ThankYouPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (countdown / 10) * circumference

  const confettiDots = Array.from({ length: 20 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 4}s`,
    color: i % 3 === 0 ? '#fafe00' : i % 3 === 1 ? '#ffb700' : '#ff8400',
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="w-full h-full flex flex-col items-center justify-center animate-fade-slide relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at 50% 20%, rgba(255,183,0,0.1) 0%, transparent 45%)'
           }} />

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {confettiDots.map((dot, i) => (
          <div
            key={i}
            className="confetti-dot"
            style={{
              left: dot.left,
              top: '-10px',
              backgroundColor: dot.color,
              animation: `confetti_drop ${dot.animationDuration} ease-in ${dot.animationDelay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Photo strip visual */}
      <div className="flex gap-1.5 mb-8" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-14 h-16 rounded-md bg-gradient-to-br from-[#1c3466] to-[#182b58]
                       border border-white/10"
            style={{
              animation: `cascade_in 0.5s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.12}s forwards`,
              opacity: 0,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-lg font-bold bg-clip-text text-transparent
                            bg-gradient-to-b from-[#fafe00] to-[#ffb700]">
                {i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>

      <h1 className="font-display text-5xl font-black italic bg-clip-text text-transparent
                    bg-gradient-to-b from-[#fffde8] via-[#fbb515] to-[#ff8400]
                    mb-1 tracking-[-0.03em] leading-none">
        Thank You
      </h1>

      <div className="flex items-center gap-3 mb-8">
        <span className="block w-6 h-px bg-gradient-to-r from-transparent to-[#fafe00]/20" />
        <span className="font-body text-[#b9d2df] text-xs font-light tracking-[0.15em] uppercase">
          Your strip is printing
        </span>
        <span className="block w-6 h-px bg-gradient-to-l from-transparent to-[#fafe00]/20" />
      </div>

      <p className="font-body text-[#b9d2df]/60 text-xs font-light mb-10 text-center max-w-xs leading-relaxed">
        Scan the QR code on the preview screen to download your photos.
      </p>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="100" height="100" viewBox="0 0 100 100" className="timer-ring">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fafe00" />
              <stop offset="100%" stopColor="#ffb700" />
            </linearGradient>
          </defs>
          <circle className="timer-ring-bg" cx="50" cy="50" r={radius} />
          <circle
            className="timer-ring-progress"
            cx="50"
            cy="50"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-lg font-bold bg-clip-text text-transparent
                         bg-gradient-to-b from-[#fafe00] to-[#ffb700]">
            {countdown}s
          </span>
        </div>
      </div>

      <p className="font-ui text-white/20 text-[10px] mt-6 tracking-widest uppercase">
        Returning to home
      </p>
    </motion.div>
  )
}
