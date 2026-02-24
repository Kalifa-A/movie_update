import React from "react"
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* Liquid Background Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-blob"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 text-center">
        {/* Large Cinematic Number */}
        <h1 className="text-[12rem] md:text-[18rem] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-400 opacity-10">
          404
        </h1>

        {/* Floating Glass Card */}
        <div className="mt-[-8rem] md:mt-[-12rem] backdrop-blur-xl bg-white/40 p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] max-w-lg mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Lost in the <span className="text-indigo-600">void.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            The page you're looking for has drifted away or never existed in this cinema.
          </p>

          <Link
            to="/"
            className="inline-block bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            Return to Home
          </Link>
        </div>

        {/* Subtle Help Links */}
        <div className="mt-12 flex justify-center gap-6 text-sm font-medium text-gray-400 uppercase tracking-widest">
          <Link to="/popular" className="hover:text-gray-900 transition-colors">Popular</Link>
          <span>•</span>
          <Link to="/upcoming" className="hover:text-gray-900 transition-colors">Upcoming</Link>
        </div>
      </div>
    </div>
  )
}