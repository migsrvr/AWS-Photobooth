import { useNavigate } from 'react-router-dom'
import startBg from '../assets/start-bg.webp'
import awsLogo from '../assets/aws-logo.webp'
import WebcamPanel from '../components/WebcamPanel'

export default function InitialCapturePage() {
  const navigate = useNavigate()

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f0dfce]">
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

      <main className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <h1 className="font-primary font-extrabold text-[#1e1e1e] text-[40px] tracking-[1.2px] text-center">
          FRONT - PAGE READY!
        </h1>
        <p className="font-primary font-medium italic text-[#1e1e1e] text-[22px] text-center mt-1">
          Strike a pose—you’re about to make the headlines.
        </p>

        <div className="relative w-full max-w-[1046px] aspect-[1046/567] mt-6">
          <WebcamPanel className="absolute inset-0" />
          <button
            onClick={() => navigate('/capture')}
            className="absolute bottom-[23px] right-[41px] w-[249px] h-[59px] rounded-[10px]
                       border-2 border-[#4a3017] bg-[rgba(237,244,255,0.5)]
                       font-primary font-semibold text-xl text-[#4a3017]
                       transition-transform duration-300 hover:scale-105"
          >
            Start Capturing
          </button>
        </div>
      </main>
    </div>
  )
}
