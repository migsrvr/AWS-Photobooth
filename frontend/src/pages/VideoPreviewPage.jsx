import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import startBg from '../assets/start-bg.webp'
import awsLogo from '../assets/aws-logo.webp'
import iconVideo from '../assets/icon-video.svg'

export default function VideoPreviewPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { photo, videoBlob } = state ?? {}
  const [videoUrl, setVideoUrl] = useState(null)

  // Object URL is owned by this page: created on mount, revoked on unmount.
  // (Revoking inside the same effect is StrictMode-safe: the remount
  // creates a fresh URL after the simulated-unmount cleanup runs.)
  useEffect(() => {
    if (!videoBlob) return undefined
    const url = URL.createObjectURL(videoBlob)
    setVideoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [videoBlob])

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
        <h1 className="font-display text-[#1e1e1e] text-[50px] tracking-[1.5px] text-center">
          EXCLUSIVE FOOTAGE!
        </h1>
        <p className="font-primary font-medium italic text-[#1e1e1e] text-[22px] text-center mt-1">
          A behind-the-scenes look at your memories.
        </p>

        <div className="relative w-full max-w-[1046px] aspect-[1046/567] mt-6">
          <div
            data-testid="clip-panel"
            className="absolute inset-0 overflow-hidden rounded-[10px] bg-[#d9d9d9]"
          >
            {videoUrl ? (
              <video
                data-testid="clip-video"
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <img src={iconVideo} alt="" aria-hidden="true" className="w-[98px] h-[89px]" />
                <p
                  data-testid="clip-fallback"
                  className="text-[#1e1e1e] text-sm font-medium px-6 text-center"
                >
                  No footage this time — your photo is still safe.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/preview', { state: { photo, videoBlob } })}
            className="absolute bottom-[23px] right-[41px] w-[249px] h-[59px] rounded-[10px]
                       border-2 border-[#4a3017] bg-[rgba(237,244,255,0.5)]
                       font-primary font-semibold text-xl text-[#4a3017]
                       transition-transform duration-300 hover:scale-105"
          >
            Proceed
          </button>
        </div>
      </main>
    </div>
  )
}
