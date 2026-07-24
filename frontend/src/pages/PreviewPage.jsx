import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoGrid from '../components/PhotoGrid'
import EmailModal from '../components/EmailModal'

export default function PreviewPage() {
  const navigate = useNavigate()
  const [emailOpen, setEmailOpen] = useState(false)
  const [stripStyle, setStripStyle] = useState('vertical')

  const handleRetake = () => {
    navigate('/capture')
  }

  const handlePrint = () => {
    navigate('/thank-you')
  }

  const handleEmail = () => {
    setEmailOpen(true)
  }

  const handleSendEmail = (email) => {
    console.log('Send to:', email)
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#01164a] to-[#00075d] overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[#b9d2df] text-xs font-medium">Format:</span>
          <button
            onClick={() => setStripStyle('vertical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5
                       ${stripStyle === 'vertical'
                         ? 'bg-gradient-to-b from-[#ff8400] to-[#fbb515] text-white shadow-md shadow-[#ff6f08]/30'
                         : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'}`}
          >
            <span className="inline-block w-1.5 h-4 rounded-sm bg-white/30 border border-white/40" />
            Vertical
          </button>
          <button
            onClick={() => setStripStyle('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-1.5
                       ${stripStyle === 'grid'
                         ? 'bg-gradient-to-b from-[#ff8400] to-[#fbb515] text-white shadow-md shadow-[#ff6f08]/30'
                         : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'}`}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-sm bg-white/30 border border-white/40" />
            Grid
          </button>
        </div>

        <h2 className="text-2xl font-light bg-clip-text text-transparent
                      bg-gradient-to-b from-[#fffde8] to-[#fbb515]
                      tracking-wider">
          AWS PhotoBooth
        </h2>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center gap-8 px-6">
        <div className={`flex-shrink-0 self-start ${stripStyle === 'vertical' ? '-mt-8' : 'mt-0'}`}>
          <PhotoGrid photos={null} layout={stripStyle} />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRetake}
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/20
                       text-white text-lg font-medium
                       hover:bg-white/10 hover:border-white/40 transition-all duration-300
                       hover:-translate-y-1 w-full"
          >
            Retake
          </button>

          <button
            onClick={handlePrint}
            className="px-8 py-4 rounded-xl font-medium text-white text-lg
                       bg-gradient-to-b from-[#ff8400] to-[#fbb515]
                       hover:from-[#fbb515] hover:to-[#ff8400]
                       shadow-lg shadow-[#ff6f08]/40
                       hover:shadow-[#ff6f08]/60 transition-all duration-300
                       hover:-translate-y-1 hover-scale w-full"
          >
            Print
          </button>

          <button
            onClick={handleEmail}
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/20
                       text-white text-lg font-medium
                       hover:bg-white/10 hover:border-white/40 transition-all duration-300
                       hover:-translate-y-1 w-full"
          >
            Get Digital Copy
          </button>
        </div>
      </div>

      <EmailModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        onSend={handleSendEmail}
      />
    </div>
  )
}
