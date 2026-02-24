// Create a separate component or put it above your App component
export const LegalPage = ({ title, content }) => {
  return (
    <div className="min-h-screen bg-[#fbfbfd] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb / Back button */}
        <button 
          onClick={() => window.history.back()}
          className="text-sm font-bold text-indigo-600 mb-6 flex items-center gap-2 hover:opacity-70 transition"
        >
          ← BACK
        </button>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-10">
          {title}<span className="text-indigo-600">.</span>
        </h1>

        <div className="backdrop-blur-xl bg-white/60 p-8 md:p-16 rounded-[3rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed text-lg space-y-8">
            {content}
          </div>
        </div>
      </div>
    </div>
  )
}
export default LegalPage