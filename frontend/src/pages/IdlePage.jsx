import { useNavigate } from 'react-router-dom'

export default function IdlePage() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('/capture')}
      className="w-full h-full flex flex-col items-center justify-center cursor-pointer
                 transition-all duration-300 hover:bg-[#0d0d1a]"
    >
      <div className="mb-8 text-[#fafe00] drop-shadow-[0_0_30px_rgba(255,226,41,0.4)]">
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-[float_up_4s_ease-in-out_infinite]"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>

      <h1 className="text-5xl font-light text-transparent bg-clip-text
                    bg-gradient-to-b from-[#fffde8] to-[#fbb515]
                    mb-4 tracking-wider drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
        PHOTOBOOTH
      </h1>

      <p className="text-[#b9d2df] text-lg mb-10">Tap anywhere to start</p>

      <div className="flex gap-2">
        {[0, 0, 0, 0].map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-gradient-to-b from-[#fafe00] to-[#ffb700] opacity-60
                       animate-[dot_pulse_1.5s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  )
}
