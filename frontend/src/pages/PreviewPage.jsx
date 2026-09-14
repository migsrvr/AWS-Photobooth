import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SurveyModal from '../components/SurveyModal'
import QrResultModal from '../components/QrResultModal'
import startBg from '../assets/start-bg.webp'
import awsLogo from '../assets/aws-logo.webp'
import mascotPreview from '../assets/mascot-preview.webp'
import photoFrame from '../assets/photo-frame.webp'
import iconImageBlack from '../assets/icon-image-black.svg'

const glassButton =
  'w-[371px] max-w-full h-[59px] rounded-[5px] border-2 border-[#4a3017] ' +
  'bg-[rgba(237,244,255,0.5)] font-primary font-semibold text-[25px] text-[#4a3017] ' +
  'transition-transform duration-300 hover:scale-105'

export default function PreviewPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [surveyOpen, setSurveyOpen] = useState(false)
  const [qr, setQr] = useState(null)
  const photo = state?.photo ?? null
  const videoBlob = state?.videoBlob ?? null

  const handleSurveyDone = ({ downloadUrl, sessionId, shareUrl }) => {
    setSurveyOpen(false)
    setQr({ downloadUrl, sessionId, shareUrl })
  }

  const handleQrClose = () => {
    setQr(null)
    navigate('/thank-you')
  }

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

      <img
        src={mascotPreview}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute right-16 -bottom-10 z-10 w-[320px] object-contain pointer-events-none -scale-x-100"
      />

      <main className="relative z-10 h-full flex items-center justify-center gap-12 px-16">
        <div className="h-[min(725px,82vh)] aspect-[585/725] shrink-0 rounded-[7px]
                        border-[3px] border-[#4a3017] bg-[rgba(189,148,108,0.6)] p-3">
          <div className="relative w-full h-full rounded-[4px] overflow-hidden bg-[#d9d9d9]">
            {photo ? (
              <img
                src={photo}
                alt="Your front page"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                <img
                  src={photoFrame}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute flex flex-col items-center justify-center gap-2"
                  style={{ left: '22.8%', top: '22%', right: '5.3%', bottom: '32.4%' }}
                >
                  <img src={iconImageBlack} alt="" aria-hidden="true" className="w-10 h-10" />
                  <p className="text-[#1e1e1e]/60 text-sm font-medium">No photo yet</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col w-[600px] shrink-0">
          <header className="flex items-center gap-4 mb-6 pointer-events-none">
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

          <h1 className="font-display text-[#1e1e1e] text-[50px] leading-none tracking-[1.5px] text-center whitespace-nowrap">
            THE STORY’S NOT OVER YET!
          </h1>
          <p className="font-primary font-medium italic text-[#1e1e1e] text-xl text-center mt-3 whitespace-nowrap">
            Happy with the shot, or want to make another headline?
          </p>

          <p className="font-primary font-semibold italic text-[#1e1e1e] text-lg mt-8">
            Not your best angle?
          </p>
          <button onClick={() => navigate('/capture')} className={`${glassButton} mt-2`}>
            Retake
          </button>

          <p className="font-primary font-semibold italic text-[#1e1e1e] text-lg mt-6">
            Ready to keep these memories? Scan here.
          </p>
          <button onClick={() => setSurveyOpen(true)} className={`${glassButton} mt-2`}>
            QR Code
          </button>

          <div className="mt-8">
            <p className="font-display text-[#1e1e1e] text-lg">FOLLOW US:</p>
            <div className="font-primary text-[#1e1e1e] text-lg mt-1 space-y-0.5">
              <p>fb: @AWSSBG.JRU</p>
              <p>ig: @aws.sbg_jru</p>
              <p>tiktok: @aws.sbg_jru</p>
              <p>linkedin: AWS Student Builder Group - JRU</p>
            </div>
          </div>
        </div>
      </main>

      <SurveyModal
        isOpen={surveyOpen}
        photo={photo}
        videoBlob={videoBlob}
        onClose={() => setSurveyOpen(false)}
        onDone={handleSurveyDone}
      />
      <QrResultModal
        isOpen={qr !== null}
        shareUrl={qr?.shareUrl}
        sessionId={qr?.sessionId}
        onClose={handleQrClose}
      />
    </div>
  )
}
