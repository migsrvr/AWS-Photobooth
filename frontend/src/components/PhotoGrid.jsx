export default function PhotoGrid({ photos, layout = 'vertical' }) {
  return (
    <div
      className={
        layout === 'vertical'
          ? 'film-strip grid grid-rows-4 gap-1.5 w-[200px] h-[580px] rounded-2xl p-2.5'
          : 'grid grid-cols-2 gap-1.5 w-[380px]'
      }
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={
            layout === 'vertical'
              ? 'w-full h-full rounded-lg overflow-hidden bg-black/40 border border-white/10'
              : 'w-full bg-black/40 rounded-lg overflow-hidden aspect-[3/4] border border-white/10'
          }
        >
          {photos?.[i] ? (
            <img
              src={photos[i]}
              alt={`Shot ${i + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center
                          bg-gradient-to-br from-[#01164a] to-[#00075d]">
              <span className="font-display text-2xl font-bold bg-clip-text text-transparent
                            bg-gradient-to-b from-[#fafe00] to-[#ffb700]">
                {i + 1}
              </span>
              <span className="font-ui text-white/20 text-[9px] mt-1 tracking-[0.15em] uppercase">
                Frame
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}