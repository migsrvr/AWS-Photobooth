import { useMemo, useState, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { compositeStrip, downloadDataUrl } from '../utils/compositeStrip'

export default function QrModal({ isOpen, onClose, sessionId, photos }) {
  const [downloading, setDownloading] = useState(false)
  const qrUrl = useMemo(() => {
    const origin = window.location.origin
    return `${origin}/claim/${sessionId}`
  }, [sessionId])

  const handleDownload = useCallback(async () => {
    if (!photos || photos.length === 0 || downloading) return
    setDownloading(true)
    try {
      const strip = await compositeStrip(photos, 'vertical')
      if (strip) downloadDataUrl(strip, `photobooth-strip-${sessionId}.jpg`)
    } finally {
      setDownloading(false)
    }
  }, [photos, sessionId, downloading])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
         onClick={onClose}>
      <div className="glass-panel p-8 w-full max-w-sm mx-4 flex flex-col items-center"
           onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold text-white mb-1.5">
          Scan to Download
        </h3>
        <p className="font-body text-white/40 text-xs mb-6 text-center">
          Scan the QR code with your phone to get your photos
        </p>

        <div className="bg-white p-4 rounded-xl mb-4">
          <QRCodeCanvas
            value={qrUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>

        <p className="font-ui text-[#b9d2df] text-[10px] tracking-widest uppercase mb-6">
          Code: <span className="text-[#fafe00] font-mono">{sessionId}</span>
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#ff8400] to-[#fbb515]
                       text-white text-xs font-semibold font-ui
                       hover:from-[#fbb515] hover:to-[#ff8400] transition-all duration-300
                       shadow-lg shadow-[#ff6f08]/25 tracking-wide
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'Preparing...' : 'Download Strip'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 font-ui text-white/30 text-xs hover:text-white/60 transition-colors duration-300"
        >
          Close
        </button>
      </div>
    </div>
  )
}
