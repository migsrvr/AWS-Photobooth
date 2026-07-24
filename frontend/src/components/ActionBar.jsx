export default function ActionBar({ onRetake, onPrint, onEmail }) {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <button
        onClick={onRetake}
        className="px-8 py-4 rounded-xl bg-white/5 border border-white/20
                   text-white text-lg font-medium
                   hover:bg-white/10 hover:border-white/40 transition-all duration-300
                   hover:-translate-y-1"
      >
        Retake
      </button>

      <button
        onClick={onPrint}
        className="px-8 py-4 rounded-xl font-medium text-white text-lg
                   bg-gradient-to-b from-[#ff8400] to-[#fbb515]
                   hover:from-[#fbb515] hover:to-[#ff8400]
                   shadow-lg shadow-[#ff6f08]/40
                   hover:shadow-[#ff6f08]/60 transition-all duration-300
                   hover:-translate-y-1 hover-scale"
      >
        Print
      </button>

      <button
        onClick={onEmail}
        className="px-8 py-4 rounded-xl bg-white/5 border border-white/20
                   text-white text-lg font-medium
                   hover:bg-white/10 hover:border-white/40 transition-all duration-300
                   hover:-translate-y-1"
      >
        Get Digital Copy
      </button>
    </div>
  )
}
