import { QRCodeSVG } from 'qrcode.react'

/**
 * QR result step after the survey upload. Matches the old Scan frame
 * (1:264) adapted to the newspaper theme: title, QR in a white rect,
 * session code, Download + Close. Background page stays blurred behind.
 */
export default function QrResultModal({ isOpen, downloadUrl, sessionId, onClose }) {
  if (!isOpen || !downloadUrl) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div
        data-testid="qr-modal"
        className="relative w-full max-w-[640px] max-h-[94vh] overflow-hidden rounded-[10px] bg-[#7e6851] p-8"
      >
        <div className="rounded-[7px] bg-[#e6d3bf] px-8 py-6 flex flex-col items-center text-center">
          <h3 className="font-display text-[#1e1e1e] text-[50px] leading-none tracking-[1.5px]">
            SCAN TO DOWNLOAD
          </h3>
          <p className="font-primary italic text-[#1e1e1e] text-[22px] mt-2 max-w-[494px]">
            Scan the QR code with your phone to download your photos.
          </p>

          <div className="bg-white p-4 rounded-[7px] mt-5">
            <QRCodeSVG data-testid="qr-code" value={downloadUrl} size={288} />
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
