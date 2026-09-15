import { QRCodeSVG } from 'qrcode.react'

/**
 * QR result step after the survey upload. Matches the old Scan frame
 * (1:264) adapted to the newspaper theme: title, one QR per media
 * (photo + video when a clip was recorded), session code, Close.
 * Background page stays blurred behind.
 *
 * The photo QR points at the share page filtered to the photo, which
 * serves the exact composed front page from the preview (template + B&W
 * baked in at upload), so preview settings carry into the download.
 */
export default function QrResultModal({ isOpen, shareUrl, sessionId, hasVideo, onClose }) {
  if (!isOpen || !shareUrl) return null

  const photoUrl = `${shareUrl}?media=photo`
  const videoUrl = `${shareUrl}?media=video`

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div
        data-testid="qr-modal"
        className="relative w-full max-w-[720px] max-h-[94vh] overflow-y-auto rounded-[10px] bg-[#7e6851] p-8"
      >
        <div className="rounded-[7px] bg-[#e6d3bf] px-8 py-6 flex flex-col items-center text-center">
          <h3 className="font-display text-[#1e1e1e] text-[50px] leading-none tracking-[1.5px]">
            SCAN TO DOWNLOAD
          </h3>
          <p className="font-primary italic text-[#1e1e1e] text-[22px] mt-2 max-w-[494px]">
            Scan a QR code with your phone to download.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-5">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-[7px]">
                <QRCodeSVG data-testid="qr-code-photo" value={photoUrl} size={220} />
              </div>
              <p className="font-primary font-semibold text-[#1e1e1e] text-[20px] mt-2 tracking-[1px]">
                PHOTO
              </p>
            </div>

            {hasVideo ? (
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-[7px]">
                  <QRCodeSVG data-testid="qr-code-video" value={videoUrl} size={220} />
                </div>
                <p className="font-primary font-semibold text-[#1e1e1e] text-[20px] mt-2 tracking-[1px]">
                  VIDEO
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white/60 p-4 rounded-[7px] w-[252px] h-[252px] flex items-center justify-center">
                  <p className="font-primary italic text-[#1e1e1e]/60 text-[18px] px-4">
                    No video was recorded this session.
                  </p>
                </div>
                <p className="font-primary font-semibold text-[#1e1e1e]/50 text-[20px] mt-2 tracking-[1px]">
                  VIDEO
                </p>
              </div>
            )}
          </div>

          <p className="font-primary font-medium text-[#1e1e1e] text-[25px] mt-4">
            CODE: {sessionId?.slice(0, 6).toUpperCase()}
          </p>

          <div className="flex gap-4 mt-5">
            <button
              onClick={onClose}
              className="w-[200px] h-[56px] rounded-[5px] border-2 border-[#4a3017]
                         bg-[rgba(237,244,255,0.5)] font-primary font-semibold text-xl text-[#4a3017]
                         transition-transform duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
