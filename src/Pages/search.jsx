import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import star from '../assets/star.png'

export default function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const location = useLocation()
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_API_ID

  // Effect to handle URL-based searches (e.g. from the Header)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("q")
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [location.search])

  const performSearch = async (searchTerm) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`
      )
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${query}`)
    performSearch(query)
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-gray-900 pb-20">
      {/* Search Hero Section */}
      <div className="bg-white/70 backdrop-blur-2xl border-b border-gray-100 py-16 mb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-8">
            Explore <span className="text-indigo-600">Cinema.</span>
          </h1>

          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              placeholder="Titles, people, genres..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-8 py-6 text-xl rounded-[2rem] bg-gray-100/50 border-2 border-transparent focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all duration-500 placeholder:text-gray-400 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-10">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((movie) => {
              const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Image"

              return (
                <div 
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden mb-4 shadow-sm group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    <img
                      src={poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                       <span className="text-white font-semibold text-sm">View Details →</span>
                    </div>
                  </div>
                  <h2 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {movie.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <img src={star} alt="star" className="w-3 h-3" />
                    <p className="text-sm text-gray-500 font-medium">{movie.vote_average.toFixed(1)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {!loading && results.length === 0 && query && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No movies found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  )
}