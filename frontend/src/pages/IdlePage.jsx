import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import TextType from '../components/text/TextType'

export default function IdlePage() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      onClick={() => navigate('/capture')}
      className="w-full h-full flex flex-col items-center justify-center cursor-pointer
                 transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at 50% 25%, rgba(255,183,0,0.12) 0%, transparent 50%)'
           }} />
      <div className="iris-container flex flex-col items-center relative z-10">
        <div className="mb-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#fafe00]/5 blur-3xl scale-150 animate-aperture-pulse" />
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative animate-float drop-shadow-[0_0_40px_rgba(255,226,41,0.3)]"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
              <circle cx="12" cy="13" r="1.5" strokeWidth="1" />
              <line x1="7" y1="8" x2="9" y2="10" strokeWidth="0.75" opacity="0.4" />
              <line x1="17" y1="8" x2="15" y2="10" strokeWidth="0.75" opacity="0.4" />
            </svg>
          </div>
        </div>

        <div className="mb-3 text-center">
          <span className="font-ui text-[#b9d2df] text-sm font-semibold tracking-[0.15em] uppercase block mb-1">
            Welcome to AWS Student Builder Group - JRU Booth
          </span>
        </div>

        <div className="h-16 flex items-center justify-center mb-1">
          <TextType
            text="Photobooth"
            typingSpeed={80}
            pauseDuration={2000}
            deletingSpeed={40}
            loop={true}
            showCursor={true}
            cursorCharacter="|"
            cursorBlinkDuration={0.5}
            className="font-display text-5xl font-black italic bg-clip-text text-transparent bg-gradient-to-b from-[#fffde8] via-[#fbb515] to-[#ff8400] tracking-[-0.03em] leading-none"
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="block w-8 h-px bg-gradient-to-r from-transparent to-[#fafe00]/30" />
          <span className="font-ui text-[#b9d2df] text-xs font-semibold tracking-[0.2em] uppercase">
            Tap anywhere to start
          </span>
          <span className="block w-8 h-px bg-gradient-to-l from-transparent to-[#fafe00]/30" />
        </div>

        <div className="flex gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-b from-[#fafe00] to-[#ffb700]
                         animate-pulse-dot"
              style={{
                animationDelay: `${i * 0.3}s`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}