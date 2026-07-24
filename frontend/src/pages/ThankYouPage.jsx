import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AutoResetTimer from '../components/AutoResetTimer'

export default function ThankYouPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleReset = () => {
    navigate('/')
  }

  return (
    <div
      onClick={handleReset}
      className="w-full h-full flex flex-col items-center justify-center cursor-pointer
                 bg-gradient-to-b from-[#01164a] to-[#00075d] animate-fade-slide"
    >
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6
                     animate-[border_glow_3s_ease-in-out_infinite]">
        <svg
          className="w-10 h-10 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-light bg-clip-text text-transparent
                    bg-gradient-to-b from-[#fffde8] to-[#fbb515]
                    mb-4 tracking-wider">
        Thank You!
      </h1>

      <p className="text-[#b9d2df] text-lg mb-8 text-center max-w-md">
        Your photos are being processed.
        {' They will be printed and a digital copy is on its way.'}
      </p>

      <AutoResetTimer seconds={countdown} onReset={handleReset} />

      <p className="text-white/20 text-xs mt-8">Tap anywhere to return</p>
    </div>
  )
}
