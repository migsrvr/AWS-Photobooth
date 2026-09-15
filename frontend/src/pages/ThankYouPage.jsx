import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import startBg from '../assets/start-bg.webp'
import awsLogo from '../assets/aws-logo.webp'
import mascotStart from '../assets/mascot-start.webp'

export default function ThankYouPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown <= 0) navigate('/')
  }, [countdown, navigate])

  const handleReset = () => {
    navigate('/')
  }

  return (
    <div
      onClick={handleReset}
      className="relative w-full h-full cursor-pointer overflow-hidden bg-[#f0dfce] animate-fade-slide"
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
        <p className="font-primary font-extrabold text-[#1e1e1e] text-[36px] tracking-[1.08px]">
          THE AWS - SBG JRU TIMES
        </p>
        <p className="font-primary text-[#1e1e1e] text-[24px] mt-1">
          SPECIAL EDITION • 2026
        </p>

        <h1 className="font-display text-[#1e1e1e] text-[128px] leading-none tracking-[1.5px] mt-6 max-w-[808px]">
          Thank you so much!
        </h1>

        <p className="font-primary font-medium italic text-[#1e1e1e] text-[18px] mt-6">
          Click any button to start go back to home
        </p>
        <p className="font-primary text-[#1e1e1e]/60 text-sm mt-2">
          Returning to home in <span className="font-semibold text-[#1e1e1e]">{countdown}s</span>
        </p>
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
