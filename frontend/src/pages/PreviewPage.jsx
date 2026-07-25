import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import PhotoGrid from '../components/PhotoGrid'
import QrModal from '../components/QrModal'
import { generateId, setPhotos } from '../utils/photoStore'

export default function PreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const photos = location.state?.photos || null

  const [stripStyle, setStripStyle] = useState('vertical')
  const [qrOpen, setQrOpen] = useState(false)
  const [activeBtn, setActiveBtn] = useState('strip')
  const sessionIdRef = useRef(null)

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = generateId()
      if (photos) {
        setPhotos(sessionIdRef.current, photos)
      }
    }
  }, [photos])

  const handleStrip = () => { setStripStyle('vertical'); setActiveBtn('strip') }
  const handleGrid = () => { setStripStyle('grid'); setActiveBtn('grid') }
  const handleRetake = () => navigate('/capture')
  const handleQR = () => setQrOpen(true)

  const buttons = [
    { id: 'strip', label: 'Strip', icon: '|||', onClick: handleStrip, span: 'col-span-2' },
    { id: 'grid', label: 'Grid', icon: '#', onClick: handleGrid, span: 'col-span-2' },
    { id: 'retake', label: 'Retake', icon: '\u21bb', onClick: handleRetake, span: 'col-span-3' },
    { id: 'qr', label: 'QR Code', icon: '[]', onClick: handleQR, span: 'col-span-3' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="w-full h-full flex flex-col overflow-hidden relative"
    >
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at 70% 40%, rgba(0,102,255,0.06) 0%, transparent 50%)'
           }} />

      <div className="flex items-center justify-between px-6 pt-5 pb-3 relative z-10">
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg font-black italic bg-clip-text text-transparent
                        bg-gradient-to-b from-[#fffde8] via-[#fbb515] to-[#ff8400]
                        tracking-[-0.03em]">
            PHOTOBOOTH
          </h2>
          <span className="block w-6 h-px bg-gradient-to-l from-[#fafe00]/20 to-transparent" />
        </div>
        <div className="flex-1" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center gap-6 px-6 pb-6">
        <div className="flex-shrink-0">
          <PhotoGrid photos={photos} layout={stripStyle} />
        </div>

        <div className="w-full max-w-[320px]">
          <div className="grid grid-cols-4 gap-3">
            {buttons.map(btn => (
              <motion.button
                key={btn.id}
                whileTap={{ scale: 0.95 }}
                onClick={btn.onClick}
                className={`${btn.span} rounded-2xl border transition-all duration-200
                  flex flex-col items-center justify-center gap-2 py-5 px-4
                  cursor-pointer select-none
                  ${activeBtn === btn.id
                    ? 'bg-gradient-to-b from-[#fbb515]/20 to-[#ff8400]/10 border-[#fbb515]/40 text-[#fbb515]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white/80'
                  }`}
              >
                <span className="text-2xl leading-none">{btn.icon}</span>
                <span className="font-ui text-xs font-semibold tracking-wide uppercase">{btn.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <QrModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        sessionId={sessionIdRef.current}
        photos={photos}
      />
    </motion.div>
  )
}
