import React from 'react'
import { useNavigate,Link } from 'react-router-dom'
import useFetch from '../Hooks/UseFetch'
import star from '../assets/star.png'
import Footer from './detail_footer';

export default function MovieList({ api_path }) {
  const { data, loading, error } = useFetch(api_path)
  const movies = data?.results ?? []
  const navigate = useNavigate()

  const titleMap = {
    now_playing: 'Now Playing',
    popular: 'Popular',
    top_rated: 'Top Rated',
    upcoming: 'Upcoming'
  }

  const title = titleMap[api_path] ?? api_path

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading Cinema...</p>
      </div>
    )
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">{error}</div>
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        
       {/* Apple-Style Minimalist Header */}
<header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
  <div>
    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tighter">
      {title}<span className="text-indigo-600 animate-pulse">.</span>
    </h1>
    <p className="text-gray-500 mt-3 text-lg font-medium opacity-80">
      Experience the best in entertainment.
    </p>
  </div>

  <nav className="flex items-center">
    <Link 
      to="/watchlist" 
      className="group relative flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 shadow-sm rounded-2xl transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 active:scale-95"
    >
      {/* Background "Liquid" Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
      
      <span className="relative z-10 font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
        My Watchlist
      </span>

      {/* Modern Badge Indicator */}
      <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 group-hover:bg-indigo-600 transition-colors duration-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    </Link>
  </nav>
</header>

        {/* Fluid Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {movies.map((a) => {
            const poster = a.poster_path
              ? `https://image.tmdb.org/t/p/w500${a.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Image'

            const overview =
              (a.overview || '').length > 100
                ? a.overview.slice(0, 100) + '...'
                : a.overview

            return (
              <div 
                key={a.id} 
                className="group relative bg-white rounded-[2rem] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-3 cursor-pointer border border-gray-100"
                onClick={() => navigate(`/movie/${a.id}`)}
              >
                {/* Poster Container with "Zoom" Effect */}
                <div className="overflow-hidden h-[400px]">
                  <img 
                    src={poster} 
                    alt={a.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    loading="lazy" 
                  />
                  
                  {/* Rating Badge (Glassmorphism) */}
                  <div className="absolute top-4 right-4 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                    <img src={star} alt="Star" className="w-3.5 h-3.5" />
                    <span className="text-white text-xs font-bold">
                      {a.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 bg-white">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {a.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 h-10 overflow-hidden">
                    {overview}
                  </p>

                  {/* Minimalist Action Button */}
                  <div className="flex items-center justify-between group/btn">
                    <span className="text-sm font-semibold text-indigo-600 group-hover/btn:translate-x-1 transition-transform">
                      View Details →
                    </span>
                  </div>
                </div>

                {/* Subtle Glow Overlay on Hover */}
                <div className="absolute inset-0 pointer-events-none rounded-[2rem] transition-opacity duration-500 opacity-0 group-hover:opacity-100 ring-1 ring-inset ring-black/5" />
              </div>
            )
          })}
        </div>
      </div>
      <Footer />
    </div>
  )
}
