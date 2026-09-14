import { useNavigate } from 'react-router-dom'
import startBg from '../assets/start-bg.webp'
import awsLogo from '../assets/aws-logo.webp'
import mascotStart from '../assets/mascot-start.webp'

export default function IdlePage() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('/ready')}
      className="relative w-full h-full cursor-pointer overflow-hidden bg-[#f0dfce]"
    >
      <img
        src={startBg}
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none"
      />

      <header className="absolute top-8 left-8 z-10 flex items-center gap-4 pointer-events-none">
        <img
          src={awsLogo}
          alt="AWS Student Builder Group - JRU logo"
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

      <img
        src={mascotStart}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute bottom-0 left-3 z-10 w-[335px] max-w-[30vw] object-contain pointer-events-none"
      />

      <main className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="font-primary font-extrabold text-[#1e1e1e] text-4xl tracking-[1.08px]">
          THE AWS - SBG JRU TIMES
        </p>
        <p className="font-primary text-[#1e1e1e] text-2xl mt-1">
          SPECIAL EDITION • 2026
        </p>

        <h1 className="font-display text-[#1e1e1e] text-[clamp(40px,5.2vw,75px)] leading-tight mt-6">
          JUST IN FROM THE CLOUD!
        </h1>

        <p className="font-primary font-medium italic text-[#1e1e1e] text-[28px] leading-[35px] mt-4 max-w-3xl">
          A new memory is about to make the front page.
          <br />
          Built by the community, captured by you.
          <br />
          Capture your moment with AWS - SBG JRU.
        </p>

        <button
          onClick={() => navigate('/ready')}
          className="mt-10 w-[249px] h-[59px] rounded-[10px] border-2 border-[#4a3017]
                     bg-[rgba(237,244,255,0.5)] font-primary font-semibold text-xl text-[#4a3017]
                     transition-transform duration-300 hover:scale-105"
        >
          Tap to start
        </button>
      </main>

      <footer className="absolute bottom-6 inset-x-0 z-10 pointer-events-none">
        <p className="font-primary font-semibold italic text-[#1e1e1e] text-lg text-center">
          fb: @AWSSBG.JRU&nbsp;&nbsp;&nbsp;ig &amp; tiktok: @aws.sbg_jru&nbsp;&nbsp;&nbsp;linkedin:
          AWS Student Builder Group - JRU
        </p>
      </footer>
    </div>
  )
}
