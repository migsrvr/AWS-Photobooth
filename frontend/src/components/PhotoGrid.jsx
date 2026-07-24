export default function PhotoGrid({ photos, layout = 'vertical' }) {
  return (
    <div
      className={
        layout === 'vertical'
          ? 'grid grid-rows-4 gap-2 w-[220px] h-[600px] bg-white/5 rounded-2xl p-3 glass-panel'
          : 'grid grid-cols-2 gap-1 w-[420px]'
      }
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={
            layout === 'vertical'
              ? 'w-full h-full rounded-lg overflow-hidden border-2 border-white/30 bg-white shadow-md'
              : 'w-full bg-white shadow-md aspect-[3/4] border border-white/15'
          }
        >
          {photos?.[i] ? (
            <img
              src={photos[i]}
              alt={`Shot ${i + 1}`}
              className="w-full h-full object-cover"
            />
          ) : layout === 'vertical' ? (
            <div className="w-full h-full flex flex-col items-center justify-center
                          bg-gradient-to-br from-[#01164a] to-[#00075d]">
              <span className="text-3xl font-bold bg-clip-text text-transparent
                            bg-gradient-to-b from-[#fafe00] to-[#ffb700]">
                {i + 1}
              </span>
              <span className="text-white/30 text-[10px] mt-1 tracking-widest uppercase">AWAITING</span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center
                          bg-gradient-to-br from-[#1c3466] to-[#182b58]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
                className="mb-1"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-white/40 text-lg font-bold">{i + 1}</span>
              <span className="text-white/20 text-[10px] mt-0.5">AWAITING</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
