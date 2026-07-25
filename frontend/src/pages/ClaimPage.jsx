import { useMemo, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPhotos } from '../utils/photoStore'
import PhotoGrid from '../components/PhotoGrid'
import { compositeStrip, downloadDataUrl } from '../utils/compositeStrip'

export default function ClaimPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const photos = useMemo(() => getPhotos(sessionId), [sessionId])
  const [downloading, setDownloading] = useState(false)

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

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <svg className="w-7 h-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-white/60 mb-2">
          Photos not found
        </h1>
        <p className="font-body text-white/30 text-sm text-center max-w-xs">
          This session may have expired. Please scan the QR code again from the photobooth.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0a0e2a] to-[#0b141e]">
      <h1 className="font-display text-3xl font-black italic bg-clip-text text-transparent
                    bg-gradient-to-b from-[#fffde8] via-[#fbb515] to-[#ff8400]
                    mb-1 tracking-[-0.03em]">
        Your Photos
      </h1>
      <div className="flex items-center gap-3 mb-8">
        <span className="block w-6 h-px bg-gradient-to-r from-transparent to-[#fafe00]/20" />
        <span className="font-ui text-[#b9d2df] text-[10px] tracking-widest uppercase">
          Session: {sessionId}
        </span>
        <span className="block w-6 h-px bg-gradient-to-l from-transparent to-[#fafe00]/20" />
      </div>

      <div className="mb-8">
        <PhotoGrid photos={photos} layout="vertical" />
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-8 py-3 rounded-xl bg-gradient-to-b from-[#ff8400] to-[#fbb515]
                   text-white text-sm font-semibold font-ui
                   hover:from-[#fbb515] hover:to-[#ff8400] transition-all duration-300
                   shadow-lg shadow-[#ff6f08]/30 tracking-wide mb-4
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloading ? 'Preparing...' : 'Download Strip'}
      </button>

      <button
        onClick={() => navigate('/')}
        className="font-ui text-white/20 text-xs hover:text-white/50 transition-colors duration-300"
      >
        Take new photos
      </button>
    </div>
  )
}
